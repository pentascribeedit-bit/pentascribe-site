// PentaScribe (multi-page) — year + calculator (only when simulator elements exist)

const PRICING = {
  copy_standard: { rate: 0.17, days: 8, label: "Revisão (EN→EN) • padrão" },
  copy_priority: { rate: 0.24, days: 4, label: "Revisão (EN→EN) • prioritário" },
  trans_standard: { rate: 0.23, days: 8, label: "Tradução (PT→EN) • padrão" },
  trans_priority: { rate: 0.30, days: 4, label: "Tradução (PT→EN) • prioritário" },
  transedit_standard: { rate: 0.40, days: 10, label: "Tradução + adequação editorial • padrão" },
  transedit_priority: { rate: 0.48, days: 6, label: "Tradução + adequação editorial • prioritário" },
};

function byId(id){ return document.getElementById(id); }

function formatBRL(value){
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function setText(id, text){
  const el = byId(id);
  if(el) el.textContent = text;
}

function showError(msg){
  const el = byId("calcError");
  if(el) el.textContent = msg || "";
}

function resetOutput(){
  setText("outPrice", "—");
  setText("outDeadline", "—");
  setText("outRate", "—");
  showError("");
}

// Footer year (all pages)
const yearEl = byId("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

// Calculator (only on simulator page)
const form = byId("calcForm");
const resetBtn = byId("resetBtn");

if(form){
  resetBtn?.addEventListener("click", () => {
    form.reset();
    resetOutput();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showError("");

    const wordsRaw = byId("words")?.value ?? "";
    const serviceKey = byId("service")?.value ?? "";

    const words = Number.parseInt(wordsRaw, 10);
    if(!Number.isFinite(words) || words <= 0){
      showError("Informe um número de palavras válido (inteiro positivo).");
      resetOutput();
      return;
    }

    if(!serviceKey || !PRICING[serviceKey]){
      showError("Selecione um serviço para calcular.");
      resetOutput();
      return;
    }

    const cfg = PRICING[serviceKey];
    const cost = words * cfg.rate;

    setText("outPrice", formatBRL(cost));
    setText("outDeadline", `${cfg.days} dias`);
    setText("outRate", `R$ ${cfg.rate.toFixed(2)} / palavra`);
  });
}
