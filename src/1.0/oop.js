console.time('oop');;
((factory) => {

  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["Baic"], factory);
  } else {

    // Browser globals
    factory(Baic);
  }

})($ => {
  'use strict';

  function _extends(obj) {
    var object = function() {
      if (this.__needinit__) {
        this.init.apply(this, arguments)
      }
    }
    var prototype = new this();
    prototype.__needinit__ = 1;
    var rtn = ($.isFunction(obj) ? obj(Baic) : obj) || {};
    $.each(rtn, (value, key) => {
      switch (key) {
        case "__superclass__":
        case "__class__":
        case "__needinit__":
          break;
        case "static":
          $.extend(object, value)
          break;
        default:
          prototype[key] = value
      }
    })
    $.extend(prototype, {
      __superclass__: this,
      __class__: object,
      constructor: object,
      init: prototype.init || $.nop
    })
    object.prototype = prototype
    $.extend(object, {
      __superclass__: prototype,
      extends: _extends,
      create() {
        var obj = new this();
        obj.__needinit__ = 1;
        obj.init.apply(obj, arguments);
        return obj
      }
    })
    return object
  }

  Array.extends = Object.extends = _extends;
});
console.timeEnd('oop');