"""Build the section-by-section reading edition and its full, scriptless transcripts.

Run without arguments to rebuild the index, HTML and opening from the published
section JSONs. Supply --cost-build with a compiled manuscript directory to
regenerate section texts and figure crops. A standalone submission ZIP can
also be built with --cost-submission. Regeneration requires Poppler, mutool,
Pandoc and Pillow. The build is checked against every page of the public Cost PDF.
Kalmár has no embedded TeX. Its displayed mathematics is transcribed against the
PDF, with checked offsets in the original Poppler text stream.
"""

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from html import escape as esc
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

from PIL import Image

SITE = Path(__file__).resolve().parents[1]
OUT = SITE / "eigenengine/cost-of-complexity/reading"
WEB = "/eigenengine/cost-of-complexity/reading/"
GUIDE = "/eigenengine/guide/"
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]


def call(*args):
    return subprocess.check_output(list(map(str, args))).decode()


def emit(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def pdf_info(pdf):
    dest = call("pdfinfo", "-dests", pdf)
    dp = {n: int(p) for p, n in re.findall(r'^\s*(\d+) .*?"(.*?)"', dest, re.MULTILINE)}
    outline = [
        (re.search(r'"(.*)"', l)[1], re.search(r"nameddest=(.*)", l)[1])
        for l in call("mutool", "show", pdf, "outline").splitlines()
        if "nameddest=" in l
    ]
    return {t: dp[n] for t, n in outline}, dp


def figure_image(paper, num, pdf, page):
    reg = json.loads(
        (SITE / "assets/data/eigenengine-source-regions.json").read_bytes()
    )["regions"]
    rect = (
        [0.075, 0.061, 0.852, 0.53]
        if (paper, num) == ("cost", 1)
        else reg[f"{paper}-fig-{num}"]["rect"]
    )
    with tempfile.TemporaryDirectory() as t:
        prefix = Path(t) / "page"
        subprocess.run(
            [
                "pdftoppm",
                "-f",
                str(page),
                "-l",
                str(page),
                "-r",
                "150",
                "-png",
                "-singlefile",
                str(pdf),
                str(prefix),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        with Image.open(prefix.with_suffix(".png")) as im:
            x, y, w, h = rect
            # Stop above the printed caption; it is reproduced as searchable text in the transcript.
            xml = call("pdftotext", "-bbox", "-f", page, "-l", page, pdf, "-")
            words = ElementTree.fromstring(re.sub(r"[\x00-\x08\x0b-\x1f]", "", xml))
            matches = [
                float(word.attrib["yMin"]) / 792
                for word in words.iter()
                if word.tag.endswith("}word")
                and word.text == "FIG."
                and x <= float(word.attrib["xMin"]) / 612 < x + w
                and y < float(word.attrib["yMin"]) / 792 < y + h
            ]
            assert len(matches) == 1, (paper, num, matches)
            fig = im.crop(
                (
                    round(x * im.width),
                    round(y * im.height),
                    round((x + w) * im.width),
                    round((matches[0] - 0.004) * im.height),
                )
            ).convert("RGB")
            name = f"{paper}/figure-{num}.webp"
            dst = OUT / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            fig.save(dst, lossless=True)
    return WEB + name


def packet(paper, id, label, title, kind, pages, text, figures=()):
    d = {
        "id": id,
        "label": label,
        "title": title,
        "kind": kind,
        "pages": list(pages),
        "url": WEB + f"{paper}/{id}.json",
        "text": text.strip(),
        "figures": list(figures),
    }
    emit(OUT / f"{paper}/{id}.json", d)
    return d


def brace(s, at):
    assert s[at] == "{"
    depth = 0
    for i in range(at, len(s)):
        if i > 0 and s[i - 1] == "\\":
            continue
        if s[i] == "{":
            depth += 1
        if s[i] == "}":
            depth -= 1
            if not depth:
                return s[at + 1 : i], i + 1
    raise ValueError(s[at : at + 160])


def wrap_command(s, cmd, replace):
    rx = re.compile(r"\\" + cmd + r"\s*\{")
    pos = 0
    while m := rx.search(s, pos):
        part, end = brace(s, m.end() - 1)
        v = replace(part)
        s = s[: m.start()] + v + s[end:]
        pos = m.start() + len(v)
    return s


def references(raw):
    m = re.search(r"(?m)^\[1\]\s", raw)
    raw = raw[m.start() :]
    raw = re.sub(r"\f\d+\n?", "", raw).replace("\f", "")
    entries = re.split(r"(?m)^\[(\d+)\]\s", raw)
    refs = []
    for n, body in zip(entries[1::2], entries[2::2]):
        spelling = re.sub(
            r"\b(self|many|high|low|long|short|non|half|multi|large|two)-\n",
            r"\1-",
            body.strip(),
        )
        spelling = re.sub(r"(?<=[A-Za-z])-\n(?=[a-z])", "", spelling)
        spelling = re.sub(r"(https?://\S+/)\n", r"\1", spelling)
        refs.append(
            f"[{n}] " + unicodedata.normalize("NFC", " ".join(spelling.split()))
        )
    return "\n\n".join(refs)


def generate_cost(src):
    pdf = SITE / "eigenengine/guide/the-cost-of-complexity.pdf"
    if (
        hashlib.sha256(pdf.read_bytes()).hexdigest()
        != "3f99bae5393b10ffd28e049e6d4955b69568e7371a54edd8c46d3b9c346586a6"
    ):
        raise ValueError("Unexpected edition of The Cost of Complexity")
    assert call("pdftotext", "-raw", src / "main.pdf", "-") == call(
        "pdftotext", "-raw", pdf, "-"
    ), "The source build must reproduce the released PDF text"
    titles, _dest = pdf_info(pdf)
    aux = (src / "main.aux").read_text()
    labels = {
        k: (n, int(p))
        for k, n, p in re.findall(r"\\newlabel\{([^{}]+)\}\{\{([^{}]*)\}\{(\d+)\}", aux)
    }
    cite = {k: n for k, n in re.findall(r"\\bibcite\{([^}]+)\}\{\{(\d+)\}", aux)}
    assert len(cite) == 68
    number = 0
    theorem = 0
    footnotes = 0
    figures = []

    def render(tex, appendix=""):
        nonlocal number, theorem, footnotes
        tex = re.sub(r"(?<!\\)%[^\n]*(?:\n|$)", "", tex)
        tex = wrap_command(
            tex,
            "cite",
            lambda x: "[" + ", ".join(cite[k.strip()] for k in x.split(",")) + "]",
        )
        tex = wrap_command(tex, "eqref", lambda x: "(" + labels[x][0] + ")")
        tex = wrap_command(tex, "ref", lambda x: labels[x][0])

        # Figure captions remain at their source location. The figure pixels come from the released page.
        def float_fig(m):
            item = m[1]
            label = re.findall(r"\\label\{(fig:[^}]+)\}", item)[-1]
            n, p = labels[label]
            start = item.index(r"\caption{") + len(r"\caption")
            cap = render(brace(item, start)[0])
            figures.append(
                {
                    "label": "Figure " + n,
                    "page": p,
                    "caption": cap,
                    "image": figure_image("cost", int(n), pdf, p),
                }
            )
            return "\n\nFIGUREHOLDER" + n + "ENDHOLDER\n\n"

        tex = re.sub(
            r"\\begin\{figure\*?\}(.*?)\\end\{figure\*?\}",
            float_fig,
            tex,
            flags=re.DOTALL,
        )

        def foot(v):
            nonlocal footnotes
            footnotes += 1
            return " [Footnote " + str(footnotes) + ". " + v + "] "

        tex = wrap_command(tex, "footnote", foot)

        def theorem_start(m):
            nonlocal theorem
            tag = m[1]
            name = m[2] or ""
            if tag == "theorem":
                theorem += 1
                tag = "Theorem " + str(theorem)
            return (
                "\n\n" + tag.capitalize() + (" (" + name + ")" if name else "") + ". "
            )

        tex = re.sub(
            r"\\begin\{(theorem|observation|proof)\}(?:\[([^\]]+)\])?",
            theorem_start,
            tex,
        )
        tex = re.sub(r"\\end\{(?:theorem|observation|proof)\}", "\n\n", tex)
        tex = wrap_command(tex, "subsection\\*?", lambda v: "\n\n" + v + "\n\n")
        math = []

        def token(value):
            index = len(math)
            math.append(value)
            return "TEXFORMULA" + str(index) + "ENDMATH"

        def equation(m):
            nonlocal number
            number += 1
            n = appendix + str(number)
            eq = m[1].strip()
            numbered = re.findall(r"\\label\{([^}]+)\}", eq)
            assert all(labels[k][0] == n for k in numbered), (
                n,
                numbered,
                [labels[k] for k in numbered],
            )
            eq = re.sub(r"\\label\{[^}]+\}", "", eq).strip()
            return "\n\n" + token("$$\n" + eq + " \\tag{" + n + "}\n$$") + "\n\n"

        tex = re.sub(
            r"\\begin\{equation\}(.*?)\\end\{equation\}", equation, tex, flags=re.DOTALL
        )
        tex = re.sub(
            r"\\\[(.*?)\\\]",
            lambda m: "\n\n" + token("$$\n" + m[1].strip() + "\n$$") + "\n\n",
            tex,
            flags=re.DOTALL,
        )
        tex = re.sub(
            r"(?<!\\)\$([^$]+?)\$",
            lambda m: token("$" + re.sub(r"\s+", " ", m[1]).strip() + "$"),
            tex,
            flags=re.DOTALL,
        )
        tex = re.sub(r"\\label\{[^}]+\}", "", tex)
        text = subprocess.run(
            ["pandoc", "-f", "latex", "-t", "plain", "--wrap=none"],
            input=tex,
            text=True,
            stdout=subprocess.PIPE,
            check=True,
        ).stdout
        text = re.sub(r"TEXFORMULA(\d+)ENDMATH", lambda m: math[int(m[1])], text)
        text = re.sub(
            r"FIGUREHOLDER(\d+)ENDHOLDER",
            lambda m: next(
                f["label"] + ". " + f["caption"]
                for f in figures
                if f["label"] == "Figure " + m[1]
            ),
            text,
        )
        text = text.replace(r"\rank", "r").replace(r"\cost", "K")
        return text.strip()

    main = (src / "main.tex").read_text()
    inputs = re.findall(r"^\\input\{([^}]+)\}", main, re.MULTILINE)
    abstract = render((src / (inputs[0] + ".tex")).read_text())
    data = []
    for i, f in enumerate(inputs[1:]):
        text = (src / (f + ".tex")).read_text()
        heading = re.search(r"\\section\{([^}]+)\}", text)
        figures = []
        body = render(text[heading.end() :])
        title = heading[1]
        data.append(
            (ROMAN[i].lower(), ROMAN[i], title, "section", titles[title], body, figures)
        )
    ack = re.search(
        r"\\begin\{acknowledgments\}(.*?)\\end\{acknowledgments\}", main, re.DOTALL
    )[1]
    data.append(
        (
            "acknowledgments",
            "",
            "Acknowledgments",
            "acknowledgments",
            titles["Acknowledgments"],
            render(ack),
            [],
        )
    )
    apps = re.split(
        r"\\section\{([^}]+)\}",
        main.split("\\appendix", 1)[1].split("\\bibliographystyle", 1)[0],
    )
    for i, (title, content) in enumerate(zip(apps[1::2], apps[2::2])):
        letter = chr(65 + i)
        number = 0
        title = render(title)
        data.append(
            (
                "appendix-" + letter.lower(),
                "Appendix " + letter,
                title,
                "appendix",
                titles[title],
                render(content, letter),
                [],
            )
        )
    raw = call("pdftotext", "-raw", pdf, "-")
    refs = references(raw)
    assert refs.startswith("[1] ") and "[68] " in refs
    data.append(
        ("references", "", "References", "references", titles["References"], refs, [])
    )
    out = []
    for i, (id, l, t, kind, p, tx, fig) in enumerate(data):
        end = data[i + 1][4] if i + 1 < len(data) else 21
        # The publication switches to a new page between some complete sections.
        if id == "acknowledgments":
            end = 16
        end = max([end, *[f["page"] for f in fig]])
        out.append(packet("cost", id, l, t, kind, [p, end], tx, fig))
    ar = packet("cost", "abstract", "", "Abstract", "abstract", [1, 1], abstract)
    return {
        "id": "cost",
        "title": "The Cost of Complexity: A Physical Theory of Representation",
        "pdf": GUIDE + pdf.name,
        "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
        "abstract": abstract,
        "abstractUrl": ar["url"],
        "sourceNote": "Prose and mathematical expressions from the Writing App manuscript of 23 November 2026. Its compiled text was checked on all 21 pages. Figure images are crops of the PDF.",
        "sections": out,
    }


# Typeset mathematics transcribed from the dated 8-page PDF. Ranges refer to
# Poppler's raw-order lines, with floats and their captions removed before joining prose.
EQ = {
    (
        66,
        68,
    ): r"K_{\mathrm{reg}}(N)=\inf_{\mathcal R\in\mathcal A_N} B_{\mathcal R}(N).",
    (71, 71): r"K_{\mathrm{reg}}(mn)\le K_{\mathrm{reg}}(m)+K_{\mathrm{reg}}(n),",
    (73, 73): r"\kappa_\infty\ln N\le K_{\mathrm{reg}}(N).",
    (75, 75): r"K_{\mathrm{reg}}(n)=K_0+\kappa\ln n,",
    (
        83,
        91,
    ): r"p(r\mid\lambda)=\frac{r^{-\lambda}}{Z_R(\lambda)},\qquad Z_R(\lambda)=\sum_{r=1}^{R}r^{-\lambda},",
    (99, 109): r"\lim_{R\to\infty}\frac{C_R(1+x/L)}{L}=c(x):=\frac1x-\frac{1}{e^x-1},",
    (
        131,
        133,
    ): r"\langle K\rangle_p-\kappa H(p)=\bigl(K_0-\kappa\ln H_R\bigr)+\kappa D(p\Vert h),",
    (142, 142): r"K_0\ge\kappa\ln H_R=\kappa\ln\ln R+O(1/\ln R).",
    (149, 156): r"r=1+\sum_{i=1}^{k}(j_i-1)\prod_{l>i}n_l.",
    (170, 173): r"H(N)=\sum_{d\mid N,\,d>1}H(N/d).",
    (
        175,
        187,
    ): r"\sum_{N\ge 1}\frac{H(N)}{N^s}=\sum_{k\ge 0}\bigl(\zeta(s)-1\bigr)^k=\frac{1}{2-\zeta(s)}.",
    (
        191,
        198,
    ): r"\sum_{N\le x}H(N)=\frac{x^\rho}{-\rho\zeta^{\prime}(\rho)}\bigl(1+o(1)\bigr),",
    (201, 202): r"H(N)\le N^\rho",
    (
        224,
        228,
    ): r"B(n_1,\ldots,n_k)=\sum_{i=1}^{k}K_{\mathrm{reg}}(n_i)=kK_0+\kappa\ln N.",
    (236, 237): r"\zeta(\lambda_c)=1+e^{\lambda_c k_0}",
    (
        239,
        248,
    ): r"\Omega(b)=\frac{e^{\lambda_c b}}{\lambda_c m}\bigl(1+o(1)\bigr),\qquad m=k_0-\frac{\zeta^{\prime}(\lambda_c)}{\zeta(\lambda_c)-1},",
    (250, 254): r"\lim_{b\to\infty}\frac{\ln\Omega(b)}{b}=\lambda_c.",
    (298, 299): r"1<\lambda_c<1+e^{-k_0}.",
    (
        365,
        373,
    ): r"P(n_1,\ldots,n_k)=\frac{1}{\Xi}\prod_{i=1}^k z\,n_i^{-\lambda},\qquad z=e^{-\lambda k_0},",
    (
        439,
        449,
    ): r"\Xi(\lambda)=\sum_{k\ge0}q^k=\frac{1}{1-q},\qquad q=e^{-\lambda k_0}\bigl(\zeta(\lambda)-1\bigr).",
    (454, 458): r"P(k)=(1-q)q^k,\qquad\langle k\rangle=\frac{q}{1-q}.",
    (461, 464): r"P(n)=\frac{n^{-\lambda}}{\zeta(\lambda)-1},\qquad n\ge2.",
    (494, 494): r"1<\lambda_c\le\rho=1.7286\ldots,",
    (504, 507): r"\theta(N)=\frac{\ln H(N)}{\ln N},",
    (
        514,
        521,
    ): r"\begin{aligned}K_{\mathrm{self}}(N)&\ge\kappa_\infty[1+\theta(N)]\ln N,\\ K_{\mathrm{self}}(N)&\le K_{\mathrm{reg}}(N)+K_{\mathrm{reg}}\bigl(H(N)\bigr),\end{aligned}",
    (551, 554): r"\Lambda(N)\le\frac{\ln N}{1-\theta}.",
    (561, 565): r"\Lambda(p^k)=k\ln p+\frac{k(k-1)}{2}\ln 2.",
    (574, 577): r"\Lambda(N)=\frac{\ln N\,(\log_2N+1)}{2},",
    (616, 616): r"A_2(k)=A_1(k)+A_2(k-1),\qquad A_2(1)=1,",
    (629, 629): r"A_n(k)=A_{n-1}(k)+A_n(k-1),\qquad A_n(1)=1,",
    (639, 650): r"A_n(k)=\binom{k+n-1}{n}=\frac{(\log_2 N)^n}{n!}\bigl[1+O(1/k)\bigr].",
    (
        716,
        725,
    ): r"\sum_{n\ge0}A_n(k)x^n=(1-x)^{-k}=N^\alpha,\qquad\alpha=\log_2\frac{1}{1-x}.",
    (
        740,
        749,
    ): r"\frac{N^\alpha-1}{\alpha}=\frac{1}{\alpha}\sum_{n\ge1}A_n(\log_2N)x^n,",
    (754, 758): r"\sum_{n\ge0}A_n(k)2^{-n}=2^k=N,",
    (
        836,
        850,
    ): r"H(N)\le\sum_{d\mid N,\,d>1}\left(\frac{N}{d}\right)^\rho<N^\rho\sum_{d\ge2}d^{-\rho}=N^\rho\bigl(\zeta(\rho)-1\bigr)=N^\rho.",
    (
        865,
        871,
    ): r"q(\lambda)=\int e^{-\lambda s}\,\nu(ds)=e^{-\lambda k_0}\bigl(\zeta(\lambda)-1\bigr),",
    (
        888,
        898,
    ): r"m=\sum_{n\ge2}(k_0+\ln n)\,e^{-\lambda_c k_0}n^{-\lambda_c}=k_0-\frac{\zeta^{\prime}(\lambda_c)}{\zeta(\lambda_c)-1}<\infty.",
    (
        906,
        921,
    ): r"e^{-\lambda_c b}\Omega(b)=\int_0^b e^{-\lambda_c(b-s)}\,U(ds)\longrightarrow\frac1m\int_0^\infty e^{-\lambda_c t}\,dt=\frac1{\lambda_c m}",
    (
        930,
        942,
    ): r"\sum_{r=1}^R\frac1r f\left(\frac{\ln r}{L}\right)=L\int_0^1 f(t)\,dt+O(1).",
    (
        950,
        967,
    ): r"\frac{C_R}{L}=\frac{\int_0^1te^{-xt}\,dt}{\int_0^1e^{-xt}\,dt}+O(1/L)=\frac1x-\frac1{e^x-1}+O(1/L).",
    (972, 975): r"\langle K\rangle_p=K_0-\kappa\ln H_R-\kappa\sum_r p(r)\ln h(r),",
    (1030, 1045): r"\binom{k+n-1}{n}=\sum_{j=0}^n\binom{n-1}{n-j}\binom{k}{j},",
}
MID = {
    (
        17,
        23,
    ): r"organisation needs range $NH(N)$, with $H(N)\le N^\rho$. Closing that account for a binary register of k digits costs k(k + 1)/2 digits. Iterating the construction gives a hierarchy with cost $\binom{k+n-1}{n}$ at level n, whose generating function is a power law in N.",
    (
        93,
        95,
    ): r"family are used below. Write $C_R(\lambda)=\sum_r p(r\mid\lambda)\ln r$ for",
    (127, 129): r"be the harmonic distribution with $H_R=\sum_{r\le R}1/r$, and",
    (
        311,
        314,
    ): r"of the letters sum to one [14]. Here that condition is $\sum_{n\ge2} e^{-\lambda(k_0+\ln n)}=1$, which is Eq. (15). The constant",
    (
        330,
        333,
    ): r"root of $\sum_{n\in S}e^{-\lambda b_n}=1$. If the $b_n$ are the lengths of a",
    (
        510,
        512,
    ): r"budget $K_{\mathrm{self}}(N)=K_{\mathrm{reg}}\bigl(NH(N)\bigr)$ of a register holding",
    (
        537,
        541,
    ): r"Definition 2. The organisation tower of N is the sequence $N_0=N$, $N_{t+1}=H(N_t)$. The tower closes if $N_T=1$ for some T, and its closure cost is $\Lambda(N)=\sum_{t<T}\ln N_t$.",
    (
        542,
        547,
    ): r"A closed tower holds $\prod_t N_t$ joint alternatives, so its budget lies between $\kappa_\infty\Lambda(N)$ and $\sum_{t<T}K_{\mathrm{reg}}(N_t)$.",
    (
        549,
        550,
    ): r"1. If $\theta(N_t)\le\theta<1$ for every level of the tower, then the tower closes and",
    (
        555,
        560,
    ): r"2. For $N=p^k$ with p prime the tower is $p^k,2^{k-1},2^{k-2},\ldots,1$ and",
    (566, 567): r"For p = 2 this is $\tfrac12k(k+1)\ln 2$.",
    (797, 799): r"nodes. Their number grows exponentially, as $(3+2\sqrt2)^N$",
    (
        852,
        855,
    ): r"Let $s_n=k_0+\ln n$ for $n\ge2$ and let $\nu=\sum_{n\ge2}\delta_{s_n}$.",
    (
        856,
        861,
    ): r"An organisation is a finite sequence of steps $s_{n_i}$ and its budget is their sum, so $\Omega(b)=\sum_{k\ge0}\nu^{*k}([0,b])$. The",
    (
        876,
        883,
    ): r"≤ 1, λ_c ≤ ρ with equality only at k₀ = 0, and λ_c decreases with $k_0$. From $\zeta(\lambda)-1<\int_1^\infty x^{-\lambda}\,dx=1/(\lambda-1)$ we get $e^{\lambda_c k_0}<1/(\lambda_c-1)$, which gives Eq. (18).",
    (
        884,
        887,
    ): r"The tilted measure $P^*(ds)=e^{-\lambda_c s}\nu(ds)$ is a probability distribution on $(0,\infty)$ with mean",
    (
        900,
        905,
    ): r"$s_2=\ln2$ are incommensurable. Let $U=\sum_{k\ge0}P^{*k}$ be its renewal measure. Then $\Omega(db)=e^{\lambda_c b}U(db)$ and",
    (
        943,
        949,
    ): r"At $\lambda=1+x/L$ the weight is $r^{-\lambda}=r^{-1}e^{-x\ln r/L}$. Taking $f(t)=e^{-xt}$ and $f(t)=te^{-xt}$,",
    (976, 978): r"and $-\sum_r p\ln h=H(p)+D(p\Vert h)$.",
    (
        980,
        992,
    ): r"in $db$ is $e^{-\lambda b}\Omega(db)=e^{-(\lambda-\lambda_c)b}U(db)$. By the renewal theorem $U([a,a+h])\to h/m$, so for continuous g on [0, 1], $L^{-1}\int_0^L g(b/L)\,U(db)\to m^{-1}\int_0^1g(t)\,dt$. At $\lambda=\lambda_c+x/L$ the weight is $e^{-xb/L}$ and the calculation above applies.",
    (
        999,
        1006,
    ): r"Proposition 4. (i) $\ln N_{t+1}\le\theta\ln N_t$ gives $\ln N_t\le\theta^t\ln N$. The ranges are integers, so the tower reaches one, and the geometric series gives Eq. (26). (ii) $H(p^k)=2^{k-1}$, the number of compositions of k, for every prime p. (iii) is immediate.",
    (
        1008,
        1028,
    ): r"(i) $\binom{k+n-1}{n}$ satisfies Pascal’s rule $\binom{k+n-1}{n}=\binom{k+n-2}{n-1}+\binom{k+n-2}{n}$, which is Eq. (30), and equals one at k = 1 and at n = 0. (ii) $A_n(k+1)=\binom{k+n}{n}=\binom{k+n}{k}=A_k(n+1)$.",
    (
        1046,
        1055,
    ): r"with coefficient one at $j=n$. The change from $\{\binom{k}{j}\}$ to $\{A_n\}$ is therefore unitriangular over the integers, and the binomial coefficients $\binom{k}{j}$ are a basis for the integer-valued polynomials [21]. (iv) is the negative binomial series, and",
    (1056, 1058): r"$(1-x)^{-k}=2^{k\log_2[1/(1-x)]}$.",
    (
        1064,
        1068,
    ): r"local exponent of $\sum_{n\le N} H(n)$ between $N=10^5$ and $10^6$ is 1.730. The partial sum of Eq. (11) over $N\le 2\times10^6$",
}
# Locations of paragraph boundaries in the PDF's text stream.
PARAS = {
    33,
    41,
    48,
    69,
    72,
    74,
    76,
    80,
    97,
    115,
    122,
    125,
    136,
    141,
    145,
    159,
    166,
    174,
    199,
    207,
    220,
    229,
    234,
    300,
    305,
    319,
    328,
    359,
    452,
    453,
    459,
    465,
    467,
    475,
    478,
    484,
    486,
    499,
    509,
    525,
    535,
    537,
    542,
    548,
    549,
    555,
    568,
    570,
    582,
    585,
    608,
    613,
    627,
    631,
    636,
    638,
    651,
    713,
    715,
    726,
    735,
    759,
    761,
    767,
    778,
    787,
    792,
    804,
    807,
    812,
    817,
    830,
    834,
    852,
    884,
    899,
    928,
    943,
    968,
    971,
    979,
    995,
    999,
    1008,
    1029,
    1060,
    1071,
    1077,
    1085,
    1095,
}
SPECS = [
    ("i", "I", "Introduction", 25, 59, (1, 1)),
    ("ii", "II", "Setting", 62, 142, (1, 2)),
    ("iii", "III", "Organisations of a positional register", 145, 218, (2, 3)),
    ("iv", "IV", "The capacity of organisation", 220, 357, (2, 3)),
    ("v", "V", "The ensemble of organisations", 359, 497, (3, 4)),
    ("vi", "VI", "Self-indexing registers", 499, 606, (4, 5)),
    ("vii", "VII", "The reflective hierarchy", 608, 776, (5, 6)),
    ("viii", "VIII", "Outlook", 778, 819, (6, 7)),
    ("acknowledgments", "", "Acknowledgments", 821, 828, (7, 7)),
    ("appendix-a", "Appendix A", "The bound on H(N)", 830, 850, (7, 7)),
    ("appendix-b", "Appendix B", "Proof of Theorem 1", 852, 926, (7, 7)),
    ("appendix-c", "Appendix C", "Pinning", 928, 992, (7, 7)),
    ("appendix-d", "Appendix D", "Self-indexing and closure", 995, 1006, (8, 8)),
    ("appendix-e", "Appendix E", "Proof of Theorem 4", 1008, 1058, (8, 8)),
    ("appendix-f", "Appendix F", "Numerical checks", 1060, 1100, (8, 8)),
    ("references", "", "References", 1101, 1149, (8, 8)),
]
# The first citation of a composite figure can precede the section that gives all of its results.
FIGS = {
    "iii": (
        1,
        3,
        "(a) The eight positional organisations of sixteen ranked symbols, labelled by their ordered factorisation and depth k. Orange lines are register boundaries, drawn shorter at each deeper level. The organisations 2 · 8 and 8 · 2 are panels (b) and (c) of Fig. 2 in Ref. [1]. (b) Number of positional organisations H(N) for $2 \\le N \\le 10^6$ (grey points), computed from Eq. (10). Blue line: the bound $N^\\rho$ of Eq. (13). Black line: H = N. Orange markers: the six ranges in this interval with H(N) = N.",
    ),
    "v": (
        2,
        4,
        r"(a) Critical multiplier $\lambda_c$ against existence cost $K_0/\kappa$, from Eq. (15). Above the line the ensemble of organisations is normalised and has finite mean depth. In the shaded region the partition sum of Eq. (20) diverges. (b) Number of organisations $\Omega(b)$ of budget at most b, multiplied by $e^{-\lambda_c b}$, counted exactly for ranges up to $10^6$. Horizontal lines: the limits $1/(\lambda_c m)$ of Theorem 1. (c) Mean depth $\langle k\rangle=q/(1-q)$ of the ensemble, Eq. (21). Vertical lines mark $\lambda_c$.",
    ),
    "vii": (
        3,
        6,
        r"(a) Closure ratio $\Lambda(N)/\ln N$ for the organisation towers that close, $2\le N\le10^4$ (grey points). Blue: $N=2^k$, where the ratio is $(k+1)/2$ by Eq. (27). Orange marks along the top: the 817 ranges whose tower reaches a fixed point or a cycle of H. (b) Closure cost $A_n(k)=\binom{k+n-1}{n}$ of a binary register of k digits at reflective levels $n=1,\ldots,4$, in digits, from Theorem 4. Black line: $\sum_n A_n(k)2^{-n}=2^k$.",
    ),
}
FLOAT_LINES = [(256, 295), (337, 349), (375, 437), (592, 606), (654, 712), (862, 863)]
# Ordinary PDF text carries only glyphs, so give inline superscripts and
# subscripts a linear mathematical spelling outside the transcribed displays.
SUB = [
    ("exp(λcB/κ)", "exp(λ_c B/κ)"),
    ("exp(λcK0/κ)", "exp(λ_c K₀/κ)"),
    ("eλcK0/κ", "exp(λ_c K₀/κ)"),
    ("e−λu", "exp(−λu)"),
    ("e−ρk0", "exp(−ρ k₀)"),
    ("e−λct", "exp(−λ_c t)"),
    ("e−λcb", "exp(−λ_c b)"),
    ("eρ", "e^ρ"),
    ("eu", "e^u"),
    ("n−λc", "n^(−λ_c)"),
    ("n−λ", "n^(−λ)"),
    ("Nρ−ε", "N^(ρ−ε)"),
    ("N−λ", "N^(−λ)"),
    ("Nρ", "N^ρ"),
    ("Nα", "N^α"),
    ("2k−1", "2^(k−1)"),
    ("2k", "2^k"),
    ("2j", "2^j"),
    ("pk", "p^k"),
    ("nk−1", "n^(k−1)"),
    ("(1−x)xn", "(1−x)x^n"),
    ("gα", "g_α"),
    ("κα", "κ_α"),
    ("BR(N)", "B_ℛ(N)"),
    ("IK(", "I_K("),
    ("Kreg", "K_reg"),
    ("Kself", "K_self"),
    ("κ∞", "κ_∞"),
    ("AN", "𝒜_N"),
    ("λR", "λ_R"),
    ("λc", "λ_c"),
    ("k0", "k₀"),
    ("K0", "K₀"),
    ("Z∞", "Z_∞"),
    ("ZR", "Z_R"),
    ("HR", "H_R"),
    ("CR", "C_R"),
    ("log2", "log₂"),
    ("A0", "A₀"),
    ("A1", "A₁"),
    ("A2", "A₂"),
    ("A3", "A₃"),
    ("An−1", "Aₙ₋₁"),
    ("An(", "Aₙ("),
    ("Ak(", "Aₖ("),
    ("n1", "n₁"),
    ("n2", "n₂"),
    ("nk", "nₖ"),
    ("ni", "nᵢ"),
    ("j1", "j₁"),
    ("jk", "jₖ"),
    ("ji", "jᵢ"),
    ("s3", "s₃"),
    ("s4", "s₄"),
    ("s2", "s₂"),
    ("rHR", "r H_R"),
    (" IK ", " I_K "),
    ("budgets bn", "budgets bₙ"),
    ("limN→∞", "lim_(N→∞)"),
    ("̸=", "≠"),
    ("...", "…"),
    (". . .", "…"),
]


def generate_kalmar():
    pdf = SITE / "eigenengine/guide/physical-origins-of-the-kalmar-constant.pdf"
    actual = hashlib.sha256(pdf.read_bytes()).hexdigest()
    assert actual == "456564aa0c4951035cffb734b65d314e20fe1b0b511215f7907276aae500bb2c"
    raw = call("pdftotext", "-raw", pdf, "-")
    assert (
        hashlib.sha256(raw.encode()).hexdigest()
        == "116f18e4da170313cb9d6a608d52c1f2ad812ea35647da23ac8d726616c208ca"
    ), "The transcribed ranges require the verified Poppler text of this edition"
    lines = raw.split("\n")
    assert lines[23] == "I. INTRODUCTION" and lines[1099].endswith("k ≤ 24.")
    replace = {}
    equation_ids = [
        *map(str, range(1, 35)),
        "A1",
        "B1",
        "B2",
        "B3",
        "C1",
        "C2",
        "C3",
        "E1",
    ]
    assert len(equation_ids) == len(EQ)
    for ((first, last), eq), tag in zip(EQ.items(), equation_ids):
        assert f"({tag})" in " ".join(lines[first - 1 : last]), tag
        replace[first] = (last, "\n\n$$\n" + eq + r" \tag{" + tag + "}\n$$\n\n")
    for (first, last), value in MID.items():
        replace[first] = (last, value)
    for first, last in FLOAT_LINES:
        replace[first] = (last, "")

    def clean(s):
        s = unicodedata.normalize("NFC", s)
        # Preserve semantic hyphens at line breaks; join typographical word breaks.
        s = re.sub(
            r"\b(self|maximum|mixed|non|prime|factor|Kalmár|value|integer|power|size|fixed|upper|lower|state|pre|two|three|level|post|long|four|scale|micro|self)[-]\n(?=[a-z])",
            r"\1-@JOIN@",
            s,
        )
        s = re.sub(r"(?<=[A-Za-z])-\n(?=[a-z])", "", s).replace("-@JOIN@", "-")
        s = re.sub(r"(?<!\n)\n(?!\n)", " ", s)
        s = re.sub(r" *\n\n *", "\n\n", s)
        s = re.sub(r"[ \t]+", " ", s)
        # Avoid changing the TeX fragments when normalising the inline physical notation.
        chunks = re.split(r"(\$\$.*?\$\$|\$[^$]*\$)", s, flags=re.DOTALL)

        def norm(t):
            for a, b in SUB:
                if a.isascii() and a.isalpha():
                    t = re.sub(r"\b" + re.escape(a) + r"\b", b, t)
                else:
                    t = t.replace(a, b)
            t = re.sub(r"\b10(18|[3-7])\b", r"10^\1", t)
            t = re.sub(r"\b(n|j)₁n₂", r"\1₁ n₂", t)
            t = (
                re.sub(r" +([,.);])", r"\1", t)
                .replace("′ (", "′(")
                .replace("µ m", "µm")
            )
            return t

        text = "".join(norm(t) if i % 2 == 0 else t for i, t in enumerate(chunks))
        return re.sub(r"\n{3,}", "\n\n", text).strip()

    def passage(start, end):
        i = start
        parts = []
        while i <= end:
            if i in PARAS and parts:
                parts.append("")
            if i in replace:
                last, s = replace[i]
                assert last <= end
                if s:
                    parts.append(s)
                i = last + 1
                continue
            row = lines[i - 1]
            if not row.startswith("\f") and row:
                parts.append(row)
            i += 1
        return clean("\n".join(parts))

    abstract = passage(6, 23)
    out = []
    for id, label, title, start, end, pages in SPECS:
        kind = (
            "section"
            if label in ROMAN
            else "appendix"
            if label.startswith("Appendix")
            else id
        )
        text = references(raw) if id == "references" else passage(start, end)
        figs = []
        if id == "acknowledgments":
            text = (
                text.replace("unpriced.1", "unpriced.[1]")
                + "\n\nFootnote 1. "
                + clean("\n".join(lines[861:863]))[2:]
            )
        if id in FIGS:
            n, p, cap = FIGS[id]
            figs = [
                {
                    "label": f"Figure {n}",
                    "page": p,
                    "caption": cap,
                    "image": figure_image("kalmar", n, pdf, p),
                }
            ]
            text += "\n\nFigure " + str(n) + ". " + cap
        if id == "iv":
            text += (
                "\n\nTable I. Critical multiplier λ_c from Eq. (15), mean step m and limit 1/(λ_c m) from Eq. (16), and the bound e^(−k₀) on λ_c − 1.\n\nK₀/κ | λ_c | m | 1/(λ_c m) | e^(−k₀)\n"
                + "\n".join(" | ".join(l.split()) for l in lines[341:349])
            )
        if id == "vi":
            text += "\n\nTable II. Number of organisations H(N), architectural freedom θ(N) and organisation tower for selected ranges. The last row has the largest θ(N) for N ≤ 10^6.\n\nN | H(N) | θ(N) | tower\n"
            rows = [
                *lines[596:601],
                "2304 8192 1.164 2304, 2^13, 2^12, …, 1",
                *lines[604:606],
            ]
            text += "\n".join(" | ".join(l.split(maxsplit=3)) for l in rows)
        assert not re.search(r"[\x00-\x08\x0b-\x1f]", text), (
            id,
            repr(text[re.search(r"[\x00-\x08\x0b-\x1f]", text).start() - 40 :][:100]),
        )
        out.append(packet("kalmar", id, label, title, kind, pages, text, figs))
    ar = packet("kalmar", "abstract", "", "Abstract", "abstract", [1, 1], abstract)
    return {
        "id": "kalmar",
        "title": "Physical origins of the Kalmár constant",
        "pdf": GUIDE + pdf.name,
        "sha256": actual,
        "abstract": abstract,
        "abstractUrl": ar["url"],
        "sourceNote": "Transcribed from the published eight-page PDF (draft of 19 November 2026). Mathematical typography is represented in linear text and TeX. Figure images are crops of the PDF.",
        "sections": out,
    }


# The short index contains abstracts and bibliographic metadata, without section bodies.
def join(papers):
    for paper in papers:
        paper["author"] = "Gerard McCaul"
        paper["affiliation"] = "EigenEngine"
        paper["correspondence"] = "eigen@gmccaul.co.uk"
        paper["readingUrl"] = WEB + paper["id"] + "/"
        paper["pages"] = 21 if paper["id"] == "cost" else 8
        paper["sourceDate"] = (
            "23 November 2026" if paper["id"] == "cost" else "Draft of 19 November 2026"
        )
    full = {"format": "eigenengine/sequential-manuscripts@1", "papers": papers}
    emit(OUT / "corpus.json", full)
    stage_index = {
        "format": full["format"],
        "papers": [
            dict(
                p,
                sections=[
                    {k: v for k, v in s.items() if k not in ("text", "figures")}
                    for s in p["sections"]
                ],
            )
            for p in papers
        ],
    }
    emit(OUT / "index.json", stage_index)
    intro = OUT / "opening-instructions.txt"
    if intro.exists():
        (OUT / "opening.txt").write_text(
            intro.read_text().strip()
            + "\n\n"
            + "\n\n".join(p["title"] + "\n" + p["abstract"] for p in papers)
            + "\n",
            encoding="utf-8",
        )


MATH = re.compile(r"(\$\$[\s\S]*?\$\$|\$[^$]*?\$)")


def conversions(paper):
    expressions = dict.fromkeys(
        MATH.findall(
            paper["abstract"] + "\n" + "\n".join(s["text"] for s in paper["sections"])
        )
    )
    out = {}
    parts = []
    keys = []
    for exp in expressions:
        expr = (
            exp.strip("$")
            .strip()
            .replace(r"\textstyle", "")
            .replace(r"\Bigl", r"\left")
            .replace(r"\Bigr", r"\right")
        )
        tag = re.search(r"\\tag\{([^}]+)\}", expr)
        expr = re.sub(r"\\tag\{[^}]+\}", "", expr).strip()
        block = exp.startswith("$$")
        content = "$$" + expr + "$$" if block else "$" + expr + "$"
        keys.append((exp, tag[1] if tag else None, block))
        parts.append(content)
    batch = "\n\n".join(parts)
    page = subprocess.run(
        [
            "pandoc",
            "-f",
            "markdown+tex_math_dollars",
            "-t",
            "html5",
            "--mathml",
            "--wrap=none",
        ],
        input=batch,
        capture_output=True,
        text=True,
        check=True,
    )
    spans = re.findall(r"<p>(.*?)</p>", page.stdout, re.DOTALL)
    assert len(spans) == len(parts), (len(spans), len(parts))
    for (exp, n, block), span in zip(keys, spans):
        if "<math " not in span:
            print("math fallback", repr(exp)[:125], file=sys.stderr)
            span = "<code>" + esc(exp.strip("$").strip()) + "</code>"
        if block:
            span = (
                '<div class="formula">'
                + span
                + (f' <span class="eq">({esc(n)})</span>' if n else "")
                + "</div>"
            )
        else:
            span = '<span class="inline-formula">' + span + "</span>"
        out[exp] = span
    return out


def inline_type(txt):
    # Poppler runs in ordinary Kalmár prose have linear scripts, for example 10^6 or λ_c.
    value = esc(txt)
    value = re.sub(r"\^\(([^()]+)\)", r"<sup>\1</sup>", value)
    value = re.sub(r"\^([−+-]?[0-9]+|[a-zA-ZΑ-ω])", r"<sup>\1</sup>", value)
    value = re.sub(r"_\(([^()]+)\)", r"<sub>\1</sub>", value)
    value = re.sub(r"_(reg|self|[A-Za-zΑ-ω∞ℛ])", r"<sub>\1</sub>", value)
    return value


def transcript(p):
    lookup = conversions(p)

    def inline(txt):
        return "".join(
            lookup[ch] if ch in lookup else inline_type(ch) for ch in MATH.split(txt)
        )

    def body(s):
        t = s["text"]
        figs = {}
        for n, f in enumerate(s["figures"]):
            caption = f["label"] + ". " + f["caption"]
            tok = "[Figure rendered here " + str(n) + "]"
            assert t.count(caption) == 1, (s["id"], f["label"])
            t = t.replace(caption, tok)
            figs[tok] = (
                f'<figure><img src="{esc(f["image"])}" alt="{esc(f["label"])}" loading="lazy"><figcaption>{inline(caption)}</figcaption></figure>'
            )
        blocks = []
        for para in re.split(r"\n\s*\n", t):
            para = para.strip()
            if not para:
                continue
            if para in figs:
                blocks.append(figs[para])
            elif para in lookup and para.startswith("$$"):
                blocks.append(lookup[para])
            elif (
                " | " in para
                and "\n" in para
                and s["id"] in ["iv", "vi"]
                and p["id"] == "kalmar"
            ):
                rows = para.splitlines()
                heads = rows.pop(0).split(" | ")
                blocks.append(
                    '<div class="table"><table><thead><tr>'
                    + "".join("<th>" + inline_type(c) + "</th>" for c in heads)
                    + "</tr></thead><tbody>"
                    + "".join(
                        "<tr>"
                        + "".join(
                            "<td>" + inline_type(c) + "</td>"
                            for c in (r.split(" | ") + [""] * len(heads))[: len(heads)]
                        )
                        + "</tr>"
                        for r in rows
                    )
                    + "</tbody></table></div>"
                )
            else:
                ref = (
                    re.match(r"^\[(\d+)\] ", para)
                    if s["kind"] == "references"
                    else None
                )
                blocks.append(
                    ('<p id="ref-' + ref[1] + '">' if ref else "<p>")
                    + inline(para)
                    + "</p>"
                )
        return "\n".join(blocks)

    head = (
        """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>"""
        + esc(p["title"])
        + """ · Full manuscript</title>
<style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0 auto;padding:1rem 1.15rem 4rem;max-width:56rem;line-height:1.55;font:1.08rem/1.55 Georgia,serif}header{padding:1.1rem 0 .6rem}h1{font-size:clamp(1.85rem,5vw,3.2rem);line-height:1.12}h2{line-height:1.2;margin-top:2.4rem}a{color:light-dark(#245c71,#9ad1e3);text-underline-offset:.16em}nav,.source,figcaption,details{font:.93rem/1.5 system-ui,sans-serif}.source{color:light-dark(#415059,#b9cad1)}section{scroll-margin-top:1rem}.formula,.table{overflow:auto;padding:.35rem 0}.eq{font:.85rem/1.3 system-ui;color:light-dark(#45515c,#bccad0)}.inline-formula{display:inline-block;max-width:100%;overflow-x:auto;vertical-align:middle}math{font-size:1em}figure{margin:1.2rem 0}figure img{display:block;max-width:100%;height:auto;background:white}figcaption{margin:.45rem 0}table{border-collapse:collapse}td,th{padding:.26rem .48rem;border-bottom:1px solid #8e9a9e;text-align:left}code{white-space:pre-wrap;overflow-wrap:anywhere}p{overflow-wrap:break-word}summary{cursor:pointer}
</style></head><body>"""
    )
    heads = []
    for s in p["sections"]:
        label = s["label"]
        prefix = (
            f"{label}. "
            if label and not label.startswith("Appendix")
            else label + " — "
            if label
            else ""
        )
        heads.append(prefix + s["title"])
    links = "".join(
        f'<li><a href="#{s["id"]}">{esc(n)}</a></li>'
        for n, s in zip(heads, p["sections"])
    )
    pdf_url = p["pdf"]
    if p["id"] == "cost":
        pdf_url += f'?v={p["sha256"][:8]}'
    authority = f'<a href="{esc(pdf_url)}">Original published PDF ({p["pages"]} pages)</a>'
    nav = '<nav><a href="../">Return to the reading session</a></nav>'
    credit = "Gerard McCaul · EigenEngine"
    if p["id"] == "kalmar":
        credit += " · " + esc(p["sourceDate"])
    if p.get("correspondence"):
        credit += (
            ' · <a href="mailto:'
            + esc(p["correspondence"])
            + '">'
            + esc(p["correspondence"])
            + "</a>"
        )
    sects = [body(s) for s in p["sections"]]
    content = (
        head
        + nav
        + "<main><header><h1>"
        + esc(p["title"])
        + "</h1><p>"
        + credit
        + '</p><p class="source">'
        + esc(p["sourceNote"])
        + " "
        + authority
        + '</p></header><section id="abstract"><h2>Abstract</h2><p>'
        + inline(p["abstract"])
        + "</p></section><details><summary>Contents</summary><ol>"
        + links
        + "</ol></details>\n"
        + "\n".join(
            f'<section id="{s["id"]}"><h2>{esc(n)}</h2>\n{contents}\n</section>'
            for n, s, contents in zip(heads, p["sections"], sects)
        )
        + "\n</main><footer><p>"
        + authority
        + "</p></footer></body></html>\n"
    )
    (OUT / p["id"] / "index.html").write_text(content, encoding="utf-8")
    for id, heading, contents in [
        ("abstract", "Abstract", "<p>" + inline(p["abstract"]) + "</p>"),
        *[(s["id"], n, v) for s, n, v in zip(p["sections"], heads, sects)],
    ]:
        individual = (
            head.replace(
                esc(p["title"]) + " · Full manuscript",
                esc(heading) + " · " + esc(p["title"]),
            )
            + nav
            + '<main><p class="source">'
            + esc(p["title"])
            + " · Gerard McCaul</p><h1>"
            + esc(heading)
            + "</h1>"
            + contents
            + "</main></body></html>\n"
        )
        (OUT / p["id"] / (id + ".html")).write_text(individual, encoding="utf-8")


def manual_view(papers):
    """Keep the scriptless instructions and paper order in sync with the notebook."""
    template = (SITE / "site/cost-reading-manual.html").read_text(encoding="utf-8")
    prompts = json.loads((OUT / "prompts.json").read_text(encoding="utf-8"))
    lists = []
    for paper in papers:
        items = []
        for section in paper["sections"]:
            label = " · ".join(filter(None, (section["label"], section["title"])))
            link = "./" + paper["id"] + "/" + section["id"] + ".html"
            items.append(f'<li><a href="{esc(link)}">{esc(label)}</a></li>')
        lists.append("<h3>" + esc(paper["title"]) + "</h3><ol>\n" + "\n".join(items) + "\n</ol>")
    template = template.replace("{{sections}}", "\n".join(lists))
    for key, text in prompts.items():
        template = template.replace("{{" + key + "}}", esc(text))
    (OUT / "manual.html").write_text(template, encoding="utf-8")


def from_packets():
    # The existing index gives the physical order of sections in the published paper.
    papers = json.loads((OUT / "index.json").read_bytes())["papers"]
    for paper in papers:
        d = OUT / paper["id"]
        paper["sections"] = [
            json.loads((d / (s["id"] + ".json")).read_bytes())
            for s in paper["sections"]
        ]
        paper["abstract"] = json.loads((d / "abstract.json").read_bytes())["text"]
        pdf = SITE / paper["pdf"].lstrip("/")
        if hashlib.sha256(pdf.read_bytes()).hexdigest() != paper["sha256"]:
            raise ValueError(
                "The PDF edition differs from its published reading packets"
            )
    return papers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--cost-build", type=Path, help="Compiled Cost manuscript directory"
    )
    source.add_argument(
        "--cost-submission", type=Path, help="Standalone Cost manuscript submission archive"
    )
    args = parser.parse_args()
    if args.cost_build:
        papers = [generate_cost(args.cost_build), generate_kalmar()]
    elif args.cost_submission:
        with tempfile.TemporaryDirectory() as work:
            src = Path(work)
            with ZipFile(args.cost_submission) as archive:
                archive.extractall(src)
            for _ in range(2):
                subprocess.run(
                    [
                        "pdflatex",
                        "-no-shell-escape",
                        "-halt-on-error",
                        "-interaction=batchmode",
                        "main.tex",
                    ],
                    cwd=src,
                    check=True,
                    stdout=subprocess.DEVNULL,
                )
            papers = [generate_cost(src), generate_kalmar()]
    else:
        papers = from_packets()
    join(papers)
    manual_view(papers)
    for paper in papers:
        transcript(paper)
    print(
        "Built",
        sum(len(p["sections"]) for p in papers),
        "section and end-matter packets, two abstracts and both full transcripts.",
    )


if __name__ == "__main__":
    main()
