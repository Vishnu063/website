"""Check page entrypoints, local references, and the health response."""
import json
from pathlib import Path
from html.parser import HTMLParser
root = Path(__file__).resolve().parents[1] / 'public' / 'legacy'
class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value and not value.startswith(('http', '#', 'data:')):
                assert (root / value).is_file(), f'Missing asset: {value}'
for page in ('index', 'discover', 'worlds', 'characters', 'journal', 'collection', 'muses', 'atelier', 'garden', 'studio', 'portraits'):
    p = root / f'{page}.html'
    assert p.is_file(), f'Missing page: {p}'
    References().feed(p.read_text())
for asset in ('hero.webp', 'scenes.webp'):
    assert (root / 'assets' / asset).stat().st_size > 1000, f'Missing artwork: {asset}'
assert json.loads((root / 'health.json').read_text())['status'] == 'ok'
print('PASS: eleven pages, local references, artwork, health response')
