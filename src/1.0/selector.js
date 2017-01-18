console.time('selector');;
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

  var // http://www.w3.org/TR/css3-syntax/#characters
    IS_HTML_FRAGMENT = /^\s*<(\w+|!)[^>]*>/,
    CLASS_SELECTOR = /^\.([\w-]+)$/,
    ID_SELECTOR = /^#[\w\d-]+$/,
    TAG_SELECTOR = /^[\w-]+$/,
    EVENT_PREFIX = /^on[A-Z]/,
    TMP_CONTAINER = document.createElement("div");

  $.extend({
    getDOMObject(selector, children) {
      var elementTypes = [1, 9, 11];
      if ($.isArray(selector)) {
        return selector.filter(item => {
          return item != null;
        });
      } else if ($.isString(selector)) {
        selector = selector.trim();
        if (IS_HTML_FRAGMENT.test(selector)) {
          TMP_CONTAINER.innerHTML = "" + selector;
          var tmp_container = $(TMP_CONTAINER);
          var nodes = $.toArray(tmp_container.children());
          tmp_container.empty();
          return nodes;
        } else {
          var dom = $.selector(document, selector);
          if (children && $.isString(children)) {
            if (dom.length === 1) {
              dom = $.selector(dom[0], children);
            } else {
              dom = $.map(dom, item => {
                return $.selector(item, children);
              });
            }
          }
          return dom;
        }
      } else if (elementTypes.indexOf(selector.nodeType) >= 0 || $.isWindow(selector)) {
        return [selector];
      }
    },
    selector(dom, selector) {
      var elements = [];
      if (CLASS_SELECTOR.test(selector)) {
        elements = dom.getElementsByClassName(selector.substring(1));
      } else if (TAG_SELECTOR.test(selector)) {
        elements = dom.getElementsByTagName(selector);
      } else if (ID_SELECTOR.test(selector)) {
        elements = dom.getElementById(selector.substring(1));
        if (!elements) elements = [];
      } else {
        elements = dom.querySelectorAll(selector);
      }

      return elements.nodeType ? [elements] : $.toArray(elements);
    }
  });

  $.extend($.fn, {
    find(selector) {
      return $.flatten($.map(this, item => {
        return $.selector(item, selector);
      }));
    },
    parent(selector) {
      if (!selector) {
        return $($.map(this, item => {
          return item.parentNode;
        }));
      } else {
        var ancestors = [];
        return $($.map(this, item => {
          if (item && (item = item.parentNode) && item !== document && ancestors.indexOf(item) < 0 && ancestors.push(item) && _filtered(item, selector)) {
            return item;
          }
        }));
      }
    },
    siblings(selector) {
      var siblings = [];
      return $.flatten($($.map(this, item => {
        return $.toArray(item.parentNode.children).filter(child => {
          return (siblings.indexOf(child) < 0 && siblings.push(child)) && (child !== item && _filtered(item, selector));
        });
      })));
    },
    children(selector) {
      return $.flatten($($.map(this, item => {
        return $.toArray(item.children).filter(child => {
          return _filtered(child, selector);
        });
      })));
    },
    first() {
      return $(this[0]);
    },
    last() {
      return $(this[this.length - 1]);
    }
  });

  function _filtered(dom, selector) {
    return selector ? (dom.parentNode && $.selector(dom.parentNode, selector).indexOf(dom) >= 0) : true;
  }

});
console.timeEnd('selector');