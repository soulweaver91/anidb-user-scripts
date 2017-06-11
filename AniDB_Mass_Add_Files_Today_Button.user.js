// ==UserScript==
// @name        AniDB Mass Add Files Today Button
// @namespace   SoulweaverScript
// @description Adds shortcut buttons to fill in the current date in the file mass add form
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addfilem(&|$)/
// @version     2017.06.12
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Mass_Add_Files_Today_Button.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Mass_Add_Files_Today_Button.user.js
//
// Copyright (c) 2017 Soulweaver <soulweaver@hotmail.fi>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// ==/UserScript==

(($) => {
  if (!$) {
    console.error("Failed to load the today button script!");
    console.log($);
    return;
  }
  
  // No package manager required
  let padLeft = (str, len, fill) => {
    str = str.toString();
    return (len < str.length) ? str : (fill.repeat(len - str.length) + str);
  };
  
  // Add the needed stylesheet using jQuery.
  // There is a GreaseMonkey native function for this (GM_addStyle) but if @grant is anything but none,
  // the jQuery obtained from unsafeWindow breaks (specifically, cannot handle $(...).each() anymore),
  // and it is nicer to not need to ship our own copy of it.
  $('head link[title="Style"]').after(`<style type="text/css" id="swebb_style">
  /* no icon (calendar would be fitting but linking to arbitrary codepoints is flaky and I have a hunch a stripped down FA is used anyway) */
  button.sw_addfilem_todaybtn:before {
    content: '';
    padding-right: 0;
  }

  button.sw_addfilem_todaybtn {
    margin-left: .5em;
  }
  </style>`);
  
  let singleFileBtnClickHandler = (date) => { 
    return (e) => {
      e.preventDefault();
      e.stopPropagation();

      $(e.target).siblings('input').val(date);
    };
  };
  
  let allFilesBtnClickHandler = (date, container) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();

      container.find('tbody .release.date input, tfoot #releasedate').val(date);
    };
  };
      
  let insertButtons = (container) => {
    if (container.find('.sw_addfilem_todaybtn').length > 0 || container.find('tbody .release.date input').length === 0) {
      return;
    }
    
    container.find('tbody .release.date input, tfoot #releasedate').after('<button class="sw_addfilem_todaybtn">Today</button>');
  };
  
  let bindButtonClicks = (container, date) => {
    container.on('click', 'tbody button.sw_addfilem_todaybtn', singleFileBtnClickHandler(date));
    container.on('click', 'tfoot button.sw_addfilem_todaybtn', allFilesBtnClickHandler(date, container));
  };
  
  let container = $('#addfilem_form');
  if (container.length === 0) {
    console.error('Could not locate the containing form for today button script!');
    return;
  }
  
  let today = new Date();
  let dateStr = [
    today.getFullYear(), 
    padLeft(today.getMonth() + 1, 2, '0'),
    padLeft(today.getDate(), 2, '0')
  ].join('-');
    
  bindButtonClicks(container, dateStr);
  
  let observer = new MutationObserver((mutations, observer) => {
    insertButtons(container);
  });

  observer.observe(container[0], {
    subtree: true,
    childList: true
  });
})(window.$ || window.jQuery);
