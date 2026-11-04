/* Ước lượng token theo từ: ASCII ~4 ký tự/token, ký tự có dấu ~2,2 ký tự/token, mỗi dấu câu 1 token. */
(function (TT) {
  const PIECE = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

  function cost(piece) {
    if (/^\s+$/.test(piece)) return 0;
    if (!/[\p{L}\p{N}]/u.test(piece)) return 1;
    const accented = /[^\x00-\x7F]/.test(piece);
    return Math.max(1, Math.ceil(piece.length / (accented ? 2.2 : 4)));
  }
  function split(text) {
    return Array.from(text.matchAll(PIECE), m => ({ text: m[0], cost: cost(m[0]) }));
  }
  function count(text) {
    return text ? split(text).reduce((s, p) => s + p.cost, 0) : 0;
  }
  /* Cắt còn tối đa `budget` token: giữ 70% đầu, 30% cuối. */
  function truncate(text, budget) {
    if (count(text) <= budget) return text;
    const parts = split(text);
    const take = (arr, limit) => { const o = []; let s = 0; for (const p of arr) { if (s + p.cost > limit) break; s += p.cost; o.push(p.text); } return o; };
    const head = take(parts, Math.floor(budget * 0.7)).join("");
    const tail = take(parts.slice().reverse(), Math.floor(budget * 0.3)).reverse().join("");
    return head.trimEnd() + "\n[…lược bớt…]\n" + tail.trimStart();
  }
  TT.Tokenizer = { cost, split, count, truncate };
})(window.TT = window.TT || {});
