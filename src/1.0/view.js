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

    var FIRST_EXP = /\$\{\s*(.*?)\s*\}/g;
    var SECOND_EXP = /\$\(\s*(.*?)\s*\)/g;
    var THIRD_EXP = /\$\<\s*(.*?)\s*\>/g;
    var BOOLEAN_EXP = /^([\w\.]+)\s*(\?\s*([^:]*?))?\s*(\:\s*(.*))?$/;

    function _parseTpl(string, obj) {
      function _getBooleanValue(str) {
        var arr = str.match(BOOLEAN_EXP);
        var value = obj[arr[1]]
        return String((!arr[3] && !arr[5]) ? value : (value ? (arr[3] || "") : (arr[5] || "")));
      }
      string = string.replace(FIRST_EXP, (matched, str) => {
        str = str.replace(SECOND_EXP, (matched, str) => {
          return _getBooleanValue(str).replace(THIRD_EXP, (matched, str) => {
            return _getBooleanValue(str)
          })
        })
        return _getBooleanValue(str)
      })
      return string;
    }
    function _process(el) {
      var self = this;
      el = Baic(el);
      var eventName = el.attr('b-link-event');
      var link = el.attr("b-link");
      var replace = /^(?:yes|1|on|true)$/i.test(el.attr("b-link-replace"));
      el.removeAttr("b-link")
      el.removeAttr("b-link-replace")
      el.removeAttr("b-link-event")
      if (link) {
        el.attr('tap-highlight', 'yes')
        var prefix = link.charAt(0);
        el.on(eventName || "singleTap", event => {
          event.stopPropagation()
          if (prefix === "*") {
            var args = Baic.map(link.substring(1).split(/\s+/), a => {
              return Baic.url.decode(a)
            })
            var name = args.shift();
            var fn = self[name] || window[name];
            if (fn && Baic.isFunction(fn)) {
              fn.apply(self || window, [event].concat(args))
            }
          } else {
            if (!replace) {
              location.href = link;
            } else {
              location.replace(link);
            }
          }
        })
      }
      Baic.each(el.children(), _process.bind(self))
    }
    return {
      context: Baic(document.body),
      defaultAppendContext: null,
      init() {
        View.adaptive();
        if (!Baic.browser.android || Baic.browser.android > 4.3) {
          Baic(window).on('orientationchange', View.adaptive);
        }
        Baic.each(this.context.find("script[type='text/template']"), function(item) {
          var dom = Baic(item)
          this.tplMap[dom.attr("name")] = dom.html().replace(/>\s+</g, '><').trim();
          dom.remove()
        }.bind(this))
        Baic.each(this.context.children(), _process.bind(this))
      },
      tplMap: {},
      setDefaultAppendContext(target){
        if(target){
          this.defaultAppendContext = target.isB ? target : Baic(target);
        }
      },
      appendTpl(name, obj, target) {
        var html = this.tplMap[name];
        if (Baic.isString(html)) {
          if (Baic.isJSON(obj)) {
            html = _parseTpl(html, obj);
          }
          html = html.replace(FIRST_EXP, "");
          var dom = Baic(html);
          Baic.each(dom, _process.bind(this));
          if (target) {
            target = target.isB ? target : (target.defaultAppendContext ? target.defaultAppendContext : Baic(target));
            target.append(dom);
          }
          return dom;
        }
      },
      on(fnName, fn) {
        if (Baic.isObject(fnName)) {
          Baic.extend(this, fnName)
        } else {
          this[fnName] = fn
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
        },
        viewport() {
          View.adaptive();
          if (!Baic.browser.android || Baic.browser.android > 4.3) {
            Baic(window).on('orientationchange', View.adaptive);
          }
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