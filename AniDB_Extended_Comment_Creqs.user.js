// ==UserScript==
// @name        AniDB Extended Comment Creqs
// @namespace   SoulweaverScript
// @description Adds comment-creqing capabilities to various additional entity pages
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=anime(&|$)/
// @include     /^https?://anidb\.net/anime/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=character(&|$)/
// @include     /^https?://anidb\.net/character/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=club(&|$)/
// @include     /^https?://anidb\.net/club/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=collection(&|$)/
// @include     /^https?://anidb\.net/collection/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=cmt(&|$)/
// @include     /^https?://anidb\.net/forum/thread/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=creator(&|$)/
// @include     /^https?://anidb\.net/creator/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=ep(&|$)/
// @include     /^https?://anidb\.net/episode/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=file(&|$)/
// @include     /^https?://anidb\.net/file/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=group(&|$)/
// @include     /^https?://anidb\.net/group/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/group/\d+/anime/\d+/release(?|/$|$)/
// @include     /^https?://anidb\.net/group/release/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=song(&|$)/
// @include     /^https?://anidb\.net/song/\d+(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=tag(&|$)/
// @include     /^https?://anidb\.net/tag/\d+(?|/$|\w+tb|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=userpage(&|$)/
// @include     /^https?://anidb\.net/user/\d+(?|/$|/profile|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addcharanimerel(&|$)/
// @include     /^https?://anidb\.net/anime/\d+/character(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addcharcharrel(&|$)/
// @include     /^https?://anidb\.net/character/\d+/relation(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addcreatoranimerel(&|$)/
// @include     /^https?://anidb\.net/anime/\d+/creator(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addcreatorcreatorrel(&|$)/
// @include     /^https?://anidb\.net/creator/\d+/relation(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addcreatorsongrel(&|$)/
// @include     /^https?://anidb\.net/song/\d+/creator(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addeptitle(&|$)/
// @include     /^https?://anidb\.net/episode/\d+/name(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addgroupgroup(&|$)/
// @include     /^https?://anidb\.net/group/\d+/relation(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addname(&|$)/
// @include     /^https?://anidb\.net/\w+/\d+/name(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addresource(&|$)/
// @include     /^https?://anidb\.net/\w+/\d+/resource(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addseq(&|$)/
// @include     /^https?://anidb\.net/anime/\d+/relation(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addsonganimerel(&|$)/
// @include     /^https?://anidb\.net/song/\d+/anime(?|/$|$)/
// @include     /^https?://anidb\.net/anime/\d+/song(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addsongcollectionrel(&|$)/
// @include     /^https?://anidb\.net/song/\d+/collection(?|/$|$)/
// @include     /^https?://anidb\.net/collection/\d+/song(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addsongsongrel(&|$)/
// @include     /^https?://anidb\.net/song/\d+/relation(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addtagentityrel(&|$)/
// @include     /^https?://anidb\.net/\w+/\d+/tag(?|/$|$)/
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=addtagname(&|$)/
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @version     2019.07.17
// @grant       GM_addStyle
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Extended_Comment_Creqs.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Extended_Comment_Creqs.user.js
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

const _$ = window.$.noConflict();

(($) => {
  if (!$) {
    console.error("Failed to load the comment creq button script!");
    console.log($);
    return;
  }

  const DEBUG_MOD_ITEMS = false;

  // Add the needed stylesheet using jQuery.
  $('head link[title="Style"]').after(`<style type="text/css" id="swecc_style">
  /* Default style width doesn't fit four icons */
  #layout-main div.file_all .action.icons {
    width: 8em;
  }

  #layout-main div.edit_actions span.swecc_report > *::before {
    content: "\\f06a";
    font-weight: 900;
  }

  .i_swecc_report {
    height: auto;
    width: 16px;
    font-size: 1.33rem;
  }
  .i_swecc_report::after {
    content: "\\f06a";
    font-weight: 900;
  }
  </style>`);

  const makeCmtCreqURL = (table, id) => `/perl-bin/animedb.pl?show=creq&creq.cmt=1&tb=${table}&id=${id}`;

  const makeSpanTypeButton = (table, id) => {
    return `<span class="swecc_report">
      <a title="report this entry" href="${makeCmtCreqURL(table, id)}">report this entry</a>
    </span>`;
  };

  const makeTableTypeButton = (table, id) => {
    return `<a class="i_icon i_swecc_report" title="report this entry" href="${makeCmtCreqURL(table, id)}">
      <span>report this entry</span>
    </a>`;
  };

  // Unused, possibly to be removed
  const makePlainTypeLink = (table, id) => {
    return ` <a class="swecc_report" href="${makeCmtCreqURL(table, id)}">report</a>`;
  };

  const parseTableTypePage = (searchClass, idRegex, table) => {
    const items = $(`${searchClass} tr`);

    items.each((i, item) => {
      const lastCol = $(item).find('td.action');
      const editLink = lastCol.find('.i_general_edit, .i_general_edit_request');
      const idMatch = (editLink && editLink.attr('href') || '').match(idRegex);
      if (idMatch) {
        editLink.after(makeTableTypeButton(table, idMatch[1]));
      }
    });
  };

  const fixEvenOddItems = (el) => {
    $(el).children().removeClass('g_odd');
    $(el).find('> *:nth-child(2n+1)').addClass('g_odd');
  }

  const query = new URLSearchParams(new URL($('meta#anidb-url').data('anidb-url')).search);
  const mode = query.get('show');

  // Add completely missing links
  switch (mode) {
    case 'file': {
      const items = $('.file_tracks tr, .file_relations tr, .rel_eps tr');
      items.each((i, item) => {
        const lastCol = $(item).find('td.action');
        const historyLink = lastCol.find('a:contains("hist")');
        const editLink = lastCol.find('a:contains("edit")');

        const idMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]id=(\d+)/i);
        const tableMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]table=([a-z]+tb)/i);

        if (idMatch && tableMatch) {
          const html = makeTableTypeButton(tableMatch[1], idMatch[1]);
          if (editLink.length > 0) {
            editLink.after(html);
          } else {
            lastCol.append(html);
          }
        }
      });

      break;
    }
    case 'group': {
      if (!query.get('agid') && !query.get('aid')) {
        break;
      }

      const editLink = $('.g_section.info .edit_actions .modify a').attr('href');
      const idMatch = (editLink || '').match(/[?&]agid=(\d+)/i);
      if (idMatch) {
        $('.g_section.info .edit_actions .modify').before(makeSpanTypeButton('animegrouptb', idMatch[1]));
      }
      break;
    }
    case 'addname':
    case 'addresource': {
      const historyLink = $('.pane.current .g_section > table td.action .i_general_history');
      const tableMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]table=([a-z]+tb)/);
      if (tableMatch) {
        parseTableTypePage('.pane.current .g_section > table', /[?&]do.edit=(\d+)/i, tableMatch[1]);
      }
      break;
      // name tested on: song, collection, creator, anime, episode (eptitletb), tag (tagnametb)
      // resource tested on: song, collection, creator, anime, episode, tag
    }
    case 'addcharanimerel': {
      const items = $(`.reltable tr`);

      items.each((i, item) => {
        const actionCols = $(item).find('td.action');
        actionCols.each((i, col) => {
          const historyLink = $(col).find('.i_general_history');
          const editLink = $(col).find('.i_general_edit, .i_general_edit_request');
          const idMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]id=(\d+)/i);
          const tableMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]table=([a-z]+tb)/i);
          if (idMatch && tableMatch) {
            editLink.after(makeTableTypeButton(tableMatch[1], idMatch[1]));
          }
        });
      });
      break;
    }
    case 'addcharcharrel':
      parseTableTypePage('.addcharcharrel_entries', /[?&]addccrel.sid=(\d+)/i, 'charcharreltb');
      break;
    case 'addcreatoranimerel': {
      const items = $(`.pane.current .creatorlist tr`);

      items.each((i, item) => {
        const actionCol = $(item).find('td.action');

        const historyLink = actionCol.find('.i_general_history');
        const editLink = actionCol.find('.i_general_edit, .i_general_edit_request');
        const idMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]id=(\d+)/i);
        const tableMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]table=([a-z]+tb)/i);
        if (idMatch && tableMatch) {
          editLink.after(makeTableTypeButton(tableMatch[1], idMatch[1]));
        }
      });
      break;
    }
    case 'addcreatorcreatorrel':
      parseTableTypePage('.addcreatorcreatorrel_entries', /[?&]addccrel.sid=(\d+)/i, 'creatorcreatorreltb');
      break;
    case 'addcreatorsongrel': {
      const items = $(`.addcreatorsongrel_entries tr`);

      items.each((i, item) => {
        const actionCol = $(item).find('td.action');

        const historyLink = actionCol.find('.i_general_history');
        const editLink = actionCol.find('.i_general_edit, .i_general_edit_request');
        const idMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]id=(\d+)/i);
        const tableMatch = (historyLink && historyLink.attr('href') || '').match(/[?&]table=([a-z]+tb)/i);
        if (idMatch && tableMatch) {
          editLink.after(makeTableTypeButton(tableMatch[1], idMatch[1]));
        }
      });
      break;
    }
    case 'addeptitle':
      parseTableTypePage('.addeptitle_list', /[?&]do.edit=(\d+)/i, 'eptitletb');
      break;
    case 'addgroupgroup':
      parseTableTypePage('.addgroup_current', /[?&]addgg.id=(\d+)/i, 'groupgrouptb');
      break;
    case 'addseq':
      parseTableTypePage('.addseq_entries', /[?&]adds.sid=(\d+)/i, 'seqtb');
      break;
    case 'addsonganimerel':
      parseTableTypePage('.reltable', /[?&]addsarel.relid=(\d+)/i, 'songanimereltb');
      break;
    case 'addsongcollectionrel':
      parseTableTypePage('.reltable', /[?&]addscrel.relid=(\d+)/i, 'songcollectionreltb');
      break;
    case 'addsongsongrel':
      parseTableTypePage('.addsongsongrel_entries', /[?&]adds.sid=(\d+)/i, 'songsongreltb');
      break;
    case 'addtagentityrel':
      parseTableTypePage('.tag_entries', /[?&]relid=(\d+)/i, 'tagentityreltb');
      break;
    case 'addtagname':
      parseTableTypePage('.addtagname_list', /[?&]do.edit=(\d+)/i, 'tagnametb');
      break;
  }

  // Add mod only missing links (contribution tab type)
  if ($('.pane.contribution .report').length === 0 || DEBUG_MOD_ITEMS) {
    let table = '';
    let id = 0;
    let maybeOdd = $('.pane.contribution > ul > li').length % 2 === 0 ? 'g_odd' : '';

    switch (mode) {
      case 'anime':
        table = 'animetb'; id = query.get('aid'); break;
      case 'character':
        table = 'chartb'; id = query.get('charid'); break;
      case 'club':
        table = 'clubtb'; id = query.get('clubid'); break;
      case 'collection':
        table = 'collectiontb'; id = query.get('collectionid'); break;
      case 'creator':
        table = 'creatortb'; id = query.get('creatorid'); break;
      case 'ep':
        table = 'eptb'; id = query.get('eid'); break;
      case 'group':
        table = 'grouptb'; id = query.get('gid'); break;
      case 'song':
        table = 'songtb'; id = query.get('songid'); break;
      case 'tag':
        table = 'tagdatatb'; id = query.get('tagid'); break;
    }
    if (parseInt(id) !== 0) {
      $('.pane.contribution ul').append(`<li class="${maybeOdd} report swecc_report">
        <span>
          <a href="${makeCmtCreqURL(table, id)}">report this entry</a>
        </span>
      </li>`);
    }
  }

  // Add mod only missing links (bottom bar button type)
  if (['file'].indexOf(mode) !== -1) {
    const bottomLinks = $('.file_all > .links');
    const id = query.get('fid');

    if (bottomLinks.find('.cmt').length === 0 || DEBUG_MOD_ITEMS) {
      let placementTarget = null;

      ['.edit', '.history'].some((targetCandidateClass) => {
        if (bottomLinks.find(targetCandidateClass).length > 0) {
          placementTarget = bottomLinks.find(targetCandidateClass);
          return true;
        }
      });

      const reportLink = `<li class="cmt swecc_report">
        <span>
          <a href="${makeCmtCreqURL('filetb', id)}">report this entry</a>
        </span>
      </li>`;
      const spaceNode = document.createTextNode(' ');

      if (placementTarget) {
        placementTarget.after(reportLink);
        placementTarget.after(spaceNode);
      } else {
        bottomLinks.append(reportLink);
        bottomLinks.append(spaceNode);
      }

      fixEvenOddItems(bottomLinks);
    }
  }

  // Add mod only missing links (forum post type)
  if (['club', 'cmt', 'userpage'].indexOf(mode) !== -1) {
    $('.cmt_entries .comment').each((i, post) => {
      const actions = $(post).find('.actions');
      const reportButton = actions.find('.i_comment_report');
      if (reportButton.length > 0 && !DEBUG_MOD_ITEMS) {
        return true;
      }

      const quoteButton = actions.find('.i_comment_quote');
      const id = $(post).attr('id').slice(1);

      if (id && actions.length > 0) {
        const reportButton = `<a class="i_icon i_comment_report swecc_report" title="Report Post" href="${makeCmtCreqURL('posttb', id)}">
          <span>Report Post</span>
        </a>`;

        if (quoteButton.length > 0) {
          quoteButton.before(reportButton);
        } else {
          actions.prepend(reportButton);
        }
      }
    });
  }
})(_$);
