# CLAUDE.md

Static site for The Cricket Physio (thecricket.physio). Plain HTML, CSS and JS on Vercel. No framework, no npm dependencies, no deploy build.

**`docs/website-brief.md` is the master brief.** Read sections 1, 8, 9, 10, 28 and 38 before changing copy, layout or visuals. Where the brief and anything else disagree, the brief wins; `data/offers.json` wins on prices.

## Before every commit

```
python3 _tools/build.py            # writes partials, offer blocks, FAQ schema, cache-busting hashes
python3 _tools/build.py --check    # must print "all pages up to date"
cd _tools && python3 qa.py && python3 lint.py   # must print "no issues found" and "clean"
```

## Generated regions: never hand-edit

| In the HTML | Edit instead |
|---|---|
| `<!-- partial:head -->` / `<!-- partial:header -->` / `<!-- partial:footer -->` | `_partials/head.html`, `_partials/header.html`, `_partials/footer.html` |
| `<!-- build:NAME -->` blocks | `data/offers.json` |
| Text of any element with `data-offer="KEY"` | `data/offers.json` |
| `<!-- build:faq-schema -->` | The visible `.faq` on the same page |
| `?v=` on css, js and image URLs | Nothing: the build computes it |

## Copy rules (enforced by lint.py or the brief)

- Thihan writes in the first person. Australian English ("program", "organise"). Short sentences, active voice.
- No em or en dashes. No banned words (list in `_tools/lint.py`): rewrite, do not allowlist.
- Never: testimonials about clinical care, "specialist" about Thihan, injury-prevention guarantees, return timelines as promises, "world-class", "Most Popular".
- Discounts always show their terms beside them.
- Memberships are sold on oversight, never on appointment counts.

## Design rules

- **Dark only.** No light theme, no toggle, no `prefers-color-scheme` rules. Brief section 9.
- Use the semantic CSS tokens (`--ink`, `--text`, `--link`, `--surface`...), never raw hex in components.
- Teal (`--teal`, from the logo) is the only accent. Clay is for ball-seam stitches only.
- Instrument Serif for H1, H2 and display numerals; Manrope for everything else. One teal italic `<em>` per heading, at most.
- The logo files in `assets/brand/` are the brand in the header, footer and icons. Never redraw it as text.
- Thihan is the brand: name, face or byline in the first screen of every page that sells.
- One primary button per view. Cards for things a visitor chooses between or clicks into.
- Effects must respect `prefers-reduced-motion` and never hide content without JavaScript. Add new reveal targets to `REVEAL` in `script.js`.
- Test at 390px: no horizontal scroll, H1 in four lines or fewer, primary CTA in the first screen. Check 820px too.

## Conventions

- No trailing slashes in links or canonicals. UTM only on outbound booking links, added by `script.js`.
- `data-track="event_name"` on anything worth counting; register new events in `site-config.js` and brief section 33.
- In-person care is at Bridge Road Physiotherapy. This site has no address of its own and no LocalBusiness schema.
- Every new third party needs a CSP change in `vercel.json` and a privacy policy line in the same commit.
- Photos of identifiable players, and team logos, need written consent or permission before launch. Brief section 1.4.
