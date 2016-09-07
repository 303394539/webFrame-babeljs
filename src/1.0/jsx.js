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
      var eventName = this.attr('v-link-event');
      var link = this.attr("v-link");
      var replace = (this.attr("v-link-replace") || "").boolean();
      this.removeAttr("v-link")
      this.removeAttr("v-link-replace")
      this.removeAttr("v-link-event")
      if (link) {
        this.attr('tap-highlight', 'yes')
        var prefix = link.charAt(0);
        this.on(eventName || "singleTap", event => {
          event.stopPropagation()
          if (prefix === "*") {
            var args = link.substring(1).split(/\s+/).map(a => {
              return Baic.url.decode(a)
            })
            var name = args.shift()
            window[name].apply(window, [event].concat(args))
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
        $(child).process();
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
        properties.components = children.filter(function(value) {
          return value != null && value !== false && value !== ''
        }).map(function(value) {
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