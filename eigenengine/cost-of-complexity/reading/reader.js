(() => {
  "use strict";
  const publicBase = "https://gmccaul.co.uk/eigenengine/cost-of-complexity/reading/";
  const pathPrefix = new URL(publicBase).pathname;
  const storageKey = "eigenengine-paired-reading-v1-e9c6dabb-456564aa";
  const el = id => document.getElementById(id);
  const field = el("answer");
  const prompt = el("prompt");
  const fresh = () => ({ prior: "", notes: [], comparison: "", objections: "", reply: "", relevance: "", verdict: "", draft: "" });
  const stages = [
    { key: "prior", phase: "Before reading", title: "What do you expect from the abstracts?",
      direction: "Paste the opening prompt into a fresh chat with browsing off and no papers attached. Save its reply before sending a section.",
      copy: "Copy opening prompt", label: "Agent’s expectations", next: "Save expectations and open the first section →" },
    { key: "comparison", phase: "Second pass", title: "How did the argument change your expectations?",
      direction: "Return to the original chat. This time, read both papers together to trace dependencies, score the predictions and test any comparison with a familiar result.",
      copy: "Copy comparison prompt", label: "Forecast comparison and reduction tests", next: "Save comparison and weigh objections →" },
    { key: "objections", phase: "Consequences", title: "How much turns on each objection?",
      direction: "For every objection, record its relevance to a claim, its importance if true, and its physical witness. An empty list is a valid result. All 100 points can stay in reserve.",
      copy: "Copy objection prompt", label: "Objections, locators and impact allocation", next: "Save objections and prepare an independent reread →" },
    { key: "reply", phase: "Independent reread", title: "Give a fresh reader the other side",
      direction: "Start another chat with no earlier messages. Send this prompt with the two manuscripts. It contains the objections and the papers, with the first reader’s forecasts and assessment held back.",
      copy: "Copy fresh-reader prompt", label: "Independent reply to the objections", next: "Save reply and return to the first reader →" },
    { key: "relevance", phase: "Relevance", title: "How relevant are the objections to the argument?",
      direction: "Give the independent reply to the original reader. Ask this question on its own, and keep its answer beside the final explanation.",
      copy: "Copy the relevance question", label: "Which objections change the central argument?", next: "Save answer and ask for an explanation →" },
    { key: "verdict", phase: "Synthesis", title: "What do the two papers establish together?",
      direction: "Return to the original chat. Send the original reader its forecast comparison and its answer about relevance. Ask for a short explanation for a colleague deciding whether to read the papers. The full checks stay in the notebook.",
      copy: "Copy final explanation prompt", label: "Final explanation and assessment", next: "Save the completed reading" }
  ];
  function parseRecord(raw) {
    const saved = JSON.parse(raw || "null");
    if (!saved) return fresh();
    if (typeof saved !== "object" || !Array.isArray(saved.notes) || !Object.keys(fresh()).every(key =>
      key === "notes" ? saved.notes.every(note => typeof note === "string" && note.trim()) : typeof saved[key] === "string")) {
      throw new Error("Invalid reading record");
    }
    return saved;
  }

  let state = fresh();
  let lastSaved = null;
  let units = [], papers = [], instructions, opening = "", current;
  let fullCorpus;
  let generation = 0, loading = false, canStore = true;
  try {
    lastSaved = localStorage.getItem(storageKey);
    state = parseRecord(lastSaved);
  } catch { /* An unreadable notebook never prevents a new reading. */ }

  function persist() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== lastSaved) {
        const newer = parseRecord(stored);
        const earlier = parseRecord(lastSaved);
        if (Object.keys(earlier).some(key => key !== "draft" && JSON.stringify(earlier[key]) !== JSON.stringify(newer[key]))) {
          // Another tab has advanced. Never overwrite its frozen forecast or later notes.
          state = newer; lastSaved = stored;
          render().then(() => { el("save-status").textContent = "Another tab updated this reading. Its latest entry is shown here."; });
          return false;
        }
      }
      const serialized = JSON.stringify(state);
      localStorage.setItem(storageKey, serialized); lastSaved = serialized;
    } catch {
      canStore = false;
      el("save-status").textContent = "This browser can keep the reading in this tab only. Download the record before closing it.";
    }
    return true;
  }

  async function loadResource(path, kind = "json") {
    const relative = path.startsWith(pathPrefix) ? "./" + path.slice(pathPrefix.length) : path;
    const url = new URL(relative, document.baseURI);
    const offline = window.EigenReadingOffline?.[url.pathname];
    if (typeof offline === "string") return kind === "json" ? JSON.parse(offline) : offline;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unavailable reading material");
    return kind === "json" ? response.json() : response.text();
  }

  function records() {
    const result = [];
    if (state.prior) result.push(["P · Frozen expectations", state.prior]);
    state.notes.forEach((note, i) => result.push([units[i]?.name || "Section " + (i + 1), note]));
    stages.slice(1).forEach(stage => { if (state[stage.key]) result.push([stage.label, state[stage.key]]); });
    return result;
  }
  function logText() { return records().map(([name, text]) => name + "\n" + text).join("\n\n"); }
  function showLog() {
    const saved = records();
    el("entries").replaceChildren();
    for (const [title, text] of saved) {
      const entry = document.createElement("details"); entry.className = "entry";
      const label = document.createElement("summary"); label.textContent = title;
      const content = document.createElement("p"); content.textContent = text;
      entry.append(label, content); el("entries").append(entry);
    }
    el("note-count").textContent = saved.length ? "(" + saved.length + ")" : "";
    for (const id of ["download", "copy-log", "reset"]) el(id).disabled = !saved.length && !state.draft;
  }

  async function copy(text, status, fallback, reveal) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied. Paste it into the appropriate chat.";
    } catch {
      reveal(); fallback.hidden = false; fallback.value = text;
      fallback.focus(); fallback.select();
      status.textContent = "Text selected. Use your browser’s Copy command.";
    }
  }
  function sourceLinks(stage) {
    const box = el("sources"); box.replaceChildren(); box.hidden = true;
    let links = [];
    if (stage.key === "section") {
      links = [["Read this section in the browser", stage.packet.url.replace(/\.json$/, ".html")], ...(stage.packet.figures || []).filter(f => f.image).map(f => [f.label, f.image])];
    } else if (["comparison","objections","reply","relevance","verdict"].includes(stage.key)) {
      links = papers.flatMap(p => [[p.id === "cost" ? "Cost full text" : "Kalmár full text", "./" + p.id + "/"],
        [p.id === "cost" ? "Cost PDF" : "Kalmár PDF", p.pdf]]);
    }
    for (const [label, url] of links) {
      const a = document.createElement("a"); a.textContent = label + " ↗"; a.href = window.EigenReadingOfflineURL ? window.EigenReadingOfflineURL(url) : url; a.target = "_blank"; a.rel = "noopener"; box.append(a);
    }
    box.hidden = !links.length;
  }

  const sourceList = () => papers.map(p => p.title + "\nReadable text: " + publicBase + p.id + "/\nOriginal PDF: " + new URL(p.pdf, publicBase).href).join("\n\n");
  async function nextStage() {
    if (!state.prior) return { ...stages[0], message: opening };
    if (!units.length) {
      const [manifest, rules] = await Promise.all([loadResource("./index.json"), loadResource("./prompts.json")]);
      papers = manifest.papers;
      units = papers.flatMap(paper => paper.sections.map(unit => ({
        ...unit, paper, name: [paper.id === "cost" ? "C" : "K", unit.label, unit.title].filter(Boolean).join(" · ")
      })));
      instructions = rules;
    }
    if (state.notes.length < units.length) {
      const unit = units[state.notes.length];
      const packet = await loadResource(unit.url);
      const pages = unit.pages.length === 1 || unit.pages[0] === unit.pages[1] ? "p. " + unit.pages[0] : "pp. " + unit.pages.join("–");
      const figures = (packet.figures || []).map(f => f.label + (f.image ? " · " + new URL(f.image, publicBase).href : "")).join("\n");
      return {key:"section", phase:"First reading", title:unit.name, progress:(state.notes.length + 1) + " of " + units.length + " packets",
        direction:"Send only this packet in the same chat. After the reply, save the entry below to open the next one. Include any part the agent could not read.",
        copy:"Copy this section for the agent", label:"Section impression and evidence", next:"Save entry and continue →", packet,
        message:instructions.section + "\n\n" + unit.paper.title + "\n" + unit.name + " (" + pages + ")\n\n" + packet.text +
          (figures ? "\n\nFigure images for this section\n" + figures : "") };
    }
    const stage = stages.slice(1).find(s => !state[s.key]);
    if (!stage) return null;
    let message = instructions[stage.key];
    if (stage.key === "reply") {
      message += "\n\nManuscripts\n" + sourceList() + "\n\nObjections for the independent reader\n" + state.objections;
    } else if (stage.key === "relevance") {
      message = "Independent reader’s reply\n" + state.reply + "\n\n" + instructions.relevance;
    } else if (stage.key === "verdict") {
      message = "Original forecast\n" + state.prior + "\n\nWhat the reading established\n" + state.comparison +
        "\n\nRelevance to the argument\n" + state.relevance + "\n\n" + instructions.verdict;
    } else {
      message += "\n\nManuscripts\n" + sourceList() + "\n\nReading record to date\n" + logText();
    }
    return { ...stage, message };
  }

  async function render(focus = false) {
    const version = ++generation;
    loading = true; el("advance").disabled = true; el("copy").disabled = true;
    try {
      if (!opening) opening = (await loadResource("./opening.txt", "text")).trim();
      const stage = await nextStage();
      if (version !== generation) return;
      current = stage; loading = false;
      el("load-status").hidden = true; el("interactive").hidden = !stage;
      el("copy-status").textContent = ""; el("prompt-details").open = false; prompt.hidden = true;
      if (canStore) el("save-status").textContent = "";
      showLog();
      if (!stage) {
        el("phase").textContent = "Complete"; el("progress").textContent = units.length + " packets recorded";
        el("stage-title").textContent = "Your paired reading is complete";
        el("direction").textContent = "The forecast, notes and two readers’ assessments are saved together below.";
        el("notebook").open = true; return;
      }
      el("phase").textContent = stage.phase;
      el("progress").textContent = stage.progress || (stage.key === "prior" ? "Abstracts only" : "Both papers read");
      el("stage-title").textContent = stage.title; el("direction").textContent = stage.direction;
      el("copy").textContent = stage.copy; el("copy").disabled = false;
      el("answer-label").textContent = stage.label; el("advance").textContent = stage.next;
      prompt.value = stage.message; field.value = state.draft; field.setCustomValidity("");
      el("advance").disabled = false; sourceLinks(stage);
      el("full-copy").hidden = stage.key === "prior" || stage.key === "section";
      el("full-copy").open = false; el("full-fallback").hidden = true; el("full-status").textContent = "";
      if (focus) el("stage-title").focus();
    } catch {
      if (version !== generation) return;
      loading = false; current = null; el("interactive").hidden = true;
      const msg = el("load-status"); msg.hidden = false; msg.replaceChildren("This packet could not be opened. Your saved notes are still here. ");
      const retry = document.createElement("button"); retry.type = "button"; retry.textContent = "Try again"; retry.onclick = () => render();
      const manual = document.createElement("a"); manual.href = "./manual.html"; manual.textContent = "Manual reading sequence";
      msg.append(retry, " ", manual); showLog();
    }
  }

  function weightsIn(text) {
    const line = text.trim().split(/\r?\n/).at(-1).match(/^\s*weights\s*:\s*(.+?)\s*[.]?$/i);
    if (!line) return null;
    const weights = new Map();
    for (const item of line[1].split(",")) {
      const m = item.trim().match(/^(O[1-9]\d*|reserve)\s*=\s*(\d+(?:\.\d+)?)$/i);
      if (!m || weights.has(m[1].toLowerCase())) return null;
      weights.set(m[1].toLowerCase(), Number(m[2]));
    }
    const total = [...weights.values()].reduce((sum, n) => sum + n, 0);
    return weights.has("reserve") && Math.abs(total - 100) < .0001 ? weights : null;
  }
  function allocationIssue(key, text) {
    if (key !== "objections") return "";
    const weights = weightsIn(text);
    if (!weights) return "End with Weights: O1=…, reserve=… using numbers totalling 100. If none, use Weights: reserve=100.";
    const body = text.trim().split(/\r?\n/).slice(0, -1).join("\n");
    const cited = new Set((body.match(/\bO[1-9]\d*\b/gi) || []).map(id => id.toLowerCase()));
    if ([...cited].some(id => !weights.has(id))) return "Include a final weight for every reported objection ID, even when its weight is zero.";
    const headers = [...body.matchAll(/^\s*(?:[-*#]+\s*)?(?:\*\*)?(O[1-9]\d*)[.\-:)\s]/gim)];
    for (const id of weights.keys()) {
      if (id === "reserve") continue;
      const i = headers.findIndex(h => h[1].toLowerCase() === id);
      if (i < 0) return "Start each objection on its own line with its ID, for example O1.";
      const entry = body.slice(headers[i].index, headers[i + 1]?.index);
      const plain = entry.replace(/[*_]/g, "");
      const fields = [...plain.matchAll(/\b(relevance|importance|physical witness)\s*:\s*/gi)];
      const written = new Set(fields.filter((label, j) => {
        const answer = plain.slice(label.index + label[0].length, fields[j + 1]?.index);
        return /[\p{L}\p{N}]/u.test(answer);
      }).map(label => label[1].toLowerCase()));
      if (!["relevance", "importance", "physical witness"].every(label => written.has(label))) {
        return "Include Relevance, Importance and Physical witness for " + id.toUpperCase() + ".";
      }
    }
    return "";
  }
  field.addEventListener("input", () => { state.draft = field.value; field.setCustomValidity(""); persist(); });
  el("save-form").addEventListener("submit", event => {
    event.preventDefault();
    if (loading || !current) return;
    const text = field.value.trim();
    const issue = text ? allocationIssue(current.key, text) : "Paste the reply before opening the next packet.";
    if (issue) {
      field.setCustomValidity(issue);
      field.reportValidity(); return;
    }
    if (current.key === "section") state.notes.push(text);
    else state[current.key] = text;
    state.draft = ""; field.value = ""; if (persist()) render(true);
  });
  el("copy").addEventListener("click", () => {
    if (current) copy(current.message, el("copy-status"), prompt, () => { el("prompt-details").open = true; });
  });
  el("prompt-details").addEventListener("toggle", () => { prompt.hidden = !el("prompt-details").open; });
  document.querySelectorAll("[data-full-paper]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!current || ["prior", "section"].includes(current.key)) return;
      const active = generation;
      try {
        fullCorpus ??= await loadResource("./corpus.json");
        if (active !== generation) return;
        const manuscript = fullCorpus.papers.find(p => p.id === button.dataset.fullPaper);
        const text = [manuscript.title, manuscript.abstract, ...manuscript.sections.map(unit =>
          [unit.label, unit.title].filter(Boolean).join(" · ") + "\n" + unit.text)].join("\n\n");
        await copy(text, el("full-status"), el("full-fallback"), () => {});
      } catch { el("full-status").textContent = "The transcript could not be copied. Open the full text link above or try again."; }
    });
  });
  el("copy-log").addEventListener("click", () => copy(logText(), el("log-status"), el("log-fallback"), () => {}));
  el("download").addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob(["Paired manuscript reading\n\n" + logText() + (state.draft ? "\n\nUnfinished reply\n" + state.draft : "") + "\n"], {type:"text/plain;charset=utf-8"}));
    const link = document.createElement("a"); link.href = url; link.download = "paired-manuscript-reading.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  el("reset").addEventListener("click", () => {
    state = fresh(); units = []; papers = []; if (!persist()) return;
    el("notebook").open = el("restart").open = false; el("entries").replaceChildren(); el("log-fallback").hidden = true;
    el("log-status").textContent = ""; render(true);
  });
  window.addEventListener("storage", event => {
    if (event.key !== storageKey || event.newValue === lastSaved) return;
    try { state = parseRecord(event.newValue); lastSaved = event.newValue; render(); }
    catch { /* Ignore unrelated or damaged data. */ }
  });
  render();
})();
