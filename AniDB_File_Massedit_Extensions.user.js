// ==UserScript==
// @name        AniDB File Massedit Extensions
// @namespace   SoulweaverScript
// @description Extends the capabilities of the file massedit where allowed by the backend
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=group(&|$)/
// @include     /^https?://anidb.net/group/\d+/anime/\d+/release/
// @include     /^https?://anidb.net/group/release/\d+/
// @version     2019.07.17
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_File_Massedit_Extensions.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_File_Massedit_Extensions.user.js
// @run-at      document-idle
//
// Copyright (c) 2018–2019 Soulweaver <soulweaver@hotmail.fi>
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

  const files = $('table.filelist tbody tr');
  if (files.length === 0 || $('.addfilem').length === 0) {
    return;
  }

  const highestTracks = files.toArray().reduce((res, el) => {
    res.audio = Math.max(res.audio, $(el).find('.icons .i_icon[title^="audio | "]').length);
    res.sub = Math.max(res.sub, $(el).find('.icons .i_icon[title^="subtitle | "], .icons .i_icon[title^="sub | "]').length);

    return res;
  }, {
    audio: 5,
    sub: 5
  });

  const audioDropdown = $('.addfilem select[name="addstrm.aud.no"]');
  const subDropdown = $('.addfilem select[name="addstrm.sub.no"]');
  for (let i = 6; i <= highestTracks.audio; i++) {
    audioDropdown.append(`<option value="${i}">${i}</option>`);
  }
  for (let i = 6; i <= highestTracks.sub; i++) {
    subDropdown.append(`<option value="${i}">${i}</option>`);
  }
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
