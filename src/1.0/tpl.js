console.time('tpl');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic, true) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("tpl requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("tpl requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic, noFrame) => {
  'use strict';

  class Tpl{
    constructor(context = Baic(document.body)){
      var self = this;
      context.find("script[type='text/template']").forEach(item => {
        var dom = Baic(item)
        self.tplMap[dom.attr("name")] = dom.html().replace(/>\s+</g, '><').trim();
        dom.remove()
      })
      context.children().forEach(_process.bind(self))
    }
    on(fnName, fn) {
      if (Baic.isObject(fnName)) {
        Baic.extend(this.tplEventContainer, fnName)
      } else {
        this.tplEventContainer[fnName] = fn
      }
    }
    get(name, obj){
      var html = name;
      if (name in this.tplMap && Baic.hasOwn(this.tplMap, name)) {
        html = this.tplMap[name] || "";
      }
      if(Baic.isJSON(obj)){
        return _parseTpl(html, obj);
      }
      return html;
    }
    dom(name, obj) {
      var html = this.get(name, obj)
      html = html.replace(FIRST_EXP, "")
      var dom = Baic(html);
      dom.forEach(_process.bind(this))
      return dom;
    }
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

  Baic.extend(Tpl.prototype, {
    tplEventContainer: {},
    tplMap: {}
  })

  function _process(el) {
    var tpl = this;
    el = Baic(el);
    var eventName = el.attr('v-link-event');
    var link = el.attr("v-link");
    var replace = /^(?:yes|1|on|true)$/i.test(el.attr("v-link-replace"));
    el.removeAttr("v-link")
    el.removeAttr("v-link-replace")
    el.removeAttr("v-link-event")
    if (link) {
      el.attr('tap-highlight', 'yes')
      var prefix = link.charAt(0);
      el.on(eventName || "singleTap", event => {
        event.stopPropagation()
        if (prefix === "*") {
          var args = link.substring(1).split(/\s+/).map(a => {
            return Baic.url.decode(a)
          })
          var name = args.shift()
          if (tpl.tplEventContainer[name]) {
            tpl.tplEventContainer[name].apply(window, [event].concat(args))
          }
        } else {
          if(!replace){
            location.href = link;
          }else{
            location.replace(link);
          }
        }
      })
    }
    el.children().forEach(_process.bind(tpl))
  }

  if (typeof define === "function" && define.amd) {
    define("Tpl", [], () => {
      return Tpl;
    });
  }

  if (typeof noFrame === "undefined") {
    Baic.extend({
      tpl: new Tpl(),
      parseTpl: _parseTpl
    })
  }

  return Tpl;
})
console.timeEnd('tpl');