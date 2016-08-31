console.time('fetch');;
((global, factory) => {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.Baic ?
      factory(global, global.Baic, true) :
      ((w, frame) => {
        if (!w.Baic) {
          throw new Error("fetch requires with Baic");
        }
        return factory(w, frame);
      });
  } else {
    if (!global.Baic) {
      throw new Error("fetch requires with Baic");
    }
    factory(global, global.Baic);
  }
})(typeof window !== "undefined" ? window : this, (window, Baic, noFrame) => {
'use strict';

  function _normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function _normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    var self = this;
    self.map = {};
    if (headers instanceof Headers) {
      headers.forEach((value, name) => {
        this.append(name, value)
      })
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(name => {
        self.append(name, headers[name])
      })
    }
  }

  Baic.extend(Headers.prototype, {
    append(name, value) {
      name = _normalizeName(name)
      value = _normalizeValue(value)
      var list = this.map[name]
      if (!list) {
        list = []
        this.map[name] = list
      }
      list.push(value)
    },
    forEach(callback) {
      var self = this;
      Object.getOwnPropertyNames(self.map).forEach(name => {
        self.map[name].forEach(value => {
          callback.call(self, value, name)
        })
      })
    },
    delete(name) {
      delete this.map[_normalizeName(name)]
    },
    get(name) {
      var values = this.map[_normalizeName(name)];
      return values ? values[0] : null;
    },
    getAll(name) {
      return this.map[_normalizeName(name)] || [];
    },
    has(name) {
      return this.map.hasOwnProperty(_normalizeName(name));
    },
    set(name, value) {
      this.map[_normalizeName(name)] = [_normalizeValue(value)]
    }
  });

  function _consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function _fileReaderReady(reader) {
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = () => {
        reject(reader.error)
      }
    })
  }

  function _readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return _fileReaderReady(reader)
  }

  function _readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return _fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in window && 'Blob' in window && (() => {
      try {
        new Blob();
        return true
      } catch (e) {
        return false
      }
    })(),
    formData: 'FormData' in window,
    arrayBuffer: 'ArrayBuffer' in window
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = body => {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = () => {
        var rejected = _consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = () => {
        return this.blob().then(_readBlobAsArrayBuffer)
      }

      this.text = () => {
        var rejected = _consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return _readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = () => {
        var rejected = _consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = () => {
        return this.text().then(_decode)
      }
    }

    this.json = () => {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function _normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = _normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Baic.extend(Request.prototype, {
    clone() {
      return new Request(this)
    }
  })

  function _decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(bytes => {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function _headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(header => {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  Baic.extend(Response.prototype, {
    clone() {
      return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url
      })
    }
  })

  Baic.extend(Response, {
    error() {
      var response = new Response(null, {
        status: 0,
        statusText: ''
      })
      response.type = 'error'
      return response
    },
    redirect(url, status) {
      if (_redirectStatuses.indexOf(status) === -1) {
        throw new RangeError('Invalid status code')
      }

      return new Response(null, {
        status: status,
        headers: {
          location: url
        }
      })
    }
  })

  var _redirectStatuses = [301, 302, 303, 307, 308]

  var Fetch = (input, init) => {
    return new Promise((resolve, reject) => {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = () => {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: _headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = () => {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach((value, name) => {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }

  Baic.extend(Fetch, {
    polyfill: true
  })

  if (typeof define === "function" && define.amd) {
    define("Fetch", [], () => {
      return Fetch;
    });
  }

  if (typeof noFrame === "undefined") {
    (Baic.fetch = Fetch) && ("fetch" in window || (window.fetch = Fetch));
  }

  return Fetch;
})
console.timeEnd('fetch');