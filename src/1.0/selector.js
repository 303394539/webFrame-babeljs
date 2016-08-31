console.time('selector');;
(() => {
  'use strict';
  var // http://www.w3.org/TR/css3-syntax/#characters
    IS_HTML_FRAGMENT = /^\s*<(\w+|!)[^>]*>/,
    CLASS_SELECTOR = /^\.([\w-]+)$/,
    ID_SELECTOR = /^#[\w\d-]+$/,
    TAG_SELECTOR = /^[\w-]+$/,
    EVENT_PREFIX = /^on[A-Z]/,
    TMP_CONTAINER = document.createElement("div");

  Baic.extend({
    getDOMObject(selector, children) {
      var elementTypes = [1, 9, 11];
      if (Baic.isArray(selector)) {
        return selector.filter(item => {
          return item != null;
        });
      } else if (Baic.isString(selector)) {
        selector = selector.trim();
        if (IS_HTML_FRAGMENT.test(selector)) {
          TMP_CONTAINER.innerHTML = "" + selector;
          var tmp_container = Baic(TMP_CONTAINER);
          var nodes = tmp_container.children().toArray();
          tmp_container.empty();
          return nodes;
        } else {
          var dom = Baic.selector(document, selector);
          if (children && Baic.isString(children)) {
            if (dom.length === 1) {
              dom = Baic.selector(dom[0], children);
            } else {
              dom = dom.map(item => {
                return Baic.selector(item, children);
              });
            }
          }
          return dom;
        }
      } else if (elementTypes.indexOf(selector.nodeType) >= 0 || Baic.isWindow(selector)) {
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

      return elements.nodeType ? [elements] : elements.toArray();
    }
  });

  Baic.extend(Baic.fn, {
    find(selector) {
      return Baic(this.map(item => {
        return Baic.selector(item, selector);
      }).flatten());
    },
    parent(selector) {
      if (!selector) {
        return Baic(this.map(item => {
          return item.parentNode;
        }));
      } else {
        var ancestors = [];
        return Baic(this.map(item => {
          if (item && (item = item.parentNode) && item !== document && ancestors.indexOf(item) < 0 && ancestors.push(item) && _filtered(item, selector)) {
            return item;
          }
        }));
      }
    },
    siblings(selector) {
      var siblings = [];
      return Baic(this.map(item => {
        return item.parentNode.children.toArray().filter(child => {
          return (siblings.indexOf(child) < 0 && siblings.push(child)) && (child !== item && _filtered(item, selector));
        });
      }).flatten());
    },
    children(selector) {
      return Baic(this.map(item => {
        return item.children.toArray().filter(child => {
          return _filtered(child, selector);
        });
      }).flatten());
    },
    first() {
      return Baic(this[0]);
    },
    last() {
      return Baic(this[this.length - 1]);
    }
  });

  function _filtered(dom, selector) {
    return selector ? (dom.parentNode && Baic.selector(dom.parentNode, selector).indexOf(dom) >= 0) : true;
  }

})();
console.timeEnd('selector');