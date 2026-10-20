"""Update generated lesson indexes; keep chapter editorial notes in Markdown."""
from __future__ import annotations

import argparse
import hashlib
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
    catalog = {
        'title': 'teach-math-web 各冊各章概念索引',
        'schema_version': 2,
        'source': 'curriculum.js and materials/*/index.html',
        'scope': '自動產生的教材標題索引；規則及章節編輯說明不在 JSON 複寫。',
        'books': [],
    }
    outputs = {}
    counts = {'books': len(curriculum), 'chapters': 0, 'sections': 0, 'concepts': 0}
    for volume, chapters in curriculum.items():
        book_path = DOCS / f'book-{volume}.md'
        book_text = book_path.read_text(encoding='utf-8')
        expected_keys = {f'{volume}-{i}' for i in range(1, len(chapters) + 1)}
        actual_keys = set(re.findall(r'<!-- BEGIN LESSONS ([0-9-]+) -->', book_text))
        if actual_keys != expected_keys:
            raise ValueError(f'Chapter blocks differ from curriculum: {book_path.name}')
        book = {'volume': int(volume), 'chapters': []}
        for ci, chapter in enumerate(chapters, 1):
            counts['chapters'] += 1
            key = f'{volume}-{ci}'
            chapter_data = {'number': ci, 'title': chapter['chapter'], 'sections': []}
            lines = []
            for si, section in enumerate(chapter['sections'], 1):
                folder = f'{volume}-{ci}-{si}'
                page = ROOT / 'materials' / folder / 'index.html'
                page_bytes = page.read_bytes()
                html = page_bytes.decode('utf-8-sig')
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
                entry = {
                    'folder': folder, 'title': section['title'],
                    'source': f'materials/{folder}/index.html',
                    'source_sha256': hashlib.sha256(page_bytes).hexdigest(),
                    'concept_count': len(concepts), 'concepts': concepts,
                }
                # Local ignored assets are intentionally not catalog inputs:
                # outputs must be identical on another checkout without them.
                chapter_data['sections'].append(entry)
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
            book['chapters'].append(chapter_data)
        catalog['books'].append(book)
        outputs[book_path] = book_text
    catalog['counts'] = counts
    outputs[DOCS / 'catalog.json'] = json.dumps(catalog, ensure_ascii=False, indent=2) + '\n'
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
