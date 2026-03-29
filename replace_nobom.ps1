$files = Get-ChildItem "*.html"

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    
    $content = $content.Replace('<span class="me">G. McCaul</span>', '<span class="me">G. M<sup>c</sup>Caul</span>')
    $content = $content.Replace('class="nav-brand">G<span>.</span>McCaul', 'class="nav-brand">G<span>.</span>M<sup>c</sup>Caul')
    $content = $content.Replace('© 2026 Gerard McCaul', '© 2026 Gerard M<sup>c</sup>Caul')
    $content = $content.Replace('<h1 class="hero-title">Gerard McCaul</h1>', '<h1 class="hero-title">Gerard M<sup>c</sup>Caul</h1>')
    $content = $content.Replace("I'm Gerard McCaul", "I'm Gerard M<sup>c</sup>Caul")
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
}

$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <text x="14" y="24" font-family="Outfit, Georgia, serif" font-size="20" font-weight="700" text-anchor="middle" fill="#DAA520">M</text>
  <text x="25" y="14" font-family="Outfit, Georgia, serif" font-size="11" font-weight="700" text-anchor="middle" fill="#DAA520">c</text>
</svg>
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD\favicon.svg", $svg, $utf8NoBom)
