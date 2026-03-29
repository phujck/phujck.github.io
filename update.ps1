$files = Get-ChildItem "*.html"

foreach ($f in $files) {
    $content = Get-Content -Raw $f.FullName -Encoding UTF8
    
    $content = $content -replace '<span class="me">G\. McCaul</span>', '<span class="me">G. M<sup>c</sup>Caul</span>'
    $content = $content -replace 'class="nav-brand">G<span>\.</span>McCaul', 'class="nav-brand">G<span>.</span>M<sup>c</sup>Caul'
    $content = $content -replace '© 2026 Gerard McCaul</p>', '© 2026 Gerard M<sup>c</sup>Caul</p>'
    $content = $content -replace '<h1 class="hero-title">Gerard McCaul</h1>', '<h1 class="hero-title">Gerard M<sup>c</sup>Caul</h1>'
    $content = $content -replace "I'm Gerard McCaul,", "I'm Gerard M<sup>c</sup>Caul,"
    
    Set-Content -Path $f.FullName -Value $content -Encoding UTF8
}

$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <text x="13" y="24" font-family="Outfit, Georgia, serif" font-size="20" font-weight="700" text-anchor="middle" fill="#DAA520">M</text>
  <text x="24" y="14" font-family="Outfit, Georgia, serif" font-size="11" font-weight="700" text-anchor="middle" fill="#DAA520">c</text>
</svg>
"@

Set-Content -Path "favicon.svg" -Value $svg -Encoding UTF8
