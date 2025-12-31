/* PentaScribe — Certificate validation (static JSON registry)
   This script validates a certificate code against certificates.json (public registry).
*/
(function () {
  const FORM_ID = "certForm";
  const INPUT_ID = "certCode";
  const RESULT_ID = "certResult";
  const DATA_URL = "certificates.json";

  function normalizeCode(raw) {
    return (raw || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setResult(type, html) {
    const el = document.getElementById(RESULT_ID);
    if (!el) return;
    el.className = "ps-result ps-" + type;
    el.innerHTML = html;
    el.style.display = "block";
  }

  async function loadRegistry() {
    const resp = await fetch(DATA_URL, { cache: "no-cache" });
    if (!resp.ok) throw new Error("Não foi possível carregar o registro de certificados.");
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error("Registro de certificados inválido.");
    return data;
  }

  function renderValid(item) {
    return `
      <div class="ps-result-title">Válido</div>
      <div class="ps-grid">
        <div><span>Serviço:</span> ${escapeHtml(item.service || "—")}</div>
        <div><span>Padrão:</span> ${escapeHtml(item.language || "—")}</div>
        <div><span>Data de emissão:</span> ${escapeHtml(item.issued || "—")}</div>
        ${item.author ? `<div><span>Autor(a):</span> ${escapeHtml(item.author)}</div>` : ""}
        ${item.title ? `<div><span>Título:</span> ${escapeHtml(item.title)}</div>` : ""}
      </div>
    `;
  }

  function renderRevoked(item) {
    return `
      <div class="ps-result-title">Revogado</div>
      <div class="ps-grid">
        <div><span>Serviço:</span> ${escapeHtml(item.service || "—")}</div>
        <div><span>Padrão:</span> ${escapeHtml(item.language || "—")}</div>
        <div><span>Data de emissão:</span> ${escapeHtml(item.issued || "—")}</div>
        ${item.author ? `<div><span>Autor(a):</span> ${escapeHtml(item.author)}</div>` : ""}
        ${item.title ? `<div><span>Título:</span> ${escapeHtml(item.title)}</div>` : ""}
      </div>
      <p class="ps-muted" style="margin: 10px 0 0 0;">
        Este código consta no registro, mas o certificado está marcado como revogado.
      </p>
    `;
  }

  function renderNotFound() {
    return `
      <div class="ps-result-title">Não encontrado</div>
      <p class="ps-muted" style="margin: 8px 0 0 0;">
        O código informado não consta no registro público.
      </p>
    `;
  }

  function renderError(msg) {
    return `
      <div class="ps-result-title">Erro</div>
      <p class="ps-muted" style="margin: 8px 0 0 0;">${escapeHtml(msg || "Não foi possível concluir a validação.")}</p>
    `;
  }

  async function validate(code) {
    const normalized = normalizeCode(code);
    if (!normalized) {
      setResult("error", renderError("Informe um código válido."));
      return;
    }

    setResult("loading", `<div class="ps-result-title">Validando…</div>`);

    try {
      const list = await loadRegistry();
      const found = list.find(x => normalizeCode(x.code) === normalized);

      if (!found) {
        setResult("invalid", renderNotFound());
        return;
      }

      const status = String(found.status || "valid").toLowerCase();
      if (status === "revoked") {
        setResult("revoked", renderRevoked(found));
        return;
      }

      setResult("valid", renderValid(found));
    } catch (err) {
      setResult("error", renderError(err && err.message ? err.message : "Não foi possível concluir a validação."));
    }
  }

  function init() {
    const form = document.getElementById(FORM_ID);
    const input = document.getElementById(INPUT_ID);
    if (!form || !input) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      validate(input.value);
    });

    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("code");
    if (prefill) {
      input.value = prefill;
      validate(prefill);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
