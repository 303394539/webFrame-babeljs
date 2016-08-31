console.time('oop');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("oop requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("oop requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
  'use strict';

  function _extends(obj) {
    var object = function() {
      if (this.__needinit__) {
        this.init.apply(this, arguments)
      }
    }
    this.prototype.__needinit__ = 0;
    var prototype = new this();
    this.prototype.__needinit__ = 1;
    var rtn = (Baic.isFunction(obj) ? obj() : obj) || {};
    rtn.forEach((value, key) => {
      switch (key) {
        case "__superclass__":
        case "__class__":
        case "__needinit__":
          break;
        case "static":
          Baic.extend(object, value)
          break;
        default:
          prototype[key] = value
      }
    })
    Baic.extend(prototype, {
      __superclass__: this,
      __class__: object,
      constructor: object,
      init: prototype.init || Baic.nop
    })
    object.prototype = prototype
    Baic.extend(object, {
      __superclass__: prototype,
      extends: _extends,
      create() {
        this.prototype.__needinit__ = 0;
        var obj = new this();
        this.prototype.__needinit__ = 1;
        obj.init.apply(obj, arguments);
        return obj
      }
    })
    return object
  }

  Array.extends = Object.extends = _extends;

  if (typeof define === "function" && define.amd) {
    define("Baic", [], () => {
      return Baic;
    });
  }

  return Baic;
})
console.timeEnd('oop');