console.time('core');;
(((global, factory) => {

	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = global.document ?
			factory(global, true) :
			(w => {
				if (!w.document) {
					throw new Error("Baic requires a window with a document");
				}
				return factory(w);
			});
	} else {
		factory(global);
	}

})(typeof window !== "undefined" ? window : this, (window, noGlobal) => {
	'use strict';

	var document = window.document,
		OBJECT_PROTOTYPE = Object.prototype,
		ARRAY_PROTOTYPE = Array.prototype,
		FUNCTION_PROTOTYPE = Function.prototype,
		STRING_PROTOTYPE = String.prototype,
		NUMBER_PROTOTYPE = Number.prototype,
		EXP_TYPE = /\s([a-z|A-Z]+)/,
		Baic = (selector, children) => {
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

	var B = (dom, selector) => {
		dom = dom || [];
		dom.__proto__ = B.prototype;
		dom.selector = selector || "";
		return dom;
	};

	Baic.fn = B.prototype = {
		isB: true,
		constructor: Baic,
		selector: "",
		length: 0,
		indexOf: ARRAY_PROTOTYPE.indexOf,
		forEach: ARRAY_PROTOTYPE.forEach,
		map: ARRAY_PROTOTYPE.map,
		filter: ARRAY_PROTOTYPE.filter
	};

	Baic.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		if (typeof target === "boolean") {
			deep = target;

			target = arguments[i] || {};
			i++;
		}

		if (typeof target !== "object" && !Baic.isFunction(target)) {
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

	Baic.extend({
		each(obj, fn, scope) {
			if (Baic.isArray(obj)) {
				ARRAY_PROTOTYPE.forEach.apply(obj, Baic.toArray(arguments, 1));
			} else {
				for (var key in obj)
					if (Baic.hasOwn(obj, key)) {
						fn.call(scope, obj[key], key, obj);
					}
			}
		},
		map(obj, fn, scope) {
			if (Baic.isArray(obj)) {
				return ARRAY_PROTOTYPE.map.apply(obj, Baic.toArray(arguments, 1));
			} else {
				var result = {};
				Baic.each(obj, (value, key, object) => {
					result[key] = fn.call(scope, value, key, object);
				});
				return result;
			}
		},
		toArray(obj, begin, end) {
			return ARRAY_PROTOTYPE.slice.call(obj, begin, end);
		},
		toStr(obj) {
			try {
				return Baic.isString(obj) ? obj : obj === true ? "yes" : obj === false ? "no" : JSON.stringify(obj);
			} catch (e) {
				return obj;
			}
		},
		flatten(obj) {
			return obj.length ? [].concat.apply([], obj) : obj;
		},
		getGlobalVariable(obj) {
			var iframe = document.createElement('iframe');
			iframe.style.display = "none";
			iframe.onload = () => {
				var iframeKeys = Object.keys(iframe.contentWindow);
				var keys = [];
				Baic.each(Object.keys(obj), key => {
					if (!(key in iframeKeys)) {
						keys.push(key)
					}
				});
				iframe.remove();
				obj.__globalVariable__ = keys;
			};
			iframe.src = 'about:blank';
			document.body.appendChild(iframe);
			return obj.__globalVariable__;
		}
	});

	Baic.extend({
		nop() {},
		nopp: Promise.resolve(),
		tryCatch(fn){
			if(!fn || !Baic.isFunction(fn)){
				return Promise.reject();
			}
			return new Promise(((resolve, reject) => {
				try{
					resolve(fn.call(this));
				}catch(e){
					reject(e);
				}
			}).bind(this))
		},
		hasOwn(object, property) {
			return OBJECT_PROTOTYPE.hasOwnProperty.call(object, property);
		},
		type(obj) {
			return OBJECT_PROTOTYPE.toString.call(obj).match(EXP_TYPE)[1].toLowerCase();
		},
		isFunction: _checktype("function"),
		isString: _checktype("string"),
		isBoolean: _checktype("boolean"),
		isArray: Array.isArray,
		fromArray: Array.from,
		ofArray: Array.of,
		isNumber: _checktype("number", obj => {
			return !isNaN(obj);
		}),
		isNull: _checktype("null"),
		isWindow(obj) {
			return obj != null && obj === obj.window;
		},
		isUndefined: _checktype("undefined"),
		isObject: _checktype("object"),
		isPlainObject(obj) {
			return obj && !obj.nodeType && !Baic.isWindow(obj) && Baic.isObject(obj) && !Object.getPrototypeOf(obj) && obj.constructor && Baic.isFunction(obj.constructor);
		},
		isEmptyObject(obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},
		isJSON(obj) {
			return Baic.isObject(obj) || Baic.isArray(obj);
		},
		isJSONString(obj) {
			return Baic.isString(obj) && /^\{.*?\}$|^\[.*?\]$/.test(obj.trim()) && !!(() => {
				try {
					return JSON.parse(obj)
				} catch (e) {}
			})();
		},
		parseJSON(obj) {
			try {
				return JSON.parse(obj + "");
			} catch (e) {
				return {};
			}
		},
		getWindow(obj) {
			return Baic.isWindow(obj) ? obj : obj.nodeType === 9 && obj.defaultView;
		},
		ready(callback) {
			return new Promise(resolve => {
				if (/complete|loaded|interactive/.test(document.readyState) && document.body) {
					resolve();
				} else {
					document.addEventListener('DOMContentLoaded', () => resolve())
				}
			}).then(() => {
				if (Baic.isFunction(callback)) {
					callback(Baic);
				}
				return Promise.resolve();
			})
		},
		random(min, max) {
			var rand = Math.floor(min + Math.random() * (max - min));
			rand = isNaN(rand) ? ((a, b) => {
				!Baic.isUndefined(b) || (b = a, a = 0);
				var c = b - a,
					e = Math.random();
				return a + e * c | 0
			})(min || 9999999) : rand;
			return rand;
		},
		VENDORS: (() => {
			var styles = document.defaultView.getComputedStyle(document.documentElement, "") || window.getComputedStyle(document.documentElement, "") || "";
			if (!styles) return ['-webkit-', '-moz-', '-ms-', '-o-', ''];
			var vendors = Array.prototype.slice
				.call(styles)
				.join('')
				.match(/-(moz|webkit|ms|o)-/);
			return Array.isArray(vendors) ? [""].concat(vendors[0]) : (styles.OLink === '' && ['', 'o']);
		})()
	});

	function _checktype(type) {
		var args = Baic.toArray(arguments, 1);
		return obj => {
			var bool = true;
			if (args.length) Baic.each(args, item => {
				if (!bool) return;
				if (Baic.isFunction(item)) {
					bool = item(obj);
				} else {
					bool = item;
				}
			});
			return Baic.type(obj) === type && bool;
		}
	}

	Baic.extend(FUNCTION_PROTOTYPE, {
		bind(scope) {
			var method = this;
			var args = Baic.toArray(arguments, 1);
			return function() {
				return method.apply(scope, args.concat(Baic.toArray(arguments)));
			};
		},
		defer() {
			return this._job = setTimeout.apply(null, [this].concat(Baic.toArray(arguments)));
		},
		cycle() {
			return this._cycle = setInterval.apply(null, [this].concat(Baic.toArray(arguments)));
		},
		cancel(type = 1) {
			if (this._job && type === 1) {
				clearTimeout(this._job);
			} else if (this._cycle && type === 2) {
				clearInterval(this._cycle);
			}
		}
	});

	Baic.extend(STRING_PROTOTYPE, {
		isJSONString() {
			return Baic.isJSONString(this);
		},
		parseJSON() {
			return Baic.parseJSON(this);
		},
		firstUpperCase() {
			return this.replace(/\b(\w)|\s(\w)/g, m => {
				return m.toUpperCase();
			});
		},
		firstLowerCase() {
			return this.replace(/\b(\w)|\s(\w)/g, m => {
				return m.toLowerCase();
			});
		},
		trim() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
		},
		toBoolean() {
			return /^(?:yes|ok|1|on|true)$/i.test(this.trim());
		}
	});

	var _add = (arg1, arg2) => {
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
	}

	var _sub = (arg1, arg2) => {
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
		n = (r1 >= r2) ? r1 : r2;
		return ((arg1 * m - arg2 * m) / m).toFixed(n);
	}

	var _mul = (arg1, arg2) => {
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
	}

	var _div = (arg1, arg2) => {
		arg1 = arg1 || 0;
		arg2 = arg2 || 0;
		var t1 = 0,
			t2 = 0,
			r1, r2;
		try {
			t1 = arg1.toString().split(".")[1].length;
		} catch (e) {}
		try {
			t2 = arg2.toString().split(".")[1].length;
		} catch (e) {}
		r1 = Number(arg1.toString().replace(".", ""));
		r2 = Number(arg2.toString().replace(".", ""));
		return (r1 / r2) * Math.pow(10, t2 - t1);
	}

	Baic.extend(Number, {
		add() {
			return Baic.toArray(arguments).reduce((arg1, arg2) => {
				return _add(arg1, arg2);
			})
		},
		sub() {
			return Baic.toArray(arguments).reduce((arg1, arg2) => {
				return _sub(arg1, arg2);
			})
		},
		mul() {
			return Baic.toArray(arguments).reduce((arg1, arg2) => {
				return _mul(arg1, arg2);
			})
		},
		div(arg1, arg2) {
			return Baic.toArray(arguments).reduce((arg1, arg2) => {
				return _div(arg1, arg2);
			})
		}
	});

	Baic.extend(NUMBER_PROTOTYPE, {
		cancel(type) {
			type = type || 1;
			if (this) {
				if (type === 1) {
					clearTimeout(this);
				} else if (type === 2) {
					clearInterval(this);
				}
			}
		},
		add() {
			return Number.add.apply(this, [].concat.apply(this, Baic.toArray(arguments)));
		},
		sub() {
			return Number.sub.apply(this, [].concat.apply(this, Baic.toArray(arguments)));
		},
		mul() {
			return Number.mul.apply(this, [].concat.apply(this, Baic.toArray(arguments)));
		},
		div() {
			return Number.div.apply(this, [].concat.apply(this, Baic.toArray(arguments)));
		}
	});

	if (typeof define === "function" && define.amd) {
		define("Baic", [], () => {
			return Baic;
		});
	}

	if (typeof noGlobal === "undefined") {
		(window.Baic = window.b = Baic) && ("$" in window || (window.$ = Baic));
	}

	return Baic;

}));
console.timeEnd('core');