"""Check the public repository's studio identity and static entry points."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import json
import hashlib
import subprocess

root = Path(__file__).resolve().parents[2]
assert (root / "README.md").is_file(), "A public README is required"
log = subprocess.check_output(["git", "log", "HEAD", "--format=%an%x00%ae%x00%cn%x00%ce"], text=True)
for line in log.splitlines():
    an, ae, cn, ce = line.split("\0")
    for name, email in [(an, ae), (cn, ce)]:
        assert email.endswith("@users.noreply.github.com") or (name == "GitHub" and email == "noreply@github.com"), "Commit metadata contains a non-noreply email"
        assert name in {"King Made", "kingmadellc", "Codex", "Claude", "GitHub", "github-actions[bot]", "dependabot[bot]"}, "Review author attribution before publication"

class Entry(HTMLParser):
    def __init__(self, directory):
        super().__init__()
        self.directory = directory

    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        url = values.get("src") or (values.get("href") if tag == "link" else None)
        if not url: return
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("/"): return
        path = (self.directory / unquote(parsed.path)).resolve()
        assert path.is_relative_to(root) and path.is_file(), f"Missing entry asset: {parsed.path}"

manifest = json.loads((root / "build-info.json").read_text())
for relative, expected in manifest["files"].items():
    path = (root / relative).resolve()
    assert path.is_relative_to(root) and path.is_file(), f"Missing release file: {relative}"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, f"Release hash mismatch: {relative}"
release_entry = (root / manifest["entrypoint"]).resolve()
assert release_entry.is_relative_to(root) and release_entry.is_file(), "Invalid release entry"
assert str(release_entry.parent.relative_to(root)) in (root / "index.html").read_text(), "Latest entry does not point to the declared release"
for index in (root / "index.html", release_entry):
    contents = index.read_text()
    assert "<html" in contents.lower(), "Invalid HTML entry point"
    Entry(index.parent).feed(contents)
    # Unity's loader references build files from inline configuration.
    for asset in re.findall(r'["\']([^"\']+\.(?:data|wasm|framework\.js|loader\.js)(?:\.(?:br|gz))?)["\']', contents):
        if "://" not in asset:
            assert (index.parent / asset).exists() or (index.parent / "Build" / asset).exists(), f"Missing Unity asset: {asset}"
print("Studio metadata, public entry, release assets and exact file hashes checked")
