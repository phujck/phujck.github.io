"""Enumerate a unit square subdivided by a horizontal and a vertical cut."""
import argparse
import csv
from dataclasses import dataclass
from fractions import Fraction
from hashlib import sha256
from io import StringIO
import json
from pathlib import Path


@dataclass(frozen=True)
class Square:
    x: Fraction
    y: Fraction
    side: Fraction

    def split(self):
        """Return the four child squares and the two new cut lengths."""
        half = self.side / 2
        right = self.x + self.side
        top = self.y + self.side
        children = [
            Square(x, y, half)
            for y in (self.y, self.y + half)
            for x in (self.x, self.x + half)
        ]
        return children, (right - self.x, top - self.y)


def simulate(side, depth):
    root = Square(Fraction(0), Fraction(0), Fraction(side))
    cells = [root]
    area_unit = root.side ** 2
    length_unit = sum(root.split()[1])
    area_total = Fraction(0)
    length_total = Fraction(0)
    rows = [[0, 1, 0, 0, 0, 0, 0]]
    for level in range(1, depth + 1):
        children = []
        area_step = Fraction(0)
        length_step = Fraction(0)
        for cell in cells:
            parts, cut_lengths = cell.split()
            children.extend(parts)
            area_step += cell.side ** 2 / area_unit
            length_step += sum(cut_lengths) / length_unit
        area_total += area_step
        length_total += length_step
        if len(set(children)) != 4 ** level or sum(c.side ** 2 for c in children) != area_unit:
            raise RuntimeError("Subdivision did not preserve the distinct cells and total area")
        if area_total != level or length_total != 2 ** level - 1:
            raise RuntimeError("Enumerated costs do not match the two expected growth laws")
        rows.append([level, len(children), len(cells), int(area_step), int(length_step),
                     int(area_total), int(length_total)])
        cells = children
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["smoke"], default="smoke")
    parser.add_argument("--args-json", default="{}")
    parser.add_argument("--result", type=Path, required=True)
    args = parser.parse_args()
    if json.loads(args.args_json) != {}:
        parser.error("This producer reads its fixed, declared inputs.json")
    inputs = Path(__file__).with_name("inputs.json").read_bytes()
    config = json.loads(inputs)
    depth = config["max_depth"]
    if config["unit_square_side"] != 1 or type(depth) is not int or not 0 <= depth <= 8:
        raise ValueError("Use a unit square and an integer depth from 0 to 8")
    rows = simulate(config["unit_square_side"], depth)
    header = ["Depth", "Cells", "Parent splits", "Area cost this step", "Length cost this step",
              "Area-priced cuts", "Cut-length-priced cuts"]
    stream = StringIO()
    writer = csv.writer(stream, lineterminator="\n")
    writer.writerow(header)
    writer.writerows(rows)
    table = stream.getvalue().encode("utf-8")
    final = rows[-1]
    args.result.parent.mkdir(parents=True, exist_ok=True)
    args.result.with_name("costs.csv").write_bytes(table)
    result = {
        "model": "Unit-square subdivision; each parent is divided by a horizontal and a vertical cut.",
        "normalisation": "Each cost is expressed in units of its own first split.",
        "inputs": config,
        "inputs_sha256": sha256(inputs).hexdigest(),
        "table": "costs.csv",
        "table_sha256": sha256(table).hexdigest(),
        "cells": final[1],
        "splits": sum(row[2] for row in rows),
        "area_cost": final[5],
        "length_cost": final[6],
        "rows": [dict(zip(header, row)) for row in rows],
        "scope": "Deterministic finite calculation, independent of the order in which squares are visited."
    }
    args.result.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
