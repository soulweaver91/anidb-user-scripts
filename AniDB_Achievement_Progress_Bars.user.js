// ==UserScript==
// @name        AniDB Achievement Progress Bars
// @namespace   SoulweaverScript
// @description Replaces the basic image based badges on AniDB user pages with progress bars for easier tracking
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=userpage(&|$)/
// @version     2017.06.12
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
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

// TODO: Still needs a lot of cleanup and logic simplification.

(($) => {
  if (!$) {
    console.error("Failed to load achievement progress bars script!");
    console.log($);
    return;
  }

  if ($('.achievements').length === 0) {
    // Either not on the main profile page, or something is going south right now
    return;
  }

  const settingsKey = 'SWAchievementProgressBarsSettings';
  let settings = null;
  try {
    let settingsStr = localStorage.getItem(settingsKey);
    if (settingsStr) {
      settings = JSON.parse(settingsStr);
    }
  } catch (e) {
    console.error(e);
  }

  let saveSettings = () => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  };

  if (!settings) {
    settings = {
      openedSections: []
    };
    saveSettings();
  }

  // Add the needed stylesheet using jQuery.
  // There is a GreaseMonkey native function for this (GM_addStyle) but if @grant is anything but none,
  // the jQuery obtained from unsafeWindow breaks (specifically, cannot handle jQ(...).each() anymore),
  // and it is nicer to not need to ship our own copy of it.
  $('head link[title="Style"]').after(`<style type="text/css" id="swebb_style">
  /* Style definitions for Soulweaver's Experimental Badge Bars */
  .swebb_badges-category {
    width: 100%;
  }
  
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
  
  .swebb_unobtained-badge {
    opacity: 0.5;
    transform: scale(0.5);
    margin: -20px -25px;
    display: inline-block;
    position: relative;
    z-index: 0;
  }
  
  .swebb_unobtained-badge:hover {
    opacity: 0.8;
    transform: scale(1);
    z-index: 1;
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

  let determineUserGender = () => {
    let userGenderStr = $('.info .data .gender .value');
    if (userGenderStr.length === 0) {
      return '?';
    }

    return userGenderStr.eq(0).html().toLowerCase() === 'male' ? 'm' : 'f';
  };

  let normalizedTime = (daysFloat) => {
    let days = Math.floor(daysFloat);
    let hours = Math.round((daysFloat - days) * 24);
    return days + "d " + hours + "h";
  }

  let normalizedAge = (daysFloat) => {
    var days = Math.floor(daysFloat);
    var hours = Math.round(daysFloat - days);
    // here's room for improvement, leap day handling is subpar
    var years = Math.floor(days / 365.25);
    days = Math.round(days % 365.25 + hours);
    if (days >= 365) { days = 0; years += 1; }
    var years = (years > 0) ? years + "y " : "";
    return years + days + "d ";
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

  let bindCollapseEvents = () => {
    $('.achievements > .g_bubblewrap > .container h3').not('.swebb_badges-orig div.swebb_badgebox h3').click(function() {
      $(this).next().slideToggle('fast');
      $(this).toggleClass("swebb_condensed");

      let sectionKey = $(this).parent().data('categoryKey')
      if ($(this).hasClass('swebb_condensed')) {
        settings.openedSections = settings.openedSections.filter((k) => k !== sectionKey);
      } else {
        settings.openedSections.push(sectionKey);
      }
      saveSettings();
    }).addClass("swebb_toggler swebb_condensed");
  };

  let wrapOriginalViewBlock = () => {
    let viewHTML = $('.achievements > .container').html();
    $('.achievements > .container > *').remove();
    $('.achievements > .container').append(`
    <div class="g_bubble container swebb_badges-orig" data-category-key="original-view">
      <h3 class="swebb_toggler swebb_condensed">Original view</h3>
      <div class="swebb_badgebox">${viewHTML}</div>
    </div>`);
  };

  let collapseBlocks = () => {
    $('.swebb_badgebox').hide();
    $('.swebb_badges-category').each((_, badgeBox) => {
      console.log($(badgeBox), $(badgeBox).data('categoryKey'));
      if (settings.openedSections.indexOf($(badgeBox).data('categoryKey')) !== -1) {
        $(badgeBox).children('.swebb_badgebox').show();
        $(badgeBox).children('h3').removeClass("swebb_condensed");
      }
    });
  };

  let dashify = (str) => {
    return str
      .toLowerCase()
      .replace(/[^ a-z0-9]/, '')
      .replace(/ /g, '-');
  };

  let linkify = (html, linkUrl) => {
    if (!linkUrl) {
      return html;
    }

    return `<a href="${linkUrl}">${html}</a>`;
  };

  let removeEmptySections = () => {
    $('.swebb_badges-category').each((_, category) => {
      if ($(category).find('.swebb_unobtained-badges .badge').length === 0) {
        $(category).find('.swebb_unobtained-badges').remove();
      }

      if ($(category).find('.badge').length === 0) {
        $(category).remove();
      }
    })
  };

  const userGender = determineUserGender();
  const badgeList = [
    {
      name: 'Anime Achievements',
      selector: '.badge.anime',
      badges: [
        // original set, 22.02.2012
        {
          selector: '.classic_anime',
          link: 'https://wiki.anidb.net/w/Achievements#Anime_Achievements',
          name: 'Classic anime'
        },
        {
          selector: '.cityhunter',
          link: linkSearch('city+hunter'),
          name: 'City Hunter'
        },
        {
          selector: '.conan',
          link: linkSearch('meitantei+conan'),
          name: 'Meitantei Conan'
        },
        {
          selector: '.digimon',
          link: linkSearch('digimon'),
          name: 'Digimon'
        },
        {
          selector: '.doraemon',
          link: linkSearch('doraemon'),
          name: 'Doraemon'
        },
        {
          selector: '.dragonball',
          link: linkSearch('dragon+ball'),
          name: 'Dragon Ball'
        },
        {
          selector: '.gatchaman',
          link: linkSearch('gatchaman'),
          name: 'Gatchaman'
        },
        {
          selector: '.gegege',
          link: linkSearch('gegege+no+kitarou'),
          name: 'Gegege no Kitarou'
        },
        {
          selector: '.gundam',
          link: linkSearch('gundam'),
          name: 'Gundam'
        },
        {
          selector: '.hentai',
          link: linkTag(2615),
          name: 'Hentai'
        },
        {
          selector: '.hokutonoken',
          link: linkRel(386),
          name: 'Hokuto no Ken'
        },
        {
          selector: '.logh',
          link: linkSearch('logh'),
          name: 'Ginga Eiyuu Densetsu'
        },
        {
          selector: '.lupin',
          link: linkSearch('lupin+iii'),
          name: 'Lupin III'
        },
        {
          selector: '.macross',
          link: linkSearch('macross'),
          name: 'Macross'
        },
        {
          selector: '.onepiece',
          link: linkSearch('one+piece'),
          name: 'One Piece'
        },
        {
          selector: '.pokemon',
          link: linkRel(230),
          name: 'Pocket Monsters'
        },
        {
          selector: '.precure',
          link: linkSearch('precure'),
          name: 'Precure'
        },
        {
          selector: '.sailormoon',
          link: linkSearch('sailor+moon'),
          name: 'Sailor Moon'
        },
        {
          selector: '.saintseiya',
          link: linkSearch('saint+seiya'),
          name: 'Saint Seiya'
        },
        {
          selector: '.sazae',
          link: '/a1830',
          name: 'Sazae-san'
        },
        {
          selector: '.slayers',
          link: linkSearch('slayers'),
          name: 'Slayers'
        },
        {
          selector: '.tenchi_muyou',
          link: linkSearch('tenchi+muyou'),
          name: 'Tenchi Muyou'
        },

        // 14.04.2012
        {
          selector: '.jewelpet',
          link: linkSearch('jewelpet'),
          name: 'Jewelpet'
        },

        // 12.10.2012
        {
          selector: '.beyblade',
          link: linkSearch('beyblade'),
          name: 'Beyblade'
        },
        {
          selector: '.princeoftennis',
          link: linkSearch('tennis+no+ouji-sama'),
          name: 'Tennis no Ouji-sama'
        },
        {
          selector: '.yugioh',
          link: linkRel(2061),
          name: 'Yuu Gi Ou'
        },

        // 23.02.2013
        {
          selector: '.major',
          link: linkRel(2168),
          name: 'Major'
        },
        {
          selector: '.evangelion',
          link: linkSearch('evangelion'),
          name: 'Shinseiki Evangelion'
        },
        {
          selector: '.votoms',
          link: linkSearch('votoms'),
          name: 'Votoms'
        },

        // 02.03.2013
        {
          selector: '.gits',
          link: linkSearch('koukaku+kidoutai'),
          name: 'Koukaku Kidoutai'
        },
        {
          selector: '.hxh',
          link: linkSearch('hunter+x+hunter'),
          name: 'Hunter × Hunter'
        },

        // 15.04.2013
        {
          selector: '.tsubasa',
          link: linkSearch('captain+tsubasa'),
          name: 'Captain Tsubasa'
        },
        {
          selector: '.gintama',
          link: linkSearch('gintama'),
          name: 'Gintama'
        },
        {
          selector: '.hack',
          link: linkSearch('.hack'),
          name: '.hack//'
        },
        {
          selector: '.orangeroad',
          link: linkSearch('orange+road'),
          name: 'Kimagure Orange Road'
        },
        {
          selector: '.seikai',
          link: linkRel(1),
          name: 'Seikai no Monshou'
        },

        // 24.08.2014
        {
          selector: '.initiald',
          link: linkSearch('initial+d'),
          name: 'Initial D'
        },

        // 15.12.2014
        {
          selector: '.aria',
          link: linkRel(2659),
          name: 'ARIA'
        },
        {
          selector: '.fma',
          link: linkSearch('hagane+no+renkinjutsushi'),
          name: 'Hagane no Renkinjutsushi'
        },
        {
          selector: '.ippo',
          link: linkSearch('hajime+no+ippo'),
          name: 'Hajime no Ippo'
        },
        {
          selector: '.kenshin',
          link: linkSearch('kenshin'),
          name: 'Rurouni Kenshin'
        }
      ]
    },
    {
      name: 'Creator Achievements',
      selector: '.badge.creator',
      badges: [
        // original set, 22.02.2012
        {
          selector: '.adachimitsuru',
          link: linkCreator(859),
          name: 'Adachi Mitsuru'
        },
        {
          selector: '.clamp',
          link: linkCreator(747),
          name: 'CLAMP'
        },
        {
          selector: '.ghibli',
          link: linkCreator(729),
          name: 'Studio Ghibli'
        },
        {
          selector: '.matsumoto_leiji',
          link: linkCreator(1107),
          name: 'Matsumoto Leiji'
        },
        {
          selector: '.nagai_gou',
          link: linkCreator(868),
          name: 'Nagai Gou'
        },
        {
          selector: '.takahashi_rumiko',
          link: linkCreator(818),
          name: 'Takahashi Rumiko'
        },
        {
          selector: '.tezuka_osamu',
          link: linkCreator(1195),
          name: 'Tezuka Osamu'
        },

        // 14.04.2012
        {
          selector: '.studio4c',
          link: linkCreator(738),
          name: 'Studio 4°C'
        },

        // 23.02.2013
        {
          selector: '.key',
          link: linkCreator(1046),
          name: 'Key'
        },
        {
          selector: '.kyotoanimation',
          link: linkCreator(736),
          name: 'Kyoto Animation'
        },
        {
          selector: '.typemoon',
          link: linkCreator(927),
          name: 'TYPE-MOON'
        },

        // 02.03.2013
        {
          selector: '.fukumotonobuyuki',
          link: linkCreator(9107),
          name: 'Fukumoto Nobuyuki'
        },
        {
          selector: '.urasawanaoki',
          link: linkCreator(875),
          name: 'Urasawa Naoki'
        },

        // 22.04.2017
        {
          selector: '.nagao_takena',
          link: linkCreator(29357),
          name: 'Nagao Takena'
        }
      ]
    },
    {
      name: 'Mylist Achievements',
      selector: '.badge.mylist',
      badges: [
        {
          selector: '.animecount',
          name: 'Anime on mylist',
          tiers: [1, 10, 50, 100, 500, 1000, 2500, 5000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_mylist .acnt .value')))
        },
        {
          selector: '.episodecount',
          name: 'Episodes on mylist',
          tiers: [1, 100, 500, 1000, 2500, 5000, 10000, 25000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_mylist .ecnt .value')))
        },
        {
          selector: '.seenepisodes',
          name: 'Watched episodes',
          tiers: [1, 100, 500, 1000, 2500, 5000, 10000, 25000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_mylist .watched.count .value')))
        },
        {
          selector: '.filecount',
          name: 'Files on mylist',
          tiers: [1, 100, 500, 1000, 2500, 5000, 10000, 25000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_mylist .fcnt .value')))
        },
        {
          selector: '.mylistsize',
          name: 'Size of mylist',
          tiers: [10, 50, 100, 250, 500, 1000, 2500, 10000],
          currentValueGetter: () => {
            let sizeString = getPlainText($('.stats_mylist .size .value')).match(/(\d+.\d+) (Bytes|K|M|G|T)B?/);
            let factor = {
              "Bytes": 1 / 1024 / 1048576,
              "K": 1 / 1048576,
              "M": 1 / 1024,
              "G": 1,
              "T": 1024
            };

            return sizeString[1] * factor[sizeString[2]];
          },
          valueFormatter: (val) => val.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) + 'GiB'
        },
        {
          selector: '.timewasted',
          name: 'Time wasted',
          tiers: [1.00000,   7.00000,  30.43680,  91.31040,
            182.62080, 273.93125, 365.24170, 730.48330],
          currentValueGetter: () => {
            let timeString = getPlainText($('.stats_mylist .timewasted .value')).match(/(\d+) d (\d+) h/);
            if (!timeString) {
              return 0;
            }

            return parseInt(timeString[1]) + parseInt(timeString[2]) / 24;
          },
          valueFormatter: normalizedTime
        }
      ]
    },
    {
      name: 'Statistical Achievements',
      selector: '.badge.stats',
      badges: [
        {
          selector: '.anidbmember',
          name: 'Account age',
          tiers: [30.43680,   91.31050,  182.62110,  365.24220,
            730.48440, 1460.96880, 2556.69540, 3652.42200],
          currentValueGetter: () => {
            let timeString = getPlainText($('.userpage_all .g_section.info .membersince .value'));
            if (!timeString) {
              return 0;
            }

            let memberSinceDate = moment(timeString, [
              'YYYY-MM-DD',
              'DD.MM.YYYY'
            ], true);

            if (!memberSinceDate.isValid()) {
              return 0;
            }

            return moment().startOf('day').diff(memberSinceDate, 'days');
          },
          valueFormatter: normalizedAge
        },
        {
          selector: '.animeadded',
          name: 'Anime entries added',
          tiers: [1, 5, 10, 25, 50, 100, 250, 500],
          currentValueGetter: () => parseInt(getPlainText($('.stats_contrib .aacnt .value')))
        },
        {
          selector: '.creatoradded',
          name: 'Creator entries added',
          tiers: [1, 10, 25, 50, 100, 250, 500, 1000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_contrib .pacnt .value')))
        },
        {
          selector: '.avmf',
          name: 'Files dumped',
          tiers: [1, 50, 100, 250, 500, 1000, 5000, 10000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_contrib .facnt .value').slice(1)))
        },
        {
          selector: '.creqcount',
          name: 'Granted creqs',
          tiers: [1, 10, 50, 100, 250, 500, 1000, 5000],
          currentValueGetter: () => {
            let grantedCount = getPlainText($('.stats_creq .creqok .value'));
            let deniedCount = getPlainText($('.stats_creq .creqfailed .value'));

            return grantedCount - deniedCount;
          }
        },
        {
          selector: '.votes',
          name: 'Cast votes',
          tiers: [1, 10, 25, 50, 100, 250, 500, 1000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_community .votecnt .value')))
        },
        {
          selector: '.tags',
          name: 'Tags assigned',
          tiers: [100, 250, 500, 1000, 2500, 5000, 10000, 25000],
          currentValueGetter: () => parseInt(getPlainText($('.stats_contrib .taacnt .value').slice(1)))
        },
        {
          selector: '.review',
          name: 'Reviews written',
          tiers: [1, 5, 10, 25, 50, 75, 100, 250],
          currentValueGetter: () => null,
          useTierStartAsValue: true
        },
        {
          selector: '.similaranime',
          name: 'Similar anime suggestions added',
          tiers: [1, 5, 10, 25, 50, 100],
          currentValueGetter: () => null,
          useTierStartAsValue: true
        }
      ]
    },
    {
      name: 'One-Time Achievements',
      selector: '.badge.one-time',
      badges: [
        {
          selector: '.introduction',
          link: '/perl-bin/animedb.pl?show=forum&id=13',
          name: 'Introduced ' + (userGender === 'f' ? 'herself' : (userGender === 'm' ? 'himself' : 'themself'))
          + ' on the forums',
          tiers: null,
          currentValueGetter: () => null
        },
        {
          selector: '.club',
          link: '/perl-bin/animedb.pl?show=clublist&do.filter=1',
          name: 'Joined and participated in clubs',
          tiers: null,
          currentValueGetter: () => null
        },
      ]
    },
    {
      name: 'Special Achievements',
      selector: '.badge.special',
      badges: [
        {
          selector: '.creativity',
          name: 'Contributed creative content',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.code',
          name: 'Contributed code',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2013-10',
          name: 'ABGM #1 participation - Germany, Oct 2013',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2014-03',
          name: 'ABGM #2 participation - Germany, Mar 2014',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.sweden-2014-07',
          name: 'ABGM #3 participation - Sweden, Jul 2014',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2014-10',
          name: 'ABGM #4 participation - Germany, Oct 2014',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.croatia-2015-04',
          name: 'ABGM #5 participation - Croatia, Apr 2015',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.belgium-2013-10',
          name: 'ABGM #6 participation - Belgium, Oct 2015',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2016-05',
          name: 'ABGM #7 participation - Germany, May 2016',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2016-10',
          name: 'ABGM #8 participation - Germany, Oct 2016',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.germany-2017-04',
          name: 'ABGM #9 participation - Germany, Apr 2017',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        },
        {
          selector: '.boardgame.croatia-2017-09',
          name: 'ABGM #10 participation - Croatia, Sep 2017',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true
        }
      ]
    },
    {
      name: 'Mod Achievements',
      selector: '.badge.mod',
      badges: [
        {
          selector: '.benu',
          name: 'benu',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.cdb-man',
          name: 'CDB-Man',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.deridiot',
          name: 'DerIdiot',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.exp',
          name: 'exp',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.nwa',
          name: 'nwa',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.ommina',
          name: 'ommina',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.sput',
          name: 'sput',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        },
        {
          selector: '.worf',
          name: 'worf',
          tiers: null,
          currentValueGetter: () => null,
          hidden: true,
          copyOriginalName: true
        }
      ]
    }
  ];
  const romanNumerals = ["-", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const badgeTitleMatcher = /^([^\(\[$]+)\s*(?:\((\d+)+ of (\d+)\))?(?:\s*\[Level (\d) achieved on: (\d{2}.\d{2}.\d{4}|\d{4}-\d{2}-\d{2})\])?$/i;

  wrapOriginalViewBlock();
  badgeList.forEach((category) => {
    try {
      let elementSelector = 'swebb_badges-category-' + dashify(category.name);

      $('.swebb_badges-orig').before(`
      <div class="g_bubble container swebb_badges-category ${elementSelector}" data-category-key="${dashify(category.name)}">
        <h3 class="swebb_toggler swebb_condensed">${category.name}</h3>
        <div class="swebb_badgebox">
          <div class="swebb_obtained-badges"></div>
          <div class="swebb_unobtained-badges">
            <h4>Unobtained badges</h4>
          </div>
        </div>
      </div>`);

      let obtainedContainer = $('.' + elementSelector + ' .swebb_obtained-badges');
      let unobtainedContainer = $('.' + elementSelector + ' .swebb_unobtained-badges');

      let sortedBadges = category.badges.sort((badge1, badge2) => badge1.name > badge2.name);
      sortedBadges.forEach((badge) => {
        let originalBadge = $(`.swebb_badges-orig .badge${category.selector}${badge.selector}`);
        let badgeClassStr = ('badge' + category.selector + badge.selector).replace(/\./g, ' ');
        let obtained = originalBadge.length > 0;

        // Initially, set all numerical values in the badge bar to unknown. They will be filled in shortly
        // based on the type of the badge.
        let currentValue = null;
        let levelStartValue = null;
        let levelEndValue = null;
        let completionValue = null;
        let tiers = badge.tiers;
        let formatter = badge.valueFormatter || ((val) => parseFloat(val).toLocaleString('en-GB'));

        // Do not show certain badges in the unobtained ones section.
        if (!obtained && badge.hidden) {
          return;
        }

        // If the badge is not one of those certain ones, then show it in that section.
        if (!obtained) {
          unobtainedContainer.append(linkify(`<div class="swebb_unobtained-badge" title="${badge.name}${tiers ? ` (${formatter(tiers[0])} required for Level I)` : ''}">
            <div class="${badgeClassStr}">
              <div class="inner">
                <span class="hide">badge</span>
              </div>
            </div>
          </div>`, badge.link));
          return;
        }

        // Parse all known parts of the title text
        let badgeTitleText = originalBadge[0].title;
        let [, badgeDescription, itemsDone, itemsTotal, currentLevel, lastLevelUp] = badgeTitleMatcher.exec(badgeTitleText);
        if (currentLevel) {
          currentLevel = parseInt(currentLevel);
        }
        if (itemsTotal) {
          itemsTotal = parseInt(itemsTotal);
        }
        if (itemsDone) {
          itemsDone = parseInt(itemsDone);
        }

        if (badge.currentValueGetter === undefined) {
          // No getter means the values come from the badge description.
          // This is used for the anime and creator badges.

          currentValue = itemsDone;
          completionValue = itemsTotal;
          tiers = [];
          for (let i = 1; i < 9; i++) {
            // Based on empirical results, the badge granting thresholds are actually at 10.5%, 21.5%, ...
            // My guess is that internally the system calculates progress divided by max,
            // then rounds that value to nearest integer, and finally compares to 11%, 12%, ..., 100%.
            tiers[i - 1] = Math.ceil((0.11 * i - 0.005) * itemsTotal);
          }
          tiers[8] = itemsTotal;

        } else if (badge.useTierStartAsValue) {
          currentValue = tiers[currentLevel - 1];
        } else if (typeof badge.currentValueGetter === 'function') {
          // Read the value from somewhere else on the page, depending on the type.
          currentValue = badge.currentValueGetter();
        }

        if (tiers && currentLevel) {
          // A badge that has defined tier thresholds and a current level also has a start and end value
          // to be used in the bar.
          levelStartValue = tiers[currentLevel - 1];
          levelEndValue = currentLevel < tiers.length ? tiers[currentLevel] : tiers[tiers.length - 1];
        } else {
          // Badges without tiers will be shown as level one.
          currentLevel = 1;
        }

        // Set the default bar percentage to 100% for badges that don't have a clear progression.
        levelPercentage = 1;
        if (levelStartValue !== null && levelEndValue !== null) {
          levelPercentage = (currentValue - levelStartValue) / (levelEndValue - levelStartValue);
        }

        let isMax = !tiers || currentLevel === tiers.length;

        obtainedContainer.append(`<div class="swebb_obtained-badge swebb_badge-bar-container" title="${badgeTitleText}">
            ${linkify(`<div class="${badgeClassStr} swebb_badge-small">
              <div class="inner">
                <span class="hide">badge</span>
              </div>
            </div>`, badge.link)}<div
            class="swebb_badge-bar${isMax ? " swebb_max" : ""}">
               <div class="swebb_bar" style="width: ${levelPercentage * 200}px;">&nbsp;</div>
               <span class="swebb_badgetopic">${linkify(badge.name + (badge.copyOriginalName ? ` - ${badgeDescription}` : ''), badge.link)}</span>
               ${levelStartValue ? `<span class="swebb_prevlv">${formatter(levelStartValue)}</span>` : ''}
               ${levelEndValue ? `<span class="swebb_nextlv">${formatter(levelEndValue)}</span>` : ''}
               <span class="swebb_current">
                 ${currentValue ? `<span class="swebb_progress">${formatter(currentValue)}${badge.useTierStartAsValue ? '+' : ''}/${completionValue ? formatter(completionValue) : '∞'}</span>` : ''}
                 <br />
                 ${(!!lastLevelUp && !!currentLevel) ? `Level ${romanNumerals[currentLevel]} reached on ${lastLevelUp}` : ''}
               </span>
               <span class="swebb_badge-bar-icon">${isMax ? romanNumerals[currentLevel] : romanNumerals[currentLevel + 1]}</span>
             </div>
          </div>`);
      });
    } catch (e) {
      // Log the error and continue processing the rest of the badges.
      console.error(e);
    }
  });

  removeEmptySections();
  bindCollapseEvents();
  collapseBlocks();
})(window.$ || window.jQuery);
