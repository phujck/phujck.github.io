"""Build the two-manuscript attachment from the published reading corpus and follow-up.

Run with Python 3, or pass --check to verify the existing transcripts and ZIP without rewriting them.
"""

import argparse
import hashlib
import io
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

SITE = Path(__file__).resolve().parents[1]
READING = SITE / "eigenengine/cost-of-complexity/reading"
PACKET = READING / "papers.zip"
PAPER_IDS = ("cost", "kalmar")

README = """Paired reading of The Cost of Complexity and Physical origins of the Kalmár constant

1. Send the abstract-only opening from the reading page in a fresh conversation.
   Keep the agent’s first reply.
2. After that reply, send follow-up.txt in the same conversation. Attach papers.zip
   if your agent needs an attachment. The reading page also offers the manuscripts
   directly, so the exercise can be completed in a browser.

Each paper appears as an original, printable PDF and a complete UTF-8 text file.
The text files include the equations, captions, references and end matter. Figure
captions name the corresponding image under cost/ or kalmar/. The Cost figures
are 1–6 and the Kalmár figures are 1–3. Use the PDFs for the original typesetting.

Reading page: https://gmccaul.co.uk/eigenengine/cost-of-complexity/reading/
SHA256SUMS.txt lists the SHA-256 digest of each other file in this archive.
"""


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def manuscript_files(paper):
    """Preserve the section texts, adding local image locations after their captions."""
    paper_id = paper["id"]
    pdf = SITE / paper["pdf"].lstrip("/")
    if pdf.parent != SITE / "eigenengine/guide" or pdf.suffix != ".pdf":
        raise ValueError(f"Unexpected manuscript PDF path: {pdf}")
    pdf_bytes = pdf.read_bytes()
    if sha256(pdf_bytes) != paper["sha256"]:
        raise ValueError(f"Published PDF differs from the reading corpus: {pdf.name}")

    members = {pdf.name: pdf_bytes}
    front = [paper["title"], f"{paper['author']} · {paper['affiliation']}"]
    if paper_id == "kalmar":
        front.append(paper["sourceDate"])
    front.extend([paper["correspondence"], "", paper["sourceNote"]])
    parts = ["\n".join(front), "Abstract", paper["abstract"]]

    for section in paper["sections"]:
        title = section["title"]
        if section["kind"] == "appendix":
            title = f"{section['label']} — {title}"
        elif section["label"]:
            title = f"{section['label']}. {title}"
        first, last = section["pages"]
        pages = f"p. {first}" if first == last else f"pp. {first}–{last}"
        text = section["text"]
        for figure in section["figures"]:
            image = SITE / figure["image"].lstrip("/")
            if image.parent != READING / paper_id or not re.fullmatch(
                r"figure-\d+\.webp", image.name
            ):
                raise ValueError(f"Unexpected figure path: {image}")
            member = f"{paper_id}/{image.name}"
            caption = f"{figure['label']}. {figure['caption']}"
            if member in members or text.count(caption) != 1:
                raise ValueError(
                    f"Ambiguous figure or caption: {paper_id}, {figure['label']}"
                )
            members[member] = image.read_bytes()
            text = text.replace(
                caption, f"{caption}\n[Image: {member} · PDF p. {figure['page']}]", 1
            )
        parts.extend([f"{title}  (PDF {pages})", text])

    members[pdf.stem + ".txt"] = ("\n\n".join(parts) + "\n").encode("utf-8")
    return members


def public_outputs():
    papers = json.loads((READING / "corpus.json").read_bytes())["papers"]
    if tuple(p["id"] for p in papers) != PAPER_IDS:
        raise ValueError("Expected the Cost manuscript followed by the Kalmár draft")

    follow_up = (READING / "follow-up.txt").read_bytes()
    if not follow_up.decode("utf-8").strip():
        raise ValueError("The follow-up prompt is empty")
    members = {"README.txt": README.encode("utf-8"), "follow-up.txt": follow_up}
    outputs = {}
    for paper in papers:
        files = manuscript_files(paper)
        text_name = Path(paper["pdf"]).with_suffix(".txt").name
        outputs[READING / text_name] = files[text_name]
        members.update(files)
    members["SHA256SUMS.txt"] = "".join(
        f"{sha256(data)}  {name}\n" for name, data in sorted(members.items())
    ).encode("utf-8")

    buffer = io.BytesIO()
    with ZipFile(buffer, "w") as archive:
        for name, data in sorted(members.items()):
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    # Text-only chats can receive this as their single second message.
    # Keep the same instruction visible after a long attachment has been read.
    separator = b"\n\n"
    contents = [
        members["follow-up.txt"].strip(),
        b"The complete texts follow. Read these if the links are unavailable.",
        members["the-cost-of-complexity.txt"].strip(),
        members["physical-origins-of-the-kalmar-constant.txt"].strip(),
        b"End of manuscripts. Now give me the reading-partner explanation requested above, comparing what you found with your first reply.",
    ]
    outputs[READING / "follow-up-with-papers.txt"] = separator.join(contents) + b"\n"
    outputs[PACKET] = buffer.getvalue()
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="verify the checked-in packet"
    )
    args = parser.parse_args()
    outputs = public_outputs()
    for path, data in outputs.items():
        if not path.exists() or path.read_bytes() != data:
            if args.check:
                parser.exit(1, f"{path.name} differs from its published source\n")
            path.write_bytes(data)
    data = outputs[PACKET]
    print(f"{PACKET.name}: {len(data):,} bytes, SHA-256 {sha256(data)}")


if __name__ == "__main__":
    main()
