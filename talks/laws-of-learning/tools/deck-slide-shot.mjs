import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
const ROOT='C:/Users/gerar/VScodeProjects/phujck.github.io', BASE='/talks/laws-of-learning-v3'
const OUT=join(ROOT,'talks/laws-of-learning/.shoot'); mkdirSync(OUT,{recursive:true})
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'}
const server=createServer((q,s)=>{try{const u=decodeURIComponent((q.url||'/').split('?')[0].split('#')[0]);let f=join(ROOT,u);if(existsSync(f)&&statSync(f).isDirectory())f=join(f,'index.html');if(!existsSync(f)){s.statusCode=404;return s.end(readFileSync(join(ROOT,'404.html')))}s.setHeader('Content-Type',MIME[extname(f)]||'application/octet-stream');s.end(readFileSync(f))}catch(e){s.statusCode=500;s.end(String(e))}})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const port=server.address().port, origin=`http://127.0.0.1:${port}`
const { chromium } = await import('playwright-chromium')
const b=await chromium.launch({headless:true})
const ctx=await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1})
for(const n of [11,12,13,14]){
  const p=await ctx.newPage(); const errs=[]
  p.on('console',m=>{if(m.type()==='error'&&!/wake lock/i.test(m.text()))errs.push(m.text())})
  p.on('pageerror',e=>{const t=String(e?.message||e);if(!/wake lock/i.test(t))errs.push('PE: '+t)})
  await p.goto(`${origin}${BASE}/#/${n}`,{waitUntil:'commit'}); await p.reload({waitUntil:'networkidle'})
  await p.waitForSelector('[class*="slidev-page"]',{timeout:15000}).catch(()=>{})
  await p.keyboard.press('Space'); await p.waitForTimeout(4000)
  const title=await p.evaluate(()=>{const h=document.querySelector('.slidev-page h1,h1');return h?h.textContent.trim():'(no h1)'}).catch(()=>'(err)')
  const hasIframe=await p.evaluate(()=>document.querySelectorAll('iframe').length).catch(()=>-1)
  await p.screenshot({path:join(OUT,`deck-${n}.png`)})
  console.log(`slide ${n}: "${title}" | iframes=${hasIframe} | errors=${errs.length?errs.join(' ;; '):'none'}`)
  await p.close()
}
await b.close(); server.close()
