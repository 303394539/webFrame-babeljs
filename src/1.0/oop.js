console.time('oop');;
(() => {
  'use strict';

  function _extends(obj){
    var object = function () {
      if(this.__needinit__){
        this.init.apply(this, arguments)
      }
    }
    this.prototype.__needinit__ = 0;
    var prototype = new this();
    this.prototype.__needinit__ = 1;
    var rtn = (Baic.isFunction(obj) ? obj() : obj) || {};
    rtn.forEach((value, key) => {
      switch(key){
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
      create(){
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

})();
console.timeEnd('oop');