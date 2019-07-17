// ==UserScript==
// @name        AniDB Stats Votes as Donut Graph
// @namespace   SoulweaverScript
// @description Replaces the bar representation of anime votes with a donut graph
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=userpage&(.*&|)do=stats(&|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)do=stats&(.*&|)show=userpage(&|$)/
// @include     /^https?://anidb\.net/user(/\d+)?/statistic/
// @version     2019.07.17
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Stats_Votes_as_Donut_Graph.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Stats_Votes_as_Donut_Graph.user.js
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

const script = (AniDB, $) => {
  if (!AniDB || !AniDB.Chart || !AniDB.Chart.drawDonut || !$) {
    throw 'uninit';
  }

  const oldGraphContainer = $('.g_section.charts div').eq(0);
  const newGraphContainerId = 'swAnimeVotesChart';

  // Old color scheme
  /* const voteColours = [
    "FF0000",
    "FF3300",
    "FF5700",
    "FF7800",
    "FF9E00",
    "CBBD00",
    "ABCE00",
    "74CE00",
    "5CDC00",
    "00FF00"
  ]; */

  // New, slightly more eye friendly color scheme (no more neon green!)
  const voteColours = [
    "D71313",
    "E4380D",
    "EF6219",
    "EF8222",
    "E7B013",
    "BBCE09",
    "97CC09",
    "79C912",
    "52C815",
    "15BC15"
  ];

  if (oldGraphContainer.length === 0) {
    console.error("did not find the old graph");
    return;
  }

  // Add the needed stylesheet using jQuery.
  // There is a GreaseMonkey native function for this (GM_addStyle) but if @grant is anything but none,
  // the jQuery obtained from unsafeWindow breaks (specifically, cannot handle $(...).each() anymore),
  // and it is nicer to not need to ship our own copy of it.
  $('head link[title="Style"]').after(
    '<style type="text/css" id="sw_donut_style">' +
    voteColours.reduce((res, color, i) => { return res + `#${newGraphContainerId} .highcharts-color-${i} { fill: #${color}; stroke: #${color}; } `; }, '') + `
    
    /* fix pie section borders and connectors since the above rules are more specific than their rules from the original stylesheet */
    #${newGraphContainerId} .highcharts-pie-series .highcharts-point {
      stroke: #CFD1D4;
    }
    #${newGraphContainerId} .highcharts-data-label-connector {
      fill: none;
    }
    </style>`
  );

  let drawDonutChart = (data) => {
    try {
      AniDB.Chart.drawDonut(`#${newGraphContainerId} .container`, data);
    } catch(e) {
      console.error(e);
    }
  };

  let scrapeVoteData = () => {
    let voteBuckets = new Array(10);
    let voteCountElems = oldGraphContainer.find('.column .header.count');

    // length 11 = the cell that says "Count" + the 10 bars
    if (voteCountElems.length !== 11) {
      console.error("failed to locate vote counts correctly");
      console.log(voteCountElems);
      return null;
    }

    for (let i = 1; i < 11; ++i) {
      voteBuckets[i - 1] = {
        name: Math.max(1, i - 0.50).toFixed(2) + '–' + Math.min(10, i + 0.49).toFixed(2),
        y: parseInt(voteCountElems[i].innerHTML)

        // Setting the colors within the data appears to not work when colors are defined by CSS.
        // Thus, we need to embed our own stylesheet to fix these colors instead.
        // This fact doesn't appear to be stated at http://api.highcharts.com/highcharts/series%3Cpie%3E.data.color - fun times.
        // color: "#" + voteColours[i - 1]
      };
    }

    return voteBuckets;
  };

  let appendGraphContainerToDom = (votes) => {
    oldGraphContainer.after(`
      <div class="g_bubble graph sw_injected_graph" 
           id="${newGraphContainerId}">
        <h4><span>Anime Vote Distribution</span></h4>
        <div class="container"></div>
      </div>
    `)
  };

  let removeOldGraphContainer = () => {
    oldGraphContainer.remove();
  };

  let votes = scrapeVoteData();
  if (!votes) {
    return;
  }

  appendGraphContainerToDom(votes);
  removeOldGraphContainer();
  drawDonutChart(votes);
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

initializer(() => [window.AniDB, window.$ || window.jQuery]);
