/**
 * template7 1.2.3
 * Mobile-first HTML template engine
 *
 * http://www.idangero.us/template7/
 *
 * Copyright 2017, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under MIT
 *
 * Released on: May 12, 2017
 */
!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.Template7 = t()
}(this, function () {
    "use strict";
    function e(e) {
        return Array.isArray ? Array.isArray(e) : "[object Array]" === Object.prototype.toString.apply(e)
    }

    function t(e) {
        return "function" == typeof e
    }

    function r(e) {
        return (void 0 !== o && o.escape ? o.escape(e) : e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    }

    function n(e) {
        var t, r, n, i = e.replace(/[{}#}]/g, "").split(" "), a = [];
        for (r = 0; r < i.length; r += 1) {
            var o = i[r], s = void 0, f = void 0;
            if (0 === r) a.push(o); else if (0 === o.indexOf('"') || 0 === o.indexOf("'"))if (s = 0 === o.indexOf('"') ? p : l, f = 0 === o.indexOf('"') ? '"' : "'", 2 === o.match(s).length) a.push(o); else {
                for (t = 0, n = r + 1; n < i.length; n += 1)if (o += " " + i[n], i[n].indexOf(f) >= 0) {
                    t = n, a.push(o);
                    break
                }
                t && (r = t)
            } else if (o.indexOf("=") > 0) {
                var c = o.split("="), u = c[0], h = c[1];
                if (s || (s = 0 === h.indexOf('"') ? p : l, f = 0 === h.indexOf('"') ? '"' : "'"), 2 !== h.match(s).length) {
                    for (t = 0, n = r + 1; n < i.length; n += 1)if (h += " " + i[n], i[n].indexOf(f) >= 0) {
                        t = n;
                        break
                    }
                    t && (r = t)
                }
                var d = [u, h.replace(s, "")];
                a.push(d)
            } else a.push(o)
        }
        return a
    }

    function i(t) {
        var r, i, a = [];
        if (!t)return [];
        var o = t.split(/({{[^{^}]*}})/);
        for (r = 0; r < o.length; r += 1) {
            var l = o[r];
            if ("" !== l)if (l.indexOf("{{") < 0) a.push({type: "plain", content: l}); else {
                if (l.indexOf("{/") >= 0)continue;
                if (l.indexOf("{#") < 0 && l.indexOf(" ") < 0 && l.indexOf("else") < 0) {
                    a.push({type: "variable", contextName: l.replace(/[{}]/g, "")});
                    continue
                }
                var p = n(l), s = p[0], f = ">" === s, c = [], u = {};
                for (i = 1; i < p.length; i += 1) {
                    var h = p[i];
                    e(h) ? u[h[0]] = "false" !== h[1] && h[1] : c.push(h)
                }
                if (l.indexOf("{#") >= 0) {
                    var d = "", v = "", g = 0, m = void 0, x = !1, y = !1, O = 0;
                    for (i = r + 1; i < o.length; i += 1)if (o[i].indexOf("{{#") >= 0 && (O += 1), o[i].indexOf("{{/") >= 0 && (O -= 1), o[i].indexOf("{{#" + s) >= 0) d += o[i], y && (v += o[i]), g += 1; else if (o[i].indexOf("{{/" + s) >= 0) {
                        if (!(g > 0)) {
                            m = i, x = !0;
                            break
                        }
                        g -= 1, d += o[i], y && (v += o[i])
                    } else o[i].indexOf("else") >= 0 && 0 === O ? y = !0 : (y || (d += o[i]), y && (v += o[i]));
                    x && (m && (r = m), a.push({
                        type: "helper",
                        helperName: s,
                        contextName: c,
                        content: d,
                        inverseContent: v,
                        hash: u
                    }))
                } else l.indexOf(" ") > 0 && (f && (s = "_partial", c[0] && (c[0] = '"' + c[0].replace(/"|'/g, "") + '"')), a.push({
                    type: "helper",
                    helperName: s,
                    contextName: c,
                    hash: u
                }))
            }
        }
        return a
    }

    function a(e, t) {
        if (2 === arguments.length) {
            var r = new s(e), n = r.compile()(t);
            return r = null, n
        }
        return new s(e)
    }

    var o;
    o = "undefined" != typeof window ? window : "undefined" != typeof global ? global : void 0;
    var l = new RegExp("'", "g"), p = new RegExp('"', "g"), s = function (e) {
        function t(e, t) {
            var r, n = t, i = 0;
            if (0 === e.indexOf("../")) {
                var a = n.split("_")[1] - i;
                i = e.split("../").length - 1, n = "ctx_" + (a >= 1 ? a : 1), r = e.split("../")[i].split(".")
            } else 0 === e.indexOf("@global") ? (n = "Template7.global", r = e.split("@global.")[1].split(".")) : 0 === e.indexOf("@root") ? (n = "root", r = e.split("@root.")[1].split(".")) : r = e.split(".");
            for (var o = 0; o < r.length; o += 1) {
                var l = r[o];
                0 === l.indexOf("@") ? o > 0 ? n += "[(data && data." + l.replace("@", "") + ")]" : n = "(data && data." + e.replace("@", "") + ")" : isFinite(l) ? n += "[" + l + "]" : "this" === l || l.indexOf("this.") >= 0 || l.indexOf("this[") >= 0 || l.indexOf("this(") >= 0 ? n = l.replace("this", t) : n += "." + l
            }
            return n
        }

        function r(e, r) {
            for (var n = [], i = 0; i < e.length; i += 1)/^['"]/.test(e[i]) ? n.push(e[i]) : /^(true|false|\d+)$/.test(e[i]) ? n.push(e[i]) : n.push(t(e[i], r));
            return n.join(", ")
        }

        function n(e, l) {
            function p(e, t) {
                return e.content ? n(e.content, t) : function () {
                    return ""
                }
            }

            function s(e, t) {
                return e.inverseContent ? n(e.inverseContent, t) : function () {
                    return ""
                }
            }

            if (void 0 === e && (e = a.template), void 0 === l && (l = 1), "string" != typeof e)throw new Error("Template7: Template must be a string");
            var f = i(e), c = "ctx_" + l;
            if (0 === f.length)return function () {
                return ""
            };
            var u = "";
            u += 1 === l ? "(function (" + c + ", data, root) {\n" : "(function (" + c + ", data) {\n", 1 === l && (u += "function isArray(arr){return Object.prototype.toString.apply(arr) === '[object Array]';}\n", u += "function isFunction(func){return (typeof func === 'function');}\n", u += 'function c(val, ctx) {if (typeof val !== "undefined" && val !== null) {if (isFunction(val)) {return val.call(ctx);} else return val;} else return "";}\n', u += "root = root || ctx_1 || {};\n"), u += "var r = '';\n";
            var h;
            for (h = 0; h < f.length; h += 1) {
                var d = f[h];
                if ("plain" !== d.type) {
                    var v = void 0, g = void 0;
                    if ("variable" === d.type && (v = t(d.contextName, c), u += "r += c(" + v + ", " + c + ");"), "helper" === d.type)if (d.helperName in a.helpers) g = r(d.contextName, c), u += "r += (Template7.helpers." + d.helperName + ").call(" + c + ", " + (g && g + ", ") + "{hash:" + JSON.stringify(d.hash) + ", data: data || {}, fn: " + p(d, l + 1) + ", inverse: " + s(d, l + 1) + ", root: root});"; else {
                        if (d.contextName.length > 0)throw new Error('Template7: Missing helper: "' + d.helperName + '"');
                        v = t(d.helperName, c), u += "if (" + v + ") {", u += "if (isArray(" + v + ")) {", u += "r += (Template7.helpers.each).call(" + c + ", " + v + ", {hash:" + JSON.stringify(d.hash) + ", data: data || {}, fn: " + p(d, l + 1) + ", inverse: " + s(d, l + 1) + ", root: root});", u += "}else {", u += "r += (Template7.helpers.with).call(" + c + ", " + v + ", {hash:" + JSON.stringify(d.hash) + ", data: data || {}, fn: " + p(d, l + 1) + ", inverse: " + s(d, l + 1) + ", root: root});", u += "}}"
                    }
                } else u += "r +='" + d.content.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/'/g, "\\'") + "';"
            }
            return u += "\nreturn r;})", eval.call(o, u)
        }

        var a = this;
        a.template = e, a.compile = function (e) {
            return a.compiled || (a.compiled = n(e)), a.compiled
        }
    };
    return s.prototype = {
        options: {}, partials: {}, helpers: {
            _partial: function (e, t) {
                var r = s.prototype.partials[e];
                if (!r || r && !r.template)return "";
                r.compiled || (r.compiled = new s(r.template).compile());
                var n = this;
                for (var i in t.hash)n[i] = t.hash[i];
                return r.compiled(n, t.data, t.root)
            }, escape: function (e, t) {
                if ("string" != typeof e)throw new Error('Template7: Passed context to "escape" helper should be a string');
                return r(e)
            }, if: function (e, r) {
                var n = e;
                return t(n) && (n = n.call(this)), n ? r.fn(this, r.data) : r.inverse(this, r.data)
            }, unless: function (e, r) {
                var n = e;
                return t(n) && (n = n.call(this)), n ? r.inverse(this, r.data) : r.fn(this, r.data)
            }, each: function (r, n) {
                var i = r, a = "", o = 0;
                if (t(i) && (i = i.call(this)), e(i)) {
                    for (n.hash.reverse && (i = i.reverse()), o = 0; o < i.length; o += 1)a += n.fn(i[o], {
                        first: 0 === o,
                        last: o === i.length - 1,
                        index: o
                    });
                    n.hash.reverse && (i = i.reverse())
                } else for (var l in i)o += 1, a += n.fn(i[l], {key: l});
                return o > 0 ? a : n.inverse(this)
            }, with: function (e, r) {
                var n = e;
                return t(n) && (n = e.call(this)), r.fn(n)
            }, join: function (e, r) {
                var n = e;
                return t(n) && (n = n.call(this)), n.join(r.hash.delimiter || r.hash.delimeter)
            }, js: function (e, t) {
                var r;
                return r = e.indexOf("return") >= 0 ? "(function(){" + e + "})" : "(function(){return (" + e + ")})", eval.call(this, r).call(this)
            }, js_compare: function (e, t) {
                var r;
                return r = e.indexOf("return") >= 0 ? "(function(){" + e + "})" : "(function(){return (" + e + ")})", eval.call(this, r).call(this) ? t.fn(this, t.data) : t.inverse(this, t.data)
            }
        }
    }, a.registerHelper = function (e, t) {
        s.prototype.helpers[e] = t
    }, a.unregisterHelper = function (e) {
        s.prototype.helpers[e] = void 0, delete s.prototype.helpers[e]
    }, a.registerPartial = function (e, t) {
        s.prototype.partials[e] = {template: t}
    }, a.unregisterPartial = function (e) {
        s.prototype.partials[e] && (s.prototype.partials[e] = void 0, delete s.prototype.partials[e])
    }, a.compile = function (e, t) {
        return new s(e, t).compile()
    }, a.options = s.prototype.options, a.helpers = s.prototype.helpers, a.partials = s.prototype.partials, a
});
//# sourceMappingURL=template7.min.js.map