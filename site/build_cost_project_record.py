"""Export only aggregate counts for the Cost of Complexity website case study.

From the Laplace checkout, run scripts/laplace-python ../phujck.github.io/site/build_cost_project_record.py.
The date cut keeps
subsequent work from silently joining the historical November demonstration.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

from laplace.work import author_history_metrics

ROOT = Path(author_history_metrics.__file__).resolve().parents[3]
PROJECT = 'cost-of-complexity'
END = '2026-11-19T00:00:00Z'
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / 'assets/data/cost-project-record.json'
KINDS = {'writing-tool-read': 'read', 'writing-tool-action': 'action', 'writing-tool-failure': 'failure'}


def aggregate(root: Path) -> dict:
    query = {'scope': 'project', 'to': END}
    overview = author_history_metrics.read(PROJECT, {**query, 'projection': 'overview'}, root)
    coverage = overview['coverage']
    if overview.get('status') == 'PARTIAL' or any(coverage[key] for key in
            ('ambiguous_original_ids', 'missing_original_ids', 'unjoined_turn_rows')):
        raise ValueError('The project records need an identity/coverage review before export.')
    trace_query = {**query, 'projection': 'trace', 'limit': 100}
    events = {}
    while True:
        page = author_history_metrics.read(PROJECT, trace_query, root)
        for row in page['items']:
            kind = row['record']
            if kind not in {*KINDS, 'writing-reply', 'writing-turn', 'writing-session',
                            'writing-proposal', 'writing-proposal-decision'}:
                continue
            key = (kind, row['event_id'])
            if key in events and row['row_sha256'] != events[key]['row_sha256']:
                raise ValueError(f'Conflicting {kind} identity in the project history')
            events[key] = row
        following = page['pagination']['next_read']
        if not following:
            break
        trace_query = following['payload']

    operations = defaultdict(Counter)
    decisions, replies = Counter(), Counter()
    turns, sessions, proposals = [], 0, 0
    proposing_turns = set()
    for (kind, _), row in events.items():
        if kind in KINDS:
            operations[row['operation']][KINDS[kind]] += 1
        elif kind == 'writing-turn':
            turns.append(row['ts'])
        elif kind == 'writing-session':
            sessions += 1
        elif kind == 'writing-proposal':
            proposals += 1
            source_turn = row.get('logical_turn_id') or row.get('origin_turn_id')
            if source_turn:
                proposing_turns.add(source_turn)
        elif kind == 'writing-proposal-decision':
            decisions[row['decision']] += 1
        elif kind == 'writing-reply':
            replies[row['status']] += 1
    tools = [{'operation': name, **{channel: counts[channel] for channel in KINDS.values()},
              'total': counts.total()} for name, counts in operations.items()]
    tools.sort(key=lambda entry: (-entry['total'], entry['operation']))
    total = sum(entry['total'] for entry in tools)
    own = overview['totals']
    if (sessions, len(turns), total) != (own['sessions'], own['logical_turns'], own['original_tool_attempts']):
        raise ValueError('The event-level aggregation disagrees with the project analytics overview.')
    return {
        'project': PROJECT, 'through_exclusive_utc': END,
        'first_turn_utc': min(turns), 'last_turn_utc': max(turns),
        'sessions': sessions, 'turns': len(turns), 'turn_outcomes': dict(sorted(replies.items())),
        'saved_proposal_versions': proposals, 'turns_with_proposals': len(proposing_turns),
        'decision_records': dict(sorted(decisions.items())),
        'tool_attempts': total,
        'receipt_types': {k: sum(tool[k] for tool in tools) for k in KINDS.values()},
        'method': 'Project-scoped Writing App records through the end of 18 November 2026 UTC. '
                  'Each original tool receipt is counted once under its recorded operation. '
                  'The read, action and failure categories describe native tool receipts. '
                  'Proposal versions and decisions measure different stages of the same work.',
        'tools': tools,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    snapshot = aggregate(ROOT)
    args.out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{snapshot["turns"]} turns, {snapshot["tool_attempts"]} tool receipts, {len(snapshot["tools"])} operations')
