'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

console.time('core');;
(function (global, factory) {

	if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
		module.exports = global.document ? factory(global, true) : function (w) {
			if (!w.document) {
				throw new Error("Baic requires a window with a document");
			}
			return factory(w);
		};
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : undefined, function (window, noGlobal) {

	var document = window.document,
	    OBJECT_PROTOTYPE = Object.prototype,
	    ARRAY_PROTOTYPE = Array.prototype,
	    FUNCTION_PROTOTYPE = Function.prototype,
	    STRING_PROTOTYPE = String.prototype,
	    NUMBER_PROTOTYPE = Number.prototype,
	    EXP_TYPE = /\s([a-z|A-Z]+)/,
	    Baic = function Baic(selector, children) {
		return _init(selector, children);
	};

	function _init(selector, children) {
		if (!selector) {
			return B();
		} else if (selector.isB && Baic.isUndefined(children)) {
			return selector;
		} else if (Baic.isFunction(selector)) {
			Baic.ready(selector);
		} else {
			return B(Baic.getDOMObject(selector, children), selector);
		}
	}

	var B = function B(dom, selector) {
		dom = dom || [];
		dom.__proto__ = B.prototype;
		dom.selector = selector || "";
		return dom;
	};

	Baic.fn = B.prototype = {
		isB: true,
		version: "1.0.0",
		constructor: Baic,
		selector: "",
		length: 0,
		indexOf: ARRAY_PROTOTYPE.indexOf,
		forEach: ARRAY_PROTOTYPE.forEach,
		map: ARRAY_PROTOTYPE.map,
		filter: ARRAY_PROTOTYPE.filter
	};

	Baic.extend = function () {
		var options,
		    name,
		    src,
		    copy,
		    copyIsArray,
		    clone,
		    target = arguments[0] || {},
		    i = 1,
		    length = arguments.length,
		    deep = false;

		if (typeof target === "boolean") {
			deep = target;

			target = arguments[i] || {};
			i++;
		}

		if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object" && !Baic.isFunction(target)) {
			target = {};
		}

		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name];
					copy = options[name];

					if (target === copy) {
						continue;
					}

					if (deep && copy && (Baic.isPlainObject(copy) || (copyIsArray = Baic.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && Baic.isArray(src) ? src : [];
						} else {
							clone = src && Baic.isPlainObject(src) ? src : {};
						}

						target[name] = Baic.extend(deep, clone, copy);
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		return target;
	};

	Baic.extend(OBJECT_PROTOTYPE, {
		forEach: function forEach(fn, scope) {
			if (Baic.isArray(this)) {
				ARRAY_PROTOTYPE.forEach.apply(this, arguments);
			} else {
				for (var key in this) {
					if (Baic.hasOwn(this, key)) {
						fn.call(scope, this[key], key, this);
					}
				}
			}
		},
		map: function map(fn, scope) {
			if (Baic.isArray(this)) {
				return ARRAY_PROTOTYPE.map.apply(this, arguments);
			} else {
				var result = {};
				this.forEach(function (value, key, object) {
					result[key] = fn.call(scope, value, key, object);
				});
				return result;
			}
		},
		toArray: function toArray(begin, end) {
			return ARRAY_PROTOTYPE.slice.call(this, begin, end);
		},
		toStr: function toStr(type) {
			try {
				return Baic.isString(this) ? this : this === true ? "yes" : this === false ? "no" : JSON.stringify(this);
			} catch (e) {
				return this;
			}
		},
		flatten: function flatten() {
			return this.length ? [].concat.apply([], this) : this;
		},
		getGlobalVariable: function getGlobalVariable() {
			var self = this;
			var iframe = document.createElement('iframe');
			iframe.style.display = "none";
			iframe.onload = function () {
				var iframeKeys = Object.keys(iframe.contentWindow);
				var keys = [];
				Object.keys(self).forEach(function (key) {
					if (!(key in iframeKeys)) {
						keys.push(key);
					}
				});
				iframe.remove();
				self.__globalVariable__ = keys;
			};
			iframe.src = 'about:blank';
			document.body.appendChild(iframe);
			return self.__globalVariable__;
		}
	});

	Baic.extend({
		nop: function nop() {},
		hasOwn: function hasOwn(object, property) {
			return OBJECT_PROTOTYPE.hasOwnProperty.call(object, property);
		},
		type: function type(obj) {
			return OBJECT_PROTOTYPE.toString.call(obj).match(EXP_TYPE)[1].toLowerCase();
		},

		isFunction: _checktype("function"),
		isString: _checktype("string"),
		isBoolean: _checktype("boolean"),
		isArray: Array.isArray,
		isNumber: _checktype("number", function (obj) {
			return !isNaN(obj);
		}),
		isNull: _checktype("null"),
		isWindow: function isWindow(obj) {
			return obj != null && obj === obj.window;
		},

		isUndefined: _checktype("undefined"),
		isObject: _checktype("object"),
		isPlainObject: function isPlainObject(obj) {
			if (Baic.type(obj) !== "object" || obj.nodeType || Baic.isWindow(obj)) {
				return false;
			}

			if (obj.constructor && !Baic.hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false;
			}

			return true;
		},
		isJSON: function isJSON(obj) {
			return Baic.isObject(obj) && !obj.length;
		},
		parseJSON: function parseJSON(obj) {
			return JSON.parse(obj + "");
		},
		getWindow: function getWindow(obj) {
			return Baic.isWindow(obj) ? obj : obj.nodeType === 9 && obj.defaultView;
		},
		ready: function ready(callback) {
			if (!Baic.isFunction(callback)) return;
			if (/complete|loaded|interactive/.test(document.readyState) && document.body) callback(Baic);else document.addEventListener('DOMContentLoaded', function () {
				callback(Baic);
			}, false);
		},
		random: function random(min, max) {
			var rand = Math.floor(min + Math.random() * (max - min));
			rand = isNaN(rand) ? function (a, b) {
				!Baic.isUndefined(b) || (b = a, a = 0);
				var c = b - a,
				    e = Math.random();
				return a + e * c | 0;
			}(min || 9999999) : rand;
			return rand;
		}
	});

	function _checktype(type) {
		var args = arguments.toArray(1);
		return function (obj) {
			var bool = true;
			if (args.length) args.forEach(function (item) {
				if (!bool) return;
				if (Baic.isFunction(item)) {
					bool = item(obj);
				} else {
					bool = item;
				}
			});
			return Baic.type(obj) === type && bool;
		};
	}

	Baic.extend(FUNCTION_PROTOTYPE, {
		bind: function bind(scope) {
			var _arguments = arguments;

			var method = this;
			var args = arguments.toArray(1);
			return function () {
				return method.apply(scope, args.concat(_arguments.toArray()));
			};
		},
		defer: function defer() {
			return this._job = setTimeout.apply(null, [this].concat(arguments.toArray()));
		},
		cycle: function cycle() {
			return this._cycle = setInterval.apply(null, [this].concat(arguments.toArray()));
		},
		cancel: function cancel(type) {
			type = type || 1;
			if (this._job && type === 1) {
				clearTimeout(this._job);
			} else if (this._cycle && type === 2) {
				clearInterval(this._cycle);
			}
		}
	});

	Baic.extend(STRING_PROTOTYPE, {
		parseJSON: function parseJSON() {
			return Baic.parseJSON(this);
		},
		firstUpperCase: function firstUpperCase() {
			return this.replace(/\b(\w)|\s(\w)/g, function (m) {
				return m.toUpperCase();
			});
		},
		firstLowerCase: function firstLowerCase() {
			return this.replace(/\b(\w)|\s(\w)/g, function (m) {
				return m.toLowerCase();
			});
		},
		trim: function trim() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
		}
	});

	Baic.extend(Number, {
		add: function add(arg1, arg2) {
			arg1 = arg1 || 0;
			arg2 = arg2 || 0;
			var r1, r2, m, c;
			try {
				r1 = arg1.toString().split(".")[1].length;
			} catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			} catch (e) {
				r2 = 0;
			}
			c = Math.abs(r1 - r2);
			m = Math.pow(10, Math.max(r1, r2));
			if (c > 0) {
				var cm = Math.pow(10, c);
				if (r1 > r2) {
					arg1 = Number(arg1.toString().replace(".", ""));
					arg2 = Number(arg2.toString().replace(".", "")) * cm;
				} else {
					arg1 = Number(arg1.toString().replace(".", "")) * cm;
					arg2 = Number(arg2.toString().replace(".", ""));
				}
			} else {
				arg1 = Number(arg1.toString().replace(".", ""));
				arg2 = Number(arg2.toString().replace(".", ""));
			}
			return (arg1 + arg2) / m;
		},
		sub: function sub(arg1, arg2) {
			arg1 = arg1 || 0;
			arg2 = arg2 || 0;
			var r1, r2, m, n;
			try {
				r1 = arg1.toString().split(".")[1].length;
			} catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			} catch (e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
			n = r1 >= r2 ? r1 : r2;
			return ((arg1 * m - arg2 * m) / m).toFixed(n);
		},
		mul: function mul(arg1, arg2) {
			arg1 = arg1 || 0;
			arg2 = arg2 || 0;
			var m = 0,
			    s1 = arg1.toString(),
			    s2 = arg2.toString();
			try {
				m += s1.split(".")[1].length;
			} catch (e) {}
			try {
				m += s2.split(".")[1].length;
			} catch (e) {}
			return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
		},
		div: function div(arg1, arg2) {
			arg1 = arg1 || 0;
			arg2 = arg2 || 0;
			var t1 = 0,
			    t2 = 0,
			    r1,
			    r2;
			try {
				t1 = arg1.toString().split(".")[1].length;
			} catch (e) {}
			try {
				t2 = arg2.toString().split(".")[1].length;
			} catch (e) {}
			r1 = Number(arg1.toString().replace(".", ""));
			r2 = Number(arg2.toString().replace(".", ""));
			return r1 / r2 * Math.pow(10, t2 - t1);
		}
	});

	Baic.extend(NUMBER_PROTOTYPE, {
		cancel: function cancel(type) {
			type = type || 1;
			if (this) {
				if (type === 1) {
					clearTimeout(this);
				} else if (type === 2) {
					clearInterval(this);
				}
			}
		},
		add: function add(num) {
			return Number.add.call(this, this, num);
		},
		sub: function sub(num) {
			return Number.sub.call(this, this, num);
		},
		mul: function mul(num) {
			return Number.mul.call(this, this, num);
		},
		div: function div(num) {
			return Number.div.call(this, this, num);
		}
	});

	if (typeof define === "function" && define.amd) {
		define("Baic", [], function () {
			return Baic;
		});
	}

	if (typeof noGlobal === "undefined") {
		window.Baic = window.b = Baic;
	}

	if (typeof $ === "undefined") {
		window.$ = Baic;
	}

	return Baic;
});
console.timeEnd('core');console.time('require');;
(function (window, document) {
	'use strict';

	var EXP_READY = /complete|loaded|interactive/,
	    EXP_HTTP = /((^http)|(^https)):\/\/(\w)+.(\w)+/i,
	    EXP_EXT = /(?:\.js|\.css|\.jpg|\.jpeg|\.png|\.gif)$/i,
	    EXP_IMAGE = /(?:\.jpg|\.jpeg|\.png|\.gif)$/i,
	    EXP_CSS = /\.css$/i,
	    EXP_JS = /\.js$/i;

	var scripts = document.getElementsByTagName("script"),
	    script,
	    main,
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
		return new Promise(function (resolve, reject) {
			function _onload(event) {
				if (event.type === "load" || EXP_READY.test(node.readyState)) {
					_removeListener();
					resolve(node);
				}
			}
			function _error() {
				_removeListener();
				reject(url);
			}
			function _removeListener() {
				if (node.removeEventListener) {
					node.removeEventListener("load", _onload, false);
					node.removeEventListener("error", _error, false);
				} else {
					node.detachEvent('onreadystatechange', _onload);
				}
			}
			if (node.addEventListener) {
				node.addEventListener("load", _onload, false);
				node.addEventListener("error", _error, false);
			} else {
				node.attachEvent('onreadystatechange', _onload);
			}
			head.appendChild(node);
		});
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
			return new Promise(function (resolve, reject) {
				image.onload = function () {
					resolve(image);
				};
				image.onerror = function () {
					reject(image);
				};
			});
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
			return _createCss(complete);
		}
		if (EXP_IMAGE.test(url)) {
			return _createImage(complete);
		}
		return Promise.resolve(complete);
	}

	var require = function require() {
		var args = Array.prototype.slice.call(arguments);
		if (args.length > 0 && Array.isArray(args[0])) {
			args = args[0];
		}
		return new Promise(function (resolve) {
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
				setTimeout(_DOMLoaded, 100);
			}
		}).then(function () {
			return Promise.all(args.map(function (item) {
				return item ? _load(item) : Promise.resolve();
			}));
		});
	};

	for (var i = 0; i < len; i++) {
		script = scripts[i];
		baseUrl = script.getAttribute("data-base-url") || baseUrl;
		if (script.hasAttribute("data-require")) {
			main = script.getAttribute("data-require");
			if (main) {
				main.split(';').forEach(function (item) {
					if (item.indexOf(",") < 0) {
						require(item);
					} else {
						item.split(',').forEach(function (item) {
							require(item);
						});
					}
				});
			}
			break;
		}
	};
	require.baseUrl = baseUrl;

	window.require = require;
})(window, document);
console.timeEnd('require');