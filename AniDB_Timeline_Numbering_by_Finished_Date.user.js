// ==UserScript==
// @name        AniDB Timeline Numbering by Finished Date
// @namespace   SoulweaverScript
// @description Prepends timeline items of finished series with numbers based on the finishing order
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=timeline(&|$)/
// @include     /^https?://anidb\.net/user(/\d+)?/timeline/
// @version     2019.07.17
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Timeline_Numbering_by_Finished_Date.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Timeline_Numbering_by_Finished_Date.user.js
// @run-at      document-idle
//
// Copyright (c) 2015–2019 Soulweaver <soulweaver@hotmail.fi>
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

  let completedSeries = $('.g_timeline li .mylist.liststate_completed');
  if (completedSeries.length === 0) {
    // nothing to do
    return;
  }

  localStorage.setItem('swTimelineScriptMigration_finishedScript', 'true');

  let pairs = completedSeries.map((i, el) => {
    return {
      element: el,
      x: el.parentNode.offsetLeft + el.clientWidth
    };
  }).get();

  pairs.sort((p1, p2) => { return p1.x - p2.x; });
  pairs.forEach((item, i) => {
    let link = $(item.element);
    let startDateElem = link.find('.sw_timeline_count_started');
    let elemToAdd = `<span class="sw_timeline_count_finished">#${i + 1} </span>`;
    if (startDateElem.length > 0) {
      startDateElem.after(elemToAdd);
      let startNum = startDateElem.text().trim();
      link.find('.sw_timeline_count_started').append('<small>S</small> / ');
      link.find('.sw_timeline_count_finished').append('<small>F</small> ');
      link.attr('title', `${startNum} (S) / #${i + 1} (F) ${link.attr('title').substr(startNum.length + 1)}`);
    } else {
      link.prepend(elemToAdd);
      link.attr('title', `#${i + 1} ${link.attr('title')}`);
    }
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
