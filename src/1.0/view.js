console.time('view');;
((factory) => {
  
  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["Baic"], factory);
  } else {

    // Browser globals
    factory(window, window.document, Baic);
  }

})((window, document, $) => {
  'use strict';

  var View = Object.extends(() => {

    var html = $('html');
    var remDom = $('.remPage');
    var pxWidth = remDom.length > 0 ? $(remDom[0]).width() : 320;
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    screenWidth = Math.min(screenWidth, screenHeight);
    screenHeight = Math.max(screenWidth, screenHeight);
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    clientWidth = Math.min(clientWidth, clientHeight);
    clientHeight = Math.max(clientWidth, clientHeight);
    var originFontSize = +html.css('fontSize').replace('px', '');
    if (screenWidth != clientWidth && screenHeight != clientHeight) {
      screenWidth /= $.browser.pixelRatio;
      screenHeight /= $.browser.pixelRatio;
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
    return {
      context: $(document.body),
      defaultAppendContext: null,
      init() {
        View.adaptive();
        if (!$.browser.android || $.browser.android > 4.3) {
          $(window).on('orientationchange', View.adaptive);
        }
        $.each(this.context.find("script[type='text/template']"), function(item) {
          var dom = $(item)
          this.tplMap[dom.attr("name")] = dom.html().replace(/>\s+</g, '><').trim();
          dom.remove()
        }.bind(this))
        $.each(this.context.children(), child => $(child).process())
      },
      tplMap: {},
      setDefaultAppendContext(target){
        if(target){
          this.defaultAppendContext = target.isB ? target : $(target);
        }
      },
      appendTpl(name, obj, target) {
        var html = this.tplMap[name];
        if ($.isString(html)) {
          if ($.isJSON(obj)) {
            html = _parseTpl(html, obj);
          }
          html = html.replace(FIRST_EXP, "");
          var dom = $(html);
          $.each(dom, child => $(child).process());
          if (target) {
            target = target.isB ? target : (target.defaultAppendContext ? target.defaultAppendContext : $(target));
            target.append(dom);
          }
          return dom;
        }
      },
      on(fnName, fn) {
        if ($.isObject(fnName)) {
          $.extend(this, fnName)
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
            'user-scalable=' + ($.browser.android ? 0 : 'no')
          ];
          var currentFontSize = originFontSize * scale;

          $.browser.scale = scale;
          html.data('originPx', originFontSize);
          html.data('currentPx', currentFontSize);

          if ($.browser.android) {
            viewportSettings.push('target-densitydpi=' + ($.browser.android > 4.3 ? 'medium' : 'device') + '-dpi');
          }
          html.css('fontSize', currentFontSize + 'px');
          $('meta[name=viewport]').attr('content', viewportSettings.join(','));
        },
        viewport() {
          View.adaptive();
          if (!$.browser.android || $.browser.android > 4.3) {
            $(window).on('orientationchange', View.adaptive);
          }
        }
      }
    }
  })

  $.extend($.fn, {
    process() {
      var eventName = this.attr('b-link-event');
      var link = this.attr("b-link");
      var replace = String(this.attr("b-link-replace")).toBoolean();
      this.removeAttr("b-link")
      this.removeAttr("b-link-replace")
      this.removeAttr("b-link-event")
      if (link) {
        this.attr('tap-highlight', 'yes')
        var prefix = link.charAt(0);
        this.on(eventName || "singleTap", function(event) {
          event.stopPropagation()
          if (prefix === "*") {
            var args = $.map(link.substring(1).split(/\s+/), item => {
              return $.url.decode(item)
            })
            var name = args.shift()
            var fn = this[name] || window[name];
            if(fn && $.isFunction(Fn)){
              fn.apply(this, [event].concat(args))
            }
          } else {
            if (!replace) {
              location.href = link;
            } else {
              location.replace(link);
            }
          }
        }.bind(this))
      }
      $.each(this.children(), child => $(child).process())
      return this;
    }
  })

  $.View = window.View = View;

});
console.timeEnd('view');