// ==UserScript==
// @name        AniDB Timeline Zoom Control
// @namespace   SoulweaverScript
// @description Adds a zoom control to a user's timeline
// @include     /^https?://anidb\.net/perl-bin/animedb\.pl\?(|.*&)show=timeline(&|$)/
// @version     2017.06.12
// @grant       none
// @updateURL   https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Timeline_Zoom_Control.user.js
// @downloadURL https://github.com/soulweaver91/anidb-user-scripts/raw/master/AniDB_Timeline_Zoom_Control.user.js
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
    console.error("Failed to load timeline zoom control script!");
    console.log($);
    return;
  }
  
  let timelineArea = $('.g_section.timeline > .g_timeline');
  
  if (timelineArea.length === 0) {
    console.error("Failed to locate the timeline container!");
    return;
  }
  
  $('head link[title="Style"]').after(`<style type="text/css" id="sw_timeline_zoom_style">
  #sw_timeline_zoom {
    position: fixed;
    bottom: .5em;
    right: .5em;
    left: auto;
    opacity: 0.6;
    background-color: white;
    border: 1px solid black;
    border-radius: .5em;
    padding: 1em;
    width: auto;
    text-align: center;
  }

  #sw_timeline_zoom:hover {
    opacity: 1;
  }

  #sw_timeline_zoom_control {
    width: 20em;
    border: 0;
    background: none;
  }

  #sw_timeline_zoom strong {
    font-weight: 700;
  }

  div.g_timeline ul.legend.sw_timeline_verticallabels {
    height: 100px;
  }

  .sw_timeline_verticallabels li {
    height: 100px;
  }
  .sw_timeline_verticallabels li span {
    text-indent: -5000px;
    overflow: hidden;
    position: relative;
    height: 100px;
  }

  li div.verticallabel {
    display: none;
  }
  .sw_timeline_verticallabels li div.verticallabel {
    display: block;
    transform: translateY(-50%) rotate(90deg);
    transform-origin: left center 0;
    width: 100px;
    text-align: right;
    padding-right: .5em;
    position: absolute;
    top: 0;
    left: 50%;
    box-sizing: border-box;
  }
  </style>`);

  
  let annotateTimelineItems = () => {
    timelineArea.find('> ul > li').each((idx, e) => {
      let elem = $(e);
      let margin = parseInt(elem.css('marginLeft'));
      elem.data('sw-timeline-zoom-offset-units', (!isNaN(margin) ? margin / 5 : null));
      elem.data('sw-timeline-zoom-width-units', e.clientWidth / 5);
    });
    
    timelineArea.data('sw-timeline-zoom-factor', 5);
  };
  
  let setupVerticalLabelElems = () => {
    timelineArea.find('> ul.legend > li span').each((idx, e) => {
      $(e).append(`<div class="verticallabel">${$(e).text()}</span>`);
    });
  };
  
  let scaleItems = (factor) => {
    timelineArea.find('> ul > li').each((idx, e) => {
      let elem = $(e);
      let margin = elem.data('sw-timeline-zoom-offset-units');
      let width = elem.data('sw-timeline-zoom-width-units');
      elem.css('width', width * factor);
      if (margin) {
        elem.css('margin-left', margin * factor);
      }
    });
  };
  
  let repositionView = (factor) => {
    let positionUnits = (timelineArea[0].scrollLeft + (timelineArea[0].clientWidth / 2)) / timelineArea.data('sw-timeline-zoom-factor');
    timelineArea[0].scrollLeft = positionUnits * factor - (timelineArea[0].clientWidth / 2);
    timelineArea.data('sw-timeline-zoom-factor', factor);
  };
  
  let setVerticalLabels = (factor) => {
    if (factor < 4) {
      timelineArea.find('.legend').addClass('sw_timeline_verticallabels');
    } else {
      timelineArea.find('.legend').removeClass('sw_timeline_verticallabels');
    }
  };
  
  let scaleFactorChanged = (e) => {
    let factor = e.target.value;
    scaleItems(factor);
    repositionView(factor);
    setVerticalLabels(factor);
    $('#sw_timeline_zoom_percentage').text((factor * 20) + "%");
    $('#sw_timeline_zoom_value').text(factor);
    $('#sw_timeline_zoom_plural').css({ display: ((factor == 1) ? 'none' : 'inline') });
  };
  
  let injectZoomControl = () => {
    timelineArea.append(`
      <div id="sw_timeline_zoom" class="g_bubble">
        <div><input id="sw_timeline_zoom_control" type="range" min="1" max="50" step="1" value="5"></div>
        <div><span class="sw_timeline_zoom_label">
         Zoom: <strong id="sw_timeline_zoom_percentage">100%</strong>
        </span></div>
        <div><span class="sw_timeline_zoom_label">
         One day = <strong id="sw_timeline_zoom_value">5</strong> pixel<span id="sw_timeline_zoom_plural">s</span>
        </span></div>
      </div>
    `);
    
    timelineArea.on('change', '#sw_timeline_zoom', scaleFactorChanged);
  };
  
  annotateTimelineItems();
  setupVerticalLabelElems();
  injectZoomControl();
})(window.$ || window.jQuery);
