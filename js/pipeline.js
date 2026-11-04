/* Chạy các quy tắc đang bật theo thứ tự, ghi lại số token mỗi quy tắc cắt được. */
(function (TT) {
  TT.Pipeline = {
    run(text, enabled) {
      let cur = text; const per = {};
      for (const r of TT.Rules) {
        if (!enabled[r.id]) continue;
        const before = TT.Tokenizer.count(cur);
        cur = r.run(cur);
        per[r.id] = before - TT.Tokenizer.count(cur);
      }
      return { text: TT.Rules[0].run(cur), per };
    }
  };
})(window.TT = window.TT || {});
