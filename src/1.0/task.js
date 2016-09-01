console.time('task');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("task requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("task requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic) => {
  'use strict';

  var asap = (() => {
    // Use the fastest possible means to execute a task in a future turn
    // of the event loop.

    // linked list of tasks (single, with head node)
    var head = {
      task: void 0,
      next: null
    };
    var tail = head;
    var flushing = false;
    var requestFlush = void 0;

    function flush() {
      /* jshint loopfunc: true */

      while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;

        try {
          task();

        } catch (e) {
          setTimeout(function() {
            throw e;
          }, 0);
        }
      }

      flushing = false;
    }

    if (typeof MessageChannel !== "undefined") {
      // modern browsers
      // http://www.nonblocking.io/2011/06/windownexttick.html
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      requestFlush = () => {
        channel.port2.postMessage(0);
      };

    } else {
      // old browsers
      requestFlush = () => {
        setTimeout(flush, 0);
      };
    }

    return task => {
      tail = tail.next = {
        task: task,
        next: null
      };

      if (!flushing) {
        flushing = true;
        requestFlush();
      }
    }
  }).call(this)

  var _Task = asap => {
    this.__asap__ = asap
    return this
  }
  var _index = 0;
  var _queue = {};
  var _queueArgs = {};
  var _async = {};
  var _asyncArgs = {};

  Baic.extend(_Task.prototype, {
    scope(fn) {
      if (this.__asap__) {
        asap(fn)
      } else {
        fn();
      }
    }
  })

  var _runQueue = () => {
    _queue.forEach((fn, key) => {
      var args = _queueArgs[key]
      fn.result = fn.apply(args[0], args.slice(1))
    })
    return new _Task();
  }

  var _runAsync = () => {
    _async.forEach((fn, key) => {
      asap(() => {
        var args = _asyncArgs[key]
        fn.result = fn.apply(args[0], args.slice(1))
      })
    })
    return new _Task(true);
  }

  var _run = () => {
    asap(_runQueue)
    _runAsync()
    return new _Task(true);
  }

  Baic.extend(_Task, {
    run: _run,
    runQueue: _runQueue,
    runAsync: _runAsync,
    clean() {
      asap(() => {
        _index = 0;
        _queue = {};
        _queueArgs = {};
        _async = {};
        _asyncArgs = {};
      })
    },
    inject() {
      var args = arguments.toArray();
      var scope = args[0];
      if (!scope) {
        return {}
      }
      if (scope.__async__) {
        asap(() => {
          _asyncArgs[scope.__taskindex__] = args;
        })
      } else {
        _queueArgs[scope.__taskindex__] = args;
      }
      return scope
    },
    expose() {
      if (DEBUG) {
        console.group('task.js');
        console.log('_index:', _index);
        console.log('_queue:', _queue);
        console.log('_queueArgs:', JSON.stringify(_queueArgs));
        console.log('_async:', _async);
        console.log('_asyncArgs:', JSON.stringify(_asyncArgs));
        console.groupEnd();
      }
    },
    asyncExpose() {
      if (DEBUG) {
        asap(_Task.expose)
      }
    }
  })

  Baic.extend(Function.prototype, {
    queue() {
      var args = arguments.toArray()
      args.unshift(this)
      _queue[_index] = this
      _queueArgs[_index] = args
      this.__taskindex__ = _index
      this.__async__ = false
      _index++;
      return this
    },
    async() {
      var args = arguments.toArray()
      args.unshift(this)
      _async[_index] = this
      _asyncArgs[_index] = args
      this.__taskindex__ = _index
      this.__async__ = true
      _index++;
      return this
    },
    inject() {
      return _Task.inject.apply(this, [this].concat(arguments.toArray()))
    }
  })

  Baic.extend({
    task: _Task,
    runAsyncTask: _runAsync,
    runQueueTask: _runQueue,
    runTask: _run,
    cleanTask() {
      _Task.clean();
    }
  })

  if (typeof define === "function" && define.amd) {
    define("Baic", [], () => {
      return Baic;
    });
  }

  return Baic;
})
console.timeEnd('task');