(function () {
  const $ = (id) => document.getElementById(id);

  function releaseDownloadUrl(data, latest) {
    if (latest.url && String(latest.url).trim()) return latest.url.trim();
    const owner = data.github && data.github.owner;
    const repo = data.github && data.github.repo;
    const tag = latest.tag || (`v${latest.version}`);
    const file = latest.file;
    if (!owner || owner === "YOUR_GITHUB_USERNAME" || !repo || !file) return "";
    return `https://github.com/${owner}/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(file)}`;
  }

  function platformDownloadUrl(data, latest, platform) {
    const plat = latest && latest[platform];
    if (plat && plat.url && String(plat.url).trim()) return plat.url.trim();
    if (plat && plat.file) {
      const owner = data.github && data.github.owner;
      const repo = data.github && data.github.repo;
      const tag = plat.tag || latest.tag || (`v${plat.version || latest.version}`);
      if (owner && owner !== "YOUR_GITHUB_USERNAME" && repo && plat.file) {
        return `https://github.com/${owner}/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(plat.file)}`;
      }
    }
    if (platform === "windows") return releaseDownloadUrl(data, latest);
    return "";
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + (iso.length <= 10 ? "T12:00:00Z" : ""));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("it-CH", { year: "numeric", month: "short", day: "numeric" });
  }

  function wireButton(el, url) {
    if (!el) return;
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-disabled");
    } else {
      el.href = "#download";
      el.removeAttribute("target");
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
    }
  }

  function setDownloadButtons(winUrl, macUrl) {
    wireButton($("btnDownload"), winUrl);
    wireButton($("btnDownloadMacHero"), macUrl);
    wireButton($("btnDownloadMain"), winUrl);
    wireButton($("btnDownloadMac"), macUrl);
  }

  function platformReady(plat, url) {
    return Boolean(url || (plat && (plat.file || plat.url)));
  }

  function render(data) {
    const latest = data.latest || {};
    const win = latest.windows || {};
    const mac = latest.mac || {};
    const winUrl = platformDownloadUrl(data, latest, "windows");
    const macUrl = platformDownloadUrl(data, latest, "mac");
    const winReady = platformReady(win, winUrl) || Boolean(latest.file || latest.url);
    const macReady = platformReady(mac, macUrl);

    const winVer = win.version || (winReady ? latest.version : "") || "";
    const macVer = mac.version || "";
    const winMb = win.sizeMb != null ? win.sizeMb : latest.sizeMb;
    const macMb = mac.sizeMb != null ? mac.sizeMb : null;
    const archNote = mac.arch ? ` · ${mac.arch}` : "";

    const metaBits = [];
    if (winReady && winVer) metaBits.push(`Windows ${winVer}${winMb != null ? ` · ~${winMb} MB` : ""}`);
    if (macReady && macVer) metaBits.push(`Mac ${macVer}${archNote}${macMb != null ? ` · ~${macMb} MB` : ""}`);
    $("heroMeta").textContent = metaBits.length
      ? `Ultima versione · ${metaBits.join(" · ")}`
      : "La prima versione scaricabile arriva presto";

    $("dlVersion").textContent = latest.version || winVer || "—";

    const fileLines = [];
    if (winReady && (win.file || latest.file)) {
      fileLines.push(
        `Windows: ${win.file || latest.file}` +
          (win.releasedAt || latest.releasedAt
            ? " · " + formatDate(win.releasedAt || latest.releasedAt)
            : "")
      );
    }
    if (macReady && mac.file) {
      fileLines.push(
        `Mac${archNote}: ${mac.file}` +
          (mac.releasedAt || latest.releasedAt
            ? " · " + formatDate(mac.releasedAt || latest.releasedAt)
            : "")
      );
    }
    $("dlFile").textContent = fileLines.length
      ? fileLines.join("\n")
      : "Quando la prima Release è su GitHub, qui compaiono installer e DMG.";
    $("dlFile").style.whiteSpace = fileLines.length > 1 ? "pre-line" : "";

    const hint = $("dlHint");
    if (!winUrl && !macUrl) {
      hint.textContent = "Il download non è ancora pronto. Alla prima Release, aggiorna releases.json con file, tag e versione: i pulsanti si accendono da soli.";
    } else {
      hint.textContent = "Installa sopra la versione precedente: i dati restano su quel computer. La build Mac, per ora, è solo Apple Silicon (arm64).";
    }
    setDownloadButtons(winUrl, macUrl);

    const notesHost = $("latestNotes");
    notesHost.innerHTML = "";
    const notes = Array.isArray(latest.notes) ? latest.notes : [];
    if (!notes.length) {
      notesHost.innerHTML = '<p class="section-lede">Le note di versione compariranno qui.</p>';
    } else {
      const ul = document.createElement("ul");
      ul.className = "notes";
      notes.forEach((n, i) => {
        const li = document.createElement("li");
        li.className = "note-item";
        li.style.animationDelay = `${0.05 * i}s`;
        li.textContent = n;
        ul.appendChild(li);
      });
      notesHost.appendChild(ul);
    }

    const hist = $("history");
    hist.innerHTML = "";
    const history = Array.isArray(data.history) ? data.history : [];
    if (history.length) {
      const title = document.createElement("p");
      title.className = "dl-label";
      title.textContent = "Versioni precedenti";
      hist.appendChild(title);
      history.forEach((h) => {
        const item = document.createElement("article");
        item.className = "hist-item";
        const head = document.createElement("div");
        head.className = "hist-head";
        head.innerHTML = `<span class="hist-ver">${escapeHtml(h.version || "")}</span>` +
          (h.releasedAt ? `<span class="hist-date">${escapeHtml(formatDate(h.releasedAt))}</span>` : "");
        item.appendChild(head);
        if (Array.isArray(h.notes) && h.notes.length) {
          const ul = document.createElement("ul");
          ul.className = "hist-notes";
          h.notes.forEach((n) => {
            const li = document.createElement("li");
            li.textContent = n;
            ul.appendChild(li);
          });
          item.appendChild(ul);
        }
        hist.appendChild(item);
      });
    }

    if (data.expiresAt) {
      $("expiryLine").textContent = `Questa bozza resta disponibile fino al ${formatDate(data.expiresAt)}.`;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  fetch("releases.json", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("releases.json missing");
      return r.json();
    })
    .then(render)
    .catch(() => {
      $("heroMeta").textContent = "Non riesco a leggere releases.json";
      $("dlHint").textContent = "Manca releases.json nella cartella del sito (GitHub Pages).";
      const notesHost = $("latestNotes");
      if (notesHost) {
        notesHost.innerHTML = '<p class="section-lede">Note non caricate: controlla che releases.json sia completo e sia JSON valido.</p>';
      }
      setDownloadButtons("", "");
    });
})();
