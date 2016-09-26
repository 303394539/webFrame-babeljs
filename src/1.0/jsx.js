console.time('jsx');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("jsx requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("jsx requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
  'use strict';

  Baic.extend(Baic.fn, {
    process() {
      var eventName = this.attr('b-link-event');
      var link = this.attr("b-link");
      var replace = (this.attr("b-link-replace") || "").toBoolean();
      this.removeAttr("b-link")
      this.removeAttr("b-link-replace")
      this.removeAttr("b-link-event")
      if (link) {
        this.attr('tap-highlight', 'yes')
        var prefix = link.charAt(0);
        this.on(eventName || "singleTap", event => {
          event.stopPropagation()
          if (prefix === "*") {
            var args = link.substring(1).split(/\s+/).map(item => {
              return Baic.url.decode(item)
            })
            var name = args.shift()
            var fn = window[name];
            if(fn && Baic.isFunction(Fn)){
              fn.apply(window, [event].concat(args))
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
      this.children().forEach(child => {
        Baic(child).process();
      })
      return this;
    }
  })

  Baic.extend({
    jsx(type, properties, children) {
      properties = properties || {};
      if (Baic.isString(type)) {
        properties.tag = type
      } else if (type.tag) {
        properties.tag = type.tag
      }
      if (arguments.length > 2) {
        children = arguments.toArray().slice(2)
        if (children[0] && !children[0].isB) {
          properties.html = children[0]
          children.shift()
        }
        properties.components = children.filter(value => {
          return value != null && value !== false && value !== ''
        }).map(value => {
          return value.isB ? value : Baic.$('' + value);
        })
      }
      return Baic.$(properties).process();
    }
  })

  if (typeof define === "function" && define.amd) {
    define("Baic", [], () => {
      return Baic;
    });
  }

  return Baic;
})
console.timeEnd('jsx');