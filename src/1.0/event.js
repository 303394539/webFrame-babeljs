console.time('event');;
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

  var _EVENTS_PC = {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    tap: 'click',
    doubletap: 'dblclick',
    orientationchange: 'resize'
  };
  var _HANDLERS = {};

  $.extend({
    createEvent(type, options) {
      var event = document.createEvent('Events');
      event.initEvent(_getEventName(type), true, true, null, null, null,
        null, null, null, null, null, null, null, null, null);
      if (options) {
        $.extend(true, event, options);
      }
      return event;
    },
    addEventListener(element, eventName, callback, bool) {
      if (element.addEventListener) {
        element.addEventListener(eventName, callback, $.isUndefined(bool) ? false : bool);
      } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, callback);
      } else {
        element['on' + eventName] = callback;
      }
    },
    removeEventListener(element, eventName, callback, bool) {
      if (element.removeEventListener) {
        element.removeEventListener(eventName, callback, $.isUndefined(bool) ? false : bool);
      } else if (element.detachEvent) {
        element.detachEvent('on' + eventName, callback);
      } else {
        element['on' + eventName] = null;
      }
    }
  });

  $.extend($.fn, {
    on(eventName, callback, bool) {
      var event = _getEventName(eventName);
      $.each(this, item => {
        var id = $.id(item);
        var elementHandlers = _HANDLERS[id] || (_HANDLERS[id] = []);
        var handler = {
          event: event,
          callback: callback,
          proxy: _createProxyCallback(callback, item),
          index: elementHandlers.length
        };
        elementHandlers.push(handler);

        $.addEventListener(item, handler.event, handler.proxy, bool);
      });
      return this;
    },
    off(eventName, callback, bool) {
      var event = _getEventName(eventName);
      $.each(this, item => {
        var id = $.id(item);
        $.each((_HANDLERS[id] || []), handler => {
          if (handler && (!event || handler.event === event) && (!callback || handler.callback === callback)) {
            delete _HANDLERS[id][handler.index];
            $.removeEventListener(item, handler.event, handler.proxy, bool);
          }
        });
      });
      return this;
    },
    trigger(event, options, srcEvent) {
      if ($.isString(event)) {
        event = $.createEvent(event, options);
      }
      if (!$.isNull(srcEvent)) {
        event.srcEvent = srcEvent;
      }
      $.each(this, item => {
        item.dispatchEvent(event);
      });
      return this;
    }
  });

  function _getEventName(eventName) {
    eventName = eventName.toLowerCase();
    return ($.browser.mobile ? eventName : _EVENTS_PC[eventName]) || eventName;
  }

  function _createProxyCallback(callback, element) {
    return ((event = window.event) => {
      if (event && !event.target) {
        event.target = event.srcElement;
      }
      if (callback.apply(element, [event].concat(event.data)) === false) {
        event.preventDefault();
      }
    })
  }

});
console.timeEnd('event');