"""Check or copy the shared math docs between teach-math-web and teach-math-exam.

The canonical copy lives in teach-math-web; teach-math-exam keeps a byte-identical
mirror. Both repos are expected to be sibling folders unless --other is given.

    python sync_shared_math.py           # check; exit 1 if the copies differ
    python sync_shared_math.py --write   # overwrite the mirror with the canonical copy

Exit codes: 0 identical/written, 1 differ, 2 the other repo cannot be found.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

CANONICAL = ('teach-math-web', 'docs/reference/shared-math')
MIRROR = ('teach-math-exam', '.agents/skills/math-exam/references/shared-math')
SKIP = {'__pycache__'}


def repo_root(start: Path) -> Path:
    for folder in (start, *start.parents):
        if (folder / '.git').exists():
            return folder
    raise SystemExit(f'找不到 git repo：{start}')


def files_in(folder: Path) -> dict[str, bytes]:
    return {p.name: p.read_bytes() for p in sorted(folder.iterdir())
            if p.is_file() and p.name not in SKIP}


def normalized(data: bytes) -> bytes:
    # Git on Windows may check text out with CRLF; compare content, not line endings.
    return data.replace(b'\r\n', b'\n')


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        # Windows consoles may default to cp950; keep Chinese messages readable.
        stream.reconfigure(encoding='utf-8', errors='replace')
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--write', action='store_true', help='copy canonical files over the mirror')
    parser.add_argument('--other', type=Path, help='root folder of the other repo')
    args = parser.parse_args()

    here = Path(__file__).resolve().parent
    root = repo_root(here)
    rel = here.relative_to(root).as_posix()
    if rel == CANONICAL[1]:
        canon_dir, other_spec = here, MIRROR
    elif rel == MIRROR[1]:
        canon_dir, other_spec = None, CANONICAL
    else:
        print(f'本腳本不在預期位置：{rel}', file=sys.stderr)
        return 2

    other_root = (args.other or root.parent / other_spec[0]).resolve()
    other_dir = other_root / other_spec[1]
    if not other_dir.is_dir():
        print(f'找不到另一個 repo 的共用資料夾：{other_dir}\n'
              f'兩個 repo 需並排放置，或以 --other 指定 {other_spec[0]} 的根目錄。', file=sys.stderr)
        return 2
    if canon_dir is None:
        canon_dir, mirror_dir = other_dir, here
    else:
        mirror_dir = other_dir

    canon, mirror = files_in(canon_dir), files_in(mirror_dir)
    if not canon:
        print(f'正本資料夾是空的：{canon_dir}', file=sys.stderr)
        return 2
    differ = sorted(n for n in canon if n not in mirror or normalized(mirror[n]) != normalized(canon[n]))
    extra = sorted(n for n in mirror if n not in canon)

    if args.write:
        for name in differ:
            (mirror_dir / name).write_bytes(canon[name])
        for name in extra:
            print(f'鏡像多出正本沒有的檔案，未自動刪除，請人工確認：{mirror_dir / name}', file=sys.stderr)
        print(f'已覆蓋 {len(differ)} 個檔案到 {mirror_dir}')
        return 1 if extra else 0

    if differ or extra:
        for name in differ:
            print(f'不一致：{name}')
        for name in extra:
            print(f'鏡像多出：{name}')
        print(f'正本：{canon_dir}\n鏡像：{mirror_dir}\n改正本後執行 --write 覆蓋鏡像。')
        return 1
    print(f'一致：{len(canon)} 個檔案（{canon_dir} <-> {mirror_dir}）')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
