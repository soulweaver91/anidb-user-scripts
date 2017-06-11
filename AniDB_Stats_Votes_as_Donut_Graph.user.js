// ==UserScript==
// @name        AniDB Stats Votes as Donut Graph
// @namespace   SoulweaverScript
// @description Replaces the bar representation of anime votes with a donut graph
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=userpage&(.*&|)do=stats(&|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)do=stats&(.*&|)show=userpage(&|$)/
// @version     7
// @grant       none
// @updateURL   https://gist.githubusercontent.com/soulweaver91/2992602a4f7f2b95c9c8dc206d1fe5fa/raw/AniDB_Stats_Votes_as_Donut_Graph.user.js
// ==/UserScript==

((AniDB, $) => {  
  if (!AniDB || !AniDB.Chart || !AniDB.Chart.drawDonut || !$) {
    console.error("Failed to load votes as donut graph script!");
    console.log(AniDB, !!AniDB ? AniDB.Chart : null, (!!AniDB && !!AniDB.Chart) ? AniDB.Chart.drawDonut : null, $);
    return;
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
})(window.AniDB, window.$ || window.jQuery);
