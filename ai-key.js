/* ai-key.js — assistant IA « apporte ta clé » commun aux apps CERDIA.
   La clé Anthropic est saisie par l'usager, gardée UNIQUEMENT sur l'appareil (localStorage),
   et envoyée seulement à api.anthropic.com. Aucun serveur intermédiaire.
   Configuration avant le chargement : window.AIK_CONFIG = {
     app: "Nom", system: "consignes", color: "#hex", onColor: "#hex",
     chips: [{ fr, en, prompt: string | () => string }], context: () => "texte ajouté au message" }
   API : AIK.ask(prompt, { system, json, maxTokens }) → texte ; AIK.open(prompt?) ; AIK.hasKey() */
(function () {
  "use strict";
  const C = window.AIK_CONFIG || {};
  const KEY = "aik.key", MODEL = "aik.model", HIST = "aik.hist:" + (C.app || location.host);
  const MODELS = [["claude-sonnet-5-5", "Sonnet 5.5"], ["claude-opus-5-5", "Opus 5.5"], ["claude-haiku-5-5", "Haiku 5.5"]];
  const lang = (document.documentElement.lang || navigator.language || "fr").slice(0, 2).toLowerCase() === "en" ? "en" : "fr";
  const T = lang === "fr" ? {
    btn: "IA", title: "Assistant IA", ph: "Pose ta question…", send: "Envoyer", settings: "Réglages IA", key: "Ta clé API Anthropic",
    keyHelp: "Crée une clé sur console.anthropic.com › API keys. Elle reste sur cet appareil et n'est envoyée qu'à Anthropic. L'utilisation est facturée sur ton compte Anthropic.",
    model: "Modèle", save: "Enregistrer", test: "Tester", del: "Effacer la clé", ok: "Clé valide ✓", saved: "Enregistré", nokey: "Ajoute ta clé IA dans les réglages (⚙) pour activer l'assistant.",
    bad: "Clé refusée par Anthropic. Vérifie-la dans les réglages.", rate: "Trop de requêtes, réessaie dans un instant.", net: "Pas de connexion à l'IA. Vérifie Internet.",
    clear: "Effacer la conversation", close: "Fermer", thinking: "Réflexion…" }
    : {
    btn: "AI", title: "AI assistant", ph: "Ask your question…", send: "Send", settings: "AI settings", key: "Your Anthropic API key",
    keyHelp: "Create a key at console.anthropic.com › API keys. It stays on this device and is only sent to Anthropic. Usage is billed to your Anthropic account.",
    model: "Model", save: "Save", test: "Test", del: "Delete key", ok: "Key works ✓", saved: "Saved", nokey: "Add your AI key in settings (⚙) to turn on the assistant.",
    bad: "Anthropic rejected the key. Check it in settings.", rate: "Too many requests, try again shortly.", net: "Can't reach the AI. Check your connection.",
    clear: "Clear conversation", close: "Close", thinking: "Thinking…" };
  const get = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const set = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} };
  const hasKey = () => !!get(KEY, "");
  const err = (code) => { const e = new Error(code); e.code = code; return e; };

  async function call(messages, opt) {
    const key = get(KEY, "");
    if (!key) throw err("nokey");
    let r;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: get(MODEL, MODELS[0][0]), max_tokens: (opt && opt.maxTokens) || 1500, system: (opt && opt.system) || C.system || "", messages }),
      });
    } catch (e) { throw err("net"); }
    if (r.status === 401 || r.status === 403) throw err("bad");
    if (r.status === 429 || r.status === 529) throw err("rate");
    if (!r.ok) { let m = "http " + r.status; try { const j = await r.json(); m = (j.error && j.error.message) || m; } catch (e) {} throw err(m); }
    const d = await r.json();
    return (d.content || []).map((c) => c.text || "").join("");
  }
  async function ask(prompt, opt) {
    const txt = await call([{ role: "user", content: prompt }], opt);
    if (opt && opt.json) return JSON.parse(txt.replace(/```json|```/g, "").trim());
    return txt;
  }

  /* ------------------------------------------------------------- interface */
  const COL = C.color || "#1F3B73", ON = C.onColor || "#fff";
  const css = `.aik-fab{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(${C.fabBottom || 84}px + env(safe-area-inset-bottom,0px));z-index:2147482000;border:0;border-radius:999px;background:${COL};color:${ON};font:700 14px/1 system-ui,-apple-system,sans-serif;padding:12px 15px;box-shadow:0 6px 20px rgba(0,0,0,.28);cursor:pointer;display:flex;gap:6px;align-items:center}
.aik-panel{position:fixed;inset:0;z-index:2147482500;background:rgba(10,14,22,.45);display:flex;align-items:flex-end;justify-content:center;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.aik-panel[hidden]{display:none!important}
.aik-box{width:100%;max-width:640px;height:min(88vh,760px);background:#fff;color:#16202e;border-radius:16px 16px 0 0;display:flex;flex-direction:column;overflow:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){.aik-box{background:#141a24;color:#e6e9f0}.aik-msg.a{background:#1f2836}.aik-in textarea,.aik-set input,.aik-set select{background:#0f141c;color:#e6e9f0;border-color:#334}}
.aik-head{display:flex;align-items:center;gap:8px;padding:12px 14px;background:${COL};color:${ON}}
.aik-head b{flex:1;font-size:16px}.aik-head button{background:rgba(255,255,255,.16);color:${ON};border:0;border-radius:8px;padding:7px 10px;font-size:14px;cursor:pointer}
.aik-log{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.aik-msg{max-width:92%;padding:10px 12px;border-radius:12px;line-height:1.45;font-size:15px;overflow-wrap:anywhere}
.aik-msg.u{align-self:flex-end;background:${COL};color:${ON}}.aik-msg.a{align-self:flex-start;background:#f0f2f6}
.aik-msg.n{align-self:center;background:transparent;color:#8a93a3;font-size:13px;text-align:center}
.aik-msg ul{margin:4px 0;padding-left:18px}.aik-msg p{margin:0 0 6px}.aik-msg p:last-child{margin:0}
.aik-chips{display:flex;gap:6px;overflow-x:auto;padding:0 14px 8px}.aik-chips button{flex:none;border:1px solid #c8cfda;background:transparent;color:inherit;border-radius:999px;padding:6px 11px;font-size:13px;cursor:pointer;white-space:nowrap}
.aik-in{display:flex;gap:8px;padding:8px 14px 12px;border-top:1px solid rgba(128,128,128,.25)}
.aik-in textarea{flex:1;min-width:0;resize:none;height:46px;max-height:120px;border:1px solid #c8cfda;border-radius:10px;padding:10px;font:15px/1.35 inherit}
.aik-in button{border:0;border-radius:10px;background:${COL};color:${ON};font-weight:700;padding:0 14px;cursor:pointer}
.aik-set{padding:14px;display:grid;gap:10px;overflow-y:auto}.aik-set[hidden]{display:none!important}.aik-set label{font-weight:600;font-size:14px}
.aik-set input,.aik-set select{width:100%;padding:10px;border:1px solid #c8cfda;border-radius:8px;font:15px inherit}
.aik-set p{margin:0;font-size:13px;color:#7a8394;line-height:1.4}.aik-set .row{display:flex;gap:8px;flex-wrap:wrap}
.aik-set .row button{border:1px solid #c8cfda;background:transparent;color:inherit;border-radius:8px;padding:9px 12px;cursor:pointer}.aik-set .row button.pri{background:${COL};color:${ON};border-color:${COL}}
.aik-stat{font-size:14px;font-weight:600}`;
  let panel, log, ta, setBox, hist = [];
  try { hist = JSON.parse(get(HIST, "[]")) || []; } catch (e) { hist = []; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function md(s) {
    const lines = esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").split(/\n/);
    let out = "", inList = false;
    lines.forEach((l) => {
      const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { if (!inList) { out += "<ul>"; inList = true; } out += "<li>" + m[1] + "</li>"; return; }
      if (inList) { out += "</ul>"; inList = false; }
      if (l.trim()) out += "<p>" + l.replace(/^#+\s*/, "") + "</p>";
    });
    return out + (inList ? "</ul>" : "");
  }
  function addMsg(role, text) {
    const d = document.createElement("div");
    d.className = "aik-msg " + role;
    if (role === "a") d.innerHTML = md(text); else d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function build() {
    if (panel) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const fab = document.createElement("button");
    fab.className = "aik-fab"; fab.type = "button"; fab.innerHTML = "✨ " + T.btn; fab.setAttribute("aria-label", T.title);
    fab.onclick = () => open();
    document.body.appendChild(fab);
    panel = document.createElement("div"); panel.className = "aik-panel"; panel.hidden = true;
    panel.innerHTML = `<div class="aik-box" role="dialog" aria-label="${esc(T.title)}">
      <div class="aik-head"><b>✨ ${esc(C.app ? C.app + " · " : "")}${esc(T.title)}</b><button data-a="clear" title="${esc(T.clear)}">🗑</button><button data-a="set" title="${esc(T.settings)}">⚙</button><button data-a="close" aria-label="${esc(T.close)}">✕</button></div>
      <div class="aik-log"></div>
      <div class="aik-set" hidden>
        <label for="aikKey">${esc(T.key)}</label><input id="aikKey" type="password" autocomplete="off" placeholder="sk-ant-…">
        <p>${esc(T.keyHelp)}</p>
        <label for="aikModel">${esc(T.model)}</label><select id="aikModel">${MODELS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>
        <div class="row"><button class="pri" data-a="save">${esc(T.save)}</button><button data-a="test">${esc(T.test)}</button><button data-a="del">${esc(T.del)}</button></div>
        <div class="aik-stat" id="aikStat"></div>
      </div>
      <div class="aik-chips"></div>
      <div class="aik-in"><textarea placeholder="${esc(T.ph)}" rows="1"></textarea><button data-a="send">${esc(T.send)}</button></div></div>`;
    document.body.appendChild(panel);
    log = panel.querySelector(".aik-log"); ta = panel.querySelector("textarea"); setBox = panel.querySelector(".aik-set");
    panel.addEventListener("click", (e) => {
      if (e.target === panel) return close();
      const b = e.target.closest("[data-a]"); if (!b) return;
      const a = b.dataset.a;
      if (a === "close") close();
      if (a === "set") toggleSet();
      if (a === "send") send();
      if (a === "clear") { hist = []; set(HIST, ""); log.innerHTML = ""; hello(); }
      if (a === "save") { set(KEY, panel.querySelector("#aikKey").value.trim()); set(MODEL, panel.querySelector("#aikModel").value); stat(T.saved); hello(true); }
      if (a === "del") { set(KEY, ""); panel.querySelector("#aikKey").value = ""; stat(""); hello(true); }
      if (a === "test") { set(KEY, panel.querySelector("#aikKey").value.trim()); set(MODEL, panel.querySelector("#aikModel").value); stat("…"); ask("Reply with OK.", { maxTokens: 5, system: "" }).then(() => stat(T.ok)).catch((x) => stat(msgErr(x))); }
    });
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
    paintChips(); hello();
  }
  function stat(s) { const el = panel.querySelector("#aikStat"); if (el) el.textContent = s; }
  function toggleSet(force) {
    const show = force !== undefined ? force : setBox.hidden;
    setBox.hidden = !show; log.hidden = show;
    panel.querySelector("#aikKey").value = get(KEY, ""); panel.querySelector("#aikModel").value = get(MODEL, MODELS[0][0]);
  }
  function hello(reset) {
    if (reset) log.innerHTML = "";
    if (!log.children.length) {
      hist.forEach((m) => addMsg(m.role === "user" ? "u" : "a", m.content));
      if (!hasKey()) addMsg("n", T.nokey);
    }
  }
  function paintChips() {
    const box = panel.querySelector(".aik-chips"); box.innerHTML = "";
    (C.chips || []).forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = lang === "fr" ? c.fr : (c.en || c.fr);
      b.onclick = () => { const p = typeof c.prompt === "function" ? c.prompt() : c.prompt; if (p) send(p); };
      box.appendChild(b);
    });
  }
  const msgErr = (x) => x && x.code === "nokey" ? T.nokey : x && x.code === "bad" ? T.bad : x && x.code === "rate" ? T.rate : x && x.code === "net" ? T.net : String((x && x.message) || x);
  let busy = false;
  async function send(text) {
    const q = (text || ta.value).trim(); if (!q || busy) return;
    if (!hasKey()) { addMsg("n", T.nokey); toggleSet(true); return; }
    ta.value = ""; addMsg("u", q);
    const ctx = typeof C.context === "function" ? C.context() : "";
    hist.push({ role: "user", content: q });
    const msgs = hist.slice(-16).map((m, i, arr) => (i === arr.length - 1 && ctx) ? { role: m.role, content: m.content + "\n\n[Contexte de l'app : " + ctx + "]" } : m);
    const wait = addMsg("n", T.thinking); busy = true;
    try {
      const a = await call(msgs);
      wait.remove(); addMsg("a", a); hist.push({ role: "assistant", content: a });
      set(HIST, JSON.stringify(hist.slice(-30)));
    } catch (x) { wait.remove(); hist.pop(); addMsg("n", msgErr(x)); if (x.code === "bad" || x.code === "nokey") toggleSet(true); }
    busy = false;
  }
  function open(prompt) { build(); panel.hidden = false; toggleSet(false); paintChips(); if (prompt) send(prompt); else setTimeout(() => { try { ta.focus(); } catch (e) {} }, 60); }
  function close() { if (panel) panel.hidden = true; }

  window.AIK = { ask, open, close, hasKey, models: MODELS };
  const boot = () => build();
  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
})();
