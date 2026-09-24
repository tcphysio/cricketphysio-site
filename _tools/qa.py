#!/usr/bin/env python3
"""Static QA over the generated site: links, headings, alt text, labels, metadata."""
import os, re, glob, json, html as H
from collections import defaultdict
ROOT = ".."

SKIP = ("_partials", "_tools", "docs", "cricket-logo", "node_modules")
files = sorted(f for f in glob.glob(ROOT + "/**/*.html", recursive=True)
               if not set(os.path.relpath(f, ROOT).split(os.sep)) & set(SKIP))
# Map every URL the site is able to serve (cleanUrls, trailingSlash:false)
served = set()
for f in files:
    rel = os.path.relpath(f, ROOT)[:-5]
    served.add("/" + ("" if rel == "index" else (rel[:-6] if rel.endswith("/index") else rel)))
served.add("/")

REDIRECTS = set()
vj = json.load(open(ROOT + "/vercel.json"))
for r in vj.get("redirects", []):
    REDIRECTS.add(r["source"].split("/:")[0])

problems = defaultdict(list)
for f in files:
    s = open(f).read()
    rel = os.path.relpath(f, ROOT)

    # --- internal links resolve
    for href in set(re.findall(r'href="(/[^"#?]*)(?:[#?][^"]*)?"', s)):
        base = href.rstrip("/") or "/"
        if base.startswith("/assets") or base.endswith((".css",".js",".xml",".txt",".svg",".png",".ico",".webmanifest")):
            if not os.path.exists(ROOT + base): problems[rel].append(f"missing asset {base}")
            continue
        if base not in served and base not in REDIRECTS:
            problems[rel].append(f"dead internal link {href}")

    # --- heading order
    hs = [int(m) for m in re.findall(r'<h([1-6])[ >]', s)]
    if hs.count(1) != 1: problems[rel].append(f"{hs.count(1)} h1 elements")
    prev = 0
    for h in hs:
        if prev and h > prev + 1: problems[rel].append(f"heading jump h{prev}->h{h}")
        prev = h

    # --- images have alt
    for img in re.findall(r"<img [^>]*>", s):
        if "alt=" not in img: problems[rel].append("img without alt")

    # --- form controls labelled
    for inp in re.findall(r'<(?:input|textarea)[^>]*id="([^"]+)"[^>]*>', s):
        if f'for="{inp}"' not in s: problems[rel].append(f"unlabelled field #{inp}")

    # --- metadata
    for pat, msg in [(r"<title>.{15,70}</title>", "title missing or outside 15-70 chars"),
                     (r'name="description" content="[^"]{70,165}"', "description missing or outside 70-165 chars"),
                     (r'rel="canonical"', "no canonical"),
                     (r'property="og:image"', "no og:image"),
                     (r'<html lang="en-AU">', "no lang")]:
        if not re.search(pat, s): problems[rel].append(msg)

    # --- JSON-LD parses
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: json.loads(block)
        except Exception as e: problems[rel].append(f"invalid JSON-LD: {e}")

    # --- external links safe
    for a in re.findall(r'<a [^>]*target="_blank"[^>]*>', s):
        if "noopener" not in a: problems[rel].append("target=_blank without noopener")

    if "skip-link" not in s: problems[rel].append("no skip link")

print(f"{len(files)} pages, {len(served)} served URLs\n")
if problems:
    for f in sorted(problems):
        for p in sorted(set(problems[f])): print(f"  {f:46} {p}")
    print(f"\n{sum(len(set(v)) for v in problems.values())} issue(s)")
else:
    print("no issues found")
