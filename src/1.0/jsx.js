console.time('jsx');;
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

  $.extend({
    jsx(type, properties, children) {
      properties = properties || {};
      if ($.isString(type)) {
        properties.tag = type
      } else if (type.tag) {
        properties.tag = type.tag
      }
      if (arguments.length > 2) {
        children = $.toArray(arguments).slice(2)
        if (children[0] && !children[0].isB) {
          properties.html = children[0]
          children.shift()
        }
        properties.components = $.map(children.filter(value => {
          return value != null && value !== false && value !== ''
        }), value => {
          return value.isB ? value : $.$('' + value);
        })
      }
      return $.$(properties).process();
    }
  })

});
console.timeEnd('jsx');