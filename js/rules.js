/* Mỗi quy tắc là một hàm thuần. lv = mức tối thiểu để được bật bởi preset (1 An toàn, 2 Cân bằng, 3 Tối đa). */
(function (TT) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = list => new RegExp("(^|[\\s,.;:!?(])(" + list.sort((a, b) => b.length - a.length).map(esc).join("|") + ")(?=$|[\\s,.;:!?)])", "giu");
  const tidy = t => t.replace(/ +([,.;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ").replace(/^[ ,;:]+/gm, "");

  const FILLER = rx(["xin vui lòng", "vui lòng", "làm ơn", "bạn có thể giúp tôi", "bạn có thể", "giúp tôi với", "nhờ bạn",
    "cảm ơn bạn nhiều", "cảm ơn bạn", "cảm ơn nhiều", "cảm ơn", "xin chào", "chào bạn",
    "could you please", "can you please", "could you", "can you", "please", "kindly", "i would like you to", "i want you to",
    "thank you very much", "thank you", "thanks in advance", "thanks", "basically", "actually"]);
  const PARTICLES = rx(["nhé", "nha", "ạ", "nhỉ", "giúp mình", "mình muốn", "tôi muốn bạn", "hãy"]);
  const VERBOSE = [[/\bin order to\b/gi, "to"], [/\bdue to the fact that\b/gi, "because"], [/\bat this point in time\b/gi, "now"],
    [/\ba large number of\b/gi, "many"], [/\bis able to\b/gi, "can"], [/\bfor the purpose of\b/gi, "for"],
    [/\bwith regard to\b/gi, "about"], [/\bin the event that\b/gi, "if"]];
  const GLOSS = { "viết lại": "rewrite", "tóm tắt": "summarize", "dịch sang": "translate to", "giải thích": "explain",
    "ngắn gọn": "concise", "chi tiết": "detailed", "trả lời": "answer", "bên dưới": "below", "dưới đây": "below",
    "ở trên": "above", "phía trên": "above", "yêu cầu": "requirements", "ví dụ": "e.g.", "sản phẩm": "product",
    "tiếng việt": "Vietnamese", "tiếng anh": "English", "đoạn văn": "paragraph", "bài viết": "article", "tối đa": "max",
    "tối thiểu": "min", "không quá": "max", "giọng văn": "tone", "thân thiện": "friendly", "chuyên nghiệp": "professional",
    "danh sách": "list", "liệt kê": "list", "so sánh": "compare", "phân tích": "analyze", "sửa lỗi": "fix bugs",
    "viết code": "write code", "câu hỏi": "question", "kết quả": "result", "dữ liệu": "data", "người dùng": "user", "khách hàng": "customer" };
  const GLOSS_RX = rx(Object.keys(GLOSS));

  TT.Rules = [
    { id: "ws", lv: 1, label: "Gom khoảng trắng", hint: "Xóa khoảng trắng thừa và dòng trống liên tiếp.",
      run: t => t.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim() },
    { id: "dup", lv: 1, label: "Bỏ dòng lặp liên tiếp", hint: "Hai dòng giống hệt nhau cạnh nhau chỉ giữ một.",
      run: t => t.split("\n").filter((l, i, a) => !(i && l.trim() && l === a[i - 1])).join("\n") },
    { id: "json", lv: 1, label: "Nén JSON", hint: "Nếu toàn bộ nội dung là JSON hợp lệ, bỏ thụt lề.",
      run: t => { try { return JSON.stringify(JSON.parse(t)); } catch (e) { return t; } } },
    { id: "filler", lv: 1, label: "Bỏ từ xã giao", hint: "Xóa “vui lòng”, “cảm ơn”, “please”, “could you”…",
      run: t => tidy(t.replace(FILLER, "$1")) },
    { id: "punct", lv: 2, label: "Gộp dấu câu lặp", hint: "“!!!” thành “!”. Không dùng nếu có code chứa “...”.",
      run: t => t.replace(/([!?.,;:])\1+/g, "$1") },
    { id: "emoji", lv: 2, label: "Bỏ emoji", hint: "Mỗi emoji thường tốn 2–3 token.",
      run: t => tidy(t.replace(/\p{Extended_Pictographic}\uFE0F?/gu, "")) },
    { id: "particles", lv: 2, label: "Bỏ từ đệm tiếng Việt", hint: "Xóa “nhé”, “ạ”, “hãy”, “mình muốn”…",
      run: t => tidy(t.replace(PARTICLES, "$1")) },
    { id: "verbose", lv: 2, label: "Rút gọn cụm dài tiếng Anh", hint: "“in order to” thành “to”…",
      run: t => VERBOSE.reduce((s, [r, to]) => s.replace(r, to), t) },
    { id: "blank", lv: 2, label: "Bỏ hết dòng trống", hint: "Mỗi dòng trống là một token xuống dòng.",
      run: t => t.replace(/\n\s*\n/g, "\n") },
    { id: "md", lv: 2, label: "Bỏ định dạng Markdown", hint: "Xóa **đậm**, tiêu đề #, trích dẫn > và đường kẻ ngang.",
      run: t => t.replace(/(\*\*|__)(.+?)\1/g, "$2").replace(/^#{1,6}\s+/gm, "").replace(/^>\s?/gm, "").replace(/^\s*([-=*_])\1{2,}\s*$/gm, "") },
    { id: "gloss", lv: 3, label: "Đổi cụm Việt thường gặp sang Anh", hint: "“viết lại” thành “rewrite”, “tóm tắt” thành “summarize”… Tiếng Anh ít token hơn.",
      run: t => t.replace(GLOSS_RX, (m, a, b) => a + GLOSS[b.toLowerCase()]) },
    { id: "cmt", lv: 3, label: "Bỏ chú thích trong code", hint: "Xóa khối /* */ và dòng bắt đầu bằng //.",
      run: t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "") },
    { id: "accent", lv: 3, label: "Bỏ dấu tiếng Việt", hint: "Giảm nhiều token nhưng có thể làm sai nghĩa. Nên kiểm tra kết quả.",
      run: t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").normalize("NFC") }
  ];
  TT.presetFor = lv => Object.fromEntries(TT.Rules.map(r => [r.id, r.lv <= lv]));
})(window.TT = window.TT || {});
