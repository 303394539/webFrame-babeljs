console.time('store');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("store requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("store requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
  'use strict';

  var _isValidKey = new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24");

  Baic.extend({
    storage: {
      set(key, value, expires) {
        if (_isValidKey.test(key)) {
          if (Baic.isObject(value)) {
            value = "@" + value.toStr();
          }
          window.localStorage.setItem(key, value);
          if (expires) {
            if (Baic.isNumber(expires)) {
              expires = date.setTime(Date.now() + expires);
            }
            window.localStorage.setItem(key + ".expires", expires);
          }
        }
      },
      get(key) {
        var result = null;
        if (_isValidKey.test(key)) {
          result = window.localStorage.getItem(key);
          if (result) {
            if (result.indexOf("@") === 0) {
              result = result.slice(1).parseJSON();
            }
            var expires = parseInt(window.localStorage.getItem(key + ".expires"));
            expires = expires ? new Date(expires).getTime() : null;
            if (result && expires && expires < Date.now()) {
              result = null;
              window.localStorage.removeItem(key);
              window.localStorage.removeItem(key + ".expires");
            }
          }
        }
        return result;
      },
      remove(key) {
        if (_isValidKey.test(key)) {
          window.localStorage.removeItem(key);
          window.localStorage.removeItem(key + ".expires");
        }
      },
      clearAll() {
        window.localStorage.clear();
      }
    },
    cookie: {
      get(key) {
        var result = null;
        if (_isValidKey.test(key)) {
          result = new RegExp("(^| )" + key + "=([^;\/]*)([^;\x24]*)(;|\x24)").exec(document.cookie);
          if (result) {
            result = result[2] || null;
          }
          if (Baic.isString(result)) {
            return decodeURIComponent(result);
          }
        }
        return null;
      },
      set(key, value, expires) {
        if (_isValidKey.test(key)) {
          if (Baic.isNumber(expires)) {
            expires = ";expires=" + new Date(Date.now() + expires * 1000).toGMTString();
          } else {
            expires = "";
          }
          document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value.toStr()) + expires;
        }
      },
      remove(key) {
        if (_isValidKey.test(key)) {
          var obj = this.get(key);
          if (obj != null) {
            this.set(key, "", -1);
          }
        }
      },
      clearAll() {
        (document.cookie.match(/[^ =;]+(?=\=)/g) || []).forEach(Baic.cookie.remove.bind(this));
      }
    }
  });

  if (typeof define === "function" && define.amd) {
    define("Baic", [], () => {
      return Baic;
    });
  }

  return Baic;
})
console.timeEnd('store');