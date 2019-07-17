// ==UserScript==
// @name        AniDB Mass Add Files Auxiliary Buttons
// @namespace   SoulweaverScript
// @description Adds shortcut buttons to speed up adding data in the file mass add form
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addfilem(&|$)/
// @include     /^https?://anidb\.net/anime/\d+/release($|/add)/
// @version     2019.07.17
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Mass_Add_Files_Today_Button.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Mass_Add_Files_Today_Button.user.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js
// @run-at      document-idle
//
// Copyright (c) 2017–2019 Soulweaver <soulweaver@hotmail.fi>
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

const script = ($) => {
  if (!$) {
    throw 'uninit';
  }

  const ISO_DATE = 'YYYY-MM-DD';

  let utcDate = moment().utc();
  let dateStr = utcDate.format(ISO_DATE);

  let container = $('#addfilem_form');
  if (container.length === 0) {
    console.error('Could not locate the containing form for today button script!');
    return;
  }

  // Add the needed stylesheet using jQuery.
  // There is a GreaseMonkey native function for this (GM_addStyle) but if @grant is anything but none,
  // the jQuery obtained from unsafeWindow breaks (specifically, cannot handle $(...).each() anymore),
  // and it is nicer to not need to ship our own copy of it.
  $('head link[title="Style"]').after(`<style type="text/css" id="swebb_style">
  button.sw_addfilem_todaybtn:before {
    content: '\\f133';
  }
  button.sw_addfilem_nyaabtn:before {
    content: '\\f363';
  }

  button.sw_addfilem_todaybtn {
    margin-left: .5em;
  }

  #layout-main div.addfilem.form #applytoall {
    display: inline-block;
    margin: 0;
  }

  #sw_addfilem_sharedbuttons {
    margin-top: .5em;
  }
  </style>`);

  let nyaaHandler = (input) => {
    let maybeNyaaDate = input.val();
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(maybeNyaaDate)) {
      return null;
    }

    // Nyaa dates are in local timezone
    let nyaaDate = moment(maybeNyaaDate, 'YYYY-MM-DD HH:mm');
    let convertedDate = nyaaDate.utc().format(ISO_DATE);
    input.val(convertedDate);

    return convertedDate;
  };

  let todayHandler = (input) => {
    input.val(dateStr);
  };

  let specifiedDateHandler = (input, date) => {
    input.val(date);
  };

  let singleFileTodayBtnClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    todayHandler($(e.target).parent().siblings('input'));
  };

  let singleFileNyaaBtnClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    nyaaHandler($(e.target).parent().siblings('input'));
  };

  let allFilesTodayBtnClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    container.find('tbody .release.date input, tfoot #releasedate').each((_, el) => todayHandler($(el)));
  };

  let allFilesNyaaBtnClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (container.find('tfoot #releasedate').val().length > 0) {
      let convertedDate = nyaaHandler(container.find('tfoot #releasedate'));
      if (convertedDate) {
        container.find('tbody .release.date input').each((_, el) => specifiedDateHandler($(el), convertedDate));
      }
    } else {
      container.find('tbody .release.date input').each((_, el) => nyaaHandler($(el)));
    }
  };

  let insertButtons = (container) => {
    if (container.find('.sw_addfilem_todaybtn').length > 0 || container.find('tbody .release.date input').length === 0) {
      return;
    }

    container.find('tbody .release.date input').after(`
      <span class="sw_addfilem_addons sw_addfilem_singlefile">
        <button class="sw_addfilem_todaybtn">Today</button>
        <button class="sw_addfilem_nyaabtn">Convert Nyaa</button>
      </span>
    `);
    container.find('tfoot #releasedate').after(`
      <span class="sw_addfilem_addons sw_addfilem_allfiles">
        <button class="sw_addfilem_todaybtn">Today</button>
        <button class="sw_addfilem_nyaabtn">Convert Nyaa</button>
      </span>
    `);
    const wideCell = container.find('tfoot td:first-child');
    wideCell.append(`
      <span class="sw_addfilem_addons sw_addfilem_text">
        <input style="width: 0; visibility: hidden;" type="text"><!-- hack to realign text while being style agnostic -->
        <span>UTC time at page load: ${utcDate.format('YYYY-MM-DD HH:mm:ss')}</span>
      </span>
    `);
    wideCell.css({
      textAlign: "right",
      verticalAlign: "top"
    });
  };

  let wrapApplyAllButton = (container) => {
    if (container.find('.sw_addfilem_sharedbuttons').length > 0) {
      return;
    }

    $('#layout-main div.addfilem.form #applytoall').wrap('<div class="sw_addfilem_addons sw_addfilem_sharedbuttons"></div>');
  };

  let bindButtonClicks = (container, date) => {
    container.on('click', 'tbody button.sw_addfilem_todaybtn', singleFileTodayBtnClickHandler);
    container.on('click', 'tbody button.sw_addfilem_nyaabtn', singleFileNyaaBtnClickHandler);
    container.on('click', 'tfoot button.sw_addfilem_todaybtn', allFilesTodayBtnClickHandler);
    container.on('click', 'tfoot button.sw_addfilem_nyaabtn', allFilesNyaaBtnClickHandler);
  };

  bindButtonClicks(container, dateStr);

  let observer = new MutationObserver((mutations, observer) => {
    insertButtons(container);
    wrapApplyAllButton(container);
  });

  observer.observe(container[0], {
    subtree: true,
    childList: true
  });
};


// Async scripting environment + page resources compatibility boilerplate
let retries = 0;
const initializer = (pageDepsGetter) => {
  const failPath = () => {
    retries++;
    if (retries < 10) {
      setTimeout(() => initializer(pageDepsGetter), 100);
    } else {
      console.error(`The script ${GM.info.script.name} couldn't load correctly!`);
    }
  };

  const pageDeps = typeof pageDepsGetter === 'function' ? pageDepsGetter() : [];
  if (pageDeps && pageDeps.some((dep) => dep === undefined)) {
    return failPath();
  }

  try {
    script(...pageDeps);
  } catch (e) {
    if (e === 'uninit') {
      return failPath();
    } else {
      console.error(`An error occurred in the script ${GM.info.script.name}!`);
      console.error(e);
    }
  }
};

initializer(() => [window.$ || window.jQuery]);
