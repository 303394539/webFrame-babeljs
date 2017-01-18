console.time('dom');;
((factory) => {

  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["Baic"], factory);
  } else {

    // Browser globals
    factory(window.document, Baic);
  }

})((document, $) => {
  'use strict';

  var EVENT_PREFIX = /^on[A-Z]/,
    ELEMENT_ID = 1;

  $.extend($.fn, {
    html(value) {
      if ($.isUndefined(value)) {
        return this[0].innerHTML;
      } else {
        $.each(this, item => {
          if ($.isString(value) || $.isNumber(value)) {
            item.innerHTML = value;
          } else {
            item.innerHTML = null;
            if ($.isArray(value)) {
              $.each(value, dom => {
                if (dom.nodeType) {
                  item.appendChild(dom);
                } else {
                  item.innerHTML = dom;
                }
              });
            } else {
              if (value.nodeType) item.appendChild(value);
            }
          }
        });
      }
      return this;
    },
    text(value) {
      if ($.isUndefined(value)) {
        return this[0].textContent;
      } else {
        $.each(this, item => {
          item.textContent = $.toStr(value);
        });
      }
      return this;
    },
    empty() {
      $.each(this, item => {
        item.innerHTML = null;
      });
      return this;
    },
    remove() {
      $.each(this, item => {
        item.remove();
      })
    },
    attr(name, value) {
      if ($.isUndefined(value)) {
        if ($.isString(name)) {
          return this[0].getAttribute(name);
        } else if ($.isJSON(name)) {
          $.each(name, function(v, k) {
            this.attr(k, v);
          }.bind(this));
        }
      } else {
        $.each(this, item => {
          item.setAttribute(name, $.toStr(value));
        });
      }
      return this;
    },
    removeAttr(name) {
      $.each(this, function(item) {
        if ($.isArray(name)) {
          $.each(name, function(value) {
            this.removeAttr(value);
          }.bind(this));
        } else {
          item.removeAttribute(name);
        }
      }.bind(this));
      return this;
    },
    data(name, value) {
      var element = this[0];
      //利用html5特性dataset,大量dom操作dataset性能不太好,限制在10个元素以内
      if ($.isUndefined(name)) {
        var result = {};
        $.each(element.attributes, function(attr) {
          if (attr.name.indexOf('data-') == 0) {
            result[attr.name.slice(5)] = attr.value
          }
        })
        return result;
      }
      if (this.length <= 10 && this[0].dataset) {
        if ($.isUndefined(value)) {
          return this[0].dataset[name];
        } else {
          $.each(this, item => {
            item.dataset[name] = $.toStr(value);
          });
          return this;
        }
      } else {
        return this.attr("data-" + name, value);
      }
    },
    removeData(name) {
      return this.removeAttr("data-" + name);
    },
    val(value) {
      if ($.isUndefined(value)) {
        return this[0].value;
      } else {
        $.each(this, item => {
          item.value = $.toStr(value);
        });
      }
      return this;
    },
    hasClass(name) {
      return _hasClass(this[0], name);
    },
    addClass(name) {
      $.each(this, item => {
        if (!_hasClass(item, name)) {
          if (item.classList) {
            item.classList.add(name);
          } else {
            item.className = (item.className + " " + name).trim();
          }
        }
      });
      return this;
    },
    removeClass(name) {
      $.each(this, item => {
        if (name == item.className) {
          item.className = "";
        } else {
          name = name.trim();
          if (_hasClass(item, name)) {
            if (item.classList) {
              item.classList.remove(name);
            } else {
              item.className = item.className.replace(new RegExp('^' + [name, name, name].join(' | ') + '$', 'g'), " ")
                .replace(/\s+/g, " ").trim();
            }
          }
        }
      });
      return this;
    },
    css(name, value) {
      if ($.isUndefined(value)) {
        if ($.isJSON(name)) {
          $.each(name, function(value, key) {
            this.css(key, value);
          }.bind(this));
        } else {
          return this[0].style[name] || document.defaultView.getComputedStyle(this[0], '')[name];
        }
      } else {
        $.each(this, item => {
          item.style[name] = $.toStr(value);
        });
      }
      return this;
    },
    vendor(name, value, oppo) {
      var len = $.VENDORS.length,
        newname, newvalue, vendor, result;
      for (var i = 0; i < len; i++) {
        vendor = $.VENDORS[i];
        newname = vendor + name;
        if (!$.isUndefined(value) && !$.isNull(value)) {
          if (!oppo) {
            this.css(newname, value);
          } else {
            newvalue = vendor + value;
            this.css(name, newvalue);
          }
        } else if ((result = this.css(newname))) {
          return result;
        }
      };
      return this;
    },
    rect() {
      return this[0].getBoundingClientRect();
    },
    width(value) {
      var element = this[0];
      if ($.isUndefined(value)) {
        if ($.isWindow(element)) {
          return this[0].document.documentElement.clientWidth;
        }
        if (element.nodeType == 9) {
          var doc = element.documentElement;
          return Math.max(
            element.body.scrollWidth, doc.scrollWidth,
            element.body.offsetWidth, doc.offsetWidth,
            doc.clientWidth
          );
        }
        return this.rect().width;
      } else {
        this.css('width', value);
      }
      return this;
    },
    height(value) {
      var element = this[0];
      if ($.isUndefined(value)) {
        if ($.isWindow(element)) {
          return this[0].document.documentElement.clientHeight;
        }
        if ($.isDocument(element)) {
          var doc = element.documentElement;
          return Math.max(
            element.body.scrollHeight, doc.scrollHeight,
            element.body.offsetHeight, doc.offsetHeight,
            doc.clientHeight
          );
        }
        return this.rect().height;
      } else {
        this.css('height', value);
      }
      return this;
    },
    offset() {
      var element = this[0]
      if ($.isWindow(element) || $.isDocument(element)) {
        return {
          left: 0,
          top: 0,
          width: this.width(),
          height: this.height()
        }
      }
      var rect = this.rect(),
        doc = element && element.ownerDocument;
      if (!doc) return;
      var docElem = doc.documentElement,
        win = $.getWindow(doc);
      return {
        left: rect.left + win.pageXOffset - docElem.clientLeft,
        top: rect.top + win.pageYOffset - docElem.clientTop,
        width: rect.width,
        height: rect.height
      }
    },
    append: _addElement(0),
    prepend: _addElement(1),
    replaceWith: _addElement(2),
    createElement(obj) {
      if (!obj) return null;
      this.append(_createElements(obj));
      return this;
    },
    createElementPrepend(obj) {
      if (!obj) return null;
      this.prepend(_createElements(obj));
      return this;
    },
    id(index) {
      return ($.isNumber(index) && index < this.length) ? (this[0].id = $.id()) : $.map(this, item => {
        return item.id || (item.id = $.id());
      });
    }
  });

  function _hasClass(dom, name) {
    return dom.classList ? dom.classList.contains(name) : dom.className.split(/\s+/g).indexOf(name) >= 0;
  }

  function _addElement(mode) {
    return function(value) {
      var method = function(item, value) {
        switch (mode) {
          case 0:
            item.appendChild(value);
            break;
          case 1:
            item.insertBefore(value, item.firstChild);
            break;
          case 2:
            item.parentNode.insertBefore(value, item);
            break;
        }
      }

      $.each(this, item => {
        if ($.isString(value) || $.isNumber(value)) {
          item.insertAdjacentHTML(mode ? (mode === 2 ? 'beforeBegin' : 'afterBegin') : 'beforeEnd', value);
        } else if ($.isArray(value)) {
          $.each(value, value => {
            method(item, value);
          });
        } else {
          method(item, value);
        }
      });

      if (mode === 2) {
        this.remove();
      }
    };
  }

  function _createElements(elements, parentNode) {
    var nodes = [];
    var type = $.type(elements);

    var vendor = (property, value) => {
      return $.map($.VENDORS, item => {
        return item + property + ':' + value
      }).join(';');
    };

    var processB = q => {
      if (parentNode) {
        $(parentNode).append(q)
      }
      return q;
    }

    if (elements.isB) {
      return processB(elements);
    }

    if (type == 'object' || type == 'string') {
      elements = [elements];
    } else if (type !== 'array') {
      return nodes;
    }

    $.each(elements, properties => {
      if (properties) {
        if (properties.isB) {
          return processB(properties)
        }

        var element
        if ($.isString(properties)) {
          element = document.createTextNode(properties)
        } else {
          element = document.createElement(properties.tag || 'div');
          var styles = [];
          var property, value;
          for (property in properties)
            if ($.hasOwn(properties, property)) {
              value = properties[property];
              switch (property) {
                case 'tag':
                case 'components':
                  // ignore properties
                  break;

                case 'style':
                  styles.push(value);
                  break;

                case 'flex':
                  styles.push(vendor('box-flex', value));
                  break;

                case 'text':
                  element.textContent = value;
                  break;

                case 'html':
                  element.innerHTML = value;
                  break;

                case 'classes':
                case 'className':
                  element.className = value;
                  break;

                case 'showing':
                  styles.push('display:' + (value ? 'block' : 'none'));
                  break;

                case 'width':
                case 'height':
                case 'top':
                case 'bottom':
                case 'left':
                case 'right':
                  styles.push(property + ':' +
                    ($.isString(value) ? value : (+value + 'px')));
                  break;

                default:
                  if (EVENT_PREFIX.test(property) && $.isFunction(value)) {
                    $(element).on(property[2].toLowerCase() + property.slice(3),
                      value);
                  } else if (value != null) {
                    element.setAttribute(property.replace(/[A-Z]/g, obj => {
                      return '-' + obj.toLowerCase();
                    }), $.toStr(value));
                  }
              }
            }

          if (properties.components) {
            _createElements(properties.components, element);
          }

          if (styles.length) {
            element.style.cssText = styles.join(';');
          }
        }

        if (parentNode) {
          parentNode.appendChild(element);
        }

        nodes.push(element);
      }
    });

    return nodes;
  }

  function _createBaicElements(elements, parentNode) {
    if ($.isString(parentNode)) {
      parentNode = $(parentNode)[0];
    } else if ($.isArray(parentNode)) {
      parentNode = parentNode[0];
    }
    return $(_createElements(elements, parentNode));
  }

  $.extend({
    createElements: _createBaicElements,
    $: _createBaicElements,
    createElementPrepend(obj, parentNode) {
      if (!obj || !parentNode) return null;
      return (parentNode.isB ? parentNode : $(parentNode)).createElementPrepend(obj);
    },
    id(element, index) {
      if (element && element.nodeType) {
        return element.id || (element.id = $.id());
      } else if ($.isArray(element)) {
        return ($.isNumber(index) && index < this.length) ? (this[0].id = $.id()) : $.map(this, item => {
          return item.id || (item.id = $.id());
        });
      } else {
        return '__id_' + ELEMENT_ID++;
      }
    }
  });
});
console.timeEnd('dom');