console.time('animation');;
(() => {
  'use strict';

  var _VENDORS = [];
  Baic.VENDORS.forEach(item => {
    _VENDORS.unshift(item.replace(/-/g, ""));
  });

  window.requestAnimationFrame = ((index, fn) => {
    while (index-- && !(fn = window[(_VENDORS[index] + "RequestAnimationFrame").firstLowerCase()]));
    return fn || (callback => {
      setTimeout(callback, 15);
    })
  })(_VENDORS.length);

  window.cancelAnimationFrame = ((index, fn) => {
    while (index-- &&
      !(fn = window[(_VENDORS[index] + "CancelAnimationFrame").firstLowerCase()] ||
        window[(_VENDORS[index] + "CancelRequestAnimationFrame").firstLowerCase()]));
    return fn || clearTimeout;
  })(_VENDORS.length);

  Baic.extend({
    easing: {
      linear(n) {
        return n;
      },
      //由慢到快
      cubicIn(n) {
        return Math.pow(n, 3);
      },
      //由快到慢
      cubicOut(n) {
        return Math.pow(n - 1, 3) + 1;
      },
      //球体跳动运动轨道
      easeOutBounce(n) {
        if (n < (1 / 2.75)) {
          return (7.5625 * n * n);
        } else if (n < (2 / 2.75)) {
          return (7.5625 * (n -= (1.5 / 2.75)) * n + 0.75);
        } else if (n < (2.5 / 2.75)) {
          return (7.5625 * (n -= (2.25 / 2.75)) * n + 0.9375);
        } else {
          return (7.5625 * (n -= (2.625 / 2.75)) * n + 0.984375);
        }
      },
      //由快到匀速到快
      quadInOut(n) {
        n = n * 2;
        if (n < 1) {
          return Math.pow(n, 2) / 2;
        }
        return -1 * ((--n) * (n - 2) - 1) / 2;
      }
    },
    Animator(options) {
      return new _Animator(options);
    }
  });

  var _Animator = options => {
    Baic.extend(_Animator.prototype, options);
  }

  Baic.extend(_Animator.prototype, {
    duration: 350,
    startValue: 0,
    endValue: 1,
    reversed: false,
    easing: Baic.easing.linear,
    onStep: Baic.nop,
    onStop: Baic.nop,
    onEnd: Baic.nop,
    start() {
      _cancel(this);

      this.starttime = this.frametime = Date.now();
      this.value = this.startValue;

      this._Animation = window.requestAnimationFrame(_next.bind(this));
    },
    stop() {
      _cancel(this);
      this.onStop();
    }
  });

  function _cancel(obj) {
    window.cancelAnimationFrame(obj._Animation);
    obj._Animation = null;
  }

  function _next() {
    this.frametime = Date.now();
    this.dt = this.frametime - this.starttime;

    var num = _easing(this.starttime, this.duration, this.easing, this.reversed);
    if (num >= 1 || this.dt >= this.duration) {
      this.value = this.endValue;
      _cancel(this);
      this.onStep();
      this.onEnd();
    } else {
      this._Animation = window.requestAnimationFrame(_next.bind(this));
      this.value = this.startValue + num * (this.endValue - this.startValue);
      this.onStep();
    }
  }

  function _easing(starttime, duration, easing, reversed) {
    var frame = (Date.now() - starttime) / duration;
    if (reversed) {
      return frame >= 1 ? 0 : (1 - easing(1 - frame));
    } else {
      return frame >= 1 ? 1 : easing(frame);
    }
  }

})();
console.timeEnd('animation');