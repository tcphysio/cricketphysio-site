# thecricket.physio

Static site for The Cricket Physio. Plain HTML, CSS and JavaScript. No framework,
no dependencies, no build step. Deploys to Vercel as-is.

Built to the same pattern as `bridgeroad-site`, deliberately: one person
maintains both, and two sites that work the same way are half the thing to learn.

The Cricket Physio is the person. Bridge Road Physiotherapy is the place. This
site is an authority site with a few doors, not a clinic site. The brief that
sets this out is `docs/site-map.md`.

## Layout

```
index.html                                 home: hero, roles strip, three doors
organisations.html                         consulting for boards and programs
players.html                               players and parents, two booking buttons
about.html  contact.html
cricket-injuries/index.html                injury guide hub
cricket-injuries/*.html                    individual guides
bowling/index.html                         workload + return to bowling
resources/index.html                       education hub
privacy.html terms.html disclaimer.html accessibility.html
404.html
api/enquiry.js                             Contact form handler (Vercel Function)
site-config.js                             business details, booking links, UTM, tracking
style.css  script.js
favicon.ico
assets/brand/                              web-sized logo, mark, portrait, OG image,
                                           touch icon, Bridge Road crest for the badge
docs/                                      the brief and logo masters (not deployed)
_tools/                                    lint.py and qa.py (not deployed)
vercel.json                                redirects, headers, clean URLs
```

`.vercelignore` keeps `docs/`, `_tools/` and this README off the live site. The
brief holds internal positioning and competitor notes. Keep it that way.

## Editing

The HTML files are the source of truth. Edit them directly.

Nav and footer are repeated in each file, which is the trade made here and on the
Bridge Road site: no build step to run, at the cost of a find-and-replace when a
nav item changes. Search the repo for the old text and change every instance.

`style.css`, `site-config.js` and `script.js` are cached for a year by the
browser (see `vercel.json`). Every page loads them with a version query, for
example `/style.css?v=2`. When you change one of those files, bump the number
on every page, or returning visitors keep the old file.

## Before you push

```
cd _tools
python3 lint.py
python3 qa.py
```

`lint.py` fails on banned words, dashes, US spellings, the AHPRA terms in the
brief (specialist, elite, world-class, leading, testimonial), a street address
or phone number, a booking or enquiry link without tracking, and Bridge Road
named outside its approved spots. It also lists every placeholder still waiting
on real content. `qa.py` checks links, headings, alt text, labels and metadata.

## Placeholders

These show on the site until the real content arrives. `lint.py` lists them.

| Placeholder | Where | What replaces it |
|---|---|---|
| `TODO_TELEHEALTH_URL` | Players | Halaxy link for the telehealth calendar |
| `TODO_BRIDGE_ROAD_CRICKET_URL` | Players, Home, About, footer on every page | Halaxy link for the Bridge Road cricket consult service |
| `[SMA title]` | Home roles strip, About | Exact Sports Medicine Australia title |
| `[FROM]` `[TO]` | About | Start year for SMA, dates for Cricket Australia |
| `[QUALIFICATIONS: ...]` | About | Degree, institution, year, postgraduate study |

Replace a booking placeholder with a search across the repo: the real URL goes
in the markup so the buttons work with JavaScript off.

## Bridge Road

Bridge Road Physiotherapy is named in four places only, as the brief sets out:

1. Home, one line under the players door
2. Players, the in-person booking card and its badge
3. About, one sentence
4. The footer line on every page: "In-person consults: Bridge Road Physiotherapy, Richmond VIC."

Privacy and Terms also name it, because it holds the in-person clinical
records. Each approved spot carries a `data-br-spot` attribute, and `lint.py`
fails if the name or a link to bridgeroad.physio turns up anywhere else.

No street address, postcode or phone number goes on this site. The address
belongs to Bridge Road and its Google Business Profile only. A second listing
for the same address confuses local search and makes this brand look like a
second clinic.

Every link to Bridge Road points at its cricket booking page, not its homepage,
and carries `data-utm` so the Bridge Road analytics see the referral.

## Fees

None on this site. Halaxy shows the fee at booking, and Bridge Road publishes
its own fee list. The brief rules out packages and price tables here.

## Tracking

Every booking and enquiry element carries `data-track` (the event) and
`data-track-location` (where it sits). The handler in `site-config.js` pushes
each click to `window.dataLayer`:

```
{ event: 'tcp_event', tcp_action, tcp_location, tcp_detail }
```

No analytics is loaded yet. When Google Tag Manager arrives: one Custom Event
trigger on `tcp_event`, three Data Layer Variables. No markup changes. Loading
the container needs a CSP update in `vercel.json` and a privacy policy update.

The event list lives in `site-config.js`.

## Environment variables

Set in the Vercel dashboard, not in the repo:

| Variable | Required | Default |
|---|---|---|
| `RESEND_API_KEY` | yes, or the Contact form returns 500 | none |
| `ENQUIRY_TO` | no | `thihan@thecricket.physio` |
| `ENQUIRY_FROM` | no | `The Cricket Physio <enquiries@thecricket.physio>` |

`ENQUIRY_FROM` must be on a domain verified in Resend or the send is rejected.

The email subject carries the "I am a" choice, for example
`[Organisation] Enquiry from Jane Smith`. The allowed values are fixed in
`api/enquiry.js` and must match the `<select>` in `contact.html`.

## Conventions worth keeping

- **No trailing slashes.** `vercel.json` sets `trailingSlash: false`. Every
  internal link and canonical is written without one. A link with a slash gets
  301'd, and a canonical pointing at a redirect is a self-inflicted SEO problem.
- **No internal links to retired pages.** Link to where the redirect lands.
- **UTM parameters on outbound links only.** Never on internal navigation:
  tagging same-site links restarts the session in most analytics tools and
  destroys the attribution the tags exist to collect.
- **Review dates on clinical pages.** Every guide shows when it was last
  reviewed. Update the date when you revise the content, not when you fix a typo.
- **No testimonials, no outcome claims, no "specialist".** AHPRA advertising
  rules. Roles are stated as facts. The Bridge Road site made the same decision
  in September 2026.
