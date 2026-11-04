/* Tiện ích: JSON → bảng, lệnh dịch+nén, gọi API (khóa do người dùng nhập, không lưu). */
(function (TT) {
  const cell = v => v === null || v === undefined ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v)).replace(/\|/g, "/").replace(/\n/g, " ");
  const META = {
    en: "Rewrite the text below in English using the fewest tokens possible. Keep every fact, number, name and instruction. Drop greetings, filler and repetition. Output only the rewritten text.",
    same: "Rewrite the text below in its original language using the fewest tokens possible. Keep every fact, number, name and instruction. Drop greetings, filler and repetition. Output only the rewritten text."
  };
  TT.Tools = {
    META,
    jsonToTable(text) {
      if (!text.trim()) return "";
      let data;
      try { data = JSON.parse(text); } catch (e) { return "Lỗi: nội dung không phải JSON hợp lệ."; }
      if (!Array.isArray(data) || !data.length || data.some(o => o === null || typeof o !== "object" || Array.isArray(o)))
        return "Lỗi: cần một mảng các object, ví dụ [{\"ten\":\"A\"},{\"ten\":\"B\"}].";
      const keys = [...new Set(data.flatMap(o => Object.keys(o)))];
      return [keys.join("|"), ...data.map(o => keys.map(k => cell(o[k])).join("|"))].join("\n");
    },
    async aiCompress(text, key, mode) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01",
                   "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 2000, system: META[mode], messages: [{ role: "user", content: text }] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || "Lỗi " + res.status);
      return data.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    }
  };
})(window.TT = window.TT || {});
