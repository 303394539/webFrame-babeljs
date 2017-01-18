console.time('require');;
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

  var EXP_READY = /complete|loaded|interactive/,
    EXP_HTTP = /((^http)|(^https)):\/\/(\w)+.(\w)+/i,
    EXP_EXT = /(?:\.js|\.css|\.jpg|\.jpeg|\.png|\.gif)$/i,
    EXP_IMAGE = /(?:\.jpg|\.jpeg|\.png|\.gif)$/i,
    EXP_CSS = /\.css$/i,
    EXP_JS = /\.js$/i;

  var scripts = document.getElementsByTagName("script"),
    script, main,
    head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,
    len = scripts.length,
    isReady = EXP_READY.test(document.readyState),
    baseUrl = _getScriptAbsPath();

  function _getScriptAbsPath() {
    var url = "";
    try {
      url = document.currentScript.src;
    } catch (e) {
      url = /(?:http|https|file):\/\/.*?\/.+?.js/.exec(e.stack || e.sourceURL || e.stacktrace)[0] || "";
    }
    return url.substring(0, url.lastIndexOf('/') + 1);
  }

  function _getUrl(url) {
    if (!EXP_HTTP.test(url)) {
      url = baseUrl + url;
    }
    if (!EXP_EXT.test(url) && url.indexOf("?") < 0) {
      url += '.js';
    }
    return url;
  }

  function _createJs(url) {
    var node = document.createElement("script");
    node.src = url;
    return new Promise((resolve, reject) => {
      function _onload(event) {
        if (event.type === "load" || EXP_READY.test(node.readyState)) {
          _removeListener();
          resolve(node)
        }
      }

      function _error() {
        _removeListener();
        reject(url)
      }

      function _removeListener() {
        if (node.removeEventListener) {
          node.removeEventListener("load", _onload, false);
          node.removeEventListener("error", _error, false)
        } else {
          node.detachEvent('onreadystatechange', _onload)
        }
      }
      if (node.addEventListener) {
        node.addEventListener("load", _onload, false);
        node.addEventListener("error", _error, false)
      } else {
        node.attachEvent('onreadystatechange', _onload);
      }
      head.appendChild(node);
    })
  }

  function _createCss(url) {
    var node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = url;
    head.appendChild(node);
    return Promise.resolve(node);
  }

  function _createImage(url) {
    var image = new Image();
    image.src = url;
    if (image.complete) {
      return Promise.resolve(image);
    } else {
      return new Promise((resolve, reject) => {
        image.onload = () => {
          resolve(image)
        }
        image.onerror = () => {
          reject(image)
        }
      })
    }
  }

  function _load(url) {
    var complete = _getUrl(url);
    var index = complete.indexOf("?");
    if (index >= 0) {
      url = complete.substring(0, index);
    } else {
      url = complete;
    }
    if (EXP_JS.test(url)) {
      return _createJs(complete);
    }
    if (EXP_CSS.test(url)) {
      return _createCss(complete)
    }
    if (EXP_IMAGE.test(url)) {
      return _createImage(complete)
    }
    return Promise.resolve(complete)
  }

  var Require = function(arr) {
    if(!$.isArray(arr)){
      arr = [arr];
    }
    return new Promise(resolve => {
      function _DOMLoaded() {
        if (document.addEventListener) {
          document.removeEventListener('DOMContentLoaded', _DOMLoaded, false);
        } else if (isReady) {
          document.detachEvent('onreadystatechange', _DOMLoaded);
        } else {
          return;
        }
        isReady = true;
        resolve();
      }
      if (!isReady) {
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', _DOMLoaded, false);
          window.addEventListener('load', _DOMLoaded, false);
        } else {
          document.attachEvent('onreadystatechange', _DOMLoaded);
          window.attachEvent('onload', _DOMLoaded);
        }
      } else {
        setTimeout(_DOMLoaded, 100)
      }
    }).then(() => {
      return Promise.all($.map(arr, item => {
        return item ? _load(item) : Promise.resolve();
      }))
    });
  }


  for (var i = 0; i < len; i++) {
    script = scripts[i];
    baseUrl = script.getAttribute("data-base-url") || baseUrl;
    if (script.hasAttribute("data-require")) {
      main = script.getAttribute("data-require");
      if (main) {
        $.each(main.split(';'), item => {
          if (item.indexOf(",") < 0) {
            Require(item)
          } else {
            $.each(item.split(','), item => {
              Require(item)
            })
          }
        })
      }
      break;
    }
  };
  $.extend(Require, {
    baseUrl: baseUrl
  })

  window.require = $.require = Require;

});
console.timeEnd('require');