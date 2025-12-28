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


// Contact page helpers (only when elements exist)
(function(){
  const EMAIL_TO = "pentascribe.edit@gmail.com";

  const copyBtn = byId("copyEmailBtn");
  const copyStatus = byId("copyEmailStatus");

  function setStatus(msg){
    if(!copyStatus) return;
    copyStatus.textContent = msg;
  }

  async function copyToClipboard(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch(_e){
      // Fallback
      try{
        const tmp = document.createElement("input");
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        return true;
      }catch(_e2){
        return false;
      }
    }
  }

  if(copyBtn){
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email") || EMAIL_TO;
      const ok = await copyToClipboard(email);
      setStatus(ok ? "Copiado." : "Não foi possível copiar. Copie manualmente.");
      window.setTimeout(() => setStatus(""), 3000);
    });
  }

  const briefBtn = byId("briefEmailBtn");
  const briefForm = byId("briefForm");

  function safeVal(id){
    const el = byId(id);
    if(!el) return "";
    return (el.value || "").trim();
  }

  function buildMailto(subject, body){
    const qs = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return `mailto:${EMAIL_TO}?${qs}`;
  }

  function buildBody(fields){
    const lines = [
      "Olá, PentaScribe.",
      "",
      "Gostaria de solicitar orçamento para:",
      "",
      `Serviço: ${fields.service || "—"}`,
      `Nº de palavras (texto-fonte): ${fields.words || "—"}`,
      `Plano: ${fields.plan || "—"}`,
      `Prazo desejado: ${fields.deadline || "—"}`,
      `Periódico-alvo: ${fields.journal || "—"}`,
      "",
      "Observações:",
      fields.notes ? fields.notes : "—",
      "",
      `Nome: ${fields.name || "—"}`,
      `E-mail: ${fields.sender || "—"}`,
      "",
      "Anexo: (enviar .docx/.txt junto ao e-mail)."
    ];
    return lines.join("\n");
  }

  if(briefBtn){
    briefBtn.addEventListener("click", () => {
      const fields = {
        service: safeVal("briefService"),
        words: safeVal("briefWords"),
        plan: safeVal("briefPlan"),
        deadline: safeVal("briefDeadline"),
        journal: safeVal("briefJournal"),
        notes: safeVal("briefNotes"),
        name: safeVal("briefName"),
        sender: safeVal("briefSender"),
      };

      // Basic validation: service + words
      if(!fields.service){
        alert("Selecione o serviço.");
        return;
      }
      if(!fields.words || Number(fields.words) <= 0){
        alert("Informe o número de palavras (texto-fonte).");
        return;
      }

      const subject = `Orçamento — ${fields.service} — ${fields.words} palavras — ${fields.deadline || fields.plan}`;
      const body = buildBody(fields);

      window.location.href = buildMailto(subject, body);
    });
  }
})();
