const escapeHtmlDaily = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

// 「今日のセール」: FANZAとMGSを分けて、トップページの先頭に表示する。
// 中身は data/daily.json を差し替えるだけで毎日更新できる。
function dailyCard(item) {
  const aff = escapeHtmlDaily(item.affiliateUrl);
  return `<article class="card daily-card"><a href="${aff}" target="_blank" rel="sponsored noopener"><img src="${escapeHtmlDaily(item.image)}" alt=""></a><div class="card-body"><p class="daily-off">${item.off}%OFF</p><h2>${escapeHtmlDaily(item.title)}</h2><p class="meta">¥${Number(item.price).toLocaleString()}（通常 ¥${Number(item.list_price).toLocaleString()}）</p><a class="button" href="${aff}" target="_blank" rel="sponsored noopener">作品ページを見る</a></div></article>`;
}

function dailyBlock(label, items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<div class="daily-block"><h2 class="daily-title">${label}</h2><div class="grid daily-grid">${items.map(dailyCard).join("")}</div></div>`;
}

fetch("data/daily.json")
  .then((r) => r.json())
  .then((daily) => {
    const el = document.getElementById("daily");
    if (!el) return;
    const date = escapeHtmlDaily(daily.date_label || "");
    el.innerHTML =
      dailyBlock(`FANZA 今日のセール<span class="daily-date">${date}</span>`, daily.fanza) +
      dailyBlock(`MGS 今日のセール<span class="daily-date">${date}</span>`, daily.mgs);
  })
  .catch(() => {});
