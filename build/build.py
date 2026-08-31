import json
import shutil
import sys
import argparse
from pathlib import Path
from enum import Enum

class Browser(Enum):
    Chrome = "chrome"
    Firefox = "firefox"

parser = argparse.ArgumentParser()
parser.add_argument('-b', '--browser', type=Browser, choices=list(Browser), required=True)
args = parser.parse_args()

# browser = Browser.Chrome
browser = args.browser

src = Path("src")
dist = Path("dist")
if not dist.exists():
    dist.mkdir(parents=True)

dist_brower = dist / browser.value

if dist_brower.exists():
    shutil.rmtree(dist_brower)

# dist.mkdir(parents=True)


dist_brower.mkdir(parents=True)

for item in src.iterdir():
    if item.name == "manifest" or item.name == "scripts":
        continue

    destination = dist_brower / item.name
    if item.is_dir():
        shutil.copytree(item, destination)
    else:
        shutil.copy2(item, destination)

# Browser specific js files
scripts_src = src / "scripts"
scripts_destination = dist_brower / "scripts"

shutil.copytree(scripts_src, scripts_destination, ignore=shutil.ignore_patterns("browser"))
shutil.copy2(scripts_src / "browser" / f"{browser.value}.js", scripts_destination/ "browser.js")

# Manifest
with (src / "manifest" / "manifest_common.json").open("r") as f:
    base_manifest = json.load(f)
with (src / "manifest" / f"{browser.value}.json").open("r") as f:
    browser_manifest = json.load(f)

manifest = {**base_manifest, **browser_manifest}

with (dist_brower/ "manifest.json").open("w") as f:
    json.dump(manifest, f)

with (dist_brower / "manifest.json").open("w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")


print(f"Built Clavimit for {browser}: {dist_brower}")