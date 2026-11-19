(() => {
  "use strict";
  const chart = document.querySelector("#tool-frequency");
  if (!chart) return;
  const names = {
    "authoring/proposal-preview": "Preview a proposed edit", source: "Read manuscript source",
    help: "Look up tool help", web_fetch: "Fetch a web page", repository: "Inspect the repository",
    literature_import: "Import a paper", web_search: "Search the web", build_status: "Check a build",
    apply_revision: "Apply a revision", reference_text: "Read a reference", literature_lookup: "Look up literature",
    concept: "Inspect a concept", structure: "Read manuscript structure", reference_fetch: "Fetch a reference",
    author_history: "Read project history", build: "Build the manuscript", propose_revision: "Propose a revision",
    "authoring/proposal-decision": "Record an edit decision", concept_change: "Revise a concept",
    structure_change: "Revise structure", references_attached: "List attached references",
    "authoring/proposals": "List proposals", literature_bind: "Bind evidence to a passage", references: "List references",
    section_change: "Revise a section", logical_plan_change: "Revise the logical plan", visual_create: "Create a visual",
    concept_tree: "Explore the concept tree", "corpus/friction-report": "Record a project issue",
    literature_scope: "Inspect literature scope", store_artifact: "Save an artifact", logical_plan: "Read the logical plan",
    block_change: "Revise a text block", conversation_history: "Read conversation history", document: "Read the document",
    literature_discover: "Discover literature", project: "Inspect the project", read_artifact: "Read an artifact",
    visuals: "List visuals", author_changes: "Inspect author changes", literature_uses: "Inspect uses of a source",
    project_metadata: "Read project metadata", research: "Inspect research", task: "Work on a task", task_status: "Record task status"
  };
  const bars = chart.querySelector("#ee-bars");
  const filters = chart.querySelector(".ee-frequency-filters");
  const all = chart.querySelector("#ee-all-tools");
  const subtitle = chart.querySelector("#ee-frequency-total");
  const header = document.querySelector(".site-header");
  const channels = ["read", "action", "failure"];
  const subtitles = {total:"recorded attempts", read:"recorded reads", action:"recorded actions", failure:"recorded failures"};
  let channel = "total";
  let expanded = false;

  function paint(data) {
    const ranks = data.tools.filter(row => row[channel] > 0).sort((a,b) =>
      b[channel] - a[channel] || a.operation.localeCompare(b.operation));
    const total = ranks.reduce((sum, row) => sum + row[channel], 0);
    subtitle.textContent = total.toLocaleString("en-GB") + " " + subtitles[channel] + " across " + ranks.length + " tools.";
    const rows = expanded ? ranks : ranks.slice(0,8);
    const fragment = document.createDocumentFragment();
    for (const row of rows) {
      const li = document.createElement("li");
      li.title = row.operation + " · " + row.read + " reads, " + row.action + " actions, " + row.failure + " failures";
      const name = document.createElement("span");
      name.textContent = names[row.operation] || row.operation;
      const stack = document.createElement("span");
      stack.className = "ee-bar";
      stack.setAttribute("aria-hidden", "true");
      for (const type of channel === "total" ? channels : [channel]) {
        if (!row[type]) continue;
        const piece = document.createElement("i");
        piece.className = "ee-bar-" + type;
        piece.style.width = (100 * row[type] / ranks[0][channel]) + "%";
        stack.append(piece);
      }
      const count = document.createElement("b");
      count.textContent = row[channel];
      li.append(name, stack, count);
      fragment.append(li);
    }
    bars.replaceChildren(fragment);
    filters.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.count === channel)));
    all.setAttribute("aria-expanded", String(expanded));
    all.hidden = ranks.length <= 8;
    all.textContent = expanded ? "Show the top eight" : "Show all " + ranks.length + " tools";
  }

  async function enable() {
    const response = await fetch("/assets/data/cost-project-record.json");
    if (!response.ok) return;
    const data = await response.json();
    filters.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button || channel === button.dataset.count) return;
      channel = button.dataset.count;
      paint(data);
    });
    all.addEventListener("click", () => {
      expanded = !expanded;
      paint(data);
      if (!expanded && bars.getBoundingClientRect().top < header.getBoundingClientRect().bottom) {
        chart.scrollIntoView({ block: "start", behavior: "instant" });
        if (document.activeElement === all && all.getBoundingClientRect().bottom > window.innerHeight) {
          filters.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
        }
      }
    });
    filters.hidden = false;
    paint(data);
  }
  // The authored chart and data link remain usable offline or with JS disabled.
  enable().catch(() => {});
})();
