#!/usr/bin/env python
"""Build the deck's interactive graph embeds from the live conceptric viewer.

The talk's graph slides were static single-layer bakes - the scale-local
interactivity (zoom a coarse node to pull its subnetwork apart, the flow side
view) lived only in the server-backed viewer. This ports that viewer to a
server-free embed: it strips the fetch/comment/poll machinery, reads its graph
from an inline <script type="application/json"> tag, and otherwise keeps the
working macro + flow + panel + zoom-descend code verbatim.

graph-embed.html is the transformed template (committed for reproducibility);
this script regenerates it from the viewer copy, then injects each dataset.

Usage: python tools/build-graphs.py
"""
from __future__ import annotations
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
DECK = HERE.parent
TPL = HERE / "graph-embed.html"          # the viewer copy / server-free template
FIGS = DECK / "public" / "figs"

# ---- 1. server-free transforms applied to the viewer copy -----------------
OLD_LOAD = '''async function load(){
  meta=await (await fetch("/meta")).json();
  document.getElementById("src").textContent=`${meta.source}${meta.path?(" · "+meta.path.split(/[\\\\/]/).pop()):""}`;
  buildProjSeg();
  const r=await (await fetch(`/graph?source=${meta.source}&path=${encodeURIComponent(meta.path||"")}`)).json();
  const art=r.artifact||r; G.nodes=art.nodes||[]; G.edges=art.edges||[];
  health=r.health||art.health||{};
  comments=await (await fetch(`/comments?source=${meta.source}&path=${encodeURIComponent(meta.path||"")}`)).json();
  if(sel&&!node(sel)) sel=null;
  path=path.filter(id=>node(id));
  const fr=health.frontier||{loose:[]};
  const nc=(health.contradictions||[]).length;
  document.getElementById("stat").innerHTML=`${G.nodes.length} nodes · ${G.edges.length} edges · ${fr.loose.length} loose`
    +(nc?` · <span style="color:#E74C3C">${nc} contradiction${nc>1?"s":""}</span>`:"");
  render();
}
resize(); load();
setInterval(load, 6000);'''

NEW_LOAD = '''function load(){
  const el=document.getElementById("graph-data");
  let data={nodes:[],edges:[]}; try{ data=JSON.parse(el.textContent); }catch(e){}
  const art=data.artifact||data; G.nodes=art.nodes||[]; G.edges=art.edges||[];
  health=data.health||art.health||{};
  meta={source:(document.body.getAttribute("data-source")||"canon"), path:null};
  const sr=document.getElementById("src"); if(sr) sr.textContent=meta.source;
  buildProjSeg();
  if(sel&&!node(sel)) sel=null;
  path=path.filter(id=>node(id));
  const fr=health.frontier||{loose:[]};
  const nc=(health.contradictions||[]).length;
  const st=document.getElementById("stat");
  if(st) st.innerHTML=`${G.nodes.length} nodes · ${G.edges.length} edges`
    +(fr.loose&&fr.loose.length?` · ${fr.loose.length} loose`:"")
    +(nc?` · <span style="color:#E74C3C">${nc} contradiction${nc>1?"s":""}</span>`:"");
  render();
}
resize(); load();'''

OLD_COMMENTS = '''  const cs=comments[sel]||[];
  html+=`<div class="row"><div class="k">comments (${cs.length})</div>`;
  for(const c of cs) html+=`<div class="cmt">${esc(c.text)}<div class="t">${esc((c.ts||"").slice(0,19).replace("T"," "))}</div></div>`;
  html+=`<textarea id="ctext" rows="4" placeholder="Comment on this node — written beside the source for the next pass…"></textarea><button class="send" id="csend">comment</button></div>`;
  panel.innerHTML=html; wire(panel); wireFigures(panel);
  const sb=document.getElementById("csend"); if(sb) sb.onclick=async()=>{ const t=document.getElementById("ctext").value.trim(); if(!t)return;
    await fetch("/comment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({node:sel,label:n.label,text:t,source:meta.source,path:meta.path})});
    comments=await (await fetch(`/comments?source=${meta.source}&path=${encodeURIComponent(meta.path||"")}`)).json(); renderPanel(); };'''

NEW_COMMENTS = '''  panel.innerHTML=html; wire(panel); wireFigures(panel);'''


def make_template() -> str:
    src = TPL.read_text(encoding="utf-8")
    for old, new, label in [
        (OLD_LOAD, NEW_LOAD, "load()"),
        (OLD_COMMENTS, NEW_COMMENTS, "comments block"),
        ("<title>the conceptric — scale-local view</title>", "<title>__TITLE__</title>", "title"),
        ("<body>", '<body data-source="__SOURCE__">\n<script id="graph-data" type="application/json">__GRAPH_JSON__</script>', "body/data"),
    ]:
        if old not in src:
            raise SystemExit(f"transform FAILED: '{label}' anchor not found - viewer changed?")
        src = src.replace(old, new, 1)
    TPL.write_text(src, encoding="utf-8")
    return src


def build(template: str, graph_json: pathlib.Path, source: str, title: str, out: pathlib.Path) -> None:
    data = json.loads(graph_json.read_text(encoding="utf-8"))
    art = data.get("artifact", data)
    payload = {"nodes": art.get("nodes", []), "edges": art.get("edges", []),
               "health": data.get("health", art.get("health", {}))}
    # escape </ so the JSON cannot close the <script> tag early
    j = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).replace("</", "<\\/")
    html = template.replace("__SOURCE__", source).replace("__TITLE__", title).replace("__GRAPH_JSON__", j)
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out}  ({len(html)} bytes, {len(payload['nodes'])} nodes, {len(payload['edges'])} edges, source={source})")


def main() -> int:
    tpl = make_template()
    import sys
    talk = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path("/tmp/talk-graph.json")
    wiki = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else pathlib.Path("/tmp/wiki-graph-fresh.json")
    build(tpl, talk, "substrate", "The Laws of Learning - derivation spine", FIGS / "talk-graph.html")
    build(tpl, wiki, "canon", "The Laplace canon - scale-local map", FIGS / "wiki-graph.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
