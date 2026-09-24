# thecricket.physio

Static site for The Cricket Physio. Plain HTML, CSS and JavaScript. No framework,
no npm dependencies, no deploy build. Deploys to Vercel as-is.

**The master brief is `docs/website-brief.md`.** Read it before changing
positioning, copy, layout or the design system. `CLAUDE.md` summarises the
rules an agent must follow.

Built to the same pattern as `bridgeroad-site`, deliberately: one person
maintains both, and two sites that work the same way are half the thing to learn.

## Layout

```
index.html                                 home
cricket-performance/index.html             memberships landing (/cricket-performance)
cricket-performance/players.html           player memberships, application form
cricket-performance/clubs.html             club packages, enquiry form
about.html  services.html  telehealth.html  in-person.html
return-to-performance.html  teams.html  book.html  contact.html  faq.html
cricket-injuries/index.html                injury guide hub
cricket-injuries/*.html                    individual guides
bowling/index.html                         workload + return to bowling
resources/index.html                       education hub
privacy.html terms.html disclaimer.html accessibility.html
404.html
api/enquiry.js                             team, player and club form handler (Vercel Function)
site-config.js                             business details, UTM, analytics event registry
style.css  script.js                       design system and behaviour
data/offers.json                           every membership and club price, inclusion and rule
_partials/header.html  _partials/footer.html   shared chrome, written into every page
_tools/build.py                            writes partials, offer blocks and FAQ schema into HTML
_tools/qa.py  _tools/lint.py               link/heading/metadata QA and copy lint
assets/fonts/                              self-hosted Archivo and IBM Plex Sans
assets/img/                                optimised photography
docs/website-brief.md                      master brief and design-system specification
vercel.json                                redirects, headers, clean URLs
.vercelignore                              keeps docs, data, tools and raw logos off the live site
```

## Editing

The HTML files are what Vercel serves. Edit them directly, except for the
generated regions, which `_tools/build.py` owns:

- Between `<!-- partial:header -->` and `<!-- /partial:header -->` (and footer):
  edit `_partials/header.html` or `_partials/footer.html` instead.
- Between `<!-- build:NAME -->` and `<!-- /build:NAME -->`: edit `data/offers.json`.
- The text of any element with `data-offer="KEY"`: edit `data/offers.json`.
- Between `<!-- build:faq-schema -->` markers: edit the visible FAQ on the page.

Then run, from the repo root, before every commit:

```
python3 _tools/build.py          # writes the generated regions
python3 _tools/build.py --check  # fails if anything is stale
cd _tools && python3 qa.py && python3 lint.py
```

The build runs on your machine, not on deploy, so the prices and nav stay in the
markup for search engines and for visitors without JavaScript.

Business details, booking URLs and UTM tagging live in `site-config.js`. Change a
detail there and the links follow. Contact details are **also** written into the
HTML of each page, because search engines need them in the markup rather than
injected by JavaScript. If you change one, search the repo for the old value.

## Fees and prices

Membership and club prices live in `data/offers.json` and nowhere else. Change a
price there, run the build, commit.

The member-rate table repeats five in-person fees from bridgeroad.physio
(initial, review, extended, Sports Injury Screening, Return to Performance
Assessment). Those five figures in `data/offers.json` must match the Bridge Road
fees page and Halaxy. The two telehealth figures are still written by hand on
`/telehealth`, `/services` and `/book`. Miss one and a patient sees a different
figure on the site than at the checkout.

No checkout is connected yet. Every tier CTA goes to the application form with the
tier preselected. When a payment link exists, put it in the tier's
`cta.checkoutUrl` and rebuild: the CTA then goes straight to checkout and fires
`checkout_start`.

## Environment variables

Set in the Vercel dashboard, not in the repo:

| Variable | Required | Default |
|---|---|---|
| `RESEND_API_KEY` | yes, or the team enquiry form returns 500 | none |
| `ENQUIRY_TO` | no | `thihan@thecricket.physio` |
| `ENQUIRY_FROM` | no | `The Cricket Physio <enquiries@thecricket.physio>` |

`ENQUIRY_FROM` must be on a domain verified in Resend or the send is rejected.

## Conventions worth keeping

- **No trailing slashes.** `vercel.json` sets `trailingSlash: false`. Every
  internal link and canonical is written without one. A link with a slash gets
  301'd, and a canonical pointing at a redirect is a self-inflicted SEO problem.
- **UTM parameters on outbound links only.** Never on internal navigation:
  tagging same-site links restarts the session in most analytics tools and
  destroys the attribution the tags exist to collect.
- **`data-track` on anything worth counting.** The handler in `site-config.js`
  pushes to `window.dataLayer`, and `script.js` adds form, tier-view, FAQ and
  scroll-depth events. The full registry is in `site-config.js`. No analytics is
  loaded yet; when one is added it picks these up with no markup changes.
- **Review dates on clinical pages.** Every guide shows when it was last
  reviewed. Update the date when you revise the content, not when you fix a typo.
- **No testimonials or review excerpts.** AHPRA advertising rules prohibit
  testimonials about clinical care for regulated health services. The Bridge Road
  site made this decision deliberately in September 2026. It applies here too.
- **No "specialist" in copy about Thihan.** Use "cricket physio" or
  "cricket-specific". See the brief, section 8.
- **Copy lint is not optional.** `lint.py` enforces the banned-word list and the
  no-dash rule on every page. Allowlist an exact phrase only when the owner has
  chosen to keep it.
- **One primary button per view.** Tier cards: the highlighted tier gets the
  primary style; the others are secondary.
