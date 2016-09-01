console.time('url');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic, true) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("url requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("url requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic, noFrame) => {
  'use strict';

  var Url = {
    encode(str) {
      return encodeURIComponent(str);
    },
    decode(str) {
      return /%u[0-9a-f]{4}/i.test(str) ? unescape(str) : decodeURIComponent(str);
    },
    build(query = {}, url = location.href) {
      return url + Url.query(query, url.endsWith("?") ? "" : (url.indexOf("?") ? "&" : "?"));
    },
    query(obj, prefix = "") {
      if (Baic.isJSON(obj)) {
        var serialize = prefix;
        var key;
        for (key in obj) {
          if (!Baic.isUndefined(key) && Baic.hasOwn(obj, key)) {
            if (serialize !== prefix) {
              serialize += '&'
            }
            serialize += key + '=' + Url.encode(obj[key]);
          }
        }
        return (serialize === prefix ? '' : serialize);
      } else {
        var query = {};
        var isUrl = /^(https?\:\/\/|\.\/|\.\.\/)/i.test(obj);
        var search = location.search.slice(1);
        (isUrl ? obj.split('?')[1] : search).split('&').forEach(function(item) {
          var parts = item.split('=');
          if (parts[0]) query[parts[0]] = Url.decode(parts[1]);
        });
        return (obj ? (isUrl ? query : query[obj]) : query);
      }
    }
  }

  if (typeof define === "function" && define.amd) {
    define("Url", [], () => {
      return Url;
    });
  }

  if (typeof noFrame === "undefined") {
    Baic.url = Url;
  }

  return Url;
})
console.timeEnd('url');