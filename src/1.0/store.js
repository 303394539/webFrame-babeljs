console.time('store');;
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

  var _isValidKey = new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24");

  $.extend({
    storage: {
      set(key, value, expires) {
        if (_isValidKey.test(key)) {
          if ($.isObject(value)) {
            value = "@" + $.toStr(value);
          }
          window.localStorage.setItem(key, value);
          if (expires) {
            if ($.isNumber(expires)) {
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
          if ($.isString(result)) {
            return decodeURIComponent(result);
          }
        }
        return null;
      },
      set(key, value, expires) {
        if (_isValidKey.test(key)) {
          if ($.isNumber(expires)) {
            expires = ";expires=" + new Date(Date.now() + expires * 1000).toGMTString();
          } else {
            expires = "";
          }
          document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent($.toStr(value)) + expires;
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
        $.each((document.cookie.match(/[^ =;]+(?=\=)/g) || []), $.cookie.remove.bind(this));
      }
    }
  });
});
console.timeEnd('store');