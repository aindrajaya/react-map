#!/usr/bin/env python3
"""polinrider-guard: menolak commit yang memuat indikator malware PolinRider / BeaverTail.

Membaca objek git secara langsung (tidak pernah menjalankan kode repo).

  python3 -I polinrider_guard.py [--repo DIR] [REF ...]      default REF: HEAD
  python3 -I polinrider_guard.py --all-branches               semua refs/remotes/origin/* dan refs/heads/*

Exit code: 0 bersih, 1 ada temuan yang memblokir, 2 error.
Pengecualian (jarang perlu): .github/polinrider-allow.txt berisi baris
  <rule> <path> <blob-sha1>
Pengecualian terikat ke hash isi file, jadi otomatis gugur kalau file berubah.
"""
import argparse, base64, os, re, subprocess, sys


def _d(*items):
    # IOC literal disimpan ter-encode supaya file ini tidak terdeteksi oleh aturannya sendiri
    return [base64.b64decode(x) for x in items]

_MARK_LIT = _d('cm1jZWolb3RiJQ==', 'Q290JTN0PXNodFA=', 'dGFpbHdpbmRjc3Mtc3R5bGUtYW5pbWF0ZQ==',
               'dGVtcF9hdXRvX3B1c2g=', 'dGVtcF9pbnRlcmFjdGl2ZV9wdXNo',
               'ZTliNTNhN2MtMjM0Mi00YjE1LWIwMmQtYmQ4YjhmNmEwM2Y5')
_C2_LIT = _d('YXV0aC1jb25maXJtLWVpZ2h0', 'MTY2Ljg4LjU0LjE1OA==')
_DROPPERS = _d('dGVtcF9hdXRvX3B1c2guYmF0', 'dGVtcF9pbnRlcmFjdGl2ZV9wdXNoLmJhdA==', 'YnJhbmNoX3N0cnVjdHVyZS5qc29u')

# SHA-1 blob file kit PolinRider yang identik di semua korban
KIT_BLOBS = {
    '2e3b6463029f5039ad840fdefb796333446fc764', 'a5177abe1a03fb01906b2deb0bdfcc3201e8c832',
    '934d55548c36ff0e330f2a2ba69bf74b10a7dcba', '51b1974952958055878c8531202048c561c6f3a2',
    '5e226620d2e360205cc8634e3c581a008d382561', '1e4f9ba13fffd107aaafb1d1196819f5162c871f',
}
# Penanda payload (varian lama, varian postcss/global.i, dropper .bat)
MARKER = re.compile(rb"global\['!'\]|global\.i ?= ?[\"'][A-Za-z0-9-]+[\"']|global\['r'\] ?= ?require|"
                    rb"global\.r ?= ?require|" + b'|'.join(re.escape(x) for x in _MARK_LIT))
C2 = re.compile(b'|'.join(re.escape(x) for x in _C2_LIT))
B64_EVAL = re.compile(rb"eval\(\s*atob\(|new Function\(\s*atob\(|eval\(\s*Buffer\.from\([^)]{0,200}base64|"
                      rb"atob\(\s*process\.env\.")
PADDING = re.compile(rb"[ \t]{200,}[^\s]")
ENV_B64_URL = re.compile(rb"aHR0cHM6Ly|aHR0cDovL")
FOLDER_OPEN = re.compile(rb"\"runOn\"\s*:\s*\"folderOpen\"")
AUTO_TASKS = re.compile(rb"allowAutomaticTasks\"\s*:\s*(\"on\"|true)")
FONT_JS = re.compile(rb"child_process|require\(|createRequire|process\.env|eval\(")
GITIGNORE_SABOTAGE = set(_DROPPERS)
DROPPER_NAMES = {x.decode() for x in _DROPPERS}

CODE_EXT = ('.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx', '.vue', '.svelte')
FONT_MAGIC = {
    '.woff2': (b'wOF2',), '.woff': (b'wOFF',),
    '.ttf': (b'\x00\x01\x00\x00', b'true', b'OTTO', b'typ1', b'ttcf'),
    '.otf': (b'OTTO', b'\x00\x01\x00\x00', b'ttcf'),
}
SKIP_DIRS = ('node_modules/', 'dist/', 'build/', 'vendor/', '.next/', 'coverage/')
MAX_TEXT = 3 * 1024 * 1024

RULES = {
    'kit-blob':        'File kit PolinRider (hash identik dengan sampel malware)',
    'marker':          'Penanda payload PolinRider',
    'c2':              'Alamat server C2 PolinRider',
    'b64-eval':        'Kode menjalankan teks base64 (eval/Function atas atob/Buffer)',
    'hidden-padding':  'Kode tersembunyi setelah 200+ spasi/tab',
    'env-c2-url':      'URL ter-encode base64 di file .env (pola loader PolinRider)',
    'vscode-autorun':  'VS Code task yang otomatis jalan saat folder dibuka',
    'fake-font':       'File font palsu (bukan font, atau berisi JavaScript)',
    'gitignore-sabotage': '.gitignore menyembunyikan file dropper PolinRider',
    'dropper-file':    'File dropper PolinRider',
}


def git(repo, *args, **kw):
    return subprocess.run(['git', '-C', repo, *args], check=True, capture_output=True, **kw).stdout


class Blobs:
    def __init__(self, repo):
        self.p = subprocess.Popen(['git', '-C', repo, 'cat-file', '--batch'],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    def read(self, sha):
        self.p.stdin.write(sha.encode() + b'\n'); self.p.stdin.flush()
        hdr = self.p.stdout.readline().split()
        if len(hdr) < 3 or hdr[1] == b'missing':
            return b''
        n = int(hdr[2]); data = self.p.stdout.read(n); self.p.stdout.read(1)
        return data


def load_allow(repo, ref):
    try:
        raw = git(repo, 'show', f'{ref}:.github/polinrider-allow.txt')
    except subprocess.CalledProcessError:
        return set()
    out = set()
    for line in raw.decode('utf-8', 'replace').splitlines():
        parts = line.split('#', 1)[0].split()
        if len(parts) == 3:
            out.add(tuple(parts))
    return out


def scan_ref(repo, ref, blobs):
    findings = []
    allow = load_allow(repo, ref)
    tree = git(repo, 'ls-tree', '-r', '-z', '--full-tree', '-l', ref)
    for ent in tree.split(b'\0'):
        if not ent:
            continue
        meta, path = ent.split(b'\t', 1)
        mode, typ, sha, size = meta.split()
        if typ != b'blob':
            continue
        sha = sha.decode(); path = path.decode('utf-8', 'replace')
        size = int(size) if size != b'-' else 0
        low = path.lower(); base = low.rsplit('/', 1)[-1]
        hits = []

        def hit(rule, detail=''):
            if (rule, path, sha) not in allow:
                hits.append((rule, detail))

        if sha in KIT_BLOBS:
            hit('kit-blob')
        if base in DROPPER_NAMES:
            hit('dropper-file')
        ext = os.path.splitext(low)[1]
        is_font = ext in FONT_MAGIC or ext == '.eot'
        if size > MAX_TEXT and not is_font:
            findings += [(ref, path, r, d) for r, d in hits]
            continue
        data = blobs.read(sha)
        vendored = any(f'/{d}' in f'/{low}' for d in SKIP_DIRS) or '.min.' in base

        if is_font and data:  # file kosong (placeholder) tidak bisa membawa payload
            head = data[:4]
            bad = False
            if ext in FONT_MAGIC:
                bad = not head.startswith(FONT_MAGIC[ext])
            else:  # EOT: magic 0x504C di offset 34
                bad = len(data) < 36 or data[34:36] != b'LP'
            if bad or FONT_JS.search(data[:65536]):
                hit('fake-font', 'header bukan format font' if bad else 'berisi JavaScript')
        else:
            if MARKER.search(data):
                hit('marker')
            if C2.search(data):
                hit('c2')
            if base.startswith('.env') and ENV_B64_URL.search(data):
                hit('env-c2-url')
            if base == '.gitignore':
                lines = {l.strip() for l in data.splitlines()}
                if lines & GITIGNORE_SABOTAGE:
                    hit('gitignore-sabotage')
            if '/.vscode/' in f'/{low}':
                if base == 'tasks.json' and FOLDER_OPEN.search(data):
                    hit('vscode-autorun', 'runOn: folderOpen')
                if base == 'settings.json' and AUTO_TASKS.search(data):
                    hit('vscode-autorun', 'task.allowAutomaticTasks aktif')
            if not vendored and low.endswith(CODE_EXT):
                if PADDING.search(data):
                    hit('hidden-padding')
                if B64_EVAL.search(data):
                    hit('b64-eval')
        findings += [(ref, path, r, d) for r, d in hits]
    return findings


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', default='.')
    ap.add_argument('--all-branches', action='store_true')
    ap.add_argument('refs', nargs='*')
    a = ap.parse_args()
    refs = a.refs or ['HEAD']
    if a.all_branches:
        out = git(a.repo, 'for-each-ref', '--format=%(refname)', 'refs/remotes/origin', 'refs/heads').decode().split()
        refs = [r for r in out if not r.endswith('/HEAD')] or refs
    gha = os.environ.get('GITHUB_ACTIONS') == 'true'
    blobs = Blobs(a.repo)
    findings = []
    for ref in refs:
        try:
            findings += scan_ref(a.repo, ref, blobs)
        except subprocess.CalledProcessError as e:
            print(f'error: tidak bisa membaca {ref}: {e.stderr.decode(errors="replace").strip()}', file=sys.stderr)
            return 2

    short = lambda r: re.sub(r'^refs/(remotes/origin|heads|scan)/', '', r)
    for ref, path, rule, detail in findings:
        msg = RULES[rule] + (f' ({detail})' if detail else '')
        if gha:
            loc = f'file={path},' if len(refs) == 1 else ''
            print(f'::error {loc}title=polinrider-guard: {rule}::[{short(ref)}] {path}: {msg}')
        else:
            print(f'[{short(ref)}] {path}: {rule} — {msg}')

    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as s:
            if findings:
                s.write(f'## ❌ polinrider-guard: {len(findings)} temuan\n\n| ref | file | aturan |\n|---|---|---|\n')
                for ref, path, rule, detail in findings:
                    s.write(f'| {short(ref)} | `{path}` | {RULES[rule]} {detail} |\n')
                s.write('\nJangan merge. Jalankan pembersihan, dan periksa mesin yang melakukan push.\n')
            else:
                s.write(f'## ✅ polinrider-guard: bersih ({len(refs)} ref dipindai)\n')
    if findings:
        print(f'\npolinrider-guard: {len(findings)} temuan di {len({(r, p) for r, p, *_ in findings})} file — DITOLAK')
        return 1
    print(f'polinrider-guard: bersih ({len(refs)} ref)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
