const escapeHtmlWorks = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

// サイト別( FANZA / MGS )の紹介作品一覧。新しい作品が先頭に増えていく。
// 10件ごとにページを分けるので、増えても一覧が長くなりすぎない。
const siteKey = document.body.dataset.site;
const pageFile = `${siteKey}.html`;
const grid = document.getElementById("works");
const pagerEl = document.getElementById("pager");

function pageHref(n) {
  return n === 1 ? pageFile : `${pageFile}?page=${n}`;
}

function resolvePage() {
  const q = Number(new URLSearchParams(location.search).get("page"));
  return Number.isFinite(q) && q > 0 ? q : 1;
}

function renderPager(page, totalPages) {
  if (!pagerEl) return;
  let html = "";
  if (page > 1) html += `<a href="${pageHref(page - 1)}">前へ</a>`;
  if (page < totalPages) html += `<a href="${pageHref(page + 1)}">次へ</a>`;
  pagerEl.innerHTML = html;
}

function workCard(item) {
  const aff = escapeHtmlWorks(item.affiliateUrl);
  return `<article class="card daily-card"><a href="${aff}" target="_blank" rel="sponsored noopener"><img src="${escapeHtmlWorks(item.image)}" alt=""></a><div class="card-body"><p class="daily-off">${item.off}%OFF</p><h2>${escapeHtmlWorks(item.title)}</h2><p class="meta">¥${Number(item.price).toLocaleString()}（通常 ¥${Number(item.list_price).toLocaleString()}）</p><p class="meta works-date">${escapeHtmlWorks(item.date_label || "")}紹介</p><a class="button" href="${aff}" target="_blank" rel="sponsored noopener">作品ページを見る</a></div></article>`;
}

fetch(`data/works_${siteKey}.json`)
  .then((r) => r.json())
  .then((items) => {
    const page = resolvePage();
    const totalPages = Math.max(1, Math.ceil(items.length / 10));
    const shown = items.slice((page - 1) * 10, page * 10);
    grid.innerHTML = shown.map(workCard).join("");
    renderPager(page, totalPages);
  })
  .catch(() => {});
