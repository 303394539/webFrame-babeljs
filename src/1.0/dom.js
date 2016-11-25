console.time('dom');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("dom requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("dom requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
  'use strict';

  var EVENT_PREFIX = /^on[A-Z]/,
    ELEMENT_ID = 1;

  Baic.extend(Baic.fn, {
    html(value) {
      if (Baic.isUndefined(value)) {
        return this[0].innerHTML;
      } else {
        Baic.each(this, item => {
          if (Baic.isString(value) || Baic.isNumber(value)) {
            item.innerHTML = value;
          } else {
            item.innerHTML = null;
            if (Baic.isArray(value)) {
              Baic.each(value, dom => {
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
      if (Baic.isUndefined(value)) {
        return this[0].textContent;
      } else {
        Baic.each(this, item => {
          item.textContent = Baic.toStr(value);
        });
      }
      return this;
    },
    empty() {
      Baic.each(this, item => {
        item.innerHTML = null;
      });
      return this;
    },
    remove() {
      Baic.each(this, item => {
        item.remove();
      })
    },
    attr(name, value) {
      if (Baic.isUndefined(value)) {
        if (Baic.isString(name)) {
          return this[0].getAttribute(name);
        } else if (Baic.isJSON(name)) {
          Baic.each(name, ((v, k) => {
            this.attr(k, v);
          }).bind(this));
        }
      } else {
        Baic.each(this, item => {
          item.setAttribute(name, Baic.toStr(value));
        });
      }
      return this;
    },
    removeAttr(name) {
      Baic.each(this, (item => {
        if (Baic.isArray(name)) {
          Baic.each(name, (value => {
            this.removeAttr(value);
          }).bind(this));
        } else {
          item.removeAttribute(name);
        }
      }).bind(this));
      return this;
    },
    data(name, value) {
      //利用html5特性dataset,大量dom操作dataset性能不太好,限制在10个元素以内
      if (this.length <= 10 && this[0].dataset) {
        if (Baic.isUndefined(value)) {
          return this[0].dataset[name];
        } else {
          Baic.each(this, item => {
            item.dataset[name] = Baic.toStr(value);
          });
          return this;
        }
      } else {
        return this.attr("data-" + name, value);
      }
    },
    removeDate(name) {
      return this.removeAttr("data-" + name);
    },
    val(value) {
      if (Baic.isUndefined(value)) {
        return this[0].value;
      } else {
        Baic.each(this, item => {
          item.value = Baic.toStr(value);
        });
      }
      return this;
    },
    hasClass(name) {
      return _hasClass(this[0], name);
    },
    addClass(name) {
      Baic.each(this, item => {
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
      Baic.each(this, item => {
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
      if (Baic.isUndefined(value)) {
        if (Baic.isJSON(name)) {
          Baic.each(name, ((value, key) => {
            this.css(key, value);
          }).bind(this));
        } else {
          return this[0].style[name] || document.defaultView.getComputedStyle(this[0], '')[name];
        }
      } else {
        Baic.each(this, item => {
          item.style[name] = Baic.toStr(value);
        });
      }
      return this;
    },
    vendor(name, value, oppo) {
      var len = Baic.VENDORS.length,
        newname, newvalue, vendor, result;
      for (var i = 0; i < len; i++) {
        vendor = Baic.VENDORS[i];
        newname = vendor + name;
        if (!Baic.isUndefined(value) && !Baic.isNull(value)) {
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
    width() {
      return this.rect().width;
    },
    height() {
      return this.rect().height;
    },
    offset() {
      var rect = this.rect(),
        dom = this[0],
        doc = dom && dom.ownerDocument;
      if (!doc) return;
      var docElem = doc.documentElement,
        win = Baic.getWindow(doc);
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
      return (Baic.isNumber(index) && index < this.length) ? (this[0].id = Baic.id()) : Baic.map(this, item => {
        return item.id || (item.id = Baic.id());
      });
    }
  });

  function _hasClass(dom, name) {
    return dom.classList ? dom.classList.contains(name) : dom.className.split(/\s+/g).indexOf(name) >= 0;
  }

  function _addElement(mode) {
    return function(value) {
      var method = (item, value) => {
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

      Baic.each(this, item => {
        if (Baic.isString(value) || Baic.isNumber(value)) {
          item.insertAdjacentHTML(mode ? (mode === 2 ? 'beforeBegin' : 'afterBegin') : 'beforeEnd', value);
        } else if (Baic.isArray(value)) {
          Baic.each(value, value => {
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
    var type = Baic.type(elements);

    var vendor = (property, value) => {
      return Baic.map(Baic.VENDORS, item => {
        return item + property + ':' + value
      }).join(';');
    };

    var processB = q => {
      if (parentNode) {
        Baic(parentNode).append(q)
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

    Baic.each(elements, properties => {
      if (properties) {
        if (properties.isB) {
          return processB(properties)
        }

        var element
        if (Baic.isString(properties)) {
          element = document.createTextNode(properties)
        } else {
          element = document.createElement(properties.tag || 'div');
          var styles = [];
          var property, value;
          for (property in properties)
            if (Baic.hasOwn(properties, property)) {
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
                    (Baic.isString(value) ? value : (+value + 'px')));
                  break;

                default:
                  if (EVENT_PREFIX.test(property) && Baic.isFunction(value)) {
                    Baic(element).on(property[2].toLowerCase() + property.slice(3),
                      value);
                  } else if (value != null) {
                    element.setAttribute(property.replace(/[A-Z]/g, obj => {
                      return '-' + obj.toLowerCase();
                    }), Baic.toStr(value));
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
    if (Baic.isString(parentNode)) {
      parentNode = Baic(parentNode)[0];
    } else if (Baic.isArray(parentNode)) {
      parentNode = parentNode[0];
    }
    return Baic(_createElements(elements));
  }

  Baic.extend({
    createElements: _createBaicElements,
    $: _createBaicElements,
    createElementPrepend(obj, parentNode) {
      if (!obj || !parentNode) return null;
      return (parentNode.isB ? parentNode : Baic(parentNode)).createElementPrepend(obj);
    },
    id(element, index) {
      if (element && element.nodeType) {
        return element.id || (element.id = Baic.id());
      } else if (Baic.isArray(element)) {
        return (Baic.isNumber(index) && index < this.length) ? (this[0].id = Baic.id()) : Baic.map(this, item => {
          return item.id || (item.id = Baic.id());
        });
      } else {
        return '__id_' + ELEMENT_ID++;
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
console.timeEnd('dom');