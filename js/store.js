/* Lưu cài đặt an toàn: không lỗi khi trình duyệt chặn localStorage. */
(function (TT) {
  TT.Store = {
    get(k, d) { try { const v = localStorage.getItem("tt:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("tt:" + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };
})(window.TT = window.TT || {});
