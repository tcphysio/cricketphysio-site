#!/usr/bin/env python3
"""Pre-commit build for thecricket.physio. Runs on your machine, never on deploy.

The site stays plain HTML that Vercel serves as-is. This script writes the
repeated and data-driven parts INTO those HTML files, between markers, so the
content is in the markup for search engines and for visitors without
JavaScript, and still has one source of truth.

What it writes
  1. Shared chrome from _partials/:
       <!-- partial:head --> ... <!-- /partial:head -->     (icons, fonts, css)
       <!-- partial:header --> ... <!-- /partial:header -->
       <!-- partial:footer --> ... <!-- /partial:footer -->
     aria-current="page" is set on the nav item for the page's section.
  2. Offer blocks from data/offers.json:
       <!-- build:NAME --> ... <!-- /build:NAME -->
     NAME is one of the keys in BLOCKS below.
  3. Inline values: the text of any element carrying data-offer="KEY", e.g.
       <span data-offer="performance.monthly">$449</span>
     KEY is one of the keys in tokens() below.
  4. FAQ schema: <!-- build:faq-schema --> in <head> is filled from the
     page's visible .faq block, so the schema never drifts from the page.
  5. Cache-busting: local css, js and image references get ?v=<content hash>.

Usage
  python3 _tools/build.py            rewrite files in place
  python3 _tools/build.py --check    change nothing; exit 1 if any file is stale
"""
import hashlib
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "offers.json").read_text())
TIERS = {t["id"]: t for t in DATA["tiers"]}
CLUBS = {c["id"]: c for c in DATA["clubs"]}
SITE = "https://www.thecricket.physio"
TOOL_URL = "https://bowlingworkload.thecricket.physio"

# Nav sections: the item whose prefix list holds the longest match wins.
NAV = [
    ("/services", ["/services", "/telehealth", "/in-person", "/return-to-performance"]),
    ("/bowling", ["/bowling"]),
    ("/professional-players", ["/professional-players"]),
    ("/cricket-performance", ["/cricket-performance"]),
    ("/teams", ["/teams", "/cricket-performance/clubs"]),
    ("/resources", ["/resources", "/cricket-injuries"]),
    ("/about", ["/about"]),
]

e = lambda s: html.escape(str(s), quote=True)


# --------------------------------------------------------------------------
# Values
# --------------------------------------------------------------------------
def money(n):
    return "${:,}".format(int(n)) if float(n).is_integer() else "${:,.2f}".format(n)


def member_rate(normal):
    rate = normal * (1 - DATA["treatment"]["discount"])
    assert float(rate).is_integer(), f"member rate for {normal} is not a whole dollar amount"
    return int(rate)


def tokens():
    t = {}
    for tid, tier in TIERS.items():
        p = tier["price"]
        t[f"{tid}.monthly"] = money(p["monthly"])
        t[f"{tid}.junior"] = money(p["junior"])
        t[f"{tid}.upfront"] = money(p["upfront"])
        t[f"{tid}.capacity"] = str(tier["capacity"])
        t[f"{tid}.name"] = tier["name"]
    for cid, club in CLUBS.items():
        t[f"{cid}.price"] = money(club["price"])
        t[f"{cid}.squad"] = str(club["squad"])
    t["tiers.from"] = money(min(x["price"]["monthly"] for x in TIERS.values()))
    t["tiers.junior-from"] = money(min(x["price"]["junior"] for x in TIERS.values()))
    t["clubs.from"] = money(min(c["price"] for c in CLUBS.values()))
    savings = [1 - x["price"]["upfront"] / (x["price"]["monthly"] * (12 if x["price"]["upfrontPeriod"] == "year" else 3)) for x in TIERS.values()]
    t["tiers.upfront-saving"] = f"{round(min(savings) * 100)}%"
    for item in DATA["treatment"]["items"]:
        slug = re.sub(r"[^a-z]+", "-", item["name"].lower()).strip("-")
        t[f"treatment.{slug}"] = money(item["normal"])
        t[f"treatment.{slug}.member"] = money(member_rate(item["normal"]))
    t["treatment.discount"] = f"{int(DATA['treatment']['discount'] * 100)}%"
    return t


TOKENS = tokens()


def fill(s):
    """Replace {key} tokens in data strings, e.g. '{performance.monthly}/month'."""
    return re.sub(r"\{([a-z0-9.\-]+)\}", lambda m: TOKENS[m.group(1)], s)


# --------------------------------------------------------------------------
# Blocks
# --------------------------------------------------------------------------
def cta_href(tier):
    return tier["cta"].get("checkoutUrl") or tier["cta"]["href"]


def tier_top(tier, idx):
    tid = tier["id"]
    p = tier["price"]
    out = []
    if tier.get("flag"):
        out.append(f'    <p class="tier__flag">{e(tier["flag"])}</p>')
    out.append(f'    <div class="tier__head"><h3 class="tier__name" id="tier-{tid}-name">{e(tier["name"])}</h3><p class="tier__label">{e(tier["label"])}</p></div>')
    out.append(f'    <p class="tier__tagline">{e(tier["tagline"])}</p>')
    out.append(f'    <p class="tier__price"><span class="tier__amount">{money(p["monthly"])}</span><span class="tier__per">per month</span></p>')
    out.append('    <ul class="tier__alt">')
    out.append(f'      <li>{money(p["upfront"])} {e(p["upfrontLabel"])}</li>')
    out.append(f'      <li>Under 18: {money(p["junior"])} per month</li>')
    out.append(f'      <li>{e(tier["commitment"])}</li>')
    out.append('    </ul>')
    return out


def tier_cta(tier, more_href=None, more_label=None):
    cls = "btn btn--primary btn--block" if tier.get("flag") else "btn btn--secondary btn--block"
    out = ['    <div class="tier__cta">']
    checkout = f' data-checkout="{e(tier["id"])}"' if tier["cta"].get("checkoutUrl") else ""
    out.append(f'      <a class="{cls}" href="{e(cta_href(tier))}" data-track="{e(tier["cta"]["track"])}"{checkout}>{e(tier["cta"]["label"])}</a>')
    if more_href:
        out.append(f'      <a class="tier__more" href="{e(more_href)}">{e(more_label)}</a>')
    out.append(f'      <p class="tier__meta">Limited to {tier["capacity"]} members so reviews happen when they should.</p>')
    out.append('    </div>')
    return out


def block_tiers_compact():
    out = ['<div class="tiers">']
    for i, tier in enumerate(DATA["tiers"]):
        tid = tier["id"]
        cls = "tier tier--featured" if tier.get("flag") else "tier"
        out.append(f'  <article class="{cls}" id="tier-{tid}" data-tier="{tid}" aria-labelledby="tier-{tid}-name">')
        out += tier_top(tier, i)
        out.append(f'    <p class="tier__feels">“{e(tier["feels"])}”</p>')
        out.append('    <ul class="ticks">')
        out += [f'      <li>{e(h)}</li>' for h in tier["highlights"]]
        out.append('    </ul>')
        out += tier_cta(tier, f"/cricket-performance/players#tier-{tid}", f"Everything in {tier['name']}")
        out.append('  </article>')
    out.append('</div>')
    return "\n".join(out)


def block_tiers_full():
    out = ['<div class="tiers">']
    for i, tier in enumerate(DATA["tiers"]):
        tid = tier["id"]
        cls = "tier tier--featured" if tier.get("flag") else "tier"
        count = sum(len(g["items"]) for g in tier["includes"])
        out.append(f'  <article class="{cls}" id="tier-{tid}" data-tier="{tid}" aria-labelledby="tier-{tid}-name">')
        out += tier_top(tier, i)
        out.append(f'    <p class="tier__best"><strong>Best for</strong>{e(tier["bestFor"])}</p>')
        out.append('    <ul class="ticks">')
        out += [f'      <li>{e(h)}</li>' for h in tier["highlights"]]
        out.append('    </ul>')
        out.append('    <details>')
        label = f"All {count} inclusions" if not tier.get("includesLead") else f"The {count} additions over Performance"
        out.append(f'      <summary>{e(label)}</summary>')
        if tier.get("includesLead"):
            out.append(f'      <p class="small mb-0"><strong>{e(tier["includesLead"])}</strong></p>')
        for g in tier["includes"]:
            out.append(f'      <p class="tier__group">{e(g["group"])}</p>')
            out.append('      <ul class="ticks">')
            out += [f'        <li>{e(x)}</li>' for x in g["items"]]
            out.append('      </ul>')
        out.append('    </details>')
        out.append('    <p class="tier__group">Not included</p>')
        out.append('    <ul class="ticks ticks--no">')
        out += [f'      <li>{e(x)}</li>' for x in tier["notIncluded"]]
        out.append('    </ul>')
        out += tier_cta(tier)
        out.append('  </article>')
    out.append('</div>')
    return "\n".join(out)


def value_cell(v, label, featured):
    cls = []
    if v == "Yes":
        cls.append("v-yes")
    elif v in ("No", "None"):
        cls.append("v-no")
    if featured:
        cls.append("is-featured")
    c = f' class="{" ".join(cls)}"' if cls else ""
    return f'<td role="cell" data-label="{e(label)}"{c}>{e(fill(v))}</td>'


def compare_table(groups, cols, caption):
    """cols: list of (name, secondary_label, featured)."""
    n = len(cols) + 1
    out = ['<div class="compare-wrap">', '<table class="compare" role="table">', f'  <caption class="vh">{e(caption)}</caption>']
    heads = []
    for name, sec, featured in cols:
        cls = ' class="is-featured"' if featured else ""
        span = f"<span>{e(sec)}</span>" if sec else ""
        heads.append(f'<th role="columnheader" scope="col"{cls}>{e(name)}{span}</th>')
    out.append('  <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col"><span class="vh">Feature</span></th>' + "".join(heads) + '</tr></thead>')
    for g in groups:
        out.append('  <tbody role="rowgroup">')
        out.append(f'    <tr role="row" class="compare__group"><th role="rowheader" scope="rowgroup" colspan="{n}">{e(g["group"])}</th></tr>')
        for row in g["rows"]:
            cells = "".join(value_cell(v, cols[i][0], cols[i][2]) for i, v in enumerate(row["values"]))
            out.append(f'    <tr role="row"><th role="rowheader" scope="row">{e(row["label"])}</th>{cells}</tr>')
        out.append('  </tbody>')
    out.append('</table>')
    out.append('</div>')
    return "\n".join(out)


def block_compare_players():
    cols = [(t["name"], t["label"], bool(t.get("flag"))) for t in DATA["tiers"]]
    return compare_table(DATA["compare"]["players"], cols, "Comparison of Essentials, Performance and Integrated Performance memberships")


def block_compare_clubs():
    cols = [(c["name"], None, bool(c.get("flag"))) for c in DATA["clubs"]]
    return compare_table(DATA["compare"]["clubs"], cols, "Comparison of Club Core and Club Plus")


def block_treatment():
    tr = DATA["treatment"]
    out = ['<table class="datatable datatable--stack">',
           '  <caption class="vh">In-person and assessment fees, standard and member rates</caption>',
           '  <thead><tr><th scope="col">Service</th><th scope="col" class="num">Standard fee</th><th scope="col" class="num">Member rate</th></tr></thead>',
           '  <tbody>']
    for item in tr["items"]:
        out.append(f'    <tr><th scope="row">{e(item["name"])}</th><td class="num strike" data-label="Standard fee">{money(item["normal"])}</td><td class="num" data-label="Member rate"><strong>{money(member_rate(item["normal"]))}</strong></td></tr>')
    out.append('  </tbody>')
    out.append('</table>')
    out.append(f'<p class="small mt-5">{e(tr["eligibility"])} {e(tr["essentials"])}</p>')
    out.append(f'<p class="small muted">{e(tr["terms"])}</p>')
    return "\n".join(out)


def block_junior():
    j = DATA["junior"]
    out = ['<table class="datatable datatable--stack">',
           '  <caption class="vh">Adult and under-18 membership prices</caption>',
           '  <thead><tr><th scope="col">Membership</th><th scope="col" class="num">Adult</th><th scope="col" class="num">Under 18</th></tr></thead>',
           '  <tbody>']
    for t in DATA["tiers"]:
        out.append(f'    <tr><th scope="row">{e(t["name"])}</th><td class="num" data-label="Adult">{money(t["price"]["monthly"])} per month</td><td class="num" data-label="Under 18"><strong>{money(t["price"]["junior"])} per month</strong></td></tr>')
    out.append('  </tbody>')
    out.append('</table>')
    out.append(f'<p class="small mt-5">{e(j["note"])} {e(j["stacking"])}</p>')
    return "\n".join(out)


def block_rules():
    rows = [("Places", lambda t: f'{t["capacity"]} members'),
            ("Minimum commitment", lambda t: t["rules"]["minimum"]),
            ("Cancelling", lambda t: t["rules"]["cancel"]),
            ("Upgrading", lambda t: t["rules"]["upgrade"]),
            ("Downgrading", lambda t: t["rules"]["downgrade"]),
            ("Pausing", lambda t: t["rules"]["pause"])]
    out = ['<div class="compare-wrap">', '<table class="compare" role="table">',
           '  <caption class="vh">Membership commitment, cancellation and pause rules</caption>',
           '  <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col"><span class="vh">Rule</span></th>' +
           "".join(f'<th role="columnheader" scope="col">{e(t["name"])}</th>' for t in DATA["tiers"]) + '</tr></thead>',
           '  <tbody role="rowgroup">']
    for label, fn in rows:
        cells = "".join(f'<td role="cell" data-label="{e(t["name"])}">{e(fn(t))}</td>' for t in DATA["tiers"])
        out.append(f'    <tr role="row"><th role="rowheader" scope="row">{e(label)}</th>{cells}</tr>')
    out.append('  </tbody>')
    out.append('</table>')
    out.append('</div>')
    out.append(f'<p class="small mt-5">{e(DATA["pausePolicy"])}</p>')
    return "\n".join(out)


def block_club_cards():
    out = ['<div class="tiers tiers--clubs">']
    for c in DATA["clubs"]:
        cid = c["id"]
        cls = "tier tier--featured" if c.get("flag") else "tier"
        out.append(f'  <article class="{cls}" id="{cid}" data-tier="{cid}" aria-labelledby="{cid}-name">')
        if c.get("flag"):
            out.append(f'    <p class="tier__flag">{e(c["flag"])}</p>')
        out.append(f'    <div class="tier__head"><h3 class="tier__name" id="{cid}-name">{e(c["name"])}</h3></div>')
        out.append(f'    <p class="tier__tagline">{e(c["tagline"])}</p>')
        out.append(f'    <p class="tier__price"><span class="tier__amount">{money(c["price"])}</span><span class="tier__per">per {e(c["period"])}</span></p>')
        out.append(f'    <ul class="tier__alt"><li>{e(c["payment"])}</li><li>Squad of up to {c["squad"]} players</li></ul>')
        if c.get("includesLead"):
            out.append(f'    <p class="small mb-0"><strong>{e(c["includesLead"])}</strong></p>')
        for g in c["includes"]:
            out.append(f'    <p class="tier__group">{e(g["group"])}</p>')
            out.append('    <ul class="ticks">')
            out += [f'      <li>{e(x)}</li>' for x in g["items"]]
            out.append('    </ul>')
        out.append('    <div class="tier__cta">')
        out.append(f'      <a class="btn btn--primary btn--block" href="{e(c["cta"]["href"])}" data-track="{e(c["cta"]["track"])}">{e(c["cta"]["label"])}</a>')
        out.append('    </div>')
        out.append('  </article>')
    out.append('</div>')
    return "\n".join(out)


def block_clubs_not_included():
    out = ['<ul class="ticks ticks--no">']
    out += [f'  <li>{e(x)}</li>' for x in DATA["clubsNotIncluded"]]
    out.append('</ul>')
    return "\n".join(out)


def block_journey():
    out = ['<ol class="journey">']
    ft = DATA["freeTool"]
    out.append('  <li>')
    out.append('    <p class="journey__tier">Free</p>')
    out.append(f'    <h3 class="journey__name">{e(ft["name"])}</h3>')
    out.append('    <p class="journey__verbs">Log. See the trend.</p>')
    out.append(f'    <p>{e(", ".join(ft["free"]).capitalize())}.</p>')
    out.append(f'    <p><a class="textlink" href="{TOOL_URL}" data-track="{e(ft["cta"]["track"])}">{e(ft["cta"]["label"])}</a></p>')
    out.append('  </li>')
    for t in DATA["tiers"]:
        out.append('  <li>')
        out.append(f'    <p class="journey__tier">{e(t["label"])}</p>')
        out.append(f'    <h3 class="journey__name">{e(t["name"])}</h3>')
        out.append(f'    <p class="journey__verbs">{e(t["verbs"])}</p>')
        out.append(f'    <p>{e(t["summary"])} From {money(t["price"]["monthly"])} per month.</p>')
        out.append(f'    <p><a class="textlink" href="#tier-{t["id"]}">{e(t["name"])} in detail</a></p>')
        out.append('  </li>')
    out.append('</ol>')
    return "\n".join(out)


def block_tool_paid():
    return "\n".join(['<ul class="ticks">'] + [f'  <li>{e(x)}</li>' for x in DATA["freeTool"]["paidAdds"]] + ['</ul>'])


# --- Structured data ------------------------------------------------------
PROVIDER = {
    "@type": "Organization", "@id": f"{SITE}/#org", "name": "The Cricket Physio", "url": SITE,
    "founder": {"@type": "Person", "@id": f"{SITE}/#thihan", "name": "Thihan Chandramohan", "jobTitle": "Physiotherapist", "url": f"{SITE}/about"},
}
AREA = [{"@type": "Country", "name": "Australia"}, {"@type": "Place", "name": "Worldwide by telehealth"}]


def tier_offer(t, url):
    return {
        "@type": "Offer", "name": t["name"], "description": t["tagline"], "url": url,
        "price": t["price"]["monthly"], "priceCurrency": DATA["currency"],
        "priceSpecification": {"@type": "UnitPriceSpecification", "price": t["price"]["monthly"], "priceCurrency": DATA["currency"], "unitText": "MONTH", "referenceQuantity": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}},
    }


def club_offer(c, url):
    return {"@type": "Offer", "name": c["name"], "description": c["tagline"], "url": url, "price": c["price"], "priceCurrency": DATA["currency"],
            "eligibleCustomerType": "Cricket clubs and academies"}


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "</script>"


def block_schema_landing():
    url = f"{SITE}/cricket-performance"
    return ld({"@context": "https://schema.org", "@type": "Service", "@id": f"{url}#service",
               "name": "Ongoing cricket physiotherapy and performance support", "serviceType": "Cricket physiotherapy membership",
               "description": "Ongoing cricket-specific support for injuries, rehabilitation, bowling workload and physical preparation, for players, clubs and academies.",
               "provider": PROVIDER, "areaServed": AREA, "url": url,
               "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Memberships and club packages",
                                   "itemListElement": [tier_offer(t, f"{SITE}/cricket-performance/players#tier-{t['id']}") for t in DATA["tiers"]] +
                                                      [club_offer(c, f"{SITE}/cricket-performance/clubs#{c['id']}") for c in DATA["clubs"]]}})


def block_schema_players():
    url = f"{SITE}/cricket-performance/players"
    return ld({"@context": "https://schema.org", "@type": "Service", "@id": f"{url}#service",
               "name": "Cricket physio memberships for players", "serviceType": "Cricket physiotherapy membership",
               "description": "Ongoing cricket physiotherapy, rehabilitation, bowling workload monitoring and return-to-performance support for cricketers.",
               "provider": PROVIDER, "areaServed": AREA, "url": url,
               "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Player memberships",
                                   "itemListElement": [tier_offer(t, f"{url}#tier-{t['id']}") for t in DATA["tiers"]]}})


def block_schema_clubs():
    url = f"{SITE}/cricket-performance/clubs"
    return ld({"@context": "https://schema.org", "@type": "Service", "@id": f"{url}#service",
               "name": "Cricket physio support for clubs and academies", "serviceType": "Cricket club medical and workload support",
               "description": "Cricket injury, workload and return-to-performance support for clubs and academies, including player assessments and fast-bowler monitoring.",
               "provider": PROVIDER, "areaServed": AREA, "url": url, "audience": {"@type": "Audience", "audienceType": "Cricket clubs and academies"},
               "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Club packages",
                                   "itemListElement": [club_offer(c, f"{url}#{c['id']}") for c in DATA["clubs"]]}})


BLOCKS = {
    "tiers-compact": block_tiers_compact,
    "tiers-full": block_tiers_full,
    "compare-players": block_compare_players,
    "compare-clubs": block_compare_clubs,
    "treatment": block_treatment,
    "junior": block_junior,
    "rules": block_rules,
    "club-cards": block_club_cards,
    "clubs-not-included": block_clubs_not_included,
    "tool-paid": block_tool_paid,
    "journey": block_journey,
    "schema-landing": block_schema_landing,
    "schema-players": block_schema_players,
    "schema-clubs": block_schema_clubs,
}


# --------------------------------------------------------------------------
# Page processing
# --------------------------------------------------------------------------
def page_url(path):
    rel = path.relative_to(ROOT).as_posix()[:-5]
    if rel == "index":
        return "/"
    if rel.endswith("/index"):
        rel = rel[:-6]
    return "/" + rel


def nav_section(url):
    best, best_len = None, -1
    for href, prefixes in NAV:
        for p in prefixes:
            if (url == p or url.startswith(p + "/")) and len(p) > best_len:
                best, best_len = href, len(p)
    return best


def render_partial(name, url):
    s = (ROOT / "_partials" / f"{name}.html").read_text().rstrip("\n")
    if name == "header":
        sec = nav_section(url)
        if sec:
            s = s.replace(f'      <a href="{sec}">', f'      <a href="{sec}" aria-current="page">', 1)
    return s


def replace_between(text, open_m, close_m, body):
    pat = re.compile(re.escape(open_m) + r".*?" + re.escape(close_m), re.S)
    return pat.sub(lambda m: open_m + "\n" + body + "\n" + close_m, text)


def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def faq_schema(text):
    # Only <details> inside a .faq block, and a question may not run past its
    # own </summary>: tier cards use <details> too and must never match.
    blocks = re.findall(r'<div class="faq">(.*?)</div>\s*</div>\s*</section>', text, re.S)
    qa = []
    for b in blocks:
        qa += re.findall(r"<details><summary>((?:(?!</summary>).)*)</summary><div class=\"faq__a\">((?:(?!</details>).)*?)</div></details>", b, re.S)
    if not qa:
        return ""
    return ld({"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": strip_tags(q), "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in qa]})


def inline_values(text):
    def rep(m):
        key = m.group(3)
        if key not in TOKENS:
            raise KeyError(f"unknown data-offer key: {key}")
        return m.group(1) + TOKENS[key] + m.group(5)
    return re.sub(r'(<(\w+)\b[^>]*\bdata-offer="([^"]+)"[^>]*>)(.*?)(</\2>)', rep, text, flags=re.S)


# Cache busting. vercel.json serves css, js and images as immutable for a year,
# so a changed file must get a new URL or returning visitors keep the old one.
# Every local reference gets ?v=<first 8 hex of the file's SHA-1>. Fonts are
# left alone: style.css loads them by bare URL, and a versioned preload would
# no longer match that request. Rename a font file if you ever change it.
ASSET_REF = re.compile(
    r'(?<=["\s,])((?:https://www\.thecricket\.physio)?/(?:style\.css|script\.js|site-config\.js|assets/[\w./-]+\.(?:svg|png|jpg|jpeg|webp)))(?:\?v=[0-9a-f]{8})?(?=[\s",])')
_hashes = {}


def version_assets(text):
    def rep(m):
        url = m.group(1)
        local = ROOT / url.split("thecricket.physio", 1)[-1].lstrip("/")
        if not local.exists():
            raise FileNotFoundError(f"asset referenced but missing: {url}")
        if local not in _hashes:
            _hashes[local] = hashlib.sha1(local.read_bytes()).hexdigest()[:8]
        return f"{url}?v={_hashes[local]}"
    return ASSET_REF.sub(rep, text)


def process(path):
    text = path.read_text()
    url = page_url(path)
    new = text
    for name in ("head", "header", "footer"):
        o, c = f"<!-- partial:{name} -->", f"<!-- /partial:{name} -->"
        if o in new:
            new = replace_between(new, o, c, render_partial(name, url))
    for name, fn in BLOCKS.items():
        o, c = f"<!-- build:{name} -->", f"<!-- /build:{name} -->"
        if o in new:
            new = replace_between(new, o, c, fn())
    if "<!-- build:faq-schema -->" in new:
        new = replace_between(new, "<!-- build:faq-schema -->", "<!-- /build:faq-schema -->", faq_schema(new))
    new = inline_values(new)
    new = version_assets(new)
    return text, new


def pages():
    skip = {"_partials", "_tools", "node_modules", "cricket-logo", "docs"}
    return sorted(p for p in ROOT.rglob("*.html") if not (set(p.relative_to(ROOT).parts) & skip))


def main():
    check = "--check" in sys.argv
    stale = []
    for p in pages():
        old, new = process(p)
        if old != new:
            stale.append(p.relative_to(ROOT).as_posix())
            if not check:
                p.write_text(new)
    if check:
        if stale:
            print("Out of date, run python3 _tools/build.py:")
            for s in stale:
                print("  " + s)
            sys.exit(1)
        print("build: all pages up to date")
    else:
        print(f"build: {len(stale)} file(s) written" + ("".join("\n  " + s for s in stale) if stale else ""))


if __name__ == "__main__":
    main()
