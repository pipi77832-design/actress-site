const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const id = Number(new URLSearchParams(location.search).get("id"));

fetch("data/items.json")
  .then((r) => r.json())
  .then((items) => {
    const x = items.find((v) => v.id === id) || items[0];
    const detail = document.getElementById("detail");

    // 詳細ページではサイト名・一覧・運営者情報・プライバシーポリシー等のヘッダー/フッターを表示しない。
    document.body.classList.add("detail-fanza");

    // 新システムが追加した作品(communityNoteを持つ)は「1枚目を大きく+2枚目以降を下に並べる+こちらから+リンクURL」のみを表示する。
    // 画像枚数は固定しない(1枚だけの場合は大きい画像のみ)。どの画像をタップしても同じリンクURLへ遷移する。
    // 既存30件は従来どおりの詳細描画のまま変更しない。
    if (typeof x.communityNote === "string") {
      const images = Array.isArray(x.images) ? x.images : [];
      const affiliateUrl = x.affiliateUrl || "";
      const subImagesHtml = images.length > 1
        ? `<div class="detail-new-subimages">${images.slice(1).map((img) => `<a class="detail-new-subimage-link" href="${escapeHtml(affiliateUrl)}"><img class="detail-new-subimage" src="${escapeHtml(img)}" alt=""></a>`).join("")}</div>`
        : "";
      detail.innerHTML = `<div class="detail-new"><a class="detail-new-image-link" href="${escapeHtml(affiliateUrl)}"><img class="detail-new-image" src="${escapeHtml(images[0] || "")}" alt=""></a>${subImagesHtml}<p class="detail-new-label">こちらから👇🏻</p><a class="detail-new-link" href="${escapeHtml(affiliateUrl)}">${escapeHtml(affiliateUrl)}</a></div>`;
      return;
    }

    // 既存の女優詳細も、DMM公式ActressSearch API由来の実データだけを表示する。
    // DMMから取得できなかった項目(生年月日・身長・B/W/H・カップ)は行ごと省略する。
    document.title = x.title;
    const facts = [];
    if (x.birthday) facts.push(["生年月日", x.birthday]);
    if (x.height) facts.push(["身長", x.height]);
    if (x.bust && x.waist && x.hip) facts.push(["B/W/H", `${x.bust}/${x.waist}/${x.hip}`]);
    if (x.cup) facts.push(["カップ", x.cup]);
    detail.innerHTML = `<div class="detail-layout"><img src="${escapeHtml(x.image)}" alt=""><div><h1>${escapeHtml(x.title)}</h1><p class="meta">${escapeHtml(x.ruby)}</p><dl>${facts.map((d) => `<dt>${escapeHtml(d[0])}</dt><dd>${escapeHtml(d[1])}</dd>`).join("")}</dl></div></div>`;
  });
