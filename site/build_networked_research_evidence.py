"""Publish the reading guide's record links and build its reproducible offline packet."""

import hashlib
import io
import json
import re
from html import escape, unescape
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

SITE = Path(__file__).resolve().parents[1]
RECORDS = SITE / "assets/data/networked-research"
GUIDE = SITE / "eigenengine/guide"
ORIGIN = "https://gmccaul.co.uk"
GUIDE_URL = ORIGIN + "/eigenengine/guide/"
RECORDS_URL = ORIGIN + "/assets/data/networked-research/"


def prompt_bytes():
    article = (SITE / "eigenengine/networked-research/index.html").read_text(encoding="utf-8")
    field = re.search(r'<textarea id="nr-agent-prompt"[^>]*>(.*?)</textarea>', article, re.S)
    if not field:
        raise ValueError("Missing public explanation prompt")
    # HTML textarea.value decodes entities and omits the first newline after the opening tag.
    return unescape(field[1].removeprefix("\n")).encode("utf-8")


def offline_guide(html, member_for_url):
    html = re.sub(r"^\s*@font-face\{[^}]+\}", "", html, flags=re.M)
    html = html.replace('  <script defer src="/assets/js/eigenengine-reading-return.js"></script>\n', "")
    html = html.replace('  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n', "")
    html, replaced = re.subn(
        r'<a class="download" href="[^"]*/evidence\.zip" download>[^<]+</a>',
        '<a class="download" href="./ask-your-agent.txt">Read the explanation prompt</a>',
        html,
    )
    if replaced != 1:
        raise ValueError("Expected one public ZIP download in the guide")

    def resolve(match):
        attr, value = match.groups()
        if value.startswith("#") or value == "./ask-your-agent.txt":
            return match[0]
        url = urlsplit(urljoin(GUIDE_URL, unescape(value)))
        key = url._replace(query="", fragment="").geturl()
        if key in member_for_url:
            target = "./" + member_for_url[key]
            if url.query:
                target += "?" + url.query
            if url.fragment:
                target += "#" + url.fragment
        else:
            target = url.geturl()
        return f'{attr}="{escape(target, quote=True)}"'

    return re.sub(r'\b(href|src)="([^"]+)"', resolve, html).encode("utf-8")


def publish_files():
    # Retain the previously published manifest and evidence URLs for existing clients.
    manifest = json.loads((RECORDS / "index.json").read_bytes())
    manifest["url"] = GUIDE_URL + "index.json"
    manifest["reading_guide"]["archive"] = (
        "Inside the ZIP, use archive_path when supplied. Otherwise use the relative file URL "
        "or the site-relative path of an absolute URL."
    )
    members = {}
    outputs = {}
    member_for_url = {GUIDE_URL + "index.json": "index.json"}

    for record in manifest["files"].values():
        url = urlsplit(urljoin(RECORDS_URL, record["url"]))
        if url.scheme != "https" or url.netloc != "gmccaul.co.uk" or url.query or url.fragment:
            raise ValueError(f"Unexpected source URL: {url.geturl()}")
        source = (SITE / url.path.lstrip("/")).resolve()
        if not source.is_relative_to(SITE):
            raise ValueError(f"Invalid source path: {source}")
        data = source.read_bytes()
        if len(data) != record["bytes"] or hashlib.sha256(data).hexdigest() != record["sha256"]:
            raise ValueError(f"Source no longer matches the published record: {source}")

        inside_records = source.is_relative_to(RECORDS)
        name = source.relative_to(RECORDS if inside_records else SITE).as_posix()
        if name in members:
            raise ValueError(f"Duplicate packet member: {name}")
        members[name] = data
        member_for_url[url.geturl()] = name

        # Generate the reader-facing aliases from the vetted bytes. Equal files
        # at their historical and clean paths share the same Git blob.
        alias = name if inside_records else source.name
        record["url"] = alias
        outputs[GUIDE / alias] = data
        current_url = urljoin(GUIDE_URL, record["url"])
        member_for_url[current_url] = name
        if urlsplit(record["url"]).path.lstrip("/") != name:
            record["archive_path"] = name

    members["index.json"] = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    outputs[GUIDE / "index.json"] = members["index.json"]
    article_prompt = prompt_bytes()
    members["ask-your-agent.txt"] = article_prompt
    outputs[GUIDE / "ask-your-agent.txt"] = article_prompt
    member_for_url[GUIDE_URL + "ask-your-agent.txt"] = "ask-your-agent.txt"

    guide = (GUIDE / "index.html").read_text(encoding="utf-8")
    compatibility = (
        '  <!-- Compatibility view generated from /eigenengine/guide/ by '
        'site/build_networked_research_evidence.py. -->\n'
        '  <script>location.replace("/eigenengine/guide/" + location.search + location.hash);</script>'
    )
    # Serve the same readable sections at old bookmarks even when clients skip scripts.
    legacy = guide.replace("<head>", "<head>\n" + compatibility, 1)
    legacy = legacy.replace('href="./cost-project-record.json"', 'href="../cost-project-record.json"')
    for paper in (manifest["files"]["cost_pdf"], manifest["files"]["kalmar_pdf"]):
        alias = paper["url"]
        legacy = legacy.replace(f'href="./{alias}', f'href="/assets/docs/{alias}')
    legacy = legacy.replace('href="#', 'href="/eigenengine/guide/#')
    outputs[RECORDS / "index.html"] = legacy.encode()
    members["index.html"] = offline_guide(guide, member_for_url)
    members["README.txt"] = (
        "EigenEngine reading guide\n\n"
        "Open index.html to read the guide offline. Its evidence links open files in this archive. "
        "Interactive exhibits link to the public website.\n"
        "index.json contains the public guide's machine-readable manifest. "
        "Use each file's archive_path when present, its relative URL otherwise, "
        "or the site-relative path for an absolute URL.\n"
        "SHA256SUMS.txt lists the checksums of the archive members. "
        "The manuscript excerpts preserve the recorded UTF-8 bytes including whitespace.\n"
        "ask-your-agent.txt contains the exact text of the public explanation prompt.\n"
    ).encode()
    members["SHA256SUMS.txt"] = "".join(
        f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in sorted(members.items())
    ).encode()

    buffer = io.BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, data in sorted(members.items()):
            info = ZipInfo(name)
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    packet = buffer.getvalue()
    outputs[RECORDS / "evidence.zip"] = packet
    outputs[GUIDE / "evidence.zip"] = packet
    for path, data in outputs.items():
        if not path.exists() or path.read_bytes() != data:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    print(f"{len(manifest['files'])} pinned files, {len(members)} ZIP members, {buffer.tell():,} bytes")


if __name__ == "__main__":
    publish_files()
