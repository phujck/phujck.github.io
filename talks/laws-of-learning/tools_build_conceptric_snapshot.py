"""Build a self-contained static snapshot of the conceptric climax view (slide 13).

Reads the theory-projection graph (R1-R5 + shared-primitive edges) and emits a single
HTML file that needs no server: an inline-SVG theory graph on the left, a node detail
card (R2, with KaTeX maths feeding into 'The Laws of Learning') on the right. This is
the graceful-degradation fallback the deck embeds when the live conceptric viewer's
Python server is not running.

To regenerate: run the live viewer, refetch its graph, then run this.
    python -m laplace.viewer --source substrate --path <ANF>/workflow/state/substrate.md --port 8765
    curl "http://localhost:8765/graph?source=substrate&path=<url-encoded ANF substrate path>" -o public/figs/conceptric_graph.json
    python tools_build_conceptric_snapshot.py
"""
import json, math, html, os

HERE = os.path.dirname(os.path.abspath(__file__))
GRAPH = os.path.join(HERE, "public", "figs", "conceptric_graph.json")
OUT = os.path.join(HERE, "public", "figs", "conceptric_snapshot.html")

d = json.load(open(GRAPH))
a = d["artifact"]
nodes = {n["id"]: n for n in a["nodes"]}

# the five result nodes are the theory layer (the graph that built the talk)
results = [n for n in a["nodes"] if n["kind"] == "result"]
rids = [n["id"] for n in results]

# shares-edges among the results, weighted by shared primitives (induced interactions)
# recompute from the bipartite contains-graph so the snapshot is faithful to the model
draws = {}  # result id -> set of primitive ids it draws
for e in a["edges"]:
    if e["rel"] in ("draws", "contains") and e["src"] in rids:
        draws.setdefault(e["src"], set()).add(e["dst"])
# also read explicit 'shares' edges if the API emits them
explicit = {}
for e in a["edges"]:
    if e["rel"] == "shares" and e["src"] in rids and e["dst"] in rids:
        explicit[frozenset((e["src"], e["dst"]))] = e.get("count", 1)

pairs = {}
for i in range(len(rids)):
    for j in range(i + 1, len(rids)):
        ri, rj = rids[i], rids[j]
        key = frozenset((ri, rj))
        if key in explicit:
            w = explicit[key]
        else:
            w = len(draws.get(ri, set()) & draws.get(rj, set()))
        if w > 0:
            pairs[(ri, rj)] = w

# pentagon layout for R1..R5 (R1 top, clockwise), matching the live viewer's feel
W, H = 620, 600
cx, cy, R = W / 2, H / 2 + 10, 210
order = ["R1", "R2", "R3", "R4", "R5"]
pos = {}
for k, rid in enumerate(order):
    ang = -math.pi / 2 + k * 2 * math.pi / 5
    pos[rid] = (cx + R * math.cos(ang), cy + R * math.sin(ang))

ACCENT = "#d55e00"   # Okabe-Ito orange — result nodes in the viewer
EDGE = "#4A90D9"
INK = "#e6edf3"
DIM = "#7d8794"
BG = "#0e1116"
PANEL = "#161b22"
LINE = "#283041"

# build edges svg (thicker for higher shared-primitive weight)
edge_svg = []
for (ri, rj), w in pairs.items():
    x1, y1 = pos[ri]; x2, y2 = pos[rj]
    sw = 1.2 + 1.3 * w
    edge_svg.append(
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{EDGE}" stroke-width="{sw:.1f}" stroke-opacity="0.75"/>'
    )
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    edge_svg.append(
        f'<text x="{mx:.1f}" y="{my-4:.1f}" fill="{DIM}" font-size="13" '
        f'text-anchor="middle" font-family="ui-sans-serif,Segoe UI,sans-serif">{w}</text>'
    )

node_svg = []
for rid in order:
    x, y = pos[rid]
    hi = rid == "R2"
    fill = "#fff" if hi else ACCENT
    stroke = ACCENT
    node_svg.append(
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="17" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
    )
    node_svg.append(
        f'<text x="{x+24:.1f}" y="{y+5:.1f}" fill="{INK}" font-size="15" '
        f'font-weight="600" font-family="ui-sans-serif,Segoe UI,sans-serif">{rid}</text>'
    )

r2 = nodes["R2"]
summary = ("Susceptibility obeys a power law whose exponent is the log of the "
           "decimation eigenvalue. The dynamical transition is the shadow of the "
           "RG fixed point, and (\\(\\Gamma,\\psi\\)) classify universality.")

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>the conceptric — snapshot</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body,{{delimiters:[{{left:'\\\\(',right:'\\\\)',display:false}},{{left:'$$',right:'$$',display:true}}]}})"></script>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  html,body{{height:100%;background:{BG};color:{INK};
    font:14px/1.55 ui-sans-serif,-apple-system,Segoe UI,Roboto,sans-serif}}
  .wrap{{display:flex;height:100%}}
  .macro{{flex:0 0 56%;position:relative;display:flex;align-items:center;justify-content:center}}
  .macro .lbl,.detail .lbl{{position:absolute;top:12px;left:16px;font-size:11px;color:{DIM};
    text-transform:uppercase;letter-spacing:.6px}}
  .detail{{flex:1;border-left:1px solid {LINE};background:{PANEL};padding:34px 24px 16px;
    display:flex;flex-direction:column}}
  .detail h2{{font-size:17px;margin:3px 0 2px;line-height:1.3}}
  .kind{{color:{DIM};font-size:11px;text-transform:uppercase;letter-spacing:.5px}}
  .badge{{display:inline-block;background:#10243a;color:{EDGE};padding:2px 10px;border-radius:11px;
    font-size:12px;margin:8px 0}}
  .row{{margin:10px 0;padding-top:9px;border-top:1px solid {LINE}}}
  .k{{color:{DIM};font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}}
  .summary{{color:#c2c8d2;font-size:13.5px;line-height:1.5}}
  .math{{background:#0b0f14;border:1px solid {LINE};border-left:3px solid #9B5DE5;border-radius:6px;
    padding:10px 13px;margin:4px 0;font-size:16px}}
  .feeds{{display:inline-flex;align-items:center;gap:8px;background:#0b0f14;border:1px solid {LINE};
    border-radius:13px;padding:5px 12px;font-size:13px}}
  .feeds .dot{{width:9px;height:9px;border-radius:50%;background:{ACCENT}}}
  .note{{margin-top:auto;padding-top:14px;color:{DIM};font-size:10.5px;font-style:italic;line-height:1.45}}
</style></head>
<body>
<div class="wrap">
  <div class="macro">
    <div class="lbl">macro — the theory graph (R1–R5)</div>
    <svg viewBox="0 0 {W} {H}" width="92%" height="92%">
      {''.join(edge_svg)}
      {''.join(node_svg)}
    </svg>
  </div>
  <div class="detail">
    <div class="lbl">node — a result, inside the engine that built the talk</div>
    <div class="kind">result · linked</div>
    <h2>R2 — the susceptibility-exponent law and its RG shadow</h2>
    <span class="badge">linked</span>
    <div class="row"><div class="k">provenance</div>
      one object governs the phases of adaptive systems (the injected goal)</div>
    <div class="row"><div class="k">summary</div>
      <div class="summary">{summary}</div></div>
    <div class="row"><div class="k">derivation</div>
      <div class="math">\\( \\chi_N \\sim A\\,N^{{\\psi}}, \\qquad \\psi = \\log_n \\lambda_0 \\)</div></div>
    <div class="row"><div class="k">feeds into ↑</div>
      <span class="feeds"><span class="dot"></span>The Laws of Learning&nbsp;&nbsp;(idea → engine)</span></div>
    <div class="note">Static snapshot of the live conceptric. The running viewer
      (<code>python -m laplace.viewer … --port 8765</code>) is interactive: descend, climb, reproject.</div>
  </div>
</div>
</body></html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(page)
print("wrote", OUT)
print("results:", rids)
print("shares pairs (weight):", {f"{a}-{b}": w for (a, b), w in sorted(pairs.items(), key=lambda kv: -kv[1])})
