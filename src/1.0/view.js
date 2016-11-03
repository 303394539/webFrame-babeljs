console.time('view');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic, true) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("view requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("view requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic, noFrame) => {
  'use strict';

  var View = Object.extends(() => {
    var html = Baic('html');
    var remDom = Baic('.remPage');
    var pxWidth = remDom.length > 0 ? Baic(remDom[0]).rect().width : 320;
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    screenWidth = Math.min(screenWidth, screenHeight);
    screenHeight = Math.max(screenWidth, screenHeight);
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    clientWidth = Math.min(clientWidth, clientHeight);
    clientHeight = Math.max(clientWidth, clientHeight);
    var originFontSize = +html.css('fontSize').replace('px', '');
    if (screenWidth != clientWidth && screenHeight != clientHeight) {
      screenWidth /= Baic.browser.pixelRatio;
      screenHeight /= Baic.browser.pixelRatio;
    }
    return {
      init() {
        View.adaptive();
        if (!Baic.browser.android || Baic.browser.android > 4.3) {
          Baic(window).on('orientationchange', View.adaptive);
        }
      },
      static: {
        adaptive() {
          var width = Math.abs(window.orientation) == 90 ? screenHeight : screenWidth;
          var scale = pxWidth ? (width / pxWidth) : 1;
          var viewportSettings = [
            'width=device-width',
            'initial-scale=1.0',
            'maximum-scale=1.0',
            'user-scalable=' + (Baic.browser.android ? 0 : 'no')
          ];
          var currentFontSize = originFontSize * scale;

          Baic.browser.scale = scale;
          html.data('originPx', originFontSize);
          html.data('currentPx', currentFontSize);

          if (Baic.browser.android) {
            viewportSettings.push('target-densitydpi=' + (Baic.browser.android > 4.3 ? 'medium' : 'device') + '-dpi');
          }
          html.css('fontSize', currentFontSize + 'px');
          Baic('meta[name=viewport]').attr('content', viewportSettings.join(','));
        }
      }
    }
  })

  if (typeof define === "function" && define.amd) {
    define("View", [], () => {
      return View;
    });
  }

  if (typeof noFrame === "undefined") {
    Baic.View = window.View = View;
  }

  return View;
})
console.timeEnd('view');