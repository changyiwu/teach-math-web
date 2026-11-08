"""Update the generated lesson indexes in docs/reference/book-N.md.

Chapter notes are hand-edited in docs/reference/shared-math/chapter-notes.md.
"""
from __future__ import annotations

import argparse
from html import unescape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs/reference'


def build_outputs() -> tuple[dict[Path, str], dict[str, int]]:
    raw = (ROOT / 'curriculum.js').read_text(encoding='utf-8-sig')
    start = raw.index('{', raw.index('const CURRICULUM_DATA'))
    curriculum, _ = json.JSONDecoder().raw_decode(raw[start:])
    outputs = {}
    counts = {'books': len(curriculum), 'chapters': 0, 'sections': 0, 'concepts': 0}
    for volume, chapters in curriculum.items():
        book_path = DOCS / f'book-{volume}.md'
        book_text = book_path.read_text(encoding='utf-8')
        expected_keys = {f'{volume}-{i}' for i in range(1, len(chapters) + 1)}
        actual_keys = set(re.findall(r'<!-- BEGIN LESSONS ([0-9-]+) -->', book_text))
        if actual_keys != expected_keys:
            raise ValueError(f'Chapter blocks differ from curriculum: {book_path.name}')
        for ci, chapter in enumerate(chapters, 1):
            counts['chapters'] += 1
            key = f'{volume}-{ci}'
            lines = []
            for si, section in enumerate(chapter['sections'], 1):
                folder = f'{volume}-{ci}-{si}'
                page = ROOT / 'materials' / folder / 'index.html'
                html = page.read_bytes().decode('utf-8-sig')
                concepts = []
                for match in re.finditer(r'<h2\b[^>]*>(.*?)</h2>', html, re.S):
                    title = ' '.join(unescape(re.sub(r'<[^>]+>', '', match[1])).split())
                    if not re.match(r'^重點\s*[0-9０-９]+', title):
                        continue
                    pos = html.rfind('<section', 0, match.start())
                    attrs = html[pos:html.find('>', pos) + 1]
                    anchor = re.search(r'\bid=["\']([^"\']+)', attrs)
                    if not anchor:
                        raise ValueError(f'No section anchor: {folder}: {title}')
                    concepts.append({
                        'order': len(concepts) + 1, 'title': title, 'anchor': anchor[1],
                        'line': html.count('\n', 0, match.start()) + 1,
                    })
                numbers = [int(re.match(r'^重點\s*([0-9０-９]+)', p['title'])[1])
                           for p in concepts]
                if not concepts or numbers != list(range(1, len(concepts) + 1)):
                    raise ValueError(f'Missing or nonsequential concepts: {folder}: {numbers}')
                counts['sections'] += 1
                counts['concepts'] += len(concepts)
                url = f'../../materials/{folder}/index.html'
                lines += [f'### {folder} {section["title"]}', '',
                          f'正式教材：[開啟頁面]({url})；現有重點：{len(concepts)} 個。', '']
                for concept in concepts:
                    label = concept['title'].replace('[', r'\[').replace(']', r'\]')
                    lines.append(f'{concept["order"]}. [{label}]({url}#{concept["anchor"]})')
                lines.append('')
            begin = f'<!-- BEGIN LESSONS {key} -->'
            end = f'<!-- END LESSONS {key} -->'
            if book_text.count(begin) != 1 or book_text.count(end) != 1:
                raise ValueError(f'Expected one generated block in {book_path.name}: {key}')
            lo = book_text.index(begin) + len(begin)
            hi = book_text.index(end, lo)
            book_text = book_text[:lo] + '\n' + '\n'.join(lines) + book_text[hi:]
        outputs[book_path] = book_text
    return outputs, counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check freshness without writing files')
    args = parser.parse_args()
    outputs, counts = build_outputs()
    stale = []
    for path, content in outputs.items():
        if not path.exists() or path.read_text(encoding='utf-8') != content:
            stale.append(path.relative_to(ROOT).as_posix())
            if not args.check:
                path.write_text(content, encoding='utf-8', newline='')
    print(json.dumps({'counts': counts, 'stale' if args.check else 'updated': stale}))
    return 1 if args.check and stale else 0


if __name__ == '__main__':
    raise SystemExit(main())
