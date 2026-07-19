/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ze = globalThis, Gi = Ze.ShadowRoot && (Ze.ShadyCSS === void 0 || Ze.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Yi = Symbol(), w1 = /* @__PURE__ */ new WeakMap();
let i0 = class {
  constructor(t, e, n) {
    if (this._$cssResult$ = !0, n !== Yi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Gi && t === void 0) {
      const n = e !== void 0 && e.length === 1;
      n && (t = w1.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), n && w1.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const fs = (i) => new i0(typeof i == "string" ? i : i + "", void 0, Yi), Xi = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((n, s, a) => n + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + i[a + 1], i[0]);
  return new i0(e, i, Yi);
}, us = (i, t) => {
  if (Gi) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const n = document.createElement("style"), s = Ze.litNonce;
    s !== void 0 && n.setAttribute("nonce", s), n.textContent = e.cssText, i.appendChild(n);
  }
}, v1 = Gi ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const n of t.cssRules) e += n.cssText;
  return fs(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: gs, defineProperty: ps, getOwnPropertyDescriptor: ms, getOwnPropertyNames: ws, getOwnPropertySymbols: vs, getPrototypeOf: ys } = Object, ci = globalThis, y1 = ci.trustedTypes, bs = y1 ? y1.emptyScript : "", xs = ci.reactiveElementPolyfillSupport, ge = (i, t) => i, ti = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? bs : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, Ki = (i, t) => !gs(i, t), b1 = { attribute: !0, type: String, converter: ti, reflect: !1, useDefault: !1, hasChanged: Ki };
Symbol.metadata ??= Symbol("metadata"), ci.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let jt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = b1) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const n = Symbol(), s = this.getPropertyDescriptor(t, n, e);
      s !== void 0 && ps(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, n) {
    const { get: s, set: a } = ms(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: s, set(r) {
      const o = s?.call(this);
      a?.call(this, r), this.requestUpdate(t, o, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? b1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ge("elementProperties"))) return;
    const t = ys(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ge("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ge("properties"))) {
      const e = this.properties, n = [...ws(e), ...vs(e)];
      for (const s of n) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [n, s] of e) this.elementProperties.set(n, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, n] of this.elementProperties) {
      const s = this._$Eu(e, n);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const n = new Set(t.flat(1 / 0).reverse());
      for (const s of n) e.unshift(v1(s));
    } else t !== void 0 && e.push(v1(t));
    return e;
  }
  static _$Eu(t, e) {
    const n = e.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const n of e.keys()) this.hasOwnProperty(n) && (t.set(n, this[n]), delete this[n]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return us(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, n) {
    this._$AK(t, n);
  }
  _$ET(t, e) {
    const n = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, n);
    if (s !== void 0 && n.reflect === !0) {
      const a = (n.converter?.toAttribute !== void 0 ? n.converter : ti).toAttribute(e, n.type);
      this._$Em = t, a == null ? this.removeAttribute(s) : this.setAttribute(s, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const n = this.constructor, s = n._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const a = n.getPropertyOptions(s), r = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : ti;
      this._$Em = s;
      const o = r.fromAttribute(e, a.type);
      this[s] = o ?? this._$Ej?.get(s) ?? o, this._$Em = null;
    }
  }
  requestUpdate(t, e, n, s = !1, a) {
    if (t !== void 0) {
      const r = this.constructor;
      if (s === !1 && (a = this[t]), n ??= r.getPropertyOptions(t), !((n.hasChanged ?? Ki)(a, e) || n.useDefault && n.reflect && a === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, n)))) return;
      this.C(t, e, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: n, reflect: s, wrapped: a }, r) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), a !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || n || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [s, a] of n) {
        const { wrapped: r } = a, o = this[s];
        r !== !0 || this._$AL.has(s) || o === void 0 || this.C(s, void 0, a, o);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
jt.elementStyles = [], jt.shadowRootOptions = { mode: "open" }, jt[ge("elementProperties")] = /* @__PURE__ */ new Map(), jt[ge("finalized")] = /* @__PURE__ */ new Map(), xs?.({ ReactiveElement: jt }), (ci.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Zi = globalThis, x1 = (i) => i, ei = Zi.trustedTypes, k1 = ei ? ei.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, n0 = "$lit$", mt = `lit$${Math.random().toFixed(9).slice(2)}$`, s0 = "?" + mt, ks = `<${s0}>`, Rt = document, xe = () => Rt.createComment(""), ke = (i) => i === null || typeof i != "object" && typeof i != "function", Ji = Array.isArray, Ms = (i) => Ji(i) || typeof i?.[Symbol.iterator] == "function", yi = `[ 	
\f\r]`, ae = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, M1 = /-->/g, C1 = />/g, Pt = RegExp(`>|${yi}(?:([^\\s"'>=/]+)(${yi}*=${yi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), S1 = /'/g, P1 = /"/g, a0 = /^(?:script|style|textarea|title)$/i, Cs = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), E = Cs(1), Kt = Symbol.for("lit-noChange"), q = Symbol.for("lit-nothing"), z1 = /* @__PURE__ */ new WeakMap(), Nt = Rt.createTreeWalker(Rt, 129);
function r0(i, t) {
  if (!Ji(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return k1 !== void 0 ? k1.createHTML(t) : t;
}
const Ss = (i, t) => {
  const e = i.length - 1, n = [];
  let s, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = ae;
  for (let o = 0; o < e; o++) {
    const l = i[o];
    let d, c, h = -1, _ = 0;
    for (; _ < l.length && (r.lastIndex = _, c = r.exec(l), c !== null); ) _ = r.lastIndex, r === ae ? c[1] === "!--" ? r = M1 : c[1] !== void 0 ? r = C1 : c[2] !== void 0 ? (a0.test(c[2]) && (s = RegExp("</" + c[2], "g")), r = Pt) : c[3] !== void 0 && (r = Pt) : r === Pt ? c[0] === ">" ? (r = s ?? ae, h = -1) : c[1] === void 0 ? h = -2 : (h = r.lastIndex - c[2].length, d = c[1], r = c[3] === void 0 ? Pt : c[3] === '"' ? P1 : S1) : r === P1 || r === S1 ? r = Pt : r === M1 || r === C1 ? r = ae : (r = Pt, s = void 0);
    const f = r === Pt && i[o + 1].startsWith("/>") ? " " : "";
    a += r === ae ? l + ks : h >= 0 ? (n.push(d), l.slice(0, h) + n0 + l.slice(h) + mt + f) : l + mt + (h === -2 ? o : f);
  }
  return [r0(i, a + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), n];
};
class Me {
  constructor({ strings: t, _$litType$: e }, n) {
    let s;
    this.parts = [];
    let a = 0, r = 0;
    const o = t.length - 1, l = this.parts, [d, c] = Ss(t, e);
    if (this.el = Me.createElement(d, n), Nt.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (s = Nt.nextNode()) !== null && l.length < o; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const h of s.getAttributeNames()) if (h.endsWith(n0)) {
          const _ = c[r++], f = s.getAttribute(h).split(mt), g = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: a, name: g[2], strings: f, ctor: g[1] === "." ? zs : g[1] === "?" ? Ts : g[1] === "@" ? Ls : hi }), s.removeAttribute(h);
        } else h.startsWith(mt) && (l.push({ type: 6, index: a }), s.removeAttribute(h));
        if (a0.test(s.tagName)) {
          const h = s.textContent.split(mt), _ = h.length - 1;
          if (_ > 0) {
            s.textContent = ei ? ei.emptyScript : "";
            for (let f = 0; f < _; f++) s.append(h[f], xe()), Nt.nextNode(), l.push({ type: 2, index: ++a });
            s.append(h[_], xe());
          }
        }
      } else if (s.nodeType === 8) if (s.data === s0) l.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = s.data.indexOf(mt, h + 1)) !== -1; ) l.push({ type: 7, index: a }), h += mt.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const n = Rt.createElement("template");
    return n.innerHTML = t, n;
  }
}
function Zt(i, t, e = i, n) {
  if (t === Kt) return t;
  let s = n !== void 0 ? e._$Co?.[n] : e._$Cl;
  const a = ke(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== a && (s?._$AO?.(!1), a === void 0 ? s = void 0 : (s = new a(i), s._$AT(i, e, n)), n !== void 0 ? (e._$Co ??= [])[n] = s : e._$Cl = s), s !== void 0 && (t = Zt(i, s._$AS(i, t.values), s, n)), t;
}
class Ps {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: n } = this._$AD, s = (t?.creationScope ?? Rt).importNode(e, !0);
    Nt.currentNode = s;
    let a = Nt.nextNode(), r = 0, o = 0, l = n[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let d;
        l.type === 2 ? d = new Le(a, a.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(a, l.name, l.strings, this, t) : l.type === 6 && (d = new As(a, this, t)), this._$AV.push(d), l = n[++o];
      }
      r !== l?.index && (a = Nt.nextNode(), r++);
    }
    return Nt.currentNode = Rt, s;
  }
  p(t) {
    let e = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(t, n, e), e += n.strings.length - 2) : n._$AI(t[e])), e++;
  }
}
class Le {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, n, s) {
    this.type = 2, this._$AH = q, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = n, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = Zt(this, t, e), ke(t) ? t === q || t == null || t === "" ? (this._$AH !== q && this._$AR(), this._$AH = q) : t !== this._$AH && t !== Kt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ms(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== q && ke(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Rt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: n } = t, s = typeof n == "number" ? this._$AC(t) : (n.el === void 0 && (n.el = Me.createElement(r0(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const a = new Ps(s, this), r = a.u(this.options);
      a.p(e), this.T(r), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = z1.get(t.strings);
    return e === void 0 && z1.set(t.strings, e = new Me(t)), e;
  }
  k(t) {
    Ji(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let n, s = 0;
    for (const a of t) s === e.length ? e.push(n = new Le(this.O(xe()), this.O(xe()), this, this.options)) : n = e[s], n._$AI(a), s++;
    s < e.length && (this._$AR(n && n._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const n = x1(t).nextSibling;
      x1(t).remove(), t = n;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class hi {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, n, s, a) {
    this.type = 1, this._$AH = q, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = a, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = q;
  }
  _$AI(t, e = this, n, s) {
    const a = this.strings;
    let r = !1;
    if (a === void 0) t = Zt(this, t, e, 0), r = !ke(t) || t !== this._$AH && t !== Kt, r && (this._$AH = t);
    else {
      const o = t;
      let l, d;
      for (t = a[0], l = 0; l < a.length - 1; l++) d = Zt(this, o[n + l], e, l), d === Kt && (d = this._$AH[l]), r ||= !ke(d) || d !== this._$AH[l], d === q ? t = q : t !== q && (t += (d ?? "") + a[l + 1]), this._$AH[l] = d;
    }
    r && !s && this.j(t);
  }
  j(t) {
    t === q ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class zs extends hi {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === q ? void 0 : t;
  }
}
class Ts extends hi {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== q);
  }
}
class Ls extends hi {
  constructor(t, e, n, s, a) {
    super(t, e, n, s, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = Zt(this, t, e, 0) ?? q) === Kt) return;
    const n = this._$AH, s = t === q && n !== q || t.capture !== n.capture || t.once !== n.once || t.passive !== n.passive, a = t !== q && (n === q || s);
    s && this.element.removeEventListener(this.name, this, n), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class As {
  constructor(t, e, n) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Zt(this, t);
  }
}
const qs = Zi.litHtmlPolyfillSupport;
qs?.(Me, Le), (Zi.litHtmlVersions ??= []).push("3.3.3");
const Hs = (i, t, e) => {
  const n = e?.renderBefore ?? t;
  let s = n._$litPart$;
  if (s === void 0) {
    const a = e?.renderBefore ?? null;
    n._$litPart$ = s = new Le(t.insertBefore(xe(), a), a, void 0, e ?? {});
  }
  return s._$AI(i), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qi = globalThis;
class Gt extends jt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Hs(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Kt;
  }
}
Gt._$litElement$ = !0, Gt.finalized = !0, Qi.litElementHydrateSupport?.({ LitElement: Gt });
const Ns = Qi.litElementPolyfillSupport;
Ns?.({ LitElement: Gt });
(Qi.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o0 = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bs = { attribute: !0, type: String, converter: ti, reflect: !1, hasChanged: Ki }, Os = (i = Bs, t, e) => {
  const { kind: n, metadata: s } = e;
  let a = globalThis.litPropertyMetadata.get(s);
  if (a === void 0 && globalThis.litPropertyMetadata.set(s, a = /* @__PURE__ */ new Map()), n === "setter" && ((i = Object.create(i)).wrapped = !0), a.set(e.name, i), n === "accessor") {
    const { name: r } = e;
    return { set(o) {
      const l = t.get.call(this);
      t.set.call(this, o), this.requestUpdate(r, l, i, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(r, void 0, i, o), o;
    } };
  }
  if (n === "setter") {
    const { name: r } = e;
    return function(o) {
      const l = this[r];
      t.call(this, o), this.requestUpdate(r, l, i, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function t1(i) {
  return (t, e) => typeof e == "object" ? Os(i, t, e) : ((n, s, a) => {
    const r = s.hasOwnProperty(a);
    return s.constructor.createProperty(a, n), r ? Object.getOwnPropertyDescriptor(s, a) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function _i(i) {
  return t1({ ...i, state: !0, attribute: !1 });
}
function Ds(i, t) {
  switch (i) {
    case "sunny":
      return "clear-day";
    case "clear-night":
      return "clear-night";
    case "partlycloudy":
      return t ? "cloudy" : "clear-night";
    case "cloudy":
    case "windy-variant":
      return "cloudy";
    case "rainy":
    case "pouring":
    case "hail":
    case "snowy-rainy":
      return "rain";
    case "snowy":
      return "snow";
    case "lightning":
    case "lightning-rainy":
    case "exceptional":
      return "storm";
    case "fog":
      return "fog";
    case "windy":
      return "wind";
    default:
      return t ? "clear-day" : "clear-night";
  }
}
function Rs(i, t) {
  return i ? E`
    <div class="vk-bg vk-bg--${t}" aria-hidden="true">
      <div class="vk-bg__layer vk-bg__sky"></div>
      <div class="vk-bg__layer vk-bg__clouds"></div>
      <div class="vk-bg__layer vk-bg__precip"></div>
      <div class="vk-bg__layer vk-bg__fx"></div>
      <div class="vk-bg__scrim"></div>
    </div>
  ` : q;
}
const Es = Xi`
  .vk-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: var(--ha-card-border-radius, 12px);
    pointer-events: none;
    z-index: 0;
  }
  .vk-bg__layer {
    position: absolute;
    inset: 0;
  }
  .vk-bg__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
  }
  .vk-bg--clear-day .vk-bg__sky {
    background: linear-gradient(180deg, #4aa8ff 0%, #a8d4ff 55%, #e8f4ff 100%);
  }
  .vk-bg--clear-day .vk-bg__fx {
    background: radial-gradient(
      circle at 78% 18%,
      rgba(255, 230, 120, 0.95) 0%,
      rgba(255, 230, 120, 0.4) 12%,
      transparent 28%
    );
  }
  .vk-bg--clear-night .vk-bg__sky {
    background: linear-gradient(180deg, #0b1224 0%, #1a2744 60%, #2a3a5c 100%);
  }
  .vk-bg--clear-night .vk-bg__fx {
    background-image:
      radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 40% 70%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 65% 25%, #fff 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 80% 55%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 55% 15%, #fff 50%, transparent 51%);
    opacity: 0.85;
  }
  .vk-bg--cloudy .vk-bg__sky {
    background: linear-gradient(180deg, #6b7c93 0%, #9aabbd 50%, #c5d0db 100%);
  }
  .vk-bg--cloudy .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 40% 22% at 25% 35%,
        rgba(255, 255, 255, 0.55),
        transparent 70%
      ),
      radial-gradient(
        ellipse 45% 24% at 70% 40%,
        rgba(255, 255, 255, 0.45),
        transparent 70%
      );
    animation: vk-drift 28s linear infinite;
  }
  .vk-bg--rain .vk-bg__sky {
    background: linear-gradient(180deg, #3d4f66 0%, #5a6e86 60%, #74879c 100%);
  }
  .vk-bg--rain .vk-bg__precip {
    background-image: repeating-linear-gradient(
      -20deg,
      transparent,
      transparent 8px,
      rgba(200, 220, 255, 0.35) 8px,
      rgba(200, 220, 255, 0.35) 10px
    );
    background-size: 24px 40px;
    animation: vk-rain 0.55s linear infinite;
    opacity: 0.55;
  }
  .vk-bg--snow .vk-bg__sky {
    background: linear-gradient(180deg, #7a8fa8 0%, #b0c0d2 55%, #dce6f0 100%);
  }
  .vk-bg--snow .vk-bg__precip {
    background-image:
      radial-gradient(circle, #fff 1.2px, transparent 1.4px),
      radial-gradient(circle, #fff 1px, transparent 1.2px);
    background-size: 36px 36px, 52px 52px;
    background-position: 0 0, 18px 12px;
    animation: vk-snow 4.5s linear infinite;
    opacity: 0.7;
  }
  .vk-bg--storm .vk-bg__sky {
    background: linear-gradient(180deg, #1c2230 0%, #2e3a4e 50%, #3d4d63 100%);
  }
  .vk-bg--storm .vk-bg__fx {
    animation: vk-flash 7s ease-in-out infinite;
  }
  .vk-bg--storm .vk-bg__precip {
    background-image: repeating-linear-gradient(
      -25deg,
      transparent,
      transparent 7px,
      rgba(180, 200, 255, 0.4) 7px,
      rgba(180, 200, 255, 0.4) 9px
    );
    background-size: 20px 36px;
    animation: vk-rain 0.4s linear infinite;
    opacity: 0.45;
  }
  .vk-bg--fog .vk-bg__sky {
    background: linear-gradient(180deg, #8a939e 0%, #b4bcc6 50%, #d0d6dc 100%);
  }
  .vk-bg--fog .vk-bg__clouds {
    background: linear-gradient(
      180deg,
      transparent 20%,
      rgba(255, 255, 255, 0.45) 45%,
      rgba(255, 255, 255, 0.55) 70%,
      transparent 95%
    );
    animation: vk-fog 12s ease-in-out infinite alternate;
  }
  .vk-bg--wind .vk-bg__sky {
    background: linear-gradient(180deg, #5d8eb8 0%, #8eb4d4 55%, #c5dced 100%);
  }
  .vk-bg--wind .vk-bg__fx {
    background: repeating-linear-gradient(
      95deg,
      transparent,
      transparent 40px,
      rgba(255, 255, 255, 0.12) 40px,
      rgba(255, 255, 255, 0.12) 42px
    );
    animation: vk-drift 8s linear infinite;
  }
  @keyframes vk-rain {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 24px 40px;
    }
  }
  @keyframes vk-snow {
    from {
      background-position: 0 0, 18px 12px;
    }
    to {
      background-position: 0 36px, 18px 64px;
    }
  }
  @keyframes vk-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(8%);
    }
  }
  @keyframes vk-fog {
    from {
      opacity: 0.55;
      transform: translateY(0);
    }
    to {
      opacity: 0.85;
      transform: translateY(-4%);
    }
  }
  @keyframes vk-flash {
    0%,
    88%,
    100% {
      background: transparent;
    }
    90%,
    92% {
      background: rgba(255, 255, 220, 0.35);
    }
  }
`;
/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */
function Ae(i) {
  return i + 0.5 | 0;
}
const wt = (i, t, e) => Math.max(Math.min(i, e), t);
function _e(i) {
  return wt(Ae(i * 2.55), 0, 255);
}
function xt(i) {
  return wt(Ae(i * 255), 0, 255);
}
function ut(i) {
  return wt(Ae(i / 2.55) / 100, 0, 1);
}
function T1(i) {
  return wt(Ae(i * 100), 0, 100);
}
const it = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, Di = [..."0123456789ABCDEF"], $s = (i) => Di[i & 15], Vs = (i) => Di[(i & 240) >> 4] + Di[i & 15], Ne = (i) => (i & 240) >> 4 === (i & 15), Ws = (i) => Ne(i.r) && Ne(i.g) && Ne(i.b) && Ne(i.a);
function Is(i) {
  var t = i.length, e;
  return i[0] === "#" && (t === 4 || t === 5 ? e = {
    r: 255 & it[i[1]] * 17,
    g: 255 & it[i[2]] * 17,
    b: 255 & it[i[3]] * 17,
    a: t === 5 ? it[i[4]] * 17 : 255
  } : (t === 7 || t === 9) && (e = {
    r: it[i[1]] << 4 | it[i[2]],
    g: it[i[3]] << 4 | it[i[4]],
    b: it[i[5]] << 4 | it[i[6]],
    a: t === 9 ? it[i[7]] << 4 | it[i[8]] : 255
  })), e;
}
const Us = (i, t) => i < 255 ? t(i) : "";
function Fs(i) {
  var t = Ws(i) ? $s : Vs;
  return i ? "#" + t(i.r) + t(i.g) + t(i.b) + Us(i.a, t) : void 0;
}
const js = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function l0(i, t, e) {
  const n = t * Math.min(e, 1 - e), s = (a, r = (a + i / 30) % 12) => e - n * Math.max(Math.min(r - 3, 9 - r, 1), -1);
  return [s(0), s(8), s(4)];
}
function Gs(i, t, e) {
  const n = (s, a = (s + i / 60) % 6) => e - e * t * Math.max(Math.min(a, 4 - a, 1), 0);
  return [n(5), n(3), n(1)];
}
function Ys(i, t, e) {
  const n = l0(i, 1, 0.5);
  let s;
  for (t + e > 1 && (s = 1 / (t + e), t *= s, e *= s), s = 0; s < 3; s++)
    n[s] *= 1 - t - e, n[s] += t;
  return n;
}
function Xs(i, t, e, n, s) {
  return i === s ? (t - e) / n + (t < e ? 6 : 0) : t === s ? (e - i) / n + 2 : (i - t) / n + 4;
}
function e1(i) {
  const e = i.r / 255, n = i.g / 255, s = i.b / 255, a = Math.max(e, n, s), r = Math.min(e, n, s), o = (a + r) / 2;
  let l, d, c;
  return a !== r && (c = a - r, d = o > 0.5 ? c / (2 - a - r) : c / (a + r), l = Xs(e, n, s, c, a), l = l * 60 + 0.5), [l | 0, d || 0, o];
}
function i1(i, t, e, n) {
  return (Array.isArray(t) ? i(t[0], t[1], t[2]) : i(t, e, n)).map(xt);
}
function n1(i, t, e) {
  return i1(l0, i, t, e);
}
function Ks(i, t, e) {
  return i1(Ys, i, t, e);
}
function Zs(i, t, e) {
  return i1(Gs, i, t, e);
}
function d0(i) {
  return (i % 360 + 360) % 360;
}
function Js(i) {
  const t = js.exec(i);
  let e = 255, n;
  if (!t)
    return;
  t[5] !== n && (e = t[6] ? _e(+t[5]) : xt(+t[5]));
  const s = d0(+t[2]), a = +t[3] / 100, r = +t[4] / 100;
  return t[1] === "hwb" ? n = Ks(s, a, r) : t[1] === "hsv" ? n = Zs(s, a, r) : n = n1(s, a, r), {
    r: n[0],
    g: n[1],
    b: n[2],
    a: e
  };
}
function Qs(i, t) {
  var e = e1(i);
  e[0] = d0(e[0] + t), e = n1(e), i.r = e[0], i.g = e[1], i.b = e[2];
}
function ta(i) {
  if (!i)
    return;
  const t = e1(i), e = t[0], n = T1(t[1]), s = T1(t[2]);
  return i.a < 255 ? `hsla(${e}, ${n}%, ${s}%, ${ut(i.a)})` : `hsl(${e}, ${n}%, ${s}%)`;
}
const L1 = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
}, A1 = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function ea() {
  const i = {}, t = Object.keys(A1), e = Object.keys(L1);
  let n, s, a, r, o;
  for (n = 0; n < t.length; n++) {
    for (r = o = t[n], s = 0; s < e.length; s++)
      a = e[s], o = o.replace(a, L1[a]);
    a = parseInt(A1[r], 16), i[o] = [a >> 16 & 255, a >> 8 & 255, a & 255];
  }
  return i;
}
let Be;
function ia(i) {
  Be || (Be = ea(), Be.transparent = [0, 0, 0, 0]);
  const t = Be[i.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const na = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function sa(i) {
  const t = na.exec(i);
  let e = 255, n, s, a;
  if (t) {
    if (t[7] !== n) {
      const r = +t[7];
      e = t[8] ? _e(r) : wt(r * 255, 0, 255);
    }
    return n = +t[1], s = +t[3], a = +t[5], n = 255 & (t[2] ? _e(n) : wt(n, 0, 255)), s = 255 & (t[4] ? _e(s) : wt(s, 0, 255)), a = 255 & (t[6] ? _e(a) : wt(a, 0, 255)), {
      r: n,
      g: s,
      b: a,
      a: e
    };
  }
}
function aa(i) {
  return i && (i.a < 255 ? `rgba(${i.r}, ${i.g}, ${i.b}, ${ut(i.a)})` : `rgb(${i.r}, ${i.g}, ${i.b})`);
}
const bi = (i) => i <= 31308e-7 ? i * 12.92 : Math.pow(i, 1 / 2.4) * 1.055 - 0.055, Ut = (i) => i <= 0.04045 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
function ra(i, t, e) {
  const n = Ut(ut(i.r)), s = Ut(ut(i.g)), a = Ut(ut(i.b));
  return {
    r: xt(bi(n + e * (Ut(ut(t.r)) - n))),
    g: xt(bi(s + e * (Ut(ut(t.g)) - s))),
    b: xt(bi(a + e * (Ut(ut(t.b)) - a))),
    a: i.a + e * (t.a - i.a)
  };
}
function Oe(i, t, e) {
  if (i) {
    let n = e1(i);
    n[t] = Math.max(0, Math.min(n[t] + n[t] * e, t === 0 ? 360 : 1)), n = n1(n), i.r = n[0], i.g = n[1], i.b = n[2];
  }
}
function c0(i, t) {
  return i && Object.assign(t || {}, i);
}
function q1(i) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(i) ? i.length >= 3 && (t = { r: i[0], g: i[1], b: i[2], a: 255 }, i.length > 3 && (t.a = xt(i[3]))) : (t = c0(i, { r: 0, g: 0, b: 0, a: 1 }), t.a = xt(t.a)), t;
}
function oa(i) {
  return i.charAt(0) === "r" ? sa(i) : Js(i);
}
class Ce {
  constructor(t) {
    if (t instanceof Ce)
      return t;
    const e = typeof t;
    let n;
    e === "object" ? n = q1(t) : e === "string" && (n = Is(t) || ia(t) || oa(t)), this._rgb = n, this._valid = !!n;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = c0(this._rgb);
    return t && (t.a = ut(t.a)), t;
  }
  set rgb(t) {
    this._rgb = q1(t);
  }
  rgbString() {
    return this._valid ? aa(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? Fs(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? ta(this._rgb) : void 0;
  }
  mix(t, e) {
    if (t) {
      const n = this.rgb, s = t.rgb;
      let a;
      const r = e === a ? 0.5 : e, o = 2 * r - 1, l = n.a - s.a, d = ((o * l === -1 ? o : (o + l) / (1 + o * l)) + 1) / 2;
      a = 1 - d, n.r = 255 & d * n.r + a * s.r + 0.5, n.g = 255 & d * n.g + a * s.g + 0.5, n.b = 255 & d * n.b + a * s.b + 0.5, n.a = r * n.a + (1 - r) * s.a, this.rgb = n;
    }
    return this;
  }
  interpolate(t, e) {
    return t && (this._rgb = ra(this._rgb, t._rgb, e)), this;
  }
  clone() {
    return new Ce(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = xt(t), this;
  }
  clearer(t) {
    const e = this._rgb;
    return e.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, e = Ae(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return t.r = t.g = t.b = e, this;
  }
  opaquer(t) {
    const e = this._rgb;
    return e.a *= 1 + t, this;
  }
  negate() {
    const t = this._rgb;
    return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this;
  }
  lighten(t) {
    return Oe(this._rgb, 2, t), this;
  }
  darken(t) {
    return Oe(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return Oe(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return Oe(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return Qs(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
function ct() {
}
const la = /* @__PURE__ */ (() => {
  let i = 0;
  return () => i++;
})();
function L(i) {
  return i == null;
}
function W(i) {
  if (Array.isArray && Array.isArray(i))
    return !0;
  const t = Object.prototype.toString.call(i);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function T(i) {
  return i !== null && Object.prototype.toString.call(i) === "[object Object]";
}
function Y(i) {
  return (typeof i == "number" || i instanceof Number) && isFinite(+i);
}
function at(i, t) {
  return Y(i) ? i : t;
}
function S(i, t) {
  return typeof i > "u" ? t : i;
}
const da = (i, t) => typeof i == "string" && i.endsWith("%") ? parseFloat(i) / 100 * t : +i;
function B(i, t, e) {
  if (i && typeof i.call == "function")
    return i.apply(e, t);
}
function H(i, t, e, n) {
  let s, a, r;
  if (W(i))
    for (a = i.length, s = 0; s < a; s++)
      t.call(e, i[s], s);
  else if (T(i))
    for (r = Object.keys(i), a = r.length, s = 0; s < a; s++)
      t.call(e, i[r[s]], r[s]);
}
function ii(i, t) {
  let e, n, s, a;
  if (!i || !t || i.length !== t.length)
    return !1;
  for (e = 0, n = i.length; e < n; ++e)
    if (s = i[e], a = t[e], s.datasetIndex !== a.datasetIndex || s.index !== a.index)
      return !1;
  return !0;
}
function ni(i) {
  if (W(i))
    return i.map(ni);
  if (T(i)) {
    const t = /* @__PURE__ */ Object.create(null), e = Object.keys(i), n = e.length;
    let s = 0;
    for (; s < n; ++s)
      t[e[s]] = ni(i[e[s]]);
    return t;
  }
  return i;
}
function h0(i) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(i) === -1;
}
function ca(i, t, e, n) {
  if (!h0(i))
    return;
  const s = t[i], a = e[i];
  T(s) && T(a) ? dt(s, a, n) : t[i] = ni(a);
}
function dt(i, t, e) {
  const n = W(t) ? t : [
    t
  ], s = n.length;
  if (!T(i))
    return i;
  e = e || {};
  const a = e.merger || ca;
  let r;
  for (let o = 0; o < s; ++o) {
    if (r = n[o], !T(r))
      continue;
    const l = Object.keys(r);
    for (let d = 0, c = l.length; d < c; ++d)
      a(l[d], i, r, e);
  }
  return i;
}
function pe(i, t) {
  return dt(i, t, {
    merger: ha
  });
}
function ha(i, t, e) {
  if (!h0(i))
    return;
  const n = t[i], s = e[i];
  T(n) && T(s) ? pe(n, s) : Object.prototype.hasOwnProperty.call(t, i) || (t[i] = ni(s));
}
const H1 = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (i) => i,
  // default resolvers
  x: (i) => i.x,
  y: (i) => i.y
};
function _a(i) {
  const t = i.split("."), e = [];
  let n = "";
  for (const s of t)
    n += s, n.endsWith("\\") ? n = n.slice(0, -1) + "." : (e.push(n), n = "");
  return e;
}
function fa(i) {
  const t = _a(i);
  return (e) => {
    for (const n of t) {
      if (n === "")
        break;
      e = e && e[n];
    }
    return e;
  };
}
function Jt(i, t) {
  return (H1[t] || (H1[t] = fa(t)))(i);
}
function s1(i) {
  return i.charAt(0).toUpperCase() + i.slice(1);
}
const Se = (i) => typeof i < "u", kt = (i) => typeof i == "function", N1 = (i, t) => {
  if (i.size !== t.size)
    return !1;
  for (const e of i)
    if (!t.has(e))
      return !1;
  return !0;
};
function ua(i) {
  return i.type === "mouseup" || i.type === "click" || i.type === "contextmenu";
}
const O = Math.PI, I = 2 * O, ga = I + O, si = Number.POSITIVE_INFINITY, pa = O / 180, F = O / 2, zt = O / 4, B1 = O * 2 / 3, _0 = Math.log10, lt = Math.sign;
function me(i, t, e) {
  return Math.abs(i - t) < e;
}
function O1(i) {
  const t = Math.round(i);
  i = me(i, t, i / 1e3) ? t : i;
  const e = Math.pow(10, Math.floor(_0(i))), n = i / e;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * e;
}
function ma(i) {
  const t = [], e = Math.sqrt(i);
  let n;
  for (n = 1; n < e; n++)
    i % n === 0 && (t.push(n), t.push(i / n));
  return e === (e | 0) && t.push(e), t.sort((s, a) => s - a).pop(), t;
}
function wa(i) {
  return typeof i == "symbol" || typeof i == "object" && i !== null && !(Symbol.toPrimitive in i || "toString" in i || "valueOf" in i);
}
function Pe(i) {
  return !wa(i) && !isNaN(parseFloat(i)) && isFinite(i);
}
function va(i, t) {
  const e = Math.round(i);
  return e - t <= i && e + t >= i;
}
function ya(i, t, e) {
  let n, s, a;
  for (n = 0, s = i.length; n < s; n++)
    a = i[n][e], isNaN(a) || (t.min = Math.min(t.min, a), t.max = Math.max(t.max, a));
}
function Bt(i) {
  return i * (O / 180);
}
function ba(i) {
  return i * (180 / O);
}
function D1(i) {
  if (!Y(i))
    return;
  let t = 1, e = 0;
  for (; Math.round(i * t) / t !== i; )
    t *= 10, e++;
  return e;
}
function f0(i, t) {
  const e = t.x - i.x, n = t.y - i.y, s = Math.sqrt(e * e + n * n);
  let a = Math.atan2(n, e);
  return a < -0.5 * O && (a += I), {
    angle: a,
    distance: s
  };
}
function Ri(i, t) {
  return Math.sqrt(Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2));
}
function xa(i, t) {
  return (i - t + ga) % I - O;
}
function et(i) {
  return (i % I + I) % I;
}
function a1(i, t, e, n) {
  const s = et(i), a = et(t), r = et(e), o = et(a - s), l = et(r - s), d = et(s - a), c = et(s - r);
  return s === a || s === r || n && a === r || o > l && d < c;
}
function G(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function ka(i) {
  return G(i, -32768, 32767);
}
function gt(i, t, e, n = 1e-6) {
  return i >= Math.min(t, e) - n && i <= Math.max(t, e) + n;
}
function r1(i, t, e) {
  e = e || ((r) => i[r] < t);
  let n = i.length - 1, s = 0, a;
  for (; n - s > 1; )
    a = s + n >> 1, e(a) ? s = a : n = a;
  return {
    lo: s,
    hi: n
  };
}
const Ot = (i, t, e, n) => r1(i, e, n ? (s) => {
  const a = i[s][t];
  return a < e || a === e && i[s + 1][t] === e;
} : (s) => i[s][t] < e), Ma = (i, t, e) => r1(i, e, (n) => i[n][t] >= e);
function Ca(i, t, e) {
  let n = 0, s = i.length;
  for (; n < s && i[n] < t; )
    n++;
  for (; s > n && i[s - 1] > e; )
    s--;
  return n > 0 || s < i.length ? i.slice(n, s) : i;
}
const u0 = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function Sa(i, t) {
  if (i._chartjs) {
    i._chartjs.listeners.push(t);
    return;
  }
  Object.defineProperty(i, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: {
      listeners: [
        t
      ]
    }
  }), u0.forEach((e) => {
    const n = "_onData" + s1(e), s = i[e];
    Object.defineProperty(i, e, {
      configurable: !0,
      enumerable: !1,
      value(...a) {
        const r = s.apply(this, a);
        return i._chartjs.listeners.forEach((o) => {
          typeof o[n] == "function" && o[n](...a);
        }), r;
      }
    });
  });
}
function R1(i, t) {
  const e = i._chartjs;
  if (!e)
    return;
  const n = e.listeners, s = n.indexOf(t);
  s !== -1 && n.splice(s, 1), !(n.length > 0) && (u0.forEach((a) => {
    delete i[a];
  }), delete i._chartjs);
}
function g0(i) {
  const t = new Set(i);
  return t.size === i.length ? i : Array.from(t);
}
const p0 = (function() {
  return typeof window > "u" ? function(i) {
    return i();
  } : window.requestAnimationFrame;
})();
function m0(i, t) {
  let e = [], n = !1;
  return function(...s) {
    e = s, n || (n = !0, p0.call(window, () => {
      n = !1, i.apply(t, e);
    }));
  };
}
function Pa(i, t) {
  let e;
  return function(...n) {
    return t ? (clearTimeout(e), e = setTimeout(i, t, n)) : i.apply(this, n), t;
  };
}
const w0 = (i) => i === "start" ? "left" : i === "end" ? "right" : "center", tt = (i, t, e) => i === "start" ? t : i === "end" ? e : (t + e) / 2, za = (i, t, e, n) => i === (n ? "left" : "right") ? e : i === "center" ? (t + e) / 2 : t;
function Ta(i, t, e) {
  const n = t.length;
  let s = 0, a = n;
  if (i._sorted) {
    const { iScale: r, vScale: o, _parsed: l } = i, d = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null, c = r.axis, { min: h, max: _, minDefined: f, maxDefined: g } = r.getUserBounds();
    if (f) {
      if (s = Math.min(
        // @ts-expect-error Need to type _parsed
        Ot(l, c, h).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? n : Ot(t, c, r.getPixelForValue(h)).lo
      ), d) {
        const u = l.slice(0, s + 1).reverse().findIndex((p) => !L(p[o.axis]));
        s -= Math.max(0, u);
      }
      s = G(s, 0, n - 1);
    }
    if (g) {
      let u = Math.max(
        // @ts-expect-error Need to type _parsed
        Ot(l, r.axis, _, !0).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? 0 : Ot(t, c, r.getPixelForValue(_), !0).hi + 1
      );
      if (d) {
        const p = l.slice(u - 1).findIndex((m) => !L(m[o.axis]));
        u += Math.max(0, p);
      }
      a = G(u, s, n) - s;
    } else
      a = n - s;
  }
  return {
    start: s,
    count: a
  };
}
function La(i) {
  const { xScale: t, yScale: e, _scaleRanges: n } = i, s = {
    xmin: t.min,
    xmax: t.max,
    ymin: e.min,
    ymax: e.max
  };
  if (!n)
    return i._scaleRanges = s, !0;
  const a = n.xmin !== t.min || n.xmax !== t.max || n.ymin !== e.min || n.ymax !== e.max;
  return Object.assign(n, s), a;
}
const De = (i) => i === 0 || i === 1, E1 = (i, t, e) => -(Math.pow(2, 10 * (i -= 1)) * Math.sin((i - t) * I / e)), $1 = (i, t, e) => Math.pow(2, -10 * i) * Math.sin((i - t) * I / e) + 1, we = {
  linear: (i) => i,
  easeInQuad: (i) => i * i,
  easeOutQuad: (i) => -i * (i - 2),
  easeInOutQuad: (i) => (i /= 0.5) < 1 ? 0.5 * i * i : -0.5 * (--i * (i - 2) - 1),
  easeInCubic: (i) => i * i * i,
  easeOutCubic: (i) => (i -= 1) * i * i + 1,
  easeInOutCubic: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i : 0.5 * ((i -= 2) * i * i + 2),
  easeInQuart: (i) => i * i * i * i,
  easeOutQuart: (i) => -((i -= 1) * i * i * i - 1),
  easeInOutQuart: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i * i : -0.5 * ((i -= 2) * i * i * i - 2),
  easeInQuint: (i) => i * i * i * i * i,
  easeOutQuint: (i) => (i -= 1) * i * i * i * i + 1,
  easeInOutQuint: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i * i * i : 0.5 * ((i -= 2) * i * i * i * i + 2),
  easeInSine: (i) => -Math.cos(i * F) + 1,
  easeOutSine: (i) => Math.sin(i * F),
  easeInOutSine: (i) => -0.5 * (Math.cos(O * i) - 1),
  easeInExpo: (i) => i === 0 ? 0 : Math.pow(2, 10 * (i - 1)),
  easeOutExpo: (i) => i === 1 ? 1 : -Math.pow(2, -10 * i) + 1,
  easeInOutExpo: (i) => De(i) ? i : i < 0.5 ? 0.5 * Math.pow(2, 10 * (i * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (i * 2 - 1)) + 2),
  easeInCirc: (i) => i >= 1 ? i : -(Math.sqrt(1 - i * i) - 1),
  easeOutCirc: (i) => Math.sqrt(1 - (i -= 1) * i),
  easeInOutCirc: (i) => (i /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - i * i) - 1) : 0.5 * (Math.sqrt(1 - (i -= 2) * i) + 1),
  easeInElastic: (i) => De(i) ? i : E1(i, 0.075, 0.3),
  easeOutElastic: (i) => De(i) ? i : $1(i, 0.075, 0.3),
  easeInOutElastic(i) {
    return De(i) ? i : i < 0.5 ? 0.5 * E1(i * 2, 0.1125, 0.45) : 0.5 + 0.5 * $1(i * 2 - 1, 0.1125, 0.45);
  },
  easeInBack(i) {
    return i * i * ((1.70158 + 1) * i - 1.70158);
  },
  easeOutBack(i) {
    return (i -= 1) * i * ((1.70158 + 1) * i + 1.70158) + 1;
  },
  easeInOutBack(i) {
    let t = 1.70158;
    return (i /= 0.5) < 1 ? 0.5 * (i * i * (((t *= 1.525) + 1) * i - t)) : 0.5 * ((i -= 2) * i * (((t *= 1.525) + 1) * i + t) + 2);
  },
  easeInBounce: (i) => 1 - we.easeOutBounce(1 - i),
  easeOutBounce(i) {
    return i < 1 / 2.75 ? 7.5625 * i * i : i < 2 / 2.75 ? 7.5625 * (i -= 1.5 / 2.75) * i + 0.75 : i < 2.5 / 2.75 ? 7.5625 * (i -= 2.25 / 2.75) * i + 0.9375 : 7.5625 * (i -= 2.625 / 2.75) * i + 0.984375;
  },
  easeInOutBounce: (i) => i < 0.5 ? we.easeInBounce(i * 2) * 0.5 : we.easeOutBounce(i * 2 - 1) * 0.5 + 0.5
};
function o1(i) {
  if (i && typeof i == "object") {
    const t = i.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function V1(i) {
  return o1(i) ? i : new Ce(i);
}
function xi(i) {
  return o1(i) ? i : new Ce(i).saturate(0.5).darken(0.1).hexString();
}
const Aa = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], qa = [
  "color",
  "borderColor",
  "backgroundColor"
];
function Ha(i) {
  i.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  }), i.describe("animation", {
    _fallback: !1,
    _indexable: !1,
    _scriptable: (t) => t !== "onProgress" && t !== "onComplete" && t !== "fn"
  }), i.set("animations", {
    colors: {
      type: "color",
      properties: qa
    },
    numbers: {
      type: "number",
      properties: Aa
    }
  }), i.describe("animations", {
    _fallback: "animation"
  }), i.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (t) => t | 0
        }
      }
    }
  });
}
function Na(i) {
  i.set("layout", {
    autoPadding: !0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const W1 = /* @__PURE__ */ new Map();
function Ba(i, t) {
  t = t || {};
  const e = i + JSON.stringify(t);
  let n = W1.get(e);
  return n || (n = new Intl.NumberFormat(i, t), W1.set(e, n)), n;
}
function v0(i, t, e) {
  return Ba(t, e).format(i);
}
const Oa = {
  values(i) {
    return W(i) ? i : "" + i;
  },
  numeric(i, t, e) {
    if (i === 0)
      return "0";
    const n = this.chart.options.locale;
    let s, a = i;
    if (e.length > 1) {
      const d = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      (d < 1e-4 || d > 1e15) && (s = "scientific"), a = Da(i, e);
    }
    const r = _0(Math.abs(a)), o = isNaN(r) ? 1 : Math.max(Math.min(-1 * Math.floor(r), 20), 0), l = {
      notation: s,
      minimumFractionDigits: o,
      maximumFractionDigits: o
    };
    return Object.assign(l, this.options.ticks.format), v0(i, n, l);
  }
};
function Da(i, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(e) >= 1 && i !== Math.floor(i) && (e = i - Math.floor(i)), e;
}
var y0 = {
  formatters: Oa
};
function Ra(i) {
  i.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, e) => e.lineWidth,
      tickColor: (t, e) => e.color,
      offset: !1
    },
    border: {
      display: !0,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: !1,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: y0.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  }), i.route("scale.ticks", "color", "", "color"), i.route("scale.grid", "color", "", "borderColor"), i.route("scale.border", "color", "", "borderColor"), i.route("scale.title", "color", "", "color"), i.describe("scale", {
    _fallback: !1,
    _scriptable: (t) => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
    _indexable: (t) => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
  }), i.describe("scales", {
    _fallback: "scale"
  }), i.describe("scale.ticks", {
    _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
    _indexable: (t) => t !== "backdropPadding"
  });
}
const Et = /* @__PURE__ */ Object.create(null), Ei = /* @__PURE__ */ Object.create(null);
function ve(i, t) {
  if (!t)
    return i;
  const e = t.split(".");
  for (let n = 0, s = e.length; n < s; ++n) {
    const a = e[n];
    i = i[a] || (i[a] = /* @__PURE__ */ Object.create(null));
  }
  return i;
}
function ki(i, t, e) {
  return typeof t == "string" ? dt(ve(i, t), e) : dt(ve(i, ""), t);
}
class Ea {
  constructor(t, e) {
    this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = (n) => n.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ], this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    }, this.hover = {}, this.hoverBackgroundColor = (n, s) => xi(s.backgroundColor), this.hoverBorderColor = (n, s) => xi(s.borderColor), this.hoverColor = (n, s) => xi(s.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(e);
  }
  set(t, e) {
    return ki(this, t, e);
  }
  get(t) {
    return ve(this, t);
  }
  describe(t, e) {
    return ki(Ei, t, e);
  }
  override(t, e) {
    return ki(Et, t, e);
  }
  route(t, e, n, s) {
    const a = ve(this, t), r = ve(this, n), o = "_" + e;
    Object.defineProperties(a, {
      [o]: {
        value: a[e],
        writable: !0
      },
      [e]: {
        enumerable: !0,
        get() {
          const l = this[o], d = r[s];
          return T(l) ? Object.assign({}, d, l) : S(l, d);
        },
        set(l) {
          this[o] = l;
        }
      }
    });
  }
  apply(t) {
    t.forEach((e) => e(this));
  }
}
var $ = /* @__PURE__ */ new Ea({
  _scriptable: (i) => !i.startsWith("on"),
  _indexable: (i) => i !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: !1,
    _indexable: !1
  }
}, [
  Ha,
  Na,
  Ra
]);
function $a(i) {
  return !i || L(i.size) || L(i.family) ? null : (i.style ? i.style + " " : "") + (i.weight ? i.weight + " " : "") + i.size + "px " + i.family;
}
function I1(i, t, e, n, s) {
  let a = t[s];
  return a || (a = t[s] = i.measureText(s).width, e.push(s)), a > n && (n = a), n;
}
function Tt(i, t, e) {
  const n = i.currentDevicePixelRatio, s = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - s) * n) / n + s;
}
function U1(i, t) {
  !t && !i || (t = t || i.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, i.width, i.height), t.restore());
}
function $i(i, t, e, n) {
  b0(i, t, e, n, null);
}
function b0(i, t, e, n, s) {
  let a, r, o, l, d, c, h, _;
  const f = t.pointStyle, g = t.rotation, u = t.radius;
  let p = (g || 0) * pa;
  if (f && typeof f == "object" && (a = f.toString(), a === "[object HTMLImageElement]" || a === "[object HTMLCanvasElement]")) {
    i.save(), i.translate(e, n), i.rotate(p), i.drawImage(f, -f.width / 2, -f.height / 2, f.width, f.height), i.restore();
    return;
  }
  if (!(isNaN(u) || u <= 0)) {
    switch (i.beginPath(), f) {
      // Default includes circle
      default:
        s ? i.ellipse(e, n, s / 2, u, 0, 0, I) : i.arc(e, n, u, 0, I), i.closePath();
        break;
      case "triangle":
        c = s ? s / 2 : u, i.moveTo(e + Math.sin(p) * c, n - Math.cos(p) * u), p += B1, i.lineTo(e + Math.sin(p) * c, n - Math.cos(p) * u), p += B1, i.lineTo(e + Math.sin(p) * c, n - Math.cos(p) * u), i.closePath();
        break;
      case "rectRounded":
        d = u * 0.516, l = u - d, r = Math.cos(p + zt) * l, h = Math.cos(p + zt) * (s ? s / 2 - d : l), o = Math.sin(p + zt) * l, _ = Math.sin(p + zt) * (s ? s / 2 - d : l), i.arc(e - h, n - o, d, p - O, p - F), i.arc(e + _, n - r, d, p - F, p), i.arc(e + h, n + o, d, p, p + F), i.arc(e - _, n + r, d, p + F, p + O), i.closePath();
        break;
      case "rect":
        if (!g) {
          l = Math.SQRT1_2 * u, c = s ? s / 2 : l, i.rect(e - c, n - l, 2 * c, 2 * l);
          break;
        }
        p += zt;
      /* falls through */
      case "rectRot":
        h = Math.cos(p) * (s ? s / 2 : u), r = Math.cos(p) * u, o = Math.sin(p) * u, _ = Math.sin(p) * (s ? s / 2 : u), i.moveTo(e - h, n - o), i.lineTo(e + _, n - r), i.lineTo(e + h, n + o), i.lineTo(e - _, n + r), i.closePath();
        break;
      case "crossRot":
        p += zt;
      /* falls through */
      case "cross":
        h = Math.cos(p) * (s ? s / 2 : u), r = Math.cos(p) * u, o = Math.sin(p) * u, _ = Math.sin(p) * (s ? s / 2 : u), i.moveTo(e - h, n - o), i.lineTo(e + h, n + o), i.moveTo(e + _, n - r), i.lineTo(e - _, n + r);
        break;
      case "star":
        h = Math.cos(p) * (s ? s / 2 : u), r = Math.cos(p) * u, o = Math.sin(p) * u, _ = Math.sin(p) * (s ? s / 2 : u), i.moveTo(e - h, n - o), i.lineTo(e + h, n + o), i.moveTo(e + _, n - r), i.lineTo(e - _, n + r), p += zt, h = Math.cos(p) * (s ? s / 2 : u), r = Math.cos(p) * u, o = Math.sin(p) * u, _ = Math.sin(p) * (s ? s / 2 : u), i.moveTo(e - h, n - o), i.lineTo(e + h, n + o), i.moveTo(e + _, n - r), i.lineTo(e - _, n + r);
        break;
      case "line":
        r = s ? s / 2 : Math.cos(p) * u, o = Math.sin(p) * u, i.moveTo(e - r, n - o), i.lineTo(e + r, n + o);
        break;
      case "dash":
        i.moveTo(e, n), i.lineTo(e + Math.cos(p) * (s ? s / 2 : u), n + Math.sin(p) * u);
        break;
      case !1:
        i.closePath();
        break;
    }
    i.fill(), t.borderWidth > 0 && i.stroke();
  }
}
function ze(i, t, e) {
  return e = e || 0.5, !t || i && i.x > t.left - e && i.x < t.right + e && i.y > t.top - e && i.y < t.bottom + e;
}
function fi(i, t) {
  i.save(), i.beginPath(), i.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), i.clip();
}
function ui(i) {
  i.restore();
}
function Va(i, t, e, n, s) {
  if (!t)
    return i.lineTo(e.x, e.y);
  if (s === "middle") {
    const a = (t.x + e.x) / 2;
    i.lineTo(a, t.y), i.lineTo(a, e.y);
  } else s === "after" != !!n ? i.lineTo(t.x, e.y) : i.lineTo(e.x, t.y);
  i.lineTo(e.x, e.y);
}
function Wa(i, t, e, n) {
  if (!t)
    return i.lineTo(e.x, e.y);
  i.bezierCurveTo(n ? t.cp1x : t.cp2x, n ? t.cp1y : t.cp2y, n ? e.cp2x : e.cp1x, n ? e.cp2y : e.cp1y, e.x, e.y);
}
function Ia(i, t) {
  t.translation && i.translate(t.translation[0], t.translation[1]), L(t.rotation) || i.rotate(t.rotation), t.color && (i.fillStyle = t.color), t.textAlign && (i.textAlign = t.textAlign), t.textBaseline && (i.textBaseline = t.textBaseline);
}
function Ua(i, t, e, n, s) {
  if (s.strikethrough || s.underline) {
    const a = i.measureText(n), r = t - a.actualBoundingBoxLeft, o = t + a.actualBoundingBoxRight, l = e - a.actualBoundingBoxAscent, d = e + a.actualBoundingBoxDescent, c = s.strikethrough ? (l + d) / 2 : d;
    i.strokeStyle = i.fillStyle, i.beginPath(), i.lineWidth = s.decorationWidth || 2, i.moveTo(r, c), i.lineTo(o, c), i.stroke();
  }
}
function Fa(i, t) {
  const e = i.fillStyle;
  i.fillStyle = t.color, i.fillRect(t.left, t.top, t.width, t.height), i.fillStyle = e;
}
function ai(i, t, e, n, s, a = {}) {
  const r = W(t) ? t : [
    t
  ], o = a.strokeWidth > 0 && a.strokeColor !== "";
  let l, d;
  for (i.save(), i.font = s.string, Ia(i, a), l = 0; l < r.length; ++l)
    d = r[l], a.backdrop && Fa(i, a.backdrop), o && (a.strokeColor && (i.strokeStyle = a.strokeColor), L(a.strokeWidth) || (i.lineWidth = a.strokeWidth), i.strokeText(d, e, n, a.maxWidth)), i.fillText(d, e, n, a.maxWidth), Ua(i, e, n, d, a), n += Number(s.lineHeight);
  i.restore();
}
function ri(i, t) {
  const { x: e, y: n, w: s, h: a, radius: r } = t;
  i.arc(e + r.topLeft, n + r.topLeft, r.topLeft, 1.5 * O, O, !0), i.lineTo(e, n + a - r.bottomLeft), i.arc(e + r.bottomLeft, n + a - r.bottomLeft, r.bottomLeft, O, F, !0), i.lineTo(e + s - r.bottomRight, n + a), i.arc(e + s - r.bottomRight, n + a - r.bottomRight, r.bottomRight, F, 0, !0), i.lineTo(e + s, n + r.topRight), i.arc(e + s - r.topRight, n + r.topRight, r.topRight, 0, -F, !0), i.lineTo(e + r.topLeft, n);
}
const ja = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, Ga = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function Ya(i, t) {
  const e = ("" + i).match(ja);
  if (!e || e[1] === "normal")
    return t * 1.2;
  switch (i = +e[2], e[3]) {
    case "px":
      return i;
    case "%":
      i /= 100;
      break;
  }
  return t * i;
}
const Xa = (i) => +i || 0;
function l1(i, t) {
  const e = {}, n = T(t), s = n ? Object.keys(t) : t, a = T(i) ? n ? (r) => S(i[r], i[t[r]]) : (r) => i[r] : () => i;
  for (const r of s)
    e[r] = Xa(a(r));
  return e;
}
function x0(i) {
  return l1(i, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function Yt(i) {
  return l1(i, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function nt(i) {
  const t = x0(i);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function X(i, t) {
  i = i || {}, t = t || $.font;
  let e = S(i.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let n = S(i.style, t.style);
  n && !("" + n).match(Ga) && (console.warn('Invalid font style specified: "' + n + '"'), n = void 0);
  const s = {
    family: S(i.family, t.family),
    lineHeight: Ya(S(i.lineHeight, t.lineHeight), e),
    size: e,
    style: n,
    weight: S(i.weight, t.weight),
    string: ""
  };
  return s.string = $a(s), s;
}
function R(i, t, e, n) {
  let s, a, r;
  for (s = 0, a = i.length; s < a; ++s)
    if (r = i[s], r !== void 0 && (t !== void 0 && typeof r == "function" && (r = r(t)), e !== void 0 && W(r) && (r = r[e % r.length]), r !== void 0))
      return r;
}
function Ka(i, t, e) {
  const { min: n, max: s } = i, a = da(t, (s - n) / 2), r = (o, l) => e && o === 0 ? 0 : o + l;
  return {
    min: r(n, -Math.abs(a)),
    max: r(s, a)
  };
}
function Vt(i, t) {
  return Object.assign(Object.create(i), t);
}
function d1(i, t = [
  ""
], e, n, s = () => i[0]) {
  const a = e || i;
  typeof n > "u" && (n = S0("_fallback", i));
  const r = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: i,
    _rootScopes: a,
    _fallback: n,
    _getTarget: s,
    override: (o) => d1([
      o,
      ...i
    ], t, a, n)
  };
  return new Proxy(r, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(o, l) {
      return delete o[l], delete o._keys, delete i[0][l], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(o, l) {
      return M0(o, l, () => sr(l, t, i, o));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(o, l) {
      return Reflect.getOwnPropertyDescriptor(o._scopes[0], l);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(o, l) {
      return j1(o).includes(l);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(o) {
      return j1(o);
    },
    /**
    * A trap for setting property values.
    */
    set(o, l, d) {
      const c = o._storage || (o._storage = s());
      return o[l] = c[l] = d, delete o._keys, !0;
    }
  });
}
function Qt(i, t, e, n) {
  const s = {
    _cacheable: !1,
    _proxy: i,
    _context: t,
    _subProxy: e,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: k0(i, n),
    setContext: (a) => Qt(i, a, e, n),
    override: (a) => Qt(i.override(a), t, e, n)
  };
  return new Proxy(s, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(a, r) {
      return delete a[r], delete i[r], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(a, r, o) {
      return M0(a, r, () => Ja(a, r, o));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(a, r) {
      return a._descriptors.allKeys ? Reflect.has(i, r) ? {
        enumerable: !0,
        configurable: !0
      } : void 0 : Reflect.getOwnPropertyDescriptor(i, r);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i);
    },
    /**
    * A trap for the in operator.
    */
    has(a, r) {
      return Reflect.has(i, r);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(i);
    },
    /**
    * A trap for setting property values.
    */
    set(a, r, o) {
      return i[r] = o, delete a[r], !0;
    }
  });
}
function k0(i, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: e = t.scriptable, _indexable: n = t.indexable, _allKeys: s = t.allKeys } = i;
  return {
    allKeys: s,
    scriptable: e,
    indexable: n,
    isScriptable: kt(e) ? e : () => e,
    isIndexable: kt(n) ? n : () => n
  };
}
const Za = (i, t) => i ? i + s1(t) : t, c1 = (i, t) => T(t) && i !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function M0(i, t, e) {
  if (Object.prototype.hasOwnProperty.call(i, t) || t === "constructor")
    return i[t];
  const n = e();
  return i[t] = n, n;
}
function Ja(i, t, e) {
  const { _proxy: n, _context: s, _subProxy: a, _descriptors: r } = i;
  let o = n[t];
  return kt(o) && r.isScriptable(t) && (o = Qa(t, o, i, e)), W(o) && o.length && (o = tr(t, o, i, r.isIndexable)), c1(t, o) && (o = Qt(o, s, a && a[t], r)), o;
}
function Qa(i, t, e, n) {
  const { _proxy: s, _context: a, _subProxy: r, _stack: o } = e;
  if (o.has(i))
    throw new Error("Recursion detected: " + Array.from(o).join("->") + "->" + i);
  o.add(i);
  let l = t(a, r || n);
  return o.delete(i), c1(i, l) && (l = h1(s._scopes, s, i, l)), l;
}
function tr(i, t, e, n) {
  const { _proxy: s, _context: a, _subProxy: r, _descriptors: o } = e;
  if (typeof a.index < "u" && n(i))
    return t[a.index % t.length];
  if (T(t[0])) {
    const l = t, d = s._scopes.filter((c) => c !== l);
    t = [];
    for (const c of l) {
      const h = h1(d, s, i, c);
      t.push(Qt(h, a, r && r[i], o));
    }
  }
  return t;
}
function C0(i, t, e) {
  return kt(i) ? i(t, e) : i;
}
const er = (i, t) => i === !0 ? t : typeof i == "string" ? Jt(t, i) : void 0;
function ir(i, t, e, n, s) {
  for (const a of t) {
    const r = er(e, a);
    if (r) {
      i.add(r);
      const o = C0(r._fallback, e, s);
      if (typeof o < "u" && o !== e && o !== n)
        return o;
    } else if (r === !1 && typeof n < "u" && e !== n)
      return null;
  }
  return !1;
}
function h1(i, t, e, n) {
  const s = t._rootScopes, a = C0(t._fallback, e, n), r = [
    ...i,
    ...s
  ], o = /* @__PURE__ */ new Set();
  o.add(n);
  let l = F1(o, r, e, a || e, n);
  return l === null || typeof a < "u" && a !== e && (l = F1(o, r, a, l, n), l === null) ? !1 : d1(Array.from(o), [
    ""
  ], s, a, () => nr(t, e, n));
}
function F1(i, t, e, n, s) {
  for (; e; )
    e = ir(i, t, e, n, s);
  return e;
}
function nr(i, t, e) {
  const n = i._getTarget();
  t in n || (n[t] = {});
  const s = n[t];
  return W(s) && T(e) ? e : s || {};
}
function sr(i, t, e, n) {
  let s;
  for (const a of t)
    if (s = S0(Za(a, i), e), typeof s < "u")
      return c1(i, s) ? h1(e, n, i, s) : s;
}
function S0(i, t) {
  for (const e of t) {
    if (!e)
      continue;
    const n = e[i];
    if (typeof n < "u")
      return n;
  }
}
function j1(i) {
  let t = i._keys;
  return t || (t = i._keys = ar(i._scopes)), t;
}
function ar(i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i)
    for (const n of Object.keys(e).filter((s) => !s.startsWith("_")))
      t.add(n);
  return Array.from(t);
}
const rr = Number.EPSILON || 1e-14, te = (i, t) => t < i.length && !i[t].skip && i[t], P0 = (i) => i === "x" ? "y" : "x";
function or(i, t, e, n) {
  const s = i.skip ? t : i, a = t, r = e.skip ? t : e, o = Ri(a, s), l = Ri(r, a);
  let d = o / (o + l), c = l / (o + l);
  d = isNaN(d) ? 0 : d, c = isNaN(c) ? 0 : c;
  const h = n * d, _ = n * c;
  return {
    previous: {
      x: a.x - h * (r.x - s.x),
      y: a.y - h * (r.y - s.y)
    },
    next: {
      x: a.x + _ * (r.x - s.x),
      y: a.y + _ * (r.y - s.y)
    }
  };
}
function lr(i, t, e) {
  const n = i.length;
  let s, a, r, o, l, d = te(i, 0);
  for (let c = 0; c < n - 1; ++c)
    if (l = d, d = te(i, c + 1), !(!l || !d)) {
      if (me(t[c], 0, rr)) {
        e[c] = e[c + 1] = 0;
        continue;
      }
      s = e[c] / t[c], a = e[c + 1] / t[c], o = Math.pow(s, 2) + Math.pow(a, 2), !(o <= 9) && (r = 3 / Math.sqrt(o), e[c] = s * r * t[c], e[c + 1] = a * r * t[c]);
    }
}
function dr(i, t, e = "x") {
  const n = P0(e), s = i.length;
  let a, r, o, l = te(i, 0);
  for (let d = 0; d < s; ++d) {
    if (r = o, o = l, l = te(i, d + 1), !o)
      continue;
    const c = o[e], h = o[n];
    r && (a = (c - r[e]) / 3, o[`cp1${e}`] = c - a, o[`cp1${n}`] = h - a * t[d]), l && (a = (l[e] - c) / 3, o[`cp2${e}`] = c + a, o[`cp2${n}`] = h + a * t[d]);
  }
}
function cr(i, t = "x") {
  const e = P0(t), n = i.length, s = Array(n).fill(0), a = Array(n);
  let r, o, l, d = te(i, 0);
  for (r = 0; r < n; ++r)
    if (o = l, l = d, d = te(i, r + 1), !!l) {
      if (d) {
        const c = d[t] - l[t];
        s[r] = c !== 0 ? (d[e] - l[e]) / c : 0;
      }
      a[r] = o ? d ? lt(s[r - 1]) !== lt(s[r]) ? 0 : (s[r - 1] + s[r]) / 2 : s[r - 1] : s[r];
    }
  lr(i, s, a), dr(i, a, t);
}
function Re(i, t, e) {
  return Math.max(Math.min(i, e), t);
}
function hr(i, t) {
  let e, n, s, a, r, o = ze(i[0], t);
  for (e = 0, n = i.length; e < n; ++e)
    r = a, a = o, o = e < n - 1 && ze(i[e + 1], t), a && (s = i[e], r && (s.cp1x = Re(s.cp1x, t.left, t.right), s.cp1y = Re(s.cp1y, t.top, t.bottom)), o && (s.cp2x = Re(s.cp2x, t.left, t.right), s.cp2y = Re(s.cp2y, t.top, t.bottom)));
}
function _r(i, t, e, n, s) {
  let a, r, o, l;
  if (t.spanGaps && (i = i.filter((d) => !d.skip)), t.cubicInterpolationMode === "monotone")
    cr(i, s);
  else {
    let d = n ? i[i.length - 1] : i[0];
    for (a = 0, r = i.length; a < r; ++a)
      o = i[a], l = or(d, o, i[Math.min(a + 1, r - (n ? 0 : 1)) % r], t.tension), o.cp1x = l.previous.x, o.cp1y = l.previous.y, o.cp2x = l.next.x, o.cp2y = l.next.y, d = o;
  }
  t.capBezierPoints && hr(i, e);
}
function _1() {
  return typeof window < "u" && typeof document < "u";
}
function f1(i) {
  let t = i.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function oi(i, t, e) {
  let n;
  return typeof i == "string" ? (n = parseInt(i, 10), i.indexOf("%") !== -1 && (n = n / 100 * t.parentNode[e])) : n = i, n;
}
const gi = (i) => i.ownerDocument.defaultView.getComputedStyle(i, null);
function fr(i, t) {
  return gi(i).getPropertyValue(t);
}
const ur = [
  "top",
  "right",
  "bottom",
  "left"
];
function Dt(i, t, e) {
  const n = {};
  e = e ? "-" + e : "";
  for (let s = 0; s < 4; s++) {
    const a = ur[s];
    n[a] = parseFloat(i[t + "-" + a + e]) || 0;
  }
  return n.width = n.left + n.right, n.height = n.top + n.bottom, n;
}
const gr = (i, t, e) => (i > 0 || t > 0) && (!e || !e.shadowRoot);
function pr(i, t) {
  const e = i.touches, n = e && e.length ? e[0] : i, { offsetX: s, offsetY: a } = n;
  let r = !1, o, l;
  if (gr(s, a, i.target))
    o = s, l = a;
  else {
    const d = t.getBoundingClientRect();
    o = n.clientX - d.left, l = n.clientY - d.top, r = !0;
  }
  return {
    x: o,
    y: l,
    box: r
  };
}
function At(i, t) {
  if ("native" in i)
    return i;
  const { canvas: e, currentDevicePixelRatio: n } = t, s = gi(e), a = s.boxSizing === "border-box", r = Dt(s, "padding"), o = Dt(s, "border", "width"), { x: l, y: d, box: c } = pr(i, e), h = r.left + (c && o.left), _ = r.top + (c && o.top);
  let { width: f, height: g } = t;
  return a && (f -= r.width + o.width, g -= r.height + o.height), {
    x: Math.round((l - h) / f * e.width / n),
    y: Math.round((d - _) / g * e.height / n)
  };
}
function mr(i, t, e) {
  let n, s;
  if (t === void 0 || e === void 0) {
    const a = i && f1(i);
    if (!a)
      t = i.clientWidth, e = i.clientHeight;
    else {
      const r = a.getBoundingClientRect(), o = gi(a), l = Dt(o, "border", "width"), d = Dt(o, "padding");
      t = r.width - d.width - l.width, e = r.height - d.height - l.height, n = oi(o.maxWidth, a, "clientWidth"), s = oi(o.maxHeight, a, "clientHeight");
    }
  }
  return {
    width: t,
    height: e,
    maxWidth: n || si,
    maxHeight: s || si
  };
}
const vt = (i) => Math.round(i * 10) / 10;
function wr(i, t, e, n) {
  const s = gi(i), a = Dt(s, "margin"), r = oi(s.maxWidth, i, "clientWidth") || si, o = oi(s.maxHeight, i, "clientHeight") || si, l = mr(i, t, e);
  let { width: d, height: c } = l;
  if (s.boxSizing === "content-box") {
    const _ = Dt(s, "border", "width"), f = Dt(s, "padding");
    d -= f.width + _.width, c -= f.height + _.height;
  }
  return d = Math.max(0, d - a.width), c = Math.max(0, n ? d / n : c - a.height), d = vt(Math.min(d, r, l.maxWidth)), c = vt(Math.min(c, o, l.maxHeight)), d && !c && (c = vt(d / 2)), (t !== void 0 || e !== void 0) && n && l.height && c > l.height && (c = l.height, d = vt(Math.floor(c * n))), {
    width: d,
    height: c
  };
}
function G1(i, t, e) {
  const n = t || 1, s = vt(i.height * n), a = vt(i.width * n);
  i.height = vt(i.height), i.width = vt(i.width);
  const r = i.canvas;
  return r.style && (e || !r.style.height && !r.style.width) && (r.style.height = `${i.height}px`, r.style.width = `${i.width}px`), i.currentDevicePixelRatio !== n || r.height !== s || r.width !== a ? (i.currentDevicePixelRatio = n, r.height = s, r.width = a, i.ctx.setTransform(n, 0, 0, n, 0, 0), !0) : !1;
}
const vr = (function() {
  let i = !1;
  try {
    const t = {
      get passive() {
        return i = !0, !1;
      }
    };
    _1() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return i;
})();
function Y1(i, t) {
  const e = fr(i, t), n = e && e.match(/^(\d+)(\.\d+)?px$/);
  return n ? +n[1] : void 0;
}
function qt(i, t, e, n) {
  return {
    x: i.x + e * (t.x - i.x),
    y: i.y + e * (t.y - i.y)
  };
}
function yr(i, t, e, n) {
  return {
    x: i.x + e * (t.x - i.x),
    y: n === "middle" ? e < 0.5 ? i.y : t.y : n === "after" ? e < 1 ? i.y : t.y : e > 0 ? t.y : i.y
  };
}
function br(i, t, e, n) {
  const s = {
    x: i.cp2x,
    y: i.cp2y
  }, a = {
    x: t.cp1x,
    y: t.cp1y
  }, r = qt(i, s, e), o = qt(s, a, e), l = qt(a, t, e), d = qt(r, o, e), c = qt(o, l, e);
  return qt(d, c, e);
}
const xr = function(i, t) {
  return {
    x(e) {
      return i + i + t - e;
    },
    setWidth(e) {
      t = e;
    },
    textAlign(e) {
      return e === "center" ? e : e === "right" ? "left" : "right";
    },
    xPlus(e, n) {
      return e - n;
    },
    leftForLtr(e, n) {
      return e - n;
    }
  };
}, kr = function() {
  return {
    x(i) {
      return i;
    },
    setWidth(i) {
    },
    textAlign(i) {
      return i;
    },
    xPlus(i, t) {
      return i + t;
    },
    leftForLtr(i, t) {
      return i;
    }
  };
};
function Xt(i, t, e) {
  return i ? xr(t, e) : kr();
}
function z0(i, t) {
  let e, n;
  (t === "ltr" || t === "rtl") && (e = i.canvas.style, n = [
    e.getPropertyValue("direction"),
    e.getPropertyPriority("direction")
  ], e.setProperty("direction", t, "important"), i.prevTextDirection = n);
}
function T0(i, t) {
  t !== void 0 && (delete i.prevTextDirection, i.canvas.style.setProperty("direction", t[0], t[1]));
}
function L0(i) {
  return i === "angle" ? {
    between: a1,
    compare: xa,
    normalize: et
  } : {
    between: gt,
    compare: (t, e) => t - e,
    normalize: (t) => t
  };
}
function X1({ start: i, end: t, count: e, loop: n, style: s }) {
  return {
    start: i % e,
    end: t % e,
    loop: n && (t - i + 1) % e === 0,
    style: s
  };
}
function Mr(i, t, e) {
  const { property: n, start: s, end: a } = e, { between: r, normalize: o } = L0(n), l = t.length;
  let { start: d, end: c, loop: h } = i, _, f;
  if (h) {
    for (d += l, c += l, _ = 0, f = l; _ < f && r(o(t[d % l][n]), s, a); ++_)
      d--, c--;
    d %= l, c %= l;
  }
  return c < d && (c += l), {
    start: d,
    end: c,
    loop: h,
    style: i.style
  };
}
function A0(i, t, e) {
  if (!e)
    return [
      i
    ];
  const { property: n, start: s, end: a } = e, r = t.length, { compare: o, between: l, normalize: d } = L0(n), { start: c, end: h, loop: _, style: f } = Mr(i, t, e), g = [];
  let u = !1, p = null, m, w, y;
  const b = () => l(s, y, m) && o(s, y) !== 0, v = () => o(a, m) === 0 || l(a, y, m), k = () => u || b(), M = () => !u || v();
  for (let x = c, C = c; x <= h; ++x)
    w = t[x % r], !w.skip && (m = d(w[n]), m !== y && (u = l(m, s, a), p === null && k() && (p = o(m, s) === 0 ? x : C), p !== null && M() && (g.push(X1({
      start: p,
      end: x,
      loop: _,
      count: r,
      style: f
    })), p = null), C = x, y = m));
  return p !== null && g.push(X1({
    start: p,
    end: h,
    loop: _,
    count: r,
    style: f
  })), g;
}
function q0(i, t) {
  const e = [], n = i.segments;
  for (let s = 0; s < n.length; s++) {
    const a = A0(n[s], i.points, t);
    a.length && e.push(...a);
  }
  return e;
}
function Cr(i, t, e, n) {
  let s = 0, a = t - 1;
  if (e && !n)
    for (; s < t && !i[s].skip; )
      s++;
  for (; s < t && i[s].skip; )
    s++;
  for (s %= t, e && (a += s); a > s && i[a % t].skip; )
    a--;
  return a %= t, {
    start: s,
    end: a
  };
}
function Sr(i, t, e, n) {
  const s = i.length, a = [];
  let r = t, o = i[t], l;
  for (l = t + 1; l <= e; ++l) {
    const d = i[l % s];
    d.skip || d.stop ? o.skip || (n = !1, a.push({
      start: t % s,
      end: (l - 1) % s,
      loop: n
    }), t = r = d.stop ? l : null) : (r = l, o.skip && (t = l)), o = d;
  }
  return r !== null && a.push({
    start: t % s,
    end: r % s,
    loop: n
  }), a;
}
function Pr(i, t) {
  const e = i.points, n = i.options.spanGaps, s = e.length;
  if (!s)
    return [];
  const a = !!i._loop, { start: r, end: o } = Cr(e, s, a, n);
  if (n === !0)
    return K1(i, [
      {
        start: r,
        end: o,
        loop: a
      }
    ], e, t);
  const l = o < r ? o + s : o, d = !!i._fullLoop && r === 0 && o === s - 1;
  return K1(i, Sr(e, r, l, d), e, t);
}
function K1(i, t, e, n) {
  return !n || !n.setContext || !e ? t : zr(i, t, e, n);
}
function zr(i, t, e, n) {
  const s = i._chart.getContext(), a = Z1(i.options), { _datasetIndex: r, options: { spanGaps: o } } = i, l = e.length, d = [];
  let c = a, h = t[0].start, _ = h;
  function f(g, u, p, m) {
    const w = o ? -1 : 1;
    if (g !== u) {
      for (g += l; e[g % l].skip; )
        g -= w;
      for (; e[u % l].skip; )
        u += w;
      g % l !== u % l && (d.push({
        start: g % l,
        end: u % l,
        loop: p,
        style: m
      }), c = m, h = u % l);
    }
  }
  for (const g of t) {
    h = o ? h : g.start;
    let u = e[h % l], p;
    for (_ = h + 1; _ <= g.end; _++) {
      const m = e[_ % l];
      p = Z1(n.setContext(Vt(s, {
        type: "segment",
        p0: u,
        p1: m,
        p0DataIndex: (_ - 1) % l,
        p1DataIndex: _ % l,
        datasetIndex: r
      }))), Tr(p, c) && f(h, _ - 1, g.loop, c), u = m, c = p;
    }
    h < _ - 1 && f(h, _ - 1, g.loop, c);
  }
  return d;
}
function Z1(i) {
  return {
    backgroundColor: i.backgroundColor,
    borderCapStyle: i.borderCapStyle,
    borderDash: i.borderDash,
    borderDashOffset: i.borderDashOffset,
    borderJoinStyle: i.borderJoinStyle,
    borderWidth: i.borderWidth,
    borderColor: i.borderColor
  };
}
function Tr(i, t) {
  if (!t)
    return !1;
  const e = [], n = function(s, a) {
    return o1(a) ? (e.includes(a) || e.push(a), e.indexOf(a)) : a;
  };
  return JSON.stringify(i, n) !== JSON.stringify(t, n);
}
function Ee(i, t, e) {
  return i.options.clip ? i[e] : t[e];
}
function Lr(i, t) {
  const { xScale: e, yScale: n } = i;
  return e && n ? {
    left: Ee(e, t, "left"),
    right: Ee(e, t, "right"),
    top: Ee(n, t, "top"),
    bottom: Ee(n, t, "bottom")
  } : t;
}
function H0(i, t) {
  const e = t._clip;
  if (e.disabled)
    return !1;
  const n = Lr(t, i.chartArea);
  return {
    left: e.left === !1 ? 0 : n.left - (e.left === !0 ? 0 : e.left),
    right: e.right === !1 ? i.width : n.right + (e.right === !0 ? 0 : e.right),
    top: e.top === !1 ? 0 : n.top - (e.top === !0 ? 0 : e.top),
    bottom: e.bottom === !1 ? i.height : n.bottom + (e.bottom === !0 ? 0 : e.bottom)
  };
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
class Ar {
  constructor() {
    this._request = null, this._charts = /* @__PURE__ */ new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(t, e, n, s) {
    const a = e.listeners[s], r = e.duration;
    a.forEach((o) => o({
      chart: t,
      initial: e.initial,
      numSteps: r,
      currentStep: Math.min(n - e.start, r)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = p0.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((n, s) => {
      if (!n.running || !n.items.length)
        return;
      const a = n.items;
      let r = a.length - 1, o = !1, l;
      for (; r >= 0; --r)
        l = a[r], l._active ? (l._total > n.duration && (n.duration = l._total), l.tick(t), o = !0) : (a[r] = a[a.length - 1], a.pop());
      o && (s.draw(), this._notify(s, n, t, "progress")), a.length || (n.running = !1, this._notify(s, n, t, "complete"), n.initial = !1), e += a.length;
    }), this._lastDate = t, e === 0 && (this._running = !1);
  }
  _getAnims(t) {
    const e = this._charts;
    let n = e.get(t);
    return n || (n = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, e.set(t, n)), n;
  }
  listen(t, e, n) {
    this._getAnims(t).listeners[e].push(n);
  }
  add(t, e) {
    !e || !e.length || this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce((n, s) => Math.max(n, s._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running)
      return !1;
    const e = this._charts.get(t);
    return !(!e || !e.running || !e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length)
      return;
    const n = e.items;
    let s = n.length - 1;
    for (; s >= 0; --s)
      n[s].cancel();
    e.items = [], this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var ht = /* @__PURE__ */ new Ar();
const J1 = "transparent", qr = {
  boolean(i, t, e) {
    return e > 0.5 ? t : i;
  },
  color(i, t, e) {
    const n = V1(i || J1), s = n.valid && V1(t || J1);
    return s && s.valid ? s.mix(n, e).hexString() : t;
  },
  number(i, t, e) {
    return i + (t - i) * e;
  }
};
class Hr {
  constructor(t, e, n, s) {
    const a = e[n];
    s = R([
      t.to,
      s,
      a,
      t.from
    ]);
    const r = R([
      t.from,
      a,
      s
    ]);
    this._active = !0, this._fn = t.fn || qr[t.type || typeof r], this._easing = we[t.easing] || we.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = n, this._from = r, this._to = s, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, e, n) {
    if (this._active) {
      this._notify(!1);
      const s = this._target[this._prop], a = n - this._start, r = this._duration - a;
      this._start = n, this._duration = Math.floor(Math.max(r, t.duration)), this._total += a, this._loop = !!t.loop, this._to = R([
        t.to,
        e,
        s,
        t.from
      ]), this._from = R([
        t.from,
        s,
        e
      ]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const e = t - this._start, n = this._duration, s = this._prop, a = this._from, r = this._loop, o = this._to;
    let l;
    if (this._active = a !== o && (r || e < n), !this._active) {
      this._target[s] = o, this._notify(!0);
      return;
    }
    if (e < 0) {
      this._target[s] = a;
      return;
    }
    l = e / n % 2, l = r && l > 1 ? 2 - l : l, l = this._easing(Math.min(1, Math.max(0, l))), this._target[s] = this._fn(a, o, l);
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, n) => {
      t.push({
        res: e,
        rej: n
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej", n = this._promises || [];
    for (let s = 0; s < n.length; s++)
      n[s][e]();
  }
}
class N0 {
  constructor(t, e) {
    this._chart = t, this._properties = /* @__PURE__ */ new Map(), this.configure(e);
  }
  configure(t) {
    if (!T(t))
      return;
    const e = Object.keys($.animation), n = this._properties;
    Object.getOwnPropertyNames(t).forEach((s) => {
      const a = t[s];
      if (!T(a))
        return;
      const r = {};
      for (const o of e)
        r[o] = a[o];
      (W(a.properties) && a.properties || [
        s
      ]).forEach((o) => {
        (o === s || !n.has(o)) && n.set(o, r);
      });
    });
  }
  _animateOptions(t, e) {
    const n = e.options, s = Br(t, n);
    if (!s)
      return [];
    const a = this._createAnimations(s, n);
    return n.$shared && Nr(t.options.$animations, n).then(() => {
      t.options = n;
    }, () => {
    }), a;
  }
  _createAnimations(t, e) {
    const n = this._properties, s = [], a = t.$animations || (t.$animations = {}), r = Object.keys(e), o = Date.now();
    let l;
    for (l = r.length - 1; l >= 0; --l) {
      const d = r[l];
      if (d.charAt(0) === "$")
        continue;
      if (d === "options") {
        s.push(...this._animateOptions(t, e));
        continue;
      }
      const c = e[d];
      let h = a[d];
      const _ = n.get(d);
      if (h)
        if (_ && h.active()) {
          h.update(_, c, o);
          continue;
        } else
          h.cancel();
      if (!_ || !_.duration) {
        t[d] = c;
        continue;
      }
      a[d] = h = new Hr(_, t, d, c), s.push(h);
    }
    return s;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const n = this._createAnimations(t, e);
    if (n.length)
      return ht.add(this._chart, n), !0;
  }
}
function Nr(i, t) {
  const e = [], n = Object.keys(t);
  for (let s = 0; s < n.length; s++) {
    const a = i[n[s]];
    a && a.active() && e.push(a.wait());
  }
  return Promise.all(e);
}
function Br(i, t) {
  if (!t)
    return;
  let e = i.options;
  if (!e) {
    i.options = t;
    return;
  }
  return e.$shared && (i.options = e = Object.assign({}, e, {
    $shared: !1,
    $animations: {}
  })), e;
}
function Q1(i, t) {
  const e = i && i.options || {}, n = e.reverse, s = e.min === void 0 ? t : 0, a = e.max === void 0 ? t : 0;
  return {
    start: n ? a : s,
    end: n ? s : a
  };
}
function Or(i, t, e) {
  if (e === !1)
    return !1;
  const n = Q1(i, e), s = Q1(t, e);
  return {
    top: s.end,
    right: n.end,
    bottom: s.start,
    left: n.start
  };
}
function Dr(i) {
  let t, e, n, s;
  return T(i) ? (t = i.top, e = i.right, n = i.bottom, s = i.left) : t = e = n = s = i, {
    top: t,
    right: e,
    bottom: n,
    left: s,
    disabled: i === !1
  };
}
function B0(i, t) {
  const e = [], n = i._getSortedDatasetMetas(t);
  let s, a;
  for (s = 0, a = n.length; s < a; ++s)
    e.push(n[s].index);
  return e;
}
function tn(i, t, e, n = {}) {
  const s = i.keys, a = n.mode === "single";
  let r, o, l, d;
  if (t === null)
    return;
  let c = !1;
  for (r = 0, o = s.length; r < o; ++r) {
    if (l = +s[r], l === e) {
      if (c = !0, n.all)
        continue;
      break;
    }
    d = i.values[l], Y(d) && (a || t === 0 || lt(t) === lt(d)) && (t += d);
  }
  return !c && !n.all ? 0 : t;
}
function Rr(i, t) {
  const { iScale: e, vScale: n } = t, s = e.axis === "x" ? "x" : "y", a = n.axis === "x" ? "x" : "y", r = Object.keys(i), o = new Array(r.length);
  let l, d, c;
  for (l = 0, d = r.length; l < d; ++l)
    c = r[l], o[l] = {
      [s]: c,
      [a]: i[c]
    };
  return o;
}
function Mi(i, t) {
  const e = i && i.options.stacked;
  return e || e === void 0 && t.stack !== void 0;
}
function Er(i, t, e) {
  return `${i.id}.${t.id}.${e.stack || e.type}`;
}
function $r(i) {
  const { min: t, max: e, minDefined: n, maxDefined: s } = i.getUserBounds();
  return {
    min: n ? t : Number.NEGATIVE_INFINITY,
    max: s ? e : Number.POSITIVE_INFINITY
  };
}
function Vr(i, t, e) {
  const n = i[t] || (i[t] = {});
  return n[e] || (n[e] = {});
}
function en(i, t, e, n) {
  for (const s of t.getMatchingVisibleMetas(n).reverse()) {
    const a = i[s.index];
    if (e && a > 0 || !e && a < 0)
      return s.index;
  }
  return null;
}
function nn(i, t) {
  const { chart: e, _cachedMeta: n } = i, s = e._stacks || (e._stacks = {}), { iScale: a, vScale: r, index: o } = n, l = a.axis, d = r.axis, c = Er(a, r, n), h = t.length;
  let _;
  for (let f = 0; f < h; ++f) {
    const g = t[f], { [l]: u, [d]: p } = g, m = g._stacks || (g._stacks = {});
    _ = m[d] = Vr(s, c, u), _[o] = p, _._top = en(_, r, !0, n.type), _._bottom = en(_, r, !1, n.type);
    const w = _._visualValues || (_._visualValues = {});
    w[o] = p;
  }
}
function Ci(i, t) {
  const e = i.scales;
  return Object.keys(e).filter((n) => e[n].axis === t).shift();
}
function Wr(i, t) {
  return Vt(i, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function Ir(i, t, e) {
  return Vt(i, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: e,
    index: t,
    mode: "default",
    type: "data"
  });
}
function re(i, t) {
  const e = i.controller.index, n = i.vScale && i.vScale.axis;
  if (n) {
    t = t || i._parsed;
    for (const s of t) {
      const a = s._stacks;
      if (!a || a[n] === void 0 || a[n][e] === void 0)
        return;
      delete a[n][e], a[n]._visualValues !== void 0 && a[n]._visualValues[e] !== void 0 && delete a[n]._visualValues[e];
    }
  }
}
const Si = (i) => i === "reset" || i === "none", sn = (i, t) => t ? i : Object.assign({}, i), Ur = (i, t, e) => i && !t.hidden && t._stacked && {
  keys: B0(e, !0),
  values: null
};
class u1 {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = Mi(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && re(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, e = this._cachedMeta, n = this.getDataset(), s = (h, _, f, g) => h === "x" ? _ : h === "r" ? g : f, a = e.xAxisID = S(n.xAxisID, Ci(t, "x")), r = e.yAxisID = S(n.yAxisID, Ci(t, "y")), o = e.rAxisID = S(n.rAxisID, Ci(t, "r")), l = e.indexAxis, d = e.iAxisID = s(l, a, r, o), c = e.vAxisID = s(l, r, a, o);
    e.xScale = this.getScaleForId(a), e.yScale = this.getScaleForId(r), e.rScale = this.getScaleForId(o), e.iScale = this.getScaleForId(d), e.vScale = this.getScaleForId(c);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && R1(this._data, this), t._stacked && re(t);
  }
  _dataCheck() {
    const t = this.getDataset(), e = t.data || (t.data = []), n = this._data;
    if (T(e)) {
      const s = this._cachedMeta;
      this._data = Rr(e, s);
    } else if (n !== e) {
      if (n) {
        R1(n, this);
        const s = this._cachedMeta;
        re(s), s._parsed = [];
      }
      e && Object.isExtensible(e) && Sa(e, this), this._syncList = [], this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta, n = this.getDataset();
    let s = !1;
    this._dataCheck();
    const a = e._stacked;
    e._stacked = Mi(e.vScale, e), e.stack !== n.stack && (s = !0, re(e), e.stack = n.stack), this._resyncElements(t), (s || a !== e._stacked) && (nn(this, e._parsed), e._stacked = Mi(e.vScale, e));
  }
  configure() {
    const t = this.chart.config, e = t.datasetScopeKeys(this._type), n = t.getOptionScopes(this.getDataset(), e, !0);
    this.options = t.createResolver(n, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, e) {
    const { _cachedMeta: n, _data: s } = this, { iScale: a, _stacked: r } = n, o = a.axis;
    let l = t === 0 && e === s.length ? !0 : n._sorted, d = t > 0 && n._parsed[t - 1], c, h, _;
    if (this._parsing === !1)
      n._parsed = s, n._sorted = !0, _ = s;
    else {
      W(s[t]) ? _ = this.parseArrayData(n, s, t, e) : T(s[t]) ? _ = this.parseObjectData(n, s, t, e) : _ = this.parsePrimitiveData(n, s, t, e);
      const f = () => h[o] === null || d && h[o] < d[o];
      for (c = 0; c < e; ++c)
        n._parsed[c + t] = h = _[c], l && (f() && (l = !1), d = h);
      n._sorted = l;
    }
    r && nn(this, _);
  }
  parsePrimitiveData(t, e, n, s) {
    const { iScale: a, vScale: r } = t, o = a.axis, l = r.axis, d = a.getLabels(), c = a === r, h = new Array(s);
    let _, f, g;
    for (_ = 0, f = s; _ < f; ++_)
      g = _ + n, h[_] = {
        [o]: c || a.parse(d[g], g),
        [l]: r.parse(e[g], g)
      };
    return h;
  }
  parseArrayData(t, e, n, s) {
    const { xScale: a, yScale: r } = t, o = new Array(s);
    let l, d, c, h;
    for (l = 0, d = s; l < d; ++l)
      c = l + n, h = e[c], o[l] = {
        x: a.parse(h[0], c),
        y: r.parse(h[1], c)
      };
    return o;
  }
  parseObjectData(t, e, n, s) {
    const { xScale: a, yScale: r } = t, { xAxisKey: o = "x", yAxisKey: l = "y" } = this._parsing, d = new Array(s);
    let c, h, _, f;
    for (c = 0, h = s; c < h; ++c)
      _ = c + n, f = e[_], d[c] = {
        x: a.parse(Jt(f, o), _),
        y: r.parse(Jt(f, l), _)
      };
    return d;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, n) {
    const s = this.chart, a = this._cachedMeta, r = e[t.axis], o = {
      keys: B0(s, !0),
      values: e._stacks[t.axis]._visualValues
    };
    return tn(o, r, a.index, {
      mode: n
    });
  }
  updateRangeFromParsed(t, e, n, s) {
    const a = n[e.axis];
    let r = a === null ? NaN : a;
    const o = s && n._stacks[e.axis];
    s && o && (s.values = o, r = tn(s, a, this._cachedMeta.index)), t.min = Math.min(t.min, r), t.max = Math.max(t.max, r);
  }
  getMinMax(t, e) {
    const n = this._cachedMeta, s = n._parsed, a = n._sorted && t === n.iScale, r = s.length, o = this._getOtherScale(t), l = Ur(e, n, this.chart), d = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: c, max: h } = $r(o);
    let _, f;
    function g() {
      f = s[_];
      const u = f[o.axis];
      return !Y(f[t.axis]) || c > u || h < u;
    }
    for (_ = 0; _ < r && !(!g() && (this.updateRangeFromParsed(d, t, f, l), a)); ++_)
      ;
    if (a) {
      for (_ = r - 1; _ >= 0; --_)
        if (!g()) {
          this.updateRangeFromParsed(d, t, f, l);
          break;
        }
    }
    return d;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed, n = [];
    let s, a, r;
    for (s = 0, a = e.length; s < a; ++s)
      r = e[s][t.axis], Y(r) && n.push(r);
    return n;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, n = e.iScale, s = e.vScale, a = this.getParsed(t);
    return {
      label: n ? "" + n.getLabelForValue(a[n.axis]) : "",
      value: s ? "" + s.getLabelForValue(a[s.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default"), e._clip = Dr(S(this.options.clip, Or(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {
  }
  draw() {
    const t = this._ctx, e = this.chart, n = this._cachedMeta, s = n.data || [], a = e.chartArea, r = [], o = this._drawStart || 0, l = this._drawCount || s.length - o, d = this.options.drawActiveElementsOnTop;
    let c;
    for (n.dataset && n.dataset.draw(t, a, o, l), c = o; c < o + l; ++c) {
      const h = s[c];
      h.hidden || (h.active && d ? r.push(h) : h.draw(t, a));
    }
    for (c = 0; c < r.length; ++c)
      r[c].draw(t, a);
  }
  getStyle(t, e) {
    const n = e ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(n) : this.resolveDataElementOptions(t || 0, n);
  }
  getContext(t, e, n) {
    const s = this.getDataset();
    let a;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const r = this._cachedMeta.data[t];
      a = r.$context || (r.$context = Ir(this.getContext(), t, r)), a.parsed = this.getParsed(t), a.raw = s.data[t], a.index = a.dataIndex = t;
    } else
      a = this.$context || (this.$context = Wr(this.chart.getContext(), this.index)), a.dataset = s, a.index = a.datasetIndex = this.index;
    return a.active = !!e, a.mode = n, a;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", n) {
    const s = e === "active", a = this._cachedDataOpts, r = t + "-" + e, o = a[r], l = this.enableOptionSharing && Se(n);
    if (o)
      return sn(o, l);
    const d = this.chart.config, c = d.datasetElementScopeKeys(this._type, t), h = s ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], _ = d.getOptionScopes(this.getDataset(), c), f = Object.keys($.elements[t]), g = () => this.getContext(n, s, e), u = d.resolveNamedOptions(_, f, g, h);
    return u.$shared && (u.$shared = l, a[r] = Object.freeze(sn(u, l))), u;
  }
  _resolveAnimations(t, e, n) {
    const s = this.chart, a = this._cachedDataOpts, r = `animation-${e}`, o = a[r];
    if (o)
      return o;
    let l;
    if (s.options.animation !== !1) {
      const c = this.chart.config, h = c.datasetAnimationScopeKeys(this._type, e), _ = c.getOptionScopes(this.getDataset(), h);
      l = c.createResolver(_, this.getContext(t, n, e));
    }
    const d = new N0(s, l && l.animations);
    return l && l._cacheable && (a[r] = Object.freeze(d)), d;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || Si(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const n = this.resolveDataElementOptions(t, e), s = this._sharedOptions, a = this.getSharedOptions(n), r = this.includeOptions(e, a) || a !== s;
    return this.updateSharedOptions(a, e, n), {
      sharedOptions: a,
      includeOptions: r
    };
  }
  updateElement(t, e, n, s) {
    Si(s) ? Object.assign(t, n) : this._resolveAnimations(e, s).update(t, n);
  }
  updateSharedOptions(t, e, n) {
    t && !Si(e) && this._resolveAnimations(void 0, e).update(t, n);
  }
  _setStyle(t, e, n, s) {
    t.active = s;
    const a = this.getStyle(e, s);
    this._resolveAnimations(e, n, s).update(t, {
      options: !s && this.getSharedOptions(a) || a
    });
  }
  removeHoverStyle(t, e, n) {
    this._setStyle(t, n, "active", !1);
  }
  setHoverStyle(t, e, n) {
    this._setStyle(t, n, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data, n = this._cachedMeta.data;
    for (const [o, l, d] of this._syncList)
      this[o](l, d);
    this._syncList = [];
    const s = n.length, a = e.length, r = Math.min(a, s);
    r && this.parse(0, r), a > s ? this._insertElements(s, a - s, t) : a < s && this._removeElements(a, s - a);
  }
  _insertElements(t, e, n = !0) {
    const s = this._cachedMeta, a = s.data, r = t + e;
    let o;
    const l = (d) => {
      for (d.length += e, o = d.length - 1; o >= r; o--)
        d[o] = d[o - e];
    };
    for (l(a), o = t; o < r; ++o)
      a[o] = new this.dataElementType();
    this._parsing && l(s._parsed), this.parse(t, e), n && this.updateElements(a, t, e, "reset");
  }
  updateElements(t, e, n, s) {
  }
  _removeElements(t, e) {
    const n = this._cachedMeta;
    if (this._parsing) {
      const s = n._parsed.splice(t, e);
      n._stacked && re(n, s);
    }
    n.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing)
      this._syncList.push(t);
    else {
      const [e, n, s] = t;
      this[e](n, s);
    }
    this.chart._dataChanges.push([
      this.index,
      ...t
    ]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - t,
      t
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(t, e) {
    e && this._sync([
      "_removeElements",
      t,
      e
    ]);
    const n = arguments.length - 2;
    n && this._sync([
      "_insertElements",
      t,
      n
    ]);
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
function Fr(i, t) {
  if (!i._cache.$bar) {
    const e = i.getMatchingVisibleMetas(t);
    let n = [];
    for (let s = 0, a = e.length; s < a; s++)
      n = n.concat(e[s].controller.getAllParsedValues(i));
    i._cache.$bar = g0(n.sort((s, a) => s - a));
  }
  return i._cache.$bar;
}
function jr(i) {
  const t = i.iScale, e = Fr(t, i.type);
  let n = t._length, s, a, r, o;
  const l = () => {
    r === 32767 || r === -32768 || (Se(o) && (n = Math.min(n, Math.abs(r - o) || n)), o = r);
  };
  for (s = 0, a = e.length; s < a; ++s)
    r = t.getPixelForValue(e[s]), l();
  for (o = void 0, s = 0, a = t.ticks.length; s < a; ++s)
    r = t.getPixelForTick(s), l();
  return n;
}
function Gr(i, t, e, n) {
  const s = e.barThickness;
  let a, r;
  return L(s) ? (a = t.min * e.categoryPercentage, r = e.barPercentage) : (a = s * n, r = 1), {
    chunk: a / n,
    ratio: r,
    start: t.pixels[i] - a / 2
  };
}
function Yr(i, t, e, n) {
  const s = t.pixels, a = s[i];
  let r = i > 0 ? s[i - 1] : null, o = i < s.length - 1 ? s[i + 1] : null;
  const l = e.categoryPercentage;
  r === null && (r = a - (o === null ? t.end - t.start : o - a)), o === null && (o = a + a - r);
  const d = a - (a - Math.min(r, o)) / 2 * l;
  return {
    chunk: Math.abs(o - r) / 2 * l / n,
    ratio: e.barPercentage,
    start: d
  };
}
function Xr(i, t, e, n) {
  const s = e.parse(i[0], n), a = e.parse(i[1], n), r = Math.min(s, a), o = Math.max(s, a);
  let l = r, d = o;
  Math.abs(r) > Math.abs(o) && (l = o, d = r), t[e.axis] = d, t._custom = {
    barStart: l,
    barEnd: d,
    start: s,
    end: a,
    min: r,
    max: o
  };
}
function O0(i, t, e, n) {
  return W(i) ? Xr(i, t, e, n) : t[e.axis] = e.parse(i, n), t;
}
function an(i, t, e, n) {
  const s = i.iScale, a = i.vScale, r = s.getLabels(), o = s === a, l = [];
  let d, c, h, _;
  for (d = e, c = e + n; d < c; ++d)
    _ = t[d], h = {}, h[s.axis] = o || s.parse(r[d], d), l.push(O0(_, h, a, d));
  return l;
}
function Pi(i) {
  return i && i.barStart !== void 0 && i.barEnd !== void 0;
}
function Kr(i, t, e) {
  return i !== 0 ? lt(i) : (t.isHorizontal() ? 1 : -1) * (t.min >= e ? 1 : -1);
}
function Zr(i) {
  let t, e, n, s, a;
  return i.horizontal ? (t = i.base > i.x, e = "left", n = "right") : (t = i.base < i.y, e = "bottom", n = "top"), t ? (s = "end", a = "start") : (s = "start", a = "end"), {
    start: e,
    end: n,
    reverse: t,
    top: s,
    bottom: a
  };
}
function Jr(i, t, e, n) {
  let s = t.borderSkipped;
  const a = {};
  if (!s) {
    i.borderSkipped = a;
    return;
  }
  if (s === !0) {
    i.borderSkipped = {
      top: !0,
      right: !0,
      bottom: !0,
      left: !0
    };
    return;
  }
  const { start: r, end: o, reverse: l, top: d, bottom: c } = Zr(i);
  s === "middle" && e && (i.enableBorderRadius = !0, (e._top || 0) === n ? s = d : (e._bottom || 0) === n ? s = c : (a[rn(c, r, o, l)] = !0, s = d)), a[rn(s, r, o, l)] = !0, i.borderSkipped = a;
}
function rn(i, t, e, n) {
  return n ? (i = Qr(i, t, e), i = on(i, e, t)) : i = on(i, t, e), i;
}
function Qr(i, t, e) {
  return i === t ? e : i === e ? t : i;
}
function on(i, t, e) {
  return i === "start" ? t : i === "end" ? e : i;
}
function to(i, { inflateAmount: t }, e) {
  i.inflateAmount = t === "auto" ? e === 1 ? 0.33 : 0 : t;
}
class eo extends u1 {
  static id = "bar";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "bar",
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    grouped: !0,
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "base",
          "width",
          "height"
        ]
      }
    }
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: !0,
        grid: {
          offset: !0
        }
      },
      _value_: {
        type: "linear",
        beginAtZero: !0
      }
    }
  };
  parsePrimitiveData(t, e, n, s) {
    return an(t, e, n, s);
  }
  parseArrayData(t, e, n, s) {
    return an(t, e, n, s);
  }
  parseObjectData(t, e, n, s) {
    const { iScale: a, vScale: r } = t, { xAxisKey: o = "x", yAxisKey: l = "y" } = this._parsing, d = a.axis === "x" ? o : l, c = r.axis === "x" ? o : l, h = [];
    let _, f, g, u;
    for (_ = n, f = n + s; _ < f; ++_)
      u = e[_], g = {}, g[a.axis] = a.parse(Jt(u, d), _), h.push(O0(Jt(u, c), g, r, _));
    return h;
  }
  updateRangeFromParsed(t, e, n, s) {
    super.updateRangeFromParsed(t, e, n, s);
    const a = n._custom;
    a && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, a.min), t.max = Math.max(t.max, a.max));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, { iScale: n, vScale: s } = e, a = this.getParsed(t), r = a._custom, o = Pi(r) ? "[" + r.start + ", " + r.end + "]" : "" + s.getLabelForValue(a[s.axis]);
    return {
      label: "" + n.getLabelForValue(a[n.axis]),
      value: o
    };
  }
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
    const t = this._cachedMeta;
    t.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, n, s) {
    const a = s === "reset", { index: r, _cachedMeta: { vScale: o } } = this, l = o.getBasePixel(), d = o.isHorizontal(), c = this._getRuler(), { sharedOptions: h, includeOptions: _ } = this._getSharedOptions(e, s);
    for (let f = e; f < e + n; f++) {
      const g = this.getParsed(f), u = a || L(g[o.axis]) ? {
        base: l,
        head: l
      } : this._calculateBarValuePixels(f), p = this._calculateBarIndexPixels(f, c), m = (g._stacks || {})[o.axis], w = {
        horizontal: d,
        base: u.base,
        enableBorderRadius: !m || Pi(g._custom) || r === m._top || r === m._bottom,
        x: d ? u.head : p.center,
        y: d ? p.center : u.head,
        height: d ? p.size : Math.abs(u.size),
        width: d ? Math.abs(u.size) : p.size
      };
      _ && (w.options = h || this.resolveDataElementOptions(f, t[f].active ? "active" : s));
      const y = w.options || t[f].options;
      Jr(w, y, m, r), to(w, y, c.ratio), this.updateElement(t[f], f, w, s);
    }
  }
  _getStacks(t, e) {
    const { iScale: n } = this._cachedMeta, s = n.getMatchingVisibleMetas(this._type).filter((c) => c.controller.options.grouped), a = n.options.stacked, r = [], o = this._cachedMeta.controller.getParsed(e), l = o && o[n.axis], d = (c) => {
      const h = c._parsed.find((f) => f[n.axis] === l), _ = h && h[c.vScale.axis];
      if (L(_) || isNaN(_))
        return !0;
    };
    for (const c of s)
      if (!(e !== void 0 && d(c)) && ((a === !1 || r.indexOf(c.stack) === -1 || a === void 0 && c.stack === void 0) && r.push(c.stack), c.index === t))
        break;
    return r.length || r.push(void 0), r;
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getAxisCount() {
    return this._getAxis().length;
  }
  getFirstScaleIdForIndexAxis() {
    const t = this.chart.scales, e = this.chart.options.indexAxis;
    return Object.keys(t).filter((n) => t[n].axis === e).shift();
  }
  _getAxis() {
    const t = {}, e = this.getFirstScaleIdForIndexAxis();
    for (const n of this.chart.data.datasets)
      t[S(this.chart.options.indexAxis === "x" ? n.xAxisID : n.yAxisID, e)] = !0;
    return Object.keys(t);
  }
  _getStackIndex(t, e, n) {
    const s = this._getStacks(t, n), a = e !== void 0 ? s.indexOf(e) : -1;
    return a === -1 ? s.length - 1 : a;
  }
  _getRuler() {
    const t = this.options, e = this._cachedMeta, n = e.iScale, s = [];
    let a, r;
    for (a = 0, r = e.data.length; a < r; ++a)
      s.push(n.getPixelForValue(this.getParsed(a)[n.axis], a));
    const o = t.barThickness;
    return {
      min: o || jr(e),
      pixels: s,
      start: n._startPixel,
      end: n._endPixel,
      stackCount: this._getStackCount(),
      scale: n,
      grouped: t.grouped,
      ratio: o ? 1 : t.categoryPercentage * t.barPercentage
    };
  }
  _calculateBarValuePixels(t) {
    const { _cachedMeta: { vScale: e, _stacked: n, index: s }, options: { base: a, minBarLength: r } } = this, o = a || 0, l = this.getParsed(t), d = l._custom, c = Pi(d);
    let h = l[e.axis], _ = 0, f = n ? this.applyStack(e, l, n) : h, g, u;
    f !== h && (_ = f - h, f = h), c && (h = d.barStart, f = d.barEnd - d.barStart, h !== 0 && lt(h) !== lt(d.barEnd) && (_ = 0), _ += h);
    const p = !L(a) && !c ? a : _;
    let m = e.getPixelForValue(p);
    if (this.chart.getDataVisibility(t) ? g = e.getPixelForValue(_ + f) : g = m, u = g - m, Math.abs(u) < r) {
      u = Kr(u, e, o) * r, h === o && (m -= u / 2);
      const w = e.getPixelForDecimal(0), y = e.getPixelForDecimal(1), b = Math.min(w, y), v = Math.max(w, y);
      m = Math.max(Math.min(m, v), b), g = m + u, n && !c && (l._stacks[e.axis]._visualValues[s] = e.getValueForPixel(g) - e.getValueForPixel(m));
    }
    if (m === e.getPixelForValue(o)) {
      const w = lt(u) * e.getLineWidthForValue(o) / 2;
      m += w, u -= w;
    }
    return {
      size: u,
      base: m,
      head: g,
      center: g + u / 2
    };
  }
  _calculateBarIndexPixels(t, e) {
    const n = e.scale, s = this.options, a = s.skipNull, r = S(s.maxBarThickness, 1 / 0);
    let o, l;
    const d = this._getAxisCount();
    if (e.grouped) {
      const c = a ? this._getStackCount(t) : e.stackCount, h = s.barThickness === "flex" ? Yr(t, e, s, c * d) : Gr(t, e, s, c * d), _ = this.chart.options.indexAxis === "x" ? this.getDataset().xAxisID : this.getDataset().yAxisID, f = this._getAxis().indexOf(S(_, this.getFirstScaleIdForIndexAxis())), g = this._getStackIndex(this.index, this._cachedMeta.stack, a ? t : void 0) + f;
      o = h.start + h.chunk * g + h.chunk / 2, l = Math.min(r, h.chunk * h.ratio);
    } else
      o = n.getPixelForValue(this.getParsed(t)[n.axis], t), l = Math.min(r, e.min * e.ratio);
    return {
      base: o - l / 2,
      head: o + l / 2,
      center: o,
      size: l
    };
  }
  draw() {
    const t = this._cachedMeta, e = t.vScale, n = t.data, s = n.length;
    let a = 0;
    for (; a < s; ++a)
      this.getParsed(a)[e.axis] !== null && !n[a].hidden && n[a].draw(this._ctx);
  }
}
class io extends u1 {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: !0,
    spanGaps: !1
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category"
      },
      _value_: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta, { dataset: n, data: s = [], _dataset: a } = e, r = this.chart._animationsDisabled;
    let { start: o, count: l } = Ta(e, s, r);
    this._drawStart = o, this._drawCount = l, La(e) && (o = 0, l = s.length), n._chart = this.chart, n._datasetIndex = this.index, n._decimated = !!a._decimated, n.points = s;
    const d = this.resolveDatasetElementOptions(t);
    this.options.showLine || (d.borderWidth = 0), d.segment = this.options.segment, this.updateElement(n, void 0, {
      animated: !r,
      options: d
    }, t), this.updateElements(s, o, l, t);
  }
  updateElements(t, e, n, s) {
    const a = s === "reset", { iScale: r, vScale: o, _stacked: l, _dataset: d } = this._cachedMeta, { sharedOptions: c, includeOptions: h } = this._getSharedOptions(e, s), _ = r.axis, f = o.axis, { spanGaps: g, segment: u } = this.options, p = Pe(g) ? g : Number.POSITIVE_INFINITY, m = this.chart._animationsDisabled || a || s === "none", w = e + n, y = t.length;
    let b = e > 0 && this.getParsed(e - 1);
    for (let v = 0; v < y; ++v) {
      const k = t[v], M = m ? k : {};
      if (v < e || v >= w) {
        M.skip = !0;
        continue;
      }
      const x = this.getParsed(v), C = L(x[f]), z = M[_] = r.getPixelForValue(x[_], v), P = M[f] = a || C ? o.getBasePixel() : o.getPixelForValue(l ? this.applyStack(o, x, l) : x[f], v);
      M.skip = isNaN(z) || isNaN(P) || C, M.stop = v > 0 && Math.abs(x[_] - b[_]) > p, u && (M.parsed = x, M.raw = d.data[v]), h && (M.options = c || this.resolveDataElementOptions(v, k.active ? "active" : s)), m || this.updateElement(k, v, M, s), b = x;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta, e = t.dataset, n = e.options && e.options.borderWidth || 0, s = t.data || [];
    if (!s.length)
      return n;
    const a = s[0].size(this.resolveDataElementOptions(0)), r = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1));
    return Math.max(n, a, r) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
function Lt() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class g1 {
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(t) {
    Object.assign(g1.prototype, t);
  }
  options;
  constructor(t) {
    this.options = t || {};
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return Lt();
  }
  parse() {
    return Lt();
  }
  format() {
    return Lt();
  }
  add() {
    return Lt();
  }
  diff() {
    return Lt();
  }
  startOf() {
    return Lt();
  }
  endOf() {
    return Lt();
  }
}
var no = {
  _date: g1
};
function so(i, t, e, n) {
  const { controller: s, data: a, _sorted: r } = i, o = s._cachedMeta.iScale, l = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null;
  if (o && t === o.axis && t !== "r" && r && a.length) {
    const d = o._reversePixels ? Ma : Ot;
    if (n) {
      if (s._sharedOptions) {
        const c = a[0], h = typeof c.getRange == "function" && c.getRange(t);
        if (h) {
          const _ = d(a, t, e - h), f = d(a, t, e + h);
          return {
            lo: _.lo,
            hi: f.hi
          };
        }
      }
    } else {
      const c = d(a, t, e);
      if (l) {
        const { vScale: h } = s._cachedMeta, { _parsed: _ } = i, f = _.slice(0, c.lo + 1).reverse().findIndex((u) => !L(u[h.axis]));
        c.lo -= Math.max(0, f);
        const g = _.slice(c.hi).findIndex((u) => !L(u[h.axis]));
        c.hi += Math.max(0, g);
      }
      return c;
    }
  }
  return {
    lo: 0,
    hi: a.length - 1
  };
}
function pi(i, t, e, n, s) {
  const a = i.getSortedVisibleDatasetMetas(), r = e[t];
  for (let o = 0, l = a.length; o < l; ++o) {
    const { index: d, data: c } = a[o], { lo: h, hi: _ } = so(a[o], t, r, s);
    for (let f = h; f <= _; ++f) {
      const g = c[f];
      g.skip || n(g, d, f);
    }
  }
}
function ao(i) {
  const t = i.indexOf("x") !== -1, e = i.indexOf("y") !== -1;
  return function(n, s) {
    const a = t ? Math.abs(n.x - s.x) : 0, r = e ? Math.abs(n.y - s.y) : 0;
    return Math.sqrt(Math.pow(a, 2) + Math.pow(r, 2));
  };
}
function zi(i, t, e, n, s) {
  const a = [];
  return !s && !i.isPointInArea(t) || pi(i, e, t, function(o, l, d) {
    !s && !ze(o, i.chartArea, 0) || o.inRange(t.x, t.y, n) && a.push({
      element: o,
      datasetIndex: l,
      index: d
    });
  }, !0), a;
}
function ro(i, t, e, n) {
  let s = [];
  function a(r, o, l) {
    const { startAngle: d, endAngle: c } = r.getProps([
      "startAngle",
      "endAngle"
    ], n), { angle: h } = f0(r, {
      x: t.x,
      y: t.y
    });
    a1(h, d, c) && s.push({
      element: r,
      datasetIndex: o,
      index: l
    });
  }
  return pi(i, e, t, a), s;
}
function oo(i, t, e, n, s, a) {
  let r = [];
  const o = ao(e);
  let l = Number.POSITIVE_INFINITY;
  function d(c, h, _) {
    const f = c.inRange(t.x, t.y, s);
    if (n && !f)
      return;
    const g = c.getCenterPoint(s);
    if (!(!!a || i.isPointInArea(g)) && !f)
      return;
    const p = o(t, g);
    p < l ? (r = [
      {
        element: c,
        datasetIndex: h,
        index: _
      }
    ], l = p) : p === l && r.push({
      element: c,
      datasetIndex: h,
      index: _
    });
  }
  return pi(i, e, t, d), r;
}
function Ti(i, t, e, n, s, a) {
  return !a && !i.isPointInArea(t) ? [] : e === "r" && !n ? ro(i, t, e, s) : oo(i, t, e, n, s, a);
}
function ln(i, t, e, n, s) {
  const a = [], r = e === "x" ? "inXRange" : "inYRange";
  let o = !1;
  return pi(i, e, t, (l, d, c) => {
    l[r] && l[r](t[e], s) && (a.push({
      element: l,
      datasetIndex: d,
      index: c
    }), o = o || l.inRange(t.x, t.y, s));
  }), n && !o ? [] : a;
}
var lo = {
  modes: {
    index(i, t, e, n) {
      const s = At(t, i), a = e.axis || "x", r = e.includeInvisible || !1, o = e.intersect ? zi(i, s, a, n, r) : Ti(i, s, a, !1, n, r), l = [];
      return o.length ? (i.getSortedVisibleDatasetMetas().forEach((d) => {
        const c = o[0].index, h = d.data[c];
        h && !h.skip && l.push({
          element: h,
          datasetIndex: d.index,
          index: c
        });
      }), l) : [];
    },
    dataset(i, t, e, n) {
      const s = At(t, i), a = e.axis || "xy", r = e.includeInvisible || !1;
      let o = e.intersect ? zi(i, s, a, n, r) : Ti(i, s, a, !1, n, r);
      if (o.length > 0) {
        const l = o[0].datasetIndex, d = i.getDatasetMeta(l).data;
        o = [];
        for (let c = 0; c < d.length; ++c)
          o.push({
            element: d[c],
            datasetIndex: l,
            index: c
          });
      }
      return o;
    },
    point(i, t, e, n) {
      const s = At(t, i), a = e.axis || "xy", r = e.includeInvisible || !1;
      return zi(i, s, a, n, r);
    },
    nearest(i, t, e, n) {
      const s = At(t, i), a = e.axis || "xy", r = e.includeInvisible || !1;
      return Ti(i, s, a, e.intersect, n, r);
    },
    x(i, t, e, n) {
      const s = At(t, i);
      return ln(i, s, "x", e.intersect, n);
    },
    y(i, t, e, n) {
      const s = At(t, i);
      return ln(i, s, "y", e.intersect, n);
    }
  }
};
const D0 = [
  "left",
  "top",
  "right",
  "bottom"
];
function oe(i, t) {
  return i.filter((e) => e.pos === t);
}
function dn(i, t) {
  return i.filter((e) => D0.indexOf(e.pos) === -1 && e.box.axis === t);
}
function le(i, t) {
  return i.sort((e, n) => {
    const s = t ? n : e, a = t ? e : n;
    return s.weight === a.weight ? s.index - a.index : s.weight - a.weight;
  });
}
function co(i) {
  const t = [];
  let e, n, s, a, r, o;
  for (e = 0, n = (i || []).length; e < n; ++e)
    s = i[e], { position: a, options: { stack: r, stackWeight: o = 1 } } = s, t.push({
      index: e,
      box: s,
      pos: a,
      horizontal: s.isHorizontal(),
      weight: s.weight,
      stack: r && a + r,
      stackWeight: o
    });
  return t;
}
function ho(i) {
  const t = {};
  for (const e of i) {
    const { stack: n, pos: s, stackWeight: a } = e;
    if (!n || !D0.includes(s))
      continue;
    const r = t[n] || (t[n] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    r.count++, r.weight += a;
  }
  return t;
}
function _o(i, t) {
  const e = ho(i), { vBoxMaxWidth: n, hBoxMaxHeight: s } = t;
  let a, r, o;
  for (a = 0, r = i.length; a < r; ++a) {
    o = i[a];
    const { fullSize: l } = o.box, d = e[o.stack], c = d && o.stackWeight / d.weight;
    o.horizontal ? (o.width = c ? c * n : l && t.availableWidth, o.height = s) : (o.width = n, o.height = c ? c * s : l && t.availableHeight);
  }
  return e;
}
function fo(i) {
  const t = co(i), e = le(t.filter((d) => d.box.fullSize), !0), n = le(oe(t, "left"), !0), s = le(oe(t, "right")), a = le(oe(t, "top"), !0), r = le(oe(t, "bottom")), o = dn(t, "x"), l = dn(t, "y");
  return {
    fullSize: e,
    leftAndTop: n.concat(a),
    rightAndBottom: s.concat(l).concat(r).concat(o),
    chartArea: oe(t, "chartArea"),
    vertical: n.concat(s).concat(l),
    horizontal: a.concat(r).concat(o)
  };
}
function cn(i, t, e, n) {
  return Math.max(i[e], t[e]) + Math.max(i[n], t[n]);
}
function R0(i, t) {
  i.top = Math.max(i.top, t.top), i.left = Math.max(i.left, t.left), i.bottom = Math.max(i.bottom, t.bottom), i.right = Math.max(i.right, t.right);
}
function uo(i, t, e, n) {
  const { pos: s, box: a } = e, r = i.maxPadding;
  if (!T(s)) {
    e.size && (i[s] -= e.size);
    const h = n[e.stack] || {
      size: 0,
      count: 1
    };
    h.size = Math.max(h.size, e.horizontal ? a.height : a.width), e.size = h.size / h.count, i[s] += e.size;
  }
  a.getPadding && R0(r, a.getPadding());
  const o = Math.max(0, t.outerWidth - cn(r, i, "left", "right")), l = Math.max(0, t.outerHeight - cn(r, i, "top", "bottom")), d = o !== i.w, c = l !== i.h;
  return i.w = o, i.h = l, e.horizontal ? {
    same: d,
    other: c
  } : {
    same: c,
    other: d
  };
}
function go(i) {
  const t = i.maxPadding;
  function e(n) {
    const s = Math.max(t[n] - i[n], 0);
    return i[n] += s, s;
  }
  i.y += e("top"), i.x += e("left"), e("right"), e("bottom");
}
function po(i, t) {
  const e = t.maxPadding;
  function n(s) {
    const a = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return s.forEach((r) => {
      a[r] = Math.max(t[r], e[r]);
    }), a;
  }
  return n(i ? [
    "left",
    "right"
  ] : [
    "top",
    "bottom"
  ]);
}
function fe(i, t, e, n) {
  const s = [];
  let a, r, o, l, d, c;
  for (a = 0, r = i.length, d = 0; a < r; ++a) {
    o = i[a], l = o.box, l.update(o.width || t.w, o.height || t.h, po(o.horizontal, t));
    const { same: h, other: _ } = uo(t, e, o, n);
    d |= h && s.length, c = c || _, l.fullSize || s.push(o);
  }
  return d && fe(s, t, e, n) || c;
}
function $e(i, t, e, n, s) {
  i.top = e, i.left = t, i.right = t + n, i.bottom = e + s, i.width = n, i.height = s;
}
function hn(i, t, e, n) {
  const s = e.padding;
  let { x: a, y: r } = t;
  for (const o of i) {
    const l = o.box, d = n[o.stack] || {
      placed: 0,
      weight: 1
    }, c = o.stackWeight / d.weight || 1;
    if (o.horizontal) {
      const h = t.w * c, _ = d.size || l.height;
      Se(d.start) && (r = d.start), l.fullSize ? $e(l, s.left, r, e.outerWidth - s.right - s.left, _) : $e(l, t.left + d.placed, r, h, _), d.start = r, d.placed += h, r = l.bottom;
    } else {
      const h = t.h * c, _ = d.size || l.width;
      Se(d.start) && (a = d.start), l.fullSize ? $e(l, a, s.top, _, e.outerHeight - s.bottom - s.top) : $e(l, a, t.top + d.placed, _, h), d.start = a, d.placed += h, a = l.right;
    }
  }
  t.x = a, t.y = r;
}
var yt = {
  addBox(i, t) {
    i.boxes || (i.boxes = []), t.fullSize = t.fullSize || !1, t.position = t.position || "top", t.weight = t.weight || 0, t._layers = t._layers || function() {
      return [
        {
          z: 0,
          draw(e) {
            t.draw(e);
          }
        }
      ];
    }, i.boxes.push(t);
  },
  removeBox(i, t) {
    const e = i.boxes ? i.boxes.indexOf(t) : -1;
    e !== -1 && i.boxes.splice(e, 1);
  },
  configure(i, t, e) {
    t.fullSize = e.fullSize, t.position = e.position, t.weight = e.weight;
  },
  update(i, t, e, n) {
    if (!i)
      return;
    const s = nt(i.options.layout.padding), a = Math.max(t - s.width, 0), r = Math.max(e - s.height, 0), o = fo(i.boxes), l = o.vertical, d = o.horizontal;
    H(i.boxes, (u) => {
      typeof u.beforeLayout == "function" && u.beforeLayout();
    });
    const c = l.reduce((u, p) => p.box.options && p.box.options.display === !1 ? u : u + 1, 0) || 1, h = Object.freeze({
      outerWidth: t,
      outerHeight: e,
      padding: s,
      availableWidth: a,
      availableHeight: r,
      vBoxMaxWidth: a / 2 / c,
      hBoxMaxHeight: r / 2
    }), _ = Object.assign({}, s);
    R0(_, nt(n));
    const f = Object.assign({
      maxPadding: _,
      w: a,
      h: r,
      x: s.left,
      y: s.top
    }, s), g = _o(l.concat(d), h);
    fe(o.fullSize, f, h, g), fe(l, f, h, g), fe(d, f, h, g) && fe(l, f, h, g), go(f), hn(o.leftAndTop, f, h, g), f.x += f.w, f.y += f.h, hn(o.rightAndBottom, f, h, g), i.chartArea = {
      left: f.left,
      top: f.top,
      right: f.left + f.w,
      bottom: f.top + f.h,
      height: f.h,
      width: f.w
    }, H(o.chartArea, (u) => {
      const p = u.box;
      Object.assign(p, i.chartArea), p.update(f.w, f.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class E0 {
  acquireContext(t, e) {
  }
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, n) {
  }
  removeEventListener(t, e, n) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, n, s) {
    return e = Math.max(0, e || t.width), n = n || t.height, {
      width: e,
      height: Math.max(0, s ? Math.floor(e / s) : n)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {
  }
}
class mo extends E0 {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const Je = "$chartjs", wo = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, _n = (i) => i === null || i === "";
function vo(i, t) {
  const e = i.style, n = i.getAttribute("height"), s = i.getAttribute("width");
  if (i[Je] = {
    initial: {
      height: n,
      width: s,
      style: {
        display: e.display,
        height: e.height,
        width: e.width
      }
    }
  }, e.display = e.display || "block", e.boxSizing = e.boxSizing || "border-box", _n(s)) {
    const a = Y1(i, "width");
    a !== void 0 && (i.width = a);
  }
  if (_n(n))
    if (i.style.height === "")
      i.height = i.width / (t || 2);
    else {
      const a = Y1(i, "height");
      a !== void 0 && (i.height = a);
    }
  return i;
}
const $0 = vr ? {
  passive: !0
} : !1;
function yo(i, t, e) {
  i && i.addEventListener(t, e, $0);
}
function bo(i, t, e) {
  i && i.canvas && i.canvas.removeEventListener(t, e, $0);
}
function xo(i, t) {
  const e = wo[i.type] || i.type, { x: n, y: s } = At(i, t);
  return {
    type: e,
    chart: t,
    native: i,
    x: n !== void 0 ? n : null,
    y: s !== void 0 ? s : null
  };
}
function li(i, t) {
  for (const e of i)
    if (e === t || e.contains(t))
      return !0;
}
function ko(i, t, e) {
  const n = i.canvas, s = new MutationObserver((a) => {
    let r = !1;
    for (const o of a)
      r = r || li(o.addedNodes, n), r = r && !li(o.removedNodes, n);
    r && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
function Mo(i, t, e) {
  const n = i.canvas, s = new MutationObserver((a) => {
    let r = !1;
    for (const o of a)
      r = r || li(o.removedNodes, n), r = r && !li(o.addedNodes, n);
    r && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
const Te = /* @__PURE__ */ new Map();
let fn = 0;
function V0() {
  const i = window.devicePixelRatio;
  i !== fn && (fn = i, Te.forEach((t, e) => {
    e.currentDevicePixelRatio !== i && t();
  }));
}
function Co(i, t) {
  Te.size || window.addEventListener("resize", V0), Te.set(i, t);
}
function So(i) {
  Te.delete(i), Te.size || window.removeEventListener("resize", V0);
}
function Po(i, t, e) {
  const n = i.canvas, s = n && f1(n);
  if (!s)
    return;
  const a = m0((o, l) => {
    const d = s.clientWidth;
    e(o, l), d < s.clientWidth && e();
  }, window), r = new ResizeObserver((o) => {
    const l = o[0], d = l.contentRect.width, c = l.contentRect.height;
    d === 0 && c === 0 || a(d, c);
  });
  return r.observe(s), Co(i, a), r;
}
function Li(i, t, e) {
  e && e.disconnect(), t === "resize" && So(i);
}
function zo(i, t, e) {
  const n = i.canvas, s = m0((a) => {
    i.ctx !== null && e(xo(a, i));
  }, i);
  return yo(n, t, s), s;
}
class To extends E0 {
  acquireContext(t, e) {
    const n = t && t.getContext && t.getContext("2d");
    return n && n.canvas === t ? (vo(t, e), n) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[Je])
      return !1;
    const n = e[Je].initial;
    [
      "height",
      "width"
    ].forEach((a) => {
      const r = n[a];
      L(r) ? e.removeAttribute(a) : e.setAttribute(a, r);
    });
    const s = n.style || {};
    return Object.keys(s).forEach((a) => {
      e.style[a] = s[a];
    }), e.width = e.width, delete e[Je], !0;
  }
  addEventListener(t, e, n) {
    this.removeEventListener(t, e);
    const s = t.$proxies || (t.$proxies = {}), r = {
      attach: ko,
      detach: Mo,
      resize: Po
    }[e] || zo;
    s[e] = r(t, e, n);
  }
  removeEventListener(t, e) {
    const n = t.$proxies || (t.$proxies = {}), s = n[e];
    if (!s)
      return;
    ({
      attach: Li,
      detach: Li,
      resize: Li
    }[e] || bo)(t, e, s), n[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, n, s) {
    return wr(t, e, n, s);
  }
  isAttached(t) {
    const e = t && f1(t);
    return !!(e && e.isConnected);
  }
}
function Lo(i) {
  return !_1() || typeof OffscreenCanvas < "u" && i instanceof OffscreenCanvas ? mo : To;
}
class Mt {
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = !1;
  options;
  $animations;
  tooltipPosition(t) {
    const { x: e, y: n } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: e,
      y: n
    };
  }
  hasValue() {
    return Pe(this.x) && Pe(this.y);
  }
  getProps(t, e) {
    const n = this.$animations;
    if (!e || !n)
      return this;
    const s = {};
    return t.forEach((a) => {
      s[a] = n[a] && n[a].active() ? n[a]._to : this[a];
    }), s;
  }
}
function Ao(i, t) {
  const e = i.options.ticks, n = qo(i), s = Math.min(e.maxTicksLimit || n, n), a = e.major.enabled ? No(t) : [], r = a.length, o = a[0], l = a[r - 1], d = [];
  if (r > s)
    return Bo(t, d, a, r / s), d;
  const c = Ho(a, t, s);
  if (r > 0) {
    let h, _;
    const f = r > 1 ? Math.round((l - o) / (r - 1)) : null;
    for (Ve(t, d, c, L(f) ? 0 : o - f, o), h = 0, _ = r - 1; h < _; h++)
      Ve(t, d, c, a[h], a[h + 1]);
    return Ve(t, d, c, l, L(f) ? t.length : l + f), d;
  }
  return Ve(t, d, c), d;
}
function qo(i) {
  const t = i.options.offset, e = i._tickSize(), n = i._length / e + (t ? 0 : 1), s = i._maxLength / e;
  return Math.floor(Math.min(n, s));
}
function Ho(i, t, e) {
  const n = Oo(i), s = t.length / e;
  if (!n)
    return Math.max(s, 1);
  const a = ma(n);
  for (let r = 0, o = a.length - 1; r < o; r++) {
    const l = a[r];
    if (l > s)
      return l;
  }
  return Math.max(s, 1);
}
function No(i) {
  const t = [];
  let e, n;
  for (e = 0, n = i.length; e < n; e++)
    i[e].major && t.push(e);
  return t;
}
function Bo(i, t, e, n) {
  let s = 0, a = e[0], r;
  for (n = Math.ceil(n), r = 0; r < i.length; r++)
    r === a && (t.push(i[r]), s++, a = e[s * n]);
}
function Ve(i, t, e, n, s) {
  const a = S(n, 0), r = Math.min(S(s, i.length), i.length);
  let o = 0, l, d, c;
  for (e = Math.ceil(e), s && (l = s - n, e = l / Math.floor(l / e)), c = a; c < 0; )
    o++, c = Math.round(a + o * e);
  for (d = Math.max(a, 0); d < r; d++)
    d === c && (t.push(i[d]), o++, c = Math.round(a + o * e));
}
function Oo(i) {
  const t = i.length;
  let e, n;
  if (t < 2)
    return !1;
  for (n = i[0], e = 1; e < t; ++e)
    if (i[e] - i[e - 1] !== n)
      return !1;
  return n;
}
const Do = (i) => i === "left" ? "right" : i === "right" ? "left" : i, un = (i, t, e) => t === "top" || t === "left" ? i[t] + e : i[t] - e, gn = (i, t) => Math.min(t || i, i);
function pn(i, t) {
  const e = [], n = i.length / t, s = i.length;
  let a = 0;
  for (; a < s; a += n)
    e.push(i[Math.floor(a)]);
  return e;
}
function Ro(i, t, e) {
  const n = i.ticks.length, s = Math.min(t, n - 1), a = i._startPixel, r = i._endPixel, o = 1e-6;
  let l = i.getPixelForTick(s), d;
  if (!(e && (n === 1 ? d = Math.max(l - a, r - l) : t === 0 ? d = (i.getPixelForTick(1) - l) / 2 : d = (l - i.getPixelForTick(s - 1)) / 2, l += s < t ? d : -d, l < a - o || l > r + o)))
    return l;
}
function Eo(i, t) {
  H(i, (e) => {
    const n = e.gc, s = n.length / 2;
    let a;
    if (s > t) {
      for (a = 0; a < s; ++a)
        delete e.data[n[a]];
      n.splice(0, s);
    }
  });
}
function de(i) {
  return i.drawTicks ? i.tickLength : 0;
}
function mn(i, t) {
  if (!i.display)
    return 0;
  const e = X(i.font, t), n = nt(i.padding);
  return (W(i.text) ? i.text.length : 1) * e.lineHeight + n.height;
}
function $o(i, t) {
  return Vt(i, {
    scale: t,
    type: "scale"
  });
}
function Vo(i, t, e) {
  return Vt(i, {
    tick: e,
    index: t,
    type: "tick"
  });
}
function Wo(i, t, e) {
  let n = w0(i);
  return (e && t !== "right" || !e && t === "right") && (n = Do(n)), n;
}
function Io(i, t, e, n) {
  const { top: s, left: a, bottom: r, right: o, chart: l } = i, { chartArea: d, scales: c } = l;
  let h = 0, _, f, g;
  const u = r - s, p = o - a;
  if (i.isHorizontal()) {
    if (f = tt(n, a, o), T(e)) {
      const m = Object.keys(e)[0], w = e[m];
      g = c[m].getPixelForValue(w) + u - t;
    } else e === "center" ? g = (d.bottom + d.top) / 2 + u - t : g = un(i, e, t);
    _ = o - a;
  } else {
    if (T(e)) {
      const m = Object.keys(e)[0], w = e[m];
      f = c[m].getPixelForValue(w) - p + t;
    } else e === "center" ? f = (d.left + d.right) / 2 - p + t : f = un(i, e, t);
    g = tt(n, r, s), h = e === "left" ? -F : F;
  }
  return {
    titleX: f,
    titleY: g,
    maxWidth: _,
    rotation: h
  };
}
class ie extends Mt {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: e, _suggestedMin: n, _suggestedMax: s } = this;
    return t = at(t, Number.POSITIVE_INFINITY), e = at(e, Number.NEGATIVE_INFINITY), n = at(n, Number.POSITIVE_INFINITY), s = at(s, Number.NEGATIVE_INFINITY), {
      min: at(t, n),
      max: at(e, s),
      minDefined: Y(t),
      maxDefined: Y(e)
    };
  }
  getMinMax(t) {
    let { min: e, max: n, minDefined: s, maxDefined: a } = this.getUserBounds(), r;
    if (s && a)
      return {
        min: e,
        max: n
      };
    const o = this.getMatchingVisibleMetas();
    for (let l = 0, d = o.length; l < d; ++l)
      r = o[l].controller.getMinMax(this, t), s || (e = Math.min(e, r.min)), a || (n = Math.max(n, r.max));
    return e = a && e > n ? n : e, n = s && e > n ? e : n, {
      min: at(e, at(n, e)),
      max: at(n, at(e, n))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    B(this.options.beforeUpdate, [
      this
    ]);
  }
  update(t, e, n) {
    const { beginAtZero: s, grace: a, ticks: r } = this.options, o = r.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = n = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, n), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + n.left + n.right : this.height + n.top + n.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = Ka(this, a, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const l = o < this.ticks.length;
    this._convertTicksToLabels(l ? pn(this.ticks, o) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), r.display && (r.autoSkip || r.source === "auto") && (this.ticks = Ao(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), l && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t = this.options.reverse, e, n;
    this.isHorizontal() ? (e = this.left, n = this.right) : (e = this.top, n = this.bottom, t = !t), this._startPixel = e, this._endPixel = n, this._reversePixels = t, this._length = n - e, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    B(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    B(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    B(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), B(this.options[t], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    B(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let n, s, a;
    for (n = 0, s = t.length; n < s; n++)
      a = t[n], a.label = B(e.callback, [
        a.value,
        n,
        t
      ], this);
  }
  afterTickToLabelConversion() {
    B(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    B(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const t = this.options, e = t.ticks, n = gn(this.ticks.length, t.ticks.maxTicksLimit), s = e.minRotation || 0, a = e.maxRotation;
    let r = s, o, l, d;
    if (!this._isVisible() || !e.display || s >= a || n <= 1 || !this.isHorizontal()) {
      this.labelRotation = s;
      return;
    }
    const c = this._getLabelSizes(), h = c.widest.width, _ = c.highest.height, f = G(this.chart.width - h, 0, this.maxWidth);
    o = t.offset ? this.maxWidth / n : f / (n - 1), h + 6 > o && (o = f / (n - (t.offset ? 0.5 : 1)), l = this.maxHeight - de(t.grid) - e.padding - mn(t.title, this.chart.options.font), d = Math.sqrt(h * h + _ * _), r = ba(Math.min(Math.asin(G((c.highest.height + 6) / o, -1, 1)), Math.asin(G(l / d, -1, 1)) - Math.asin(G(_ / d, -1, 1)))), r = Math.max(s, Math.min(a, r))), this.labelRotation = r;
  }
  afterCalculateLabelRotation() {
    B(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    B(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    }, { chart: e, options: { ticks: n, title: s, grid: a } } = this, r = this._isVisible(), o = this.isHorizontal();
    if (r) {
      const l = mn(s, e.options.font);
      if (o ? (t.width = this.maxWidth, t.height = de(a) + l) : (t.height = this.maxHeight, t.width = de(a) + l), n.display && this.ticks.length) {
        const { first: d, last: c, widest: h, highest: _ } = this._getLabelSizes(), f = n.padding * 2, g = Bt(this.labelRotation), u = Math.cos(g), p = Math.sin(g);
        if (o) {
          const m = n.mirror ? 0 : p * h.width + u * _.height;
          t.height = Math.min(this.maxHeight, t.height + m + f);
        } else {
          const m = n.mirror ? 0 : u * h.width + p * _.height;
          t.width = Math.min(this.maxWidth, t.width + m + f);
        }
        this._calculatePadding(d, c, p, u);
      }
    }
    this._handleMargins(), o ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, e, n, s) {
    const { ticks: { align: a, padding: r }, position: o } = this.options, l = this.labelRotation !== 0, d = o !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const c = this.getPixelForTick(0) - this.left, h = this.right - this.getPixelForTick(this.ticks.length - 1);
      let _ = 0, f = 0;
      l ? d ? (_ = s * t.width, f = n * e.height) : (_ = n * t.height, f = s * e.width) : a === "start" ? f = e.width : a === "end" ? _ = t.width : a !== "inner" && (_ = t.width / 2, f = e.width / 2), this.paddingLeft = Math.max((_ - c + r) * this.width / (this.width - c), 0), this.paddingRight = Math.max((f - h + r) * this.width / (this.width - h), 0);
    } else {
      let c = e.height / 2, h = t.height / 2;
      a === "start" ? (c = 0, h = t.height) : a === "end" && (c = e.height, h = 0), this.paddingTop = c + r, this.paddingBottom = h + r;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    B(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis: t, position: e } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    this.beforeTickToLabelConversion(), this.generateTickLabels(t);
    let e, n;
    for (e = 0, n = t.length; e < n; e++)
      L(t[e].label) && (t.splice(e, 1), n--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let n = this.ticks;
      e < n.length && (n = pn(n, e)), this._labelSizes = t = this._computeLabelSizes(n, n.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, n) {
    const { ctx: s, _longestTextCache: a } = this, r = [], o = [], l = Math.floor(e / gn(e, n));
    let d = 0, c = 0, h, _, f, g, u, p, m, w, y, b, v;
    for (h = 0; h < e; h += l) {
      if (g = t[h].label, u = this._resolveTickFontOptions(h), s.font = p = u.string, m = a[p] = a[p] || {
        data: {},
        gc: []
      }, w = u.lineHeight, y = b = 0, !L(g) && !W(g))
        y = I1(s, m.data, m.gc, y, g), b = w;
      else if (W(g))
        for (_ = 0, f = g.length; _ < f; ++_)
          v = g[_], !L(v) && !W(v) && (y = I1(s, m.data, m.gc, y, v), b += w);
      r.push(y), o.push(b), d = Math.max(y, d), c = Math.max(b, c);
    }
    Eo(a, e);
    const k = r.indexOf(d), M = o.indexOf(c), x = (C) => ({
      width: r[C] || 0,
      height: o[C] || 0
    });
    return {
      first: x(0),
      last: x(e - 1),
      widest: x(k),
      highest: x(M),
      widths: r,
      heights: o
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return ka(this._alignToPixels ? Tt(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: e } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const n = e[t];
      return n.$context || (n.$context = Vo(this.getContext(), t, n));
    }
    return this.$context || (this.$context = $o(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, e = Bt(this.labelRotation), n = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), a = this._getLabelSizes(), r = t.autoSkipPadding || 0, o = a ? a.widest.width + r : 0, l = a ? a.highest.height + r : 0;
    return this.isHorizontal() ? l * n > o * s ? o / n : l / s : l * s < o * n ? l / n : o / s;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis, n = this.chart, s = this.options, { grid: a, position: r, border: o } = s, l = a.offset, d = this.isHorizontal(), h = this.ticks.length + (l ? 1 : 0), _ = de(a), f = [], g = o.setContext(this.getContext()), u = g.display ? g.width : 0, p = u / 2, m = function(D) {
      return Tt(n, D, u);
    };
    let w, y, b, v, k, M, x, C, z, P, A, U;
    if (r === "top")
      w = m(this.bottom), M = this.bottom - _, C = w - p, P = m(t.top) + p, U = t.bottom;
    else if (r === "bottom")
      w = m(this.top), P = t.top, U = m(t.bottom) - p, M = w + p, C = this.top + _;
    else if (r === "left")
      w = m(this.right), k = this.right - _, x = w - p, z = m(t.left) + p, A = t.right;
    else if (r === "right")
      w = m(this.left), z = t.left, A = m(t.right) - p, k = w + p, x = this.left + _;
    else if (e === "x") {
      if (r === "center")
        w = m((t.top + t.bottom) / 2 + 0.5);
      else if (T(r)) {
        const D = Object.keys(r)[0], V = r[D];
        w = m(this.chart.scales[D].getPixelForValue(V));
      }
      P = t.top, U = t.bottom, M = w + p, C = M + _;
    } else if (e === "y") {
      if (r === "center")
        w = m((t.left + t.right) / 2);
      else if (T(r)) {
        const D = Object.keys(r)[0], V = r[D];
        w = m(this.chart.scales[D].getPixelForValue(V));
      }
      k = w - p, x = k - _, z = t.left, A = t.right;
    }
    const Q = S(s.ticks.maxTicksLimit, h), N = Math.max(1, Math.ceil(h / Q));
    for (y = 0; y < h; y += N) {
      const D = this.getContext(y), V = a.setContext(D), st = o.setContext(D), j = V.lineWidth, Wt = V.color, He = st.dash || [], It = st.dashOffset, ne = V.tickWidth, Ct = V.tickColor, se = V.tickBorderDash || [], St = V.tickBorderDashOffset;
      b = Ro(this, y, l), b !== void 0 && (v = Tt(n, b, j), d ? k = x = z = A = v : M = C = P = U = v, f.push({
        tx1: k,
        ty1: M,
        tx2: x,
        ty2: C,
        x1: z,
        y1: P,
        x2: A,
        y2: U,
        width: j,
        color: Wt,
        borderDash: He,
        borderDashOffset: It,
        tickWidth: ne,
        tickColor: Ct,
        tickBorderDash: se,
        tickBorderDashOffset: St
      }));
    }
    return this._ticksLength = h, this._borderValue = w, f;
  }
  _computeLabelItems(t) {
    const e = this.axis, n = this.options, { position: s, ticks: a } = n, r = this.isHorizontal(), o = this.ticks, { align: l, crossAlign: d, padding: c, mirror: h } = a, _ = de(n.grid), f = _ + c, g = h ? -c : f, u = -Bt(this.labelRotation), p = [];
    let m, w, y, b, v, k, M, x, C, z, P, A, U = "middle";
    if (s === "top")
      k = this.bottom - g, M = this._getXAxisLabelAlignment();
    else if (s === "bottom")
      k = this.top + g, M = this._getXAxisLabelAlignment();
    else if (s === "left") {
      const N = this._getYAxisLabelAlignment(_);
      M = N.textAlign, v = N.x;
    } else if (s === "right") {
      const N = this._getYAxisLabelAlignment(_);
      M = N.textAlign, v = N.x;
    } else if (e === "x") {
      if (s === "center")
        k = (t.top + t.bottom) / 2 + f;
      else if (T(s)) {
        const N = Object.keys(s)[0], D = s[N];
        k = this.chart.scales[N].getPixelForValue(D) + f;
      }
      M = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (s === "center")
        v = (t.left + t.right) / 2 - f;
      else if (T(s)) {
        const N = Object.keys(s)[0], D = s[N];
        v = this.chart.scales[N].getPixelForValue(D);
      }
      M = this._getYAxisLabelAlignment(_).textAlign;
    }
    e === "y" && (l === "start" ? U = "top" : l === "end" && (U = "bottom"));
    const Q = this._getLabelSizes();
    for (m = 0, w = o.length; m < w; ++m) {
      y = o[m], b = y.label;
      const N = a.setContext(this.getContext(m));
      x = this.getPixelForTick(m) + a.labelOffset, C = this._resolveTickFontOptions(m), z = C.lineHeight, P = W(b) ? b.length : 1;
      const D = P / 2, V = N.color, st = N.textStrokeColor, j = N.textStrokeWidth;
      let Wt = M;
      r ? (v = x, M === "inner" && (m === w - 1 ? Wt = this.options.reverse ? "left" : "right" : m === 0 ? Wt = this.options.reverse ? "right" : "left" : Wt = "center"), s === "top" ? d === "near" || u !== 0 ? A = -P * z + z / 2 : d === "center" ? A = -Q.highest.height / 2 - D * z + z : A = -Q.highest.height + z / 2 : d === "near" || u !== 0 ? A = z / 2 : d === "center" ? A = Q.highest.height / 2 - D * z : A = Q.highest.height - P * z, h && (A *= -1), u !== 0 && !N.showLabelBackdrop && (v += z / 2 * Math.sin(u))) : (k = x, A = (1 - P) * z / 2);
      let He;
      if (N.showLabelBackdrop) {
        const It = nt(N.backdropPadding), ne = Q.heights[m], Ct = Q.widths[m];
        let se = A - It.top, St = 0 - It.left;
        switch (U) {
          case "middle":
            se -= ne / 2;
            break;
          case "bottom":
            se -= ne;
            break;
        }
        switch (M) {
          case "center":
            St -= Ct / 2;
            break;
          case "right":
            St -= Ct;
            break;
          case "inner":
            m === w - 1 ? St -= Ct : m > 0 && (St -= Ct / 2);
            break;
        }
        He = {
          left: St,
          top: se,
          width: Ct + It.width,
          height: ne + It.height,
          color: N.backdropColor
        };
      }
      p.push({
        label: b,
        font: C,
        textOffset: A,
        options: {
          rotation: u,
          color: V,
          strokeColor: st,
          strokeWidth: j,
          textAlign: Wt,
          textBaseline: U,
          translation: [
            v,
            k
          ],
          backdrop: He
        }
      });
    }
    return p;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-Bt(this.labelRotation))
      return t === "top" ? "left" : "right";
    let s = "center";
    return e.align === "start" ? s = "left" : e.align === "end" ? s = "right" : e.align === "inner" && (s = "inner"), s;
  }
  _getYAxisLabelAlignment(t) {
    const { position: e, ticks: { crossAlign: n, mirror: s, padding: a } } = this.options, r = this._getLabelSizes(), o = t + a, l = r.widest.width;
    let d, c;
    return e === "left" ? s ? (c = this.right + a, n === "near" ? d = "left" : n === "center" ? (d = "center", c += l / 2) : (d = "right", c += l)) : (c = this.right - o, n === "near" ? d = "right" : n === "center" ? (d = "center", c -= l / 2) : (d = "left", c = this.left)) : e === "right" ? s ? (c = this.left + a, n === "near" ? d = "right" : n === "center" ? (d = "center", c -= l / 2) : (d = "left", c -= l)) : (c = this.left + o, n === "near" ? d = "left" : n === "center" ? (d = "center", c += l / 2) : (d = "right", c = this.right)) : d = "right", {
      textAlign: d,
      x: c
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror)
      return;
    const t = this.chart, e = this.options.position;
    if (e === "left" || e === "right")
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    if (e === "top" || e === "bottom")
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
  }
  drawBackground() {
    const { ctx: t, options: { backgroundColor: e }, left: n, top: s, width: a, height: r } = this;
    e && (t.save(), t.fillStyle = e, t.fillRect(n, s, a, r), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display)
      return 0;
    const s = this.ticks.findIndex((a) => a.value === t);
    return s >= 0 ? e.setContext(this.getContext(s)).lineWidth : 0;
  }
  drawGrid(t) {
    const e = this.options.grid, n = this.ctx, s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let a, r;
    const o = (l, d, c) => {
      !c.width || !c.color || (n.save(), n.lineWidth = c.width, n.strokeStyle = c.color, n.setLineDash(c.borderDash || []), n.lineDashOffset = c.borderDashOffset, n.beginPath(), n.moveTo(l.x, l.y), n.lineTo(d.x, d.y), n.stroke(), n.restore());
    };
    if (e.display)
      for (a = 0, r = s.length; a < r; ++a) {
        const l = s[a];
        e.drawOnChartArea && o({
          x: l.x1,
          y: l.y1
        }, {
          x: l.x2,
          y: l.y2
        }, l), e.drawTicks && o({
          x: l.tx1,
          y: l.ty1
        }, {
          x: l.tx2,
          y: l.ty2
        }, {
          color: l.tickColor,
          width: l.tickWidth,
          borderDash: l.tickBorderDash,
          borderDashOffset: l.tickBorderDashOffset
        });
      }
  }
  drawBorder() {
    const { chart: t, ctx: e, options: { border: n, grid: s } } = this, a = n.setContext(this.getContext()), r = n.display ? a.width : 0;
    if (!r)
      return;
    const o = s.setContext(this.getContext(0)).lineWidth, l = this._borderValue;
    let d, c, h, _;
    this.isHorizontal() ? (d = Tt(t, this.left, r) - r / 2, c = Tt(t, this.right, o) + o / 2, h = _ = l) : (h = Tt(t, this.top, r) - r / 2, _ = Tt(t, this.bottom, o) + o / 2, d = c = l), e.save(), e.lineWidth = a.width, e.strokeStyle = a.color, e.beginPath(), e.moveTo(d, h), e.lineTo(c, _), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const n = this.ctx, s = this._computeLabelArea();
    s && fi(n, s);
    const a = this.getLabelItems(t);
    for (const r of a) {
      const o = r.options, l = r.font, d = r.label, c = r.textOffset;
      ai(n, d, 0, c, l, o);
    }
    s && ui(n);
  }
  drawTitle() {
    const { ctx: t, options: { position: e, title: n, reverse: s } } = this;
    if (!n.display)
      return;
    const a = X(n.font), r = nt(n.padding), o = n.align;
    let l = a.lineHeight / 2;
    e === "bottom" || e === "center" || T(e) ? (l += r.bottom, W(n.text) && (l += a.lineHeight * (n.text.length - 1))) : l += r.top;
    const { titleX: d, titleY: c, maxWidth: h, rotation: _ } = Io(this, l, e, o);
    ai(t, n.text, 0, 0, a, {
      color: n.color,
      maxWidth: h,
      rotation: _,
      textAlign: Wo(o, e, s),
      textBaseline: "middle",
      translation: [
        d,
        c
      ]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options, e = t.ticks && t.ticks.z || 0, n = S(t.grid && t.grid.z, -1), s = S(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== ie.prototype.draw ? [
      {
        z: e,
        draw: (a) => {
          this.draw(a);
        }
      }
    ] : [
      {
        z: n,
        draw: (a) => {
          this.drawBackground(), this.drawGrid(a), this.drawTitle();
        }
      },
      {
        z: s,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: e,
        draw: (a) => {
          this.drawLabels(a);
        }
      }
    ];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(), n = this.axis + "AxisID", s = [];
    let a, r;
    for (a = 0, r = e.length; a < r; ++a) {
      const o = e[a];
      o[n] === this.id && (!t || o.type === t) && s.push(o);
    }
    return s;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return X(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class We {
  constructor(t, e, n) {
    this.type = t, this.scope = e, this.override = n, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let n;
    jo(e) && (n = this.register(e));
    const s = this.items, a = t.id, r = this.scope + "." + a;
    if (!a)
      throw new Error("class does not have id: " + t);
    return a in s || (s[a] = t, Uo(t, r, n), this.override && $.override(t.id, t.overrides)), r;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items, n = t.id, s = this.scope;
    n in e && delete e[n], s && n in $[s] && (delete $[s][n], this.override && delete Et[n]);
  }
}
function Uo(i, t, e) {
  const n = dt(/* @__PURE__ */ Object.create(null), [
    e ? $.get(e) : {},
    $.get(t),
    i.defaults
  ]);
  $.set(t, n), i.defaultRoutes && Fo(t, i.defaultRoutes), i.descriptors && $.describe(t, i.descriptors);
}
function Fo(i, t) {
  Object.keys(t).forEach((e) => {
    const n = e.split("."), s = n.pop(), a = [
      i
    ].concat(n).join("."), r = t[e].split("."), o = r.pop(), l = r.join(".");
    $.route(a, s, l, o);
  });
}
function jo(i) {
  return "id" in i && "defaults" in i;
}
class Go {
  constructor() {
    this.controllers = new We(u1, "datasets", !0), this.elements = new We(Mt, "elements"), this.plugins = new We(Object, "plugins"), this.scales = new We(ie, "scales"), this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, n) {
    [
      ...e
    ].forEach((s) => {
      const a = n || this._getRegistryForType(s);
      n || a.isForType(s) || a === this.plugins && s.id ? this._exec(t, a, s) : H(s, (r) => {
        const o = n || this._getRegistryForType(r);
        this._exec(t, o, r);
      });
    });
  }
  _exec(t, e, n) {
    const s = s1(t);
    B(n["before" + s], [], n), e[t](n), B(n["after" + s], [], n);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const n = this._typedRegistries[e];
      if (n.isForType(t))
        return n;
    }
    return this.plugins;
  }
  _get(t, e, n) {
    const s = e.get(t);
    if (s === void 0)
      throw new Error('"' + t + '" is not a registered ' + n + ".");
    return s;
  }
}
var ot = /* @__PURE__ */ new Go();
class Yo {
  constructor() {
    this._init = void 0;
  }
  notify(t, e, n, s) {
    if (e === "beforeInit" && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")), this._init === void 0)
      return;
    const a = s ? this._descriptors(t).filter(s) : this._descriptors(t), r = this._notify(a, t, e, n);
    return e === "afterDestroy" && (this._notify(a, t, "stop"), this._notify(this._init, t, "uninstall"), this._init = void 0), r;
  }
  _notify(t, e, n, s) {
    s = s || {};
    for (const a of t) {
      const r = a.plugin, o = r[n], l = [
        e,
        s,
        a.options
      ];
      if (B(o, l, r) === !1 && s.cancelable)
        return !1;
    }
    return !0;
  }
  invalidate() {
    L(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const n = t && t.config, s = S(n.options && n.options.plugins, {}), a = Xo(n);
    return s === !1 && !e ? [] : Zo(t, a, s, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [], n = this._cache, s = (a, r) => a.filter((o) => !r.some((l) => o.plugin.id === l.plugin.id));
    this._notify(s(e, n), t, "stop"), this._notify(s(n, e), t, "start");
  }
}
function Xo(i) {
  const t = {}, e = [], n = Object.keys(ot.plugins.items);
  for (let a = 0; a < n.length; a++)
    e.push(ot.getPlugin(n[a]));
  const s = i.plugins || [];
  for (let a = 0; a < s.length; a++) {
    const r = s[a];
    e.indexOf(r) === -1 && (e.push(r), t[r.id] = !0);
  }
  return {
    plugins: e,
    localIds: t
  };
}
function Ko(i, t) {
  return !t && i === !1 ? null : i === !0 ? {} : i;
}
function Zo(i, { plugins: t, localIds: e }, n, s) {
  const a = [], r = i.getContext();
  for (const o of t) {
    const l = o.id, d = Ko(n[l], s);
    d !== null && a.push({
      plugin: o,
      options: Jo(i.config, {
        plugin: o,
        local: e[l]
      }, d, r)
    });
  }
  return a;
}
function Jo(i, { plugin: t, local: e }, n, s) {
  const a = i.pluginScopeKeys(t), r = i.getOptionScopes(n, a);
  return e && t.defaults && r.push(t.defaults), i.createResolver(r, s, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function Vi(i, t) {
  const e = $.datasets[i] || {};
  return ((t.datasets || {})[i] || {}).indexAxis || t.indexAxis || e.indexAxis || "x";
}
function Qo(i, t) {
  let e = i;
  return i === "_index_" ? e = t : i === "_value_" && (e = t === "x" ? "y" : "x"), e;
}
function t2(i, t) {
  return i === t ? "_index_" : "_value_";
}
function wn(i) {
  if (i === "x" || i === "y" || i === "r")
    return i;
}
function e2(i) {
  if (i === "top" || i === "bottom")
    return "x";
  if (i === "left" || i === "right")
    return "y";
}
function Wi(i, ...t) {
  if (wn(i))
    return i;
  for (const e of t) {
    const n = e.axis || e2(e.position) || i.length > 1 && wn(i[0].toLowerCase());
    if (n)
      return n;
  }
  throw new Error(`Cannot determine type of '${i}' axis. Please provide 'axis' or 'position' option.`);
}
function vn(i, t, e) {
  if (e[t + "AxisID"] === i)
    return {
      axis: t
    };
}
function i2(i, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((n) => n.xAxisID === i || n.yAxisID === i);
    if (e.length)
      return vn(i, "x", e[0]) || vn(i, "y", e[0]);
  }
  return {};
}
function n2(i, t) {
  const e = Et[i.type] || {
    scales: {}
  }, n = t.scales || {}, s = Vi(i.type, t), a = /* @__PURE__ */ Object.create(null);
  return Object.keys(n).forEach((r) => {
    const o = n[r];
    if (!T(o))
      return console.error(`Invalid scale configuration for scale: ${r}`);
    if (o._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${r}`);
    const l = Wi(r, o, i2(r, i), $.scales[o.type]), d = t2(l, s), c = e.scales || {};
    a[r] = pe(/* @__PURE__ */ Object.create(null), [
      {
        axis: l
      },
      o,
      c[l],
      c[d]
    ]);
  }), i.data.datasets.forEach((r) => {
    const o = r.type || i.type, l = r.indexAxis || Vi(o, t), c = (Et[o] || {}).scales || {};
    Object.keys(c).forEach((h) => {
      const _ = Qo(h, l), f = r[_ + "AxisID"] || _;
      a[f] = a[f] || /* @__PURE__ */ Object.create(null), pe(a[f], [
        {
          axis: _
        },
        n[f],
        c[h]
      ]);
    });
  }), Object.keys(a).forEach((r) => {
    const o = a[r];
    pe(o, [
      $.scales[o.type],
      $.scale
    ]);
  }), a;
}
function W0(i) {
  const t = i.options || (i.options = {});
  t.plugins = S(t.plugins, {}), t.scales = n2(i, t);
}
function I0(i) {
  return i = i || {}, i.datasets = i.datasets || [], i.labels = i.labels || [], i;
}
function s2(i) {
  return i = i || {}, i.data = I0(i.data), W0(i), i;
}
const yn = /* @__PURE__ */ new Map(), U0 = /* @__PURE__ */ new Set();
function Ie(i, t) {
  let e = yn.get(i);
  return e || (e = t(), yn.set(i, e), U0.add(e)), e;
}
const ce = (i, t, e) => {
  const n = Jt(t, e);
  n !== void 0 && i.add(n);
};
class a2 {
  constructor(t) {
    this._config = s2(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = I0(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), W0(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return Ie(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, e) {
    return Ie(`${t}.transition.${e}`, () => [
      [
        `datasets.${t}.transitions.${e}`,
        `transitions.${e}`
      ],
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(t, e) {
    return Ie(`${t}-${e}`, () => [
      [
        `datasets.${t}.elements.${e}`,
        `datasets.${t}`,
        `elements.${e}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(t) {
    const e = t.id, n = this.type;
    return Ie(`${n}-plugin-${e}`, () => [
      [
        `plugins.${e}`,
        ...t.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(t, e) {
    const n = this._scopeCache;
    let s = n.get(t);
    return (!s || e) && (s = /* @__PURE__ */ new Map(), n.set(t, s)), s;
  }
  getOptionScopes(t, e, n) {
    const { options: s, type: a } = this, r = this._cachedScopes(t, n), o = r.get(e);
    if (o)
      return o;
    const l = /* @__PURE__ */ new Set();
    e.forEach((c) => {
      t && (l.add(t), c.forEach((h) => ce(l, t, h))), c.forEach((h) => ce(l, s, h)), c.forEach((h) => ce(l, Et[a] || {}, h)), c.forEach((h) => ce(l, $, h)), c.forEach((h) => ce(l, Ei, h));
    });
    const d = Array.from(l);
    return d.length === 0 && d.push(/* @__PURE__ */ Object.create(null)), U0.has(e) && r.set(e, d), d;
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [
      t,
      Et[e] || {},
      $.datasets[e] || {},
      {
        type: e
      },
      $,
      Ei
    ];
  }
  resolveNamedOptions(t, e, n, s = [
    ""
  ]) {
    const a = {
      $shared: !0
    }, { resolver: r, subPrefixes: o } = bn(this._resolverCache, t, s);
    let l = r;
    if (o2(r, e)) {
      a.$shared = !1, n = kt(n) ? n() : n;
      const d = this.createResolver(t, n, o);
      l = Qt(r, n, d);
    }
    for (const d of e)
      a[d] = l[d];
    return a;
  }
  createResolver(t, e, n = [
    ""
  ], s) {
    const { resolver: a } = bn(this._resolverCache, t, n);
    return T(e) ? Qt(a, e, void 0, s) : a;
  }
}
function bn(i, t, e) {
  let n = i.get(t);
  n || (n = /* @__PURE__ */ new Map(), i.set(t, n));
  const s = e.join();
  let a = n.get(s);
  return a || (a = {
    resolver: d1(t, e),
    subPrefixes: e.filter((o) => !o.toLowerCase().includes("hover"))
  }, n.set(s, a)), a;
}
const r2 = (i) => T(i) && Object.getOwnPropertyNames(i).some((t) => kt(i[t]));
function o2(i, t) {
  const { isScriptable: e, isIndexable: n } = k0(i);
  for (const s of t) {
    const a = e(s), r = n(s), o = (r || a) && i[s];
    if (a && (kt(o) || r2(o)) || r && W(o))
      return !0;
  }
  return !1;
}
var l2 = "4.5.1";
const d2 = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function xn(i, t) {
  return i === "top" || i === "bottom" || d2.indexOf(i) === -1 && t === "x";
}
function kn(i, t) {
  return function(e, n) {
    return e[i] === n[i] ? e[t] - n[t] : e[i] - n[i];
  };
}
function Mn(i) {
  const t = i.chart, e = t.options.animation;
  t.notifyPlugins("afterRender"), B(e && e.onComplete, [
    i
  ], t);
}
function c2(i) {
  const t = i.chart, e = t.options.animation;
  B(e && e.onProgress, [
    i
  ], t);
}
function F0(i) {
  return _1() && typeof i == "string" ? i = document.getElementById(i) : i && i.length && (i = i[0]), i && i.canvas && (i = i.canvas), i;
}
const Qe = {}, Cn = (i) => {
  const t = F0(i);
  return Object.values(Qe).filter((e) => e.canvas === t).pop();
};
function h2(i, t, e) {
  const n = Object.keys(i);
  for (const s of n) {
    const a = +s;
    if (a >= t) {
      const r = i[s];
      delete i[s], (e > 0 || a > t) && (i[a + e] = r);
    }
  }
}
function _2(i, t, e, n) {
  return !e || i.type === "mouseout" ? null : n ? t : i;
}
class p1 {
  static defaults = $;
  static instances = Qe;
  static overrides = Et;
  static registry = ot;
  static version = l2;
  static getChart = Cn;
  static register(...t) {
    ot.add(...t), Sn();
  }
  static unregister(...t) {
    ot.remove(...t), Sn();
  }
  constructor(t, e) {
    const n = this.config = new a2(e), s = F0(t), a = Cn(s);
    if (a)
      throw new Error("Canvas is already in use. Chart with ID '" + a.id + "' must be destroyed before the canvas with ID '" + a.canvas.id + "' can be reused.");
    const r = n.createResolver(n.chartOptionScopes(), this.getContext());
    this.platform = new (n.platform || Lo(s))(), this.platform.updateConfig(n);
    const o = this.platform.acquireContext(s, r.aspectRatio), l = o && o.canvas, d = l && l.height, c = l && l.width;
    if (this.id = la(), this.ctx = o, this.canvas = l, this.width = c, this.height = d, this._options = r, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new Yo(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = Pa((h) => this.update(h), r.resizeDelay || 0), this._dataChanges = [], Qe[this.id] = this, !o || !l) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    ht.listen(this, "complete", Mn), ht.listen(this, "progress", c2), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: e }, width: n, height: s, _aspectRatio: a } = this;
    return L(t) ? e && a ? a : s ? n / s : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return ot;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : G1(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return U1(this.canvas, this.ctx), this;
  }
  stop() {
    return ht.stop(this), this;
  }
  resize(t, e) {
    ht.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const n = this.options, s = this.canvas, a = n.maintainAspectRatio && this.aspectRatio, r = this.platform.getMaximumSize(s, t, e, a), o = n.devicePixelRatio || this.platform.getDevicePixelRatio(), l = this.width ? "resize" : "attach";
    this.width = r.width, this.height = r.height, this._aspectRatio = this.aspectRatio, G1(this, o, !0) && (this.notifyPlugins("resize", {
      size: r
    }), B(n.onResize, [
      this,
      r
    ], this), this.attached && this._doResize(l) && this.render());
  }
  ensureScalesHaveIDs() {
    const e = this.options.scales || {};
    H(e, (n, s) => {
      n.id = s;
    });
  }
  buildOrUpdateScales() {
    const t = this.options, e = t.scales, n = this.scales, s = Object.keys(n).reduce((r, o) => (r[o] = !1, r), {});
    let a = [];
    e && (a = a.concat(Object.keys(e).map((r) => {
      const o = e[r], l = Wi(r, o), d = l === "r", c = l === "x";
      return {
        options: o,
        dposition: d ? "chartArea" : c ? "bottom" : "left",
        dtype: d ? "radialLinear" : c ? "category" : "linear"
      };
    }))), H(a, (r) => {
      const o = r.options, l = o.id, d = Wi(l, o), c = S(o.type, r.dtype);
      (o.position === void 0 || xn(o.position, d) !== xn(r.dposition)) && (o.position = r.dposition), s[l] = !0;
      let h = null;
      if (l in n && n[l].type === c)
        h = n[l];
      else {
        const _ = ot.getScale(c);
        h = new _({
          id: l,
          type: c,
          ctx: this.ctx,
          chart: this
        }), n[h.id] = h;
      }
      h.init(o, t);
    }), H(s, (r, o) => {
      r || delete n[o];
    }), H(n, (r) => {
      yt.configure(this, r, r.options), yt.addBox(this, r);
    });
  }
  _updateMetasets() {
    const t = this._metasets, e = this.data.datasets.length, n = t.length;
    if (t.sort((s, a) => s.index - a.index), n > e) {
      for (let s = e; s < n; ++s)
        this._destroyDatasetMeta(s);
      t.splice(e, n - e);
    }
    this._sortedMetasets = t.slice(0).sort(kn("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: t, data: { datasets: e } } = this;
    t.length > e.length && delete this._stacks, t.forEach((n, s) => {
      e.filter((a) => a === n._dataset).length === 0 && this._destroyDatasetMeta(s);
    });
  }
  buildOrUpdateControllers() {
    const t = [], e = this.data.datasets;
    let n, s;
    for (this._removeUnreferencedMetasets(), n = 0, s = e.length; n < s; n++) {
      const a = e[n];
      let r = this.getDatasetMeta(n);
      const o = a.type || this.config.type;
      if (r.type && r.type !== o && (this._destroyDatasetMeta(n), r = this.getDatasetMeta(n)), r.type = o, r.indexAxis = a.indexAxis || Vi(o, this.options), r.order = a.order || 0, r.index = n, r.label = "" + a.label, r.visible = this.isDatasetVisible(n), r.controller)
        r.controller.updateIndex(n), r.controller.linkScales();
      else {
        const l = ot.getController(o), { datasetElementType: d, dataElementType: c } = $.datasets[o];
        Object.assign(l, {
          dataElementType: ot.getElement(c),
          datasetElementType: d && ot.getElement(d)
        }), r.controller = new l(this, n), t.push(r.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    H(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const n = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), s = this._animationsDisabled = !n.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    }) === !1)
      return;
    const a = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let r = 0;
    for (let d = 0, c = this.data.datasets.length; d < c; d++) {
      const { controller: h } = this.getDatasetMeta(d), _ = !s && a.indexOf(h) === -1;
      h.buildOrUpdateElements(_), r = Math.max(+h.getMaxOverflow(), r);
    }
    r = this._minPadding = n.layout.autoPadding ? r : 0, this._updateLayout(r), s || H(a, (d) => {
      d.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(kn("z", "_idx"));
    const { _active: o, _lastEvent: l } = this;
    l ? this._eventHandler(l, !0) : o.length && this._updateHoverStyles(o, o, !0), this.render();
  }
  _updateScales() {
    H(this.scales, (t) => {
      yt.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, e = new Set(Object.keys(this._listeners)), n = new Set(t.events);
    (!N1(e, n) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || [];
    for (const { method: n, start: s, count: a } of e) {
      const r = n === "_removeElements" ? -a : a;
      h2(t, s, r);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const e = this.data.datasets.length, n = (a) => new Set(t.filter((r) => r[0] === a).map((r, o) => o + "," + r.splice(1).join(","))), s = n(0);
    for (let a = 1; a < e; a++)
      if (!N1(s, n(a)))
        return;
    return Array.from(s).map((a) => a.split(",")).map((a) => ({
      method: a[1],
      start: +a[2],
      count: +a[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: !0
    }) === !1)
      return;
    yt.update(this, this.width, this.height, t);
    const e = this.chartArea, n = e.width <= 0 || e.height <= 0;
    this._layers = [], H(this.boxes, (s) => {
      n && s.position === "chartArea" || (s.configure && s.configure(), this._layers.push(...s._layers()));
    }, this), this._layers.forEach((s, a) => {
      s._idx = a;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    }) !== !1) {
      for (let e = 0, n = this.data.datasets.length; e < n; ++e)
        this.getDatasetMeta(e).controller.configure();
      for (let e = 0, n = this.data.datasets.length; e < n; ++e)
        this._updateDataset(e, kt(t) ? t({
          datasetIndex: e
        }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const n = this.getDatasetMeta(t), s = {
      meta: n,
      index: t,
      mode: e,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetUpdate", s) !== !1 && (n.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s));
  }
  render() {
    this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) !== !1 && (ht.has(this) ? this.attached && !ht.running(this) && ht.start(this) : (this.draw(), Mn({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: n, height: s } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null, this._resize(n, s);
    }
    if (this.clear(), this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
      cancelable: !0
    }) === !1)
      return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t)
      e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t)
      e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets, n = [];
    let s, a;
    for (s = 0, a = e.length; s < a; ++s) {
      const r = e[s];
      (!t || r.visible) && n.push(r);
    }
    return n;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e)
      this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx, n = {
      meta: t,
      index: t.index,
      cancelable: !0
    }, s = H0(this, t);
    this.notifyPlugins("beforeDatasetDraw", n) !== !1 && (s && fi(e, s), t.controller.draw(), s && ui(e), n.cancelable = !1, this.notifyPlugins("afterDatasetDraw", n));
  }
  isPointInArea(t) {
    return ze(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, n, s) {
    const a = lo.modes[e];
    return typeof a == "function" ? a(this, t, n, s) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t], n = this._metasets;
    let s = n.filter((a) => a && a._dataset === e).pop();
    return s || (s = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: e && e.order || 0,
      index: t,
      _dataset: e,
      _parsed: [],
      _sorted: !1
    }, n.push(s)), s;
  }
  getContext() {
    return this.$context || (this.$context = Vt(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e)
      return !1;
    const n = this.getDatasetMeta(t);
    return typeof n.hidden == "boolean" ? !n.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    const n = this.getDatasetMeta(t);
    n.hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, n) {
    const s = n ? "show" : "hide", a = this.getDatasetMeta(t), r = a.controller._resolveAnimations(void 0, s);
    Se(e) ? (a.data[e].hidden = !n, this.update()) : (this.setDatasetVisibility(t, n), r.update(a, {
      visible: n
    }), this.update((o) => o.datasetIndex === t ? s : void 0));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    e && e.controller && e.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, e;
    for (this.stop(), ht.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), U1(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete Qe[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners, e = this.platform, n = (a, r) => {
      e.addEventListener(this, a, r), t[a] = r;
    }, s = (a, r, o) => {
      a.offsetX = r, a.offsetY = o, this._eventHandler(a);
    };
    H(this.options.events, (a) => n(a, s));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners, e = this.platform, n = (l, d) => {
      e.addEventListener(this, l, d), t[l] = d;
    }, s = (l, d) => {
      t[l] && (e.removeEventListener(this, l, d), delete t[l]);
    }, a = (l, d) => {
      this.canvas && this.resize(l, d);
    };
    let r;
    const o = () => {
      s("attach", o), this.attached = !0, this.resize(), n("resize", a), n("detach", r);
    };
    r = () => {
      this.attached = !1, s("resize", a), this._stop(), this._resize(0, 0), n("attach", o);
    }, e.isAttached(this.canvas) ? o() : r();
  }
  unbindEvents() {
    H(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._listeners = {}, H(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, e, n) {
    const s = n ? "set" : "remove";
    let a, r, o, l;
    for (e === "dataset" && (a = this.getDatasetMeta(t[0].datasetIndex), a.controller["_" + s + "DatasetHoverStyle"]()), o = 0, l = t.length; o < l; ++o) {
      r = t[o];
      const d = r && this.getDatasetMeta(r.datasetIndex).controller;
      d && d[s + "HoverStyle"](r.element, r.datasetIndex, r.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [], n = t.map(({ datasetIndex: a, index: r }) => {
      const o = this.getDatasetMeta(a);
      if (!o)
        throw new Error("No dataset found at index " + a);
      return {
        datasetIndex: a,
        element: o.data[r],
        index: r
      };
    });
    !ii(n, e) && (this._active = n, this._lastEvent = null, this._updateHoverStyles(n, e));
  }
  notifyPlugins(t, e, n) {
    return this._plugins.notify(this, t, e, n);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((e) => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, n) {
    const s = this.options.hover, a = (l, d) => l.filter((c) => !d.some((h) => c.datasetIndex === h.datasetIndex && c.index === h.index)), r = a(e, t), o = n ? t : a(t, e);
    r.length && this.updateHoverStyle(r, s.mode, !1), o.length && s.mode && this.updateHoverStyle(o, s.mode, !0);
  }
  _eventHandler(t, e) {
    const n = {
      event: t,
      replay: e,
      cancelable: !0,
      inChartArea: this.isPointInArea(t)
    }, s = (r) => (r.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", n, s) === !1)
      return;
    const a = this._handleEvent(t, e, n.inChartArea);
    return n.cancelable = !1, this.notifyPlugins("afterEvent", n, s), (a || n.changed) && this.render(), this;
  }
  _handleEvent(t, e, n) {
    const { _active: s = [], options: a } = this, r = e, o = this._getActiveElements(t, s, n, r), l = ua(t), d = _2(t, this._lastEvent, n, l);
    n && (this._lastEvent = null, B(a.onHover, [
      t,
      o,
      this
    ], this), l && B(a.onClick, [
      t,
      o,
      this
    ], this));
    const c = !ii(o, s);
    return (c || e) && (this._active = o, this._updateHoverStyles(o, s, e)), this._lastEvent = d, c;
  }
  _getActiveElements(t, e, n, s) {
    if (t.type === "mouseout")
      return [];
    if (!n)
      return e;
    const a = this.options.hover;
    return this.getElementsAtEventForMode(t, a.mode, a, s);
  }
}
function Sn() {
  return H(p1.instances, (i) => i._plugins.invalidate());
}
function f2(i, t, e) {
  const { startAngle: n, x: s, y: a, outerRadius: r, innerRadius: o, options: l } = t, { borderWidth: d, borderJoinStyle: c } = l, h = Math.min(d / r, et(n - e));
  if (i.beginPath(), i.arc(s, a, r - d / 2, n + h / 2, e - h / 2), o > 0) {
    const _ = Math.min(d / o, et(n - e));
    i.arc(s, a, o + d / 2, e - _ / 2, n + _ / 2, !0);
  } else {
    const _ = Math.min(d / 2, r * et(n - e));
    if (c === "round")
      i.arc(s, a, _, e - O / 2, n + O / 2, !0);
    else if (c === "bevel") {
      const f = 2 * _ * _, g = -f * Math.cos(e + O / 2) + s, u = -f * Math.sin(e + O / 2) + a, p = f * Math.cos(n + O / 2) + s, m = f * Math.sin(n + O / 2) + a;
      i.lineTo(g, u), i.lineTo(p, m);
    }
  }
  i.closePath(), i.moveTo(0, 0), i.rect(0, 0, i.canvas.width, i.canvas.height), i.clip("evenodd");
}
function u2(i, t, e) {
  const { startAngle: n, pixelMargin: s, x: a, y: r, outerRadius: o, innerRadius: l } = t;
  let d = s / o;
  i.beginPath(), i.arc(a, r, o, n - d, e + d), l > s ? (d = s / l, i.arc(a, r, l, e + d, n - d, !0)) : i.arc(a, r, s, e + F, n - F), i.closePath(), i.clip();
}
function g2(i) {
  return l1(i, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd"
  ]);
}
function p2(i, t, e, n) {
  const s = g2(i.options.borderRadius), a = (e - t) / 2, r = Math.min(a, n * t / 2), o = (l) => {
    const d = (e - Math.min(a, l)) * n / 2;
    return G(l, 0, Math.min(a, d));
  };
  return {
    outerStart: o(s.outerStart),
    outerEnd: o(s.outerEnd),
    innerStart: G(s.innerStart, 0, r),
    innerEnd: G(s.innerEnd, 0, r)
  };
}
function Ft(i, t, e, n) {
  return {
    x: e + i * Math.cos(t),
    y: n + i * Math.sin(t)
  };
}
function di(i, t, e, n, s, a) {
  const { x: r, y: o, startAngle: l, pixelMargin: d, innerRadius: c } = t, h = Math.max(t.outerRadius + n + e - d, 0), _ = c > 0 ? c + n + e + d : 0;
  let f = 0;
  const g = s - l;
  if (n) {
    const N = c > 0 ? c - n : 0, D = h > 0 ? h - n : 0, V = (N + D) / 2, st = V !== 0 ? g * V / (V + n) : g;
    f = (g - st) / 2;
  }
  const u = Math.max(1e-3, g * h - e / O) / h, p = (g - u) / 2, m = l + p + f, w = s - p - f, { outerStart: y, outerEnd: b, innerStart: v, innerEnd: k } = p2(t, _, h, w - m), M = h - y, x = h - b, C = m + y / M, z = w - b / x, P = _ + v, A = _ + k, U = m + v / P, Q = w - k / A;
  if (i.beginPath(), a) {
    const N = (C + z) / 2;
    if (i.arc(r, o, h, C, N), i.arc(r, o, h, N, z), b > 0) {
      const j = Ft(x, z, r, o);
      i.arc(j.x, j.y, b, z, w + F);
    }
    const D = Ft(A, w, r, o);
    if (i.lineTo(D.x, D.y), k > 0) {
      const j = Ft(A, Q, r, o);
      i.arc(j.x, j.y, k, w + F, Q + Math.PI);
    }
    const V = (w - k / _ + (m + v / _)) / 2;
    if (i.arc(r, o, _, w - k / _, V, !0), i.arc(r, o, _, V, m + v / _, !0), v > 0) {
      const j = Ft(P, U, r, o);
      i.arc(j.x, j.y, v, U + Math.PI, m - F);
    }
    const st = Ft(M, m, r, o);
    if (i.lineTo(st.x, st.y), y > 0) {
      const j = Ft(M, C, r, o);
      i.arc(j.x, j.y, y, m - F, C);
    }
  } else {
    i.moveTo(r, o);
    const N = Math.cos(C) * h + r, D = Math.sin(C) * h + o;
    i.lineTo(N, D);
    const V = Math.cos(z) * h + r, st = Math.sin(z) * h + o;
    i.lineTo(V, st);
  }
  i.closePath();
}
function m2(i, t, e, n, s) {
  const { fullCircles: a, startAngle: r, circumference: o } = t;
  let l = t.endAngle;
  if (a) {
    di(i, t, e, n, l, s);
    for (let d = 0; d < a; ++d)
      i.fill();
    isNaN(o) || (l = r + (o % I || I));
  }
  return di(i, t, e, n, l, s), i.fill(), l;
}
function w2(i, t, e, n, s) {
  const { fullCircles: a, startAngle: r, circumference: o, options: l } = t, { borderWidth: d, borderJoinStyle: c, borderDash: h, borderDashOffset: _, borderRadius: f } = l, g = l.borderAlign === "inner";
  if (!d)
    return;
  i.setLineDash(h || []), i.lineDashOffset = _, g ? (i.lineWidth = d * 2, i.lineJoin = c || "round") : (i.lineWidth = d, i.lineJoin = c || "bevel");
  let u = t.endAngle;
  if (a) {
    di(i, t, e, n, u, s);
    for (let p = 0; p < a; ++p)
      i.stroke();
    isNaN(o) || (u = r + (o % I || I));
  }
  g && u2(i, t, u), l.selfJoin && u - r >= O && f === 0 && c !== "miter" && f2(i, t, u), a || (di(i, t, e, n, u, s), i.stroke());
}
class v2 extends Mt {
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: void 0,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    angle: void 0,
    circular: !0,
    selfJoin: !1
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor"
  };
  static descriptors = {
    _scriptable: !0,
    _indexable: (t) => t !== "borderDash"
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(t) {
    super(), this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, t && Object.assign(this, t);
  }
  inRange(t, e, n) {
    const s = this.getProps([
      "x",
      "y"
    ], n), { angle: a, distance: r } = f0(s, {
      x: t,
      y: e
    }), { startAngle: o, endAngle: l, innerRadius: d, outerRadius: c, circumference: h } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], n), _ = (this.options.spacing + this.options.borderWidth) / 2, f = S(h, l - o), g = a1(a, o, l) && o !== l, u = f >= I || g, p = gt(r, d + _, c + _);
    return u && p;
  }
  getCenterPoint(t) {
    const { x: e, y: n, startAngle: s, endAngle: a, innerRadius: r, outerRadius: o } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius"
    ], t), { offset: l, spacing: d } = this.options, c = (s + a) / 2, h = (r + o + d + l) / 2;
    return {
      x: e + Math.cos(c) * h,
      y: n + Math.sin(c) * h
    };
  }
  tooltipPosition(t) {
    return this.getCenterPoint(t);
  }
  draw(t) {
    const { options: e, circumference: n } = this, s = (e.offset || 0) / 4, a = (e.spacing || 0) / 2, r = e.circular;
    if (this.pixelMargin = e.borderAlign === "inner" ? 0.33 : 0, this.fullCircles = n > I ? Math.floor(n / I) : 0, n === 0 || this.innerRadius < 0 || this.outerRadius < 0)
      return;
    t.save();
    const o = (this.startAngle + this.endAngle) / 2;
    t.translate(Math.cos(o) * s, Math.sin(o) * s);
    const l = 1 - Math.sin(Math.min(O, n || 0)), d = s * l;
    t.fillStyle = e.backgroundColor, t.strokeStyle = e.borderColor, m2(t, this, d, a, r), w2(t, this, d, a, r), t.restore();
  }
}
function j0(i, t, e = t) {
  i.lineCap = S(e.borderCapStyle, t.borderCapStyle), i.setLineDash(S(e.borderDash, t.borderDash)), i.lineDashOffset = S(e.borderDashOffset, t.borderDashOffset), i.lineJoin = S(e.borderJoinStyle, t.borderJoinStyle), i.lineWidth = S(e.borderWidth, t.borderWidth), i.strokeStyle = S(e.borderColor, t.borderColor);
}
function y2(i, t, e) {
  i.lineTo(e.x, e.y);
}
function b2(i) {
  return i.stepped ? Va : i.tension || i.cubicInterpolationMode === "monotone" ? Wa : y2;
}
function G0(i, t, e = {}) {
  const n = i.length, { start: s = 0, end: a = n - 1 } = e, { start: r, end: o } = t, l = Math.max(s, r), d = Math.min(a, o), c = s < r && a < r || s > o && a > o;
  return {
    count: n,
    start: l,
    loop: t.loop,
    ilen: d < l && !c ? n + d - l : d - l
  };
}
function x2(i, t, e, n) {
  const { points: s, options: a } = t, { count: r, start: o, loop: l, ilen: d } = G0(s, e, n), c = b2(a);
  let { move: h = !0, reverse: _ } = n || {}, f, g, u;
  for (f = 0; f <= d; ++f)
    g = s[(o + (_ ? d - f : f)) % r], !g.skip && (h ? (i.moveTo(g.x, g.y), h = !1) : c(i, u, g, _, a.stepped), u = g);
  return l && (g = s[(o + (_ ? d : 0)) % r], c(i, u, g, _, a.stepped)), !!l;
}
function k2(i, t, e, n) {
  const s = t.points, { count: a, start: r, ilen: o } = G0(s, e, n), { move: l = !0, reverse: d } = n || {};
  let c = 0, h = 0, _, f, g, u, p, m;
  const w = (b) => (r + (d ? o - b : b)) % a, y = () => {
    u !== p && (i.lineTo(c, p), i.lineTo(c, u), i.lineTo(c, m));
  };
  for (l && (f = s[w(0)], i.moveTo(f.x, f.y)), _ = 0; _ <= o; ++_) {
    if (f = s[w(_)], f.skip)
      continue;
    const b = f.x, v = f.y, k = b | 0;
    k === g ? (v < u ? u = v : v > p && (p = v), c = (h * c + b) / ++h) : (y(), i.lineTo(b, v), g = k, h = 0, u = p = v), m = v;
  }
  y();
}
function Ii(i) {
  const t = i.options, e = t.borderDash && t.borderDash.length;
  return !i._decimated && !i._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !e ? k2 : x2;
}
function M2(i) {
  return i.stepped ? yr : i.tension || i.cubicInterpolationMode === "monotone" ? br : qt;
}
function C2(i, t, e, n) {
  let s = t._path;
  s || (s = t._path = new Path2D(), t.path(s, e, n) && s.closePath()), j0(i, t.options), i.stroke(s);
}
function S2(i, t, e, n) {
  const { segments: s, options: a } = t, r = Ii(t);
  for (const o of s)
    j0(i, a, o.style), i.beginPath(), r(i, t, o, {
      start: e,
      end: e + n - 1
    }) && i.closePath(), i.stroke();
}
const P2 = typeof Path2D == "function";
function z2(i, t, e, n) {
  P2 && !t.options.segment ? C2(i, t, e, n) : S2(i, t, e, n);
}
class mi extends Mt {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: !0,
    cubicInterpolationMode: "default",
    fill: !1,
    spanGaps: !1,
    stepped: !1,
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: !0,
    _indexable: (t) => t !== "borderDash" && t !== "fill"
  };
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const n = this.options;
    if ((n.tension || n.cubicInterpolationMode === "monotone") && !n.stepped && !this._pointsUpdated) {
      const s = n.spanGaps ? this._loop : this._fullLoop;
      _r(this._points, n, t, s, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = Pr(this, this.options.segment));
  }
  first() {
    const t = this.segments, e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments, e = this.points, n = t.length;
    return n && e[t[n - 1].end];
  }
  interpolate(t, e) {
    const n = this.options, s = t[e], a = this.points, r = q0(this, {
      property: e,
      start: s,
      end: s
    });
    if (!r.length)
      return;
    const o = [], l = M2(n);
    let d, c;
    for (d = 0, c = r.length; d < c; ++d) {
      const { start: h, end: _ } = r[d], f = a[h], g = a[_];
      if (f === g) {
        o.push(f);
        continue;
      }
      const u = Math.abs((s - f[e]) / (g[e] - f[e])), p = l(f, g, u, n.stepped);
      p[e] = t[e], o.push(p);
    }
    return o.length === 1 ? o[0] : o;
  }
  pathSegment(t, e, n) {
    return Ii(this)(t, this, e, n);
  }
  path(t, e, n) {
    const s = this.segments, a = Ii(this);
    let r = this._loop;
    e = e || 0, n = n || this.points.length - e;
    for (const o of s)
      r &= a(t, this, o, {
        start: e,
        end: e + n - 1
      });
    return !!r;
  }
  draw(t, e, n, s) {
    const a = this.options || {};
    (this.points || []).length && a.borderWidth && (t.save(), z2(t, this, n, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
function Pn(i, t, e, n) {
  const s = i.options, { [e]: a } = i.getProps([
    e
  ], n);
  return Math.abs(t - a) < s.radius + s.hitRadius;
}
class Y0 extends Mt {
  static id = "point";
  parsed;
  skip;
  stop;
  /**
  * @type {any}
  */
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0
  };
  /**
  * @type {any}
  */
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(t) {
    super(), this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, t && Object.assign(this, t);
  }
  inRange(t, e, n) {
    const s = this.options, { x: a, y: r } = this.getProps([
      "x",
      "y"
    ], n);
    return Math.pow(t - a, 2) + Math.pow(e - r, 2) < Math.pow(s.hitRadius + s.radius, 2);
  }
  inXRange(t, e) {
    return Pn(this, t, "x", e);
  }
  inYRange(t, e) {
    return Pn(this, t, "y", e);
  }
  getCenterPoint(t) {
    const { x: e, y: n } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: e,
      y: n
    };
  }
  size(t) {
    t = t || this.options || {};
    let e = t.radius || 0;
    e = Math.max(e, e && t.hoverRadius || 0);
    const n = e && t.borderWidth || 0;
    return (e + n) * 2;
  }
  draw(t, e) {
    const n = this.options;
    this.skip || n.radius < 0.1 || !ze(this, e, this.size(n) / 2) || (t.strokeStyle = n.borderColor, t.lineWidth = n.borderWidth, t.fillStyle = n.backgroundColor, $i(t, n, this.x, this.y));
  }
  getRange() {
    const t = this.options || {};
    return t.radius + t.hitRadius;
  }
}
function X0(i, t) {
  const { x: e, y: n, base: s, width: a, height: r } = i.getProps([
    "x",
    "y",
    "base",
    "width",
    "height"
  ], t);
  let o, l, d, c, h;
  return i.horizontal ? (h = r / 2, o = Math.min(e, s), l = Math.max(e, s), d = n - h, c = n + h) : (h = a / 2, o = e - h, l = e + h, d = Math.min(n, s), c = Math.max(n, s)), {
    left: o,
    top: d,
    right: l,
    bottom: c
  };
}
function bt(i, t, e, n) {
  return i ? 0 : G(t, e, n);
}
function T2(i, t, e) {
  const n = i.options.borderWidth, s = i.borderSkipped, a = x0(n);
  return {
    t: bt(s.top, a.top, 0, e),
    r: bt(s.right, a.right, 0, t),
    b: bt(s.bottom, a.bottom, 0, e),
    l: bt(s.left, a.left, 0, t)
  };
}
function L2(i, t, e) {
  const { enableBorderRadius: n } = i.getProps([
    "enableBorderRadius"
  ]), s = i.options.borderRadius, a = Yt(s), r = Math.min(t, e), o = i.borderSkipped, l = n || T(s);
  return {
    topLeft: bt(!l || o.top || o.left, a.topLeft, 0, r),
    topRight: bt(!l || o.top || o.right, a.topRight, 0, r),
    bottomLeft: bt(!l || o.bottom || o.left, a.bottomLeft, 0, r),
    bottomRight: bt(!l || o.bottom || o.right, a.bottomRight, 0, r)
  };
}
function A2(i) {
  const t = X0(i), e = t.right - t.left, n = t.bottom - t.top, s = T2(i, e / 2, n / 2), a = L2(i, e / 2, n / 2);
  return {
    outer: {
      x: t.left,
      y: t.top,
      w: e,
      h: n,
      radius: a
    },
    inner: {
      x: t.left + s.l,
      y: t.top + s.t,
      w: e - s.l - s.r,
      h: n - s.t - s.b,
      radius: {
        topLeft: Math.max(0, a.topLeft - Math.max(s.t, s.l)),
        topRight: Math.max(0, a.topRight - Math.max(s.t, s.r)),
        bottomLeft: Math.max(0, a.bottomLeft - Math.max(s.b, s.l)),
        bottomRight: Math.max(0, a.bottomRight - Math.max(s.b, s.r))
      }
    }
  };
}
function Ai(i, t, e, n) {
  const s = t === null, a = e === null, o = i && !(s && a) && X0(i, n);
  return o && (s || gt(t, o.left, o.right)) && (a || gt(e, o.top, o.bottom));
}
function q2(i) {
  return i.topLeft || i.topRight || i.bottomLeft || i.bottomRight;
}
function H2(i, t) {
  i.rect(t.x, t.y, t.w, t.h);
}
function qi(i, t, e = {}) {
  const n = i.x !== e.x ? -t : 0, s = i.y !== e.y ? -t : 0, a = (i.x + i.w !== e.x + e.w ? t : 0) - n, r = (i.y + i.h !== e.y + e.h ? t : 0) - s;
  return {
    x: i.x + n,
    y: i.y + s,
    w: i.w + a,
    h: i.h + r,
    radius: i.radius
  };
}
class K0 extends Mt {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: void 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(t) {
    super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t);
  }
  draw(t) {
    const { inflateAmount: e, options: { borderColor: n, backgroundColor: s } } = this, { inner: a, outer: r } = A2(this), o = q2(r.radius) ? ri : H2;
    t.save(), (r.w !== a.w || r.h !== a.h) && (t.beginPath(), o(t, qi(r, e, a)), t.clip(), o(t, qi(a, -e, r)), t.fillStyle = n, t.fill("evenodd")), t.beginPath(), o(t, qi(a, e)), t.fillStyle = s, t.fill(), t.restore();
  }
  inRange(t, e, n) {
    return Ai(this, t, e, n);
  }
  inXRange(t, e) {
    return Ai(this, t, null, e);
  }
  inYRange(t, e) {
    return Ai(this, null, t, e);
  }
  getCenterPoint(t) {
    const { x: e, y: n, base: s, horizontal: a } = this.getProps([
      "x",
      "y",
      "base",
      "horizontal"
    ], t);
    return {
      x: a ? (e + s) / 2 : e,
      y: a ? n : (n + s) / 2
    };
  }
  getRange(t) {
    return t === "x" ? this.width / 2 : this.height / 2;
  }
}
function N2(i, t, e) {
  const n = i.segments, s = i.points, a = t.points, r = [];
  for (const o of n) {
    let { start: l, end: d } = o;
    d = wi(l, d, s);
    const c = Ui(e, s[l], s[d], o.loop);
    if (!t.segments) {
      r.push({
        source: o,
        target: c,
        start: s[l],
        end: s[d]
      });
      continue;
    }
    const h = q0(t, c);
    for (const _ of h) {
      const f = Ui(e, a[_.start], a[_.end], _.loop), g = A0(o, s, f);
      for (const u of g)
        r.push({
          source: u,
          target: _,
          start: {
            [e]: zn(c, f, "start", Math.max)
          },
          end: {
            [e]: zn(c, f, "end", Math.min)
          }
        });
    }
  }
  return r;
}
function Ui(i, t, e, n) {
  if (n)
    return;
  let s = t[i], a = e[i];
  return i === "angle" && (s = et(s), a = et(a)), {
    property: i,
    start: s,
    end: a
  };
}
function B2(i, t) {
  const { x: e = null, y: n = null } = i || {}, s = t.points, a = [];
  return t.segments.forEach(({ start: r, end: o }) => {
    o = wi(r, o, s);
    const l = s[r], d = s[o];
    n !== null ? (a.push({
      x: l.x,
      y: n
    }), a.push({
      x: d.x,
      y: n
    })) : e !== null && (a.push({
      x: e,
      y: l.y
    }), a.push({
      x: e,
      y: d.y
    }));
  }), a;
}
function wi(i, t, e) {
  for (; t > i; t--) {
    const n = e[t];
    if (!isNaN(n.x) && !isNaN(n.y))
      break;
  }
  return t;
}
function zn(i, t, e, n) {
  return i && t ? n(i[e], t[e]) : i ? i[e] : t ? t[e] : 0;
}
function Z0(i, t) {
  let e = [], n = !1;
  return W(i) ? (n = !0, e = i) : e = B2(i, t), e.length ? new mi({
    points: e,
    options: {
      tension: 0
    },
    _loop: n,
    _fullLoop: n
  }) : null;
}
function Tn(i) {
  return i && i.fill !== !1;
}
function O2(i, t, e) {
  let s = i[t].fill;
  const a = [
    t
  ];
  let r;
  if (!e)
    return s;
  for (; s !== !1 && a.indexOf(s) === -1; ) {
    if (!Y(s))
      return s;
    if (r = i[s], !r)
      return !1;
    if (r.visible)
      return s;
    a.push(s), s = r.fill;
  }
  return !1;
}
function D2(i, t, e) {
  const n = V2(i);
  if (T(n))
    return isNaN(n.value) ? !1 : n;
  let s = parseFloat(n);
  return Y(s) && Math.floor(s) === s ? R2(n[0], t, s, e) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(n) >= 0 && n;
}
function R2(i, t, e, n) {
  return (i === "-" || i === "+") && (e = t + e), e === t || e < 0 || e >= n ? !1 : e;
}
function E2(i, t) {
  let e = null;
  return i === "start" ? e = t.bottom : i === "end" ? e = t.top : T(i) ? e = t.getPixelForValue(i.value) : t.getBasePixel && (e = t.getBasePixel()), e;
}
function $2(i, t, e) {
  let n;
  return i === "start" ? n = e : i === "end" ? n = t.options.reverse ? t.min : t.max : T(i) ? n = i.value : n = t.getBaseValue(), n;
}
function V2(i) {
  const t = i.options, e = t.fill;
  let n = S(e && e.target, e);
  return n === void 0 && (n = !!t.backgroundColor), n === !1 || n === null ? !1 : n === !0 ? "origin" : n;
}
function W2(i) {
  const { scale: t, index: e, line: n } = i, s = [], a = n.segments, r = n.points, o = I2(t, e);
  o.push(Z0({
    x: null,
    y: t.bottom
  }, n));
  for (let l = 0; l < a.length; l++) {
    const d = a[l];
    for (let c = d.start; c <= d.end; c++)
      U2(s, r[c], o);
  }
  return new mi({
    points: s,
    options: {}
  });
}
function I2(i, t) {
  const e = [], n = i.getMatchingVisibleMetas("line");
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (a.index === t)
      break;
    a.hidden || e.unshift(a.dataset);
  }
  return e;
}
function U2(i, t, e) {
  const n = [];
  for (let s = 0; s < e.length; s++) {
    const a = e[s], { first: r, last: o, point: l } = F2(a, t, "x");
    if (!(!l || r && o)) {
      if (r)
        n.unshift(l);
      else if (i.push(l), !o)
        break;
    }
  }
  i.push(...n);
}
function F2(i, t, e) {
  const n = i.interpolate(t, e);
  if (!n)
    return {};
  const s = n[e], a = i.segments, r = i.points;
  let o = !1, l = !1;
  for (let d = 0; d < a.length; d++) {
    const c = a[d], h = r[c.start][e], _ = r[c.end][e];
    if (gt(s, h, _)) {
      o = s === h, l = s === _;
      break;
    }
  }
  return {
    first: o,
    last: l,
    point: n
  };
}
class J0 {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, n) {
    const { x: s, y: a, radius: r } = this;
    return e = e || {
      start: 0,
      end: I
    }, t.arc(s, a, r, e.end, e.start, !0), !n.bounds;
  }
  interpolate(t) {
    const { x: e, y: n, radius: s } = this, a = t.angle;
    return {
      x: e + Math.cos(a) * s,
      y: n + Math.sin(a) * s,
      angle: a
    };
  }
}
function j2(i) {
  const { chart: t, fill: e, line: n } = i;
  if (Y(e))
    return G2(t, e);
  if (e === "stack")
    return W2(i);
  if (e === "shape")
    return !0;
  const s = Y2(i);
  return s instanceof J0 ? s : Z0(s, n);
}
function G2(i, t) {
  const e = i.getDatasetMeta(t);
  return e && i.isDatasetVisible(t) ? e.dataset : null;
}
function Y2(i) {
  return (i.scale || {}).getPointPositionForValue ? K2(i) : X2(i);
}
function X2(i) {
  const { scale: t = {}, fill: e } = i, n = E2(e, t);
  if (Y(n)) {
    const s = t.isHorizontal();
    return {
      x: s ? n : null,
      y: s ? null : n
    };
  }
  return null;
}
function K2(i) {
  const { scale: t, fill: e } = i, n = t.options, s = t.getLabels().length, a = n.reverse ? t.max : t.min, r = $2(e, t, a), o = [];
  if (n.grid.circular) {
    const l = t.getPointPositionForValue(0, a);
    return new J0({
      x: l.x,
      y: l.y,
      radius: t.getDistanceFromCenterForValue(r)
    });
  }
  for (let l = 0; l < s; ++l)
    o.push(t.getPointPositionForValue(l, r));
  return o;
}
function Hi(i, t, e) {
  const n = j2(t), { chart: s, index: a, line: r, scale: o, axis: l } = t, d = r.options, c = d.fill, h = d.backgroundColor, { above: _ = h, below: f = h } = c || {}, g = s.getDatasetMeta(a), u = H0(s, g);
  n && r.points.length && (fi(i, e), Z2(i, {
    line: r,
    target: n,
    above: _,
    below: f,
    area: e,
    scale: o,
    axis: l,
    clip: u
  }), ui(i));
}
function Z2(i, t) {
  const { line: e, target: n, above: s, below: a, area: r, scale: o, clip: l } = t, d = e._loop ? "angle" : t.axis;
  i.save();
  let c = a;
  a !== s && (d === "x" ? (Ln(i, n, r.top), Ni(i, {
    line: e,
    target: n,
    color: s,
    scale: o,
    property: d,
    clip: l
  }), i.restore(), i.save(), Ln(i, n, r.bottom)) : d === "y" && (An(i, n, r.left), Ni(i, {
    line: e,
    target: n,
    color: a,
    scale: o,
    property: d,
    clip: l
  }), i.restore(), i.save(), An(i, n, r.right), c = s)), Ni(i, {
    line: e,
    target: n,
    color: c,
    scale: o,
    property: d,
    clip: l
  }), i.restore();
}
function Ln(i, t, e) {
  const { segments: n, points: s } = t;
  let a = !0, r = !1;
  i.beginPath();
  for (const o of n) {
    const { start: l, end: d } = o, c = s[l], h = s[wi(l, d, s)];
    a ? (i.moveTo(c.x, c.y), a = !1) : (i.lineTo(c.x, e), i.lineTo(c.x, c.y)), r = !!t.pathSegment(i, o, {
      move: r
    }), r ? i.closePath() : i.lineTo(h.x, e);
  }
  i.lineTo(t.first().x, e), i.closePath(), i.clip();
}
function An(i, t, e) {
  const { segments: n, points: s } = t;
  let a = !0, r = !1;
  i.beginPath();
  for (const o of n) {
    const { start: l, end: d } = o, c = s[l], h = s[wi(l, d, s)];
    a ? (i.moveTo(c.x, c.y), a = !1) : (i.lineTo(e, c.y), i.lineTo(c.x, c.y)), r = !!t.pathSegment(i, o, {
      move: r
    }), r ? i.closePath() : i.lineTo(e, h.y);
  }
  i.lineTo(e, t.first().y), i.closePath(), i.clip();
}
function Ni(i, t) {
  const { line: e, target: n, property: s, color: a, scale: r, clip: o } = t, l = N2(e, n, s);
  for (const { source: d, target: c, start: h, end: _ } of l) {
    const { style: { backgroundColor: f = a } = {} } = d, g = n !== !0;
    i.save(), i.fillStyle = f, J2(i, r, o, g && Ui(s, h, _)), i.beginPath();
    const u = !!e.pathSegment(i, d);
    let p;
    if (g) {
      u ? i.closePath() : qn(i, n, _, s);
      const m = !!n.pathSegment(i, c, {
        move: u,
        reverse: !0
      });
      p = u && m, p || qn(i, n, h, s);
    }
    i.closePath(), i.fill(p ? "evenodd" : "nonzero"), i.restore();
  }
}
function J2(i, t, e, n) {
  const s = t.chart.chartArea, { property: a, start: r, end: o } = n || {};
  if (a === "x" || a === "y") {
    let l, d, c, h;
    a === "x" ? (l = r, d = s.top, c = o, h = s.bottom) : (l = s.left, d = r, c = s.right, h = o), i.beginPath(), e && (l = Math.max(l, e.left), c = Math.min(c, e.right), d = Math.max(d, e.top), h = Math.min(h, e.bottom)), i.rect(l, d, c - l, h - d), i.clip();
  }
}
function qn(i, t, e, n) {
  const s = t.interpolate(e, n);
  s && i.lineTo(s.x, s.y);
}
var Q2 = {
  id: "filler",
  afterDatasetsUpdate(i, t, e) {
    const n = (i.data.datasets || []).length, s = [];
    let a, r, o, l;
    for (r = 0; r < n; ++r)
      a = i.getDatasetMeta(r), o = a.dataset, l = null, o && o.options && o instanceof mi && (l = {
        visible: i.isDatasetVisible(r),
        index: r,
        fill: D2(o, r, n),
        chart: i,
        axis: a.controller.options.indexAxis,
        scale: a.vScale,
        line: o
      }), a.$filler = l, s.push(l);
    for (r = 0; r < n; ++r)
      l = s[r], !(!l || l.fill === !1) && (l.fill = O2(s, r, e.propagate));
  },
  beforeDraw(i, t, e) {
    const n = e.drawTime === "beforeDraw", s = i.getSortedVisibleDatasetMetas(), a = i.chartArea;
    for (let r = s.length - 1; r >= 0; --r) {
      const o = s[r].$filler;
      o && (o.line.updateControlPoints(a, o.axis), n && o.fill && Hi(i.ctx, o, a));
    }
  },
  beforeDatasetsDraw(i, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw")
      return;
    const n = i.getSortedVisibleDatasetMetas();
    for (let s = n.length - 1; s >= 0; --s) {
      const a = n[s].$filler;
      Tn(a) && Hi(i.ctx, a, i.chartArea);
    }
  },
  beforeDatasetDraw(i, t, e) {
    const n = t.meta.$filler;
    !Tn(n) || e.drawTime !== "beforeDatasetDraw" || Hi(i.ctx, n, i.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const Hn = (i, t) => {
  let { boxHeight: e = t, boxWidth: n = t } = i;
  return i.usePointStyle && (e = Math.min(e, t), n = i.pointStyleWidth || Math.min(n, t)), {
    boxWidth: n,
    boxHeight: e,
    itemHeight: Math.max(t, e)
  };
}, tl = (i, t) => i !== null && t !== null && i.datasetIndex === t.datasetIndex && i.index === t.index;
class Nn extends Mt {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e, n) {
    this.maxWidth = t, this.maxHeight = e, this._margins = n, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = B(t.generateLabels, [
      this.chart
    ], this) || [];
    t.filter && (e = e.filter((n) => t.filter(n, this.chart.data))), t.sort && (e = e.sort((n, s) => t.sort(n, s, this.chart.data))), this.options.reverse && e.reverse(), this.legendItems = e;
  }
  fit() {
    const { options: t, ctx: e } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const n = t.labels, s = X(n.font), a = s.size, r = this._computeTitleHeight(), { boxWidth: o, itemHeight: l } = Hn(n, a);
    let d, c;
    e.font = s.string, this.isHorizontal() ? (d = this.maxWidth, c = this._fitRows(r, a, o, l) + 10) : (c = this.maxHeight, d = this._fitCols(r, s, o, l) + 10), this.width = Math.min(d, t.maxWidth || this.maxWidth), this.height = Math.min(c, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, e, n, s) {
    const { ctx: a, maxWidth: r, options: { labels: { padding: o } } } = this, l = this.legendHitBoxes = [], d = this.lineWidths = [
      0
    ], c = s + o;
    let h = t;
    a.textAlign = "left", a.textBaseline = "middle";
    let _ = -1, f = -c;
    return this.legendItems.forEach((g, u) => {
      const p = n + e / 2 + a.measureText(g.text).width;
      (u === 0 || d[d.length - 1] + p + 2 * o > r) && (h += c, d[d.length - (u > 0 ? 0 : 1)] = 0, f += c, _++), l[u] = {
        left: 0,
        top: f,
        row: _,
        width: p,
        height: s
      }, d[d.length - 1] += p + o;
    }), h;
  }
  _fitCols(t, e, n, s) {
    const { ctx: a, maxHeight: r, options: { labels: { padding: o } } } = this, l = this.legendHitBoxes = [], d = this.columnSizes = [], c = r - t;
    let h = o, _ = 0, f = 0, g = 0, u = 0;
    return this.legendItems.forEach((p, m) => {
      const { itemWidth: w, itemHeight: y } = el(n, e, a, p, s);
      m > 0 && f + y + 2 * o > c && (h += _ + o, d.push({
        width: _,
        height: f
      }), g += _ + o, u++, _ = f = 0), l[m] = {
        left: g,
        top: f,
        col: u,
        width: w,
        height: y
      }, _ = Math.max(_, w), f += y + o;
    }), h += _, d.push({
      width: _,
      height: f
    }), h;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: n, labels: { padding: s }, rtl: a } } = this, r = Xt(a, this.left, this.width);
    if (this.isHorizontal()) {
      let o = 0, l = tt(n, this.left + s, this.right - this.lineWidths[o]);
      for (const d of e)
        o !== d.row && (o = d.row, l = tt(n, this.left + s, this.right - this.lineWidths[o])), d.top += this.top + t + s, d.left = r.leftForLtr(r.x(l), d.width), l += d.width + s;
    } else {
      let o = 0, l = tt(n, this.top + t + s, this.bottom - this.columnSizes[o].height);
      for (const d of e)
        d.col !== o && (o = d.col, l = tt(n, this.top + t + s, this.bottom - this.columnSizes[o].height)), d.top = l, d.left += this.left + s, d.left = r.leftForLtr(r.x(d.left), d.width), l += d.height + s;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      fi(t, this), this._draw(), ui(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: n, ctx: s } = this, { align: a, labels: r } = t, o = $.color, l = Xt(t.rtl, this.left, this.width), d = X(r.font), { padding: c } = r, h = d.size, _ = h / 2;
    let f;
    this.drawTitle(), s.textAlign = l.textAlign("left"), s.textBaseline = "middle", s.lineWidth = 0.5, s.font = d.string;
    const { boxWidth: g, boxHeight: u, itemHeight: p } = Hn(r, h), m = function(k, M, x) {
      if (isNaN(g) || g <= 0 || isNaN(u) || u < 0)
        return;
      s.save();
      const C = S(x.lineWidth, 1);
      if (s.fillStyle = S(x.fillStyle, o), s.lineCap = S(x.lineCap, "butt"), s.lineDashOffset = S(x.lineDashOffset, 0), s.lineJoin = S(x.lineJoin, "miter"), s.lineWidth = C, s.strokeStyle = S(x.strokeStyle, o), s.setLineDash(S(x.lineDash, [])), r.usePointStyle) {
        const z = {
          radius: u * Math.SQRT2 / 2,
          pointStyle: x.pointStyle,
          rotation: x.rotation,
          borderWidth: C
        }, P = l.xPlus(k, g / 2), A = M + _;
        b0(s, z, P, A, r.pointStyleWidth && g);
      } else {
        const z = M + Math.max((h - u) / 2, 0), P = l.leftForLtr(k, g), A = Yt(x.borderRadius);
        s.beginPath(), Object.values(A).some((U) => U !== 0) ? ri(s, {
          x: P,
          y: z,
          w: g,
          h: u,
          radius: A
        }) : s.rect(P, z, g, u), s.fill(), C !== 0 && s.stroke();
      }
      s.restore();
    }, w = function(k, M, x) {
      ai(s, x.text, k, M + p / 2, d, {
        strikethrough: x.hidden,
        textAlign: l.textAlign(x.textAlign)
      });
    }, y = this.isHorizontal(), b = this._computeTitleHeight();
    y ? f = {
      x: tt(a, this.left + c, this.right - n[0]),
      y: this.top + c + b,
      line: 0
    } : f = {
      x: this.left + c,
      y: tt(a, this.top + b + c, this.bottom - e[0].height),
      line: 0
    }, z0(this.ctx, t.textDirection);
    const v = p + c;
    this.legendItems.forEach((k, M) => {
      s.strokeStyle = k.fontColor, s.fillStyle = k.fontColor;
      const x = s.measureText(k.text).width, C = l.textAlign(k.textAlign || (k.textAlign = r.textAlign)), z = g + _ + x;
      let P = f.x, A = f.y;
      l.setWidth(this.width), y ? M > 0 && P + z + c > this.right && (A = f.y += v, f.line++, P = f.x = tt(a, this.left + c, this.right - n[f.line])) : M > 0 && A + v > this.bottom && (P = f.x = P + e[f.line].width + c, f.line++, A = f.y = tt(a, this.top + b + c, this.bottom - e[f.line].height));
      const U = l.x(P);
      if (m(U, A, k), P = za(C, P + g + _, y ? P + z : this.right, t.rtl), w(l.x(P), A, k), y)
        f.x += z + c;
      else if (typeof k.text != "string") {
        const Q = d.lineHeight;
        f.y += Q0(k, Q) + c;
      } else
        f.y += v;
    }), T0(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, e = t.title, n = X(e.font), s = nt(e.padding);
    if (!e.display)
      return;
    const a = Xt(t.rtl, this.left, this.width), r = this.ctx, o = e.position, l = n.size / 2, d = s.top + l;
    let c, h = this.left, _ = this.width;
    if (this.isHorizontal())
      _ = Math.max(...this.lineWidths), c = this.top + d, h = tt(t.align, h, this.right - _);
    else {
      const g = this.columnSizes.reduce((u, p) => Math.max(u, p.height), 0);
      c = d + tt(t.align, this.top, this.bottom - g - t.labels.padding - this._computeTitleHeight());
    }
    const f = tt(o, h, h + _);
    r.textAlign = a.textAlign(w0(o)), r.textBaseline = "middle", r.strokeStyle = e.color, r.fillStyle = e.color, r.font = n.string, ai(r, e.text, f, c, n);
  }
  _computeTitleHeight() {
    const t = this.options.title, e = X(t.font), n = nt(t.padding);
    return t.display ? e.lineHeight + n.height : 0;
  }
  _getLegendItemAt(t, e) {
    let n, s, a;
    if (gt(t, this.left, this.right) && gt(e, this.top, this.bottom)) {
      for (a = this.legendHitBoxes, n = 0; n < a.length; ++n)
        if (s = a[n], gt(t, s.left, s.left + s.width) && gt(e, s.top, s.top + s.height))
          return this.legendItems[n];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!sl(t.type, e))
      return;
    const n = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const s = this._hoveredItem, a = tl(s, n);
      s && !a && B(e.onLeave, [
        t,
        s,
        this
      ], this), this._hoveredItem = n, n && !a && B(e.onHover, [
        t,
        n,
        this
      ], this);
    } else n && B(e.onClick, [
      t,
      n,
      this
    ], this);
  }
}
function el(i, t, e, n, s) {
  const a = il(n, i, t, e), r = nl(s, n, t.lineHeight);
  return {
    itemWidth: a,
    itemHeight: r
  };
}
function il(i, t, e, n) {
  let s = i.text;
  return s && typeof s != "string" && (s = s.reduce((a, r) => a.length > r.length ? a : r)), t + e.size / 2 + n.measureText(s).width;
}
function nl(i, t, e) {
  let n = i;
  return typeof t.text != "string" && (n = Q0(t, e)), n;
}
function Q0(i, t) {
  const e = i.text ? i.text.length : 0;
  return t * e;
}
function sl(i, t) {
  return !!((i === "mousemove" || i === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (i === "click" || i === "mouseup"));
}
var al = {
  id: "legend",
  _element: Nn,
  start(i, t, e) {
    const n = i.legend = new Nn({
      ctx: i.ctx,
      options: e,
      chart: i
    });
    yt.configure(i, n, e), yt.addBox(i, n);
  },
  stop(i) {
    yt.removeBox(i, i.legend), delete i.legend;
  },
  beforeUpdate(i, t, e) {
    const n = i.legend;
    yt.configure(i, n, e), n.options = e;
  },
  afterUpdate(i) {
    const t = i.legend;
    t.buildLabels(), t.adjustHitBoxes();
  },
  afterEvent(i, t) {
    t.replay || i.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(i, t, e) {
      const n = t.datasetIndex, s = e.chart;
      s.isDatasetVisible(n) ? (s.hide(n), t.hidden = !0) : (s.show(n), t.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (i) => i.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(i) {
        const t = i.data.datasets, { labels: { usePointStyle: e, pointStyle: n, textAlign: s, color: a, useBorderRadius: r, borderRadius: o } } = i.legend.options;
        return i._getSortedDatasetMetas().map((l) => {
          const d = l.controller.getStyle(e ? 0 : void 0), c = nt(d.borderWidth);
          return {
            text: t[l.index].label,
            fillStyle: d.backgroundColor,
            fontColor: a,
            hidden: !l.visible,
            lineCap: d.borderCapStyle,
            lineDash: d.borderDash,
            lineDashOffset: d.borderDashOffset,
            lineJoin: d.borderJoinStyle,
            lineWidth: (c.width + c.height) / 4,
            strokeStyle: d.borderColor,
            pointStyle: n || d.pointStyle,
            rotation: d.rotation,
            textAlign: s || d.textAlign,
            borderRadius: r && (o || d.borderRadius),
            datasetIndex: l.index
          };
        }, this);
      }
    },
    title: {
      color: (i) => i.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (i) => !i.startsWith("on"),
    labels: {
      _scriptable: (i) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(i)
    }
  }
};
const ue = {
  average(i) {
    if (!i.length)
      return !1;
    let t, e, n = /* @__PURE__ */ new Set(), s = 0, a = 0;
    for (t = 0, e = i.length; t < e; ++t) {
      const o = i[t].element;
      if (o && o.hasValue()) {
        const l = o.tooltipPosition();
        n.add(l.x), s += l.y, ++a;
      }
    }
    return a === 0 || n.size === 0 ? !1 : {
      x: [
        ...n
      ].reduce((o, l) => o + l) / n.size,
      y: s / a
    };
  },
  nearest(i, t) {
    if (!i.length)
      return !1;
    let e = t.x, n = t.y, s = Number.POSITIVE_INFINITY, a, r, o;
    for (a = 0, r = i.length; a < r; ++a) {
      const l = i[a].element;
      if (l && l.hasValue()) {
        const d = l.getCenterPoint(), c = Ri(t, d);
        c < s && (s = c, o = l);
      }
    }
    if (o) {
      const l = o.tooltipPosition();
      e = l.x, n = l.y;
    }
    return {
      x: e,
      y: n
    };
  }
};
function rt(i, t) {
  return t && (W(t) ? Array.prototype.push.apply(i, t) : i.push(t)), i;
}
function _t(i) {
  return (typeof i == "string" || i instanceof String) && i.indexOf(`
`) > -1 ? i.split(`
`) : i;
}
function rl(i, t) {
  const { element: e, datasetIndex: n, index: s } = t, a = i.getDatasetMeta(n).controller, { label: r, value: o } = a.getLabelAndValue(s);
  return {
    chart: i,
    label: r,
    parsed: a.getParsed(s),
    raw: i.data.datasets[n].data[s],
    formattedValue: o,
    dataset: a.getDataset(),
    dataIndex: s,
    datasetIndex: n,
    element: e
  };
}
function Bn(i, t) {
  const e = i.chart.ctx, { body: n, footer: s, title: a } = i, { boxWidth: r, boxHeight: o } = t, l = X(t.bodyFont), d = X(t.titleFont), c = X(t.footerFont), h = a.length, _ = s.length, f = n.length, g = nt(t.padding);
  let u = g.height, p = 0, m = n.reduce((b, v) => b + v.before.length + v.lines.length + v.after.length, 0);
  if (m += i.beforeBody.length + i.afterBody.length, h && (u += h * d.lineHeight + (h - 1) * t.titleSpacing + t.titleMarginBottom), m) {
    const b = t.displayColors ? Math.max(o, l.lineHeight) : l.lineHeight;
    u += f * b + (m - f) * l.lineHeight + (m - 1) * t.bodySpacing;
  }
  _ && (u += t.footerMarginTop + _ * c.lineHeight + (_ - 1) * t.footerSpacing);
  let w = 0;
  const y = function(b) {
    p = Math.max(p, e.measureText(b).width + w);
  };
  return e.save(), e.font = d.string, H(i.title, y), e.font = l.string, H(i.beforeBody.concat(i.afterBody), y), w = t.displayColors ? r + 2 + t.boxPadding : 0, H(n, (b) => {
    H(b.before, y), H(b.lines, y), H(b.after, y);
  }), w = 0, e.font = c.string, H(i.footer, y), e.restore(), p += g.width, {
    width: p,
    height: u
  };
}
function ol(i, t) {
  const { y: e, height: n } = t;
  return e < n / 2 ? "top" : e > i.height - n / 2 ? "bottom" : "center";
}
function ll(i, t, e, n) {
  const { x: s, width: a } = n, r = e.caretSize + e.caretPadding;
  if (i === "left" && s + a + r > t.width || i === "right" && s - a - r < 0)
    return !0;
}
function dl(i, t, e, n) {
  const { x: s, width: a } = e, { width: r, chartArea: { left: o, right: l } } = i;
  let d = "center";
  return n === "center" ? d = s <= (o + l) / 2 ? "left" : "right" : s <= a / 2 ? d = "left" : s >= r - a / 2 && (d = "right"), ll(d, i, t, e) && (d = "center"), d;
}
function On(i, t, e) {
  const n = e.yAlign || t.yAlign || ol(i, e);
  return {
    xAlign: e.xAlign || t.xAlign || dl(i, t, e, n),
    yAlign: n
  };
}
function cl(i, t) {
  let { x: e, width: n } = i;
  return t === "right" ? e -= n : t === "center" && (e -= n / 2), e;
}
function hl(i, t, e) {
  let { y: n, height: s } = i;
  return t === "top" ? n += e : t === "bottom" ? n -= s + e : n -= s / 2, n;
}
function Dn(i, t, e, n) {
  const { caretSize: s, caretPadding: a, cornerRadius: r } = i, { xAlign: o, yAlign: l } = e, d = s + a, { topLeft: c, topRight: h, bottomLeft: _, bottomRight: f } = Yt(r);
  let g = cl(t, o);
  const u = hl(t, l, d);
  return l === "center" ? o === "left" ? g += d : o === "right" && (g -= d) : o === "left" ? g -= Math.max(c, _) + s : o === "right" && (g += Math.max(h, f) + s), {
    x: G(g, 0, n.width - t.width),
    y: G(u, 0, n.height - t.height)
  };
}
function Ue(i, t, e) {
  const n = nt(e.padding);
  return t === "center" ? i.x + i.width / 2 : t === "right" ? i.x + i.width - n.right : i.x + n.left;
}
function Rn(i) {
  return rt([], _t(i));
}
function _l(i, t, e) {
  return Vt(i, {
    tooltip: t,
    tooltipItems: e,
    type: "tooltip"
  });
}
function En(i, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? i.override(e) : i;
}
const ts = {
  beforeTitle: ct,
  title(i) {
    if (i.length > 0) {
      const t = i[0], e = t.chart.data.labels, n = e ? e.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label)
        return t.label;
      if (n > 0 && t.dataIndex < n)
        return e[t.dataIndex];
    }
    return "";
  },
  afterTitle: ct,
  beforeBody: ct,
  beforeLabel: ct,
  label(i) {
    if (this && this.options && this.options.mode === "dataset")
      return i.label + ": " + i.formattedValue || i.formattedValue;
    let t = i.dataset.label || "";
    t && (t += ": ");
    const e = i.formattedValue;
    return L(e) || (t += e), t;
  },
  labelColor(i) {
    const e = i.chart.getDatasetMeta(i.datasetIndex).controller.getStyle(i.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(i) {
    const e = i.chart.getDatasetMeta(i.datasetIndex).controller.getStyle(i.dataIndex);
    return {
      pointStyle: e.pointStyle,
      rotation: e.rotation
    };
  },
  afterLabel: ct,
  afterBody: ct,
  beforeFooter: ct,
  footer: ct,
  afterFooter: ct
};
function K(i, t, e, n) {
  const s = i[t].call(e, n);
  return typeof s > "u" ? ts[t].call(e, n) : s;
}
class $n extends Mt {
  static positioners = ue;
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t)
      return t;
    const e = this.chart, n = this.options.setContext(this.getContext()), s = n.enabled && e.options.animation && n.animations, a = new N0(this.chart, s);
    return s._cacheable && (this._cachedAnimations = Object.freeze(a)), a;
  }
  getContext() {
    return this.$context || (this.$context = _l(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const { callbacks: n } = e, s = K(n, "beforeTitle", this, t), a = K(n, "title", this, t), r = K(n, "afterTitle", this, t);
    let o = [];
    return o = rt(o, _t(s)), o = rt(o, _t(a)), o = rt(o, _t(r)), o;
  }
  getBeforeBody(t, e) {
    return Rn(K(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: n } = e, s = [];
    return H(t, (a) => {
      const r = {
        before: [],
        lines: [],
        after: []
      }, o = En(n, a);
      rt(r.before, _t(K(o, "beforeLabel", this, a))), rt(r.lines, K(o, "label", this, a)), rt(r.after, _t(K(o, "afterLabel", this, a))), s.push(r);
    }), s;
  }
  getAfterBody(t, e) {
    return Rn(K(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: n } = e, s = K(n, "beforeFooter", this, t), a = K(n, "footer", this, t), r = K(n, "afterFooter", this, t);
    let o = [];
    return o = rt(o, _t(s)), o = rt(o, _t(a)), o = rt(o, _t(r)), o;
  }
  _createItems(t) {
    const e = this._active, n = this.chart.data, s = [], a = [], r = [];
    let o = [], l, d;
    for (l = 0, d = e.length; l < d; ++l)
      o.push(rl(this.chart, e[l]));
    return t.filter && (o = o.filter((c, h, _) => t.filter(c, h, _, n))), t.itemSort && (o = o.sort((c, h) => t.itemSort(c, h, n))), H(o, (c) => {
      const h = En(t.callbacks, c);
      s.push(K(h, "labelColor", this, c)), a.push(K(h, "labelPointStyle", this, c)), r.push(K(h, "labelTextColor", this, c));
    }), this.labelColors = s, this.labelPointStyles = a, this.labelTextColors = r, this.dataPoints = o, o;
  }
  update(t, e) {
    const n = this.options.setContext(this.getContext()), s = this._active;
    let a, r = [];
    if (!s.length)
      this.opacity !== 0 && (a = {
        opacity: 0
      });
    else {
      const o = ue[n.position].call(this, s, this._eventPosition);
      r = this._createItems(n), this.title = this.getTitle(r, n), this.beforeBody = this.getBeforeBody(r, n), this.body = this.getBody(r, n), this.afterBody = this.getAfterBody(r, n), this.footer = this.getFooter(r, n);
      const l = this._size = Bn(this, n), d = Object.assign({}, o, l), c = On(this.chart, n, d), h = Dn(n, d, c, this.chart);
      this.xAlign = c.xAlign, this.yAlign = c.yAlign, a = {
        opacity: 1,
        x: h.x,
        y: h.y,
        width: l.width,
        height: l.height,
        caretX: o.x,
        caretY: o.y
      };
    }
    this._tooltipItems = r, this.$context = void 0, a && this._resolveAnimations().update(this, a), t && n.external && n.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: e
    });
  }
  drawCaret(t, e, n, s) {
    const a = this.getCaretPosition(t, n, s);
    e.lineTo(a.x1, a.y1), e.lineTo(a.x2, a.y2), e.lineTo(a.x3, a.y3);
  }
  getCaretPosition(t, e, n) {
    const { xAlign: s, yAlign: a } = this, { caretSize: r, cornerRadius: o } = n, { topLeft: l, topRight: d, bottomLeft: c, bottomRight: h } = Yt(o), { x: _, y: f } = t, { width: g, height: u } = e;
    let p, m, w, y, b, v;
    return a === "center" ? (b = f + u / 2, s === "left" ? (p = _, m = p - r, y = b + r, v = b - r) : (p = _ + g, m = p + r, y = b - r, v = b + r), w = p) : (s === "left" ? m = _ + Math.max(l, c) + r : s === "right" ? m = _ + g - Math.max(d, h) - r : m = this.caretX, a === "top" ? (y = f, b = y - r, p = m - r, w = m + r) : (y = f + u, b = y + r, p = m + r, w = m - r), v = y), {
      x1: p,
      x2: m,
      x3: w,
      y1: y,
      y2: b,
      y3: v
    };
  }
  drawTitle(t, e, n) {
    const s = this.title, a = s.length;
    let r, o, l;
    if (a) {
      const d = Xt(n.rtl, this.x, this.width);
      for (t.x = Ue(this, n.titleAlign, n), e.textAlign = d.textAlign(n.titleAlign), e.textBaseline = "middle", r = X(n.titleFont), o = n.titleSpacing, e.fillStyle = n.titleColor, e.font = r.string, l = 0; l < a; ++l)
        e.fillText(s[l], d.x(t.x), t.y + r.lineHeight / 2), t.y += r.lineHeight + o, l + 1 === a && (t.y += n.titleMarginBottom - o);
    }
  }
  _drawColorBox(t, e, n, s, a) {
    const r = this.labelColors[n], o = this.labelPointStyles[n], { boxHeight: l, boxWidth: d } = a, c = X(a.bodyFont), h = Ue(this, "left", a), _ = s.x(h), f = l < c.lineHeight ? (c.lineHeight - l) / 2 : 0, g = e.y + f;
    if (a.usePointStyle) {
      const u = {
        radius: Math.min(d, l) / 2,
        pointStyle: o.pointStyle,
        rotation: o.rotation,
        borderWidth: 1
      }, p = s.leftForLtr(_, d) + d / 2, m = g + l / 2;
      t.strokeStyle = a.multiKeyBackground, t.fillStyle = a.multiKeyBackground, $i(t, u, p, m), t.strokeStyle = r.borderColor, t.fillStyle = r.backgroundColor, $i(t, u, p, m);
    } else {
      t.lineWidth = T(r.borderWidth) ? Math.max(...Object.values(r.borderWidth)) : r.borderWidth || 1, t.strokeStyle = r.borderColor, t.setLineDash(r.borderDash || []), t.lineDashOffset = r.borderDashOffset || 0;
      const u = s.leftForLtr(_, d), p = s.leftForLtr(s.xPlus(_, 1), d - 2), m = Yt(r.borderRadius);
      Object.values(m).some((w) => w !== 0) ? (t.beginPath(), t.fillStyle = a.multiKeyBackground, ri(t, {
        x: u,
        y: g,
        w: d,
        h: l,
        radius: m
      }), t.fill(), t.stroke(), t.fillStyle = r.backgroundColor, t.beginPath(), ri(t, {
        x: p,
        y: g + 1,
        w: d - 2,
        h: l - 2,
        radius: m
      }), t.fill()) : (t.fillStyle = a.multiKeyBackground, t.fillRect(u, g, d, l), t.strokeRect(u, g, d, l), t.fillStyle = r.backgroundColor, t.fillRect(p, g + 1, d - 2, l - 2));
    }
    t.fillStyle = this.labelTextColors[n];
  }
  drawBody(t, e, n) {
    const { body: s } = this, { bodySpacing: a, bodyAlign: r, displayColors: o, boxHeight: l, boxWidth: d, boxPadding: c } = n, h = X(n.bodyFont);
    let _ = h.lineHeight, f = 0;
    const g = Xt(n.rtl, this.x, this.width), u = function(x) {
      e.fillText(x, g.x(t.x + f), t.y + _ / 2), t.y += _ + a;
    }, p = g.textAlign(r);
    let m, w, y, b, v, k, M;
    for (e.textAlign = r, e.textBaseline = "middle", e.font = h.string, t.x = Ue(this, p, n), e.fillStyle = n.bodyColor, H(this.beforeBody, u), f = o && p !== "right" ? r === "center" ? d / 2 + c : d + 2 + c : 0, b = 0, k = s.length; b < k; ++b) {
      for (m = s[b], w = this.labelTextColors[b], e.fillStyle = w, H(m.before, u), y = m.lines, o && y.length && (this._drawColorBox(e, t, b, g, n), _ = Math.max(h.lineHeight, l)), v = 0, M = y.length; v < M; ++v)
        u(y[v]), _ = h.lineHeight;
      H(m.after, u);
    }
    f = 0, _ = h.lineHeight, H(this.afterBody, u), t.y -= a;
  }
  drawFooter(t, e, n) {
    const s = this.footer, a = s.length;
    let r, o;
    if (a) {
      const l = Xt(n.rtl, this.x, this.width);
      for (t.x = Ue(this, n.footerAlign, n), t.y += n.footerMarginTop, e.textAlign = l.textAlign(n.footerAlign), e.textBaseline = "middle", r = X(n.footerFont), e.fillStyle = n.footerColor, e.font = r.string, o = 0; o < a; ++o)
        e.fillText(s[o], l.x(t.x), t.y + r.lineHeight / 2), t.y += r.lineHeight + n.footerSpacing;
    }
  }
  drawBackground(t, e, n, s) {
    const { xAlign: a, yAlign: r } = this, { x: o, y: l } = t, { width: d, height: c } = n, { topLeft: h, topRight: _, bottomLeft: f, bottomRight: g } = Yt(s.cornerRadius);
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(o + h, l), r === "top" && this.drawCaret(t, e, n, s), e.lineTo(o + d - _, l), e.quadraticCurveTo(o + d, l, o + d, l + _), r === "center" && a === "right" && this.drawCaret(t, e, n, s), e.lineTo(o + d, l + c - g), e.quadraticCurveTo(o + d, l + c, o + d - g, l + c), r === "bottom" && this.drawCaret(t, e, n, s), e.lineTo(o + f, l + c), e.quadraticCurveTo(o, l + c, o, l + c - f), r === "center" && a === "left" && this.drawCaret(t, e, n, s), e.lineTo(o, l + h), e.quadraticCurveTo(o, l, o + h, l), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart, n = this.$animations, s = n && n.x, a = n && n.y;
    if (s || a) {
      const r = ue[t.position].call(this, this._active, this._eventPosition);
      if (!r)
        return;
      const o = this._size = Bn(this, t), l = Object.assign({}, r, this._size), d = On(e, t, l), c = Dn(t, l, d, e);
      (s._to !== c.x || a._to !== c.y) && (this.xAlign = d.xAlign, this.yAlign = d.yAlign, this.width = o.width, this.height = o.height, this.caretX = r.x, this.caretY = r.y, this._resolveAnimations().update(this, c));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let n = this.opacity;
    if (!n)
      return;
    this._updateAnimationTarget(e);
    const s = {
      width: this.width,
      height: this.height
    }, a = {
      x: this.x,
      y: this.y
    };
    n = Math.abs(n) < 1e-3 ? 0 : n;
    const r = nt(e.padding), o = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && o && (t.save(), t.globalAlpha = n, this.drawBackground(a, t, s, e), z0(t, e.textDirection), a.y += r.top, this.drawTitle(a, t, e), this.drawBody(a, t, e), this.drawFooter(a, t, e), T0(t, e.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const n = this._active, s = t.map(({ datasetIndex: o, index: l }) => {
      const d = this.chart.getDatasetMeta(o);
      if (!d)
        throw new Error("Cannot find a dataset at index " + o);
      return {
        datasetIndex: o,
        element: d.data[l],
        index: l
      };
    }), a = !ii(n, s), r = this._positionChanged(s, e);
    (a || r) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, n = !0) {
    if (e && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const s = this.options, a = this._active || [], r = this._getActiveElements(t, a, e, n), o = this._positionChanged(r, t), l = e || !ii(r, a) || o;
    return l && (this._active = r, (s.enabled || s.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, e))), l;
  }
  _getActiveElements(t, e, n, s) {
    const a = this.options;
    if (t.type === "mouseout")
      return [];
    if (!s)
      return e.filter((o) => this.chart.data.datasets[o.datasetIndex] && this.chart.getDatasetMeta(o.datasetIndex).controller.getParsed(o.index) !== void 0);
    const r = this.chart.getElementsAtEventForMode(t, a.mode, a, n);
    return a.reverse && r.reverse(), r;
  }
  _positionChanged(t, e) {
    const { caretX: n, caretY: s, options: a } = this, r = ue[a.position].call(this, t, e);
    return r !== !1 && (n !== r.x || s !== r.y);
  }
}
var fl = {
  id: "tooltip",
  _element: $n,
  positioners: ue,
  afterInit(i, t, e) {
    e && (i.tooltip = new $n({
      chart: i,
      options: e
    }));
  },
  beforeUpdate(i, t, e) {
    i.tooltip && i.tooltip.initialize(e);
  },
  reset(i, t, e) {
    i.tooltip && i.tooltip.initialize(e);
  },
  afterDraw(i) {
    const t = i.tooltip;
    if (t && t._willRender()) {
      const e = {
        tooltip: t
      };
      if (i.notifyPlugins("beforeTooltipDraw", {
        ...e,
        cancelable: !0
      }) === !1)
        return;
      t.draw(i.ctx), i.notifyPlugins("afterTooltipDraw", e);
    }
  },
  afterEvent(i, t) {
    if (i.tooltip) {
      const e = t.replay;
      i.tooltip.handleEvent(t.event, e, t.inChartArea) && (t.changed = !0);
    }
  },
  defaults: {
    enabled: !0,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (i, t) => t.bodyFont.size,
    boxWidth: (i, t) => t.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: !0,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: ts
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (i) => i !== "filter" && i !== "itemSort" && i !== "external",
    _indexable: !1,
    callbacks: {
      _scriptable: !1,
      _indexable: !1
    },
    animation: {
      _fallback: !1
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
};
const ul = (i, t, e, n) => (typeof t == "string" ? (e = i.push(t) - 1, n.unshift({
  index: e,
  label: t
})) : isNaN(t) && (e = null), e);
function gl(i, t, e, n) {
  const s = i.indexOf(t);
  if (s === -1)
    return ul(i, t, e, n);
  const a = i.lastIndexOf(t);
  return s !== a ? e : s;
}
const pl = (i, t) => i === null ? null : G(Math.round(i), 0, t);
function Vn(i) {
  const t = this.getLabels();
  return i >= 0 && i < t.length ? t[i] : i;
}
class ml extends ie {
  static id = "category";
  static defaults = {
    ticks: {
      callback: Vn
    }
  };
  constructor(t) {
    super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [];
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const n = this.getLabels();
      for (const { index: s, label: a } of e)
        n[s] === a && n.splice(s, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (L(t))
      return null;
    const n = this.getLabels();
    return e = isFinite(e) && n[e] === t ? e : gl(n, t, S(e, t), this._addedLabels), pl(e, n.length - 1);
  }
  determineDataLimits() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let { min: n, max: s } = this.getMinMax(!0);
    this.options.bounds === "ticks" && (t || (n = 0), e || (s = this.getLabels().length - 1)), this.min = n, this.max = s;
  }
  buildTicks() {
    const t = this.min, e = this.max, n = this.options.offset, s = [];
    let a = this.getLabels();
    a = t === 0 && e === a.length - 1 ? a : a.slice(t, e + 1), this._valueRange = Math.max(a.length - (n ? 0 : 1), 1), this._startValue = this.min - (n ? 0.5 : 0);
    for (let r = t; r <= e; r++)
      s.push({
        value: r
      });
    return s;
  }
  getLabelForValue(t) {
    return Vn.call(this, t);
  }
  configure() {
    super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels);
  }
  getPixelForValue(t) {
    return typeof t != "number" && (t = this.parse(t)), t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
function wl(i, t) {
  const e = [], { bounds: s, step: a, min: r, max: o, precision: l, count: d, maxTicks: c, maxDigits: h, includeBounds: _ } = i, f = a || 1, g = c - 1, { min: u, max: p } = t, m = !L(r), w = !L(o), y = !L(d), b = (p - u) / (h + 1);
  let v = O1((p - u) / g / f) * f, k, M, x, C;
  if (v < 1e-14 && !m && !w)
    return [
      {
        value: u
      },
      {
        value: p
      }
    ];
  C = Math.ceil(p / v) - Math.floor(u / v), C > g && (v = O1(C * v / g / f) * f), L(l) || (k = Math.pow(10, l), v = Math.ceil(v * k) / k), s === "ticks" ? (M = Math.floor(u / v) * v, x = Math.ceil(p / v) * v) : (M = u, x = p), m && w && a && va((o - r) / a, v / 1e3) ? (C = Math.round(Math.min((o - r) / v, c)), v = (o - r) / C, M = r, x = o) : y ? (M = m ? r : M, x = w ? o : x, C = d - 1, v = (x - M) / C) : (C = (x - M) / v, me(C, Math.round(C), v / 1e3) ? C = Math.round(C) : C = Math.ceil(C));
  const z = Math.max(D1(v), D1(M));
  k = Math.pow(10, L(l) ? z : l), M = Math.round(M * k) / k, x = Math.round(x * k) / k;
  let P = 0;
  for (m && (_ && M !== r ? (e.push({
    value: r
  }), M < r && P++, me(Math.round((M + P * v) * k) / k, r, Wn(r, b, i)) && P++) : M < r && P++); P < C; ++P) {
    const A = Math.round((M + P * v) * k) / k;
    if (w && A > o)
      break;
    e.push({
      value: A
    });
  }
  return w && _ && x !== o ? e.length && me(e[e.length - 1].value, o, Wn(o, b, i)) ? e[e.length - 1].value = o : e.push({
    value: o
  }) : (!w || x === o) && e.push({
    value: x
  }), e;
}
function Wn(i, t, { horizontal: e, minRotation: n }) {
  const s = Bt(n), a = (e ? Math.sin(s) : Math.cos(s)) || 1e-3, r = 0.75 * t * ("" + i).length;
  return Math.min(t / a, r);
}
class vl extends ie {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return L(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: n } = this.getUserBounds();
    let { min: s, max: a } = this;
    const r = (l) => s = e ? s : l, o = (l) => a = n ? a : l;
    if (t) {
      const l = lt(s), d = lt(a);
      l < 0 && d < 0 ? o(0) : l > 0 && d > 0 && r(0);
    }
    if (s === a) {
      let l = a === 0 ? 1 : Math.abs(a * 0.05);
      o(a + l), t || r(s - l);
    }
    this.min = s, this.max = a;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: e, stepSize: n } = t, s;
    return n ? (s = Math.ceil(this.max / n) - Math.floor(this.min / n) + 1, s > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${n} would result generating up to ${s} ticks. Limiting to 1000.`), s = 1e3)) : (s = this.computeTickLimit(), e = e || 11), e && (s = Math.min(e, s)), s;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options, e = t.ticks;
    let n = this.getTickLimit();
    n = Math.max(2, n);
    const s = {
      maxTicks: n,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: e.precision,
      step: e.stepSize,
      count: e.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: e.minRotation || 0,
      includeBounds: e.includeBounds !== !1
    }, a = this._range || this, r = wl(s, a);
    return t.bounds === "ticks" && ya(r, this, "value"), t.reverse ? (r.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), r;
  }
  configure() {
    const t = this.ticks;
    let e = this.min, n = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const s = (n - e) / Math.max(t.length - 1, 1) / 2;
      e -= s, n += s;
    }
    this._startValue = e, this._endValue = n, this._valueRange = n - e;
  }
  getLabelForValue(t) {
    return v0(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class yl extends vl {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: y0.formatters.numeric
    }
  };
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = Y(t) ? t : 0, this.max = Y(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), e = t ? this.width : this.height, n = Bt(this.options.ticks.minRotation), s = (t ? Math.sin(n) : Math.cos(n)) || 1e-3, a = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, a.lineHeight / s));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
const vi = {
  millisecond: {
    common: !0,
    size: 1,
    steps: 1e3
  },
  second: {
    common: !0,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: !0,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: !0,
    size: 36e5,
    steps: 24
  },
  day: {
    common: !0,
    size: 864e5,
    steps: 30
  },
  week: {
    common: !1,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: !0,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: !1,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: !0,
    size: 3154e7
  }
}, J = /* @__PURE__ */ Object.keys(vi);
function In(i, t) {
  return i - t;
}
function Un(i, t) {
  if (L(t))
    return null;
  const e = i._adapter, { parser: n, round: s, isoWeekday: a } = i._parseOpts;
  let r = t;
  return typeof n == "function" && (r = n(r)), Y(r) || (r = typeof n == "string" ? e.parse(r, n) : e.parse(r)), r === null ? null : (s && (r = s === "week" && (Pe(a) || a === !0) ? e.startOf(r, "isoWeek", a) : e.startOf(r, s)), +r);
}
function Fn(i, t, e, n) {
  const s = J.length;
  for (let a = J.indexOf(i); a < s - 1; ++a) {
    const r = vi[J[a]], o = r.steps ? r.steps : Number.MAX_SAFE_INTEGER;
    if (r.common && Math.ceil((e - t) / (o * r.size)) <= n)
      return J[a];
  }
  return J[s - 1];
}
function bl(i, t, e, n, s) {
  for (let a = J.length - 1; a >= J.indexOf(e); a--) {
    const r = J[a];
    if (vi[r].common && i._adapter.diff(s, n, r) >= t - 1)
      return r;
  }
  return J[e ? J.indexOf(e) : 0];
}
function xl(i) {
  for (let t = J.indexOf(i) + 1, e = J.length; t < e; ++t)
    if (vi[J[t]].common)
      return J[t];
}
function jn(i, t, e) {
  if (!e)
    i[t] = !0;
  else if (e.length) {
    const { lo: n, hi: s } = r1(e, t), a = e[n] >= t ? e[n] : e[s];
    i[a] = !0;
  }
}
function kl(i, t, e, n) {
  const s = i._adapter, a = +s.startOf(t[0].value, n), r = t[t.length - 1].value;
  let o, l;
  for (o = a; o <= r; o = +s.add(o, 1, n))
    l = e[o], l >= 0 && (t[l].major = !0);
  return t;
}
function Gn(i, t, e) {
  const n = [], s = {}, a = t.length;
  let r, o;
  for (r = 0; r < a; ++r)
    o = t[r], s[o] = r, n.push({
      value: o,
      major: !1
    });
  return a === 0 || !e ? n : kl(i, n, s, e);
}
class Yn extends ie {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: !1,
      unit: !1,
      round: !1,
      isoWeekday: !1,
      minUnit: "millisecond",
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: !1,
      major: {
        enabled: !1
      }
    }
  };
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const n = t.time || (t.time = {}), s = this._adapter = new no._date(t.adapters.date);
    s.init(e), pe(n.displayFormats, s.formats()), this._parseOpts = {
      parser: n.parser,
      round: n.round,
      isoWeekday: n.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return t === void 0 ? null : Un(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options, e = this._adapter, n = t.time.unit || "day";
    let { min: s, max: a, minDefined: r, maxDefined: o } = this.getUserBounds();
    function l(d) {
      !r && !isNaN(d.min) && (s = Math.min(s, d.min)), !o && !isNaN(d.max) && (a = Math.max(a, d.max));
    }
    (!r || !o) && (l(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && l(this.getMinMax(!1))), s = Y(s) && !isNaN(s) ? s : +e.startOf(Date.now(), n), a = Y(a) && !isNaN(a) ? a : +e.endOf(Date.now(), n) + 1, this.min = Math.min(s, a - 1), this.max = Math.max(s + 1, a);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY;
    return t.length && (e = t[0], n = t[t.length - 1]), {
      min: e,
      max: n
    };
  }
  buildTicks() {
    const t = this.options, e = t.time, n = t.ticks, s = n.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]);
    const a = this.min, r = this.max, o = Ca(s, a, r);
    return this._unit = e.unit || (n.autoSkip ? Fn(e.minUnit, this.min, this.max, this._getLabelCapacity(a)) : bl(this, o.length, e.minUnit, this.min, this.max)), this._majorUnit = !n.major.enabled || this._unit === "year" ? void 0 : xl(this._unit), this.initOffsets(s), t.reverse && o.reverse(), Gn(this, o, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0, n = 0, s, a;
    this.options.offset && t.length && (s = this.getDecimalForValue(t[0]), t.length === 1 ? e = 1 - s : e = (this.getDecimalForValue(t[1]) - s) / 2, a = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? n = a : n = (a - this.getDecimalForValue(t[t.length - 2])) / 2);
    const r = t.length < 3 ? 0.5 : 0.25;
    e = G(e, 0, r), n = G(n, 0, r), this._offsets = {
      start: e,
      end: n,
      factor: 1 / (e + 1 + n)
    };
  }
  _generate() {
    const t = this._adapter, e = this.min, n = this.max, s = this.options, a = s.time, r = a.unit || Fn(a.minUnit, e, n, this._getLabelCapacity(e)), o = S(s.ticks.stepSize, 1), l = r === "week" ? a.isoWeekday : !1, d = Pe(l) || l === !0, c = {};
    let h = e, _, f;
    if (d && (h = +t.startOf(h, "isoWeek", l)), h = +t.startOf(h, d ? "day" : r), t.diff(n, e, r) > 1e5 * o)
      throw new Error(e + " and " + n + " are too far apart with stepSize of " + o + " " + r);
    const g = s.ticks.source === "data" && this.getDataTimestamps();
    for (_ = h, f = 0; _ < n; _ = +t.add(_, o, r), f++)
      jn(c, _, g);
    return (_ === n || s.bounds === "ticks" || f === 1) && jn(c, _, g), Object.keys(c).sort(In).map((u) => +u);
  }
  getLabelForValue(t) {
    const e = this._adapter, n = this.options.time;
    return n.tooltipFormat ? e.format(t, n.tooltipFormat) : e.format(t, n.displayFormats.datetime);
  }
  format(t, e) {
    const s = this.options.time.displayFormats, a = this._unit, r = e || s[a];
    return this._adapter.format(t, r);
  }
  _tickFormatFunction(t, e, n, s) {
    const a = this.options, r = a.ticks.callback;
    if (r)
      return B(r, [
        t,
        e,
        n
      ], this);
    const o = a.time.displayFormats, l = this._unit, d = this._majorUnit, c = l && o[l], h = d && o[d], _ = n[e], f = d && h && _ && _.major;
    return this._adapter.format(t, s || (f ? h : c));
  }
  generateTickLabels(t) {
    let e, n, s;
    for (e = 0, n = t.length; e < n; ++e)
      s = t[e], s.label = this._tickFormatFunction(s.value, e, t);
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets, n = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + n) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets, n = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + n * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks, n = this.ctx.measureText(t).width, s = Bt(this.isHorizontal() ? e.maxRotation : e.minRotation), a = Math.cos(s), r = Math.sin(s), o = this._resolveTickFontOptions(0).size;
    return {
      w: n * a + o * r,
      h: n * r + o * a
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time, n = e.displayFormats, s = n[e.unit] || n.millisecond, a = this._tickFormatFunction(t, 0, Gn(this, [
      t
    ], this._majorUnit), s), r = this._getLabelSize(a), o = Math.floor(this.isHorizontal() ? this.width / r.w : this.height / r.h) - 1;
    return o > 0 ? o : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [], e, n;
    if (t.length)
      return t;
    const s = this.getMatchingVisibleMetas();
    if (this._normalized && s.length)
      return this._cache.data = s[0].controller.getAllParsedValues(this);
    for (e = 0, n = s.length; e < n; ++e)
      t = t.concat(s[e].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(t);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, n;
    if (t.length)
      return t;
    const s = this.getLabels();
    for (e = 0, n = s.length; e < n; ++e)
      t.push(Un(this, s[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return g0(t.sort(In));
  }
}
function Fe(i, t, e) {
  let n = 0, s = i.length - 1, a, r, o, l;
  e ? (t >= i[n].pos && t <= i[s].pos && ({ lo: n, hi: s } = Ot(i, "pos", t)), { pos: a, time: o } = i[n], { pos: r, time: l } = i[s]) : (t >= i[n].time && t <= i[s].time && ({ lo: n, hi: s } = Ot(i, "time", t)), { time: a, pos: o } = i[n], { time: r, pos: l } = i[s]);
  const d = r - a;
  return d ? o + (l - o) * (t - a) / d : o;
}
class o6 extends Yn {
  static id = "timeseries";
  static defaults = Yn.defaults;
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t);
    this._minPos = Fe(e, this.min), this._tableRange = Fe(e, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const { min: e, max: n } = this, s = [], a = [];
    let r, o, l, d, c;
    for (r = 0, o = t.length; r < o; ++r)
      d = t[r], d >= e && d <= n && s.push(d);
    if (s.length < 2)
      return [
        {
          time: e,
          pos: 0
        },
        {
          time: n,
          pos: 1
        }
      ];
    for (r = 0, o = s.length; r < o; ++r)
      c = s[r + 1], l = s[r - 1], d = s[r], Math.round((c + l) / 2) !== d && a.push({
        time: d,
        pos: r / (o - 1)
      });
    return a;
  }
  _generate() {
    const t = this.min, e = this.max;
    let n = super.getDataTimestamps();
    return (!n.includes(t) || !n.length) && n.splice(0, 0, t), (!n.includes(e) || n.length === 1) && n.push(e), n.sort((s, a) => s - a);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length)
      return t;
    const e = this.getDataTimestamps(), n = this.getLabelTimestamps();
    return e.length && n.length ? t = this.normalize(e.concat(n)) : t = e.length ? e : n, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (Fe(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets, n = this.getDecimalForPixel(t) / e.factor - e.end;
    return Fe(this._table, n * this._tableRange + this._minPos, !0);
  }
}
/*!
 * chartjs-plugin-datalabels v2.2.0
 * https://chartjs-plugin-datalabels.netlify.app
 * (c) 2017-2022 chartjs-plugin-datalabels contributors
 * Released under the MIT license
 */
var Xn = (function() {
  if (typeof window < "u") {
    if (window.devicePixelRatio)
      return window.devicePixelRatio;
    var i = window.screen;
    if (i)
      return (i.deviceXDPI || 1) / (i.logicalXDPI || 1);
  }
  return 1;
})(), ye = {
  // @todo move this in Chart.helpers.toTextLines
  toTextLines: function(i) {
    var t = [], e;
    for (i = [].concat(i); i.length; )
      e = i.pop(), typeof e == "string" ? t.unshift.apply(t, e.split(`
`)) : Array.isArray(e) ? i.push.apply(i, e) : L(i) || t.unshift("" + e);
    return t;
  },
  // @todo move this in Chart.helpers.canvas.textSize
  // @todo cache calls of measureText if font doesn't change?!
  textSize: function(i, t, e) {
    var n = [].concat(t), s = n.length, a = i.font, r = 0, o;
    for (i.font = e.string, o = 0; o < s; ++o)
      r = Math.max(i.measureText(n[o]).width, r);
    return i.font = a, {
      height: s * e.lineHeight,
      width: r
    };
  },
  /**
   * Returns value bounded by min and max. This is equivalent to max(min, min(value, max)).
   * @todo move this method in Chart.helpers.bound
   * https://doc.qt.io/qt-5/qtglobal.html#qBound
   */
  bound: function(i, t, e) {
    return Math.max(i, Math.min(t, e));
  },
  /**
   * Returns an array of pair [value, state] where state is:
   * * -1: value is only in a0 (removed)
   * *  1: value is only in a1 (added)
   */
  arrayDiff: function(i, t) {
    var e = i.slice(), n = [], s, a, r, o;
    for (s = 0, r = t.length; s < r; ++s)
      o = t[s], a = e.indexOf(o), a === -1 ? n.push([o, 1]) : e.splice(a, 1);
    for (s = 0, r = e.length; s < r; ++s)
      n.push([e[s], -1]);
    return n;
  },
  /**
   * https://github.com/chartjs/chartjs-plugin-datalabels/issues/70
   */
  rasterize: function(i) {
    return Math.round(i * Xn) / Xn;
  }
};
function Bi(i, t) {
  var e = t.x, n = t.y;
  if (e === null)
    return { x: 0, y: -1 };
  if (n === null)
    return { x: 1, y: 0 };
  var s = i.x - e, a = i.y - n, r = Math.sqrt(s * s + a * a);
  return {
    x: r ? s / r : 0,
    y: r ? a / r : -1
  };
}
function Ml(i, t, e, n, s) {
  switch (s) {
    case "center":
      e = n = 0;
      break;
    case "bottom":
      e = 0, n = 1;
      break;
    case "right":
      e = 1, n = 0;
      break;
    case "left":
      e = -1, n = 0;
      break;
    case "top":
      e = 0, n = -1;
      break;
    case "start":
      e = -e, n = -n;
      break;
    case "end":
      break;
    default:
      s *= Math.PI / 180, e = Math.cos(s), n = Math.sin(s);
      break;
  }
  return {
    x: i,
    y: t,
    vx: e,
    vy: n
  };
}
var Cl = 0, es = 1, is = 2, ns = 4, ss = 8;
function je(i, t, e) {
  var n = Cl;
  return i < e.left ? n |= es : i > e.right && (n |= is), t < e.top ? n |= ss : t > e.bottom && (n |= ns), n;
}
function Sl(i, t) {
  for (var e = i.x0, n = i.y0, s = i.x1, a = i.y1, r = je(e, n, t), o = je(s, a, t), l, d, c; !(!(r | o) || r & o); )
    l = r || o, l & ss ? (d = e + (s - e) * (t.top - n) / (a - n), c = t.top) : l & ns ? (d = e + (s - e) * (t.bottom - n) / (a - n), c = t.bottom) : l & is ? (c = n + (a - n) * (t.right - e) / (s - e), d = t.right) : l & es && (c = n + (a - n) * (t.left - e) / (s - e), d = t.left), l === r ? (e = d, n = c, r = je(e, n, t)) : (s = d, a = c, o = je(s, a, t));
  return {
    x0: e,
    x1: s,
    y0: n,
    y1: a
  };
}
function Ge(i, t) {
  var e = t.anchor, n = i, s, a;
  return t.clamp && (n = Sl(n, t.area)), e === "start" ? (s = n.x0, a = n.y0) : e === "end" ? (s = n.x1, a = n.y1) : (s = (n.x0 + n.x1) / 2, a = (n.y0 + n.y1) / 2), Ml(s, a, i.vx, i.vy, t.align);
}
var Ye = {
  arc: function(i, t) {
    var e = (i.startAngle + i.endAngle) / 2, n = Math.cos(e), s = Math.sin(e), a = i.innerRadius, r = i.outerRadius;
    return Ge({
      x0: i.x + n * a,
      y0: i.y + s * a,
      x1: i.x + n * r,
      y1: i.y + s * r,
      vx: n,
      vy: s
    }, t);
  },
  point: function(i, t) {
    var e = Bi(i, t.origin), n = e.x * i.options.radius, s = e.y * i.options.radius;
    return Ge({
      x0: i.x - n,
      y0: i.y - s,
      x1: i.x + n,
      y1: i.y + s,
      vx: e.x,
      vy: e.y
    }, t);
  },
  bar: function(i, t) {
    var e = Bi(i, t.origin), n = i.x, s = i.y, a = 0, r = 0;
    return i.horizontal ? (n = Math.min(i.x, i.base), a = Math.abs(i.base - i.x)) : (s = Math.min(i.y, i.base), r = Math.abs(i.base - i.y)), Ge({
      x0: n,
      y0: s + r,
      x1: n + a,
      y1: s,
      vx: e.x,
      vy: e.y
    }, t);
  },
  fallback: function(i, t) {
    var e = Bi(i, t.origin);
    return Ge({
      x0: i.x,
      y0: i.y,
      x1: i.x + (i.width || 0),
      y1: i.y + (i.height || 0),
      vx: e.x,
      vy: e.y
    }, t);
  }
}, pt = ye.rasterize;
function Pl(i) {
  var t = i.borderWidth || 0, e = i.padding, n = i.size.height, s = i.size.width, a = -s / 2, r = -n / 2;
  return {
    frame: {
      x: a - e.left - t,
      y: r - e.top - t,
      w: s + e.width + t * 2,
      h: n + e.height + t * 2
    },
    text: {
      x: a,
      y: r,
      w: s,
      h: n
    }
  };
}
function zl(i, t) {
  var e = t.chart.getDatasetMeta(t.datasetIndex).vScale;
  if (!e)
    return null;
  if (e.xCenter !== void 0 && e.yCenter !== void 0)
    return { x: e.xCenter, y: e.yCenter };
  var n = e.getBasePixel();
  return i.horizontal ? { x: n, y: null } : { x: null, y: n };
}
function Tl(i) {
  return i instanceof v2 ? Ye.arc : i instanceof Y0 ? Ye.point : i instanceof K0 ? Ye.bar : Ye.fallback;
}
function Ll(i, t, e, n, s, a) {
  var r = Math.PI / 2;
  if (a) {
    var o = Math.min(a, s / 2, n / 2), l = t + o, d = e + o, c = t + n - o, h = e + s - o;
    i.moveTo(t, d), l < c && d < h ? (i.arc(l, d, o, -Math.PI, -r), i.arc(c, d, o, -r, 0), i.arc(c, h, o, 0, r), i.arc(l, h, o, r, Math.PI)) : l < c ? (i.moveTo(l, e), i.arc(c, d, o, -r, r), i.arc(l, d, o, r, Math.PI + r)) : d < h ? (i.arc(l, d, o, -Math.PI, 0), i.arc(l, h, o, 0, Math.PI)) : i.arc(l, d, o, -Math.PI, Math.PI), i.closePath(), i.moveTo(t, e);
  } else
    i.rect(t, e, n, s);
}
function Al(i, t, e) {
  var n = e.backgroundColor, s = e.borderColor, a = e.borderWidth;
  !n && (!s || !a) || (i.beginPath(), Ll(
    i,
    pt(t.x) + a / 2,
    pt(t.y) + a / 2,
    pt(t.w) - a,
    pt(t.h) - a,
    e.borderRadius
  ), i.closePath(), n && (i.fillStyle = n, i.fill()), s && a && (i.strokeStyle = s, i.lineWidth = a, i.lineJoin = "miter", i.stroke()));
}
function ql(i, t, e) {
  var n = e.lineHeight, s = i.w, a = i.x, r = i.y + n / 2;
  return t === "center" ? a += s / 2 : (t === "end" || t === "right") && (a += s), {
    h: n,
    w: s,
    x: a,
    y: r
  };
}
function Hl(i, t, e) {
  var n = i.shadowBlur, s = e.stroked, a = pt(e.x), r = pt(e.y), o = pt(e.w);
  s && i.strokeText(t, a, r, o), e.filled && (n && s && (i.shadowBlur = 0), i.fillText(t, a, r, o), n && s && (i.shadowBlur = n));
}
function Nl(i, t, e, n) {
  var s = n.textAlign, a = n.color, r = !!a, o = n.font, l = t.length, d = n.textStrokeColor, c = n.textStrokeWidth, h = d && c, _;
  if (!(!l || !r && !h))
    for (e = ql(e, s, o), i.font = o.string, i.textAlign = s, i.textBaseline = "middle", i.shadowBlur = n.textShadowBlur, i.shadowColor = n.textShadowColor, r && (i.fillStyle = a), h && (i.lineJoin = "round", i.lineWidth = c, i.strokeStyle = d), _ = 0, l = t.length; _ < l; ++_)
      Hl(i, t[_], {
        stroked: h,
        filled: r,
        w: e.w,
        x: e.x,
        y: e.y + e.h * _
      });
}
var as = function(i, t, e, n) {
  var s = this;
  s._config = i, s._index = n, s._model = null, s._rects = null, s._ctx = t, s._el = e;
};
dt(as.prototype, {
  /**
   * @private
   */
  _modelize: function(i, t, e, n) {
    var s = this, a = s._index, r = X(R([e.font, {}], n, a)), o = R([e.color, $.color], n, a);
    return {
      align: R([e.align, "center"], n, a),
      anchor: R([e.anchor, "center"], n, a),
      area: n.chart.chartArea,
      backgroundColor: R([e.backgroundColor, null], n, a),
      borderColor: R([e.borderColor, null], n, a),
      borderRadius: R([e.borderRadius, 0], n, a),
      borderWidth: R([e.borderWidth, 0], n, a),
      clamp: R([e.clamp, !1], n, a),
      clip: R([e.clip, !1], n, a),
      color: o,
      display: i,
      font: r,
      lines: t,
      offset: R([e.offset, 4], n, a),
      opacity: R([e.opacity, 1], n, a),
      origin: zl(s._el, n),
      padding: nt(R([e.padding, 4], n, a)),
      positioner: Tl(s._el),
      rotation: R([e.rotation, 0], n, a) * (Math.PI / 180),
      size: ye.textSize(s._ctx, t, r),
      textAlign: R([e.textAlign, "start"], n, a),
      textShadowBlur: R([e.textShadowBlur, 0], n, a),
      textShadowColor: R([e.textShadowColor, o], n, a),
      textStrokeColor: R([e.textStrokeColor, o], n, a),
      textStrokeWidth: R([e.textStrokeWidth, 0], n, a)
    };
  },
  update: function(i) {
    var t = this, e = null, n = null, s = t._index, a = t._config, r, o, l, d = R([a.display, !0], i, s);
    d && (r = i.dataset.data[s], o = S(B(a.formatter, [r, i]), r), l = L(o) ? [] : ye.toTextLines(o), l.length && (e = t._modelize(d, l, a, i), n = Pl(e))), t._model = e, t._rects = n;
  },
  geometry: function() {
    return this._rects ? this._rects.frame : {};
  },
  rotation: function() {
    return this._model ? this._model.rotation : 0;
  },
  visible: function() {
    return this._model && this._model.opacity;
  },
  model: function() {
    return this._model;
  },
  draw: function(i, t) {
    var e = this, n = i.ctx, s = e._model, a = e._rects, r;
    this.visible() && (n.save(), s.clip && (r = s.area, n.beginPath(), n.rect(
      r.left,
      r.top,
      r.right - r.left,
      r.bottom - r.top
    ), n.clip()), n.globalAlpha = ye.bound(0, s.opacity, 1), n.translate(pt(t.x), pt(t.y)), n.rotate(s.rotation), Al(n, a.frame, s), Nl(n, s.lines, a.text, s), n.restore());
  }
});
var Bl = Number.MIN_SAFE_INTEGER || -9007199254740991, Ol = Number.MAX_SAFE_INTEGER || 9007199254740991;
function he(i, t, e) {
  var n = Math.cos(e), s = Math.sin(e), a = t.x, r = t.y;
  return {
    x: a + n * (i.x - a) - s * (i.y - r),
    y: r + s * (i.x - a) + n * (i.y - r)
  };
}
function Kn(i, t) {
  var e = Ol, n = Bl, s = t.origin, a, r, o, l, d;
  for (a = 0; a < i.length; ++a)
    r = i[a], o = r.x - s.x, l = r.y - s.y, d = t.vx * o + t.vy * l, e = Math.min(e, d), n = Math.max(n, d);
  return {
    min: e,
    max: n
  };
}
function Xe(i, t) {
  var e = t.x - i.x, n = t.y - i.y, s = Math.sqrt(e * e + n * n);
  return {
    vx: (t.x - i.x) / s,
    vy: (t.y - i.y) / s,
    origin: i,
    ln: s
  };
}
var rs = function() {
  this._rotation = 0, this._rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
};
dt(rs.prototype, {
  center: function() {
    var i = this._rect;
    return {
      x: i.x + i.w / 2,
      y: i.y + i.h / 2
    };
  },
  update: function(i, t, e) {
    this._rotation = e, this._rect = {
      x: t.x + i.x,
      y: t.y + i.y,
      w: t.w,
      h: t.h
    };
  },
  contains: function(i) {
    var t = this, e = 1, n = t._rect;
    return i = he(i, t.center(), -t._rotation), !(i.x < n.x - e || i.y < n.y - e || i.x > n.x + n.w + e * 2 || i.y > n.y + n.h + e * 2);
  },
  // Separating Axis Theorem
  // https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
  intersects: function(i) {
    var t = this._points(), e = i._points(), n = [
      Xe(t[0], t[1]),
      Xe(t[0], t[3])
    ], s, a, r;
    for (this._rotation !== i._rotation && n.push(
      Xe(e[0], e[1]),
      Xe(e[0], e[3])
    ), s = 0; s < n.length; ++s)
      if (a = Kn(t, n[s]), r = Kn(e, n[s]), a.max < r.min || r.max < a.min)
        return !1;
    return !0;
  },
  /**
   * @private
   */
  _points: function() {
    var i = this, t = i._rect, e = i._rotation, n = i.center();
    return [
      he({ x: t.x, y: t.y }, n, e),
      he({ x: t.x + t.w, y: t.y }, n, e),
      he({ x: t.x + t.w, y: t.y + t.h }, n, e),
      he({ x: t.x, y: t.y + t.h }, n, e)
    ];
  }
});
function os(i, t, e) {
  var n = t.positioner(i, t), s = n.vx, a = n.vy;
  if (!s && !a)
    return { x: n.x, y: n.y };
  var r = e.w, o = e.h, l = t.rotation, d = Math.abs(r / 2 * Math.cos(l)) + Math.abs(o / 2 * Math.sin(l)), c = Math.abs(r / 2 * Math.sin(l)) + Math.abs(o / 2 * Math.cos(l)), h = 1 / Math.max(Math.abs(s), Math.abs(a));
  return d *= s * h, c *= a * h, d += t.offset * s, c += t.offset * a, {
    x: n.x + d,
    y: n.y + c
  };
}
function Dl(i, t) {
  var e, n, s, a;
  for (e = i.length - 1; e >= 0; --e)
    for (s = i[e].$layout, n = e - 1; n >= 0 && s._visible; --n)
      a = i[n].$layout, a._visible && s._box.intersects(a._box) && t(s, a);
  return i;
}
function Rl(i) {
  var t, e, n, s, a, r, o;
  for (t = 0, e = i.length; t < e; ++t)
    n = i[t], s = n.$layout, s._visible && (o = new Proxy(n._el, { get: (l, d) => l.getProps([d], !0)[d] }), a = n.geometry(), r = os(o, n.model(), a), s._box.update(r, a, n.rotation()));
  return Dl(i, function(l, d) {
    var c = l._hidable, h = d._hidable;
    c && h || h ? d._visible = !1 : c && (l._visible = !1);
  });
}
var be = {
  prepare: function(i) {
    var t = [], e, n, s, a, r;
    for (e = 0, s = i.length; e < s; ++e)
      for (n = 0, a = i[e].length; n < a; ++n)
        r = i[e][n], t.push(r), r.$layout = {
          _box: new rs(),
          _hidable: !1,
          _visible: !0,
          _set: e,
          _idx: r._index
        };
    return t.sort(function(o, l) {
      var d = o.$layout, c = l.$layout;
      return d._idx === c._idx ? c._set - d._set : c._idx - d._idx;
    }), this.update(t), t;
  },
  update: function(i) {
    var t = !1, e, n, s, a, r;
    for (e = 0, n = i.length; e < n; ++e)
      s = i[e], a = s.model(), r = s.$layout, r._hidable = a && a.display === "auto", r._visible = s.visible(), t |= r._hidable;
    t && Rl(i);
  },
  lookup: function(i, t) {
    var e, n;
    for (e = i.length - 1; e >= 0; --e)
      if (n = i[e].$layout, n && n._visible && n._box.contains(t))
        return i[e];
    return null;
  },
  draw: function(i, t) {
    var e, n, s, a, r, o;
    for (e = 0, n = t.length; e < n; ++e)
      s = t[e], a = s.$layout, a._visible && (r = s.geometry(), o = os(s._el, s.model(), r), a._box.update(o, r, s.rotation()), s.draw(i, o));
  }
}, El = function(i) {
  if (L(i))
    return null;
  var t = i, e, n, s;
  if (T(i))
    if (!L(i.label))
      t = i.label;
    else if (!L(i.r))
      t = i.r;
    else
      for (t = "", e = Object.keys(i), s = 0, n = e.length; s < n; ++s)
        t += (s !== 0 ? ", " : "") + e[s] + ": " + i[e[s]];
  return "" + t;
}, $l = {
  align: "center",
  anchor: "center",
  backgroundColor: null,
  borderColor: null,
  borderRadius: 0,
  borderWidth: 0,
  clamp: !1,
  clip: !1,
  color: void 0,
  display: !0,
  font: {
    family: void 0,
    lineHeight: 1.2,
    size: void 0,
    style: void 0,
    weight: null
  },
  formatter: El,
  labels: void 0,
  listeners: {},
  offset: 4,
  opacity: 1,
  padding: {
    top: 4,
    right: 4,
    bottom: 4,
    left: 4
  },
  rotation: 0,
  textAlign: "start",
  textStrokeColor: void 0,
  textStrokeWidth: 0,
  textShadowBlur: 0,
  textShadowColor: void 0
}, Z = "$datalabels", ls = "$default";
function Vl(i, t) {
  var e = i.datalabels, n = {}, s = [], a, r;
  return e === !1 ? null : (e === !0 && (e = {}), t = dt({}, [t, e]), a = t.labels || {}, r = Object.keys(a), delete t.labels, r.length ? r.forEach(function(o) {
    a[o] && s.push(dt({}, [
      t,
      a[o],
      { _key: o }
    ]));
  }) : s.push(t), n = s.reduce(function(o, l) {
    return H(l.listeners || {}, function(d, c) {
      o[c] = o[c] || {}, o[c][l._key || ls] = d;
    }), delete l.listeners, o;
  }, {}), {
    labels: s,
    listeners: n
  });
}
function Fi(i, t, e, n) {
  if (t) {
    var s = e.$context, a = e.$groups, r;
    t[a._set] && (r = t[a._set][a._key], r && B(r, [s, n]) === !0 && (i[Z]._dirty = !0, e.update(s)));
  }
}
function Wl(i, t, e, n, s) {
  var a, r;
  !e && !n || (e ? n ? e !== n && (r = a = !0) : r = !0 : a = !0, r && Fi(i, t.leave, e, s), a && Fi(i, t.enter, n, s));
}
function Il(i, t) {
  var e = i[Z], n = e._listeners, s, a;
  if (!(!n.enter && !n.leave)) {
    if (t.type === "mousemove")
      a = be.lookup(e._labels, t);
    else if (t.type !== "mouseout")
      return;
    s = e._hovered, e._hovered = a, Wl(i, n, s, a, t);
  }
}
function Ul(i, t) {
  var e = i[Z], n = e._listeners.click, s = n && be.lookup(e._labels, t);
  s && Fi(i, n, s, t);
}
var Fl = {
  id: "datalabels",
  defaults: $l,
  beforeInit: function(i) {
    i[Z] = {
      _actives: []
    };
  },
  beforeUpdate: function(i) {
    var t = i[Z];
    t._listened = !1, t._listeners = {}, t._datasets = [], t._labels = [];
  },
  afterDatasetUpdate: function(i, t, e) {
    var n = t.index, s = i[Z], a = s._datasets[n] = [], r = i.isDatasetVisible(n), o = i.data.datasets[n], l = Vl(o, e), d = t.meta.data || [], c = i.ctx, h, _, f, g, u, p, m, w;
    for (c.save(), h = 0, f = d.length; h < f; ++h)
      if (m = d[h], m[Z] = [], r && m && i.getDataVisibility(h) && !m.skip)
        for (_ = 0, g = l.labels.length; _ < g; ++_)
          u = l.labels[_], p = u._key, w = new as(u, c, m, h), w.$groups = {
            _set: n,
            _key: p || ls
          }, w.$context = {
            active: !1,
            chart: i,
            dataIndex: h,
            dataset: o,
            datasetIndex: n
          }, w.update(w.$context), m[Z].push(w), a.push(w);
    c.restore(), dt(s._listeners, l.listeners, {
      merger: function(y, b, v) {
        b[y] = b[y] || {}, b[y][t.index] = v[y], s._listened = !0;
      }
    });
  },
  afterUpdate: function(i) {
    i[Z]._labels = be.prepare(i[Z]._datasets);
  },
  // Draw labels on top of all dataset elements
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/29
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/32
  afterDatasetsDraw: function(i) {
    be.draw(i, i[Z]._labels);
  },
  beforeEvent: function(i, t) {
    if (i[Z]._listened) {
      var e = t.event;
      switch (e.type) {
        case "mousemove":
        case "mouseout":
          Il(i, e);
          break;
        case "click":
          Ul(i, e);
          break;
      }
    }
  },
  afterEvent: function(i) {
    var t = i[Z], e = t._actives, n = t._actives = i.getActiveElements(), s = ye.arrayDiff(e, n), a, r, o, l, d, c, h;
    for (a = 0, r = s.length; a < r; ++a)
      if (d = s[a], d[1])
        for (h = d[0].element[Z] || [], o = 0, l = h.length; o < l; ++o)
          c = h[o], c.$context.active = d[1] === 1, c.update(c.$context);
    (t._dirty || s.length) && (be.update(t._labels), i.render()), delete t._dirty;
  }
};
p1.register(
  io,
  mi,
  Y0,
  eo,
  K0,
  ml,
  yl,
  Q2,
  al,
  fl,
  Fl
);
function jl(i, t, e, n) {
  const s = i.slice(0, t);
  return {
    labels: s.map((r) => {
      try {
        return new Intl.DateTimeFormat(n, { weekday: "short" }).format(
          new Date(r.datetime)
        );
      } catch {
        return r.datetime.slice(0, 10);
      }
    }),
    high: s.map((r) => r.temperature ?? null),
    low: s.map((r) => r.templow ?? null),
    precip: s.map(
      (r) => e === "probability" ? r.precipitation_probability ?? null : r.precipitation ?? null
    )
  };
}
function Gl(i, t, e, n) {
  const s = i.slice(0, t);
  return {
    labels: s.map((r) => {
      try {
        return new Intl.DateTimeFormat(n, {
          hour: "numeric"
        }).format(new Date(r.datetime));
      } catch {
        return r.datetime.slice(11, 16);
      }
    }),
    high: s.map((r) => r.temperature ?? null),
    low: s.map(() => null),
    precip: s.map(
      (r) => e === "probability" ? r.precipitation_probability ?? null : r.precipitation ?? null
    )
  };
}
function Yl(i, t, e, n) {
  const s = t.low.some((o) => o != null), a = [
    {
      type: "line",
      label: e === "daily" ? "High" : "Temp",
      data: t.high,
      borderColor: "rgba(255, 152, 0, 1)",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      datalabels: {
        align: "top",
        color: "rgba(255, 152, 0, 1)",
        formatter: (o) => o == null ? "" : `${Math.round(o)}°`
      }
    }
  ];
  s && a.push({
    type: "line",
    label: "Low",
    data: t.low,
    borderColor: "rgba(68, 115, 158, 1)",
    backgroundColor: "rgba(68, 115, 158, 0.15)",
    tension: 0.35,
    yAxisID: "yTemp",
    pointRadius: 3,
    datalabels: {
      align: "bottom",
      color: "rgba(68, 115, 158, 1)",
      formatter: (o) => o == null ? "" : `${Math.round(o)}°`
    }
  }), a.push({
    type: "bar",
    label: n === "probability" ? "Precip %" : "Precip",
    data: t.precip,
    backgroundColor: "rgba(132, 209, 253, 0.65)",
    borderRadius: 3,
    yAxisID: "yPrecip",
    order: 1,
    datalabels: {
      display: !1
    }
  });
  const r = {
    type: "bar",
    data: {
      labels: t.labels,
      datasets: a
    },
    options: {
      responsive: !0,
      maintainAspectRatio: !1,
      interaction: { mode: "index", intersect: !1 },
      plugins: {
        legend: { display: !1 },
        tooltip: { enabled: !0 },
        datalabels: {
          clamp: !0,
          font: { size: 10, weight: "bold" }
        }
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, autoSkip: !0 },
          grid: { display: !1 }
        },
        yTemp: {
          type: "linear",
          position: "left",
          grid: { color: "rgba(127,127,127,0.15)" },
          ticks: {
            callback: (o) => `${o}°`
          }
        },
        yPrecip: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: !1 },
          beginAtZero: !0,
          ticks: {
            callback: (o) => n === "probability" ? `${o}%` : `${o}`
          }
        }
      }
    }
  };
  return new p1(i, r);
}
function ds(i, t = !0) {
  switch (i) {
    case "clear-night":
      return "clear-night";
    case "cloudy":
      return "cloudy";
    case "fog":
      return "fog";
    case "hail":
      return "hail";
    case "lightning":
      return "thunderstorms";
    case "lightning-rainy":
      return "thunderstorms-rain";
    case "partlycloudy":
      return t ? "partly-cloudy-day" : "partly-cloudy-night";
    case "pouring":
      return "extreme-rain";
    case "rainy":
      return "rain";
    case "snowy":
      return "snow";
    case "snowy-rainy":
      return "sleet";
    case "sunny":
      return "clear-day";
    case "windy":
    case "windy-variant":
      return "wind";
    case "exceptional":
      return "weather-alert";
    default:
      return "not-available";
  }
}
function cs(i) {
  const t = typeof i == "string" ? Number.parseFloat(i) : i;
  if (t == null || Number.isNaN(t))
    return "wind-direction-n";
  const e = (t % 360 + 360) % 360, n = [
    "wind-direction-n",
    "wind-direction-ne",
    "wind-direction-e",
    "wind-direction-se",
    "wind-direction-s",
    "wind-direction-sw",
    "wind-direction-w",
    "wind-direction-nw"
  ], s = Math.round(e / 45) % 8;
  return n[s];
}
function hs(i) {
  const t = typeof i == "string" ? Number.parseFloat(i) : i;
  if (t == null || Number.isNaN(t)) return "—";
  const e = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"], n = (t % 360 + 360) % 360;
  return e[Math.round(n / 45) % 8];
}
const Xl = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="19.5" fill="url(#clear-day__paint0_linear_1802_5186)" stroke="#f8af18"/><g id="clear-day__Rays"><path fill="#f8af18" d="M61 19a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 30.059A3 3 0 1 1 97.94 34.3l-9.9 9.9a3 3 0 1 1-4.242-4.243zM109 61a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 93.699a3 3 0 1 1-4.243 4.242l-9.899-9.9a3 3 0 1 1 4.243-4.242zM61 95a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 83.799a3 3 0 1 1 4.243 4.243l-9.9 9.9a3 3 0 1 1-4.242-4.243zM33 61a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 39.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 64.0;360 64.0 64.0"/></g></g></g><defs><linearGradient id="clear-day__paint0_linear_1802_5186" x1="64" x2="64" y1="44" y2="84" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient></defs></svg>', Kl = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" fill="url(#clear-night__paint0_linear_1837_5080)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" d="M60.302 32.582C55.282 53.7 73.6 74.348 95.325 72.515 91.52 85.77 79.2 95.5 64.536 95.5 46.837 95.5 32.5 81.344 32.5 63.898c0-16.03 12.107-29.27 27.802-31.316"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 63.9 64.0;6 63.9 64.0;-6 63.9 64.0"/></g></g><defs><linearGradient id="clear-night__paint0_linear_1837_5080" x1="64" x2="64" y1="32" y2="96" gradientUnits="userSpaceOnUse"><stop stop-color="#86c3db"/><stop offset="1" stop-color="#72b9d5"/></linearGradient></defs></svg>', Zl = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_1858_8144)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="url(#cloudy__paint0_linear_1858_8144)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><linearGradient id="cloudy__paint0_linear_1858_8144" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="cloudy__clip0_1858_8144"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Jl = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_1858_8382)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="url(#extreme-rain__paint0_linear_1858_8382)" stroke="#94a3b8" stroke-miterlimit="10" d="M83.84 48.693c2.404-3.735 7.375-5.164 11.478-3.516 4.043 1.624 6.496 6.012 5.392 10.26l-.17.653.675-.029c3.281-.137 6.285 2.404 6.285 5.713 0 3.202-2.831 5.726-6.011 5.726H74.977c-3.21 0-6.132-2.382-6.448-5.593-.315-3.2 2.088-6.066 5.235-6.636l.491-.09-.088-.49c-.394-2.198.645-4.442 2.518-5.664 1.925-1.256 4.492-1.32 6.483-.17l.413.237z"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 -3;0 0;0 -3"/></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="url(#extreme-rain__paint1_linear_1858_8382)" stroke="#64748b" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><linearGradient id="extreme-rain__paint0_linear_1858_8382" x1="88" x2="88" y1="44" y2="68" gradientUnits="userSpaceOnUse"><stop stop-color="#b0bccd"/><stop offset="1" stop-color="#94a3b8"/></linearGradient><linearGradient id="extreme-rain__paint1_linear_1858_8382" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#7c8ca2"/><stop offset="1" stop-color="#64748b"/></linearGradient><clipPath id="extreme-rain__clip0_1858_8382"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Ql = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_1858_9374)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="url(#fog__paint0_linear_1858_9374)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"><animateTransform attributeName="transform" begin="-2.8s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path></g></g><defs><linearGradient id="fog__paint0_linear_1858_9374" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="fog__clip0_1858_9374"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', t8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_1858_8718)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="url(#hail__paint0_linear_1858_8718)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"><animateTransform attributeName="transform" begin="-0.7s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.7s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86"><animateTransform attributeName="transform" begin="-0.4s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.4s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><linearGradient id="hail__paint0_linear_1858_8718" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="hail__clip0_1858_8718"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', e8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g transform="translate(64.5 64.2)"><g id="humidity__Raindrop" transform="translate(-64.5 -64.2)"><path id="humidity__Vector" fill="url(#humidity__paint0_linear_1858_260)" stroke="#1d4ed8" stroke-miterlimit="10" d="M64.5 34.907c5.752 8.707 10.461 15.798 13.759 22.048 3.375 6.398 5.241 11.863 5.241 17.22 0 10.682-8.51 19.325-19 19.325s-19-8.668-19-19.325c0-5.344 1.866-10.803 5.241-17.201 3.298-6.251 8.007-13.348 13.759-22.067Z"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g><animateTransform additive="sum" attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="scale" values="1 1;1.1 1.1;1 1"/></g></g><defs><linearGradient id="humidity__paint0_linear_1858_260" x1="64.5" x2="64.5" y1="34" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs></svg>', i8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_1858_7536)"><g id="not-available__Text" clip-path="url(#not-available__clip1_1858_7536)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_1858_7536"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_1858_7536"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', n8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_1858_8241)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="8.5" fill="url(#partly-cloudy-day__paint0_linear_1858_8241)" stroke="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 39.0 51.0;360 39.0 51.0"/></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="url(#partly-cloudy-day__paint1_linear_1858_8241)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><linearGradient id="partly-cloudy-day__paint0_linear_1858_8241" x1="39" x2="39" y1="42" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><linearGradient id="partly-cloudy-day__paint1_linear_1858_8241" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="partly-cloudy-day__clip0_1858_8241"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', s8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_1858_8252)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="url(#partly-cloudy-night__paint0_linear_1858_8252)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" d="M35.115 34.595c-1.737 8.568 5.638 16.62 14.198 16.188-1.64 5.05-6.424 8.717-12.095 8.717-7.03 0-12.718-5.621-12.718-12.541 0-6.214 4.588-11.375 10.615-12.364"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 36.9 47.0;6 36.9 47.0;-6 36.9 47.0"/></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="url(#partly-cloudy-night__paint1_linear_1858_8252)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><linearGradient id="partly-cloudy-night__paint0_linear_1858_8252" x1="37" x2="37" y1="34" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#86c3db"/><stop offset="1" stop-color="#72b9d5"/></linearGradient><linearGradient id="partly-cloudy-night__paint1_linear_1858_8252" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="partly-cloudy-night__clip0_1858_8252"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', a8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_1858_8370)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="url(#rain__paint0_linear_1858_8370)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><linearGradient id="rain__paint0_linear_1858_8370" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="rain__clip0_1858_8370"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', r8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_1858_9090)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="url(#sleet__paint0_linear_1858_9090)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><linearGradient id="sleet__paint0_linear_1858_9090" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="sleet__clip0_1858_9090"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', o8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_1858_8860)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="url(#snow__paint0_linear_1858_8860)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><linearGradient id="snow__paint0_linear_1858_8860" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="snow__clip0_1858_8860"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', l8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_1858_7873)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_1858_7873" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_1858_7873)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="19.5" fill="url(#sunrise__paint0_linear_1858_7873)" stroke="#f8af18"/><g id="sunrise__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></g></g></g></g></g><defs><linearGradient id="sunrise__paint0_linear_1858_7873" x1="64" x2="64" y1="62" y2="102" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><clipPath id="sunrise__clip0_1858_7873"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', d8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_1858_7881)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_1858_7881" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_1858_7881)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="19.5" fill="url(#sunset__paint0_linear_1858_7881)" stroke="#f8af18"/><g id="sunset__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></g></g></g></g></g><defs><linearGradient id="sunset__paint0_linear_1858_7881" x1="64" x2="64" y1="62" y2="102" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><clipPath id="sunset__clip0_1858_7881"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', c8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_1858_9933)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="url(#thunderstorms-rain__paint0_linear_1858_9933)" stroke="#e6effc" stroke-miterlimit="10" d="M55.263 48.475c4.86-7.864 15.035-11.095 23.552-7.532 8.507 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.341-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="url(#thunderstorms-rain__paint1_linear_1858_9933)" stroke="#f6a823" stroke-miterlimit="10" d="m71.173 68.5-7.616 14.541-.384.731h11.829l-18.05 24.12 3.537-16.88.127-.603h-7.912L60.355 68.5z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><linearGradient id="thunderstorms-rain__paint0_linear_1858_9933" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="thunderstorms-rain__paint1_linear_1858_9933" x1="64.528" x2="84.414" y1="66.038" y2="77.457" gradientUnits="userSpaceOnUse"><stop stop-color="#f7b23b"/><stop offset="1" stop-color="#f6a823"/></linearGradient><clipPath id="thunderstorms-rain__clip0_1858_9933"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', h8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_1858_9911)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="url(#thunderstorms__paint0_linear_1858_9911)" stroke="#e6effc" stroke-miterlimit="10" d="M55.263 48.475c4.86-7.864 15.035-11.095 23.552-7.532 8.507 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.341-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="url(#thunderstorms__paint1_linear_1858_9911)" stroke="#f6a823" stroke-miterlimit="10" d="m71.173 68.5-7.616 14.541-.384.731h11.829l-18.05 24.12 3.537-16.88.127-.603h-7.912L60.355 68.5z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><linearGradient id="thunderstorms__paint0_linear_1858_9911" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="thunderstorms__paint1_linear_1858_9911" x1="64.528" x2="84.414" y1="66.038" y2="77.457" gradientUnits="userSpaceOnUse"><stop stop-color="#f7b23b"/><stop offset="1" stop-color="#f6a823"/></linearGradient><clipPath id="thunderstorms__clip0_1858_9911"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', _8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_1905_19070)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="url(#weather-alert__paint0_linear_1905_19070)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="url(#weather-alert__paint1_linear_1905_19070)" stroke="#202939" d="M89.835 68.75c.962-1.667 3.368-1.667 4.33 0l12.124 21c.962 1.667-.24 3.75-2.165 3.75H79.876c-1.865 0-3.052-1.955-2.249-3.593l.084-.157z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M92.758 84.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H90.4v-3.006h3.204z"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.294;0.5;0.794;1" repeatCount="indefinite" values="1;1;0;0;1"/></g></g><defs><linearGradient id="weather-alert__paint0_linear_1905_19070" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="weather-alert__paint1_linear_1905_19070" x1="92" x2="92" y1="67" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#364d6e"/><stop offset="1" stop-color="#202939"/></linearGradient><clipPath id="weather-alert__clip0_1905_19070"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', f8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-e__paint0_linear_1910_19210)" stroke="#1e293b"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer" filter="url(#wind-direction-e__filter0_d_1910_19210)"><path id="wind-direction-e__Pointer Up" fill="#fff" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-e__paint0_linear_1910_19210" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-e__filter0_d_1910_19210" width="43.477" height="14.051" x="43.523" y="56.974" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19210"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19210" mode="normal" result="shape"/></filter></defs></svg>', u8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-n__paint0_linear_1910_19180)" stroke="#1e293b"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer" filter="url(#wind-direction-n__filter0_d_1910_19180)"><path id="wind-direction-n__Pointer Up" fill="#fff" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-n__paint0_linear_1910_19180" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-n__filter0_d_1910_19180" width="13.051" height="44.477" x="57.474" y="40.5" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19180"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19180" mode="normal" result="shape"/></filter></defs></svg>', g8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-ne__paint0_linear_1910_19246)" stroke="#1e293b"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer" filter="url(#wind-direction-ne__filter0_d_1910_19246)"><path id="wind-direction-ne__Pointer Up" fill="#fff" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-ne__paint0_linear_1910_19246" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-ne__filter0_d_1910_19246" width="35.157" height="36.157" x="45.32" y="47.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19246"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19246" mode="normal" result="shape"/></filter></defs></svg>', p8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-nw__paint0_linear_1910_19255)" stroke="#1e293b"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer" filter="url(#wind-direction-nw__filter0_d_1910_19255)"><path id="wind-direction-nw__Pointer Up" fill="#fff" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-nw__paint0_linear_1910_19255" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-nw__filter0_d_1910_19255" width="35.157" height="36.157" x="47.523" y="47.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19255"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19255" mode="normal" result="shape"/></filter></defs></svg>', m8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-s__paint0_linear_1910_19222)" stroke="#1e293b"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer" filter="url(#wind-direction-s__filter0_d_1910_19222)"><path id="wind-direction-s__Pointer Up" fill="#fff" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-180 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-s__paint0_linear_1910_19222" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-s__filter0_d_1910_19222" width="13.051" height="44.477" x="57.474" y="43.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19222"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19222" mode="normal" result="shape"/></filter></defs></svg>', w8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-se__paint0_linear_1910_19249)" stroke="#1e293b"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer" filter="url(#wind-direction-se__filter0_d_1910_19249)"><path id="wind-direction-se__Pointer Up" fill="#fff" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-se__paint0_linear_1910_19249" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-se__filter0_d_1910_19249" width="35.157" height="36.157" x="45.32" y="44.82" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19249"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19249" mode="normal" result="shape"/></filter></defs></svg>', v8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-sw__paint0_linear_1910_19252)" stroke="#1e293b"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer" filter="url(#wind-direction-sw__filter0_d_1910_19252)"><path id="wind-direction-sw__Pointer Up" fill="#fff" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-sw__paint0_linear_1910_19252" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-sw__filter0_d_1910_19252" width="35.157" height="36.157" x="47.523" y="44.82" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19252"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19252" mode="normal" result="shape"/></filter></defs></svg>', y8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-w__paint0_linear_1910_19234)" stroke="#1e293b"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer" filter="url(#wind-direction-w__filter0_d_1910_19234)"><path id="wind-direction-w__Pointer Up" fill="#fff" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g><defs><linearGradient id="wind-direction-w__paint0_linear_1910_19234" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-w__filter0_d_1910_19234" width="43.477" height="14.051" x="41" y="56.974" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19234"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19234" mode="normal" result="shape"/></filter></defs></svg>', b8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"><animate attributeName="stroke-dashoffset" begin="0s" dur="6s" repeatCount="indefinite" values="0;1000"/></path><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"><animate attributeName="stroke-dashoffset" begin="-5.8s" dur="6s" repeatCount="indefinite" values="0;1000"/></path></g></g></svg>', x8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="20" fill="#f8af18"/><g id="clear-day__Rays"><path fill="#f8af18" d="M61 19a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 30.059A3 3 0 1 1 97.94 34.3l-9.9 9.9a3 3 0 1 1-4.242-4.243zM109 61a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 93.699a3 3 0 1 1-4.243 4.242l-9.899-9.9a3 3 0 1 1 4.243-4.242zM61 95a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 83.799a3 3 0 1 1 4.243 4.243l-9.9 9.9a3 3 0 1 1-4.242-4.243zM33 61a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 39.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 64.0;360 64.0 64.0"/></g></g></g></svg>', k8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" fill="#72b9d5" d="M60.962 32C44.676 33.758 32 47.362 32 63.898 32 81.627 46.567 96 64.536 96 79.682 96 92.373 85.775 96 71.95 74.381 74.266 55.329 53.463 60.962 32"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64.0 64.0;6 64.0 64.0;-6 64.0 64.0"/></g></g></svg>', M8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2045_39565)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="cloudy__clip0_2045_39565"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', C8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2045_39605)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2045_39605)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2045_39605" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2045_39605)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="#b0bccd" d="M101.194 55.562c1.173-4.512-1.434-9.14-5.69-10.849-4.312-1.732-9.543-.239-12.085 3.71-2.154-1.243-4.923-1.173-7.007.186-2.031 1.325-3.169 3.763-2.737 6.17-3.375.612-5.988 3.69-5.644 7.177.344 3.495 3.508 6.045 6.946 6.044 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.715 6.512-6.226 0-3.631-3.279-6.36-6.806-6.212"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 -3;0 0;0 -3"/></g></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="#7c8ca2" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="extreme-rain__clip0_2045_39605"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2045_39605"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', S8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2045_39785)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"><animateTransform attributeName="transform" begin="-2.8s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path></g></g><defs><clipPath id="fog__clip0_2045_39785"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', P8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2045_39653)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"><animateTransform attributeName="transform" begin="-0.7s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.7s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86"><animateTransform attributeName="transform" begin="-0.4s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.4s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="hail__clip0_2045_39653"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', z8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g transform="translate(64.5 64)"><g id="humidity__Raindrop" transform="translate(-64.5 -64)"><path id="humidity__Vector" fill="#2563eb" d="M64.5 34C52.63 52 45 63.25 45 74.175S53.726 94 64.5 94 84 85.125 84 74.175 76.37 51.975 64.5 34"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g><animateTransform additive="sum" attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="scale" values="1 1;1.1 1.1;1 1"/></g></g></svg>', T8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2045_48541)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2045_48541)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2045_48541"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2045_48541"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', L8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2045_39567)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2045_39567" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2045_39567)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 39.0 51.0;360 39.0 51.0"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2045_39567"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', A8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2045_39569)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2045_39569" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2045_39569)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="#72b9d5" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 37.0 47.0;6 37.0 47.0;-6 37.0 47.0"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2045_39569"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', q8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2045_39587)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="rain__clip0_2045_39587"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', H8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2045_39719)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="sleet__clip0_2045_39719"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', N8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2045_39686)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="snow__clip0_2045_39686"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', B8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2045_48353)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2045_48353" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2045_48353)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="20" fill="#f8af18"/><g id="sunrise__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></g></g></g></g></g><defs><clipPath id="sunrise__clip0_2045_48353"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', O8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2045_48358)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2045_48358" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2045_48358)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="20" fill="#f8af18"/><g id="sunset__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></g></g></g></g></g><defs><clipPath id="sunset__clip0_2045_48358"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', D8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2045_39884)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.288 14.954.668 7.07 6.81 12.594 13.891 12.592h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.322-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms-rain__clip0_2045_39884"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', R8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2045_39851)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.288 14.954.668 7.07 6.81 12.594 13.891 12.592h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.322-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms__clip0_2045_39851"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', E8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2045_48112)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="#202939" d="M89.402 68.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H79.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M92.758 84.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H90.4v-3.006h3.204z"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.294;0.5;0.794;1" repeatCount="indefinite" values="1;1;0;0;1"/></g></g><defs><clipPath id="weather-alert__clip0_2045_48112"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', $8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer Up" fill="#d6dfe9" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', V8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer Up" fill="#d6dfe9" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="2" fill="#475569"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', W8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer Up" fill="#d6dfe9" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', I8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer Up" fill="#d6dfe9" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', U8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer Up" fill="#d6dfe9" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-180 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', F8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer Up" fill="#d6dfe9" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', j8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer Up" fill="#d6dfe9" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', G8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer Up" fill="#d6dfe9" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Y8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"><animate attributeName="stroke-dashoffset" begin="0s" dur="6s" repeatCount="indefinite" values="0;1000"/></path><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"><animate attributeName="stroke-dashoffset" begin="-5.8s" dur="6s" repeatCount="indefinite" values="0;1000"/></path></g></g></svg>', X8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="18" stroke="#f8af18" stroke-width="4"/><path id="clear-day__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 16a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V18a2 2 0 0 1 2-2M30.059 30.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 64a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2M41.373 86.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 1 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 96a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V98a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 64.0;360 64.0 64.0"/></path></g></g></svg>', K8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M58.4 34.416c-3.48 20.81 14.126 40.037 34.823 39.704C88.98 85.698 77.763 94 64.536 94 47.646 94 34 80.497 34 63.898c0-14.53 10.46-26.68 24.4-29.482"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 63.6 64.2;6 63.6 64.2;-6 63.6 64.2"/></g></g></svg>', Z8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2045_28818)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="cloudy__clip0_2045_28818"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', J8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2045_28858)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2045_28858)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2045_28858" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2045_28858)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="#94a3b8" d="M101.194 55.562c1.173-4.512-1.434-9.14-5.69-10.849-4.312-1.732-9.543-.239-12.085 3.71-2.154-1.243-4.923-1.173-7.007.186-2.031 1.325-3.169 3.763-2.737 6.17-3.375.612-5.988 3.69-5.644 7.177.344 3.495 3.508 6.045 6.946 6.044 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.715 6.512-6.226 0-3.631-3.279-6.36-6.806-6.212"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 -3;0 0;0 -3"/></g></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="#64748b" d="M72.245 39.046a19.4 19.4 0 0 1 3.844.517 19.05 19.05 0 0 1 8.391 4.438 19.6 19.6 0 0 1 3.526 4.248 20 20 0 0 1 2.213 5.036 20 20 0 0 1 .39 1.657q.24 1.258.312 2.545a18.9 18.9 0 0 1-.533 5.616 13 13 0 0 1 2.352.114c5.591.79 10.191 5.213 11.098 10.802q.026.165.049.33a12.5 12.5 0 0 1 .109 2.02c-.168 6.383-5.162 11.719-11.385 12.525q-.805.105-1.634.106a2 2 0 0 1 0-4 9 9 0 0 0 .455-.012c2.268-.119 4.347-1.119 5.889-2.651a9.4 9.4 0 0 0 1.112-1.333 9 9 0 0 0 1.01-1.926 8.7 8.7 0 0 0 .545-2.589 8.5 8.5 0 0 0-.038-1.379 8.6 8.6 0 0 0-.54-2.196c-1.195-3.068-4.077-5.372-7.445-5.764a9 9 0 0 0-1.402-.05l-2.677.117a2 2 0 0 1-2.027-2.483l.648-2.6a14 14 0 0 0 .218-1.024 15 15 0 0 0 .222-2.396 15 15 0 0 0-.339-3.373 15.6 15.6 0 0 0-1.054-3.2q-.278-.615-.607-1.205c-1.647-2.945-4.235-5.373-7.481-6.73a15.3 15.3 0 0 0-6.059-1.17 16 16 0 0 0-2.703.262 16 16 0 0 0-5.071 1.857 15.7 15.7 0 0 0-2.233 1.553 15.3 15.3 0 0 0-2.158 2.208q-.54.679-1.003 1.428l-1.038 1.678a2 2 0 0 1-2.732.663l-1.692-1.017a8.9 8.9 0 0 0-3.62-1.211c-2.112-.233-4.298.264-6.086 1.478a8.6 8.6 0 0 0-1.005.798 9.012 9.012 0 0 0-2.043 2.802q-.135.286-.248.581a8.84 8.84 0 0 0-.483 4.678l.334 1.94a2 2 0 0 1-1.6 2.304l-1.934.365a9.6 9.6 0 0 0-1.353.36 9.8 9.8 0 0 0-1.669.76 10.1 10.1 0 0 0-2.459 1.985 10.3 10.3 0 0 0-1.088 1.438 10 10 0 0 0-.818 1.607 9.7 9.7 0 0 0-.703 3.556 9.4 9.4 0 0 0 .175 1.853 9.6 9.6 0 0 0 .706 2.174 9.9 9.9 0 0 0 1.758 2.619q.154.165.315.325a10.3 10.3 0 0 0 3.387 2.222q.636.253 1.305.419a9.6 9.6 0 0 0 2.304.279 2 2 0 0 1 0 4 13.6 13.6 0 0 1-2.603-.251c-3.6-.7-6.773-2.818-8.842-5.757q-.183-.26-.354-.527a13.8 13.8 0 0 1-1.498-3.172 13.47 13.47 0 0 1-.257-7.39c1.072-4.344 4.235-8.026 8.442-9.701a13.5 13.5 0 0 1 2.51-.73 12.7 12.7 0 0 1 .059-4.6 13 13 0 0 1 .634-2.195 12.95 12.95 0 0 1 4.78-6.05c4.152-2.82 9.714-2.973 14.015-.388a19 19 0 0 1 3.655-4.308q.161-.143.326-.28a19.4 19.4 0 0 1 2.806-1.956 20 20 0 0 1 2.686-1.288 21 21 0 0 1 1.612-.55q.409-.122.82-.225a20 20 0 0 1 4.645-.597q.428-.004.857.01"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="extreme-rain__clip0_2045_28858"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2045_28858"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Q8 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2045_29038)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"><animateTransform attributeName="transform" begin="-2.8s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path></g></g><defs><clipPath id="fog__clip0_2045_29038"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', td = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2045_28906)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"><animateTransform attributeName="transform" begin="-0.7s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.7s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86"><animateTransform attributeName="transform" begin="-0.4s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.4s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="hail__clip0_2045_28906"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', ed = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g transform="translate(64.5 64.8)"><g id="humidity__Raindrop" transform="translate(-64.5 -64.8)"><path id="humidity__Vector" stroke="#1d4ed8" stroke-miterlimit="10" stroke-width="4" d="M64.501 37.635c5.19 7.86 9.415 14.303 12.432 20.02C80.259 63.962 82 69.172 82 74.175 82 84.052 74.138 92 64.5 92 54.864 92 47 84.028 47 74.175c0-4.99 1.74-10.194 5.067-16.501 3.017-5.719 7.242-12.168 12.434-20.04Z"/><path id="humidity__Label" fill="#1d4ed8" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g><animateTransform additive="sum" attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="scale" values="1 1;1.1 1.1;1 1"/></g></g></svg>', id = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2045_37842)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2045_37842)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2045_37842"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2045_37842"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', nd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2045_28820)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2045_28820" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2045_28820)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 39.0 51.0;360 39.0 51.0"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2045_28820"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', sd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2045_28822)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2045_28822" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2045_28822)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="#72b9d5" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 37.0 47.0;6 37.0 47.0;-6 37.0 47.0"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2045_28822"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', ad = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2045_28840)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="rain__clip0_2045_28840"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', rd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2045_28972)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="sleet__clip0_2045_28972"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', od = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2045_28939)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="snow__clip0_2045_28939"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', ld = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2045_37653)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2045_37653" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2045_37653)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="18" stroke="#f8af18" stroke-width="4"/><path id="sunrise__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></path></g></g></g></g><defs><clipPath id="sunrise__clip0_2045_37653"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', dd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2045_37658)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2045_37658" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2045_37658)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="18" stroke="#f8af18" stroke-width="4"/><path id="sunset__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></path></g></g></g></g><defs><clipPath id="sunset__clip0_2045_37658"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', cd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2045_29137)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.172-7.73 8.733 3.654 13.675 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.038 1.68a2 2 0 0 1-2.732.663l-1.692-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.222-5.525-13.89-12.592s4.329-13.64 11.288-14.954c-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms-rain__clip0_2045_29137"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', hd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2045_29104)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.172-7.73 8.733 3.654 13.675 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.038 1.68a2 2 0 0 1-2.732.663l-1.692-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.222-5.525-13.89-12.592s4.329-13.64 11.288-14.954c-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms__clip0_2045_29104"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', _d = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2045_37401)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="#202939" d="M61.402 63.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H51.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M64.758 79.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H62.4v-3.006h3.204z"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.294;0.5;0.794;1" repeatCount="indefinite" values="1;1;0;0;1"/></g></g><defs><clipPath id="weather-alert__clip0_2045_37401"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', fd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer Up" fill="#d6dfe9" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', ud = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer Up" fill="#d6dfe9" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="2" fill="#475569"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', gd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer Up" fill="#d6dfe9" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', pd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer Up" fill="#d6dfe9" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-45 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', md = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer Up" fill="#d6dfe9" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-180 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', wd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer Up" fill="#d6dfe9" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', vd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer Up" fill="#d6dfe9" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-135 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', yd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer Up" fill="#d6dfe9" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-90 64 63.5)"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', bd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"><animate attributeName="stroke-dashoffset" begin="0s" dur="6s" repeatCount="indefinite" values="0;1000"/></path><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"><animate attributeName="stroke-dashoffset" begin="-5.8s" dur="6s" repeatCount="indefinite" values="0;1000"/></path></g></g></svg>', xd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="18" stroke="currentColor" stroke-width="4"/><path id="clear-day__Rays" fill="currentColor" fill-rule="evenodd" d="M64 16a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V18a2 2 0 0 1 2-2M30.059 30.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 64a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2M41.373 86.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 1 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 96a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V98a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 64.0;360 64.0 64.0"/></path></g></g></svg>', kd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M58.4 34.416c-3.48 20.81 14.126 40.037 34.823 39.704C88.98 85.698 77.763 94 64.536 94 47.646 94 34 80.497 34 63.898c0-14.53 10.46-26.68 24.4-29.482"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 63.6 64.2;6 63.6 64.2;-6 63.6 64.2"/></g></g></svg>', Md = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2038_14010)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="cloudy__clip0_2038_14010"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Cd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2038_14050)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2038_14050)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2038_14050" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2038_14050)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="currentColor" d="M101.194 55.57c1.173-4.51-1.434-9.134-5.69-10.843-4.312-1.73-9.543-.238-12.085 3.708-2.154-1.243-4.923-1.173-7.007.186-2.031 1.324-3.169 3.76-2.737 6.166-3.375.612-5.988 3.688-5.644 7.173.344 3.493 3.508 6.04 6.946 6.04 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.713 6.512-6.222 0-3.63-3.279-6.356-6.806-6.208"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 -3;0 0;0 -3"/></g></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="extreme-rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="extreme-rain__clip0_2038_14050"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2038_14050"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Sd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2038_14230)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path><path id="fog__Line 1" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"><animateTransform attributeName="transform" begin="-2.8s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;3 0;0 0"/></path></g></g><defs><clipPath id="fog__clip0_2038_14230"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Pd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2038_14098)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="currentColor" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 2" fill="currentColor" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"><animateTransform attributeName="transform" begin="-0.7s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.7s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="hail__Ice Ball 3" fill="currentColor" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86"><animateTransform attributeName="transform" begin="-0.4s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.4s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="hail__clip0_2038_14098"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', zd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g transform="translate(64.5 64)"><g id="humidity__Raindrop" transform="translate(-64.5 -64)"><path id="humidity__Vector" fill="currentColor" d="M64.5 34C52.63 52 45 63.25 45 74.175S53.726 94 64.5 94 84 85.125 84 74.175 76.37 51.975 64.5 34"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g><animateTransform additive="sum" attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="scale" values="1 1;1.1 1.1;1 1"/></g></g></svg>', Td = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2038_25630)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2038_25630)"><path id="not-available__Text_2" fill="currentColor" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2038_25630"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2038_25630"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Ld = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2038_14012)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2038_14012" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2038_14012)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="currentColor"/><g id="partly-cloudy-day__Rays"><path fill="currentColor" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 39.0 51.0;360 39.0 51.0"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2038_14012"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Ad = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2038_14014)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2038_14014" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2038_14014)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="currentColor" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 37.0 47.0;6 37.0 47.0;-6 37.0 47.0"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2038_14014"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', qd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2038_14032)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="rain__clip0_2038_14032"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Hd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2038_14164)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="currentColor" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 2" fill="currentColor" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Snowflake 3" fill="currentColor" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 88v3"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 88v3"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="sleet__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 88v3"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="sleet__clip0_2038_14164"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Nd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2038_14131)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="currentColor" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 2" fill="currentColor" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.30000000000000004s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.30000000000000004s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="snow__Snowflake 3" fill="currentColor" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"><animateTransform attributeName="transform" begin="-0.8s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.8s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g></g><defs><clipPath id="snow__clip0_2038_14131"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Bd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2038_25429)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2038_25429" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2038_25429)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="18" stroke="currentColor" stroke-width="4"/><path id="sunrise__Rays" fill="currentColor" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></path></g></g></g></g><defs><clipPath id="sunrise__clip0_2038_25429"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Od = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2038_25434)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2038_25434" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2038_25434)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="18" stroke="currentColor" stroke-width="4"/><path id="sunset__Rays" fill="currentColor" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"><animateTransform attributeName="transform" begin="0s" dur="6s" repeatCount="indefinite" type="rotate" values="0 64.0 82.0;360 64.0 82.0"/></path></g></g></g></g><defs><clipPath id="sunset__clip0_2038_25434"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Dd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2038_14329)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.047 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.677.116a2 2 0 0 1-2.027-2.484l.648-2.6c1.813-7.269-2.116-15.044-9.042-17.942-6.94-2.904-15.277-.248-19.226 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.083.001-13.223-5.525-13.89-12.592-.669-7.067 4.328-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"><animateTransform attributeName="transform" begin="-0.6s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.6s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path><path id="thunderstorms-rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12"><animateTransform attributeName="transform" begin="-0.19999999999999996s" calcMode="spline" dur="1s" keySplines=".42 0 1 1" repeatCount="indefinite" type="translate" values="0 0;0 20"/><animate attributeName="opacity" begin="-0.19999999999999996s" dur="1s" keyTimes="0;0.15;0.85;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="currentColor" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms-rain__clip0_2038_14329"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Rd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2038_14296)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.047 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.677.116a2 2 0 0 1-2.027-2.484l.648-2.6c1.813-7.269-2.116-15.044-9.042-17.942-6.94-2.904-15.277-.248-19.226 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.083.001-13.223-5.525-13.89-12.592-.669-7.067 4.328-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="currentColor" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"><animate attributeName="opacity" begin="0s" dur="2s" keyTimes="0;0.25;0.33;0.42;0.5;0.57;0.63;0.67;1" repeatCount="indefinite" values="1;1;0;1;0;1;0;1;1"/></path></g></g><defs><clipPath id="thunderstorms__clip0_2038_14296"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Ed = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2038_25186)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="translate" values="0 0;0 -3;0 0"/></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="currentColor" d="M61.402 63.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H51.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M64.758 79.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H62.4v-3.006h3.204z"/><animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;0.294;0.5;0.794;1" repeatCount="indefinite" values="1;1;0;0;1"/></g></g><defs><clipPath id="weather-alert__clip0_2038_25186"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', $d = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m85.331 64.632-40.674 5.384c-1.011.134-1.55-1.155-.745-1.78l5.073-3.947a1 1 0 0 0 0-1.578l-5.073-3.946c-.805-.627-.266-1.915.745-1.781l40.674 5.384c2.225.295 2.225 1.97 0 2.264M62.001 63.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Vd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m65.132 42.169 5.384 40.674c.134 1.011-1.155 1.55-1.781.745l-3.946-5.073a1 1 0 0 0-1.578 0l-3.946 5.073c-.627.805-1.915.266-1.781-.745l5.384-40.674c.294-2.225 1.97-2.225 2.264 0M64 65.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Wd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M79.884 49.217 54.93 81.785c-.62.81-1.913.28-1.786-.732l.797-6.378a1 1 0 0 0-1.116-1.116l-6.378.797c-1.012.127-1.542-1.166-.732-1.786l32.568-24.954c1.782-1.365 2.966-.18 1.6 1.6M62.586 64.914a2 2 0 1 0 2.828-2.829 2 2 0 0 0-2.828 2.83" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Id = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M49.717 47.617 82.285 72.57c.81.62.28 1.913-.732 1.786l-6.378-.797a1 1 0 0 0-1.116 1.116l.797 6.378c.127 1.012-1.166 1.542-1.786.732L48.116 49.217c-1.365-1.782-.181-2.966 1.6-1.6m15.697 17.297a2 2 0 1 0-2.828-2.828 2 2 0 0 0 2.828 2.828" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Ud = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m62.868 84.831-5.384-40.674c-.134-1.011 1.155-1.55 1.781-.745l3.946 5.073a1 1 0 0 0 1.579 0l3.945-5.073c.627-.805 1.915-.266 1.781.745l-5.384 40.674c-.295 2.225-1.97 2.225-2.264 0M64 61.501a2 2 0 1 0 0 3.999 2 2 0 0 0 0-4" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Fd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M78.283 79.384 45.715 54.43c-.81-.62-.28-1.913.732-1.786l6.378.797a1 1 0 0 0 1.116-1.116l-.797-6.378c-.127-1.012 1.166-1.542 1.786-.732l24.954 32.568c1.365 1.782.181 2.966-1.6 1.6M62.586 62.085a2 2 0 1 0 2.828 2.828 2 2 0 0 0-2.828-2.828" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', jd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M48.117 77.783 73.07 45.215c.62-.81 1.913-.28 1.786.732l-.797 6.378a1 1 0 0 0 1.116 1.116l6.378-.797c1.012-.127 1.542 1.166.732 1.786L49.717 79.384c-1.782 1.365-2.966.181-1.6-1.6m17.297-15.697a2 2 0 1 0-2.828 2.828 2 2 0 0 0 2.828-2.828" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Gd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m42.669 62.368 40.674-5.384c1.011-.134 1.55 1.155.745 1.781l-5.073 3.946a1 1 0 0 0 0 1.579l5.073 3.945c.805.627.266 1.915-.745 1.781l-40.674-5.384c-2.225-.294-2.225-1.97 0-2.264M66 63.5a2 2 0 1 0-4 0 2 2 0 0 0 4 0" clip-rule="evenodd"/><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="3s" keySplines=".42 0 .58 1; .42 0 .58 1" repeatCount="indefinite" type="rotate" values="-6 64 64;6 64 64;-6 64 64"/></g></g></g></svg>', Yd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="currentColor" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"><animate attributeName="stroke-dashoffset" begin="0s" dur="6s" repeatCount="indefinite" values="0;1000"/></path><path id="wind__Wind Line 1_2" stroke="currentColor" stroke-dasharray="50" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"><animate attributeName="stroke-dashoffset" begin="-5.8s" dur="6s" repeatCount="indefinite" values="0;1000"/></path></g></g></svg>', Xd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="19.5" fill="url(#clear-day__paint0_linear_1802_5186)" stroke="#f8af18"/><g id="clear-day__Rays"><path fill="#f8af18" d="M61 19a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 30.059A3 3 0 1 1 97.94 34.3l-9.9 9.9a3 3 0 1 1-4.242-4.243zM109 61a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 93.699a3 3 0 1 1-4.243 4.242l-9.899-9.9a3 3 0 1 1 4.243-4.242zM61 95a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 83.799a3 3 0 1 1 4.243 4.243l-9.9 9.9a3 3 0 1 1-4.242-4.243zM33 61a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 39.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g><defs><linearGradient id="clear-day__paint0_linear_1802_5186" x1="64" x2="64" y1="44" y2="84" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient></defs></svg>', Kd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" fill="url(#clear-night__paint0_linear_1837_5080)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" d="M60.302 32.582C55.282 53.7 73.6 74.348 95.325 72.515 91.52 85.77 79.2 95.5 64.536 95.5 46.837 95.5 32.5 81.344 32.5 63.898c0-16.03 12.107-29.27 27.802-31.316"/></g></g><defs><linearGradient id="clear-night__paint0_linear_1837_5080" x1="64" x2="64" y1="32" y2="96" gradientUnits="userSpaceOnUse"><stop stop-color="#86c3db"/><stop offset="1" stop-color="#72b9d5"/></linearGradient></defs></svg>', Zd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_1858_8144)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="url(#cloudy__paint0_linear_1858_8144)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g></g><defs><linearGradient id="cloudy__paint0_linear_1858_8144" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="cloudy__clip0_1858_8144"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Jd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_1858_8382)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="url(#extreme-rain__paint0_linear_1858_8382)" stroke="#94a3b8" stroke-miterlimit="10" d="M83.84 48.693c2.404-3.735 7.375-5.164 11.478-3.516 4.043 1.624 6.496 6.012 5.392 10.26l-.17.653.675-.029c3.281-.137 6.285 2.404 6.285 5.713 0 3.202-2.831 5.726-6.011 5.726H74.977c-3.21 0-6.132-2.382-6.448-5.593-.315-3.2 2.088-6.066 5.235-6.636l.491-.09-.088-.49c-.394-2.198.645-4.442 2.518-5.664 1.925-1.256 4.492-1.32 6.483-.17l.413.237z"/></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="url(#extreme-rain__paint1_linear_1858_8382)" stroke="#64748b" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><linearGradient id="extreme-rain__paint0_linear_1858_8382" x1="88" x2="88" y1="44" y2="68" gradientUnits="userSpaceOnUse"><stop stop-color="#b0bccd"/><stop offset="1" stop-color="#94a3b8"/></linearGradient><linearGradient id="extreme-rain__paint1_linear_1858_8382" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#7c8ca2"/><stop offset="1" stop-color="#64748b"/></linearGradient><clipPath id="extreme-rain__clip0_1858_8382"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Qd = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_1858_9374)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="url(#fog__paint0_linear_1858_9374)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"/><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"/></g></g><defs><linearGradient id="fog__paint0_linear_1858_9374" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="fog__clip0_1858_9374"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', t4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_1858_8718)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="url(#hail__paint0_linear_1858_8718)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86" transform="translate(0 8)"/><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"/><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86" transform="translate(0 8)"/></g></g></g><defs><linearGradient id="hail__paint0_linear_1858_8718" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="hail__clip0_1858_8718"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', e4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g id="humidity__Raindrop"><path id="humidity__Vector" fill="url(#humidity__paint0_linear_1858_260)" stroke="#1d4ed8" stroke-miterlimit="10" d="M64.5 34.907c5.752 8.707 10.461 15.798 13.759 22.048 3.375 6.398 5.241 11.863 5.241 17.22 0 10.682-8.51 19.325-19 19.325s-19-8.668-19-19.325c0-5.344 1.866-10.803 5.241-17.201 3.298-6.251 8.007-13.348 13.759-22.067Z"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g></g><defs><linearGradient id="humidity__paint0_linear_1858_260" x1="64.5" x2="64.5" y1="34" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs></svg>', i4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_1858_7536)"><g id="not-available__Text" clip-path="url(#not-available__clip1_1858_7536)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_1858_7536"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_1858_7536"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', n4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_1858_8241)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="8.5" fill="url(#partly-cloudy-day__paint0_linear_1858_8241)" stroke="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="url(#partly-cloudy-day__paint1_linear_1858_8241)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g></g><defs><linearGradient id="partly-cloudy-day__paint0_linear_1858_8241" x1="39" x2="39" y1="42" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><linearGradient id="partly-cloudy-day__paint1_linear_1858_8241" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="partly-cloudy-day__clip0_1858_8241"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', s4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_1858_8252)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="url(#partly-cloudy-night__paint0_linear_1858_8252)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" d="M35.115 34.595c-1.737 8.568 5.638 16.62 14.198 16.188-1.64 5.05-6.424 8.717-12.095 8.717-7.03 0-12.718-5.621-12.718-12.541 0-6.214 4.588-11.375 10.615-12.364"/></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="url(#partly-cloudy-night__paint1_linear_1858_8252)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g></g><defs><linearGradient id="partly-cloudy-night__paint0_linear_1858_8252" x1="37" x2="37" y1="34" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#86c3db"/><stop offset="1" stop-color="#72b9d5"/></linearGradient><linearGradient id="partly-cloudy-night__paint1_linear_1858_8252" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="partly-cloudy-night__clip0_1858_8252"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', a4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_1858_8370)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="url(#rain__paint0_linear_1858_8370)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><linearGradient id="rain__paint0_linear_1858_8370" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="rain__clip0_1858_8370"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', r4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_1858_9090)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="url(#sleet__paint0_linear_1858_9090)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 16)"/><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3" transform="translate(0 16)"/><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"/><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3" transform="translate(0 16)"/></g></g></g><defs><linearGradient id="sleet__paint0_linear_1858_9090" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="sleet__clip0_1858_9090"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', o4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_1858_8860)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="url(#snow__paint0_linear_1858_8860)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/></g></g></g><defs><linearGradient id="snow__paint0_linear_1858_8860" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><clipPath id="snow__clip0_1858_8860"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', l4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_1858_7873)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_1858_7873" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_1858_7873)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="19.5" fill="url(#sunrise__paint0_linear_1858_7873)" stroke="#f8af18"/><g id="sunrise__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g></g></g><defs><linearGradient id="sunrise__paint0_linear_1858_7873" x1="64" x2="64" y1="62" y2="102" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><clipPath id="sunrise__clip0_1858_7873"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', d4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_1858_7881)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_1858_7881" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_1858_7881)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="19.5" fill="url(#sunset__paint0_linear_1858_7881)" stroke="#f8af18"/><g id="sunset__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g></g></g><defs><linearGradient id="sunset__paint0_linear_1858_7881" x1="64" x2="64" y1="62" y2="102" gradientUnits="userSpaceOnUse"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f8af18"/></linearGradient><clipPath id="sunset__clip0_1858_7881"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', c4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_1858_9933)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="url(#thunderstorms-rain__paint0_linear_1858_9933)" stroke="#e6effc" stroke-miterlimit="10" d="M55.263 48.475c4.86-7.864 15.035-11.095 23.552-7.532 8.507 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.341-2.86 13.475-.373l.423.255z"/></g></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="url(#thunderstorms-rain__paint1_linear_1858_9933)" stroke="#f6a823" stroke-miterlimit="10" d="m71.173 68.5-7.616 14.541-.384.731h11.829l-18.05 24.12 3.537-16.88.127-.603h-7.912L60.355 68.5z"/></g></g><defs><linearGradient id="thunderstorms-rain__paint0_linear_1858_9933" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="thunderstorms-rain__paint1_linear_1858_9933" x1="64.528" x2="84.414" y1="66.038" y2="77.457" gradientUnits="userSpaceOnUse"><stop stop-color="#f7b23b"/><stop offset="1" stop-color="#f6a823"/></linearGradient><clipPath id="thunderstorms-rain__clip0_1858_9933"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', h4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_1858_9911)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="url(#thunderstorms__paint0_linear_1858_9911)" stroke="#e6effc" stroke-miterlimit="10" d="M55.263 48.475c4.86-7.864 15.035-11.095 23.552-7.532 8.507 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.341-2.86 13.475-.373l.423.255z"/></g></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="url(#thunderstorms__paint1_linear_1858_9911)" stroke="#f6a823" stroke-miterlimit="10" d="m71.173 68.5-7.616 14.541-.384.731h11.829l-18.05 24.12 3.537-16.88.127-.603h-7.912L60.355 68.5z"/></g></g><defs><linearGradient id="thunderstorms__paint0_linear_1858_9911" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="thunderstorms__paint1_linear_1858_9911" x1="64.528" x2="84.414" y1="66.038" y2="77.457" gradientUnits="userSpaceOnUse"><stop stop-color="#f7b23b"/><stop offset="1" stop-color="#f6a823"/></linearGradient><clipPath id="thunderstorms__clip0_1858_9911"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', _4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_1905_19070)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="url(#weather-alert__paint0_linear_1905_19070)" stroke="#e6effc" stroke-miterlimit="10" d="M55.262 48.475c4.86-7.864 15.035-11.095 23.553-7.532 8.506 3.56 13.323 13.06 11.088 22.022l-.161.65.669-.03c7.01-.306 13.089 5.407 13.089 12.443 0 6.811-5.728 12.472-12.523 12.472H37.954c-6.826.002-12.751-5.33-13.395-12.14-.643-6.808 4.178-13.148 10.884-14.415l.483-.092-.084-.484c-.816-4.745 1.284-9.652 5.263-12.356 3.99-2.712 9.34-2.86 13.475-.373l.423.255z"/></g></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="url(#weather-alert__paint1_linear_1905_19070)" stroke="#202939" d="M89.835 68.75c.962-1.667 3.368-1.667 4.33 0l12.124 21c.962 1.667-.24 3.75-2.165 3.75H79.876c-1.865 0-3.052-1.955-2.249-3.593l.084-.157z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M92.758 84.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H90.4v-3.006h3.204z"/></g></g><defs><linearGradient id="weather-alert__paint0_linear_1905_19070" x1="64.001" x2="64.001" y1="39" y2="89" gradientUnits="userSpaceOnUse"><stop stop-color="#f3f7fe"/><stop offset="1" stop-color="#e6effc"/></linearGradient><linearGradient id="weather-alert__paint1_linear_1905_19070" x1="92" x2="92" y1="67" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#364d6e"/><stop offset="1" stop-color="#202939"/></linearGradient><clipPath id="weather-alert__clip0_1905_19070"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', f4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-e__paint0_linear_1910_19210)" stroke="#1e293b"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer" filter="url(#wind-direction-e__filter0_d_1910_19210)"><path id="wind-direction-e__Pointer Up" fill="#fff" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(90 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-e__paint0_linear_1910_19210" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-e__filter0_d_1910_19210" width="43.477" height="14.051" x="43.523" y="56.974" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19210"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19210" mode="normal" result="shape"/></filter></defs></svg>', u4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-n__paint0_linear_1910_19180)" stroke="#1e293b"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer" filter="url(#wind-direction-n__filter0_d_1910_19180)"><path id="wind-direction-n__Pointer Up" fill="#fff" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649"/></g></g></g><defs><linearGradient id="wind-direction-n__paint0_linear_1910_19180" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-n__filter0_d_1910_19180" width="13.051" height="44.477" x="57.474" y="40.5" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19180"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19180" mode="normal" result="shape"/></filter></defs></svg>', g4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-ne__paint0_linear_1910_19246)" stroke="#1e293b"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer" filter="url(#wind-direction-ne__filter0_d_1910_19246)"><path id="wind-direction-ne__Pointer Up" fill="#fff" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(45 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-ne__paint0_linear_1910_19246" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-ne__filter0_d_1910_19246" width="35.157" height="36.157" x="45.32" y="47.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19246"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19246" mode="normal" result="shape"/></filter></defs></svg>', p4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-nw__paint0_linear_1910_19255)" stroke="#1e293b"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer" filter="url(#wind-direction-nw__filter0_d_1910_19255)"><path id="wind-direction-nw__Pointer Up" fill="#fff" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-45 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-nw__paint0_linear_1910_19255" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-nw__filter0_d_1910_19255" width="35.157" height="36.157" x="47.523" y="47.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19255"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19255" mode="normal" result="shape"/></filter></defs></svg>', m4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-s__paint0_linear_1910_19222)" stroke="#1e293b"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer" filter="url(#wind-direction-s__filter0_d_1910_19222)"><path id="wind-direction-s__Pointer Up" fill="#fff" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-180 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-s__paint0_linear_1910_19222" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-s__filter0_d_1910_19222" width="13.051" height="44.477" x="57.474" y="43.023" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19222"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19222" mode="normal" result="shape"/></filter></defs></svg>', w4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-se__paint0_linear_1910_19249)" stroke="#1e293b"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer" filter="url(#wind-direction-se__filter0_d_1910_19249)"><path id="wind-direction-se__Pointer Up" fill="#fff" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(135 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-se__paint0_linear_1910_19249" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-se__filter0_d_1910_19249" width="35.157" height="36.157" x="45.32" y="44.82" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19249"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19249" mode="normal" result="shape"/></filter></defs></svg>', v4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-sw__paint0_linear_1910_19252)" stroke="#1e293b"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer" filter="url(#wind-direction-sw__filter0_d_1910_19252)"><path id="wind-direction-sw__Pointer Up" fill="#fff" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-135 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-sw__paint0_linear_1910_19252" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-sw__filter0_d_1910_19252" width="35.157" height="36.157" x="47.523" y="44.82" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19252"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19252" mode="normal" result="shape"/></filter></defs></svg>', y4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="39.5" fill="url(#wind-direction-w__paint0_linear_1910_19234)" stroke="#1e293b"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer" filter="url(#wind-direction-w__filter0_d_1910_19234)"><path id="wind-direction-w__Pointer Up" fill="#fff" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="1.5" fill="#475569" stroke="#293649" transform="rotate(-90 64 63.5)"/></g></g></g><defs><linearGradient id="wind-direction-w__paint0_linear_1910_19234" x1="64" x2="64" y1="24" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient><filter id="wind-direction-w__filter0_d_1910_19234" width="43.477" height="14.051" x="41" y="56.974" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.160784 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1910_19234"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_1910_19234" mode="normal" result="shape"/></filter></defs></svg>', b4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"/><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"/></g></g></svg>', x4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="20" fill="#f8af18"/><g id="clear-day__Rays"><path fill="#f8af18" d="M61 19a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 30.059A3 3 0 1 1 97.94 34.3l-9.9 9.9a3 3 0 1 1-4.242-4.243zM109 61a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 93.699a3 3 0 1 1-4.243 4.242l-9.899-9.9a3 3 0 1 1 4.243-4.242zM61 95a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 83.799a3 3 0 1 1 4.243 4.243l-9.9 9.9a3 3 0 1 1-4.242-4.243zM33 61a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 39.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g></svg>', k4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" fill="#72b9d5" d="M60.962 32C44.676 33.758 32 47.362 32 63.898 32 81.627 46.567 96 64.536 96 79.682 96 92.373 85.775 96 71.95 74.381 74.266 55.329 53.463 60.962 32"/></g></g></svg>', M4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2045_39565)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g></g><defs><clipPath id="cloudy__clip0_2045_39565"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', C4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2045_39605)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2045_39605)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2045_39605" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2045_39605)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="#b0bccd" d="M101.194 55.562c1.173-4.512-1.434-9.14-5.69-10.849-4.312-1.732-9.543-.239-12.085 3.71-2.154-1.243-4.923-1.173-7.007.186-2.031 1.325-3.169 3.763-2.737 6.17-3.375.612-5.988 3.69-5.644 7.177.344 3.495 3.508 6.045 6.946 6.044 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.715 6.512-6.226 0-3.631-3.279-6.36-6.806-6.212"/></g></g></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="#7c8ca2" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="extreme-rain__clip0_2045_39605"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2045_39605"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', S4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2045_39785)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"/><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"/></g></g><defs><clipPath id="fog__clip0_2045_39785"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', P4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2045_39653)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86" transform="translate(0 8)"/><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"/><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86" transform="translate(0 8)"/></g></g></g><defs><clipPath id="hail__clip0_2045_39653"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', z4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g id="humidity__Raindrop"><path id="humidity__Vector" fill="#2563eb" d="M64.5 34C52.63 52 45 63.25 45 74.175S53.726 94 64.5 94 84 85.125 84 74.175 76.37 51.975 64.5 34"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g></g></svg>', T4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2045_48541)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2045_48541)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2045_48541"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2045_48541"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', L4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2045_39567)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2045_39567" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2045_39567)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2045_39567"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', A4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2045_39569)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2045_39569" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2045_39569)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="#72b9d5" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2045_39569"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', q4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2045_39587)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="rain__clip0_2045_39587"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', H4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2045_39719)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 16)"/><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3" transform="translate(0 16)"/><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"/><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3" transform="translate(0 16)"/></g></g></g><defs><clipPath id="sleet__clip0_2045_39719"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', N4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2045_39686)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/></g></g></g><defs><clipPath id="snow__clip0_2045_39686"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', B4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2045_48353)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2045_48353" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2045_48353)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="20" fill="#f8af18"/><g id="sunrise__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g></g></g><defs><clipPath id="sunrise__clip0_2045_48353"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', O4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2045_48358)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2045_48358" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2045_48358)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="20" fill="#f8af18"/><g id="sunset__Rays"><path fill="#f8af18" d="M61 37a3 3 0 1 1 6 0v14a3 3 0 0 1-6 0zM93.699 48.059a3 3 0 1 1 4.242 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM109 79a3 3 0 1 1 0 6H95a3 3 0 1 1 0-6zM97.941 111.698a3 3 0 0 1-4.243 4.243l-9.899-9.899a3 3 0 0 1 4.243-4.243zM61 113a3 3 0 1 1 6 0v14a3 3 0 1 1-6 0zM39.958 101.799a3 3 0 1 1 4.243 4.243l-9.9 9.899a3 3 0 1 1-4.242-4.243zM33 79a3 3 0 1 1 0 6H19a3 3 0 0 1 0-6zM44.201 57.958a3 3 0 1 1-4.243 4.243l-9.9-9.9a3 3 0 1 1 4.243-4.242z"/></g></g></g></g></g><defs><clipPath id="sunset__clip0_2045_48358"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', D4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2045_39884)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.288 14.954.668 7.07 6.81 12.594 13.891 12.592h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.322-13.26-13.611-12.942"/></g></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms-rain__clip0_2045_39884"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', R4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2045_39851)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.288 14.954.668 7.07 6.81 12.594 13.891 12.592h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.322-13.26-13.611-12.942"/></g></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms__clip0_2045_39851"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', E4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2045_48112)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="#e6effc" d="M90.389 63.086c2.295-9.204-2.648-18.95-11.38-22.604-8.744-3.658-19.181-.344-24.172 7.73-4.3-2.587-9.862-2.434-14.013.387-4.14 2.814-6.324 7.915-5.474 12.855-6.957 1.315-11.957 7.885-11.289 14.954S30.871 89.002 37.953 89h53.024C98.045 89 104 83.119 104 76.028c0-7.327-6.323-13.26-13.611-12.942"/></g></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="#202939" d="M89.402 68.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H79.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M92.758 84.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H90.4v-3.006h3.204z"/></g></g><defs><clipPath id="weather-alert__clip0_2045_48112"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', $4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer Up" fill="#d6dfe9" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(90 64 63.5)"/></g></g></g></svg>', V4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer Up" fill="#d6dfe9" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="2" fill="#475569"/></g></g></g></svg>', W4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer Up" fill="#d6dfe9" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(45 64 63.5)"/></g></g></g></svg>', I4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer Up" fill="#d6dfe9" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-45 64 63.5)"/></g></g></g></svg>', U4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer Up" fill="#d6dfe9" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-180 64 63.5)"/></g></g></g></svg>', F4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer Up" fill="#d6dfe9" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(135 64 63.5)"/></g></g></g></svg>', j4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer Up" fill="#d6dfe9" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-135 64 63.5)"/></g></g></g></svg>', G4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="40" fill="#334155"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#64748b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#64748b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#64748b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#64748b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer Up" fill="#d6dfe9" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-90 64 63.5)"/></g></g></g></svg>', Y4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"/><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"/></g></g></svg>', X4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="18" stroke="#f8af18" stroke-width="4"/><path id="clear-day__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 16a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V18a2 2 0 0 1 2-2M30.059 30.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 64a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2M41.373 86.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 1 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 96a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V98a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></svg>', K4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M58.4 34.416c-3.48 20.81 14.126 40.037 34.823 39.704C88.98 85.698 77.763 94 64.536 94 47.646 94 34 80.497 34 63.898c0-14.53 10.46-26.68 24.4-29.482"/></g></g></svg>', Z4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2045_28818)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="cloudy__clip0_2045_28818"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', J4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2045_28858)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2045_28858)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2045_28858" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2045_28858)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="#94a3b8" d="M101.194 55.562c1.173-4.512-1.434-9.14-5.69-10.849-4.312-1.732-9.543-.239-12.085 3.71-2.154-1.243-4.923-1.173-7.007.186-2.031 1.325-3.169 3.763-2.737 6.17-3.375.612-5.988 3.69-5.644 7.177.344 3.495 3.508 6.045 6.946 6.044 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.715 6.512-6.226 0-3.631-3.279-6.36-6.806-6.212"/></g></g></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="#64748b" d="M72.245 39.046a19.4 19.4 0 0 1 3.844.517 19.05 19.05 0 0 1 8.391 4.438 19.6 19.6 0 0 1 3.526 4.248 20 20 0 0 1 2.213 5.036 20 20 0 0 1 .39 1.657q.24 1.258.312 2.545a18.9 18.9 0 0 1-.533 5.616 13 13 0 0 1 2.352.114c5.591.79 10.191 5.213 11.098 10.802q.026.165.049.33a12.5 12.5 0 0 1 .109 2.02c-.168 6.383-5.162 11.719-11.385 12.525q-.805.105-1.634.106a2 2 0 0 1 0-4 9 9 0 0 0 .455-.012c2.268-.119 4.347-1.119 5.889-2.651a9.4 9.4 0 0 0 1.112-1.333 9 9 0 0 0 1.01-1.926 8.7 8.7 0 0 0 .545-2.589 8.5 8.5 0 0 0-.038-1.379 8.6 8.6 0 0 0-.54-2.196c-1.195-3.068-4.077-5.372-7.445-5.764a9 9 0 0 0-1.402-.05l-2.677.117a2 2 0 0 1-2.027-2.483l.648-2.6a14 14 0 0 0 .218-1.024 15 15 0 0 0 .222-2.396 15 15 0 0 0-.339-3.373 15.6 15.6 0 0 0-1.054-3.2q-.278-.615-.607-1.205c-1.647-2.945-4.235-5.373-7.481-6.73a15.3 15.3 0 0 0-6.059-1.17 16 16 0 0 0-2.703.262 16 16 0 0 0-5.071 1.857 15.7 15.7 0 0 0-2.233 1.553 15.3 15.3 0 0 0-2.158 2.208q-.54.679-1.003 1.428l-1.038 1.678a2 2 0 0 1-2.732.663l-1.692-1.017a8.9 8.9 0 0 0-3.62-1.211c-2.112-.233-4.298.264-6.086 1.478a8.6 8.6 0 0 0-1.005.798 9.012 9.012 0 0 0-2.043 2.802q-.135.286-.248.581a8.84 8.84 0 0 0-.483 4.678l.334 1.94a2 2 0 0 1-1.6 2.304l-1.934.365a9.6 9.6 0 0 0-1.353.36 9.8 9.8 0 0 0-1.669.76 10.1 10.1 0 0 0-2.459 1.985 10.3 10.3 0 0 0-1.088 1.438 10 10 0 0 0-.818 1.607 9.7 9.7 0 0 0-.703 3.556 9.4 9.4 0 0 0 .175 1.853 9.6 9.6 0 0 0 .706 2.174 9.9 9.9 0 0 0 1.758 2.619q.154.165.315.325a10.3 10.3 0 0 0 3.387 2.222q.636.253 1.305.419a9.6 9.6 0 0 0 2.304.279 2 2 0 0 1 0 4 13.6 13.6 0 0 1-2.603-.251c-3.6-.7-6.773-2.818-8.842-5.757q-.183-.26-.354-.527a13.8 13.8 0 0 1-1.498-3.172 13.47 13.47 0 0 1-.257-7.39c1.072-4.344 4.235-8.026 8.442-9.701a13.5 13.5 0 0 1 2.51-.73 12.7 12.7 0 0 1 .059-4.6 13 13 0 0 1 .634-2.195 12.95 12.95 0 0 1 4.78-6.05c4.152-2.82 9.714-2.973 14.015-.388a19 19 0 0 1 3.655-4.308q.161-.143.326-.28a19.4 19.4 0 0 1 2.806-1.956 20 20 0 0 1 2.686-1.288 21 21 0 0 1 1.612-.55q.409-.122.82-.225a20 20 0 0 1 4.645-.597q.428-.004.857.01"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="extreme-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="extreme-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="extreme-rain__clip0_2045_28858"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2045_28858"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', Q4 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2045_29038)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"/><path id="fog__Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"/></g></g><defs><clipPath id="fog__clip0_2045_29038"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', t3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2045_28906)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="#86c3db" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86" transform="translate(0 8)"/><path id="hail__Ice Ball 2" fill="#86c3db" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"/><path id="hail__Ice Ball 3" fill="#86c3db" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86" transform="translate(0 8)"/></g></g></g><defs><clipPath id="hail__clip0_2045_28906"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', e3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g id="humidity__Raindrop"><path id="humidity__Vector" stroke="#1d4ed8" stroke-miterlimit="10" stroke-width="4" d="M64.501 37.635c5.19 7.86 9.415 14.303 12.432 20.02C80.259 63.962 82 69.172 82 74.175 82 84.052 74.138 92 64.5 92 54.864 92 47 84.028 47 74.175c0-4.99 1.74-10.194 5.067-16.501 3.017-5.719 7.242-12.168 12.434-20.04Z"/><path id="humidity__Label" fill="#1d4ed8" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g></g></svg>', i3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2045_37842)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2045_37842)"><path id="not-available__Text_2" fill="#202939" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2045_37842"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2045_37842"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', n3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2045_28820)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2045_28820" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2045_28820)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="#f8af18"/><g id="partly-cloudy-day__Rays"><path fill="#f8af18" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2045_28820"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', s3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2045_28822)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2045_28822" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2045_28822)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="#72b9d5" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2045_28822"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', a3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2045_28840)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="rain__clip0_2045_28840"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', r3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2045_28972)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="sleet__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 16)"/><path id="sleet__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 88v3" transform="translate(0 16)"/><path id="sleet__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 88v3"/><path id="sleet__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 88v3" transform="translate(0 16)"/></g></g></g><defs><clipPath id="sleet__clip0_2045_28972"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', o3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2045_28939)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="#86c3db" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/><path id="snow__Snowflake 2" fill="#86c3db" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="snow__Snowflake 3" fill="#86c3db" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/></g></g></g><defs><clipPath id="snow__clip0_2045_28939"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', l3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2045_37653)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2045_37653" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2045_37653)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="18" stroke="#f8af18" stroke-width="4"/><path id="sunrise__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="sunrise__clip0_2045_37653"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', d3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2045_37658)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="#202939" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2045_37658" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2045_37658)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="18" stroke="#f8af18" stroke-width="4"/><path id="sunset__Rays" fill="#f8af18" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="sunset__clip0_2045_37658"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', c3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2045_29137)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.172-7.73 8.733 3.654 13.675 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.038 1.68a2 2 0 0 1-2.732.663l-1.692-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.222-5.525-13.89-12.592s4.329-13.64 11.288-14.954c-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="thunderstorms-rain__Raindrop 2" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="thunderstorms-rain__Raindrop 3" stroke="#0a5ad4" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms-rain__clip0_2045_29137"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', h3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2045_29104)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.172-7.73 8.733 3.654 13.675 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.038 1.68a2 2 0 0 1-2.732.663l-1.692-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.222-5.525-13.89-12.592s4.329-13.64 11.288-14.954c-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="#f6a823" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms__clip0_2045_29104"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', _3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2045_37401)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="#e6effc" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="#202939" d="M61.402 63.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H51.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M64.758 79.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H62.4v-3.006h3.204z"/></g></g><defs><clipPath id="weather-alert__clip0_2045_37401"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', f3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer Up" fill="#d6dfe9" d="m44.657 70.016 40.674-5.384c2.225-.295 2.225-1.97 0-2.264l-40.674-5.384c-1.011-.134-1.55 1.155-.745 1.78l5.073 3.947a1 1 0 0 1 0 1.578l-5.073 3.946c-.805.627-.266 1.915.745 1.78"/><circle id="wind-direction-e__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(90 64 63.5)"/></g></g></g></svg>', u3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer Up" fill="#d6dfe9" d="m70.516 82.843-5.384-40.674c-.295-2.225-1.97-2.225-2.264 0l-5.384 40.674c-.134 1.011 1.155 1.55 1.78.745l3.947-5.073a1 1 0 0 1 1.578 0l3.946 5.073c.626.805 1.915.266 1.78-.745"/><circle id="wind-direction-n__Holder" cx="64" cy="63.5" r="2" fill="#475569"/></g></g></g></svg>', g3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer Up" fill="#d6dfe9" d="m54.93 81.785 24.954-32.568c1.365-1.782.18-2.966-1.601-1.6L45.715 72.57c-.81.62-.28 1.913.732 1.786l6.378-.797a1 1 0 0 1 1.116 1.116l-.797 6.378c-.127 1.012 1.166 1.542 1.786.732"/><circle id="wind-direction-ne__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(45 64 63.5)"/></g></g></g></svg>', p3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer Up" fill="#d6dfe9" d="M82.285 72.57 49.717 47.616c-1.782-1.365-2.966-.18-1.6 1.601L73.07 81.785c.62.81 1.913.28 1.786-.732l-.797-6.378a1 1 0 0 1 1.116-1.116l6.378.797c1.012.127 1.542-1.165.732-1.786"/><circle id="wind-direction-nw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-45 64 63.5)"/></g></g></g></svg>', m3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer Up" fill="#d6dfe9" d="m57.484 44.157 5.384 40.674c.295 2.225 1.97 2.225 2.264 0l5.384-40.674c.134-1.011-1.155-1.55-1.78-.745l-3.947 5.073a1 1 0 0 1-1.578 0l-3.946-5.073c-.626-.805-1.915-.266-1.78.745"/><circle id="wind-direction-s__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-180 64 63.5)"/></g></g></g></svg>', w3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer Up" fill="#d6dfe9" d="m45.715 54.43 32.568 24.954c1.782 1.365 2.966.18 1.6-1.601L54.93 45.215c-.62-.81-1.913-.28-1.786.732l.797 6.378a1 1 0 0 1-1.116 1.116l-6.378-.797c-1.012-.127-1.542 1.166-.732 1.786"/><circle id="wind-direction-se__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(135 64 63.5)"/></g></g></g></svg>', v3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer Up" fill="#d6dfe9" d="M73.07 45.215 48.116 77.783c-1.365 1.782-.18 2.966 1.601 1.6L82.285 54.43c.81-.62.28-1.913-.732-1.786l-6.378.797a1 1 0 0 1-1.116-1.116l.797-6.378c.127-1.012-1.166-1.542-1.786-.732"/><circle id="wind-direction-sw__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-135 64 63.5)"/></g></g></g></svg>', y3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="38.5" stroke="#1e293b" stroke-width="3"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="#1e293b" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="#1e293b" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="#1e293b" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="#1e293b" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer Up" fill="#d6dfe9" d="m83.343 56.984-40.674 5.384c-2.225.295-2.225 1.97 0 2.264l40.674 5.384c1.011.134 1.55-1.154.745-1.78l-5.073-3.947a1 1 0 0 1 0-1.578l5.073-3.946c.805-.626.266-1.915-.745-1.78"/><circle id="wind-direction-w__Holder" cx="64" cy="63.5" r="2" fill="#475569" transform="rotate(-90 64 63.5)"/></g></g></g></svg>', b3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"/><path id="wind__Wind Line 1_2" stroke="#e2e8f0" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"/></g></g></svg>', x3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-day__clear-day"><g id="clear-day__Sun"><circle id="clear-day__Core" cx="64" cy="64" r="18" stroke="currentColor" stroke-width="4"/><path id="clear-day__Rays" fill="currentColor" fill-rule="evenodd" d="M64 16a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V18a2 2 0 0 1 2-2M30.059 30.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 64a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2M41.373 86.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 1 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 96a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V98a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></svg>', k3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="clear-night__clear-night"><g id="clear-night__Moon"><path id="clear-night__Moon_2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M58.4 34.416c-3.48 20.81 14.126 40.037 34.823 39.704C88.98 85.698 77.763 94 64.536 94 47.646 94 34 80.497 34 63.898c0-14.53 10.46-26.68 24.4-29.482"/></g></g></svg>', M3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="cloudy__cloudy" clip-path="url(#cloudy__clip0_2038_14010)"><g id="cloudy__Sky"><g id="cloudy__Clouds"><g id="cloudy__Cloud"><path id="cloudy__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="cloudy__clip0_2038_14010"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', C3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="extreme-rain__extreme-rain" clip-path="url(#extreme-rain__clip0_2038_14050)"><g id="extreme-rain__Sky"><g id="extreme-rain__Clouds" clip-path="url(#extreme-rain__clip1_2038_14050)"><g id="extreme-rain__Mask group"><mask id="extreme-rain__mask0_2038_14050" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="extreme-rain__Cloud Mask"><path id="extreme-rain__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#extreme-rain__mask0_2038_14050)"><g id="extreme-rain__Secondary Cloud"><path id="extreme-rain__Cloud" fill="currentColor" d="M101.194 55.57c1.173-4.51-1.434-9.134-5.69-10.843-4.312-1.73-9.543-.238-12.085 3.708-2.154-1.243-4.923-1.173-7.007.186-2.031 1.324-3.169 3.76-2.737 6.166-3.375.612-5.988 3.688-5.644 7.173.344 3.493 3.508 6.04 6.946 6.04 8.836 0 17.674-.007 26.511 0 3.423 0 6.512-2.713 6.512-6.222 0-3.63-3.279-6.356-6.806-6.208"/></g></g></g><g id="extreme-rain__Cloud_2"><path id="extreme-rain__Cloud_3" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="extreme-rain__Precipitation"><g id="extreme-rain__Raindrops"><path id="extreme-rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="extreme-rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="extreme-rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="extreme-rain__clip0_2038_14050"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="extreme-rain__clip1_2038_14050"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', S3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="fog__fog" clip-path="url(#fog__clip0_2038_14230)"><g id="fog__Sky"><g id="fog__Clouds"><g id="fog__Cloud"><path id="fog__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="fog__Precipitation"><path id="fog__Line 2" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 95h48"/><path id="fog__Line 1" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M40 103h48"/></g></g><defs><clipPath id="fog__clip0_2038_14230"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', P3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="hail__hail" clip-path="url(#hail__clip0_2038_14098)"><g id="hail__Sky"><g id="hail__Clouds"><g id="hail__Cloud"><path id="hail__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="hail__Precipitation"><g id="hail__Ice balls"><path id="hail__Ice Ball 1" fill="currentColor" d="M52 86a3 3 0 1 0 0 5.999A3 3 0 0 0 52 86" transform="translate(0 8)"/><path id="hail__Ice Ball 2" fill="currentColor" d="M64 86a3 3 0 1 0 0 5.999A3 3 0 0 0 64 86"/><path id="hail__Ice Ball 3" fill="currentColor" d="M76 86a3 3 0 1 0 0 5.999A3 3 0 0 0 76 86" transform="translate(0 8)"/></g></g></g><defs><clipPath id="hail__clip0_2038_14098"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', z3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="humidity__humidity"><g id="humidity__Raindrop"><path id="humidity__Vector" fill="currentColor" d="M64.5 34C52.63 52 45 63.25 45 74.175S53.726 94 64.5 94 84 85.125 84 74.175 76.37 51.975 64.5 34"/><path id="humidity__Label" fill="#fff" d="M59.867 73.936q-1.272 1.416-3.552 1.416-2.304 0-3.552-1.44-1.248-1.392-1.248-4.008t1.248-4.008 3.552-1.392 3.552 1.392q1.224 1.416 1.224 4.008 0 2.64-1.224 4.032m.432 8.424h-2.976l11.28-17.808h2.952zm-5.904-12.432q0 3.048 1.92 3.048t1.92-3.048q0-3.024-1.92-3.024t-1.92 3.024m21.84 11.016q-1.248 1.44-3.552 1.44t-3.528-1.44q-1.248-1.392-1.248-4.008t1.248-4.008q1.224-1.392 3.528-1.392t3.552 1.392q1.224 1.416 1.224 4.008 0 2.616-1.224 4.008m-3.552-7.008q-1.92 0-1.92 3.024t1.92 3.024 1.92-3.024-1.92-3.024"/></g></g></svg>', T3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="not-available__not-available" clip-path="url(#not-available__clip0_2038_25630)"><g id="not-available__Text" clip-path="url(#not-available__clip1_2038_25630)"><path id="not-available__Text_2" fill="currentColor" d="M46.853 66.166V52.504h6.072V76h-6.17l-8.152-13.596V76h-6.105V52.504h6.105zM61.94 76h-5.94l9.768-23.496h5.94zm34.951 0h-6.5l-1.32-4.026h-7.92L79.83 76H73.36l8.58-23.496h6.501zm-13.2-11.748-1.056 3.201h4.983l-1.056-3.201-1.452-4.917z"/></g></g><defs><clipPath id="not-available__clip0_2038_25630"><rect width="128" height="128" fill="#fff"/></clipPath><clipPath id="not-available__clip1_2038_25630"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', L3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-day__partly-cloudy-day" clip-path="url(#partly-cloudy-day__clip0_2038_14012)"><g id="partly-cloudy-day__Sky"><g id="partly-cloudy-day__Mask group"><mask id="partly-cloudy-day__mask0_2038_14012" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-day__Cloud Mask"><path id="partly-cloudy-day__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-day__mask0_2038_14012)"><g id="partly-cloudy-day__Sun"><circle id="partly-cloudy-day__Core" cx="39" cy="51" r="9" fill="currentColor"/><g id="partly-cloudy-day__Rays"><path fill="currentColor" d="M37.688 31.313a1.312 1.312 0 1 1 2.624 0v6.125a1.312 1.312 0 1 1-2.624 0zM51.993 36.15a1.312 1.312 0 1 1 1.856 1.857l-4.33 4.33a1.312 1.312 0 1 1-1.857-1.855zM58.688 49.688a1.312 1.312 0 1 1 0 2.624h-6.126a1.312 1.312 0 1 1 0-2.624zM53.85 63.993a1.312 1.312 0 1 1-1.857 1.856l-4.33-4.33a1.312 1.312 0 1 1 1.855-1.857zM37.688 64.563a1.312 1.312 0 1 1 2.624 0v6.124a1.312 1.312 0 1 1-2.624 0zM28.482 59.662a1.312 1.312 0 1 1 1.856 1.856l-4.331 4.331a1.312 1.312 0 1 1-1.856-1.856zM25.438 49.688a1.312 1.312 0 1 1 0 2.624h-6.125a1.312 1.312 0 1 1 0-2.624zM30.338 40.482a1.312 1.312 0 1 1-1.856 1.856l-4.331-4.331a1.312 1.312 0 1 1 1.856-1.856z"/></g></g></g></g><g id="partly-cloudy-day__Clouds"><g id="partly-cloudy-day__Cloud"><path id="partly-cloudy-day__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="partly-cloudy-day__clip0_2038_14012"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', A3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="partly-cloudy-night__partly-cloudy-night" clip-path="url(#partly-cloudy-night__clip0_2038_14014)"><g id="partly-cloudy-night__Sky"><g id="partly-cloudy-night__Mask group"><mask id="partly-cloudy-night__mask0_2038_14014" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><g id="partly-cloudy-night__Cloud Mask"><path id="partly-cloudy-night__Subtract" fill="#000" fill-rule="evenodd" d="M128 0H0v128h128zM37.952 93h53.023c9.252 0 17.023-7.647 17.023-16.972 0-8.006-5.693-14.678-13.073-16.477.437-9.65-5.25-18.942-14.374-22.759-9.444-3.95-20.485-1.18-27.02 6.446-4.96-1.642-10.55-.942-14.957 2.053-4.428 3.009-7.143 7.99-7.39 13.247-7.12 2.925-11.856 10.313-11.106 18.246.864 9.145 8.75 16.218 17.874 16.216" clip-rule="evenodd"/></g></mask><g mask="url(#partly-cloudy-night__mask0_2038_14014)"><g id="partly-cloudy-night__Moon"><path id="partly-cloudy-night__Moon_2" fill="currentColor" d="M35.766 34C29.15 34.714 24 40.241 24 46.959 24 54.16 29.918 60 37.218 60 43.37 60 48.527 55.846 50 50.23c-8.783.941-16.523-7.51-14.234-16.23"/></g></g></g><g id="partly-cloudy-night__Clouds"><g id="partly-cloudy-night__Cloud"><path id="partly-cloudy-night__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c-3.763-2.264-8.491-2.43-12.396-.546q-.837.404-1.617.933c-4.141 2.814-6.324 7.916-5.474 12.855-6.96 1.315-11.956 7.887-11.289 14.954C24.73 83.474 30.868 89 37.951 89h53.026c.884 0 1.75-.092 2.59-.267a13 13 0 0 0 4.153-1.656 13.4 13.4 0 0 0 4.024-3.83 13 13 0 0 0 1.424-2.715 12.6 12.6 0 0 0 .827-4.846c-.155-5.785-4.252-10.65-9.604-12.141a12.8 12.8 0 0 0-4.002-.46c.332-1.333.513-2.678.552-4.014.23-7.885-4.465-15.464-11.933-18.589-8.743-3.658-19.18-.344-24.17 7.73m36.14 36.785c4.888 0 9.023-4.118 9.023-8.969 0-4.375-3.35-8.11-7.578-8.828a8.8 8.8 0 0 0-1.86-.115l-2.675.116a2 2 0 0 1-2.028-2.484l.649-2.6q.17-.682.273-1.368c1.036-6.853-2.823-13.857-9.315-16.574-6.941-2.904-15.278-.248-19.227 6.142l-1.039 1.68V52a2 2 0 0 1-2.73.661l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268q-.535.365-1.005.799c-2.19 2.022-3.284 5.106-2.774 8.066l.334 1.94v.002a2 2 0 0 1-1.6 2.305l-1.934.365c-4.95.936-8.52 5.658-8.048 10.644.471 4.989 4.865 8.967 9.908 8.966z" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="partly-cloudy-night__clip0_2038_14014"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', q3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="rain__rain" clip-path="url(#rain__clip0_2038_14032)"><g id="rain__Sky"><g id="rain__Clouds"><g id="rain__Cloud"><path id="rain__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="rain__Precipitation"><g id="rain__Raindrops"><path id="rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g></g><defs><clipPath id="rain__clip0_2038_14032"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', H3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sleet__sleet" clip-path="url(#sleet__clip0_2038_14164)"><g id="sleet__Sky"><g id="sleet__Clouds"><g id="sleet__Cloud"><path id="sleet__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="sleet__Precipitation"><g id="sleet__Snowflakes"><path id="sleet__Snowflake 1" fill="currentColor" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="sleet__Snowflake 2" fill="currentColor" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 16)"/><path id="sleet__Snowflake 3" fill="currentColor" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/></g><g id="sleet__Raindrops"><path id="sleet__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 88v3" transform="translate(0 16)"/><path id="sleet__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 88v3"/><path id="sleet__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 88v3" transform="translate(0 16)"/></g></g></g><defs><clipPath id="sleet__clip0_2038_14164"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', N3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="snow__snow" clip-path="url(#snow__clip0_2038_14131)"><g id="snow__Sky"><g id="snow__Clouds"><g id="snow__Cloud"><path id="snow__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="snow__Precipitation"><g id="snow__Snowflakes"><path id="snow__Snowflake 1" fill="currentColor" d="m52.578 90.366-1.205-.689a2.9 2.9 0 0 0-.002-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 48.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/><path id="snow__Snowflake 2" fill="currentColor" d="m67.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 63.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46"/><path id="snow__Snowflake 3" fill="currentColor" d="m82.578 90.366-1.204-.689a2.9 2.9 0 0 0-.003-1.353l1.207-.69a.83.83 0 0 0 .309-1.141.85.85 0 0 0-1.153-.306l-1.206.69a2.9 2.9 0 0 0-1.184-.677v-1.38A.85.85 0 0 0 78.5 84a.843.843 0 0 0-.844.82v1.38a2.96 2.96 0 0 0-1.185.674l-1.205-.689a.848.848 0 0 0-1.259.616.83.83 0 0 0 .415.832l1.204.689c-.106.445-.105.909.003 1.353l-1.207.69a.83.83 0 0 0-.415.832.83.83 0 0 0 .62.7.85.85 0 0 0 .64-.084l1.205-.69c.334.318.74.55 1.184.675v1.382a.85.85 0 0 0 .844.82.843.843 0 0 0 .844-.82v-1.383c.441-.129.847-.36 1.184-.673l1.206.69a.847.847 0 0 0 1.259-.616.83.83 0 0 0-.415-.832m-4.712-.28a1.24 1.24 0 0 1-.622-1.25 1.25 1.25 0 0 1 .93-1.048 1.27 1.27 0 0 1 1.329.445 1.25 1.25 0 0 1 .093 1.393 1.28 1.28 0 0 1-1.73.46" transform="translate(0 8)"/></g></g></g><defs><clipPath id="snow__clip0_2038_14131"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', B3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunrise__sunrise" clip-path="url(#sunrise__clip0_2038_25429)"><g id="sunrise__Horizon"><path id="sunrise__Horizon Rise" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M37 92h16.746a6 6 0 0 0 3.95-1.484l4.329-3.787a3 3 0 0 1 3.95 0l4.328 3.787A6 6 0 0 0 74.254 92H91"/></g><g id="sunrise__Mask group"><mask id="sunrise__mask0_2038_25429" width="128" height="77" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunrise__Mask" fill="#000" d="M0 9h128v77H75.052a3 3 0 0 1-1.874-.657l-5.43-4.344a6 6 0 0 0-7.496 0l-5.43 4.344a3 3 0 0 1-1.874.657H0z"/></mask><g mask="url(#sunrise__mask0_2038_25429)"><g id="sunrise__Sun"><circle id="sunrise__Core" cx="64" cy="82" r="18" stroke="currentColor" stroke-width="4"/><path id="sunrise__Rays" fill="currentColor" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="sunrise__clip0_2038_25429"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', O3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="sunset__sunset" clip-path="url(#sunset__clip0_2038_25434)"><g id="sunset__Horizon"><path id="sunset__Horizon_2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M37 91.986h16.746a6 6 0 0 1 3.95 1.485l4.329 3.787a3 3 0 0 0 3.95 0l4.328-3.787a6 6 0 0 1 3.951-1.485H91"/></g><g id="sunset__Mask group"><mask id="sunset__mask0_2038_25434" width="128" height="83" x="0" y="9" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path id="sunset__Mask" fill="#000" d="M0 9h128v77H73.22a6 6 0 0 0-3.905 1.445L64 92l-5.315-4.555A6 6 0 0 0 54.781 86H0z"/></mask><g mask="url(#sunset__mask0_2038_25434)"><g id="sunset__Sun"><circle id="sunset__Core" cx="64" cy="82" r="18" stroke="currentColor" stroke-width="4"/><path id="sunset__Rays" fill="currentColor" fill-rule="evenodd" d="M64 34a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V36a2 2 0 0 1 2-2M30.059 48.059a2 2 0 0 1 2.828 0l8.486 8.485a2 2 0 0 1-2.829 2.829l-8.485-8.486a2 2 0 0 1 0-2.828m67.882 0a2 2 0 0 1 0 2.828l-8.485 8.486a2 2 0 0 1-2.829-2.829l8.486-8.485a2 2 0 0 1 2.828 0M16 82a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H18a2 2 0 0 1-2-2m80 0a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H98a2 2 0 0 1-2-2m-54.627 22.627a2 2 0 0 1 0 2.829l-8.486 8.485a2 2 0 0 1-2.828-2.828l8.485-8.486a2 2 0 0 1 2.829 0m45.254 0a2 2 0 0 1 2.829 0l8.485 8.486a2 2 0 1 1-2.828 2.828l-8.486-8.485a2 2 0 0 1 0-2.829M64 114a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0v-12a2 2 0 0 1 2-2" clip-rule="evenodd"/></g></g></g></g><defs><clipPath id="sunset__clip0_2038_25434"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', D3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms-rain__thunderstorms-rain" clip-path="url(#thunderstorms-rain__clip0_2038_14329)"><g id="thunderstorms-rain__Sky"><g id="thunderstorms-rain__Clouds"><g id="thunderstorms-rain__Cloud"><path id="thunderstorms-rain__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.047 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.677.116a2 2 0 0 1-2.027-2.484l.648-2.6c1.813-7.269-2.116-15.044-9.042-17.942-6.94-2.904-15.277-.248-19.226 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.083.001-13.223-5.525-13.89-12.592-.669-7.067 4.328-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="thunderstorms-rain__Precipitation"><g id="thunderstorms-rain__Raindrops"><path id="thunderstorms-rain__Raindrop 1" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M52 83v12" transform="translate(0 8)"/><path id="thunderstorms-rain__Raindrop 2" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M64 83v12"/><path id="thunderstorms-rain__Raindrop 3" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M76 83v12" transform="translate(0 8)"/></g></g><g id="thunderstorms-rain__Lightning"><path id="thunderstorms-rain__Lightning Bolt" fill="currentColor" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms-rain__clip0_2038_14329"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', R3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="thunderstorms__thunderstorms" clip-path="url(#thunderstorms__clip0_2038_14296)"><g id="thunderstorms__Sky"><g id="thunderstorms__Clouds"><g id="thunderstorms__Cloud"><path id="thunderstorms__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.683 62.767 104 68.706 104 76.028 104 83.116 98.047 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.677.116a2 2 0 0 1-2.027-2.484l.648-2.6c1.813-7.269-2.116-15.044-9.042-17.942-6.94-2.904-15.277-.248-19.226 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.083.001-13.223-5.525-13.89-12.592-.669-7.067 4.328-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="thunderstorms__Lightning"><path id="thunderstorms__Lightning Bolt" fill="currentColor" d="m60 68-8 22.91h8L56 110l20-26.727H64L72 68z"/></g></g><defs><clipPath id="thunderstorms__clip0_2038_14296"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', E3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="weather-alert__weather-alert" clip-path="url(#weather-alert__clip0_2038_25186)"><g id="weather-alert__Sky"><g id="weather-alert__Clouds"><g id="weather-alert__Cloud"><path id="weather-alert__Cloud_2" fill="currentColor" fill-rule="evenodd" d="M54.837 48.212c4.99-8.074 15.428-11.388 24.171-7.73 8.734 3.654 13.676 13.4 11.38 22.604C97.684 62.767 104 68.706 104 76.028 104 83.116 98.048 89 90.977 89a2 2 0 0 1 0-4.003c4.887 0 9.023-4.117 9.023-8.969 0-5.002-4.378-9.164-9.437-8.943l-2.676.116a2 2 0 0 1-2.028-2.484l.649-2.6c1.812-7.269-2.117-15.044-9.042-17.942-6.941-2.904-15.277-.248-19.227 6.142l-1.039 1.68a2 2 0 0 1-2.73.663l-1.693-1.018c-2.965-1.783-6.845-1.676-9.706.268-2.85 1.937-4.361 5.482-3.78 8.865l.335 1.94a2 2 0 0 1-1.6 2.307l-1.934.365c-4.95.936-8.52 5.657-8.048 10.644.471 4.99 4.866 8.967 9.908 8.966a2 2 0 0 1 0 4.003c-7.082.001-13.223-5.525-13.89-12.592-.668-7.067 4.329-13.64 11.288-14.954-.85-4.94 1.333-10.04 5.474-12.855 4.151-2.82 9.712-2.974 14.013-.387" clip-rule="evenodd"/></g></g></g><g id="weather-alert__Alert"><path id="weather-alert__Exclamation" fill="currentColor" d="M61.402 63.5c1.155-2 4.041-2 5.196 0l12.124 21c1.155 2-.288 4.5-2.598 4.5H51.876c-2.31 0-3.753-2.5-2.598-4.5z"/><path id="weather-alert__ExclamationMark" fill="#fff" d="M64.758 79.59h-1.494l-.846-5.022v-3.384h3.168v3.384zm.846 4.41H62.4v-3.006h3.204z"/></g></g><defs><clipPath id="weather-alert__clip0_2038_25186"><rect width="128" height="128" fill="#fff"/></clipPath></defs></svg>', $3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-e__wind-direction-e"><g id="wind-direction-e__Wind Direction"><circle id="wind-direction-e__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-e__Letters"><path id="wind-direction-e__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-e__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-e__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-e__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-e__Wind Direction_2"><g id="wind-direction-e__Pointer"><path id="wind-direction-e__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m85.331 64.632-40.674 5.384c-1.011.134-1.55-1.155-.745-1.78l5.073-3.947a1 1 0 0 0 0-1.578l-5.073-3.946c-.805-.627-.266-1.915.745-1.781l40.674 5.384c2.225.295 2.225 1.97 0 2.264M62.001 63.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0" clip-rule="evenodd"/></g></g></g></svg>', V3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-n__wind-direction-n"><g id="wind-direction-n__Wind Direction"><circle id="wind-direction-n__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-n__Letters"><path id="wind-direction-n__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-n__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-n__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-n__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-n__Wind Direction_2"><g id="wind-direction-n__Pointer"><path id="wind-direction-n__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m65.132 42.169 5.384 40.674c.134 1.011-1.155 1.55-1.781.745l-3.946-5.073a1 1 0 0 0-1.578 0l-3.946 5.073c-.627.805-1.915.266-1.781-.745l5.384-40.674c.294-2.225 1.97-2.225 2.264 0M64 65.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4" clip-rule="evenodd"/></g></g></g></svg>', W3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-ne__wind-direction-ne"><g id="wind-direction-ne__Wind Direction"><circle id="wind-direction-ne__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-ne__Letters"><path id="wind-direction-ne__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-ne__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-ne__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-ne__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-ne__Wind Direction_2"><g id="wind-direction-ne__Pointer"><path id="wind-direction-ne__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M79.884 49.217 54.93 81.785c-.62.81-1.913.28-1.786-.732l.797-6.378a1 1 0 0 0-1.116-1.116l-6.378.797c-1.012.127-1.542-1.166-.732-1.786l32.568-24.954c1.782-1.365 2.966-.18 1.6 1.6M62.586 64.914a2 2 0 1 0 2.828-2.829 2 2 0 0 0-2.828 2.83" clip-rule="evenodd"/></g></g></g></svg>', I3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-nw__wind-direction-nw"><g id="wind-direction-nw__Wind Direction"><circle id="wind-direction-nw__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-nw__Letters"><path id="wind-direction-nw__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-nw__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-nw__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-nw__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-nw__Wind Direction_2"><g id="wind-direction-nw__Pointer"><path id="wind-direction-nw__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M49.717 47.617 82.285 72.57c.81.62.28 1.913-.732 1.786l-6.378-.797a1 1 0 0 0-1.116 1.116l.797 6.378c.127 1.012-1.166 1.542-1.786.732L48.116 49.217c-1.365-1.782-.181-2.966 1.6-1.6m15.697 17.297a2 2 0 1 0-2.828-2.828 2 2 0 0 0 2.828 2.828" clip-rule="evenodd"/></g></g></g></svg>', U3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-s__wind-direction-s"><g id="wind-direction-s__Wind Direction"><circle id="wind-direction-s__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-s__Letters"><path id="wind-direction-s__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-s__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-s__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-s__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-s__Wind Direction_2"><g id="wind-direction-s__Pointer"><path id="wind-direction-s__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m62.868 84.831-5.384-40.674c-.134-1.011 1.155-1.55 1.781-.745l3.946 5.073a1 1 0 0 0 1.579 0l3.945-5.073c.627-.805 1.915-.266 1.781.745l-5.384 40.674c-.295 2.225-1.97 2.225-2.264 0M64 61.501a2 2 0 1 0 0 3.999 2 2 0 0 0 0-4" clip-rule="evenodd"/></g></g></g></svg>', F3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-se__wind-direction-se"><g id="wind-direction-se__Wind Direction"><circle id="wind-direction-se__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-se__Letters"><path id="wind-direction-se__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-se__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-se__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-se__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-se__Wind Direction_2"><g id="wind-direction-se__Pointer"><path id="wind-direction-se__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M78.283 79.384 45.715 54.43c-.81-.62-.28-1.913.732-1.786l6.378.797a1 1 0 0 0 1.116-1.116l-.797-6.378c-.127-1.012 1.166-1.542 1.786-.732l24.954 32.568c1.365 1.782.181 2.966-1.6 1.6M62.586 62.085a2 2 0 1 0 2.828 2.828 2 2 0 0 0-2.828-2.828" clip-rule="evenodd"/></g></g></g></svg>', j3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-sw__wind-direction-sw"><g id="wind-direction-sw__Wind Direction"><circle id="wind-direction-sw__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-sw__Letters"><path id="wind-direction-sw__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-sw__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-sw__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-sw__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-sw__Wind Direction_2"><g id="wind-direction-sw__Pointer"><path id="wind-direction-sw__Pointer_2" fill="currentColor" fill-rule="evenodd" d="M48.117 77.783 73.07 45.215c.62-.81 1.913-.28 1.786.732l-.797 6.378a1 1 0 0 0 1.116 1.116l6.378-.797c1.012-.127 1.542 1.166.732 1.786L49.717 79.384c-1.782 1.365-2.966.181-1.6-1.6m17.297-15.697a2 2 0 1 0-2.828 2.828 2 2 0 0 0 2.828-2.828" clip-rule="evenodd"/></g></g></g></svg>', G3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind-direction-w__wind-direction-w"><g id="wind-direction-w__Wind Direction"><circle id="wind-direction-w__Housing" cx="64" cy="64" r="38.5" stroke="currentColor" stroke-width="3"/><g id="wind-direction-w__Letters"><path id="wind-direction-w__North" fill="currentColor" d="M65.25 36.02v-4.14h1.84V39h-1.87l-2.47-4.12V39H60.9v-7.12h1.85z"/><path id="wind-direction-w__East" fill="currentColor" d="M92.116 65.12v1.3h3.86V68h-5.73v-7.12h5.63v1.55h-3.76v1.17h3.3v1.52z"/><path id="wind-direction-w__South" fill="currentColor" d="M64.048 97.23q-1.43 0-2.25-.65-.82-.66-.88-1.87h1.85q.07 1.02 1.32 1.02 1.09 0 1.09-.71a.5.5 0 0 0-.2-.43q-.19-.16-.65-.28l-1.4-.33q-1.84-.43-1.84-2.03 0-.98.71-1.61t2.12-.63q1.35 0 2.11.6.76.59.82 1.68h-1.81q-.12-.84-1.13-.84-.44 0-.7.18a.53.53 0 0 0-.25.46q0 .45.68.62l1.46.34q1.98.47 1.98 2.14 0 1.1-.81 1.72t-2.22.62"/><path id="wind-direction-w__West" fill="currentColor" d="m37.16 64.01.79-3.13h1.87L37.75 68h-1.8L35 63.45 34.09 68h-1.84l-2.07-7.12h1.89l.79 3.13.33 1.69.29-1.69.67-3.13h1.72l.69 3.13.28 1.66z"/></g></g><g id="wind-direction-w__Wind Direction_2"><g id="wind-direction-w__Pointer"><path id="wind-direction-w__Pointer_2" fill="currentColor" fill-rule="evenodd" d="m42.669 62.368 40.674-5.384c1.011-.134 1.55 1.155.745 1.781l-5.073 3.946a1 1 0 0 0 0 1.579l5.073 3.945c.805.627.266 1.915-.745 1.781l-40.674-5.384c-2.225-.294-2.225-1.97 0-2.264M66 63.5a2 2 0 1 0-4 0 2 2 0 0 0 4 0" clip-rule="evenodd"/></g></g></g></svg>', Y3 = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><g id="wind__wind"><g id="wind__Wind"><path id="wind__Wind Line 1" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M87.79 40.135c6.186-6.788 17.21-1.73 17.21 7.311C105 53.275 100.522 58 95 58H24"/><path id="wind__Wind Line 1_2" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4" d="M60.128 87.868C66.42 94.518 78 89.872 78 80.556 78 74.726 73.35 70 67.615 70H24"/></g></g></svg>', Zn = /* @__PURE__ */ Object.assign({
  "../assets/meteocons/animated/fill/clear-day.svg": Xl,
  "../assets/meteocons/animated/fill/clear-night.svg": Kl,
  "../assets/meteocons/animated/fill/cloudy.svg": Zl,
  "../assets/meteocons/animated/fill/extreme-rain.svg": Jl,
  "../assets/meteocons/animated/fill/fog.svg": Ql,
  "../assets/meteocons/animated/fill/hail.svg": t8,
  "../assets/meteocons/animated/fill/humidity.svg": e8,
  "../assets/meteocons/animated/fill/not-available.svg": i8,
  "../assets/meteocons/animated/fill/partly-cloudy-day.svg": n8,
  "../assets/meteocons/animated/fill/partly-cloudy-night.svg": s8,
  "../assets/meteocons/animated/fill/rain.svg": a8,
  "../assets/meteocons/animated/fill/sleet.svg": r8,
  "../assets/meteocons/animated/fill/snow.svg": o8,
  "../assets/meteocons/animated/fill/sunrise.svg": l8,
  "../assets/meteocons/animated/fill/sunset.svg": d8,
  "../assets/meteocons/animated/fill/thunderstorms-rain.svg": c8,
  "../assets/meteocons/animated/fill/thunderstorms.svg": h8,
  "../assets/meteocons/animated/fill/weather-alert.svg": _8,
  "../assets/meteocons/animated/fill/wind-direction-e.svg": f8,
  "../assets/meteocons/animated/fill/wind-direction-n.svg": u8,
  "../assets/meteocons/animated/fill/wind-direction-ne.svg": g8,
  "../assets/meteocons/animated/fill/wind-direction-nw.svg": p8,
  "../assets/meteocons/animated/fill/wind-direction-s.svg": m8,
  "../assets/meteocons/animated/fill/wind-direction-se.svg": w8,
  "../assets/meteocons/animated/fill/wind-direction-sw.svg": v8,
  "../assets/meteocons/animated/fill/wind-direction-w.svg": y8,
  "../assets/meteocons/animated/fill/wind.svg": b8,
  "../assets/meteocons/animated/flat/clear-day.svg": x8,
  "../assets/meteocons/animated/flat/clear-night.svg": k8,
  "../assets/meteocons/animated/flat/cloudy.svg": M8,
  "../assets/meteocons/animated/flat/extreme-rain.svg": C8,
  "../assets/meteocons/animated/flat/fog.svg": S8,
  "../assets/meteocons/animated/flat/hail.svg": P8,
  "../assets/meteocons/animated/flat/humidity.svg": z8,
  "../assets/meteocons/animated/flat/not-available.svg": T8,
  "../assets/meteocons/animated/flat/partly-cloudy-day.svg": L8,
  "../assets/meteocons/animated/flat/partly-cloudy-night.svg": A8,
  "../assets/meteocons/animated/flat/rain.svg": q8,
  "../assets/meteocons/animated/flat/sleet.svg": H8,
  "../assets/meteocons/animated/flat/snow.svg": N8,
  "../assets/meteocons/animated/flat/sunrise.svg": B8,
  "../assets/meteocons/animated/flat/sunset.svg": O8,
  "../assets/meteocons/animated/flat/thunderstorms-rain.svg": D8,
  "../assets/meteocons/animated/flat/thunderstorms.svg": R8,
  "../assets/meteocons/animated/flat/weather-alert.svg": E8,
  "../assets/meteocons/animated/flat/wind-direction-e.svg": $8,
  "../assets/meteocons/animated/flat/wind-direction-n.svg": V8,
  "../assets/meteocons/animated/flat/wind-direction-ne.svg": W8,
  "../assets/meteocons/animated/flat/wind-direction-nw.svg": I8,
  "../assets/meteocons/animated/flat/wind-direction-s.svg": U8,
  "../assets/meteocons/animated/flat/wind-direction-se.svg": F8,
  "../assets/meteocons/animated/flat/wind-direction-sw.svg": j8,
  "../assets/meteocons/animated/flat/wind-direction-w.svg": G8,
  "../assets/meteocons/animated/flat/wind.svg": Y8,
  "../assets/meteocons/animated/line/clear-day.svg": X8,
  "../assets/meteocons/animated/line/clear-night.svg": K8,
  "../assets/meteocons/animated/line/cloudy.svg": Z8,
  "../assets/meteocons/animated/line/extreme-rain.svg": J8,
  "../assets/meteocons/animated/line/fog.svg": Q8,
  "../assets/meteocons/animated/line/hail.svg": td,
  "../assets/meteocons/animated/line/humidity.svg": ed,
  "../assets/meteocons/animated/line/not-available.svg": id,
  "../assets/meteocons/animated/line/partly-cloudy-day.svg": nd,
  "../assets/meteocons/animated/line/partly-cloudy-night.svg": sd,
  "../assets/meteocons/animated/line/rain.svg": ad,
  "../assets/meteocons/animated/line/sleet.svg": rd,
  "../assets/meteocons/animated/line/snow.svg": od,
  "../assets/meteocons/animated/line/sunrise.svg": ld,
  "../assets/meteocons/animated/line/sunset.svg": dd,
  "../assets/meteocons/animated/line/thunderstorms-rain.svg": cd,
  "../assets/meteocons/animated/line/thunderstorms.svg": hd,
  "../assets/meteocons/animated/line/weather-alert.svg": _d,
  "../assets/meteocons/animated/line/wind-direction-e.svg": fd,
  "../assets/meteocons/animated/line/wind-direction-n.svg": ud,
  "../assets/meteocons/animated/line/wind-direction-ne.svg": gd,
  "../assets/meteocons/animated/line/wind-direction-nw.svg": pd,
  "../assets/meteocons/animated/line/wind-direction-s.svg": md,
  "../assets/meteocons/animated/line/wind-direction-se.svg": wd,
  "../assets/meteocons/animated/line/wind-direction-sw.svg": vd,
  "../assets/meteocons/animated/line/wind-direction-w.svg": yd,
  "../assets/meteocons/animated/line/wind.svg": bd,
  "../assets/meteocons/animated/monochrome/clear-day.svg": xd,
  "../assets/meteocons/animated/monochrome/clear-night.svg": kd,
  "../assets/meteocons/animated/monochrome/cloudy.svg": Md,
  "../assets/meteocons/animated/monochrome/extreme-rain.svg": Cd,
  "../assets/meteocons/animated/monochrome/fog.svg": Sd,
  "../assets/meteocons/animated/monochrome/hail.svg": Pd,
  "../assets/meteocons/animated/monochrome/humidity.svg": zd,
  "../assets/meteocons/animated/monochrome/not-available.svg": Td,
  "../assets/meteocons/animated/monochrome/partly-cloudy-day.svg": Ld,
  "../assets/meteocons/animated/monochrome/partly-cloudy-night.svg": Ad,
  "../assets/meteocons/animated/monochrome/rain.svg": qd,
  "../assets/meteocons/animated/monochrome/sleet.svg": Hd,
  "../assets/meteocons/animated/monochrome/snow.svg": Nd,
  "../assets/meteocons/animated/monochrome/sunrise.svg": Bd,
  "../assets/meteocons/animated/monochrome/sunset.svg": Od,
  "../assets/meteocons/animated/monochrome/thunderstorms-rain.svg": Dd,
  "../assets/meteocons/animated/monochrome/thunderstorms.svg": Rd,
  "../assets/meteocons/animated/monochrome/weather-alert.svg": Ed,
  "../assets/meteocons/animated/monochrome/wind-direction-e.svg": $d,
  "../assets/meteocons/animated/monochrome/wind-direction-n.svg": Vd,
  "../assets/meteocons/animated/monochrome/wind-direction-ne.svg": Wd,
  "../assets/meteocons/animated/monochrome/wind-direction-nw.svg": Id,
  "../assets/meteocons/animated/monochrome/wind-direction-s.svg": Ud,
  "../assets/meteocons/animated/monochrome/wind-direction-se.svg": Fd,
  "../assets/meteocons/animated/monochrome/wind-direction-sw.svg": jd,
  "../assets/meteocons/animated/monochrome/wind-direction-w.svg": Gd,
  "../assets/meteocons/animated/monochrome/wind.svg": Yd
}), Jn = /* @__PURE__ */ Object.assign({
  "../assets/meteocons/static/fill/clear-day.svg": Xd,
  "../assets/meteocons/static/fill/clear-night.svg": Kd,
  "../assets/meteocons/static/fill/cloudy.svg": Zd,
  "../assets/meteocons/static/fill/extreme-rain.svg": Jd,
  "../assets/meteocons/static/fill/fog.svg": Qd,
  "../assets/meteocons/static/fill/hail.svg": t4,
  "../assets/meteocons/static/fill/humidity.svg": e4,
  "../assets/meteocons/static/fill/not-available.svg": i4,
  "../assets/meteocons/static/fill/partly-cloudy-day.svg": n4,
  "../assets/meteocons/static/fill/partly-cloudy-night.svg": s4,
  "../assets/meteocons/static/fill/rain.svg": a4,
  "../assets/meteocons/static/fill/sleet.svg": r4,
  "../assets/meteocons/static/fill/snow.svg": o4,
  "../assets/meteocons/static/fill/sunrise.svg": l4,
  "../assets/meteocons/static/fill/sunset.svg": d4,
  "../assets/meteocons/static/fill/thunderstorms-rain.svg": c4,
  "../assets/meteocons/static/fill/thunderstorms.svg": h4,
  "../assets/meteocons/static/fill/weather-alert.svg": _4,
  "../assets/meteocons/static/fill/wind-direction-e.svg": f4,
  "../assets/meteocons/static/fill/wind-direction-n.svg": u4,
  "../assets/meteocons/static/fill/wind-direction-ne.svg": g4,
  "../assets/meteocons/static/fill/wind-direction-nw.svg": p4,
  "../assets/meteocons/static/fill/wind-direction-s.svg": m4,
  "../assets/meteocons/static/fill/wind-direction-se.svg": w4,
  "../assets/meteocons/static/fill/wind-direction-sw.svg": v4,
  "../assets/meteocons/static/fill/wind-direction-w.svg": y4,
  "../assets/meteocons/static/fill/wind.svg": b4,
  "../assets/meteocons/static/flat/clear-day.svg": x4,
  "../assets/meteocons/static/flat/clear-night.svg": k4,
  "../assets/meteocons/static/flat/cloudy.svg": M4,
  "../assets/meteocons/static/flat/extreme-rain.svg": C4,
  "../assets/meteocons/static/flat/fog.svg": S4,
  "../assets/meteocons/static/flat/hail.svg": P4,
  "../assets/meteocons/static/flat/humidity.svg": z4,
  "../assets/meteocons/static/flat/not-available.svg": T4,
  "../assets/meteocons/static/flat/partly-cloudy-day.svg": L4,
  "../assets/meteocons/static/flat/partly-cloudy-night.svg": A4,
  "../assets/meteocons/static/flat/rain.svg": q4,
  "../assets/meteocons/static/flat/sleet.svg": H4,
  "../assets/meteocons/static/flat/snow.svg": N4,
  "../assets/meteocons/static/flat/sunrise.svg": B4,
  "../assets/meteocons/static/flat/sunset.svg": O4,
  "../assets/meteocons/static/flat/thunderstorms-rain.svg": D4,
  "../assets/meteocons/static/flat/thunderstorms.svg": R4,
  "../assets/meteocons/static/flat/weather-alert.svg": E4,
  "../assets/meteocons/static/flat/wind-direction-e.svg": $4,
  "../assets/meteocons/static/flat/wind-direction-n.svg": V4,
  "../assets/meteocons/static/flat/wind-direction-ne.svg": W4,
  "../assets/meteocons/static/flat/wind-direction-nw.svg": I4,
  "../assets/meteocons/static/flat/wind-direction-s.svg": U4,
  "../assets/meteocons/static/flat/wind-direction-se.svg": F4,
  "../assets/meteocons/static/flat/wind-direction-sw.svg": j4,
  "../assets/meteocons/static/flat/wind-direction-w.svg": G4,
  "../assets/meteocons/static/flat/wind.svg": Y4,
  "../assets/meteocons/static/line/clear-day.svg": X4,
  "../assets/meteocons/static/line/clear-night.svg": K4,
  "../assets/meteocons/static/line/cloudy.svg": Z4,
  "../assets/meteocons/static/line/extreme-rain.svg": J4,
  "../assets/meteocons/static/line/fog.svg": Q4,
  "../assets/meteocons/static/line/hail.svg": t3,
  "../assets/meteocons/static/line/humidity.svg": e3,
  "../assets/meteocons/static/line/not-available.svg": i3,
  "../assets/meteocons/static/line/partly-cloudy-day.svg": n3,
  "../assets/meteocons/static/line/partly-cloudy-night.svg": s3,
  "../assets/meteocons/static/line/rain.svg": a3,
  "../assets/meteocons/static/line/sleet.svg": r3,
  "../assets/meteocons/static/line/snow.svg": o3,
  "../assets/meteocons/static/line/sunrise.svg": l3,
  "../assets/meteocons/static/line/sunset.svg": d3,
  "../assets/meteocons/static/line/thunderstorms-rain.svg": c3,
  "../assets/meteocons/static/line/thunderstorms.svg": h3,
  "../assets/meteocons/static/line/weather-alert.svg": _3,
  "../assets/meteocons/static/line/wind-direction-e.svg": f3,
  "../assets/meteocons/static/line/wind-direction-n.svg": u3,
  "../assets/meteocons/static/line/wind-direction-ne.svg": g3,
  "../assets/meteocons/static/line/wind-direction-nw.svg": p3,
  "../assets/meteocons/static/line/wind-direction-s.svg": m3,
  "../assets/meteocons/static/line/wind-direction-se.svg": w3,
  "../assets/meteocons/static/line/wind-direction-sw.svg": v3,
  "../assets/meteocons/static/line/wind-direction-w.svg": y3,
  "../assets/meteocons/static/line/wind.svg": b3,
  "../assets/meteocons/static/monochrome/clear-day.svg": x3,
  "../assets/meteocons/static/monochrome/clear-night.svg": k3,
  "../assets/meteocons/static/monochrome/cloudy.svg": M3,
  "../assets/meteocons/static/monochrome/extreme-rain.svg": C3,
  "../assets/meteocons/static/monochrome/fog.svg": S3,
  "../assets/meteocons/static/monochrome/hail.svg": P3,
  "../assets/meteocons/static/monochrome/humidity.svg": z3,
  "../assets/meteocons/static/monochrome/not-available.svg": T3,
  "../assets/meteocons/static/monochrome/partly-cloudy-day.svg": L3,
  "../assets/meteocons/static/monochrome/partly-cloudy-night.svg": A3,
  "../assets/meteocons/static/monochrome/rain.svg": q3,
  "../assets/meteocons/static/monochrome/sleet.svg": H3,
  "../assets/meteocons/static/monochrome/snow.svg": N3,
  "../assets/meteocons/static/monochrome/sunrise.svg": B3,
  "../assets/meteocons/static/monochrome/sunset.svg": O3,
  "../assets/meteocons/static/monochrome/thunderstorms-rain.svg": D3,
  "../assets/meteocons/static/monochrome/thunderstorms.svg": R3,
  "../assets/meteocons/static/monochrome/weather-alert.svg": E3,
  "../assets/meteocons/static/monochrome/wind-direction-e.svg": $3,
  "../assets/meteocons/static/monochrome/wind-direction-n.svg": V3,
  "../assets/meteocons/static/monochrome/wind-direction-ne.svg": W3,
  "../assets/meteocons/static/monochrome/wind-direction-nw.svg": I3,
  "../assets/meteocons/static/monochrome/wind-direction-s.svg": U3,
  "../assets/meteocons/static/monochrome/wind-direction-se.svg": F3,
  "../assets/meteocons/static/monochrome/wind-direction-sw.svg": j3,
  "../assets/meteocons/static/monochrome/wind-direction-w.svg": G3,
  "../assets/meteocons/static/monochrome/wind.svg": Y3
});
function Qn(i, t, e) {
  return `../assets/meteocons/${i}/${t}/${e}.svg`;
}
function Ht(i, t, e) {
  const n = e ? Zn : Jn, s = e ? "animated" : "static", a = n[Qn(s, t, i)];
  if (a) return a;
  const r = [
    [s, t, "not-available"],
    ["static", t, i],
    ["static", "fill", i],
    ["static", "fill", "not-available"]
  ];
  for (const [o, l, d] of r) {
    const h = (o === "animated" ? Zn : Jn)[Qn(o, l, d)];
    if (h) return h;
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="8" y="36" font-size="12">?</text></svg>';
}
function Oi(i, t) {
  if (!i) return null;
  const e = i.attributes[t];
  return typeof e == "number" ? e : typeof e == "string" && e !== "" && !Number.isNaN(Number(e)) ? Number(e) : null;
}
function Ke(i) {
  if (!i || i.state === "unknown" || i.state === "unavailable")
    return null;
  const t = Number(i.state);
  return Number.isNaN(t) ? null : t;
}
function _s(i, t = "sun.sun") {
  const e = i.states[t];
  return e ? e.state === "above_horizon" : !0;
}
function X3(i, t) {
  const e = i.states[t.entity];
  if (!e) return null;
  const n = t.temperature_entity ? i.states[t.temperature_entity] : void 0, s = t.humidity_entity ? i.states[t.humidity_entity] : void 0, a = t.wind_speed_entity ? i.states[t.wind_speed_entity] : void 0, r = t.wind_bearing_entity ? i.states[t.wind_bearing_entity] : void 0, o = i.states[t.sun_entity ?? "sun.sun"], l = Ke(n) ?? Oi(e, "temperature"), d = Ke(s) ?? Oi(e, "humidity"), c = Ke(a) ?? Oi(e, "wind_speed"), h = Ke(r) ?? e.attributes.wind_bearing ?? null, _ = o?.attributes.next_rising, f = o?.attributes.next_setting;
  return {
    name: t.name ?? e.attributes.friendly_name ?? t.entity,
    condition: e.state,
    temperature: l,
    humidity: d,
    windSpeed: c,
    windBearing: h,
    temperatureUnit: e.attributes.temperature_unit ?? i.config.unit_system.temperature ?? "°C",
    windSpeedUnit: e.attributes.wind_speed_unit ?? i.config.unit_system.wind_speed ?? "km/h",
    isDay: _s(i, t.sun_entity ?? "sun.sun"),
    sunrise: _ ?? null,
    sunset: f ?? null
  };
}
async function K3(i, t, e) {
  try {
    return (await i.callWS({
      type: "weather/get_forecasts",
      entity_id: t,
      forecast_type: e
    }))?.[t]?.forecast ?? [];
  } catch {
    return i.states[t]?.attributes.forecast ?? [];
  }
}
function Z3(i, t, e = 0) {
  return i == null || Number.isNaN(i) ? "—" : `${i.toFixed(e)}${t}`;
}
function t0(i, t) {
  if (!i) return "—";
  try {
    return new Intl.DateTimeFormat(t ?? void 0, {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(i));
  } catch {
    return i;
  }
}
function J3(i, t, e) {
  return !e.showIcons && !e.showWind ? q : E`
    <div class="forecast-row" style="--cols: ${t.length}">
      ${t.map((n) => {
    const s = e.mode === "hourly" ? new Date(n.datetime).getHours() >= 6 && new Date(n.datetime).getHours() < 20 : _s(i), a = ds(n.condition, s), r = Ht(a, e.iconStyle, e.animated), o = cs(n.wind_bearing), l = Ht(
      o,
      e.iconStyle,
      e.animated
    );
    return E`
          <div class="forecast-col">
            ${e.showIcons ? E`<div class="forecast-icon" .innerHTML=${r}></div>` : q}
            ${e.showWind ? E`
                  <div class="forecast-wind">
                    <span class="wind-icon" .innerHTML=${l}></span>
                    <span class="wind-meta">
                      ${hs(n.wind_bearing)}
                      ${n.wind_speed != null ? E`${Math.round(n.wind_speed)}` : "—"}
                    </span>
                  </div>
                ` : q}
          </div>
        `;
  })}
    </div>
  `;
}
const e0 = {
  show_condition_icons: !0,
  show_wind: !0,
  precip_type: "rainfall"
}, ft = {
  layout: "basic",
  icon_style: "fill",
  animated_icons: !0,
  animated_background: !1,
  show_sun: !1,
  show_wind_speed: !1,
  show_wind_direction: !1,
  show_humidity: !1,
  sun_entity: "sun.sun",
  daily: {
    ...e0,
    days: 5
  },
  hourly: {
    ...e0,
    hours: 24
  }
};
function ji(i) {
  if (!i.entity)
    throw new Error("Please define a weather entity");
  const t = {
    ...ft.daily,
    ...i.daily ?? {}
  }, e = {
    ...ft.hourly,
    ...i.hourly ?? {}
  }, n = i.forecast;
  return n && (n.days != null && (t.days = n.days), n.hours != null && (e.hours = n.hours), n.show_condition_icons != null && (t.show_condition_icons = n.show_condition_icons, e.show_condition_icons = n.show_condition_icons), n.show_wind != null && (t.show_wind = n.show_wind, e.show_wind = n.show_wind), n.precip_type != null && (t.precip_type = n.precip_type, e.precip_type = n.precip_type)), {
    ...ft,
    ...i,
    entity: i.entity,
    daily: t,
    hourly: e,
    layout: i.layout ?? ft.layout,
    icon_style: i.icon_style ?? ft.icon_style,
    animated_icons: i.animated_icons ?? ft.animated_icons,
    animated_background: i.animated_background ?? ft.animated_background
  };
}
var Q3 = Object.defineProperty, t6 = Object.getOwnPropertyDescriptor, qe = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? t6(t, e) : t, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (s = (n ? r(t, e, s) : r(s)) || s);
  return n && s && Q3(t, e, s), s;
};
let $t = class extends Gt {
  constructor() {
    super(...arguments), this._forecast = [], this._forecastError = null, this._chart = null, this._forecastKey = "";
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => s6), document.createElement(
      "vedurkort-weather-card-editor"
    );
  }
  static getStubConfig(i, t) {
    const e = t.find((n) => n.startsWith("weather."));
    return {
      ...ft,
      entity: e ?? "weather.home"
    };
  }
  setConfig(i) {
    this._config = ji(i);
  }
  getCardSize() {
    return !this._config || this._config.layout === "basic" ? 3 : 6;
  }
  updated(i) {
    (i.has("hass") || i.has("_config")) && this._config && this.hass && this._loadForecastIfNeeded(), (i.has("_forecast") || i.has("_config") || i.has("hass")) && this.updateComplete.then(() => this._renderChart());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._destroyChart();
  }
  async _loadForecastIfNeeded() {
    const i = this._config.layout;
    if (i === "basic") {
      this._forecast = [], this._forecastKey = "";
      return;
    }
    const t = `${this._config.entity}:${i}`;
    if (!(t === this._forecastKey && this._forecast.length)) {
      this._forecastKey = t;
      try {
        this._forecast = await K3(
          this.hass,
          this._config.entity,
          i === "daily" ? "daily" : "hourly"
        ), this._forecastError = null;
      } catch (e) {
        this._forecast = [], this._forecastError = e instanceof Error ? e.message : "Failed to load forecast";
      }
    }
  }
  _destroyChart() {
    this._chart?.destroy(), this._chart = null;
  }
  _renderChart() {
    const i = this.renderRoot.querySelector(
      "canvas.forecast-canvas"
    );
    if (!i || !this._config || this._config.layout === "basic") {
      this._destroyChart();
      return;
    }
    const t = this.hass.locale?.language ?? this.hass.config.language, e = this._config.layout === "daily" ? jl(
      this._forecast,
      this._config.daily.days,
      this._config.daily.precip_type,
      t
    ) : Gl(
      this._forecast,
      this._config.hourly.hours,
      this._config.hourly.precip_type,
      t
    );
    this._destroyChart(), e.labels.length && (this._chart = Yl(
      i,
      e,
      this._config.layout === "daily" ? "daily" : "hourly",
      this._config.layout === "daily" ? this._config.daily.precip_type : this._config.hourly.precip_type
    ));
  }
  render() {
    if (!this._config)
      return E``;
    if (!this.hass)
      return E`<ha-card><div class="pad">Waiting for Home Assistant…</div></ha-card>`;
    const i = X3(this.hass, this._config);
    if (!i)
      return E`
        <ha-card>
          <div class="pad warn">
            Entity not found: <code>${this._config.entity}</code>
          </div>
        </ha-card>
      `;
    const t = ds(i.condition, i.isDay), e = Ht(
      t,
      this._config.icon_style,
      this._config.animated_icons
    ), n = Ds(i.condition, i.isDay), s = this.hass.locale?.language ?? this.hass.config.language, a = this._config.show_sun || this._config.show_humidity || this._config.show_wind_speed || this._config.show_wind_direction, r = this._config.layout === "daily" ? this._config.daily : this._config.layout === "hourly" ? this._config.hourly : null, o = this._config.layout === "daily" ? this._forecast.slice(0, this._config.daily.days) : this._config.layout === "hourly" ? this._forecast.slice(0, this._config.hourly.hours) : [];
    return E`
      <ha-card class=${this._config.animated_background ? "has-bg" : ""}>
        ${Rs(this._config.animated_background, n)}
        <div class="content">
          <div class="main">
            <div class="main-text">
              <div class="location">${i.name}</div>
              <div class="condition">${i.condition.replace(/-/g, " ")}</div>
              <div class="temp">
                ${Z3(i.temperature, i.temperatureUnit)}
              </div>
            </div>
            <div class="main-icon" .innerHTML=${e}></div>
          </div>

          ${a ? E`
                <div class="details">
                  ${this._config.show_sun ? E`
                        <div class="detail">
                          <span
                            class="detail-icon"
                            .innerHTML=${Ht(
      "sunrise",
      this._config.icon_style,
      this._config.animated_icons
    )}
                          ></span>
                          <span>${t0(i.sunrise, s)}</span>
                          <span
                            class="detail-icon"
                            .innerHTML=${Ht(
      "sunset",
      this._config.icon_style,
      this._config.animated_icons
    )}
                          ></span>
                          <span>${t0(i.sunset, s)}</span>
                        </div>
                      ` : q}
                  ${this._config.show_humidity ? E`
                        <div class="detail">
                          <span
                            class="detail-icon"
                            .innerHTML=${Ht(
      "humidity",
      this._config.icon_style,
      this._config.animated_icons
    )}
                          ></span>
                          <span
                            >${i.humidity != null ? `${Math.round(i.humidity)}%` : "—"}</span
                          >
                        </div>
                      ` : q}
                  ${this._config.show_wind_speed || this._config.show_wind_direction ? E`
                        <div class="detail">
                          ${this._config.show_wind_direction ? E`<span
                                class="detail-icon"
                                .innerHTML=${Ht(
      cs(
        i.windBearing ?? void 0
      ),
      this._config.icon_style,
      this._config.animated_icons
    )}
                              ></span>` : q}
                          ${this._config.show_wind_direction ? E`<span
                                >${hs(
      i.windBearing ?? void 0
    )}</span
                              >` : q}
                          ${this._config.show_wind_speed ? E`<span
                                >${i.windSpeed != null ? `${Math.round(i.windSpeed)} ${i.windSpeedUnit}` : "—"}</span
                              >` : q}
                        </div>
                      ` : q}
                </div>
              ` : q}

          ${r ? E`
                <div class="forecast">
                  ${this._forecastError ? E`<div class="warn">${this._forecastError}</div>` : q}
                  ${!this._forecastError && !o.length ? E`<div class="warn">No forecast data available</div>` : q}
                  ${o.length ? E`
                        <div class="chart-wrap">
                          <canvas class="forecast-canvas"></canvas>
                        </div>
                        ${J3(this.hass, o, {
      showIcons: r.show_condition_icons,
      showWind: r.show_wind,
      iconStyle: this._config.icon_style,
      animated: this._config.animated_icons,
      windSpeedUnit: i.windSpeedUnit,
      mode: this._config.layout === "daily" ? "daily" : "hourly"
    })}
                      ` : q}
                </div>
              ` : q}
        </div>
      </ha-card>
    `;
  }
};
$t.styles = [
  Es,
  Xi`
      :host {
        display: block;
      }
      ha-card {
        position: relative;
        overflow: hidden;
      }
      ha-card.has-bg {
        color: #fff;
        --primary-text-color: #fff;
        --secondary-text-color: rgba(255, 255, 255, 0.85);
      }
      .content {
        position: relative;
        z-index: 1;
        padding: 16px;
      }
      .pad {
        padding: 16px;
      }
      .warn {
        opacity: 0.9;
        font-size: 0.9rem;
      }
      .main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .location {
        font-size: 1.05rem;
        font-weight: 600;
        opacity: 0.95;
      }
      .condition {
        text-transform: capitalize;
        opacity: 0.8;
        font-size: 0.95rem;
      }
      .temp {
        font-size: 2.4rem;
        font-weight: 650;
        line-height: 1.1;
        margin-top: 4px;
      }
      .main-icon {
        width: 96px;
        height: 96px;
        flex-shrink: 0;
      }
      .main-icon svg {
        width: 100%;
        height: 100%;
      }
      .details {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        margin-top: 14px;
        font-size: 0.9rem;
        opacity: 0.95;
      }
      .detail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .detail-icon {
        width: 22px;
        height: 22px;
        display: inline-flex;
      }
      .detail-icon svg {
        width: 100%;
        height: 100%;
      }
      .forecast {
        margin-top: 16px;
      }
      .chart-wrap {
        height: 180px;
        width: 100%;
      }
      .forecast-row {
        display: grid;
        grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
        gap: 4px;
        margin-top: 8px;
      }
      .forecast-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .forecast-icon {
        width: 36px;
        height: 36px;
      }
      .forecast-icon svg,
      .wind-icon svg {
        width: 100%;
        height: 100%;
      }
      .forecast-wind {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .wind-icon {
        width: 20px;
        height: 20px;
      }
      .wind-meta {
        font-size: 0.7rem;
        opacity: 0.85;
        text-align: center;
        line-height: 1.2;
      }
    `
];
qe([
  t1({ attribute: !1 })
], $t.prototype, "hass", 2);
qe([
  _i()
], $t.prototype, "_config", 2);
qe([
  _i()
], $t.prototype, "_forecast", 2);
qe([
  _i()
], $t.prototype, "_forecastError", 2);
$t = qe([
  o0("vedurkort-weather-card")
], $t);
console.info(
  "%c VEÐURKORT-WEATHER-CARD %c loaded ",
  "background:#0b6bcb;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#222;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px"
);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "vedurkort-weather-card",
  name: "Veðurkort Weather Card",
  description: "Weather card with animated Meteocons icons, optional CSS backgrounds, and Chart.js forecasts",
  preview: !0,
  documentationURL: "https://github.com/tempi-marathon/vedurkort-weather-card"
});
const e6 = ["fill", "flat", "line", "monochrome"];
var i6 = Object.defineProperty, n6 = Object.getOwnPropertyDescriptor, m1 = (i, t, e, n) => {
  for (var s = n > 1 ? void 0 : n ? n6(t, e) : t, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (s = (n ? r(t, e, s) : r(s)) || s);
  return n && s && i6(t, e, s), s;
};
let ee = class extends Gt {
  setConfig(i) {
    this._config = ji({
      ...ft,
      entity: i.entity ?? "weather.home",
      ...i
    });
  }
  _fire(i) {
    this._config = i, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: i },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _value(i) {
    const t = i.target, e = t.getAttribute("data-config");
    if (!e || !this._config) return;
    const n = structuredClone(this._config), s = (r, o) => {
      const l = r.split(".");
      let d = n;
      for (let c = 0; c < l.length - 1; c++) {
        const h = l[c];
        d[h] = { ...d[h] }, d = d[h];
      }
      d[l[l.length - 1]] = o;
    };
    let a;
    t instanceof HTMLInputElement && t.type === "checkbox" ? a = t.checked : t instanceof HTMLInputElement && t.type === "number" ? a = Number(t.value) : a = t.value, s(e, a === "" ? void 0 : a), this._fire(ji(n));
  }
  render() {
    if (!this._config) return E``;
    const i = this._config;
    return E`
      <div class="form">
        <label>
          Weather entity
          <input
            type="text"
            .value=${i.entity}
            data-config="entity"
            @change=${this._value}
            placeholder="weather.home"
          />
        </label>

        <label>
          Layout
          <select
            .value=${i.layout}
            data-config="layout"
            @change=${this._value}
          >
            <option value="basic">basic</option>
            <option value="daily">daily</option>
            <option value="hourly">hourly</option>
          </select>
        </label>

        <label>
          Name (optional)
          <input
            type="text"
            .value=${i.name ?? ""}
            data-config="name"
            @change=${this._value}
          />
        </label>

        <label>
          Icon style
          <select
            .value=${i.icon_style}
            data-config="icon_style"
            @change=${this._value}
          >
            ${e6.map(
      (t) => E`<option value=${t}>${t}</option>`
    )}
          </select>
        </label>

        <label class="row">
          <input
            type="checkbox"
            .checked=${i.animated_icons}
            data-config="animated_icons"
            @change=${this._value}
          />
          Animated icons
        </label>

        <label class="row">
          <input
            type="checkbox"
            .checked=${i.animated_background}
            data-config="animated_background"
            @change=${this._value}
          />
          Animated background
        </label>

        <fieldset>
          <legend>Details</legend>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.show_sun}
              data-config="show_sun"
              @change=${this._value}
            />
            Sunrise / sunset
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.show_humidity}
              data-config="show_humidity"
              @change=${this._value}
            />
            Humidity
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.show_wind_speed}
              data-config="show_wind_speed"
              @change=${this._value}
            />
            Wind speed
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.show_wind_direction}
              data-config="show_wind_direction"
              @change=${this._value}
            />
            Wind direction
          </label>
        </fieldset>

        <fieldset>
          <legend>Optional sensors</legend>
          <label>
            Temperature entity
            <input
              type="text"
              .value=${i.temperature_entity ?? ""}
              data-config="temperature_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Humidity entity
            <input
              type="text"
              .value=${i.humidity_entity ?? ""}
              data-config="humidity_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Wind speed entity
            <input
              type="text"
              .value=${i.wind_speed_entity ?? ""}
              data-config="wind_speed_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Wind bearing entity
            <input
              type="text"
              .value=${i.wind_bearing_entity ?? ""}
              data-config="wind_bearing_entity"
              @change=${this._value}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Daily forecast</legend>
          <label>
            Days
            <input
              type="number"
              min="1"
              max="14"
              .value=${String(i.daily.days)}
              data-config="daily.days"
              @change=${this._value}
            />
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.daily.show_condition_icons}
              data-config="daily.show_condition_icons"
              @change=${this._value}
            />
            Condition icons
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.daily.show_wind}
              data-config="daily.show_wind"
              @change=${this._value}
            />
            Wind
          </label>
          <label>
            Precipitation
            <select
              .value=${i.daily.precip_type}
              data-config="daily.precip_type"
              @change=${this._value}
            >
              <option value="rainfall">rainfall</option>
              <option value="probability">probability</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Hourly forecast</legend>
          <label>
            Hours
            <input
              type="number"
              min="1"
              max="48"
              .value=${String(i.hourly.hours)}
              data-config="hourly.hours"
              @change=${this._value}
            />
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.hourly.show_condition_icons}
              data-config="hourly.show_condition_icons"
              @change=${this._value}
            />
            Condition icons
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${i.hourly.show_wind}
              data-config="hourly.show_wind"
              @change=${this._value}
            />
            Wind
          </label>
          <label>
            Precipitation
            <select
              .value=${i.hourly.precip_type}
              data-config="hourly.precip_type"
              @change=${this._value}
            >
              <option value="rainfall">rainfall</option>
              <option value="probability">probability</option>
            </select>
          </label>
        </fieldset>
      </div>
    `;
  }
};
ee.styles = Xi`
    .form {
      display: grid;
      gap: 12px;
      padding: 4px 0 16px;
    }
    label {
      display: grid;
      gap: 4px;
      font-size: 0.9rem;
    }
    label.row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    input[type="text"],
    input[type="number"],
    select {
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, inherit);
    }
    fieldset {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 10px 12px;
      display: grid;
      gap: 10px;
    }
    legend {
      padding: 0 6px;
      font-weight: 600;
    }
  `;
m1([
  t1({ attribute: !1 })
], ee.prototype, "hass", 2);
m1([
  _i()
], ee.prototype, "_config", 2);
ee = m1([
  o0("vedurkort-weather-card-editor")
], ee);
const s6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get VedurkortWeatherCardEditor() {
    return ee;
  }
}, Symbol.toStringTag, { value: "Module" }));
//# sourceMappingURL=vedurkort-weather-card.js.map
