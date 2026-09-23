#!/usr/bin/env python3
"""Checks generated pages against Thihan's writing rules and the brief's bans."""
import re, sys, glob, html as H

BANNED = """can may just very really literally actually certainly probably basically could maybe
delve embark enlightening esteemed craft crafting imagine realm game-changer unlock discover
skyrocket abyss revolutionize disruptive utilize utilizing tapestry illuminate unveil pivotal
intricate elucidate hence furthermore landscape stark testament moreover boost skyrocketing
powerful inquiries""".split()

PHRASES = ["shed light","not alone","in a world where","dive deep","opened up","ever-evolving",
           "cutting-edge","game-changing","transformative","unlock your potential","crush your goals",
           "elite mindset","optimise everything","world-class","holistic care","passionate about",
           "get back to doing what you love","state-of-the-art","in conclusion","it's worth noting"]

def text_of(path):
    s = open(path).read()
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return H.unescape(s)

fails = 0
for p in sorted(glob.glob("../**/*.html", recursive=True)):
    t = text_of(p); low = t.lower()
    hits = []
    for w in BANNED:
        n = len(re.findall(r"\b" + re.escape(w) + r"\b", low))
        if n: hits.append(f"{w}×{n}")
    for ph in PHRASES:
        if ph in low: hits.append(f'"{ph}"')
    if "—" in t or "–" in t: hits.append("EM/EN DASH")
    # Australian spelling check
    for us, au in [("specialize","specialise"),("organize","organise"),("analyze","analyse"),
                   ("program ","programme "),("center","centre"),("color","colour"),("favorite","favourite")]:
        if re.search(r"\b"+us, low) and us != "program ": hits.append(f"US:{us}")
    if hits:
        fails += 1
        print(f"{p.split('cricketphysio-site/')[1]:46} {', '.join(hits)}")
print("—" if False else "")
print(f"{fails} file(s) with issues" if fails else "clean")
