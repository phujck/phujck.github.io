import os
import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Author list in publications
    content = content.replace('<span class="me">G. McCaul</span>', '<span class="me">G. M<sup>c</sup>Caul</span>')
    
    # 2. Nav brand
    content = content.replace('class="nav-brand">G<span>.</span>McCaul', 'class="nav-brand">G<span>.</span>M<sup>c</sup>Caul')
    
    # 3. Footer
    content = content.replace('Gerard McCaul</p>', 'Gerard M<sup>c</sup>Caul</p>')
    
    # 4. Main Hero title (index.html)
    content = content.replace('<h1 class="hero-title">Gerard McCaul</h1>', '<h1 class="hero-title">Gerard M<sup>c</sup>Caul</h1>')
    
    # 5. About section paragraphs or other text in body? It's fine to leave them or replace specific ones.
    # We will also just replace `G. McCaul, ` with `G. M<sup>c</sup>Caul, ` inside the body if they missed the span.
    # Actually, replacing all McCaul -> M<sup>c</sup>Caul EXCEPT inside <title>, <meta>, <script>, href=...
    # It's safer to just do the highly visible ones first, let's see what happens.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML replacements done.")

# Now for favicon.svg
favicon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <text x="13" y="23" font-family="Outfit, Georgia, serif" font-size="18" font-weight="700" text-anchor="middle" fill="#DAA520">M</text>
  <text x="24" y="14" font-family="Outfit, Georgia, serif" font-size="11" font-weight="700" text-anchor="middle" fill="#DAA520">c</text>
</svg>"""

with open('favicon.svg', 'w', encoding='utf-8') as f:
    f.write(favicon_svg)

print("Favicon updated.")
