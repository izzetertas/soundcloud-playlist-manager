(function () {
  var d = Object.prototype.hasOwnProperty,
    f = function (b, c) {
      return function () {
        return b.apply(c, arguments)
      }
    };
  window.SC || (window.SC = {});
  SC.Helper = {
    merge: function (b, c) {
      var a, e, h, j;
      if (b.constructor === Array) {
        e = Array.apply(null, b);
        a = 0;
        for (j = c.length; a < j; a++) h = c[a], e.push(h)
      } else {
        e = {};
        for (a in b) d.call(b, a) && (h = b[a], e[a] = h);
        for (a in c) d.call(c, a) && (h = c[a], e[a] = h)
      }
      return e
    },
    groupBy: function (b, c) {
      var a, e, h, j, d;
      a = {};
      h = 0;
      for (j = b.length; h < j; h++) e = b[h], e[c] && (a[d = e[c]] || (a[d] = []), a[e[c]].push(e));
      return a
    },
    loadJavascript: function (b, c) {
      var a;
      a = document.createElement("script");
      a.async = !0;
      a.src = b;
      SC.Helper.attachLoadEvent(a, c);
      document.body.appendChild(a);
      return a
    },
    openCenteredPopup: function (b, c, a) {
      var e, h, c = {
        location: 1,
        width: c,
        height: a,
        left: window.screenX + (window.outerWidth - c) / 2,
        top: window.screenY + (window.outerHeight - a) / 2,
        toolbar: "no",
        scrollbars: "yes"
      },
        a = [];
      for (e in c) d.call(c, e) && (h = c[e], a.push(e + "=" + h));
      return window.open(b, "connectWithSoundCloud", a.join(", "))
    },
    attachLoadEvent: function (b, c) {
      return b.addEventListener ? b.addEventListener("load", c, !1) : b.onreadystatechange = function () {
        if (this.readyState === "complete") return c()
      }
    },
    millisecondsToHMS: function (b) {
      var c, a, e, b = {
        h: Math.floor(b / 36E5),
        m: Math.floor(b / 6E4 % 60),
        s: Math.floor(b / 1E3 % 60)
      };
      e = [];
      b.h > 0 && e.push(b.h);
      a = c = "";
      b.m < 10 && b.h > 0 && (c = "0");
      b.s < 10 && (a = "0");
      e.push(c + b.m);
      e.push(a + b.s);
      return e.join(".")
    },
    setFlashStatusCodeMaps: function (b) {
      b["_status_code_map[400]"] = 200;
      b["_status_code_map[401]"] = 200;
      b["_status_code_map[403]"] = 200;
      b["_status_code_map[404]"] = 200;
      b["_status_code_map[422]"] = 200;
      b["_status_code_map[500]"] = 200;
      b["_status_code_map[503]"] = 200;
      return b["_status_code_map[504]"] = 200
    },
    responseHandler: function (b, c) {
      var a, e;
      e = SC.Helper.JSON.parse(b);
      a = null;
      e ? e.errors && (a = {
        message: e.errors && e.errors[0].error_message
      }) : a = c ? {
        message: "HTTP Error: " + c.status
      } : {
        message: "Unknown error"
      };
      return {
        json: e,
        error: a
      }
    },
    FakeStorage: function () {
      return {
        _store: {},
        getItem: function (b) {
          return this._store[b] || null
        },
        setItem: function (b, c) {
          return this._store[b] = c.toString()
        },
        removeItem: function (b) {
          return delete this._store[b]
        }
      }
    },
    JSON: {
      parse: function (b) {
        return b[0] !== "{" && b[0] !== "[" ? null : window.JSON != null ? window.JSON.parse(b) : eval(b)
      }
    }
  };
  window.SC = SC.Helper.merge(SC || {}, {
    _version: "1.1.1",
    options: {
      baseUrl: "http://connect.soundcloud.com",
      site: "soundcloud.com"
    },
    connectCallbacks: {},
    _popupWindow: void 0,
    initialize: function (b) {
      var c, a, e;
      b == null && (b = {});
      this.accessToken(b.access_token);
      for (c in b) d.call(b, c) && (a = b[c], this.options[c] = a);
      (e = this.options).flashXHR || (e.flashXHR = (new XMLHttpRequest).withCredentials === void 0);
      return this
    },
    hostname: function (b) {
      var c;
      c = "";
      b != null && (c += b + ".");
      c += this.options.site;
      return c
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    _apiRequest: function (b, c, a, e) {
      var h;
      e == null && (e = a, a = void 0);
      a || (a = {});
      c = SC.prepareRequestURI(c, a);
      c.query.format = "json";
      SC.options.flashXHR ? SC.Helper.setFlashStatusCodeMaps(c.query) : c.query["_status_code_map[302]"] = 200;
      if (b === "PUT" || b === "DELETE") c.query._method = b, b = "POST";
      if (b !== "GET") h = c.encodeParams(c.query), c.query = {};
      return this._request(b, c, "application/x-www-form-urlencoded", h, function (a, b) {
        var c;
        c = SC.Helper.responseHandler(a, b);
        return c.json && c.json.status === "302 - Found" ? SC._apiRequest("GET", c.json.location, e) : e(c.json, c.error)
      })
    },
    _request: function (b, c, a, e, h) {
      return SC.options.flashXHR ? this._flashRequest(b, c, a, e, h) : this._xhrRequest(b, c, a, e, h)
    },
    _xhrRequest: function (b, c, a, e, h) {
      var d;
      d = new XMLHttpRequest;
      d.open(b, c.toString(), !0);
      d.setRequestHeader("Content-Type", a);
      d.onreadystatechange = function (a) {
        if (a.target.readyState === 4) return h(a.target.responseText, a.target)
      };
      return d.send(e)
    },
    _flashRequest: function (b, c, a, e, h) {
      return this.whenRecordingReady(function () {
        return Recorder.request(b, c.toString(), a, e, function (a, b) {
          return h(Recorder._externalInterfaceDecode(a), b)
        })
      })
    },
    post: function (b, c, a) {
      return this._apiRequest("POST", b, c, a)
    },
    put: function (b, c, a) {
      return this._apiRequest("PUT", b, c, a)
    },
    get: function (b, c, a) {
      return this._apiRequest("GET", b, c, a)
    },
    "delete": function (b, c) {
      return this._apiRequest("DELETE", b, {}, c)
    },
    prepareRequestURI: function (b, c) {
      var a, e, h;
      c == null && (c = {});
      e = new SC.URI(b, {
        decodeQuery: !0
      });
      for (a in c) d.call(c, a) && (h = c[a], e.query[a] = h);
      if (e.isRelative()) e.host = this.hostname("api"), e.scheme = "http";
      this.accessToken() != null ? (e.query.oauth_token = this.accessToken(), e.scheme = "https") : e.query.client_id = this.options.client_id;
      return e
    },
    _getAll: function (b, c, a, e) {
      e == null && (e = []);
      a == null && (a = c, c = void 0);
      c || (c = {});
      c.offset || (c.offset = 0);
      c.limit || (c.limit = 50);
      return this.get(b, c, function (h) {
        return h.constructor === Array && h.length > 0 ? (e = SC.Helper.merge(e, h), c.offset += c.limit, SC._getAll(b, c, a, e)) : a(e, null)
      })
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    connect: function (b) {
      var c, b = typeof b === "function" ? {
        connected: b
      } : b;
      b.client_id || (b.client_id = SC.options.client_id);
      b.redirect_uri || (b.redirect_uri = SC.options.redirect_uri);
      SC.connectCallbacks.success = b.connected;
      SC.connectCallbacks.error = b.error;
      SC.connectCallbacks.general = b.callback;
      if (b.client_id && b.redirect_uri) return c = new SC.URI("https://" + this.hostname() + "/connect?"), c.query = {
        client_id: b.client_id,
        redirect_uri: b.redirect_uri,
        response_type: "code_and_token",
        scope: b.scope || "non-expiring",
        display: "popup"
      }, SC._popupWindow = SC.Helper.openCenteredPopup(c.toString(), 456, 510);
      else throw "Either client_id and redirect_uri (for user agent flow) must be passed as an option";
    },
    connectCallback: function () {
      var b, c, a;
      c = SC._popupWindow;
      a = new SC.URI(c.location.toString(), {
        decodeQuery: !0,
        decodeFragment: !0
      });
      b = a.query.error || a.fragment.error;
      c.close();
      if (b) throw Error("SC OAuth2 Error: " + a.query.error_description);
      else SC.accessToken(a.fragment.access_token), SC._trigger("success");
      return SC._trigger("general", b)
    },
    disconnect: function () {
      return this.accessToken(null)
    },
    _trigger: function (b, c) {
      if (this.connectCallbacks[b] != null) return this.connectCallbacks[b](c)
    },
    accessToken: function (b) {
      var c;
      c = this.storage();
      return b === void 0 ? c.getItem("SC.accessToken") : b === null ? c.removeItem("SC.accessToken") : c.setItem("SC.accessToken", b)
    },
    isConnected: function () {
      return this.accessToken() != null
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    dialog: function (b, c, a) {
      return SC.Helper.extractOptionsAndCallbackArguments(c, a).callback
    },
    Dialog: {
      _activeDialogs: {},
      _handleDialogReturn: function () {},
      _handleInPopupContext: function () {},
      buildUrl: function () {}
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    oEmbed: function (b, c, a) {
      var e;
      a == null && (a = c, c = void 0);
      c || (c = {});
      c.url = b;
      b = new SC.URI("http://" + SC.hostname() + "/oembed.json");
      b.query = c;
      a.nodeType !== void 0 && a.nodeType === 1 && (e = a, a = f(function (a) {
        return e.innerHTML = a.html
      }, this));
      return this._request("GET", b.toString(), null, null, function (b, c) {
        var e;
        e = SC.Helper.responseHandler(b, c);
        return a(e.json, e.error)
      })
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    _recorderSwfPath: "/recorder.js/recorder-0.8.swf",
    whenRecordingReady: function (b) {
      return window.Recorder.flashInterface() && window.Recorder.flashInterface().record != null ? b() : Recorder.initialize({
        swfSrc: this.options.baseUrl + this._recorderSwfPath + "?" + this._version,
        initialized: function () {
          return b()
        }
      })
    },
    record: function (b) {
      b == null && (b = {});
      return this.whenRecordingReady(function () {
        return Recorder.record(b)
      })
    },
    recordStop: function () {
      return Recorder.stop()
    },
    recordPlay: function (b) {
      b == null && (b = {});
      return Recorder.play(b)
    },
    recordUpload: function (b, c) {
      var a;
      b == null && (b = {});
      a = SC.prepareRequestURI("/tracks", b);
      a.query.format = "json";
      SC.Helper.setFlashStatusCodeMaps(a.query);
      a = a.flattenParams(a.query);
      return Recorder.upload({
        method: "POST",
        url: "https://" + this.hostname("api") + "/tracks",
        audioParam: "track[asset_data]",
        params: a,
        success: function (a) {
          a = SC.Helper.responseHandler(a);
          return c(a.json, a.error)
        }
      })
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    storage: function () {
      return this._fakeStorage || (this._fakeStorage = new SC.Helper.FakeStorage)
    }
  });
  window.SC = SC.Helper.merge(SC || {}, {
    _soundmanagerPath: "/soundmanager2/",
    _soundmanagerScriptPath: "soundmanager2.js",
    whenStreamingReady: function (b) {
      var c;
      return window.soundManager ? b() : (c = this.options.baseUrl + this._soundmanagerPath, window.SM2_DEFER = !0, SC.Helper.loadJavascript(c + this._soundmanagerScriptPath, function () {
        window.soundManager = new SoundManager;
        soundManager.url = c;
        soundManager.flashVersion = 9;
        soundManager.useFlashBlock = !1;
        soundManager.useHTML5Audio = !1;
        soundManager.beginDelayedInit();
        return soundManager.onready(function () {
          return b()
        })
      }))
    },
    _prepareStreamUrl: function (b) {
      b = b.toString().match(/^\d.*$/) ? "/tracks/" + b : b;
      b = SC.prepareRequestURI(b);
      b.path.match(/\/stream/) || (b.path += "/stream");
      return b.toString()
    },
    _setOnPositionListenersForComments: function (b, c, a) {
      var e, d, j;
      e = SC.Helper.groupBy(c, "timestamp");
      j = [];
      for (d in e) c = e[d], j.push(function (a, c, e) {
        return b.onposition(parseInt(a, 10), function () {
          return e(c)
        })
      }(d, c, a));
      return j
    },
    stream: function (b, c, a) {
      var e;
      a != null ? e = c : typeof c === "function" ? a = c : e = c || {};
      return SC.whenStreamingReady(f(function () {
        var c, d;
        e.id = "T" + b + "-" + Math.random();
        e.url = this._prepareStreamUrl(b);
        c = f(function (b) {
          b = soundManager.createSound(b);
          a != null && a(b);
          return b
        }, this);
        return (d = e.ontimedcomments) ? (delete e.ontimedcomments, SC._getAll(e.url.replace("/stream", "/comments"), f(function (a) {
          return this._setOnPositionListenersForComments(c(e), a, d)
        }, this))) : c(e)
      }, this))
    },
    streamStopAll: function () {
      if (window.soundManager != null) return window.soundManager.stopAll()
    }
  })
}).call(this);
var Recorder = {
  swfObject: null,
  _callbacks: {},
  _events: {},
  _initialized: !1,
  options: {},
  initialize: function (d) {
    this.options = d || {};
    this.options.flashContainer || this._setupFlashContainer();
    this.bind("initialized", function () {
      Recorder._initialized = !0;
      d.initialized()
    });
    this.bind("showFlash", this.options.onFlashSecurity || this._defaultOnShowFlash);
    this._loadFlash()
  },
  clear: function () {
    Recorder._events = {}
  },
  record: function (d) {
    d = d || {};
    this.clearBindings("recordingStart");
    this.clearBindings("recordingProgress");
    this.clearBindings("recordingCancel");
    this.bind("recordingStart", this._defaultOnHideFlash);
    this.bind("recordingCancel", this._defaultOnHideFlash);
    this.bind("recordingCancel", this._loadFlash);
    this.bind("recordingStart", d.start);
    this.bind("recordingProgress", d.progress);
    this.bind("recordingCancel", d.cancel);
    this.flashInterface().record()
  },
  stop: function () {
    return this.flashInterface()._stop()
  },
  play: function (d) {
    d = d || {};
    this.clearBindings("playingProgress");
    this.bind("playingProgress", d.progress);
    this.bind("playingStop", d.finished);
    this.flashInterface()._play()
  },
  upload: function (d) {
    d.audioParam = d.audioParam || "audio";
    d.params = d.params || {};
    this.clearBindings("uploadSuccess");
    this.bind("uploadSuccess", function (f) {
      d.success(Recorder._externalInterfaceDecode(f))
    });
    this.flashInterface().upload(d.url, d.audioParam, d.params)
  },
  audioData: function () {
    return this.flashInterface().audioData().split(";")
  },
  request: function (d, f, b, c, a) {
    a = this.registerCallback(a);
    this.flashInterface().request(d, f, b, c, a)
  },
  clearBindings: function (d) {
    Recorder._events[d] = []
  },
  bind: function (d, f) {
    Recorder._events[d] || (Recorder._events[d] = []);
    Recorder._events[d].push(f)
  },
  triggerEvent: function (d, f, b) {
    Recorder._executeInWindowContext(function () {
      for (var c in Recorder._events[d]) Recorder._events[d][c] && Recorder._events[d][c].apply(Recorder, [f, b])
    })
  },
  triggerCallback: function (d, f) {
    Recorder._executeInWindowContext(function () {
      Recorder._callbacks[d].apply(null, f)
    })
  },
  registerCallback: function (d) {
    var f = "CB" + parseInt(Math.random() * 999999, 10);
    Recorder._callbacks[f] = d;
    return f
  },
  flashInterface: function () {
    if (this.swfObject) if (this.swfObject.record) return this.swfObject;
    else {
      if (this.swfObject.children[3].record) return this.swfObject.children[3]
    } else return null
  },
  _executeInWindowContext: function (d) {
    window.setTimeout(d, 1)
  },
  _setupFlashContainer: function () {
    this.options.flashContainer = document.createElement("div");
    this.options.flashContainer.setAttribute("id", "recorderFlashContainer");
    this.options.flashContainer.setAttribute("style", "position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px; margin-left: 10px; border-top: 6px solid rgba(128, 128, 128, 0.6); border-bottom: 6px solid rgba(128, 128, 128, 0.6); border-radius: 5px 5px; padding-bottom: 1px; padding-right: 1px;");
    document.body.appendChild(this.options.flashContainer)
  },
  _clearFlash: function () {
    var d = this.options.flashContainer.children[0];
    d && this.options.flashContainer.removeChild(d)
  },
  _loadFlash: function () {
    this._clearFlash();
    var d = document.createElement("div");
    d.setAttribute("id", "recorderFlashObject");
    this.options.flashContainer.appendChild(d);
    swfobject.embedSWF(this.options.swfSrc, "recorderFlashObject", "231", "141", "10.0.0", void 0, void 0, {
      allowscriptaccess: "always"
    }, void 0, function (d) {
      d.success ? (Recorder.swfObject = d.ref, Recorder._checkForFlashBlock()) : Recorder._showFlashRequiredDialog()
    })
  },
  _defaultOnShowFlash: function () {
    var d = Recorder.options.flashContainer;
    d.style.left = (window.innerWidth || document.body.offsetWidth) / 2 - 115 + "px";
    d.style.top = (window.innerHeight || document.body.offsetHeight) / 2 - 70 + "px"
  },
  _defaultOnHideFlash: function () {
    var d = Recorder.options.flashContainer;
    d.style.left = "-9999px";
    d.style.top = "-9999px"
  },
  _checkForFlashBlock: function () {
    window.setTimeout(function () {
      Recorder._initialized || Recorder.triggerEvent("showFlash")
    }, 500)
  },
  _showFlashRequiredDialog: function () {
    Recorder.options.flashContainer.innerHTML = "<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>";
    Recorder.options.flashContainer.style.color = "white";
    Recorder.options.flashContainer.style.backgroundColor = "#777";
    Recorder.options.flashContainer.style.textAlign = "center";
    Recorder.triggerEvent("showFlash")
  },
  _externalInterfaceDecode: function (d) {
    return d.replace(/%22/g, '"').replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%")
  }
};
if (swfobject == void 0) var swfobject = function () {
    function d() {
      if (!u) {
        try {
          var a = i.getElementsByTagName("body")[0].appendChild(i.createElement("span"));
          a.parentNode.removeChild(a)
        } catch (b) {
          return
        }
        u = !0;
        for (var a = z.length, c = 0; c < a; c++) z[c]()
      }
    }
    function f(a) {
      u ? a() : z[z.length] = a
    }
    function b(a) {
      if (typeof n.addEventListener != l) n.addEventListener("load", a, !1);
      else if (typeof i.addEventListener != l) i.addEventListener("load", a, !1);
      else if (typeof n.attachEvent != l) Q(n, "onload", a);
      else if (typeof n.onload == "function") {
        var b = n.onload;
        n.onload = function () {
          b();
          a()
        }
      } else n.onload = a
    }
    function c() {
      var b = i.getElementsByTagName("body")[0],
        c = i.createElement(t);
      c.setAttribute("type", A);
      var e = b.appendChild(c);
      if (e) {
        var d = 0;
        (function () {
          if (typeof e.GetVariable != l) {
            var h = e.GetVariable("$version");
            if (h) h = h.split(" ")[1].split(","), g.pv = [parseInt(h[0], 10), parseInt(h[1], 10), parseInt(h[2], 10)]
          } else if (d < 10) {
            d++;
            setTimeout(arguments.callee, 10);
            return
          }
          b.removeChild(c);
          e = null;
          a()
        })()
      } else a()
    }
    function a() {
      var a = r.length;
      if (a > 0) for (var b = 0; b < a; b++) {
        var c = r[b].id,
          d = r[b].callbackFn,
          p = {
            success: !1,
            id: c
          };
        if (g.pv[0] > 0) {
          var i = o(c);
          if (i) if (B(r[b].swfVersion) && !(g.wk && g.wk < 312)) {
            if (v(c, !0), d) p.success = !0, p.ref = e(c), d(p)
          } else if (r[b].expressInstall && h()) {
            p = {};
            p.data = r[b].expressInstall;
            p.width = i.getAttribute("width") || "0";
            p.height = i.getAttribute("height") || "0";
            if (i.getAttribute("class")) p.styleclass = i.getAttribute("class");
            if (i.getAttribute("align")) p.align = i.getAttribute("align");
            for (var I = {}, i = i.getElementsByTagName("param"), f = i.length, x = 0; x < f; x++) i[x].getAttribute("name").toLowerCase() != "movie" && (I[i[x].getAttribute("name")] = i[x].getAttribute("value"));
            j(p, I, c, d)
          } else k(i), d && d(p)
        } else if (v(c, !0), d) {
          if ((c = e(c)) && typeof c.SetVariable != l) p.success = !0, p.ref = c;
          d(p)
        }
      }
    }
    function e(a) {
      var b = null;
      if ((a = o(a)) && a.nodeName == "OBJECT") typeof a.SetVariable != l ? b = a : (a = a.getElementsByTagName(t)[0]) && (b = a);
      return b
    }
    function h() {
      return !C && B("6.0.65") && (g.win || g.mac) && !(g.wk && g.wk < 312)
    }
    function j(a, b, c, e) {
      C = !0;
      G = e || null;
      J = {
        success: !1,
        id: c
      };
      var d = o(c);
      if (d) {
        d.nodeName == "OBJECT" ? (y = m(d), D = null) : (y = d, D = c);
        a.id = K;
        if (typeof a.width == l || !/%$/.test(a.width) && parseInt(a.width, 10) < 310) a.width = "310";
        if (typeof a.height == l || !/%$/.test(a.height) && parseInt(a.height, 10) < 137) a.height = "137";
        i.title = i.title.slice(0, 47) + " - Flash Player Installation";
        e = g.ie && g.win ? "ActiveX" : "PlugIn";
        e = "MMredirectURL=" + encodeURI(n.location).toString().replace(/&/g, "%26") + "&MMplayerType=" + e + "&MMdoctitle=" + i.title;
        typeof b.flashvars != l ? b.flashvars += "&" + e : b.flashvars = e;
        if (g.ie && g.win && d.readyState != 4) e = i.createElement("div"), c += "SWFObjectNew", e.setAttribute("id", c), d.parentNode.insertBefore(e, d), d.style.display = "none", function () {
          d.readyState == 4 ? d.parentNode.removeChild(d) : setTimeout(arguments.callee, 10)
        }();
        F(a, b, c)
      }
    }
    function k(a) {
      if (g.ie && g.win && a.readyState != 4) {
        var b = i.createElement("div");
        a.parentNode.insertBefore(b, a);
        b.parentNode.replaceChild(m(a), b);
        a.style.display = "none";
        (function () {
          a.readyState == 4 ? a.parentNode.removeChild(a) : setTimeout(arguments.callee, 10)
        })()
      } else a.parentNode.replaceChild(m(a), a)
    }
    function m(a) {
      var b = i.createElement("div");
      if (g.win && g.ie) b.innerHTML = a.innerHTML;
      else if (a = a.getElementsByTagName(t)[0]) if (a = a.childNodes) for (var c = a.length, e = 0; e < c; e++)!(a[e].nodeType == 1 && a[e].nodeName == "PARAM") && a[e].nodeType != 8 && b.appendChild(a[e].cloneNode(!0));
      return b
    }
    function F(a, b, c) {
      var e, d = o(c);
      if (g.wk && g.wk < 312) return e;
      if (d) {
        if (typeof a.id == l) a.id = c;
        if (g.ie && g.win) {
          var h = "",
            j;
          for (j in a) if (a[j] != Object.prototype[j]) j.toLowerCase() == "data" ? b.movie = a[j] : j.toLowerCase() == "styleclass" ? h += ' class="' + a[j] + '"' : j.toLowerCase() != "classid" && (h += " " + j + '="' + a[j] + '"');
          j = "";
          for (var k in b) b[k] != Object.prototype[k] && (j += '<param name="' + k + '" value="' + b[k] + '" />');
          d.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + h + ">" + j + "</object>";
          E[E.length] = a.id;
          e = o(a.id)
        } else {
          k = i.createElement(t);
          k.setAttribute("type", A);
          for (var f in a) a[f] != Object.prototype[f] && (f.toLowerCase() == "styleclass" ? k.setAttribute("class", a[f]) : f.toLowerCase() != "classid" && k.setAttribute(f, a[f]));
          for (h in b) b[h] != Object.prototype[h] && h.toLowerCase() != "movie" && (a = k, j = h, f = b[h], c = i.createElement("param"), c.setAttribute("name", j), c.setAttribute("value", f), a.appendChild(c));
          d.parentNode.replaceChild(k, d);
          e = k
        }
      }
      return e
    }
    function L(a) {
      var b = o(a);
      if (b && b.nodeName == "OBJECT") g.ie && g.win ? (b.style.display = "none", function () {
        if (b.readyState == 4) {
          var c = o(a);
          if (c) {
            for (var e in c) typeof c[e] == "function" && (c[e] = null);
            c.parentNode.removeChild(c)
          }
        } else setTimeout(arguments.callee, 10)
      }()) : b.parentNode.removeChild(b)
    }
    function o(a) {
      var b = null;
      try {
        b = i.getElementById(a)
      } catch (c) {}
      return b
    }
    function Q(a, b, c) {
      a.attachEvent(b, c);
      w[w.length] = [a, b, c]
    }
    function B(a) {
      var b = g.pv,
        a = a.split(".");
      a[0] = parseInt(a[0], 10);
      a[1] = parseInt(a[1], 10) || 0;
      a[2] = parseInt(a[2], 10) || 0;
      return b[0] > a[0] || b[0] == a[0] && b[1] > a[1] || b[0] == a[0] && b[1] == a[1] && b[2] >= a[2] ? !0 : !1
    }
    function M(a, b, c, e) {
      if (!g.ie || !g.mac) {
        var d = i.getElementsByTagName("head")[0];
        if (d) {
          c = c && typeof c == "string" ? c : "screen";
          e && (H = q = null);
          if (!q || H != c) e = i.createElement("style"), e.setAttribute("type", "text/css"), e.setAttribute("media", c), q = d.appendChild(e), g.ie && g.win && typeof i.styleSheets != l && i.styleSheets.length > 0 && (q = i.styleSheets[i.styleSheets.length - 1]), H = c;
          g.ie && g.win ? q && typeof q.addRule == t && q.addRule(a, b) : q && typeof i.createTextNode != l && q.appendChild(i.createTextNode(a + " {" + b + "}"))
        }
      }
    }
    function v(a, b) {
      if (N) {
        var c = b ? "visible" : "hidden";
        u && o(a) ? o(a).style.visibility = c : M("#" + a, "visibility:" + c)
      }
    }
    function O(a) {
      return /[\\\"<>\.;]/.exec(a) != null && typeof encodeURIComponent != l ? encodeURIComponent(a) : a
    }
    var l = "undefined",
      t = "object",
      A = "application/x-shockwave-flash",
      K = "SWFObjectExprInst",
      n = window,
      i = document,
      s = navigator,
      P = !1,
      z = [function () {
        P ? c() : a()
      }],
      r = [],
      E = [],
      w = [],
      y, D, G, J, u = !1,
      C = !1,
      q, H, N = !0,
      g = function () {
        var a = typeof i.getElementById != l && typeof i.getElementsByTagName != l && typeof i.createElement != l,
          b = s.userAgent.toLowerCase(),
          c = s.platform.toLowerCase(),
          e = c ? /win/.test(c) : /win/.test(b),
          c = c ? /mac/.test(c) : /mac/.test(b),
          b = /webkit/.test(b) ? parseFloat(b.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
          d = !+"\u000b1",
          h = [0, 0, 0],
          j = null;
        if (typeof s.plugins != l && typeof s.plugins["Shockwave Flash"] == t) {
          if ((j = s.plugins["Shockwave Flash"].description) && !(typeof s.mimeTypes != l && s.mimeTypes[A] && !s.mimeTypes[A].enabledPlugin)) P = !0, d = !1, j = j.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), h[0] = parseInt(j.replace(/^(.*)\..*$/, "$1"), 10), h[1] = parseInt(j.replace(/^.*\.(.*)\s.*$/, "$1"), 10), h[2] = /[a-zA-Z]/.test(j) ? parseInt(j.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
        } else if (typeof n.ActiveXObject != l) try {
          var g = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
          if (g && (j = g.GetVariable("$version"))) d = !0, j = j.split(" ")[1].split(","), h = [parseInt(j[0], 10), parseInt(j[1], 10), parseInt(j[2], 10)]
        } catch (k) {}
        return {
          w3: a,
          pv: h,
          wk: b,
          ie: d,
          win: e,
          mac: c
        }
      }();
    (function () {
      g.w3 && ((typeof i.readyState != l && i.readyState == "complete" || typeof i.readyState == l && (i.getElementsByTagName("body")[0] || i.body)) && d(), u || (typeof i.addEventListener != l && i.addEventListener("DOMContentLoaded", d, !1), g.ie && g.win && (i.attachEvent("onreadystatechange", function () {
        i.readyState == "complete" && (i.detachEvent("onreadystatechange", arguments.callee), d())
      }), n == top &&
      function () {
        if (!u) {
          try {
            i.documentElement.doScroll("left")
          } catch (a) {
            setTimeout(arguments.callee, 0);
            return
          }
          d()
        }
      }()), g.wk &&
      function () {
        u || (/loaded|complete/.test(i.readyState) ? d() : setTimeout(arguments.callee, 0))
      }(), b(d)))
    })();
    (function () {
      g.ie && g.win && window.attachEvent("onunload", function () {
        for (var a = w.length, b = 0; b < a; b++) w[b][0].detachEvent(w[b][1], w[b][2]);
        a = E.length;
        for (b = 0; b < a; b++) L(E[b]);
        for (var c in g) g[c] = null;
        g = null;
        for (var e in swfobject) swfobject[e] = null;
        swfobject = null
      })
    })();
    return {
      registerObject: function (a, b, c, e) {
        if (g.w3 && a && b) {
          var d = {};
          d.id = a;
          d.swfVersion = b;
          d.expressInstall = c;
          d.callbackFn = e;
          r[r.length] = d;
          v(a, !1)
        } else e && e({
          success: !1,
          id: a
        })
      },
      getObjectById: function (a) {
        if (g.w3) return e(a)
      },
      embedSWF: function (a, b, c, e, d, i, k, m, n, o) {
        var q = {
          success: !1,
          id: b
        };
        g.w3 && !(g.wk && g.wk < 312) && a && b && c && e && d ? (v(b, !1), f(function () {
          c += "";
          e += "";
          var g = {};
          if (n && typeof n === t) for (var f in n) g[f] = n[f];
          g.data = a;
          g.width = c;
          g.height = e;
          f = {};
          if (m && typeof m === t) for (var r in m) f[r] = m[r];
          if (k && typeof k === t) for (var s in k) typeof f.flashvars != l ? f.flashvars += "&" + s + "=" + k[s] : f.flashvars = s + "=" + k[s];
          if (B(d)) r = F(g, f, b), g.id == b && v(b, !0), q.success = !0, q.ref = r;
          else if (i && h()) {
            g.data = i;
            j(g, f, b, o);
            return
          } else v(b, !0);
          o && o(q)
        })) : o && o(q)
      },
      switchOffAutoHideShow: function () {
        N = !1
      },
      ua: g,
      getFlashPlayerVersion: function () {
        return {
          major: g.pv[0],
          minor: g.pv[1],
          release: g.pv[2]
        }
      },
      hasFlashPlayerVersion: B,
      createSWF: function (a, b, c) {
        if (g.w3) return F(a, b, c)
      },
      showExpressInstall: function (a, b, c, e) {
        g.w3 && h() && j(a, b, c, e)
      },
      removeSWF: function (a) {
        g.w3 && L(a)
      },
      createCSS: function (a, b, c, e) {
        g.w3 && M(a, b, c, e)
      },
      addDomLoadEvent: f,
      addLoadEvent: b,
      getQueryParamValue: function (a) {
        var b = i.location.search || i.location.hash;
        if (b) {
          /\?/.test(b) && (b = b.split("?")[1]);
          if (a == null) return O(b);
          for (var b = b.split("&"), c = 0; c < b.length; c++) if (b[c].substring(0, b[c].indexOf("=")) == a) return O(b[c].substring(b[c].indexOf("=") + 1))
        }
        return ""
      },
      expressInstallCallback: function () {
        if (C) {
          var a = o(K);
          if (a && y) {
            a.parentNode.replaceChild(y, a);
            if (D && (v(D, !0), g.ie && g.win)) y.style.display = "block";
            G && G(J)
          }
          C = !1
        }
      }
    }
  }();
var __hasProp = Object.prototype.hasOwnProperty;
window.SC.URI = function (d, f) {
  var b, c;
  d == null && (d = "");
  f == null && (f = {});
  c = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
  b = /^(?:([^@]*)@)?([^:]*)(?::(\d*))?/;
  this.scheme = this.user = this.password = this.host = this.port = this.path = this.query = this.fragment = null;
  this.toString = function () {
    var a;
    a = "";
    this.isAbsolute() && (a += this.scheme, a += "://", this.user != null && (a += this.user + ":" + this.password + "@"), a += this.host, this.port != null && (a += ":" + this.port));
    a += this.path;
    if (this.path === "" && (this.query != null || this.fragment != null)) a += "/";
    this.query != null && (a += this.encodeParamsWithPrepend(this.query, "?"));
    this.fragment != null && (a += this.encodeParamsWithPrepend(this.fragment, "#"));
    return a
  };
  this.isRelative = function () {
    return !this.isAbsolute()
  };
  this.isAbsolute = function () {
    return this.host != null
  };
  this.decodeParams = function (a) {
    var b, c, d, k, f;
    a == null && (a = "");
    c = {};
    f = a.split("&");
    a = 0;
    for (k = f.length; a < k; a++) b = f[a], b !== "" && (d = b.split("="), b = decodeURIComponent(d[0]), d = decodeURIComponent(d[1] || "").replace(/\+/g, " "), this.normalizeParams(c, b, d));
    return c
  };
  this.normalizeParams = function (a, b, c) {
    var d, f;
    c == null && (c = NULL);
    d = b.match(/^[\[\]]*([^\[\]]+)\]*(.*)/);
    b = d[1] || "";
    d = d[2] || "";
    d === "" ? a[b] = c : d === "[]" ? (a[b] || (a[b] = []), a[b].push(c)) : (f = d.match(/^\[\]\[([^\[\]]+)\]$/) || (f = d.match(/^\[\](.+)$/))) ? (d = f[1], a[b] || (a[b] = []), f = a[b][a[b].length - 1], f != null && f.constructor === Object && f[d] == null ? this.normalizeParams(f, d, c) : a[b].push(this.normalizeParams({}, d, c))) : (a[b] || (a[b] = {}), a[b] = this.normalizeParams(a[b], d, c));
    return a
  };
  this.encodeParamsWithPrepend = function (a, b) {
    var c;
    c = this.encodeParams(a);
    return c !== "" ? b + c : ""
  };
  this.encodeParams = function (a) {
    var b, c, d, f, m;
    if (a.constructor === String) return a;
    else {
      a = this.flattenParams(a);
      c = [];
      f = 0;
      for (m = a.length; f < m; f++) d = a[f], b = d[0], d = d[1], d === null ? c.push(b) : c.push(b + "=" + encodeURIComponent(d));
      return c.join("&")
    }
  };
  this.flattenParams = function (a, b, c) {
    var d, f, m;
    b == null && (b = "");
    c == null && (c = []);
    if (a == null) b != null && c.push([b, null]);
    else if (a.constructor === Object) for (d in a) __hasProp.call(a, d) && (m = a[d], f = b !== "" ? b + "[" + d + "]" : d, this.flattenParams(m, f, c));
    else if (a.constructor === Array) {
      d = 0;
      for (f = a.length; d < f; d++) m = a[d], this.flattenParams(m, b + "[]", c)
    } else b !== "" && c.push([b, a]);
    return c
  };
  this.parse = function (a, d) {
    var f, j, k, m;
    a == null && (a = "");
    d == null && (d = {});
    j = function (a) {
      return a === "" ? null : a
    };
    k = a.match(c);
    this.scheme = j(k[1]);
    f = k[2];
    if (f != null) {
      f = f.match(b);
      m = j(f[1]);
      if (m != null) this.user = m.split(":")[0], this.password = m.split(":")[1];
      this.host = j(f[2]);
      this.port = parseInt(f[3], 10) || null
    }
    this.path = k[3];
    this.query = j(k[4]);
    if (d.decodeQuery) this.query = this.decodeParams(this.query);
    this.fragment = j(k[5]);
    if (d.decodeFragment) return this.fragment = this.decodeParams(this.fragment)
  };
  this.parse(d.toString(), f);
  return this
};