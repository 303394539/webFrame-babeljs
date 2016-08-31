console.time('tpl');;
(() => {
  'use strict';

  var _Tpl = Baic.nop

  var FIRST_EXP = /\$\{\s*(.*?)\s*\}/g;
  var SECOND_EXP = /\$\(\s*(.*?)\s*\)/g;
  var THIRD_EXP = /\$\<\s*(.*?)\s*\>/g;
  var BOOLEAN_EXP = /^([\w\.]+)\s*(\?\s*([^:]*?))?\s*(\:\s*(.*))?$/;

  function _initTpl(context){
    context = context || Baic(document.body)
    var tpl = new _Tpl();
    _initTplHtml(tpl, context)
    return tpl
  }

  function _parseStr(string, obj){
    function _getBooleanValue(str){
      var arr = str.match(BOOLEAN_EXP);
      var value = obj[arr[1]]
      return (!arr[3] && !arr[5]) ? value : (value ? (arr[3] || "") : (arr[5] || ""));
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

  Baic.extend(_Tpl.prototype, {
    tplEventContainer: {},
    tplMap: {},
    on(fnName, fn){
      if(Baic.isObject(fnName)){
        Baic.extend(this.tplEventContainer, fnName)
      }else{
        this.tplEventContainer[fnName] = fn
      }
    },
    parse(name, obj){
      var html = name;
      if(name in this.tplMap && Baic.hasOwn(this.tplMap, name)){
        html = this.tplMap[name] || "";
      }
      function _getBooleanValue(str){
        var arr = str.match(BOOLEAN_EXP);
        var value = obj[arr[1]]
        return (!arr[3] && !arr[5]) ? value : (value ? (arr[3] || "") : (arr[5] || ""));
      }
      html = html.replace(FIRST_EXP, (matched, str) => {
        str = str.replace(SECOND_EXP, (matched, str) => {
          return _getBooleanValue(str).replace(THIRD_EXP, (matched, str) => {
            return _getBooleanValue(str)
          })
        })
        return _getBooleanValue(str)
      })
      return html;
    },
    create(name, obj, parentNode){
      var html = this.parse(name, obj)

      html = html.replace(FIRST_EXP, "")

      var dom = Baic(html);

      dom.forEach(_process.bind(this))

      if (parentNode) {
        if (!parentNode.isB) {
          parentNode = Baic(parentNode)
        }
        parentNode.append(dom)
      }

      return dom;
    }
  })

  function _initTplHtml(tpl, context){
    context.find("[data-tpl]").forEach(item => {
      var dom = Baic(item)
      tpl.tplMap[dom.data("tpl")] = dom.html().replace(/>\s+</g, '><').trim();
      dom.remove()
    })
    context.children().forEach(_process.bind(tpl))
  }

  function _process(el) {
    var tpl = this;
    el = Baic(el);
    var eventName = el.attr('v-link-event');
    var link = el.attr("v-link");
    if (link) {
      el.removeAttr("v-link")
      el.removeAttr("v-link-event")
      el.attr('tap-highlight', 'yes')
      var prefix = link.charAt(0);
      el.on(eventName || "singleTap", event => {
        event.stopPropagation()
        if (prefix === "*") {
          var args = link.substring(1).split(/\s+/).map(a => {
            return /%u[0-9a-f]{4}/i.test(a) ? unescape(a) : decodeURIComponent(a)
          })
          var name = args.shift()
          if (tpl.tplEventContainer[name]) {
            tpl.tplEventContainer[name].apply(window, [event].concat(args))
          }
        } else {
          location.href = link;
        }

      })

    }

    el.children().forEach(_process.bind(tpl))

  }

  Baic.extend({
    tpl: _initTpl,
    parseStr: _parseStr
  })

})();
console.timeEnd('tpl');