const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const grid = document.getElementById("grid");
const pagerEl = document.getElementById("pager");

// ページ1〜3は既存の物理ファイル(index.html/page2.html/page3.html)のURLを維持する。
// 4ページ目以降はファイルを増やさず、index.html?page=Nで自動的に成立させる。
function pageHref(n) {
  if (n === 1) return "index.html";
  if (n === 2) return "page2.html";
  if (n === 3) return "page3.html";
  return `index.html?page=${n}`;
}

function resolveCurrentPage() {
  const queryPage = Number(new URLSearchParams(location.search).get("page"));
  if (Number.isFinite(queryPage) && queryPage > 0) return queryPage;
  return Number(document.body.dataset.page || 1);
}

function renderPager(page, totalPages) {
  if (!pagerEl) return;
  let html = "";
  if (page > 1) html += `<a href="${pageHref(page - 1)}">前へ</a>`;
  if (page < totalPages) html += `<a href="${pageHref(page + 1)}">次へ</a>`;
  pagerEl.innerHTML = html;
}

// 新システムが追加した作品(communityNoteを持つ)は「選択画像の1枚目+一言」のみのカードにする。
// images(選択順の配列)の先頭を一覧カードの画像として使う。枚数は固定しない。
// このカードの構造・表示仕様には今回手を加えない。
//
// 既存の女優カードは、DMM公式ActressSearch API由来の実データ(name/ruby/height/bust/cup/
// waist/hip/birthday)だけを表示する。DMMから取得できなかった項目は表示自体を省略し、
// 推測値・旧ダミー値は一切残さない。
function renderCard(item) {
  if (typeof item.communityNote === "string") {
    const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";
    return `<a class="card card-new" href="detail.html?id=${encodeURIComponent(item.id)}"><img src="${escapeHtml(firstImage)}" alt=""><div class="card-body"><p class="desc">${escapeHtml(item.communityNote)}</p></div></a>`;
  }

  const facts = [];
  if (item.birthday) facts.push(`<div><dt>生年月日</dt><dd>${escapeHtml(item.birthday)}</dd></div>`);
  if (item.height) facts.push(`<div><dt>身長</dt><dd>${escapeHtml(item.height)}</dd></div>`);
  if (item.bust && item.waist && item.hip) {
    facts.push(`<div><dt>B/W/H</dt><dd>${escapeHtml(item.bust)}/${escapeHtml(item.waist)}/${escapeHtml(item.hip)}</dd></div>`);
  }
  if (item.cup) facts.push(`<div><dt>カップ</dt><dd>${escapeHtml(item.cup)}</dd></div>`);

  return `<article class="card"><img src="${escapeHtml(item.image)}" alt=""><div class="card-body"><h2>${escapeHtml(item.title)}</h2><p class="ruby">${escapeHtml(item.ruby)}</p><dl class="facts">${facts.join("")}</dl><a class="button" href="detail.html?id=${encodeURIComponent(item.id)}">詳しく見る</a></div></article>`;
}

fetch("data/items.json")
  .then((r) => r.json())
  .then((items) => {
    const page = resolveCurrentPage();
    const totalPages = Math.max(1, Math.ceil(items.length / 10));
    const shown = items.slice((page - 1) * 10, page * 10);
    grid.innerHTML = shown.map(renderCard).join("");
    renderPager(page, totalPages);
  });
