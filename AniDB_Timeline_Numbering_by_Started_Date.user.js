// ==UserScript==
// @name        AniDB Timeline Numbering by Started Date
// @namespace   SoulweaverScript
// @description Prepends timeline items of all series with numbers based on the starting order
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=timeline(&|$)/
// @version     6
// @grant       none
// @updateURL   https://gist.github.com/soulweaver91/59b6b73f7c0829168b1c/raw/AniDB_Timeline_Numbering_by_Started_Date.user.js
// ==/UserScript==

(($) => {
  if (!$) {
    console.error("Failed to load timeline items numbering script!");
    console.log($);
    return;
  }
    
  let completedSeries = $('.g_timeline li .mylist');
  if (completedSeries.length === 0) {
    // nothing to do
    return;
  }

  let pairs = completedSeries.map((i, el) => {
    return {
      element: el,
      x: el.parentNode.offsetLeft
    };
  }).get();

  pairs.sort((p1, p2) => { return p1.x - p2.x; });
  pairs.forEach((item, i) => {
    let link = $(item.element);
    link.prepend(`<span class="sw_timeline_count_started">#${i + 1} </span>`);
    link.attr('title', `#${i + 1} ${link.attr('title')}`);
  });
})(window.$ || window.jQuery);