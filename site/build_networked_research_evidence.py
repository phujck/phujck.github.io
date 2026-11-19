"""Build the downloadable source packet from the same pinned files served by Pages."""

import hashlib
import json
import re
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

SITE = Path(__file__).resolve().parents[1]
RECORDS = SITE / "assets/data/networked-research"
ORIGIN = "https://gmccaul.co.uk"

def archive_files():
    manifest = (RECORDS / "index.json").read_bytes()
    contents = {"index.json": manifest}
    for record in json.loads(manifest)["files"].values():
        url = urlsplit(record["url"])
        if url.netloc and (url.scheme != "https" or url.netloc != "gmccaul.co.uk"):
            raise ValueError(f"Unexpected evidence host: {url.netloc}")
        name = url.path.lstrip("/")
        base = SITE if url.netloc or url.path.startswith("/") else RECORDS
        source = (base / name).resolve()
        if not source.is_relative_to(SITE) or ".." in Path(name).parts or name in contents:
            raise ValueError(f"Invalid packet member: {name}")
        data = source.read_bytes()
        if len(data) != record["bytes"] or hashlib.sha256(data).hexdigest() != record["sha256"]:
            raise ValueError(f"Source no longer matches the published record: {name}")
        contents[name] = data

    article = (SITE / "eigenengine/networked-research/index.html").read_text()
    match = re.search(r'<textarea id="nr-agent-prompt"[^>]*>(.*?)</textarea>', article, re.S)
    if not match:
        raise ValueError("Missing public investigation prompt")
    contents["ask-your-agent.txt"] = (unescape(match[1]).strip() + "\n").encode()

    # The small evidence download keeps the whole record locally readable.
    # Links to the interactive exhibits reopen their original public pages.
    guide = (RECORDS / "index.html").read_text()
    guide = re.sub(r"^\s*@font-face\{[^}]+\}", "", guide, flags=re.M)
    guide = guide.replace('  <script defer src="/assets/js/eigenengine-reading-return.js"></script>\n', "")
    guide = guide.replace('  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n', "")
    guide = guide.replace('href="/eigenengine', f'href="{ORIGIN}/eigenengine')
    guide = guide.replace('href="../../docs/', 'href="assets/docs/')
    guide = guide.replace('href="../cost-project-record.json"', 'href="assets/data/cost-project-record.json"')
    guide = guide.replace('href="./evidence.zip" download>Download the evidence ZIP ↓',
                          'href="./ask-your-agent.txt">Read the investigation prompt')
    contents["index.html"] = guide.encode()
    contents["README.txt"] = (
        "Networked Research source records\n\n"
        "Open index.html for the reading guide or index.json for the machine-readable manifest.\n"
        "Raw source excerpts preserve the recorded UTF-8 bytes, including whitespace.\n"
        "Relative file URLs in the manifest resolve beside index.json. For an absolute URL\n"
        "on gmccaul.co.uk, use the corresponding assets/ path in this archive.\n"
        "SHA256SUMS.txt lists the checksums of the archive members.\n"
        "ask-your-agent.txt contains the public investigation prompt.\n"
    ).encode()
    contents["SHA256SUMS.txt"] = "".join(
        f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in sorted(contents.items())
    ).encode()
    return contents

def main():
    contents = archive_files()
    out = RECORDS / "evidence.zip"
    with ZipFile(out, "w") as archive:
        for name, data in sorted(contents.items()):
            info = ZipInfo(name)
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"{len(contents)} files, {out.stat().st_size:,} bytes")

if __name__ == "__main__":
    main()
