/* Giao diện: nối các module với DOM. */
(function (TT) {
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const fmt = n => n.toLocaleString("vi-VN");
  const SAMPLE = `Xin chào, bạn có thể vui lòng giúp tôi viết lại đoạn mô tả sản phẩm bên dưới được không nhé?!!!   Cảm ơn bạn nhiều 😊

## Yêu cầu
**Giọng văn** thân thiện,   ngắn gọn.
**Giọng văn** thân thiện,   ngắn gọn.

Please, in order to make it better, I would like you to keep the text under 80 words, due to the fact that it will be shown on mobile.



Sản phẩm: Bình giữ nhiệt 500ml, giữ nóng 12 giờ, giữ lạnh 24 giờ, thép không gỉ 304.

Thanks in advance!`;
  const state = { tab: "trim", ai: "", enabled: TT.Store.get("enabled", TT.presetFor(2)) };

  function compute(src) {
    if (state.tab === "json") return { text: TT.Tools.jsonToTable(src), per: {} };
    if (state.tab === "en") return { text: state.ai, per: {} };
    if (state.tab === "trim") {
      const r = TT.Pipeline.run(src, state.enabled);
      const b = parseInt($("#budget").value, 10) || 0;
      if (b > 0) r.text = TT.Tokenizer.truncate(r.text, b);
      return r;
    }
    return { text: src, per: {} };
  }
  function renderHeat(src) {
    const box = $("#heat"); box.textContent = "";
    TT.Tokenizer.split(src).slice(0, 20000).forEach(p => {
      if (p.cost < 2) { box.append(p.text); return; }
      const s = document.createElement("span"); s.className = "c" + Math.min(p.cost, 4);
      s.title = p.cost + " token"; s.textContent = p.text; box.append(s);
    });
  }
  function update() {
    const src = $("#src").value, { text, per } = compute(src);
    $("#out").value = text;
    const before = TT.Tokenizer.count(src), after = text ? TT.Tokenizer.count(text) : before;
    const saved = Math.max(0, before - after), ctx = +$("#ctx").value, price = parseFloat($("#price").value) || 0;
    $("#nBefore").textContent = fmt(before); $("#nAfter").textContent = fmt(after);
    $("#nPct").textContent = (before ? Math.round(saved / before * 100) : 0) + "%";
    $("#barFill").style.width = (before ? Math.round(after / before * 100) : 100) + "%";
    $("#nCtx").textContent = (after / ctx * 100).toFixed(after / ctx < 0.01 ? 2 : 1) + "%";
    $("#nCost").textContent = (after * price / 1e6).toFixed(5) + " USD";
    $("#nSave").textContent = (saved * price / 1e6 * 1000).toFixed(3) + " USD";
    TT.Rules.forEach(r => { const v = per[r.id]; $("#s_" + r.id).textContent = state.enabled[r.id] && v > 0 ? "−" + v : ""; });
    if (state.tab === "view") renderHeat(src);
  }
  function syncChecks() { TT.Rules.forEach(r => { $("#r_" + r.id).checked = !!state.enabled[r.id]; }); }
  function setEnabled(map) { state.enabled = map; TT.Store.set("enabled", map); syncChecks(); update(); }
  function setTab(tab) {
    state.tab = tab;
    $$(".tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    ["trim", "en", "json", "view", "guide"].forEach(t => { $("#panel-" + t).hidden = t !== tab; });
    $("#io").hidden = tab === "guide"; $("#outWrap").hidden = tab === "view";
    update();
  }
  async function copy(text, btn, label) {
    try { await navigator.clipboard.writeText(text); } catch (e) { const t = $("#out"); t.select(); document.execCommand("copy"); }
    btn.textContent = "Đã sao chép"; setTimeout(() => (btn.textContent = label), 1500);
  }
  function applyTheme(t) {
    document.documentElement.dataset.theme = t; TT.Store.set("theme", t);
    $("#btnTheme").textContent = t === "dark" ? "Chế độ sáng" : "Chế độ tối";
  }
  function init() {
    applyTheme(document.documentElement.dataset.theme || "light");
    $("#btnTheme").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
    const box = $("#rules");
    TT.Rules.forEach(r => {
      const row = document.createElement("div"); row.className = "rule";
      row.innerHTML = `<input type="checkbox" id="r_${r.id}"><label for="r_${r.id}">${r.label}<span>${r.hint}</span></label><em id="s_${r.id}"></em>`;
      row.querySelector("input").addEventListener("change", e => { state.enabled[r.id] = e.target.checked; TT.Store.set("enabled", state.enabled); update(); });
      box.appendChild(row);
    });
    syncChecks();
    $$("[data-level]").forEach(b => b.addEventListener("click", () => setEnabled(TT.presetFor(+b.dataset.level))));
    ["#src", "#ctx", "#price", "#budget"].forEach(s => $(s).addEventListener("input", update));
    $$(".tabs button").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
    $("#btnSample").addEventListener("click", () => { $("#src").value = SAMPLE; state.ai = ""; update(); });
    $("#btnClear").addEventListener("click", () => { $("#src").value = ""; state.ai = ""; update(); $("#src").focus(); });
    $("#btnCopy").addEventListener("click", () => copy($("#out").value, $("#btnCopy"), "Sao chép"));
    $("#btnGloss").addEventListener("click", () => { state.enabled.gloss = true; TT.Store.set("enabled", state.enabled); syncChecks(); setTab("trim"); });
    $("#btnMeta").addEventListener("click", () => copy(TT.Tools.META.en + "\n\n---\n" + $("#src").value, $("#btnMeta"), "Sao chép lệnh + văn bản"));
    $("#btnAI").addEventListener("click", async () => {
      const key = $("#apiKey").value.trim(), src = $("#src").value.trim(), st = $("#aiStatus");
      if (!src) { st.textContent = "Hãy dán văn bản gốc trước."; return; }
      if (!key) { st.textContent = "Hãy nhập API key."; return; }
      st.textContent = "Đang xử lý…"; $("#btnAI").disabled = true;
      try { state.ai = await TT.Tools.aiCompress(src, key, $("#aiMode").value); st.textContent = "Xong."; update(); }
      catch (e) { st.textContent = "Lỗi: " + e.message; }
      $("#btnAI").disabled = false;
    });
    update();
  }
  init();
})(window.TT);
