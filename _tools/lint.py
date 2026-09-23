#!/usr/bin/env python3
"""Checks every page against Thihan's writing rules, the brief's bans and the
phase 1 guard rails. Run from _tools/:  python3 lint.py

Fails (exit 1) on:
  writing     banned words and phrases, em or en dashes, US spellings
  ahpra       specialist or specialising, elite, world-class, leading,
              testimonial, anywhere in the page including structured data
  address     a street address, postcode or phone number for the clinic
  tracking    a booking or enquiry link or form without data-track and
              data-track-location
  bridge road Bridge Road named or linked outside its approved spots

Reports without failing:
  placeholders copy and links still waiting on Thihan
  held        known items parked for the phase 2 content review
"""
import re, sys, glob, os, html as H
from html.parser import HTMLParser

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

BANNED = """can may just very really literally actually certainly probably basically could maybe
delve embark enlightening esteemed craft crafting imagine realm game-changer unlock discover
skyrocket abyss revolutionize disruptive utilize utilizing tapestry illuminate unveil pivotal
intricate elucidate hence furthermore landscape stark testament moreover boost skyrocketing
powerful inquiries""".split()

PHRASES = ["shed light","not alone","in a world where","dive deep","opened up","ever-evolving",
           "cutting-edge","game-changing","transformative","unlock your potential","crush your goals",
           "elite mindset","optimise everything","world-class","holistic care","passionate about",
           "get back to doing what you love","state-of-the-art","in conclusion","it's worth noting"]

# AHPRA advertising risks named in the brief. Checked across the whole file,
# structured data and meta tags included. Citation titles in a .refs block
# are exempt: "elite cricket fast bowlers" in a paper title is not a claim.
AHPRA = [r"\bspeciali[sz]\w*", r"\belite\b", r"\bworld[- ]class\b", r"\bleading\b", r"\btestimonials?\b"]

# The clinic's street address, postcode and phone belong to Bridge Road only.
ADDRESS = [r"\b\d{1,4}\s+Bridge\s+R(?:oa)?d\b", r"\b3121\b", r"\bVIC\s+\d{4}\b", r"Uplift\s+Gym",
           r"\btel:", r"\b0458\b", r"\+61\s?458"]

# Links that book or enquire. Each must carry data-track and data-track-location.
BOOKING = re.compile(r"TODO_TELEHEALTH_URL|TODO_BRIDGE_ROAD_CRICKET_URL|halaxy\.com|bridgeroad\.physio|^/players#book")
ENQUIRY = re.compile(r"^/contact(?:$|[?#])|^mailto:")

# Where Bridge Road is allowed, and on which page.
SPOTS = {
    "home_line":       {"index.html"},
    "players_section": {"players.html"},
    "about_sentence":  {"about.html"},
    "privacy":         {"privacy.html"},
    "terms":           {"terms.html"},
    "footer":          None,            # every page
}

# Known items parked for the phase 2 content review, with the reason. Reported
# on every run so they never go quiet. Remove an entry once it is resolved.
HELD = {
    ("cricket-injuries/fast-bowling-back-pain.html", "https://www.bridgeroad.physio/blog/lumbar-stress-fast-bowlers/"):
        "Guide body links to the lumbar stress article on the Bridge Road blog. "
        "Body copy on retained guides waits for phase 2 (decision 10).",
}

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}


class Page(HTMLParser):
    """Walks one page, tracking which approved Bridge Road spot, if any, each
    piece of text or link sits inside."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []            # (tag, spot)
        self.skip = 0              # inside script or style
        self.stray = []            # Bridge Road outside a spot
        self.spots = []            # spot names seen
        self.untracked = []
        self.links = []

    def spot(self):
        for _, s in reversed(self.stack):
            if s: return s
        return None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
        s = a.get("data-br-spot")
        if s: self.spots.append(s)
        if tag not in VOID:
            self.stack.append((tag, s))
        href = a.get("href") or ""
        if tag == "a":
            self.links.append(href)
            if BOOKING.search(href) or ENQUIRY.search(href):
                if not a.get("data-track") or not a.get("data-track-location"):
                    self.untracked.append(href)
            if "bridgeroad.physio" in href or "TODO_BRIDGE_ROAD" in href:
                if not self.spot(): self.stray.append(("link", href))
        if tag == "form" and "data-enquiry" in a:
            if not a.get("data-track") or not a.get("data-track-location"):
                self.untracked.append("form[data-enquiry]")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.skip: return
        if re.search(r"bridge\s+road", data, re.I) and not self.spot():
            self.stray.append(("text", re.sub(r"\s+", " ", data.strip())[:90]))


def visible_text(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    metas = " ".join(re.findall(r'<meta (?:name|property)="(?:description|og:description|og:title|twitter:title|twitter:description)" content="([^"]*)"', s))
    s = re.sub(r"<[^>]+>", " ", s)
    return H.unescape(s + " " + metas)


def without_refs(s):
    return re.sub(r'<div class="refs">.*?</div>', " ", s, flags=re.S)


pages = sorted(p for p in glob.glob(ROOT + "/**/*.html", recursive=True)
               if "/docs/" not in p and "/node_modules/" not in p)

fails, held, placeholders = 0, [], {}
for p in pages:
    rel = os.path.relpath(p, ROOT)
    raw = open(p, encoding="utf-8").read()
    t = visible_text(raw); low = t.lower()
    hits = []

    for w in BANNED:
        n = len(re.findall(r"\b" + re.escape(w) + r"\b", low))
        if n: hits.append(f"{w}×{n}")
    for ph in PHRASES:
        if ph in low: hits.append(f'"{ph}"')
    if "—" in t or "–" in t: hits.append("EM/EN DASH")
    for us in ("specialize", "organize", "analyze", "center", "color", "favorite"):
        if re.search(r"\b" + us, low): hits.append(f"US:{us}")

    body = without_refs(raw)
    for pat in AHPRA:
        for m in set(re.findall(pat, body, re.I)):
            hits.append(f"AHPRA:{m.lower()}")
    for pat in ADDRESS:
        if re.search(pat, raw, re.I): hits.append(f"ADDRESS:{pat}")

    pg = Page(); pg.feed(raw)
    for href in pg.untracked:
        hits.append(f"UNTRACKED:{href}")
    for kind, what in pg.stray:
        if (rel, what) in HELD:
            held.append(f"{rel}: {HELD[(rel, what)]}")
        else:
            hits.append(f"BRIDGE ROAD outside approved spots ({kind}): {what}")
    for s in pg.spots:
        if s not in SPOTS:
            hits.append(f"unknown data-br-spot '{s}'")
        elif SPOTS[s] is not None and rel not in SPOTS[s]:
            hits.append(f"data-br-spot '{s}' is not approved on this page")
    if "<footer" in raw and pg.spots.count("footer") != 1:
        hits.append(f"footer Bridge Road line found {pg.spots.count('footer')} times, expected 1")
    for s, allowed in SPOTS.items():
        if allowed and rel in allowed and s not in pg.spots:
            hits.append(f"approved spot '{s}' missing")

    n_ph = len(re.findall(r'class="ph"', raw)) + len(re.findall(r"TODO_[A-Z_]+_URL", raw))
    if n_ph: placeholders[rel] = n_ph

    if hits:
        fails += 1
        print(f"{rel:46} {', '.join(hits)}")

print()
if placeholders:
    print("Placeholders still waiting on Thihan (not a failure, but nothing ships with one showing):")
    for rel, n in placeholders.items(): print(f"  {rel:44} {n}")
    print()
for h in sorted(set(held)):
    print("Held for phase 2:", h)
if held: print()
print(f"{fails} file(s) with issues" if fails else f"clean: {len(pages)} pages")
sys.exit(1 if fails else 0)
