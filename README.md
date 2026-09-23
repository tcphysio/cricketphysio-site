# thecricket.physio

Static site for The Cricket Physio. Plain HTML, CSS and JavaScript. No framework,
no dependencies, no build step. Deploys to Vercel as-is.

Built to the same pattern as `bridgeroad-site`, deliberately: one person
maintains both, and two sites that work the same way are half the thing to learn.

## Layout

```
index.html                                 home
about.html  services.html  telehealth.html  in-person.html
return-to-performance.html  teams.html  book.html  contact.html  faq.html
cricket-injuries/index.html                injury guide hub
cricket-injuries/*.html                    individual guides
bowling/index.html                         workload + return to bowling
resources/index.html                       education hub
privacy.html terms.html disclaimer.html accessibility.html
404.html
api/enquiry.js                             team enquiry handler (Vercel Function)
site-config.js                             business details, UTM, tracking events
style.css  script.js
assets/                                    favicon, touch icon, OG image
vercel.json                                redirects, headers, clean URLs
```

## Editing

The HTML files are the source of truth. Edit them directly.

Nav and footer are repeated in each file, which is the trade made here and on the
Bridge Road site: no build step to run, at the cost of a find-and-replace when a
nav item changes. Search the repo for the old text and change every instance.

Business details, booking URLs and UTM tagging live in `site-config.js`. Change a
detail there and the links follow. Contact details are **also** written into the
HTML of each page, because search engines need them in the markup rather than
injected by JavaScript. If you change one, search the repo for the old value.

## Fees

Fees are published on bridgeroad.physio, which is the single source of truth.
Only the two telehealth figures are repeated here, on `/telehealth`, `/services`
and `/book`. Change a telehealth fee and those three pages move together with
the Bridge Road fees page and the Halaxy appointment types. Miss one and a
patient sees a different figure on the site than at the checkout.

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
  pushes to `window.dataLayer`. No analytics is loaded yet; when one is added it
  picks these up with no markup changes.
- **Review dates on clinical pages.** Every guide shows when it was last
  reviewed. Update the date when you revise the content, not when you fix a typo.
- **No testimonials or review excerpts.** AHPRA advertising rules prohibit
  testimonials about clinical care for regulated health services. The Bridge Road
  site made this decision deliberately in September 2026. It applies here too.
