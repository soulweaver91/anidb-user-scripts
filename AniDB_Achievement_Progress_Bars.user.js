// ==UserScript==
// @name        AniDB Achievement Progress Bars
// @namespace   SoulweaverScript
// @description Replaces the basic image based badges on AniDB user pages with progress bars for easier tracking
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=userpage(&|$)/
// @version     2017.06.12
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Achievement_Progress_Bars.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Achievement_Progress_Bars.user.js
//
// Copyright (c) 2012-2017 Soulweaver <soulweaver@hotmail.fi>
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

// TODO: Still needs a lot of cleanup.
// Replace jQ with just $ now that noConflict is not needed anymore and try to simplify the logic.

((jQ) => {
  if (!jQ) {
    console.error("Failed to load achievement progress bars script!");
    console.log(jQ);
    return;
  }

  if (jQ('.achievements').length === 0) {
    // Either not on the main profile page, or something is going south right now
    return;
  }

  // Add the needed stylesheet using jQuery.
  // There is a GreaseMonkey native function for this (GM_addStyle) but if @grant is anything but none,
  // the jQuery obtained from unsafeWindow breaks (specifically, cannot handle jQ(...).each() anymore),
  // and it is nicer to not need to ship our own copy of it.
  jQ('head link[title="Style"]').after(`<style type="text/css" id="swebb_style">
  /* Style definitions for Soulweaver's Experimental Badge Bars */
  .swebb_badge-bar-container {
    display: inline-block;
    width: 300px;
    height: 60px;
    font-size: 15pt;
    margin: 5px 0;
  }
  .swebb_badge-bar {
    font-size: 8pt;
    width: 200px;
    height: 14px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    display: inline-block;
    margin: 0px 0 33px;
    position: relative;
    left: -16px;
    top: -5px;
  }

  .swebb_badge-bar .swebb_bar {
    height: 14px;
    font-size: 0;
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
  }

  div.swebb_badge-small,
  div.swebb_badge-small div.inner {
    display: inline-block;
    z-index: 1;
    position: relative;
    top: -6px;
  }

  div.swebb_badge-small { background-image: none !important; }
  /* the below required to prevent odd layout problems */
  div.swebb_badge-small div.inner span.hide { display: inline !important; visibility: hidden; }

  span.swebb_badge-bar-icon {
    position: absolute;
    width: 17px;
    height: 14px;
    left: 201px;
    top: -1px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    line-height: 14px;
    display: inline-block;
    font-size: 80%;
    text-align: center;
    padding-right: 4px;
  }

  span.swebb_prevlv,
  span.swebb_nextlv,
  span.swebb_current { position: absolute; top: 16px; font-size: 80%; }
  span.swebb_prevlv { left:  5px; }
  span.swebb_nextlv { right: 0px; }
  span.swebb_current {
    right: 35px;
    width: 130px;
    display: inline-block;
    text-align: center;
    line-height: 10px;
    font-size: 65%;
  }

  span.swebb_current .swebb_progress { font-size: 123%; }

  .swebb_badge-bar.swebb_max .swebb_prevlv,
  .swebb_badge-bar.swebb_max .swebb_nextlv { display: none; }

  .one-time + .swebb_badge-bar.swebb_max .swebb_current,
  .special + .swebb_badge-bar.swebb_max .swebb_current,
  .mod + .swebb_badge-bar.swebb_max .swebb_current { display: none; }

  .stats.userroles + .swebb_badge-bar .swebb_current .swebb_progress { display: none; }
  .swebb_badgetopic {
    position: absolute;
    top: -15px;
    left: 5px;
    height: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% + 25px);
  }
  .swebb_badgetopic a {
    text-decoration: none;
    color: inherit;
  }

  h3.swebb_toggler.swebb_condensed:after { content: " [+]"; }
  h3.swebb_toggler:after { content: " [−]"; }
  h3.swebb_toggler { cursor: pointer; }

  .swebb_badges-orig {
    margin-top: 0.5em;
  }

  /* Style specific definitions start here */
  .swebb_badge-bar,
  span.swebb_badge-bar-icon {
    background: #B1B3B5;
    border-top: 1px solid #EEEEEE;
    border-bottom: 1px solid #8E8E8E;
    border-right: 1px solid #8E8E8E;
    border-left: 1px solid #EEEEEE;
  }
  span.swebb_badge-bar-icon {
    color: #AA0000;
  }
  .swebb_badge-bar .swebb_bar,
  .swebb_badge-bar.swebb_max .swebb_badge-bar-icon {
    background-color: #34394D;
    color: #CCCCCC;
  }
  </style>`);

  const romanNumerals = ["-", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const fixedCutoffs = {
    animeCount:         [0,   1,  10,  50,  100,  500, 1000,  2500,  5000,  5000],
    episodeCount:       [0,   1, 100, 500, 1000, 2500, 5000, 10000, 25000, 25000],
    gigabyteCount:      [0,  10,  50, 100,  250,  500, 1000,  2500, 10000, 10000],
    animeAddedCount:    [0,   1,   5,  10,   25,   50,  100,   250,   500,   500],
    creatorsAddedCount: [0,   1,  10,  25,   50,  100,  250,   500,  1000,  1000],
    filesDumpedCount:   [0,   1,  50, 100,  250,  500, 1000,  5000, 10000, 10000],
    grantedCreqsCount:  [0,   1,  10,  50,  100,  250,  500,  1000,  5000,  5000],
    assignedTagsCount:  [0, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 25000],
    voteCount:          [0,   1,  10,  25,   50,  100,  250,   500,  1000,  1000],
    ratedReviewsCount:  [0,   1,   5,  10,   25,   50,   75,   100,   250,   250],
    ratedSimilarCount:  [0,   1,   5,  10,   25,   50,  100,   100],
    wastedDaysCount:    [0,    1.00000,    7.00000,   30.43680,   91.31040,  182.62080,
                             273.93125,  365.24170,  730.48330,  730.48330],
    memberDaysCount:    [0,   30.43680,   91.31050,  182.62110,  365.24220,  730.48440,
                            1460.96880, 2556.69540, 3652.42200, 3652.42200]
  };

  let normTime = (float_num) => {
    var d = Math.floor(float_num);
    var h = Math.round((float_num - d) * 24);
    return d + "d " + h + "h";
  }

  let normAge = (float_num) => {
    var d = Math.floor(float_num);
    var h = Math.round(float_num - d);
    // here's room for improvement, leap day handling is subpar
    var y = Math.floor(d / 365.25);
    d = Math.round(d % 365.25 + h);
    if (d >= 365) { d = 0; y += 1; }
    var years = (y > 0) ? y + "y " : "";
    return years + d + "d ";
  }

  let linkSearch = (str) => {
    return '/perl-bin/animedb.pl?show=animelist&adb.search=' + str + '&do.search=search';
  }

  let linkRel = (id) => {
    return '/perl-bin/animedb.pl?show=rel&aid=' + id;
  }

  let linkTag = (id) => {
    return '/t' + id;
  }

  let linkCreator = (id) => {
    return '/cr' + id;
  }

  let getPlainText = (el) => {
    let wrapped = $('<div>' + el.html() + '</div>');
    wrapped.find('*').remove();
    return wrapped.html().trim();
  }

  let originalHTML = "";
  jQ('.achievements .container .container').each(function() {
    originalHTML += jQ(this).html();
  });

  jQ('.badge').each(function() {
    let badge = jQ(this);

    let str = this.title;
    let name = str.match(/^(.+?)( \[| \(|$)/);
    let level = str.match(/Level (\d+)/);
    let date = str.match(/achieved on: (\d+\.\d+\.\d+)/);
    let steps = [0];
    let link = "";

    if (badge.hasClass('anime') || badge.hasClass('creator')) {
      level = parseInt(level[1]);
      date = date[1];
      var numbers = str.match(/(\d+) of (\d+)/);
      for (let i = 1; i < 9; i++) {
        // Based on empirical results, the badge granting thresholds are actually at 10.5%, 21.5%, ...
        // My guess is that internally the system calculates progress divided by max,
        // then rounds that value to nearest integer, and finally compares to 11%, 12%, ..., 100%.
        steps[i] = Math.ceil((0.11 * i - 0.005) * numbers[2]);
      }
      steps[9] = numbers[2];
      steps[10] = numbers[2];

      // original set, 22.02.2012
      if (badge.is('.classic_anime'))    { link = "https://wiki.anidb.net/w/Achievements#Anime_Achievements"; }
      if (badge.is('.cityhunter'))       { link = linkSearch('city+hunter'); }
      if (badge.is('.conan'))            { link = linkSearch('meitantei+conan'); }
      if (badge.is('.digimon'))          { link = linkSearch('digimon'); }
      if (badge.is('.doraemon'))         { link = linkSearch('doraemon'); }
      if (badge.is('.dragonball'))       { link = linkSearch('dragon+ball'); }
      if (badge.is('.gatchaman'))        { link = linkSearch('gatchaman'); }
      if (badge.is('.gegege'))           { link = linkSearch('gegege+no+kitarou'); }
      if (badge.is('.gundam'))           { link = linkSearch('gundam'); }
      if (badge.is('.hentai'))           { link = linkTag(2615); }
      if (badge.is('.hokutonoken'))      { link = linkRel(386); }
      if (badge.is('.logh'))             { link = linkSearch('logh'); }
      if (badge.is('.lupin'))            { link = linkSearch('lupin+iii'); }
      if (badge.is('.macross'))          { link = linkSearch('macross'); }
      if (badge.is('.onepiece'))         { link = linkSearch('one+piece'); }
      if (badge.is('.pokemon'))          { link = linkRel(230); }
      if (badge.is('.precure'))          { link = linkSearch('precure'); }
      if (badge.is('.sailormoon'))       { link = linkSearch('sailor+moon'); }
      if (badge.is('.saintseiya'))       { link = linkSearch('saint+seiya'); }
      if (badge.is('.sazae'))            { link = "/a1830"; }
      if (badge.is('.slayers'))          { link = linkSearch('slayers'); }
      if (badge.is('.tenchi_muyou'))     { link = linkSearch('tenchi+muyou'); }

      if (badge.is('.adachimitsuru'))    { link = linkCreator(859); }
      if (badge.is('.clamp'))            { link = linkCreator(747); }
      if (badge.is('.ghibli'))           { link = linkCreator(729); }
      if (badge.is('.matsumoto_leiji'))  { link = linkCreator(1107); }
      if (badge.is('.nagai_gou'))        { link = linkCreator(868); }
      if (badge.is('.takahashi_rumiko')) { link = linkCreator(818); }
      if (badge.is('.tezuka_osamu'))     { link = linkCreator(1195); }

      // 14.04.2012
      if (badge.is('.jewelpet'))         { link = linkSearch('jewelpet'); }
      if (badge.is('.studio4c'))         { link = linkCreator(738); }

      // 12.10.2012
      if (badge.is('.beyblade'))         { link = linkSearch('beyblade'); }
      if (badge.is('.princeoftennis'))   { link = linkSearch('tennis+no+ouji-sama'); }
      if (badge.is('.yugioh'))           { link = linkRel(2061); }

      // 23.02.2013
      if (badge.is('.major'))            { link = linkRel(2168); }
      if (badge.is('.evangelion'))       { link = linkSearch('evangelion'); }
      if (badge.is('.votoms'))           { link = linkSearch('votoms'); }
      if (badge.is('.key'))              { link = linkCreator(1046); }
      if (badge.is('.kyotoanimation'))   { link = linkCreator(736); }
      if (badge.is('.typemoon'))         { link = linkCreator(927); }

      // 02.03.2013
      if (badge.is('.gits'))             { link = linkSearch('koukaku+kidoutai'); }
      if (badge.is('.hxh'))              { link = linkSearch('hunter+x+hunter'); }
      if (badge.is('.fukumotonobuyuki')) { link = linkCreator(9107); }
      if (badge.is('.urasawanaoki'))     { link = linkCreator(875); }

      // 15.04.2013
      if (badge.is('.tsubasa'))          { link = linkSearch('captain+tsubasa'); }
      if (badge.is('.gintama'))          { link = linkSearch('gintama'); }
      if (badge.is('.hack'))             { link = linkSearch('.hack'); }
      if (badge.is('.orangeroad'))       { link = linkSearch('orange+road'); }
      if (badge.is('.seikai'))           { link = linkRel(1); }

      // 24.08.2014
      if (badge.is('.initiald'))         { link = linkSearch('initial+d'); }

      // 15.12.2014
      if (badge.is('.aria'))             { link = linkRel(2659); }
      if (badge.is('.fma'))              { link = linkSearch('hagane+no+renkinjutsushi'); }
      if (badge.is('.ippo'))             { link = linkSearch('hajime+no+ippo'); }
      if (badge.is('.kenshin'))          { link = linkSearch('kenshin'); }

      // 22.04.2017
      if (badge.is('.nagao_takena'))     { link = linkCreator(29357); }
    } else {
      steps = [0, 1, 1];
      numbers = ["1 of 1", "1", "1"];
      if (badge.is('.one-time, .special, .mod')) {
        date = "";
        level = 1;
      } else {
        date = date[1];
        level = parseInt(level[1]);

        if (badge.is('.mylist.animecount')) {
          let a = getPlainText(jQ('.stats_mylist .acnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.animeCount;
        }
        if (badge.is('.mylist.episodecount')) {
          let a = getPlainText(jQ('.stats_mylist .ecnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.episodeCount;
        }
        if (badge.is('.mylist.seenepisodes')) {
          let a = getPlainText(jQ('.stats_mylist .watched.count .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.episodeCount;
        }
        if (badge.is('.mylist.filecount')) {
          let a = getPlainText(jQ('.stats_mylist .fcnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.episodeCount;
        }
        if (badge.is('.mylist.mylistsize')) {
          let a = jQ('.stats_mylist .size .value').html().match(/(\d+.\d+) (Bytes|K|M|G|T)B?/);
          let mp = {
            "Bytes": 1 / 1024 / 1048576,
                "K": 1 / 1048576,
                "M": 1 / 1024,
                "G": 1,
                "T": 1024
          };
          let current = a[1] * mp[a[2]];
          numbers = [current + ' of ∞', current, '∞'];
          steps = fixedCutoffs.gigabyteCount;
        }
        if (badge.is('.mylist.timewasted')) {
          let a = getPlainText(jQ('.stats_mylist .timewasted .value')).match(/(\d+) d (\d+) h/);
          let current = (a === undefined) ? 0 : parseInt(a[1]) + a[2] / 24;
          numbers = [current + ' of ∞', current, '∞'];
          steps = fixedCutoffs.wastedDaysCount;
        }
        if (badge.is('.stats.anidbmember')) {
          let a = jQ('.userpage_all .g_section.info .membersince .value').html();
          let day = a.slice(0, 2);
          let month = a.slice(3, 5);
          let year = a.slice(6, 10);
          let join = new Date(year, month - 1, day); // javascript retardedness: month starts from 0, not 1
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          let days = Math.floor(today.getTime() - join.getTime())/(1000 * 60 * 60 * 24);
          numbers = [days + ' of ∞', days, '∞'];
          steps = fixedCutoffs.memberDaysCount;
        }
        if (badge.is('.stats.animeadded')) {
          let a = getPlainText(jQ('.stats_contrib .aacnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.animeAddedCount;
        }
        if (badge.is('.stats.avmf')) {
          let a = getPlainText(jQ('.stats_contrib .facnt .value').slice(1));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.filesDumpedCount;
        }
        if (badge.is('.stats.creatoradded')) {
          let a = getPlainText(jQ('.stats_contrib .pacnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.creatorsAddedCount;
        }
        if (badge.is('.stats.creqcount')) {
          let a = getPlainText(jQ('.stats_creq .creqok .value'));
          let b = getPlainText(jQ('.stats_creq .creqfailed .value'));
          let c = parseInt(a) - parseInt(b);
          numbers = [c + ' of ∞', c, '∞'];
          steps = fixedCutoffs.grantedCreqsCount;
        }
        if (badge.is('.stats.votes')) {
          let a = getPlainText(jQ('.stats_community .votecnt .value'));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.voteCount;
        }
        if (badge.is('.stats.tags')) {
          let a = getPlainText(jQ('.stats_contrib .taacnt .value').slice(1));
          numbers = [a + ' of ∞', a, '∞'];
          steps = fixedCutoffs.assignedTagsCount;
        }
        if (badge.is('.stats.review')) {
          steps = fixedCutoffs.ratedReviewsCount;
          numbers = [steps[parseInt(level)] + ' of ∞', steps[parseInt(level)] + "", '∞'];
        }
        if (badge.is('.stats.similaranime')) {
          steps = fixedCutoffs.ratedSimilarCount;
          numbers = [steps[parseInt(level)] + ' of ∞', steps[parseInt(level)] + "", '∞'];
        }
      }
    }

    let curlv_min = steps[level];
    let curlv_max = steps[level + 1];
    let curlv_p = 0;
    if (curlv_min == curlv_max) {
      curlv_p = 1;
    } else {
      curlv_p = Math.max(0, Math.min(1, (numbers[1] - curlv_min) / (curlv_max - curlv_min)));
    }

    badge.removeClass("level1 level2 level3 level4 level5 level6 level7 level8 level9").addClass("swebb_badge-small");
    badge.wrap('<div class="swebb_badge-bar-container" />');

    let isMax = (parseInt(numbers[1]) >= parseInt(numbers[2])) || (curlv_max == curlv_min);

    if (badge.is('.mylist.timewasted')) {
      numbers[1] = normTime(numbers[1]);
      numbers[0] = numbers[1] + " of " + numbers[2];
      curlv_min = normTime(curlv_min);
      curlv_max = normTime(curlv_max);
    }
    if (badge.is('.stats.anidbmember')) {
      numbers[1] = normAge(numbers[1]);
      numbers[0] = numbers[1] + " of " + numbers[2];
      curlv_min = normAge(curlv_min);
      curlv_max = normAge(curlv_max);
    }
    if (badge.is('.mylist.mylistsize')) {
      numbers[1] += "GiB";
      numbers[0] = numbers[1] + " of " + numbers[2];
      curlv_min = curlv_min + "GiB";
      curlv_max = curlv_max + "GiB";
    }
    if (badge.is('.stats.review, .stats.similaranime')) {
      numbers[1] += "+";
      numbers[0] = numbers[1] + " of " + numbers[2];
    }

    la = ""; lb = "";
    if (link != "") {
        la = '<a href="' + link + '">';
        lb = '</a>';
    }

    badge.after(`<div
      class="swebb_badge-bar${isMax ? " swebb_max" : ""}">
        <div class="swebb_bar" style="width: ${curlv_p * 200}px;">&nbsp;</div>
        <span class="swebb_badgetopic">${la + name[1] + lb}</span>
        <span class="swebb_prevlv">${curlv_min}</span>
        <span class="swebb_nextlv">${curlv_max}</span>
        <span class="swebb_current">
          <span class="swebb_progress">${numbers[1]}/${numbers[2]}</span>
          <br />
          Level ${romanNumerals[level]} reached on ${date}
        </span>
        <span class="swebb_badge-bar-icon">${isMax ? romanNumerals[level] : romanNumerals[level + 1]}</span>
      </div>`);
  });

  jQ('.achievements > .g_bubblewrap > .container .swebb_badge-bar-container').each(function() {
    jQ(this).parent('.g_bubblewrap').addClass('swebb_badgebox');
  });

  // Append the original badge view as an additional badge box
  jQ('.achievements > div').append(`
    <div class="g_bubble container swebb_badges-orig">
      <h3 class="swebb_toggler swebb_condensed">Original view</h3>
      <div class="swebb_badgebox">${originalHTML}</div>
    </div>`);

  // Collapse the badge boxes by default
  jQ('.swebb_badgebox').hide();

  // Bind click events to enable expanding/collapsing of badge boxes
  jQ('.achievements > .g_bubblewrap > .container h3').not('.swebb_badges-orig div.swebb_badgebox h3').click(function() {
    jQ(this).next().slideToggle('fast');
    jQ(this).toggleClass("swebb_condensed");
  }).addClass("swebb_toggler swebb_condensed");
})(window.$ || window.jQuery);
