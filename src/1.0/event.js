console.time('event');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("event requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("event requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
'use strict';

  var _EVENTS_PC = {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    tap: 'click',
    doubletap: 'dblclick',
    orientationchange: 'resize'
  };
  var _HANDLERS = {};

  Baic.extend({
    createEvent(type, options) {
      var event = document.createEvent('Events');
      event.initEvent(_getEventName(type), true, true, null, null, null,
        null, null, null, null, null, null, null, null, null);
      if (options) {
        Baic.extend(true, event, options);
      }
      return event;
    },
    addEventListener(element, eventName, callback, bool) {
      if (element.addEventListener) {
        element.addEventListener(eventName, callback, Baic.isUndefined(bool) ? false : bool);
      } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, callback);
      } else {
        element['on' + eventName] = callback;
      }
    },
    removeEventListener(element, eventName, callback, bool) {
      if (element.removeEventListener) {
        element.removeEventListener(eventName, callback, Baic.isUndefined(bool) ? false : bool);
      } else if (element.detachEvent) {
        element.detachEvent('on' + eventName, callback);
      } else {
        element['on' + eventName] = null;
      }
    }
  });

  Baic.extend(Baic.fn, {
    on(eventName, callback, bool) {
      var event = _getEventName(eventName);
      this.forEach(item => {
        var id = Baic.id(item);
        var elementHandlers = _HANDLERS[id] || (_HANDLERS[id] = []);
        var handler = {
          event: event,
          callback: callback,
          proxy: _createProxyCallback(callback, item),
          index: elementHandlers.length
        };
        elementHandlers.push(handler);

        Baic.addEventListener(item, handler.event, handler.proxy, bool);
      });
      return this;
    },
    off(eventName, callback, bool) {
      var event = _getEventName(eventName);
      this.forEach(item => {
        var id = Baic.id(item);
        (_HANDLERS[id] || []).forEach(handler => {
          if (handler && (!event || handler.event === event) && (!callback || handler.callback === callback)) {
            delete _HANDLERS[id][handler.index];
            Baic.removeEventListener(item, handler.event, handler.proxy, bool);
          }
        });
      });
      return this;
    },
    trigger(event, options, srcEvent) {
      if (Baic.isString(event)) {
        event = Baic.createEvent(event, options);
      }
      if (!Baic.isNull(srcEvent)) {
        event.srcEvent = srcEvent;
      }
      this.forEach(item => {
        item.dispatchEvent(event);
      });
      return this;
    }
  });

  function _getEventName(eventName) {
    eventName = eventName.toLowerCase();
    return (Baic.browser.mobile ? eventName : _EVENTS_PC[eventName]) || eventName;
  }

  function _createProxyCallback(callback, element) {
    return (event => {
      event = event || window.event;
      if (event && !event.target) {
        event.target = event.srcElement;
      }
      if (callback.apply(element, [event].concat(event.data)) === false) {
        event.preventDefault();
      }
    })
  }

  if (typeof define === "function" && define.amd) {
    define("Baic", [], () => {
      return Baic;
    });
  }

  return Baic;
})
console.timeEnd('event');