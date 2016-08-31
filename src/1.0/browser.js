console.time('browser');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic, true) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("browser requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("browser requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic, noFrame) => {
'use strict';

  var _userAgent = window.navigator.userAgent.toLowerCase(),
    _msPointerEnabled = !!window.navigator.msPointerEnabled,
    _EXPS = {
      mobile: /iphone|android|windows phone|ipod|ipad|apple.*mobile.*safari/,
      ios: /iphone|ipod|ipad/,
      iphone: /(iphone\sos)\s([\d_]+)/,
      android: /(android)\s+([\d.]+)/,
      ipad: /(ipad).*os\s([\d_]+)/,
      ipod: /(ipod).*os\s([\d_]+)/,
      version: /.*(?:rv|chrome|webkit|version|ie)[\/: ](.+?)([ \\);]|$)/,
      wx: /micromessenger\/([\d\.]+)/
    },
    _match;

  var Browser = {
    touch: (('ontouchstart' in window) || _msPointerEnabled),
    gesture: (('ongesturestart' in window) || _msPointerEnabled),
    ios: _EXPS.ios.test(_userAgent),
    wx: _EXPS.wx.test(_userAgent),
    android: _EXPS.android.test(_userAgent),
    mobile: _EXPS.mobile.test(_userAgent)
  }

  Browser.version = (() => {
    if (Browser.ios) {
      if (_match = _userAgent.match(_EXPS.iphone) || _userAgent.match(_EXPS.ipad) || _userAgent.match(_EXPS.ipod)) {
        return _match[2].replace(/_/g, '.');
      }
    } else if (Browser.android) {
      if (_match = _userAgent.match(_EXPS.android)) {
        return _match[2];
      }
    } else if (Browser.wx) {
      return (_userAgent.match(_EXPS.wx) || [])[1] || "0";
    } else {
      return (_userAgent.match(_EXPS.mobile.test(_userAgent) ? _EXPS.mversion : _EXPS.version) || [])[1] || "";
    }
  })();

  if (typeof define === "function" && define.amd) {
    define("Browser", [], () => {
      return Browser;
    });
  }

  if (typeof noFrame === "undefined") {
    Baic.browser = Browser;
  }

  return Browser;
})
console.timeEnd('browser');