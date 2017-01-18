console.time('url');;
((factory) => {

  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["Baic"], factory);
  } else {

    // Browser globals
    factory(window, Baic);
  }

})((window, $) => {
  'use strict';

  var Url = {
    encode(str) {
      return encodeURIComponent(str);
    },
    decode(str) {
      return /%u[0-9a-f]{4}/i.test(str) ? unescape(str) : decodeURIComponent(str);
    },
    build(query = {}, url = location.href) {
      return url + Url.query(query, url.indexOf("?") >= 0 ? "&" : "?");
    },
    query(obj, prefix = "") {
      if ($.isJSON(obj)) {
        var serialize = prefix;
        var key;
        for (key in obj) {
          if (!$.isUndefined(key) && $.hasOwn(obj, key)) {
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
        var parts, part;
        $.each((isUrl ? obj.split('?')[1] : search).split('&'), item => {
          parts = item.split('=');
          if (parts[0]) {
            part = Url.decode(parts[1]);
            query[parts[0]] = part.isJSONString() ? part.parseJSON() : part;
          };
        });
        return (obj ? (isUrl ? query : query[obj]) : query);
      }
    }
  }

  $.url = Url;

});
console.timeEnd('url');