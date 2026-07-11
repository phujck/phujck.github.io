/* ═══════════════════════════════════════════════════════════════════════
   shell.js — the ONE shell over all six applets.

   Injects a slim persistent header: engine mark · VIEW switcher
   (map · conceptric · manuscript · projection · navigator) · corpus
   selector · node search. The corpus rides ?corpus= across every view
   switch, so hopping applets never loses context.

   Self-contained (no CDN). Graceful no-op: each applet includes this via
   <script defer src="/shared/shell.js"> — if /shared/ is absent the tag
   404s and the applet renders exactly as before. All fetches inside
   degrade silently too.

   Page hook: an applet may set window.__hymnOpenNode = fn(id) so the
   shell's node search focuses in-page instead of navigating away.

   Served by src/laplace/shared_ui.py at GET /shared/shell.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.HymnShell) return;

  const ec = encodeURIComponent;
  const params = new URLSearchParams(location.search);
  let corpus = params.get("corpus") || "";

  // "manuscript" (/editor) left the nav 2026-07-03 (his: a deprecated shadow of
  // projection — dead ends confuse). The route stays alive for the
  // manuscript_bridge projects (paper_self_theory) until projection serves them.
  const VIEWS = [
    ["map",        "/"],
    ["conceptric", "/conceptric2"],
    ["storyboard", "/storyboard"],
    ["projection", "/projection"],
    ["navigator",  "/navigator"],
  ];

  function ensureCss(){
    if(document.querySelector("link[href='shared/hymn.css']")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = "shared/hymn.css";
    document.head.appendChild(l);
  }

  function activeView(){
    const p = location.pathname;
    if(p === "/" || p === "/index.html") return "map";
    if(p.startsWith("/conceptric")) return "conceptric";
    if(p.startsWith("/storyboard")) return "storyboard";
    if(p.startsWith("/editor")) return "manuscript";
    if(p.startsWith("/projection")) return "projection";
    if(p.startsWith("/navigator")) return "navigator";
    return "";
  }

  // the projection view needs a file= — derived from the corpus' projection plan.
  let PLAN = null;
  async function planTarget(){
    if(!corpus) return null;
    if(PLAN !== null) return PLAN;
    try{
      const r = await fetch("/shared/plan?corpus="+ec(corpus));
      PLAN = r.ok ? await r.json() : false;
    }catch(e){ PLAN = false; }
    return PLAN;
  }

  function viewHref(path){
    const q = corpus ? "?corpus="+ec(corpus) : "";
    return path + q;
  }

  function esc(s){ return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function build(){
    ensureCss();
    if(document.getElementById("hy-shell")) return;
    const bar = document.createElement("div");
    bar.id = "hy-shell";
    const act = activeView();
    bar.innerHTML =
      "<span class='hy-mark'>⌁ eigen<small>engine</small></span>"+
      "<nav>"+VIEWS.map(([name, path]) =>
        "<a data-view='"+name+"' href='"+esc(viewHref(path))+"'"+
        (name === act ? " class='on'" : "")+">"+name+"</a>").join("")+"</nav>"+
      "<select id='hy-corpus' title='which corpus — carried across every view'>"+
      "<option value=''>corpus…</option></select>"+
      "<div class='hy-search'>"+
      "<input id='hy-q' placeholder='find node…' autocomplete='off'>"+
      "<div class='hy-sres' id='hy-sres'></div></div>";
    document.body.insertBefore(bar, document.body.firstChild);

    // the shell claims its strip: pages lay out below it, whatever their scheme
    document.body.style.boxSizing = "border-box";
    const pad = () => { document.body.style.paddingTop = bar.offsetHeight + "px"; };
    pad();
    window.addEventListener("resize", pad);

    // resolve the corpus at CLICK time — an in-page corpus switch (an applet's own
    // selector that history.replaceState'd the URL) still carries across the hop
    bar.querySelectorAll("nav a[data-view]").forEach(a => {
      a.addEventListener("click", async e => {
        e.preventDefault();
        const cur = new URLSearchParams(location.search).get("corpus") || corpus;
        const path = VIEWS.find(v => v[0] === a.dataset.view)[1];
        let href = path + (cur ? "?corpus="+ec(cur) : "");
        if(a.dataset.view === "projection" && cur){
          try{
            const r = await fetch("/shared/plan?corpus="+ec(cur));
            if(r.ok){
              const p = await r.json();
              if(p.target_dir)
                href = "/projection?file="+ec(p.target_dir.replace(/\/+$/,"") + "/main.tex")+
                       "&corpus="+ec(cur);
            }
          }catch(err){ /* fall through with the plain href */ }
        }
        location.href = href;
      });
    });

    wireCorpus(bar);
    wireSearch(bar);
    wireProjectionHref(bar);
  }

  async function wireCorpus(bar){
    const sel = bar.querySelector("#hy-corpus");
    let corpora = [];
    try{
      const r = await fetch("/corpus/list");
      if(r.ok) corpora = (await r.json()).corpora || [];
    }catch(e){ /* offline — the selector just stays empty */ }
    sel.innerHTML = "<option value=''>corpus…</option>"+
      corpora.map(c => "<option"+(c === corpus ? " selected" : "")+">"+esc(c)+"</option>").join("");
    sel.onchange = async () => {
      const u = new URL(location.href);
      if(sel.value) u.searchParams.set("corpus", sel.value);
      else u.searchParams.delete("corpus");
      // on /projection the file must follow the corpus — rewrite it from the new plan
      if(activeView() === "projection" && sel.value){
        try{
          const r = await fetch("/shared/plan?corpus="+ec(sel.value));
          if(r.ok){
            const p = await r.json();
            if(p.target_dir)
              u.searchParams.set("file", p.target_dir.replace(/\/+$/,"") + "/main.tex");
          }
        }catch(e){ /* keep the old file param */ }
      }
      location.href = u.href;
    };
  }

  // the projection link carries file= from the plan when the corpus has one
  async function wireProjectionHref(bar){
    const a = bar.querySelector("a[data-view='projection']");
    if(!a || !corpus) return;
    const p = await planTarget();
    if(p && p.target_dir)
      a.href = "/projection?file="+ec(p.target_dir.replace(/\/+$/,"") + "/main.tex")+
               "&corpus="+ec(corpus);
  }

  function wireSearch(bar){
    const inp = bar.querySelector("#hy-q");
    const res = bar.querySelector("#hy-sres");
    let t = null;
    inp.addEventListener("input", () => {
      clearTimeout(t);
      const q = inp.value.trim();
      if(!q || !corpus){ res.classList.remove("on"); res.innerHTML = ""; return; }
      t = setTimeout(async () => {
        let rows = [];
        try{
          const r = await fetch("/corpus/search?corpus="+ec(corpus)+"&q="+ec(q));
          if(r.ok) rows = (await r.json()).results || [];
        }catch(e){ /* silent */ }
        if(!rows.length){ res.classList.remove("on"); res.innerHTML = ""; return; }
        res.innerHTML = rows.slice(0, 14).map(n =>
          "<div class='hy-srow' data-id='"+esc(n.id)+"'>"+
          esc((n.essence || n.id).slice(0, 90))+
          "<div class='sid'>"+esc(n.id)+" · "+esc(n.kind || "")+"</div></div>").join("");
        res.classList.add("on");
        res.querySelectorAll(".hy-srow").forEach(el => el.onclick = () => {
          res.classList.remove("on"); inp.value = "";
          openNode(el.dataset.id);
        });
      }, 160);
    });
    document.addEventListener("click", e => {
      if(!res.contains(e.target) && e.target !== inp) res.classList.remove("on");
    });
  }

  function openNode(id){
    if(typeof window.__hymnOpenNode === "function"){ window.__hymnOpenNode(id); return; }
    location.href = "/conceptric2?corpus="+ec(corpus)+"&node="+ec(id);
  }

  // ---- shared math: KaTeX (vendored under shared/katex/), loaded lazily ONCE.
  // Any surface calls window.renderMath(el) after injecting content and every
  // $...$ / $$...$$ / \(..\) / \[..\] in it renders. Editable regions and form
  // controls are skipped (a KaTeX span inside a contenteditable breaks editing).
  let mathReady = null;
  function ensureMath(){
    if(mathReady) return mathReady;
    mathReady = new Promise(res => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "shared/katex/katex.min.css";
      document.head.appendChild(css);
      const s1 = document.createElement("script");
      s1.src = "shared/katex/katex.min.js";
      s1.onload = () => {
        const s2 = document.createElement("script");
        s2.src = "shared/katex/auto-render.min.js";
        s2.onload = () => res(true); s2.onerror = () => res(false);
        document.head.appendChild(s2);
      };
      s1.onerror = () => res(false);
      document.head.appendChild(s1);
    });
    return mathReady;
  }
  window.renderMath = async function(el){
    if(!el) return;
    if(!(await ensureMath()) || !window.renderMathInElement) return;
    if(el.isContentEditable) return;
    try{
      window.renderMathInElement(el, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "\\[", right: "\\]", display: true},
          {left: "$", right: "$", display: false},
          {left: "\\(", right: "\\)", display: false},
        ],
        throwOnError: false,
        ignoredTags: ["script","style","textarea","pre","code","input","select","button"],
        ignoredClasses: ["no-math"],
      });
    }catch(e){}
  };

  window.HymnShell = {
    corpus: () => corpus,
    openNode: openNode,
    viewHref: viewHref,
    renderMath: (el) => window.renderMath(el),
  };

  if(document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();
