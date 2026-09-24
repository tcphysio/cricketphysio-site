# The Cricket Physio: website brief and implementation specification

**thecricket.physio** · Version 2.0 · 24 September 2026 · Owner: Thihan Chandramohan

Version 2 made the site dark only, put the logo and brand colours everywhere, moved Thihan to the front, and added a page for professional and international players. Section 1.5 lists every change from version 1. Where a version 1 statement survives below and conflicts with 1.5, section 1.5 wins.

This is the master reference for designing, building, editing and extending the site. Where it conflicts with `cricket-physio-site-map.md` (23 September 2026), this document wins. Section 1.3 lists every conflict and how it was resolved.

**For Claude Code, before any change:**

- Read sections 1, 8, 9, 10, 28 and 38 before touching copy or visuals.
- Prices, inclusions and membership rules live in `data/offers.json`. Never hand-write a price in HTML. Run `python3 _tools/build.py` after editing it.
- Shared head (icons, fonts, stylesheet), header and footer live in `_partials/`. The build writes them into every page.
- The site is dark only. There is no light theme and no toggle. Do not add one.
- Before every commit: `python3 _tools/build.py --check`, then `cd _tools && python3 qa.py && python3 lint.py`. All three must pass.
- Items marked **Decision needed** are not settled. Do not build them as if they were.
- Labels used throughout: **Fact** (verified in the repo or stated by the owner), **Assumption** (reasonable, unverified), **Opinion** (a recommendation you are free to overrule).

---

## Contents

1. Executive summary
2. Brand positioning
3. Business objectives
4. Audience segments
5. User needs and journeys
6. Conversion goals
7. Brand personality
8. Tone of voice
9. Colour system
10. Typography
11. Photography and imagery
12. Design principles
13. Sitemap
14. Navigation
15. Homepage specification
16. Page-by-page specifications
17. Services architecture
18. Fast bowling strategy
19. Return-to-performance strategy
20. Telehealth strategy
21. Club, team and organisation strategy
22. Education strategy
23. Content strategy
24. SEO architecture
25. Internal linking strategy
26. Conversion architecture
27. Trust strategy
28. Component library
29. Responsive design rules
30. Accessibility requirements
31. Technical recommendations
32. Performance requirements
33. Analytics and conversion tracking
34. Relationship with Bridge Road Physio
35. Future product architecture
36. What to remove from the existing site
37. Priority implementation roadmap
38. Final design-system specification
- Appendix A. Persona check of the current build
- Appendix B. Open questions log

---

## 1. Executive summary

The Cricket Physio is Thihan Chandramohan's cricket-only physiotherapy, rehabilitation, workload and consulting practice. Bridge Road Physiotherapy in Richmond is where in-person work happens. The two brands stay separate.

The website has four jobs, in this order:

1. Turn cricketers with a problem into consultations, in person or by telehealth.
2. Turn players who want ongoing support into members (Essentials, Performance, Integrated Performance).
3. Turn clubs, academies and cricket organisations into enquiries (Club Core, Club Plus, consulting).
4. Build authority and an audience through cricket medicine content that people search for and share.

**The central idea (internal line, not site copy):** the quality of thinking used in professional cricket, available to players outside it. Not the same budget. The same thinking. On the site this shows up as behaviour rather than a slogan: workload read in context, rehab that runs past pain-free to performance, written plans, and a physio who talks to the coach.

### 1.1 Why the site did not feel right

**Fact**, from the build as it stood on 23 September 2026:

- **Every section had the same weight.** Eyebrow, heading, grid of bordered cards, repeat ten times. Nothing anchored the eye, so nothing felt important.
- **No contrast anchor.** White and pale grey from top to bottom. No dark band to give the page structure or a sense of seriousness.
- **Serif headings read academic.** IBM Plex Serif suited a journal more than a performance clinic.
- **Teal and indigo read as generic health-tech.** The brand teal (#009996) also fails AA as text on white at 3.5:1.
- **All text, no imagery.** Not a single photograph. The one career photo in the repo was unused.
- **Routing by audience type, not by problem.** "Cricketers / Coaches / Physiotherapists" asks visitors to classify themselves. Players think in problems: "my back hurts when I bowl".
- **Mobile hero ate the screen.** The H1 ran to four lines at 34px serif and the lede to five, pushing the secondary CTA below the fold.

What changed in version 1 (colour, type and several layouts were then replaced in version 2, section 1.5):

- Navy hero and bands as structural anchors, warm off-white pages, muted cricket green for actions only.
- Archivo display type at 92% width with IBM Plex Sans for reading. Self-hosted.
- A problem selector in the homepage hero that routes in the player's own words.
- Rule-separated columns replace most card grids. Cards remain only where items are compared (tiers, packages).
- The return-to-performance continuum as the brand's signature diagram.
- Three sales pages for memberships and clubs, driven from one data file.
- A real portrait at a ground in the profile block.

### 1.2 What the brand is, in one paragraph

A cricket physio who has worked in international, domestic, franchise and county cricket, who explains what the evidence does and does not say, who plans rehab around the fixture list, and who works with a player's coach, S&C and doctor rather than around them. Calm, specific, practical, mildly irreverent. Never guru, never gym-bro, never healthcare advertising.

### 1.3 Conflicts with earlier decisions, and how they were resolved

| Topic | 23 Sep site map | This brief | Why |
|---|---|---|---|
| Site role | Mainly portfolio, no priced offers | Priced memberships and club packages on the site | Owner's new commercial plan (the membership brief). |
| Audience order | Organisations first, players second | Players first, organisations second | Goals 1 to 4 in the brief are player goals. Organisations stay the highest value per engagement and keep a clear route. |
| Testimonials | None | Still none for clinical care | The Health Practitioner Regulation National Law (s133) prohibits testimonials in advertising a regulated health service. The brief's "selected testimonials" request is **not** implemented. Section 27 lists what replaces them. |
| "Specialist" | Avoid in copy | Avoid in any copy about Thihan or the service | Ahpra treats "specialist" as implying specialist registration or a recognised specialist title. Use "cricket physio", "cricket-specific", "works only in cricket". This brief uses "specialist" internally only. |
| Workload tool access | "Request access", never "sign up free" | Free, open: "Start tracking your bowling" | The membership brief makes the free tool the low-commitment entry point. **Decision needed:** confirm open sign-up is live before launch (1.4). |
| Screening | "I do not run injury prediction screening" | Sports Injury Screening sold as baseline testing, never prediction | Keeps the honest stance while selling the product. Copy says plainly that no screen predicts injury. |
| Fee source of truth | bridgeroad.physio only | Five in-person fees also shown in the member-rate table, from `data/offers.json` | A discount means nothing without the base fee. Those five figures must be kept in step with Bridge Road. |
| Lumbar bone stress guide | Lives on the Bridge Road blog, linked from here | Moves to thecricket.physio; Bridge Road links here | Cricket content belongs to the cricket brand, and the old map already said "write once on Cricket Physio". One URL gathers the authority instead of two splitting it. |
| Theme | Toggle in the header | Dark only, no toggle (version 2) | Owner instruction. One theme to design, measure and photograph for. |
| Logo | Master logo in the header | Master logo, reversed for dark, in the header, footer, favicon set and app icons (version 2) | Owner instruction. Version 1 had replaced it with a drawn mark; version 2 restores it. |
| Professional players | A route inside `/teams` | Own page, `/professional-players`, with its own form and nav item (version 2) | Owner instruction to target international professionals. |
| Hero line | "Keeping cricketers on the park" (planned) | "Cricket injuries need cricket answers." (version 2; version 1 used "Cricket injuries, managed the way professional teams manage them.") | Shorter, cricket-first, and holds up at display size. Thihan's name sits above it and the proof strip follows. |

### 1.4 Launch gates: decisions needed from Thihan

These block launch of the membership pages, or change what they say. Ranked by risk.

1. **Do the Essentials features exist today?** Essentials promises a self-monitoring dashboard, automated bowling-load and soreness alerts, automated check-ins, onboarding, self-screening, and rehab, strength and warm-up libraries. Any feature not live on launch day must come out of `data/offers.json` or be labelled with a date. Advertising a feature that does not exist is misleading conduct under the Australian Consumer Law, whatever the intent. **This is the biggest risk in the offer.**
2. **Is open sign-up live on the Bowling Workload Tool?** Every "Start tracking your bowling" button assumes it is.
3. **Checkout provider.** None is connected. Every tier CTA currently goes to the application form with the tier preselected (Fact). Recommendation: Stripe Payment Links first (section 31.4).
4. **Telehealth injury triage price.** Essentials gets 20% off it, but no price is published anywhere. Existing telehealth fees are $150 initial and $120 review.
5. **In-person fees.** The member-rate table shows $180 initial, $140 review, $180 extended, $250 screening, $250 Return to Performance Assessment. Confirm these match Bridge Road and Halaxy today.
6. **GST.** Physiotherapy services are generally GST-free. S&C programming, nutrition guidance and software access inside a membership might not be. Get accountant advice, then state "prices include GST where it applies" if needed.
7. **Private health.** The FAQ tells players to assume the membership fee is not claimable. Confirm.
8. **Junior upfront pricing.** Not defined. The site shows junior monthly prices only.
9. **Club end-of-season report.** The clubs page says individual clinical detail appears only for consenting players. Confirm that is the practice.
10. **Privacy review.** Player applications now carry brief health information by email via Resend (a US service). The privacy policy says so. Have it reviewed against the Australian Privacy Principles, especially APP 8 (cross-border disclosure).
11. **Professional indemnity for overseas telehealth.** Confirm the insurer covers consultations with players outside Australia.
12. **Photo consent: the pitch-side image.** `/professional-players` and the home page show Thihan assessing an identifiable Bangladesh international on the outfield. That is an identifiable player in an injury context, which section 11.3 says needs the player's explicit written consent for that use, plus the Bangladesh Cricket Board's permission for the kit and sponsor marks. The image came from the bridgeroad.physio asset set. Being published there does not settle it here. **Confirm consent in writing, or swap the image before launch.** High risk for a page aimed at professionals, who notice.
13. **Photo consent: the Italy gym image.** The home and about pages show a player in a loaded trunk exercise in Italy team kit. Confirm the player's consent and the Federazione Cricket Italiana's permission for the kit.
14. **Organisation logos.** Eight team and governing-body logos appear in the home marquee. Logos are trade marks. Using them to show where Thihan has worked is common, but some bodies prohibit it and none has approved it here. Get written permission from each, or revert to names as text (the version 1 approach, still supported by `.orgs`).
15. **Photography.** A shoot or an archive pull (section 11). Three photos carry the site today. Action shots of fast bowling and running rehab are still missing.
16. **Reversed logo.** The master logo was recoloured for dark backgrounds (section 9.1). Confirm the result is acceptable as the brand on dark, or supply an official reversed version.
17. **Reference sites.** The version 2 reference notes arrived as written analysis (section 1.5). If you have the sites' URLs, send them and they get checked against the build.

### 1.5 Version 2: professional, dark, personal

**Owner direction (Fact), 24 September 2026:**

- Target international and professional players, so the site must read as a professional operation.
- Dark only, with no light option.
- Thihan is the brand and should sit front and centre.
- Brand colours and the logo in every part of the site, including the favicon and header.
- The feel of the bridgeroad.physio site, at a higher specification, with more effects.
- Reference notes on eight sites (Rocket Factory, Basketball.Physio, Home Run, Hoops, Physio Fore, Green Golf, Power + Pace, Kinetic), to inform the work rather than dictate it.

**What changed:**

| Area | Version 1 | Version 2 |
|---|---|---|
| Theme | Light by default, dark through a footer toggle | Dark only. `color-scheme: dark`; the toggle, its script and the `theme_toggle` event are gone |
| Colour | Navy, off-white, cricket green | Brand teal `#14ACAA` and grey `#ADA7AC`, sampled from the logo reversed for dark, on near-black with a teal undertone (section 9) |
| Type | Archivo and IBM Plex Sans | Instrument Serif for display, with teal italic emphasis; Manrope for text and interface (section 10) |
| Logo | A drawn mark and a text wordmark | The master logo, reversed for dark, in the header, footer, favicons, app icons and `Organization` schema |
| Thihan | A profile block low on the home page | Name and avatar above the home H1, portrait with a credential card in the hero, a byline on every product page, a pull quote, a career list on `/about`, and the footer name block |
| Professionals | A route inside `/teams` | `/professional-players`, a home band, a nav item and a dedicated enquiry form (`pro`) |
| Routing | Problem selector list | "What brings you here?" cards on home; "I need help with…" on `/services` |
| Rehab idea | Four-phase continuum | Six-stage pathway with a drawn line, on home and `/return-to-performance` |
| Proof | Organisation names as text | Proof strip with four figures, and organisation logos in a marquee (permission needed, 1.4 item 14) |
| Resources | Article list | The Cricket Physio Journal, with a topic taxonomy |
| Motion | Orientation only | Reveals, marquee, pathway line draw, parallax, spotlight hover, animated featured border, scroll progress. All off under reduced motion (section 12) |
| Photography | One portrait | Portrait, pitch-side assessment and Italy gym images, all WebP with JPEG fallback |

**How the reference notes were used (Opinion, open to overrule):**

| Idea from the notes | Decision | Why |
|---|---|---|
| "I need help with…" pathways | Adopted as the `/services` H1 and structure | Players arrive with a problem, not a service name |
| A six-stage rehab pathway | Adopted on home and `/return-to-performance` | Makes return to performance concrete and ownable |
| Hero line "Cricket injuries need cricket answers." | Adopted as the home H1 | Short, cricket-first, strong at display size |
| Proof strip | Adopted: 20+ years, 15+ in elite cricket, 3 international programs, online worldwide | Every figure traces to section 2.3 |
| "What brings you here?" | Adopted on home | Same logic as the services pathways, shorter |
| A dominant fast bowling section | Adopted: the largest type on the home page, with a pitch diagram | Fast bowling is the pillar |
| "Work with me" | Adopted as the nav label for `/services` and a home section eyebrow | First person suits a personal brand |
| "Experience where it matters" | Adopted as the home experience band, with the pull quote | |
| A journal with a taxonomy | Adopted on `/resources` | Gives the guides a home with editorial weight |
| Editorial serif with a clean sans | Adopted | Reads as considered and senior on dark |
| Photography of real cricket rehab | Adopted with the three images available | Consent gates in 1.4 items 12 and 13 |
| Wordmark-first identity with the logo in a secondary role | Not adopted | The owner asked for the logo in every part of the site |

**Bridge Road link (Fact):** the dark palette, pill buttons, glass header, grain and generous spacing follow the bridgeroad.physio direction. Colour is where the two sites part: this one takes its teal and grey from its own logo. Two photos and the eight organisation logos come from the bridgeroad.physio asset set.

---

## 2. Brand positioning

### 2.1 Where The Cricket Physio sits

| | Generic sports physio | **The Cricket Physio** | Professional team medical department |
|---|---|---|---|
| Who it serves | Anyone with a sports injury | Cricketers at every level, their clubs and their support staff | Contracted players only |
| Cricket knowledge | General | Built from 15+ years inside elite cricket | Deep, team-specific |
| Rehab end point | Pain settled | Prepared for the demands of the role | Performance |
| Bowling workload | Rarely considered | Measured, read in context | Measured daily |
| Talks to coach and S&C | Rarely | Yes, with consent | Constantly |
| Access | Book when it hurts | Book when it hurts, or ongoing membership | Always on |
| Cost to player | Per appointment | Per appointment or monthly | Paid by the team |

### 2.2 Positioning statement (internal, not site copy)

For cricketers, parents, clubs and cricket organisations who want fewer avoidable injuries and better-planned returns, The Cricket Physio is a cricket-only physiotherapy and performance practice that applies the reasoning of professional cricket medicine to players outside professional systems. Unlike a general sports physio, it is built on international, franchise and county experience, reads bowling workload in context, and runs rehab through to performance, past pain relief.

### 2.3 Proof points (the only claims the site makes about Thihan)

Each is verifiable. Nothing else gets claimed.

- More than 20 years in physiotherapy. More than 15 in elite sport, most of it cricket.
- Roles with Sri Lanka Cricket, Bangladesh Cricket Board, Cricket Victoria, Cricket Australia, Melbourne Stars, Melbourne Renegades, Hampshire Cricket.
- Head of Sports Science and Sports Medicine, Federazione Cricket Italiana (Italy men's national team program).
- Victorian State Council, Sports Medicine Australia.
- AHPRA registration PHY0001614815.

**Decision needed:** confirm the exact role title and years for each organisation before they appear with dates on the About page.

**Check (Assumption to confirm):** the home proof strip and the footer say "15+ years in elite cricket"; `/about` says "more than fifteen in elite sport, most of it in cricket". If part of the fifteen years was outside cricket, change the home and footer wording to "elite sport".

### 2.4 What the site never claims

- "World-class", "leading", "elite solutions", "best".
- "Specialist" about Thihan or the service (see 1.3).
- Injury prevention as a guaranteed outcome. Use "reduce avoidable problems", "pick problems up earlier".
- Return timelines ("back bowling in 6 weeks").
- That membership equals a professional team's resources. Same thinking, not same budget.

---

## 3. Business objectives

Every page has one objective from this table. KPIs need a baseline: run eight weeks of analytics, then set targets (**Assumption**: no traffic data exists yet).

| # | Objective | Primary pages | KPI (event, section 33) |
|---|---|---|---|
| 1 | Consultations from injured cricketers | Home, `/services`, injury guides, `/book` | `book_click`, Halaxy bookings tagged `utm_source=thecricketphysio` |
| 2 | Telehealth consultations | `/telehealth`, guides, `/book` | `telehealth_click` |
| 3 | Fast bowlers: rehab, workload, return to bowling | `/bowling` hub, back pain guide, tool | `bowling_tool_click`, `book_click` from bowling pages |
| 4 | Structured services: memberships, RTP assessment, screening | `/cricket-performance/*`, `/return-to-performance` | `application_complete`, `checkout_start`, `membership_*_click` |
| 5 | Club and organisation relationships | `/cricket-performance/clubs`, `/teams` | `club_enquiry_complete`, `team_enquiry_complete` |
| 6 | Sports medicine and sports science consultancy | `/teams` | `team_enquiry_complete` |
| 7 | Authority in cricket injury management | Guides, `/about`, `/resources` | Organic entrances to guides, `article_read` |
| 8 | Audience through useful content | Guides, `/resources` | Returning visitors, mailing list sign-ups (Phase 4) |
| 9 | Future education products | `/resources` → `/learn` | Waitlist sign-ups (Phase 5) |
| 10 | An ecosystem, not a brochure | Tool, memberships, content, clubs | Visitors who touch two or more of: guide, tool, membership page |

---

## 4. Audience segments

| Seg | Who | Priority | Arrives with | Needs to see in 10 seconds | Primary next step | Usual entry |
|---|---|---|---|---|---|---|
| A | Injured cricketers: club, premier, academy, professional, international, juniors via parents | Primary | A specific injury and a fixture list | This person knows cricket injuries; how and where to be seen | Book a consultation | Google, home |
| B | Fast bowlers | Primary | Back pain, side strain, hamstring, shoulder, ankle, workload, a stalled return to bowling | Bowling loads are understood with nuance | Book, or start tracking bowling | Guide, `/bowling` |
| C | Players who already have a physio, S&C, doctor or coach | Primary | A plan that is not working, or a need for cricket-specific input | Works alongside the existing team | Telehealth or Performance membership | `/telehealth`, memberships |
| D | Parents of junior cricketers | Secondary | A worried 14 to 17 year old quick | Junior bowling is handled carefully; parents are involved | Book, or junior membership | Guide, home |
| E | Coaches and S&C staff | Secondary | A squad problem, a player to refer | Useful resources; how to refer | Club package or resources | `/resources`, `/bowling` |
| F | Clubs and academies | Secondary | Too many injuries, no medical system | Fixed-price season support without hiring | Club enquiry | `/cricket-performance/clubs` |
| G | Professional teams and governing bodies | Secondary, highest value per deal | A systems or staffing gap | Relevant roles, systems thinking, how an engagement runs | Team enquiry | LinkedIn → home → `/teams` |
| H | Physiotherapists and sports medicine clinicians | Secondary | A cricketer on their list | Second-opinion route, clinical resources | Contact, resources | `/resources` |
| I | Player managers and agents | Secondary | A client with an injury or a contract question | Credibility, discretion, speed | Professional player enquiry | `/professional-players`, `/about` |
| J | International and professional players (version 2) | Primary for positioning, highest credibility bar | A second opinion, a stalled return, an off-season gap, a tour away from team support | Thihan has been the team physio; input is discreet and works with the team's medical staff | Discuss your situation (`pro` form) | LinkedIn, referral, home band → `/professional-players` |

---

## 5. User needs and journeys

Each journey names the page sequence the site must support. If a step is missing, the journey is broken.

| # | Persona | Trigger | Path | Converts at |
|---|---|---|---|---|
| J1 | Club player in Melbourne with a hamstring strain | Google "cricket physio melbourne" | Home → selector "I have hurt myself" → `/book` → Bridge Road Halaxy | `book_click` |
| J2 | Regional fast bowler, one-sided back pain | Google "fast bowler back pain" | Back pain guide → "What to do in the first week" → `/telehealth` or `/book` | `telehealth_click` |
| J3 | Bowler diagnosed with a lumbar stress injury | Referral or search | LBSI guide (Phase 3) → `/bowling/return-to-bowling` → Performance membership | `application_complete` |
| J4 | Parent of a 16-year-old quick | Club coach mentions back pain | Home → fast bowling band → junior guide (Phase 3) → consultation or junior membership | `book_click` or application with guardian fields |
| J5 | Professional player with a club S&C coach | LinkedIn or word of mouth | `/cricket-performance` → Integrated Performance → FAQ "Do you replace my S&C?" → apply | `application_complete` |
| J6 | Club coach with no physio | Committee asks for a plan | `/cricket-performance/clubs` → packages → consent section → enquiry | `club_enquiry_complete` |
| J7 | Club physio wanting cricket-specific backup | A stalled rehab case | `/resources` or `/teams` → contact, or club package | `email_click`, club enquiry |
| J8 | Governing body or franchise medical lead | LinkedIn message from Thihan | Home → orgs strip → `/about` → `/teams` → enquiry | `team_enquiry_complete` |
| J9 | Physio seeking education | Conference or podcast | `/resources` → speaking or course waitlist | Contact, waitlist (Phase 4) |
| J10 | Player manager | Client's injury | `/about` → `/contact` | `phone_click`, `email_click` |

---

## 6. Conversion goals

**Macro conversions** (worth reporting on weekly):

| Goal | Event | Relative weight (Opinion) |
|---|---|---|
| Team or organisation enquiry sent | `team_enquiry_complete` | 10 |
| Club enquiry sent | `club_enquiry_complete` | 8 |
| Integrated Performance application | `application_complete` with `integrated` | 8 |
| Performance application | `application_complete` with `performance` | 5 |
| Essentials sign-up or checkout start | `application_complete` with `essentials`, later `checkout_start` | 2 |
| Consultation booking started | `book_click`, `telehealth_click` | 3 |

**Micro conversions** (signals of intent): `bowling_tool_click`, `find_level_click`, `compare_click`, `tier_card_view`, `faq_open`, `article_read`, `scroll_depth`, `phone_click`, `email_click`, `problem_select`.

The weights exist so a report says something useful ("clubs converted, players did not") rather than adding unlike things together.

---

## 7. Brand personality

| Is | Shows up as | Is not | Never looks like |
|---|---|---|---|
| Specialist in focus | Cricket-only examples, cricket vocabulary used correctly | Generic healthcare | Stock clinic photos, "all sports and injuries" |
| Evidence-led | References, reviewed dates, "what we do not know" | Pseudo-scientific | Miracle treatments, gadgets, "cutting-edge" |
| Practical | Plans, checklists, criteria, schedules | Motivational | "Crush it", "unleash", fist-pump imagery |
| Experienced | Named roles stated plainly once | Self-important | Logo walls, long biographies, awards pages |
| Calm | No urgency, no countdowns, no exclamation marks | Sales-heavy | Pop-ups, "limited time", flashing badges |
| Athlete-focused | Talks about the player's season, role and career | Corporate | "Solutions", "stakeholders", "synergies" |
| Independent | Works with any existing support team | Luxury or wellness | Spa palettes, "journey", "holistic" |
| Mildly irreverent | "Spreadsheet archaeology", "boring on purpose" | Gym-bro | Shouting type, aggressive crops, neon |

---

## 8. Tone of voice

### 8.1 Rules

- **First person.** Thihan writes as "I". The reader is "you". "We" means "you and I", never a corporate "we".
- **Short sentences. Active voice. Plain English.** Clinical terms are welcome when they add precision, with a plain explanation on first use: "lumbar bone stress injury, a stress reaction or fracture in the lower back".
- **Australian English.** Organise, centre, colour, program (the Australian Government Style Manual form for all senses), practise (verb), licence (noun).
- **No em dashes or en dashes.** Use a full stop, a comma or a colon. `lint.py` enforces this.
- **Banned words.** The list in `_tools/lint.py` is enforced on every page. It includes can, may, just, very, really, actually, could, maybe, unlock, discover, boost, powerful and the rest of the owner's list. Rewrite rather than allowlist. Allowlist only an exact phrase the owner chose to keep (currently one: "not just pain").
- **Numbers.** Numerals for 10 and above and for every measurement, price, age and duration. "Four assessments" in running text, "4" in tables.
- **Abbreviations.** S&C is fine everywhere. RTP only after "return to play" or "return to performance" appears in full on the same page. LBSI only after the full term.
- **Uncertainty is stated.** Pattern: "The evidence supports X. It does not tell us Y. Here is what I would do."
- **Every service states its limit.** What it does not include, who it does not suit, when to see someone else.

### 8.2 Regulated-language rules (Ahpra advertising guidelines)

- No testimonials about clinical care, on this site or quoted from anywhere.
- No "specialist", "specialises in" or "expert in" about Thihan.
- No outcome guarantees and no "prevent injury". Use "reduce avoidable problems", "pick things up earlier".
- No return timelines as promises. Ranges with conditions, in guides only.
- Discounts show their terms beside them: who qualifies, what it applies to, what it does not combine with. (National Law s133(1)(c).)
- No "best", "leading", "number one", "most trusted".
- No before-and-after claims.

### 8.3 Rewrites

| Instead of | Write |
|---|---|
| World-class cricket physiotherapy | Cricket physiotherapy from someone who has worked in the professional game |
| Get back stronger than ever | Rehab finishes when you are prepared for the demands of your role |
| Injury-proof your bowlers | Pick problems up earlier and plan bowling load on purpose |
| Transform your performance | Plan your gym work, bowling and matches together |
| Our elite package | Integrated Performance |
| I specialise in cricket | I work only in cricket |
| Book now! | Book a consultation |
| Unlock your potential | (delete the sentence) |
| Cutting-edge treatment | Name the actual method and why it fits |
| Most popular | Individual clinical support (until purchase data exists) |

### 8.4 Microcopy

- Buttons are verb plus object: "Book a consultation", "Join Performance", "Apply for Integrated Performance", "Enquire about Club Core", "Start tracking your bowling".
- Commitment sets the verb: Join (low commitment, instant), Apply (limited places, suitability check), Enquire or Discuss (organisations).
- Form errors say what to do: "Please enter your email." "That email address does not look right. Check it and try again."
- Success messages state the next step and the timeframe: "I read every one myself and reply within two business days."

### 8.5 Headings

- H1 is a plain statement of what the page offers or the problem it solves. No questions as H1.
- H2s carry the argument. A reader who skims only H2s should get the page's case.
- Humour lives in H2s and supporting lines, never in H1s or anything clinical.

---

## 9. Colour system

One theme: dark. There is no light theme and no toggle (section 1.5).

### 9.1 Brand values

The teal and grey are sampled from the master logo after it was reversed for dark backgrounds. The logo's own dark teal and dark grey disappear on near-black, so the reversal lifted their lightness and kept the gradients (Fact: `assets/brand/logo-*.{webp,png}`).

| Token | Hex | Role |
|---|---|---|
| `--teal` | `#14ACAA` | The brand colour: links, eyebrows, italic heading emphasis, ticks, focus of attention |
| `--teal-bright` | `#3FD0CB` | Hover, glows, the pathway line's leading edge |
| `--teal-deep` | `#0B6F6D` | Gradient floor, progress bar start |
| `--grey` | `#ADA7AC` | The logo's "Physio" grey; secondary accents |
| `--clay` | `#CB7A55` | Leather red for ball-seam stitches only |
| `--bg` | `#071012` | Page background, near-black with a teal undertone |
| `--bg-2` | `#0A1618` | Alternate band |
| `--surface` | `#0F1D20` | Cards, tables, inputs |
| `--surface-2` | `#142629` | Raised card, hover, stone bands |
| `--glass` | `rgba(10,22,24,.72)` | Header when scrolled, sticky CTA, credential cards, with backdrop blur |

Text, lines and utility:

| Token | Value | Role |
|---|---|---|
| `--ink` | `#F4F1EA` | Headings, warm white |
| `--text` | `#C4CDCB` | Body |
| `--muted` | `#8E9C9A` | Labels, metadata |
| `--line` | `rgba(196,226,223,.10)` | Decorative dividers |
| `--line-2` | `rgba(196,226,223,.18)` | Card borders |
| `--line-strong` | `#627C80` | Input borders, secondary button border |
| `--btn-fg` | `#041012` | Text on the primary button |
| `--btn-grad` | `#1BB8B4 → #129E9B → #0E8C89` at 135° | Primary button fill |
| `--focus` | `#F2B35B` | Focus ring, amber so it never matches the brand teal |
| `--danger` | `#FF8A73` | Form errors |

### 9.2 Measured contrast (WCAG 2.2)

Measured on this branch (Fact). Worst case is `--surface-2`.

| Foreground | on `--bg` | on `--surface` | on `--surface-2` | Passes |
|---|---|---|---|---|
| Ink | 17.05 | 15.30 | 13.90 | AAA |
| Text | 11.85 | 10.64 | 9.67 | AAA |
| Muted | 6.75 | 6.06 | 5.51 | AA |
| Teal (links, eyebrows) | 6.88 | 6.17 | 5.61 | AA |
| Teal bright | 10.16 | 9.12 | 8.29 | AAA |
| Grey | 8.15 | 7.31 | 6.65 | AAA |
| Danger | 8.37 | 7.51 | 6.82 | AAA |
| Focus ring (non-text) | 10.42 | 9.35 | 8.49 | 1.4.11 |
| Input border (non-text) | 4.32 | 3.87 | 3.52 | 1.4.11 |

Button text `#041012` on the gradient: 7.87 at the light end, 4.72 at the dark end. Passes AA at every point.

### 9.3 Light theme

None. Do not add `prefers-color-scheme` rules, a toggle, or light-only images. `<meta name="color-scheme" content="dark">` and `theme-color #071012` sit in `_partials/head.html` so browser chrome, form controls and scrollbars match.

### 9.4 States

| Element | Default | Hover | Pressed | Focus | Disabled |
|---|---|---|---|---|---|
| Primary button | Teal gradient pill, `--btn-fg` text, soft teal glow | Glow grows, a light sheen sweeps across, lifts 1px | Returns to rest | 2px `--focus` outline, 3px offset | 55% opacity, not-allowed cursor |
| Secondary button | Transparent pill, ink text, `--line-strong` border | Border teal, faint teal wash | Same as hover | Same | Same |
| Text link | Teal, 1px underline at 0.2em | Teal bright | | Focus ring | |
| Input | `--surface`, 1px `--line-strong`, radius 10px | | | Border teal, a faint teal halo, and the amber focus ring | |
| Input invalid | 2px danger border, "✕" message below | | | | |
| Nav item current | Ink with a teal underline (desktop); teal text (menu) | | | | |
| Spotlight card | `--surface`, `--line-2` border | A teal radial light follows the pointer; border brightens | | Focus ring on the card link | |

### 9.5 Rules

- Teal is the only accent. It marks links, eyebrows, italic emphasis in headings, ticks, the pathway line and one featured border per page.
- Clay appears only as ball-seam stitches. Never text, never a button.
- Glows are radial, low opacity, and sit behind content. No neon text, no glowing body copy.
- Gradients are allowed on the primary button, the progress bar, the pathway line, featured borders and proof numerals. Nowhere else.
- Nothing is communicated by colour alone: featured tier has a text label; comparison "Yes" has a tick and the word; errors have a symbol, text and a thicker border.
- The original logo files in `cricket-logo/` are not served. The web versions live in `assets/brand/`.

---

## 10. Typography

### 10.1 Families

- **Display: Instrument Serif** (SIL OFL), regular and italic. A condensed editorial serif. It gives H1 and H2 the weight of a quality magazine rather than a clinic brochure, and holds up at 88px on dark.
- **Text and interface: Manrope** (SIL OFL), variable 400 to 700. Clean, slightly geometric, legible at small sizes on dark.
- Two families only. H3 and below are Manrope bold, so card titles and form labels stay crisp.
- An `<em>` inside an H1 or H2 turns italic and teal. Use it once per heading, on the word that carries the meaning ("cricket answers", "scales", "professional").

Self-hosted from `/assets/fonts/`, latin subset. Manrope 22.7 KB, Instrument Serif 20.5 KB, italic 21.6 KB. Manrope and Instrument Serif regular are preloaded from `_partials/head.html`. `font-display: swap`. Fallbacks: Instrument Serif → "Iowan Old Style" → Georgia; Manrope → system-ui.

### 10.2 Scale

Fluid sizes use `clamp()` between mobile (390px) and desktop (1440px).

| Style | Family, weight | Desktop | Mobile | Line height | Notes |
|---|---|---|---|---|---|
| H1 | Instrument Serif 400 | 88px | 44px | 0.98 | Max 16ch, `text-wrap: balance`, −0.012em |
| H2 | Instrument Serif 400 | 60px | 36px | 1.02 | |
| Fast bowling title | Instrument Serif 400 | 128px | 60px | 0.88 | Home only |
| H3 | Manrope 700 | 21px | 18px | 1.3 | |
| H4 | Manrope 700 | 16px | 16px | 1.4 | |
| Lede | Manrope 400 | 21px | 18px | 1.6 | Max 38rem |
| Body | Manrope 400 | 18px | 17px | 1.7 | Max 42rem |
| Eyebrow | Manrope 700, uppercase, 0.16em tracking | 12px | 12px | 1.4 | Teal, with a short gradient rule before it |
| Tag, card label | Manrope 700, uppercase, 0.14em tracking | 11px | 11px | 1.4 | Journal tags, credential card labels |
| Proof numeral | Instrument Serif 400 | 52px | 36px | 1 | Ink-to-teal gradient fill |
| Pull quote | Instrument Serif italic | 40px | 26px | 1.15 | |
| Card title (paths, journal) | Instrument Serif 400 | 34px | 28px | 1.05 | |
| Button | Manrope 700 | 15.6px | same | 1.2 | Pill, min height 52px |
| Price | Instrument Serif 400, tabular | 56px | 56px | 1 | |

### 10.3 Rules

- Headings use `text-wrap: balance`.
- Italic is for the teal emphasis word in H1 and H2, pull quotes, and the tier "in short" lines. Not for emphasis in body copy.
- Uppercase only for eyebrows, labels and table group headers.
- Never set body copy below 15px. Only bold uppercase labels (eyebrows, tags, card labels) go below 13px, with a floor of 11px.
- Mobile H1 must fit in four lines at 390px. If it does not, shorten the H1.

---

## 11. Photography and imagery

### 11.1 Principles

- Photography carries the brand once it exists. Until then, typography and structure carry it. **No stock, ever.** A page with no photo beats a page with a borrowed one.
- Every image shows expertise in action: an assessment, a rehab session on grass, a bowler under supervision, a staff conversation at a ground.
- Real places: nets, grounds, the Richmond gym floor. Real kit, with permission.
- Natural colour, no filters, no green overlays, no duotones.

### 11.2 Current state (Fact)

| Image | Source | Used on | Files | Consent status |
|---|---|---|---|---|
| Portrait: Thihan at a ground in FCRI kit | Supplied by Thihan, 24 September 2026 | Home hero, `/about` hero, bylines and avatars, `Person` schema | `thihan-portrait-{320,480,720,880}.{webp,jpg}`, 4:5 | Own image. FCRI crest on the kit: 1.4 item 13 |
| Pitch-side: Thihan assessing a Bangladesh player's knee on the outfield | bridgeroad.physio asset set | `/professional-players` hero, home professionals band | `international-pitchside-{640,900}.{webp,jpg}` | **Identifiable player in an injury context. Written consent needed: 1.4 item 12** |
| Gym: Thihan coaching a loaded trunk exercise, Italy kit | bridgeroad.physio asset set | Home and `/about` image bands | `rehab-italy-gym-{640,1000}.{webp,jpg}` | Player and FCRI permission: 1.4 item 13 |
| Organisation logos (8) | bridgeroad.physio asset set | Home marquee | `assets/logos/*.webp` on white chips | Trade mark permission: 1.4 item 14 |

The older studio headshot in Hampshire kit (`cricket-logo/`) stays retired.

### 11.3 Shot list, in priority order

| # | Shot | Use | Ratio |
|---|---|---|---|
| 1 | Fast bowler at delivery stride, side-on, nets, Thihan watching from behind the crease | Home hero or fast bowling band; `/bowling` hero | 3:2, 4:5 crop |
| 2 | Thihan with a player on the gym floor in Richmond, loading work | `/in-person`, memberships | 3:2 |
| 3 | Running rehab on grass: cones, sprint build-up | `/return-to-performance` | 3:2 |
| 4 | Assessment: hands-on lumbar or hip test, player in cricket whites or training kit | `/services`, back pain guide | 3:2 |
| 5 | Telehealth: a player on a laptop call filmed side-on, bowling footage on screen | `/telehealth` | 3:2 |
| 6 | Coach, player and Thihan in conversation at the nets | `/teams`, clubs page | 3:2 |
| 7 | Tablet or phone showing the Bowling Workload Tool with real (consented) data | Memberships, `/bowling` | 4:5 |
| 8 | A professional environment: dressing room, ground at dawn, medical room (with permission) | `/about`, `/teams` | 3:2 |
| 9 | Strength testing with a dynamometer or force plate | Players page testing section | 3:2 |
| 10 | Portrait: Thihan at a ground, natural light, not a studio cutout | `/about`, home profile | 4:5. **Delivered** |
| 11 | Throwing rehab from the boundary | Throwing shoulder guide | 3:2 |
| 12 | Junior bowler with a parent watching | Junior guide | 3:2 |
| 13 | Education: Thihan presenting to coaches or clinicians | `/resources`, speaking | 3:2 |
| 14 | Detail: spikes on a bowling crease, strapping, a ball in hand | Section breaks, OG images | 3:1 |
| 15 | Italy program at training (with FCI permission) | `/teams` case summary | 3:2 |

**Consent:** written consent from every identifiable adult; a parent or guardian for anyone under 18; no identifiable player shown in an injury context without explicit consent for that use; team badges and sponsor logos on kit need the organisation's permission.

### 11.4 Technical specifications

- Source files at least 2400px on the long edge.
- Serve WebP (AVIF when the build supports it) with JPEG fallback through `<picture>`.
- `srcset` widths: 480, 960, 1440, 1920. `sizes` set per slot.
- Always set `width` and `height` to prevent layout shift.
- `loading="lazy"` for anything below the first screen; `fetchpriority="high"` and no lazy loading for a hero image.
- Weight budget: hero 180 KB at 1440w WebP; inline images 120 KB; profile 30 KB.
- Radius 20px on inline images and hero portraits; none on full-bleed bands.
- Alt text describes what the image shows and why it is there ("Fast bowler in the delivery stride at training, filmed side-on"). Decorative images get `alt=""`.
- Text over a photo only on a dark gradient scrim of at least 90% opacity where the text sits (`.imageband::after`), and the contrast is re-measured.

### 11.5 Diagrams and graphics

Allowed when they explain: the return-to-performance pathway, the return-to-bowling progression, the membership journey, a workload chart. Charts with illustrative data are labelled "Example". No anatomy models, no generic athlete silhouettes, no funnel graphics.

Version 2 adds three cricket line graphics, all decorative, `aria-hidden`, drawn in teal at low opacity: the pitch diagram behind the fast bowling section, the crease lines behind text-only heroes on desktop, and the ball-seam divider (teal line with clay stitches) between some sections. They carry texture, not information. Keep them to one per screen.

### 11.6 Video

No autoplay hero video. Short clips (under 30 seconds) for exercise demonstrations in guides: click to play, captions on, muted by default, poster image, hosted on a video service with a privacy-enhanced embed.

---

## 12. Design principles

1. **Every element earns its place.** Test: remove it. If nothing is lost, it stays removed.
2. **Type and space first, cards where they earn it.** Big serif headings and space set hierarchy. Cards are for things a visitor chooses between or clicks into: pathways, tiers, packages, journal entries. Lists of facts stay as rules.
3. **One primary action per view.** One primary button per screen-height. Everything else is secondary or a text link.
4. **Thihan is the brand.** Thihan's name, face or byline appears in the first screen of every page that sells. Proof comes from roles, programs and numbers, never from testimonials.
5. **Say the limit.** Every service and tier states what it does not include.
6. **Evidence is visible.** Reviewed dates, references, "what we do not know".
7. **Phones first.** Every component is designed at 390px, then widened.
8. **Motion with restraint.** Effects add polish, never block reading: content fades up once as it enters, the pathway line draws, the marquee drifts, image bands shift slightly on scroll, cards light up under the pointer. No counters, no autoplay video, no scroll-jacking. Everything above the fold is visible on load. Under `prefers-reduced-motion` every effect stops and nothing is hidden.

---

## 13. Sitemap

### 13.1 Final hierarchy

Status key: **Live** (unchanged), **Rebuilt** (this branch), **New** (this branch), **P2 to P5** (roadmap phase).

```
/                                        Home                                         Rebuilt
/services                                "I need help with…" pathways                 Rebuilt (v2)
  /telehealth                            Telehealth consultations                     Live → P2 refresh
  /in-person                             In person, Melbourne (at Bridge Road)        Live
  /return-to-performance                 RTP pillar and the RTP Assessment            Live, six-stage pathway added (v2); P2 rebuild
  /screening                             Sports Injury Screening (baseline testing)   P2 new
/cricket-performance                     Memberships landing                          New
  /cricket-performance/players           Player memberships and application           New
  /cricket-performance/clubs             Club Core, Club Plus and enquiry             New
  /cricket-performance/welcome           Post-checkout onboarding (noindex)           P5, when checkout exists
/bowling                                 Fast bowling hub                             Live → P2 rebuild as hub
  /bowling/workload                      Bowling workload guide                       P3 (content moves from /bowling)
  /bowling/return-to-bowling             Return to bowling                            P3
  /bowling/junior-fast-bowlers           Junior fast bowlers, for parents and coaches P3
  /bowling/pre-season                    Building bowling load for a season           P4
/cricket-injuries                        Injury guide hub                             Live
  /cricket-injuries/fast-bowling-back-pain                                            Live
  /cricket-injuries/lumbar-bone-stress-injury   Moved from the Bridge Road blog       P3
  /cricket-injuries/side-strain                                                       P3
  /cricket-injuries/hamstring                                                         Live
  /cricket-injuries/throwing-shoulder                                                 Live
  /cricket-injuries/bowling-shoulder                                                  P4
  /cricket-injuries/ankle-fast-bowlers                                                P4
/professional-players                    Professional and international players       New (v2)
/teams                                   Organisations and consulting                 Live → P2 rebuild
/resources                               The Cricket Physio Journal                   Rebuilt (v2); P4 additions
  /resources/clinicians                  For physios and sports medicine staff        P4
  /resources/coaches                     For coaches and S&C                          P4
  /speaking                              Speaking and media                           P4
/about                                                                                Rebuilt (v2)
/book                                    Booking router                               Live
/contact                                                                              Live
/faq                                                                                  Live
/privacy  /terms  /disclaimer  /accessibility                                         Live (privacy updated)
```

Subdomains:

- `bowlingworkload.thecricket.physio`: the Bowling Workload Tool (Live).
- `app.thecricket.physio`: member dashboard, once memberships have accounts (P5).
- `learn.thecricket.physio`: courses, if a hosted course platform is used (P5).

### 13.2 What was consolidated, and why

| Brief heading | Decision | Reason |
|---|---|---|
| Work with me / Services | `/services` as the consultations hub | One page for one-off appointments; memberships and clubs have their own sections |
| Cricket physiotherapy | Home plus `/services`, no separate page | A separate page would compete with the homepage for the same search |
| Telehealth | Own page | Distinct intent, national and international audience |
| Fast bowler services | `/bowling` becomes the fast bowling hub | URL exists, nav says "Fast bowling", avoids a second top-level URL for the same audience |
| Injury rehabilitation | `/return-to-performance` plus injury guides | Rehab is explained by injury and by phase, not as a generic service |
| Return to performance | Own page, the brand's pillar | Defining idea; also sells the RTP Assessment |
| Sports injury screening | Own page (P2) | Distinct paid product and search term; needs its honest "not prediction" framing |
| Bowling workload | Guide under `/bowling`, plus the tool | It is content and a tool, not a separate service |
| Club and team services | Clubs: `/cricket-performance/clubs`. Organisations: `/teams` | Packaged versus bespoke buyers need different pages |
| Consultancy | `/teams` | Renaming the URL is churn for no gain; nav label is "Clubs & teams" |
| Education | `/resources` | Kept secondary, grows in P4 |
| Resources / blog | Injury guides and `/bowling/*`; no `/blog` | Guides are organised by topic, not date. `/blog` already redirects |
| About, Contact, Book | Kept | |

---

## 14. Navigation

### 14.1 Primary navigation (built)

Desktop, 1200px (75rem) and wider:

`[logo]` · Work with me · Fast bowling · Professionals · Memberships · Teams · Journal · About · **[Book a consultation]**

Below 1200px: logo, a compact **[Book]** button that is always visible, and a menu button. The menu panel lists the same seven links and the full "Book a consultation" button.

- The logo is the master logo reversed for dark, 58px tall, 48px once the page scrolls, 46px on phones and 40px at 368px and below.
- Seven text items. No dropdowns.
- The header is glass: translucent near-black with backdrop blur, gaining a border once scrolled. A 2px teal progress bar runs along the top of the window.
- `aria-current="page"` is set by `_tools/build.py` from the `NAV` table: the longest matching URL prefix wins. `/telehealth`, `/in-person` and `/return-to-performance` mark "Work with me"; `/cricket-performance/clubs` marks "Teams"; `/cricket-injuries/*` marks "Journal".
- Changing a nav label means editing `_partials/header.html`, the `NAV` table in `build.py`, and this section.

### 14.2 Footer (built)

Logo, then Thihan's name with a one-line description and a Book button. Four columns:

- **Work with me:** Consultations, Online consultations, In person Melbourne, Return to performance, Professional players.
- **Fast bowling:** Fast bowling and workload, Bowling Workload Tool, Back pain in fast bowlers, Hamstring injuries, Throwing shoulder.
- **Ongoing support:** Player memberships, Club and academy packages, Teams and organisations.
- **The Cricket Physio:** About Thihan, The Journal, Common questions, Contact.

Legal strip: AHPRA number, the Bridge Road sentence, the general-information disclaimer with "In an emergency, call 000", policy links, and LinkedIn and Instagram icon links.

### 14.3 Other navigation

- **Breadcrumbs** on every page except home: an ordered list inside `<nav aria-label="Breadcrumb">`, with matching `BreadcrumbList` JSON-LD.
- **Sticky mobile CTA** only on product pages (`/cricket-performance/*`), matched to the product. Section 26.
- **Back to top** appears after 900px of scroll on long pages; hidden on phones where a sticky CTA exists.

---

## 15. Homepage specification

### 15.1 Structure decisions

| Proposed (original brief) | Version 2 decision | Why |
|---|---|---|
| 1. Hero | Kept. Thihan's name and avatar above the H1, portrait with a credential card beside it, proof strip beneath | The person is the brand; proof before argument |
| 2. Clear service pathway | "What brings you here?" (six cards) and "Four ways in" | Route by problem first, delivery second |
| 3. Who this is for | Inside "What brings you here?" | Each card names an audience by its problem |
| 4. Common injuries | Inside the cards, the fast bowling section and the Journal | No separate injury grid |
| 5. Fast bowler section | Kept, as the largest type on the page | The authority pillar |
| 6. How treatment works | Moved to `/services` ("What an assessment involves") | Home stays short enough to scan |
| 7. Return-to-performance philosophy | Kept, early, as the six-stage pathway | The defining idea |
| 8. Experience / authority | Logo marquee under the hero; "Experience where it matters" band lower down | Proof early, the person's story later |
| 9. Resources | Kept as three Journal cards | Evidence and recency |
| 10. Club/team services | One card in each of the two routing sections | Clubs have their own page |
| 11. Testimonials or proof | No testimonials (Ahpra). Proof strip, logos, career list, pull quote | |
| 12. Final CTA | Kept | |
| (new) Professional players | A dark band linking to `/professional-players` | Owner direction, version 2 |

### 15.2 Section by section (built)

| # | Section | Heading | Supporting message | CTA | Design | Mobile |
|---|---|---|---|---|---|---|
| 1 | Hero | "Cricket injuries need *cricket* answers." | "I'm Thihan Chandramohan. For more than fifteen years I've managed injuries, rehabilitation and bowling loads inside international, county, state and franchise cricket…" | Primary: Book a consultation. Secondary: How I work | Name and avatar above the H1. Portrait (4:5) on the right with an offset teal frame and a glass credential card ("Currently: Head of Sports Science and Sports Medicine, Federazione Cricket Italiana"). Teal glow behind. Copy rises in on load | Stacks: name, H1, lede, full-width buttons, then the portrait as a square. At 768 to 1023px the portrait runs full width in a 3:2 crop |
| 2 | Proof strip | None (figures) | 20+ years in physiotherapy; 15+ years in elite cricket; 3 international programs: Sri Lanka, Bangladesh, Italy; Online worldwide, and in person in Melbourne | None | Four serif numerals with a gradient fill, divided by hairlines | 2 × 2 |
| 3 | Logo marquee | "Selected professional experience" | Eight organisation logos | None | White chips drifting left in a loop; pauses on hover; duplicates hidden from screen readers | Same, slower |
| 4 | What brings you here? | "What brings you here?" | Six cards: I'm injured / I'm returning to cricket / I'm a fast bowler / I want a second opinion / I'm a professional player / I'm a club or team | Each card is a link (`problem_select`) | Spotlight cards, numbered 01 to 06 in italic serif, three across | One column |
| 5 | Pathway | "From injury to performance" | "Pain-free is a checkpoint, not the finish line." Six stages: Settle and understand, Rebuild capacity, Reintroduce cricket, Return to bowling, Return to training, Return to performance | Text link to `/return-to-performance` | A teal line draws across the six stages as the section enters | Vertical, line on the left |
| 6 | Image band | "The work happens between the treatment room and getting selected again." | Clinic, gym, running, throwing, nets, bowling, training, competition | None | Italy gym photo, full bleed, slight parallax, heavy dark scrim under the text | Photo above, text below |
| 7 | Fast bowling | "Fast bowling" | Workload read in context; intensity, gaps, growth, sleep, travel and previous injury change what the same overs do; three guide links | Primary: Start tracking your bowling | Title at up to 128px with a pitch diagram behind | Stacks |
| 8 | Professional players | "Discreet, fast, and on your team's side." | Worked inside international and franchise medical teams | For professional players (`pro_page_click`) | Dark band with the pitch-side photo | Stacks |
| 9 | Four ways in | "Four ways in" | Bridge Road, Richmond / Online consultation / Ongoing support (from $79) / Teams and organisations | Card links | Spotlight cards, four across | One column |
| 10 | Experience | Eyebrow "Experience where it matters" | Pull quote with avatar ("Years inside professional teams do not make a hamstring heal faster…"); career list by level | More about me | Split: quote left, career list right | Stacks |
| 11 | Journal | "The Cricket Physio Journal" | Three guides with tag and reviewed date | Card links; All articles | Journal cards | One column |
| 12 | Closing CTA | "Not sure where to start?" | "Describe the problem and I'll tell you honestly whether it needs an examination, a video call, or neither." | Primary: Book a consultation. Secondary: Ask a question | CTA band with glow | Full-width buttons |

The hero portrait is preloaded with `imagesrcset`, so it paints with the text.

---

## 16. Page-by-page specifications

Every page: one audience focus, one business purpose, one primary action. "Built" means implemented on this branch.

### 16.1 Memberships landing, `/cricket-performance` (built)

- **Audience:** players considering ongoing support; clubs arriving from the nav.
- **Purpose:** introduce ongoing support and route to a tier, clubs or the free tool.
- **Primary action:** Find the right level of support (to `#levels`). Low-commitment: Try the Bowling Workload Tool.
- **Sections:** dark hero with credibility line and byline → "Most cricketers only see a physio after something hurts" with the stacked lines → "More oversight at each level, not more appointments" journey (Free, Essentials, Performance, Integrated) → compact tier cards → club band (navy) → free tool → "Not sure which level fits?" closing band.
- **Sticky mobile CTA:** "Memberships, from $79 a month" / Find your level.

### 16.2 Player memberships, `/cricket-performance/players` (built)

- **Audience:** players ready to compare and apply.
- **Purpose:** full detail, prices, inclusions, exclusions, rules, consent, application.
- **Primary action:** the tier CTA (Join Essentials / Join Performance / Apply for Integrated Performance), all landing on `#apply` with the tier preselected until checkout exists.
- **Sections, in order:** compact dark hero with byline → who this is for (by level, by role) → where this fits (six scenarios with the usual starting tier) → how this differs from booking when it hurts → three full tier cards → comparison table (21 rows in four groups) → workload monitoring ("spreadsheet archaeology") → testing ("Measure progress, not just pain.") → when something goes wrong → when nothing is wrong → Melbourne or anywhere else → pricing details (member rates, junior pricing, rules, reasonable use, not an emergency service) → who sees your information → application form → FAQ (13) → closing band.
- **Sticky mobile CTA:** "Player memberships, from $79 a month" / Choose a membership.

### 16.3 Club packages, `/cricket-performance/clubs` (built)

- **Audience:** club presidents, coaches, academy managers.
- **Purpose:** sell Club Core and Club Plus.
- **Primary action:** Discuss club support (to the enquiry form). Package cards: Enquire about Club Core / Club Plus, with the package preselected.
- **Sections:** dark hero with byline → what usually goes wrong at club level → how it runs through a season (four steps) → packages → comparison → who sees what (consent) → not included / payment and scope → enquiry with the four-step lead flow → FAQ (6) → closing band "Give your players a clearer medical and workload system."
- **Monthly arithmetic** ($833.33) is deliberately not shown.

### 16.4 Work with me, `/services` (rebuilt, version 2)

- **Audience:** injured players, parents, professionals, clubs.
- **Purpose:** route a problem to the right way of working together.
- **Primary action:** Book a consultation.
- **Title:** "Work With Me: Cricket Physio Consultations | The Cricket Physio". **H1:** "I need help *with*…"
- **Structure:** hero with crease graphic and byline ("Every consultation is with Thihan Chandramohan") → six numbered pathways, each with a one-line summary, a short paragraph and one or two actions: A cricket injury, Returning to cricket, Fast bowling, A second opinion, Support across a season, My club or team → "In Melbourne, or anywhere" (in person and online) → "What an assessment involves" → "Honest limits" → closing CTA.
- **Still to add (P2):** Sports Injury Screening once `/screening` exists (16.8).

### 16.5 Telehealth, `/telehealth` (P2 refresh)

- **Audience:** players outside Melbourne, including overseas.
- **Primary action:** Book a telehealth appointment.
- **Add:** the objection FAQ (section 20.2), a "What to send before the call" checklist, "How I work with your local physio", time-zone line. Keep the current "What it does not suit" section.

### 16.6 In person, `/in-person` (live)

- **Audience:** Melbourne players.
- **Primary action:** Book an appointment (Bridge Road calendar).
- **Change:** add member rates line and a photo slot for shot 2 in P4.

### 16.7 Return to performance, `/return-to-performance` (P2 rebuild)

- **Audience:** players late in rehab, parents, coaches, physios.
- **Primary action:** Book a Return to Performance Assessment.
- **Built in version 2:** the six-stage pathway (same component as home) sits under the hero.
- **P2 structure:** H1 "Return to performance: rehab that finishes at the demands of cricket" → participation / sport / performance definitions → the eight-stage progression with example exit criteria (section 19.2) → the assessment: what gets tested, what you get, $250, 60 minutes → honest limit (keep) → when to book (keep) → memberships link for players who want the whole return managed.

### 16.8 Sports Injury Screening, `/screening` (P2 new)

- **Audience:** uninjured players before a season, parents of juniors, clubs.
- **Primary action:** Book a screening.
- **H1:** "Pre-season screening for cricketers: a baseline, not a prediction".
- **Must say:** no screening test predicts injury; what the screen measures; what you get; $250; 20% off for Essentials, Performance and Integrated members.

### 16.9 Fast bowling hub, `/bowling` (P2 rebuild)

- **Audience:** fast bowlers, parents, coaches.
- **Primary action:** Start tracking your bowling. Secondary: Book a consultation.
- **Structure:** H1 "Fast bowling: injuries, workload and return to bowling" → the site's position on workload (section 18.2) → guide index grouped as Injuries / Workload / Returning / Juniors → the tool → when to get assessed → membership line for bowlers.
- The existing workload article moves to `/bowling/workload` (P3). Keep `#return-to-bowling` working with a redirect note or anchor on the hub until `/bowling/return-to-bowling` exists.

### 16.10 Injury guide template, `/cricket-injuries/*`

- **Audience:** a player or parent with that injury, a coach, a physio.
- **Primary action:** Book a consultation (telehealth or in person).
- **Structure (keep the current guides' pattern):** H1 in plain words → meta block (written by, category, last reviewed) → "Before you read on" disclaimer → why cricket causes it → what the history sounds like → what to do in the first week → what drives it → rehab phases linked to the continuum → return to play criteria → what the evidence does and does not say → when to get assessed urgently → references (at least two peer-reviewed) → related guides (3) → one CTA block.
- **Schema:** `MedicalWebPage` with `lastReviewed`, `reviewedBy` (Person), `about` (MedicalCondition), plus `BreadcrumbList`. Current pages use `Article`; switch in P3.

### 16.11 Organisations, `/teams` (P2 rebuild)

- **Audience:** governing bodies, franchises, high-performance programs, associate nations.
- **Primary action:** Discuss your program (enquiry form).
- **Built on this branch:** a club-package band near the top, so clubs route to fixed-price packages before the consulting pitch.
- **P2 structure:** section 21.

### 16.12 The Cricket Physio Journal, `/resources` (rebuilt, version 2)

- **Audience:** players, parents, coaches, clinicians.
- **Purpose:** show authority through dated, referenced writing.
- **Primary action:** read a guide; secondary Book a consultation.
- **Title:** "The Cricket Physio Journal | Cricket Injury Guides". **H1:** "The Cricket Physio *Journal*".
- **Structure:** hero with byline ("Written and reviewed by Thihan Chandramohan") → topic taxonomy with counts (Back and bone stress, Fast bowling, Workload, Muscle injuries, Shoulder and throwing, Rehabilitation) → journal cards with tag, title, summary and reviewed date → "Clinicians, tools and speaking" → "Dated, referenced, and revised" → closing CTA.
- **P4:** mailing list, `/resources/clinicians`, `/resources/coaches`, and taxonomy filters once there are more than about 12 pieces.

### 16.13 About, `/about` (rebuilt, version 2)

- **Audience:** anyone checking credibility; professionals and their agents; organisations.
- **Primary action:** Book a consultation; secondary Team and organisation work.
- **H1:** "Thihan *Chandramohan*".
- **Structure:** hero with portrait and AHPRA credential card → "Two jobs, at different scales" with the career list by level → "Three things shape every plan" → image band "I have had my own surgery and rehab" → "Honest limits" → the two practices (this site and Bridge Road) → closing CTA.
- **Still needed:** confirmed role titles and years (2.3).

### 16.14 Book, `/book` (live)

- **Purpose:** route to the correct Halaxy calendar.
- **Change (P2):** add a third card, "Ongoing support", linking to memberships, and "Not sure? Ask first".

### 16.15 Contact, `/contact` (live)

- **Change (P2):** add "Membership question" and "Club package" routes to the four existing cards.

### 16.16 FAQ, `/faq` (live)

- Keep. Add a "Memberships" group linking to the players page FAQ rather than duplicating answers.

### 16.17 404 (live)

- Keep the helpful links. Add the problem selector (P2).

### 16.18 Professional players, `/professional-players` (new, version 2)

- **Audience:** international, franchise, county and state players, and their agents or managers.
- **Purpose:** win discreet second opinions, return-to-play planning and off-season work from professionals, without competing with their team's medical staff.
- **Primary action:** Discuss your situation (to the `pro` enquiry form). Secondary: Book a consultation.
- **Title:** "Physio for Professional Cricketers | The Cricket Physio". **H1:** "Discreet input for the *professional* game."
- **Structure:** hero with byline and the pitch-side photo with an experience card → "The decisions that shape a season" (Second opinions, Return to play, Fast bowlers, Between contracts, On tour, Preparation) → "Alongside your medical staff, never around them" (A short call, Review, A written plan, Follow-through) → "What stays in the room stays in the room" (confidentiality) → "I have been the team physio" (career list) → "One decision, or the whole season" (consultation, Integrated Performance, consulting) → enquiry form → FAQ (5) → closing band "A second view, before the next decision."
- **Form (`pro`):** name, email, phone or WhatsApp, team or contract, preferred contact, permission to contact a manager or agent, what is going on, health-information consent. Required: name, email, message, consent. Reply promise: usually within two business days.
- **Must not:** name current clients, imply endorsement by any team, or promise availability or outcomes.
- **Launch gate:** the hero photo (1.4 item 12).

---

## 17. Services architecture

### 17.1 Problems mapped to services

| The player says | What they need | Service | Page | CTA |
|---|---|---|---|---|
| "I've hurt myself" | Diagnosis and a plan | Initial consultation (in person if in Melbourne, otherwise telehealth) | `/book` | Book a consultation |
| "My back hurts when I bowl" | Rule out bone stress; stop bowling early | Initial consultation, usually in person first | Back pain guide → `/book` | Book a consultation |
| "I've been diagnosed with a lumbar stress injury" | A months-long return-to-bowling plan | Performance membership, or telehealth reviews | LBSI guide (P3) → players page | Join Performance |
| "I'm returning from injury" | Testing against the role before playing | RTP Assessment; Performance for the full return | `/return-to-performance` | Book an assessment |
| "I keep breaking down" | Find the pattern in load, capacity and schedule | Consultation, then Performance | Players page "Recurring problem" | Join Performance |
| "I'm increasing my bowling" | A deliberate build-up | Free tool, then Essentials | `/bowling` | Start tracking your bowling |
| "I want a second opinion" | A cricket-specific read of an existing plan | Telehealth consultation | `/telehealth` | Book telehealth |
| "I need help planning my return to cricket" | A staged plan with criteria | RTP Assessment or Performance | `/return-to-performance` | Book an assessment |
| "I live interstate or overseas" | Remote specialist input | Telehealth; Performance or Integrated remotely | `/telehealth` | Book telehealth |
| "I want my preparation managed around cricket" | Individual S&C with injury oversight | Integrated Performance | Players page | Apply for Integrated Performance |
| "Nothing's wrong, I want to stay that way" | Monitoring and preparation | Essentials; Sports Injury Screening | Players page | Join Essentials |
| "My club needs medical or performance support" | A season system | Club Core or Club Plus | Clubs page | Discuss club support |
| "Our program needs a medical system" | Bespoke consulting | Consulting engagement | `/teams` | Discuss your program |

### 17.2 Service catalogue

| Service | Format | Length | Price (AUD) | Booked through |
|---|---|---|---|---|
| Initial consultation, in person | Richmond | 45 min | $180 (Assumption: confirm, 1.4 item 5) | Bridge Road Halaxy |
| Review consultation, in person | Richmond | 30 min | $140 | Bridge Road Halaxy |
| Extended consultation | Richmond | Not stated | $180 | Bridge Road Halaxy |
| Telehealth initial | Video | 45 min | $150 | Halaxy |
| Telehealth review | Video | 30 min | $120 | Halaxy |
| Telehealth injury triage | Video | Not defined | **Decision needed** | Halaxy |
| Return to Performance Assessment | Richmond | 60 min | $250 | Bridge Road Halaxy |
| Sports Injury Screening | Richmond | Not stated | $250 | Bridge Road Halaxy |
| Essentials / Performance / Integrated | Membership | Monthly | See 17.3 | Application form, later checkout |
| Club Core / Club Plus | Season package | 6 months | See 17.3 | Enquiry form |
| Consulting | Engagement | Scoped | Quoted | Team enquiry |

### 17.3 Commercial rules

`data/offers.json` is authoritative. If this table and the JSON disagree, the JSON is right and this table is stale.

| | Essentials | Performance | Integrated Performance |
|---|---|---|---|
| Secondary label | Bronze | Silver | Gold |
| Monthly (adult) | $79 | $449 | $949 |
| Upfront | $853 a year | $1,212 for 3 months | $2,562 for 3 months |
| Under 18 | $65/month | $360/month | $760/month |
| Capacity | 25 members | 10 members | 5 members |
| Minimum | None | 1 month | 3 months, then month to month |
| Cancelling | Before next billing date | Before next billing date | 30 days' notice after the first 3 months |
| Upgrading | Any time (Assumption) | Any time | Not applicable |
| Downgrading | Not applicable | End of billing period | End of billing period |
| Pausing | With notice | With notice | With notice |
| CTA | Join Essentials | Join Performance | Apply for Integrated Performance |

Pauses: place held for up to 4 weeks; longer pauses do not guarantee a place when the level is full. Upfront prices are a 10% saving on every tier (Fact, computed by the build). Club Core: $5,000 per 6-month season. Club Plus: $6,500. Both: up to 20 players, six monthly instalments.

Treatment discount: Performance and Integrated members get 20% off in-person services (initial $180 → $144, review $140 → $112, extended $180 → $144, screening $250 → $200, RTP Assessment $250 → $200). Essentials members get 20% off telehealth triage, screening and the RTP Assessment only. Junior pricing does not stack with the treatment discount.

**The critical copy rule:** memberships are sold on oversight, never on appointment counts.

- Essentials: "I have the right tools and structure."
- Performance: "I have a cricket physio overseeing my injury, workload and return to performance."
- Integrated Performance: "I have my physical preparation, injury management and cricket workload managed together."

### 17.4 Lead flows

| Product | Brief's flow | Built now | Missing |
|---|---|---|---|
| Essentials | CTA → checkout → onboarding questionnaire → account → dashboard → tool → library | CTA → application form (tier preselected) → email to Thihan → manual payment link | Checkout, account creation, onboarding questionnaire |
| Performance | CTA → suitability form → payment → assessment booking → onboarding → baseline testing → dashboard | CTA → application form → email → manual follow-up | Payment, booking link after approval |
| Integrated | CTA → application → suitability review → payment → 60-min assessment → testing → full plan | CTA → application form → email → manual follow-up | Payment step |
| Clubs | CTA → enquiry → discovery call → agreement → player onboarding and consent | CTA → enquiry form (package preselected) → email | Agreement template, player consent onboarding |

---

## 18. Fast bowling strategy

### 18.1 Why it is the pillar

Fast bowlers carry the heaviest injury burden in cricket, lumbar bone stress injuries cost young quicks whole seasons, and parents and coaches search for answers. It is also where Thihan's elite experience is most visible. Fast bowling gets a nav item, a hub, a homepage band and its own content cluster.

### 18.2 The site's position on workload (use this wording as the source for every bowling page)

Bowling load matters, and ball counts alone do not predict injury. What matters more is how load changes, how it is spread across a week, how intense it is, how a bowler responds the next day, and what else is going on: growth, sleep, travel, previous injury, a long gap. Monitoring tells you what happened, which is the part everyone is otherwise guessing at. The numbers start the conversation. They do not finish it.

**Never say:** "a safe number of overs" as a single figure; "an acute to chronic workload ratio above 1.5 means injury"; that any tool or screen predicts injury; that low workload is safe.

### 18.3 Topics and where they live

| Topic | Page | Phase |
|---|---|---|
| Lumbar bone stress injury | `/cricket-injuries/lumbar-bone-stress-injury` (moved from Bridge Road) | P3 |
| Back pain in fast bowlers (symptom-led) | `/cricket-injuries/fast-bowling-back-pain` | Live |
| Bowling workload | `/bowling/workload` | P3 |
| Return to bowling | `/bowling/return-to-bowling` | P3 |
| Bowling preparation and pre-season build-up | `/bowling/pre-season` | P4 |
| Hamstring injuries | `/cricket-injuries/hamstring` | Live |
| Side strains | `/cricket-injuries/side-strain` | P3 |
| Shoulder rehabilitation (bowling and throwing) | `/cricket-injuries/throwing-shoulder`, `/cricket-injuries/bowling-shoulder` | Live, P4 |
| Ankle rehabilitation | `/cricket-injuries/ankle-fast-bowlers` | P4 |
| Adolescent fast bowlers | `/bowling/junior-fast-bowlers` | P3 |
| Physical preparation | `/bowling/pre-season` and memberships | P4 |
| Intensity versus volume | Section within `/bowling/workload` | P3 |

The symptom page ("back pain") and the diagnosis page ("lumbar bone stress injury") must not compete: the first answers "what is this and what do I do now", the second "I have the diagnosis, what is the plan and the timeline range". Each links to the other in its first screen.

### 18.4 Junior fast bowlers

- Written for parents and coaches, reviewed with extra care.
- Refer to Cricket Australia's junior fast bowling guidelines by name and link. **Check every number against the current Cricket Australia document before publishing; do not quote limits from memory.**
- Growth, bone age and the under-reporting problem get their own sections.
- Primary action: book a consultation (a parent is welcome in the room). Secondary: junior membership pricing.

### 18.5 Tool integration

Every bowling page carries "Start tracking your bowling" as the low-commitment action. Memberships add soreness monitoring, alerts, dashboards, return-to-bowling tracking and clinician review.

---

## 19. Return-to-performance strategy

### 19.1 Definitions

From the 2016 consensus statement on return to sport (Ardern and colleagues, *British Journal of Sports Medicine*):

- **Return to participation:** training or playing, but not yet ready, physically or otherwise, to play at the target level.
- **Return to sport:** back playing the sport, but not at the desired level of performance.
- **Return to performance:** playing at or above the level before the injury.

### 19.2 The progression

Symptoms → physical capacity → running → cricket-specific movement → skills exposure → training → competition → performance.

| Stage | Aim | Example exit criteria (individualised, reviewed by Thihan before publishing) |
|---|---|---|
| Symptoms | Settle enough to load | Daily activity comfortable; key tests tolerated without a next-day flare |
| Physical capacity | Rebuild strength and tissue tolerance for the role | Strength close to the other side or to baseline; loading tolerated across a week |
| Running | Progress to repeated sprints | Repeated efforts at match intensity without symptoms the next day |
| Cricket-specific movement | Run-throughs, throwing, batting and keeping movements | Full movement at training intensity, no delivery or low volume |
| Skills exposure | Ball in hand: short run, low intensity, low volume | Volume built at low intensity across weeks |
| Training | Full squad training | Full training at full intensity, response settled within 48 hours |
| Competition | Managed match exposure | Match spells or innings with a planned following week |
| Performance | At or above the previous level | Tolerates consecutive matches at the level the role demands |

### 19.3 Where it shows up

- Home: the continuum, second content section.
- `/return-to-performance`: the full model and the assessment.
- Player memberships: "When something goes wrong".
- Every injury guide: a "Return to play" section mapped to these stages.
- The line to repeat, in different words each time: pain-free is a checkpoint, not the finish line.

---

## 20. Telehealth strategy

### 20.1 Position

A cricket-specific consultation that happens on video, not a lesser appointment. In cricket, most of the diagnostic work comes from the history: what was bowled, when in a spell the pain arrives, what the schedule did. That works as well on video. What video cannot do is stated plainly.

### 20.2 Objections and answers

| Objection | Answer on the site | Where |
|---|---|---|
| "How do you assess me without touching me?" | The history does most of the work. I set up movement and strength tests you perform on camera. If your problem needs hands or imaging, I say so in the appointment and sort out the fee. | `/telehealth`, FAQ |
| "What if I already have a physio?" | Good. I work alongside them: a second opinion, a return-to-bowling plan they deliver, or a conversation with them directly, with your consent. | `/telehealth`, players FAQ |
| "How does this work with my coach?" | With your consent, I talk to your coach or S&C about what the plan means for training and selection. | `/telehealth`, memberships |
| "What information should I send?" | Checklist below. | `/telehealth` |
| "What happens after?" | A written plan: what to do, what to stop, milestones, what has to be true before the next step. Most people need one or two reviews. | `/telehealth` |
| "Is it worth it for an injury you cannot touch?" | For some problems, no, and I will say so. | `/telehealth` (existing) |
| "I'm overseas. Time zones?" | Workable. Tell me the schedule and I find a time outside your night. Fees in AUD. | `/telehealth` |

### 20.3 Before the call

- Any scans and reports.
- The last six weeks of bowling: matches, nets, warm-ups. Rough numbers beat none.
- The next six weeks of fixtures.
- If it does not hurt to do so: phone video of five deliveries side-on and five front-on, at the intensity you normally bowl. Never bowl through pain to film.
- Space of a few metres, a resistance band, a step.

### 20.4 Limits

Acute injury needing examination, severe or worsening pain, numbness or weakness, suspected fracture, anything needing imaging first: see someone in person. The site says this on `/telehealth` and in the membership emergency notice.

**Decision needed:** confirm professional indemnity cover for consultations with players overseas (1.4 item 11).

---

## 21. Club, team and organisation strategy

### 21.1 Two buyers, two pages

| | Clubs and academies | Governing bodies, franchises, high-performance programs |
|---|---|---|
| Page | `/cricket-performance/clubs` | `/teams` |
| Offer | Fixed-price season packages | Bespoke consulting |
| Decision maker | President, head coach, academy manager | Medical lead, high-performance manager, CEO |
| Price shown | Yes | No, quoted after scoping (Opinion: publish "from" prices for a department review once two have been delivered) |
| Action | Discuss club support | Discuss your program |

### 21.2 Consulting menu (`/teams`, P2 rebuild)

Group as problems, then services:

- **Availability:** injury surveillance, player availability reporting, workload monitoring systems.
- **Decisions:** return-to-play systems and criteria, rehabilitation planning, who decides what.
- **Departments:** sports science and sports medicine department reviews, staffing and reporting lines, medical systems and documentation.
- **Players:** screening programs (as baselines), individual player case reviews.
- **Events:** tournament and tour medical planning and coverage, remote support.
- **People:** staff education for physios, S&C and coaches.

### 21.3 Engagement formats

| Format | Typical scope | Output |
|---|---|---|
| Scoping call | 30 minutes | Whether I am useful, and roughly what it involves |
| Department review | 2 to 4 weeks | Report with prioritised, costed recommendations |
| System build | A season | Working monitoring, RTP criteria, documentation |
| Retained remote support | Monthly | Case reviews, monitoring oversight, staff access |
| Tournament support | Per event | Planning, logistics, on-tour physiotherapy |

### 21.4 Proof

- One case summary per engagement type, written with the organisation's sign-off and with no player detail. The Federazione Cricket Italiana work is the first candidate.
- Roles stated as facts. No logos without written permission, and never as a wall.

---

## 22. Education strategy

- **Audiences:** physiotherapists, S&C coaches, cricket coaches, players, parents.
- **Now:** free injury and bowling guides; a speaking and media line on `/resources`.
- **P4:** `/resources/clinicians` (assessment approaches, return-to-bowling templates, case discussions), `/resources/coaches` (workload, junior bowlers, when to refer), `/speaking` (topics, formats, past talks, bio in two lengths, headshot download), a mailing list (double opt-in, no pop-ups).
- **P5:** paid workshops, webinars, a return-to-bowling course for physios, mentoring for early-career sports physios, downloadable tools. Launch each with a waitlist first; build only what the waitlist proves.
- **Rule:** education never takes a homepage section beyond "Read before you book". It supports authority; it does not lead the positioning.

---

## 23. Content strategy

### 23.1 Topic clusters

| Cluster | Pillar | Supporting pages (planned URL or section) | Primary reader | Converts to |
|---|---|---|---|---|
| Lumbar bone stress injury | `/cricket-injuries/lumbar-bone-stress-injury` | Back pain guide; imaging explained; return to bowling after LBSI; LBSI in juniors | Bowlers, parents | Consultation, Performance |
| Fast bowling | `/bowling` | All bowling guides | Bowlers, coaches | Tool, consultation |
| Bowling workloads | `/bowling/workload` | Intensity versus volume; nets count; gaps and spikes; what the ratio does and does not tell you | Bowlers, coaches | Tool, Essentials |
| Hamstring injuries | `/cricket-injuries/hamstring` | Running between wickets; return to sprinting | All players | Consultation, RTP Assessment |
| Side strains | `/cricket-injuries/side-strain` | Bowling-arm side; return timeline ranges | Bowlers | Consultation |
| Shoulder injuries | `/cricket-injuries/throwing-shoulder` | Bowling shoulder; throwing load counts | Fielders, bowlers | Consultation |
| Return to bowling | `/bowling/return-to-bowling` | Progression template; after LBSI; after side strain | Bowlers, physios | Performance |
| Return to cricket | `/return-to-performance` | Criteria by role; the RTP Assessment | Players, physios | RTP Assessment |
| Cricket rehabilitation | `/return-to-performance` | Rehab stalls; handover between clinicians | Players, physios | Consultation |
| Junior fast bowlers | `/bowling/junior-fast-bowlers` | Growth and bone age; guidelines explained; talking to a coach | Parents, coaches | Consultation, junior pricing |
| Injury prevention (framed as reducing avoidable injuries) | `/screening` | Pre-season build-up; warm-ups; what screening tells you and what it does not | Players, clubs | Screening, Essentials, clubs |
| Sports science in cricket | `/resources/coaches` | Monitoring that people fill in; small systems | Coaches, S&C | Clubs, consulting |
| Player availability | `/teams` | Why squads lose availability; decision problems | Clubs, organisations | Club and team enquiries |
| Sports medicine systems | `/teams` | Department reviews; associate nations | Organisations | Team enquiry |

### 23.2 Editorial standards

- Author and reviewer named, reviewed date shown, updated when the content changes (not for typo fixes).
- At least two peer-reviewed references for any clinical claim. Link to the source where it is open access.
- A "What the evidence says, and does not" block on every clinical page.
- General-information disclaimer before the clinical content.
- Review every clinical page at least every 12 months.

### 23.3 Publishing order and cadence

Opinion: two substantial pieces a month beats weekly thin posts. First eight, in order: LBSI (moved), return to bowling, bowling workload (split), junior fast bowlers, side strain, pre-season bowling build-up, screening explained, bowling shoulder.

---

## 24. SEO architecture

### 24.1 Page targets

**Assumption:** no keyword volume data yet. These targets follow search intent; revisit after eight weeks of Search Console data.

| URL | Primary keyword | Secondary | Title (≤65 characters) | H1 |
|---|---|---|---|---|
| `/` | cricket physio | cricket physio Melbourne, cricket physiotherapist, Thihan Chandramohan | The Cricket Physio \| Thihan Chandramohan, Melbourne & Telehealth | Cricket injuries, managed the way professional teams manage them. |
| `/cricket-performance` | cricket physio membership | cricket injury management, cricket performance support | Cricket Physio, Injury & Performance Support \| The Cricket Physio | Your cricket physio, before something goes wrong. |
| `/cricket-performance/players` | cricket physio memberships | cricket rehabilitation, bowling workload monitoring, cricket strength and conditioning | Cricket Physio Memberships \| Injury, Rehab & Performance | Cricket physio memberships for players |
| `/cricket-performance/clubs` | cricket club physio | cricket academy medical support, fast bowler monitoring | Cricket Physio Support for Clubs & Academies \| The Cricket Physio | Cricket medical support without employing a full-time medical team. |
| `/services` | cricket physiotherapy | sports physio cricket, cricket injury assessment | Cricket Physiotherapy Consultations \| The Cricket Physio | Cricket physio consultations |
| `/telehealth` | online cricket physio | cricket physio telehealth, remote physio for cricketers | Online Cricket Physio: Telehealth Consultations \| The Cricket Physio | Cricket physiotherapy by video |
| `/in-person` | cricket physio Richmond | cricket physio Melbourne | Cricket Physio in Richmond, Melbourne \| The Cricket Physio | Cricket physio in Richmond, Melbourne |
| `/return-to-performance` | return to cricket after injury | return to play cricket, return to performance | Return to Cricket After Injury \| The Cricket Physio | Return to performance |
| `/bowling` | fast bowler injuries | fast bowling workload, fast bowler physio | Fast Bowling Injuries, Workload & Return to Bowling \| The Cricket Physio | Fast bowling |
| `/bowling/workload` | bowling workload | how many overs, fast bowling workload guidelines | Bowling Workload for Fast Bowlers \| The Cricket Physio | Bowling workload |
| `/bowling/return-to-bowling` | return to bowling | return to bowling program, after back injury | Return to Bowling After Injury \| The Cricket Physio | Return to bowling |
| `/bowling/junior-fast-bowlers` | junior fast bowlers | junior fast bowling guidelines, young fast bowler back pain | Junior Fast Bowlers: A Guide for Parents and Coaches \| The Cricket Physio | Junior fast bowlers |
| `/cricket-injuries/lumbar-bone-stress-injury` | lumbar stress fracture cricket | pars stress fracture fast bowler, spondylolysis cricket | Lumbar Stress Fracture in Fast Bowlers \| The Cricket Physio | Lumbar bone stress injury in fast bowlers |
| `/cricket-injuries/fast-bowling-back-pain` | fast bowler back pain | lower back pain bowling | (current) | (current) |
| `/cricket-injuries/side-strain` | side strain cricket | side strain fast bowler recovery | Side Strain in Fast Bowlers \| The Cricket Physio | Side strain in fast bowlers |
| `/teams` | cricket sports medicine consultant | cricket medical systems, injury surveillance cricket | Cricket Sports Medicine Consulting \| The Cricket Physio | (current) |

### 24.2 Rules

- **Titles:** "{Topic} | The Cricket Physio", 50 to 65 characters. The homepage leads with the brand and name.
- **Descriptions:** 120 to 160 characters, a plain summary with one location or audience signal. `qa.py` enforces 70 to 165.
- **H1:** one per page, matching the search intent, never stuffed. The title and H1 are allowed to differ.
- **URLs:** lowercase, hyphenated, no trailing slash, no dates.
- **Canonicals** on every page, self-referencing, never pointing at a redirect.
- **Sitemap:** `lastmod` changes only when content changes.
- **Redirects:** every retired or renamed URL gets a 301 in `vercel.json`.

### 24.3 Structured data

| Page type | Schema |
|---|---|
| Home | `Person` (Thihan), `Organization`, `WebSite` |
| Membership and club pages | `Service` with `OfferCatalog` of `Offer` items, generated from `data/offers.json`; `FAQPage` generated from the visible FAQ; `BreadcrumbList` |
| Injury guides | `MedicalWebPage` with `lastReviewed`, `reviewedBy`, `about` (P3; currently `Article`); `BreadcrumbList` |
| `/faq` | `FAQPage` (hand-written today; switch to the build marker in P2) |

**No `LocalBusiness` or `MedicalBusiness` here.** Bridge Road owns the Richmond address, the Google Business Profile and the local pack. A second local entity at the same address splits local signals and contradicts the NAP rule in section 34. The Cricket Physio is an `Organization` with `areaServed`.

### 24.4 Location and international signals

- "Richmond, Melbourne" on home, `/in-person`, `/book`, footer. The street address appears as text, attributed to Bridge Road.
- Telehealth: "anywhere in Australia and overseas", time zones, AUD.
- `lang="en-AU"`, `og:locale en_AU`. No `hreflang` (single language).

### 24.5 Author and medical credibility

- Every guide names Thihan with a link to `/about`, and shows the reviewed date.
- `/about` lists roles, registration and memberships, and links out to verifiable profiles (LinkedIn, SMA).
- `sameAs` on the `Person` entity.
- No claims the page cannot support.

### 24.6 Cricket long-tail targets

fast bowler back pain · lumbar stress fracture cricket · pars fracture fast bowler recovery time · side strain cricket recovery · return to bowling after stress fracture · how many overs should a 15 year old bowl · junior fast bowling guidelines · bowling workload monitoring · acute chronic workload ratio cricket · hamstring injury cricket running between wickets · throwing shoulder pain cricket · cricket physio near me · online cricket physio · cricket strength and conditioning program · pre-season bowling program · cricket academy physio.

---

## 25. Internal linking strategy

Hub and spoke. Every page links up, sideways and to one action.

| From | Must link to |
|---|---|
| Every guide | Its hub (up); 2 to 3 related guides (sideways); one service or product (down) |
| Every service page | 2 relevant guides; memberships if the problem is ongoing |
| `/bowling` hub | Every bowling guide and the three bowling injuries; the tool |
| Back pain guide ↔ LBSI guide | Each other, in the first screen |
| `/return-to-performance` | RTP sections of each injury guide; RTP Assessment; players page |
| Player memberships | `/bowling`, `/return-to-performance`, `/in-person`, `/telehealth`, `/privacy` |
| Clubs page | `/teams` for larger organisations; `/privacy` |
| Home | Every nav section at least once, plus three guides |

Rules:

- Descriptive anchor text ("return-to-bowling principles"), never "click here" or "read more".
- One CTA block per guide, at the end, matched to the guide's reader.
- A membership mention in a guide only where ongoing support fits the problem (recurring, return to bowling, junior quick).
- Never tag internal links with UTM parameters.

---

## 26. Conversion architecture

### 26.1 CTA hierarchy

| Level | CTA | Where | Style |
|---|---|---|---|
| Primary, site-wide | Book a consultation | Header (desktop), "Book" (phone header), footer, home hero and closing band | Primary button |
| Product | Join Essentials · Join Performance · Apply for Integrated Performance · Enquire about Club Core · Enquire about Club Plus · Discuss club support | Product pages and cards | Featured tier primary, others secondary |
| Professionals | Discuss your situation | `/professional-players`, home professionals band ("For professional players") | Primary button |
| Low commitment | Start tracking your bowling | Bowling pages, memberships, home fast bowler section | Primary in the fast bowling section, text link elsewhere |
| Tertiary | Ask a question · Compare memberships | Closing bands, beside a primary | Secondary button or text link |

### 26.2 One next step per page

| Page | The one obvious next step |
|---|---|
| Home | Book a consultation |
| `/services`, `/telehealth`, `/in-person` | Book (the matching calendar) |
| `/return-to-performance` | Book a Return to Performance Assessment |
| `/cricket-performance` | Find the right level of support |
| `/professional-players` | Discuss your situation |
| Players page | The tier CTA → application |
| Clubs page | Discuss club support |
| `/bowling` and bowling guides | Start tracking your bowling |
| Injury guides | Book a consultation |
| `/teams` | Discuss your program |
| `/about` | Book a consultation |

### 26.3 Mobile

- The header "Book" button is always visible below 1100px.
- Sticky bottom CTA on product pages only, matched to the product, hidden whenever the hero, tier cards, a form, the closing band or the footer is on screen.

| Page | Sticky text | Sticky button |
|---|---|---|
| `/cricket-performance` | Memberships, from $79 a month | Find your level |
| Players page | Player memberships, from $79 a month | Choose a membership |
| Clubs page | Club support, from $5,000 a season | Discuss club support |

- No pop-ups, no exit intent, no chat widget.

### 26.4 Forms

| Form | Fields shown | Required | Conditional |
|---|---|---|---|
| Player application | 16 | 10 | Guardian name and email if age under 18; bowling status if a bowler; injury detail if injured |
| Club enquiry | 12 | 7 | None |
| Team enquiry | 4 | 3 | None |

Rationale: an application for a $449 to $949 monthly service justifies more questions than a newsletter. Grouped into three fieldsets so it reads as short sections. Consent tick box required before any health detail is sent.

### 26.5 After submitting

- On screen: what happens next and when ("I read every one myself and reply within two business days").
- Phone number offered for anything time-critical.
- Failure: the message is preserved in the page and the email and phone are offered.

### 26.6 Checkout (P1 dependency, P5 full)

1. Stripe Payment Links per tier (and per upfront option), stored in `cta.checkoutUrl` in `data/offers.json`. Essentials only first, since its flow skips suitability.
2. Stripe success URL → `/cricket-performance/welcome` (noindex) that fires `purchase_complete` and explains onboarding.
3. Later: Stripe Customer Portal for pauses, upgrades and cancellations, matching the rules in 17.3.

---

## 27. Trust strategy

### 27.1 Allowed, and where

| Signal | Where | Rule |
|---|---|---|
| Named roles | Home strip, `/about`, OG image | Text, no logos |
| Years of experience | Hero credentials, profile | 20+ physio, 15+ elite cricket |
| Registration | Profile, footer, `/about` | AHPRA number in full |
| Professional memberships | Profile, `/about` | SMA Victorian State Council |
| Evidence | Every guide | References, reviewed dates |
| Written limits | Every service | "What this is not", "Not included" |
| Consent and data | Players and clubs pages, privacy | Plain-language section, not buried |
| Media and presentations | `/resources`, `/speaking` | List with links |
| Case examples | `/teams`, guides | De-identified, consented, factual, no outcome promise |
| Organisation quotes about consulting or education | `/teams`, `/speaking` | Only about non-clinical work, with written permission (Opinion: check with Ahpra guidance first) |

### 27.2 Not allowed

- Testimonials or reviews about clinical care, including quoting Google reviews.
- Star ratings.
- Before-and-after claims.
- Walls of team logos.
- Player names or photos in an injury context without explicit consent.
- "As seen on" media bars.

---

## 28. Component library

All components live in `style.css`. Class names below are the contract: reuse them before writing new CSS. "Built" means implemented and in use.

**Effects and where they run.** Reveals: elements matching the `REVEAL` list in `script.js` fade up once as they enter the viewport; anything already on screen at load is never hidden, and without JavaScript nothing is hidden (`html.js [data-reveal]`). Parallax: `[data-parallax]` image bands only. Spotlight: `.spot` cards. All of it stops under `prefers-reduced-motion`.

| Component | Markup | Use when | Do not use when | Behaviour | Status |
|---|---|---|---|---|---|
| Head | `_partials/head.html` | Every page | | Colour scheme, theme colour, favicon set, manifest, font preloads, stylesheet, `html.js` flag | Built |
| Header | `_partials/header.html`, `.hdr` | Every page | | Sticky glass header with the logo; border and smaller logo once scrolled; Book always visible on phones | Built |
| Progress bar | `.progress` | Every page (in the header partial) | | 2px teal gradient along the top, tracks scroll | Built |
| Main nav | `.nav`, `[data-menu-toggle]` | Every page | | Below 1200px a panel opens under the header; Escape closes and returns focus | Built |
| Hero, home | `.hero.hero--home` + `.hero__grid` | Home, `/about`, `/professional-players` | Guides | Copy left, photo right from 1024px; teal glow; copy rises in on load | Built |
| Hero, text | `.hero.hero--animate` | Hubs without a photo (`/services`, the Journal) | Home | Crease-line graphic on desktop; copy rises in | Built |
| Hero name | `.hero__name` | Above the home H1 | Anywhere else | 44px avatar, name, role | Built |
| Hero portrait | `.hero__portrait` (+ `--landscape`) + `.glasscard` | Hero photos | Inline images | 4:5 portrait or wide crop, offset teal frame, glass credential card | Built |
| Byline | `.byline` | Under hero CTAs on product and hub pages | More than once per page | Pill with a 38px avatar: "Handled personally by Thihan Chandramohan" and similar | Built |
| Proof strip | `ul.proof` | Home hero | Unsourced figures | Four serif numerals with gradient fill and labels; 2 × 2 on phones | Built |
| Logo marquee | `.orgbar` + `.marquee` + `.logo-chip` | Home only | Without written permission (1.4 item 14) | White chips drift left; pauses on hover and focus; duplicate set `aria-hidden` | Built |
| Pathway cards | `ul.paths > li > a.path.spot` | Routing: "What brings you here?", "Four ways in", pro page options | Lists of facts | Numbered in italic serif; spotlight follows the pointer; whole card is the link | Built |
| Help list | `.helplist > .help` | `/services` pathways | Home | Large serif number and title, summary, paragraph, one or two actions | Built |
| Pathway | `ol.pathway` | The six return-to-performance stages | Other processes | Vertical with a left line on phones; six across from 1024px; the teal line draws in on entry | Built |
| Image band | `section.imageband` + `.imageband__media[data-parallax]` | One per page at most | Photos with faces where text would cover them | Full-bleed photo, dark scrim, slight parallax | Built |
| Fast bowling section | `section.bowling` + `.bowling__pitch` | Home only | | Title up to 128px; pitch diagram behind | Built |
| Media figure | `figure.media` (+ `--4x3`) | Inline photography | Decoration | Rounded, shadowed, teal glow behind; caption | Built |
| Pull quote | `blockquote.quote` + `cite` | Thihan's own words, once per page | Anyone else's words, testimonials | Italic serif with avatar in the citation | Built |
| Career list | `ul.career` | Roles by level | Unconfirmed roles | Level label in teal caps, organisations, optional role line | Built |
| Journal cards | `ul.journal > li > a.jcard` | Guides and articles | Products | Tag, serif title, summary, reviewed date; lifts on hover | Built |
| Taxonomy | `ul.topics` / `.taxonomy` | Journal topic list with counts | | Pills with counts | Built |
| Seam divider | `hr.seam` | Between two quiet sections | More than one per screen | Teal line with clay stitches | Built |
| Section head | `.section-head` (+ `--center`, `--row`) | Opening a section | | Eyebrow, H2, lede | Built |
| Split | `.split` (+ `--even`, `--center`, `--wide-left`) | Heading beside content | | Side by side from 1024px | Built |
| Tier card | `article.tier` (+ `--featured`), generated | Membership tiers and club packages | Anything not purchasable | Featured tier has a slowly turning teal border (`@property --angle`), a text flag and a glow; price block; ticks; not-included list | Built |
| Comparison table | `.compare-wrap > table.compare`, generated | Comparing tiers or packages | Fewer than 5 rows | Real table from 768px with a sticky header; blocks below | Built |
| Data table | `table.datatable` (+ `--stack`) | Fees, junior prices | | Stacks below 576px | Built |
| Journey | `ol.journey`, generated | The membership progression | | Horizontal from 1024px | Built |
| Steps | `ol.steps` | A process with 3 to 5 steps | More than 5 | Numbered | Built |
| Scenarios, versus, stacked lines, tier list | `dl.scenarios`, `.versus`, `ul.lines`, `dl.tierlist` | Membership pages | | As version 1, re-coloured | Built |
| Notice | `.notice` (+ `--sand`) | Consent, limits, emergency | Marketing | Left rule, quiet | Built |
| Callout | `.callout` | Asides inside guides | Page sections | Teal wash, left rule; headings inside use the text face | Built |
| FAQ | `.faq > details > summary + .faq__a` | Questions and answers | More than 15 on a page | Native details; opens tracked; FAQ schema generated | Built |
| Form | `form.form[data-enquiry][data-form][data-events]` | Enquiries and applications (`team`, `player`, `club`, `pro`) | | Inline validation, conditional fields, honeypot, focus to first error | Built |
| CTA band | `section.cta-band` | Closing a page | Mid-page | Glow behind, H2 max 22ch, up to two buttons | Built |
| Sticky CTA | `.stickycta[data-sticky]` | Product pages on phones and tablets | Guides, home | Glass bar; appears when no hide-target is on screen | Built |
| Breadcrumbs | `nav.crumbs > ol` | Every page but home | | Slash separators | Built |
| Footer | `_partials/footer.html`, `.ftr` | Every page | | Logo, name block, four columns, legal strip, social links | Built |
| Buttons | `.btn--primary`, `.btn--secondary`, `.btn--sm`, `.btn--block`, `.btn--arrow` | Actions | Navigation lists | Pills, 52px high; primary has the teal gradient, glow and a sheen on hover | Built |
| Text link | `a.textlink` | A section's next step | Inline in a sentence | Arrow nudges on hover | Built |
| Card (legacy) | `.card`, `.card--link` | Pages not yet rebuilt | New work | Whole card clickable | Built, retire in P2 |
| Related content, author box, stat block, case example | `.related`, `.author`, `.stat`, `.case` | Guides and case pages | | As version 1 | P3 to P4 |

**Removed in version 2:** theme toggle (`.themebtn`), problem selector on home (`nav.selector`, still styled for later use on 404), organisation names strip on home (`.orgs`, kept in CSS as the fallback if logo permission is refused).

---

## 29. Responsive design rules

| Breakpoint | Width | What changes |
|---|---|---|
| Tiny | ≤368px (23rem) | Header logo 40px |
| Small | 576px (36rem) | Data tables stop stacking; tier list gets a label column |
| Form | 640px (40rem) | Form fields pair into rows; club cards 2 across |
| Tablet | 768px (48rem) | Comparison tables become real tables; gutters 32px; body 18px; grain overlay on; header 84px; hero photos run full width in a 3:2 crop |
| Desktop | 1024px (64rem) | Hero goes two columns; splits side by side; tiers and pathway cards 3 across; pathway goes horizontal; sticky CTA stops; crease graphic appears |
| Nav | 1200px (75rem) | Full nav replaces the menu button |
| Wide | 1280px (80rem) | Gutters 48px; content width 1280px |

Rules:

- Max content width 1280px (80rem) plus gutters. Long-form text 42rem.
- Gutters: 20px phone, 32px tablet, 48px wide.
- Tap targets at least 44 × 44px; buttons 52px.
- At 390 × 844, the home H1 fits in four lines and the primary CTA sits inside the first screen (Fact: verified).
- No horizontal scrolling at 390px on any page (Fact: tested on 20 pages including every rebuilt page and all three guides).
- Hero buttons go full width below 480px.
- Tables never scroll sideways; they restructure.

---

## 30. Accessibility requirements

Target: WCAG 2.2 AA across the site.

| Requirement | Implementation |
|---|---|
| Contrast | Every text pair measured (section 9.2). Non-text UI at least 3:1 |
| Not colour alone | Featured tier: label and thicker border. Yes/No: tick and word. Errors: symbol, text, thicker border |
| Keyboard | Everything reachable and operable. Menu closes on Escape and returns focus. Skip link first in the page |
| Focus visible | 2px amber (`#F2B35B`) outline, 3px offset, never removed. Inputs add a teal border and halo |
| Landmarks | `header`, `nav[aria-label]`, `main#main`, `footer`; breadcrumbs as `nav` |
| Headings | One H1; no skipped levels (`qa.py` checks) |
| Forms | Every control labelled; hints linked with `aria-describedby`; errors in the field's `.err` with `role="alert"` and `aria-invalid`; focus moves to the first error; status region `aria-live="polite"` and focused on submit |
| Conditional fields | Hidden fields are also disabled, so screen readers and validation skip them |
| Tables | `caption`, `scope`, and explicit ARIA roles so the stacked mobile layout keeps table semantics |
| Motion | `prefers-reduced-motion` stops smooth scroll, reveals, the marquee, parallax, the pathway draw, the turning tier border, the hero entrance and hover lifts. Content is never hidden waiting for an animation |
| Marquee | The duplicated logo set is `aria-hidden`; the loop pauses on hover and keyboard focus |
| Decorative graphics | Pitch, crease and seam graphics are CSS or `aria-hidden` SVG |
| Language | `lang="en-AU"` |
| Images | Meaningful `alt`; decorative `alt=""` |
| Sticky CTA | Uses `visibility: hidden` when off screen, so it cannot take focus |

**Not yet done (Phase 2 acceptance):** a screen reader pass with VoiceOver on iOS and NVDA on Windows across home, players, clubs and one guide, and a 200% zoom check.

---

## 31. Technical recommendations

### 31.1 Codebase audit (Fact, 24 September 2026)

| Item | Finding | Action taken |
|---|---|---|
| Framework | None. Static HTML, one CSS file, two JS files, one Vercel Function. `cleanUrls`, no trailing slash | Kept. No reason to change |
| Reusable components | CSS classes only; header and footer copied into 21 files | Header and footer moved to `_partials/`, written in by `_tools/build.py` |
| Design tokens | CSS custom properties with a dark theme, AA-measured | Replaced with the new system, same structure |
| SEO | Titles, descriptions, canonicals, OG tags, JSON-LD (Person, Organization, WebSite, Article, BreadcrumbList, one hand-written FAQPage), sitemap, robots | Kept; product pages add Service and generated FAQPage |
| Analytics | None loaded. `data-track` pushes to `dataLayer` | Kept; registry expanded; a double-count bug removed (next row) |
| Double counting | `site-config.js` fired the form's `data-track` on every submit attempt, including invalid ones, and `script.js` fired it again on success | Removed the submit listener; forms fire `_start`, `_invalid`, `_complete`, `_error` |
| Booking | Links to the Bridge Road booking page and Halaxy, tagged with UTM at click time | Kept |
| Forms | One team enquiry form, Resend via a Vercel Function, honeypot | Generalised to team, player and club forms with per-form whitelists and checks |
| Dead code | `.rise` entrance animation; header theme toggle and its icon swapping | Removed. Version 2 removed the theme system entirely |
| Duplicates | Nav and footer ×21; FAQ answers repeated between home and `/faq`; injury card blurbs on three pages | Partials; home FAQ removed; card blurbs to be retired in P2 |
| Lint tool | Crashed on the first finding (assumed an absolute path) | Fixed; now skips partials and docs |
| Public internals | `cricket-logo/` (3.4 MB of raw logos), README and the site map were served from the live domain | `.vercelignore` added for docs, data, tools, partials, logos and markdown |
| Fonts | Google Fonts, with the privacy policy noting Google receives visitors' IP addresses | Self-hosted and trimmed; CSP tightened to `font-src 'self'`. Version 2: Instrument Serif and Manrope |
| Icons (version 2) | One SVG favicon, no manifest | `favicon.ico` (16, 32, 48), PNG favicons, Apple touch icon, 192 and 512 icons plus a maskable 512, `site.webmanifest`, all from the logo mark on a dark tile |
| Caching | `vercel.json` serves css, js and images as `immutable` for a year, but pages linked them by fixed names. After any change, returning visitors would keep the old `style.css` for up to a year | The build stamps every local css, js and image reference with `?v=<content hash>`. Fonts are excluded (see 31.3) |

### 31.2 Stack decision

Stay on static HTML with a pre-commit build. **Opinion:** move to Astro only if the site passes about 60 pages, needs a CMS for someone other than Thihan, or needs logged-in member pages on the main domain. None of those is true yet.

### 31.3 The build (`_tools/build.py`)

- Writes partials, offer blocks, inline prices and FAQ schema into the HTML between markers.
- Stamps local css, js and image references with `?v=<first 8 hex of the file's SHA-1>`, so the one-year immutable cache is safe. Fonts are not stamped: `style.css` requests them by bare URL and a stamped preload would stop matching. If a font file ever changes, give it a new filename.
- `--check` exits non-zero if any page is stale, including after an unbuilt edit to `style.css` or `script.js`. Run it before every commit.
- **P2:** add a GitHub Action running `build.py --check`, `qa.py` and `lint.py` on every pull request.

### 31.4 Payments

**Opinion:** Stripe Payment Links first (no code, AUD, GST-aware, cards and Apple Pay), then Stripe Checkout with a small webhook in `api/` when onboarding needs automating, then the Stripe Customer Portal for pauses, upgrades and cancellations. Set the success URL to `/cricket-performance/welcome`.

### 31.5 Analytics

**Opinion:** Plausible (or Vercel Web Analytics) rather than GA4. No cookies, so no consent banner; custom events map directly from the `dataLayer` names; simple enough to check weekly. Use GA4 only if paid advertising starts. Update the privacy policy before switching anything on.

### 31.6 Email and lists

Resend stays for transactional email. For the P4 mailing list, a double opt-in tool that exports cleanly (Opinion: Buttondown or Resend Audiences).

### 31.7 Security

Keep the headers in `vercel.json`: HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame restrictions. Every new third party needs a CSP change and a privacy policy line in the same commit.

---

## 32. Performance requirements

Measured on this branch, version 2 (Fact):

| Asset | Raw | Gzip |
|---|---|---|
| `style.css` | 69.4 KB | 14.6 KB |
| `script.js` | 17.7 KB | 5.7 KB |
| `site-config.js` | 7.6 KB | 2.9 KB |
| Home HTML | 29.5 KB | 7.6 KB |
| Players page HTML | 66.1 KB | 15.0 KB |
| Fonts preloaded (Manrope + Instrument Serif) | 43.2 KB | |
| Instrument Serif italic (loads on first use) | 21.6 KB | |
| Hero portrait (WebP, 880 × 1100) | 67.9 KB | |
| Header logo (WebP) | 16.3 KB | |
| Eight organisation logos (WebP) | about 60 KB | |

Budgets:

| Metric | Budget (mobile, mid-range phone, 4G) |
|---|---|
| Largest Contentful Paint | ≤ 2.0 s |
| Cumulative Layout Shift | ≤ 0.05 |
| Interaction to Next Paint | ≤ 200 ms |
| CSS + JS transferred | ≤ 30 KB gzip (currently 23.2 KB) |
| Fonts | ≤ 100 KB, two files preloaded |
| Page weight excluding photography | ≤ 200 KB |
| Hero photograph | ≤ 180 KB |
| Third-party requests | Zero until analytics is added; then one |
| Lighthouse (mobile) | ≥ 95 in every category |

Rules: no JS framework; no carousels (the logo marquee is CSS, not a carousel); no autoplay video; grain overlay only from 768px, where paint cost is affordable; images with dimensions set; lazy-load below the fold; long cache headers on static assets (already set); fonts subset and trimmed.

---

## 33. Analytics and conversion tracking

### 33.1 Event registry (built)

Every event pushes `{ event: 'tcp_event', tcp_action, tcp_detail }` to `window.dataLayer` and dispatches a `tcp:track` DOM event. The registry lives in `site-config.js`.

| Event | Fires when | Detail |
|---|---|---|
| `book_click` | Any link into booking | href |
| `telehealth_click` | Telehealth booking link | href |
| `problem_select` | A "What brings you here?" card on home | href |
| `find_level_click` | "Find the right level of support" | href |
| `compare_click` | "Compare memberships" | href |
| `memberships_click` | Other links into `/cricket-performance` | href |
| `membership_essentials_click` | Join Essentials | href |
| `membership_performance_click` | Join Performance | href |
| `membership_integrated_apply` | Apply for Integrated Performance | href |
| `checkout_start` | A tier CTA that goes to checkout | tier |
| `tier_card_view` | A tier or club card is half on screen (once per page view) | tier id |
| `club_page_click` | Link into the clubs page | href |
| `club_discuss_click` | "Discuss club support" | href |
| `club_core_enquiry` / `club_plus_enquiry` | Package CTAs | href |
| `application_start` / `_invalid` / `_complete` / `_error` | Player application | form type / field / tier / error |
| `club_enquiry_start` / `_invalid` / `_complete` / `_error` | Club form | as above, detail is the package |
| `team_enquiry_start` / `_invalid` / `_complete` / `_error` | Team form | as above |
| `pro_enquiry_start` / `_invalid` / `_complete` / `_error` | Professional player form | as above |
| `pro_page_click` | Link into `/professional-players` | href |
| `pro_enquiry_click` | "Discuss your situation" | href |
| `bowling_tool_click` | Any link to the Bowling Workload Tool | href |
| `faq_open` | An FAQ answer opens | question |
| `scroll_depth` | 25, 50, 75, 100% per page view | percentage |
| `article_read` | Guide scrolled past 75% | path |
| `phone_click`, `email_click`, `maps_click`, `bridgeroad_click` | Contact and outbound links | href |
| `purchase_complete` | Not yet built: fires on the checkout success page | tier |

Tested in a browser on this branch (Fact, version 2, 60 checks): tier preselect, conditional fields, validation, mocked submissions for the player, club and professional forms, `application_*`, `club_enquiry_*`, `pro_enquiry_*`, `tier_card_view`, `faq_open`, `scroll_depth` and `membership_*` events all fire as specified.

### 33.2 Funnels to report

1. Memberships: `/cricket-performance` view → `tier_card_view` → `membership_*` → `application_start` → `application_complete` → (later) `purchase_complete`.
2. Professionals: `/professional-players` view (or `pro_page_click`) → `pro_enquiry_click` → `pro_enquiry_start` → `pro_enquiry_complete`.
3. Clubs: clubs page view → `club_*_enquiry` or `club_discuss_click` → `club_enquiry_start` → `club_enquiry_complete`.
4. Consultations: any page → `book_click` / `telehealth_click` → Halaxy booking (UTM `utm_source=thecricketphysio`, campaign = the `data-utm` value).
5. Tool: `bowling_tool_click` → tool sign-ups (from the tool's own analytics).

### 33.3 Conventions

- UTM on outbound booking links only, added at click time by `script.js`. Never on internal links.
- Event names are `snake_case`, verb or noun first, and never renamed once an analytics tool is connected.
- Review weekly: macro conversions by source; monthly: funnel drop-off and top entry pages.

---

## 34. Relationship with Bridge Road Physio

| Area | The Cricket Physio | Bridge Road Physiotherapy |
|---|---|---|
| Role | Cricket-only brand: expertise, telehealth, memberships, clubs, consulting, education | Richmond clinic for sport and everyday injuries |
| Voice | First person, Thihan | Practice voice |
| Address and NAP | None of its own. Mentions Bridge Road's address as text | Owns 507 Bridge Road, Richmond VIC 3121, the Google Business Profile and local schema |
| Schema | `Organization`, `Person`, `Service` | `LocalBusiness` / `MedicalBusiness` |
| Booking | Links to Bridge Road's booking page and Halaxy, tagged with UTM | Halaxy calendars |
| Fees | Telehealth fees and the five member-rate fees, kept in step | Single source of truth for clinic fees |
| Content | All cricket content lives here | Links here for cricket; publishes no cricket guides of its own |
| Visual identity | Dark, logo teal and grey, Instrument Serif and Manrope. Shares the Bridge Road feel (dark, pill buttons, glass header, grain) at a higher spec | Its own palette and templates |

### 34.1 Exact wording where Bridge Road appears on this site

- Footer: "Melbourne appointments are seen at Bridge Road Physiotherapy, 507 Bridge Road, Richmond VIC 3121."
- Home: "In Melbourne: in person at Bridge Road Physiotherapy, 507 Bridge Road, Richmond, with a gym floor for proper loading."
- Memberships: member rates "at Bridge Road Physiotherapy in Richmond"; testing "at the Richmond clinic".
- `/in-person`: the full explanation (unchanged).
- `/about`: one paragraph on the two practices (unchanged).

### 34.2 Avoiding duplicate content

- No page is published on both sites. Bridge Road's cricket page is short, local ("cricket physio in Richmond"), and links here for depth.
- **Move** Bridge Road's lumbar stress guide to `/cricket-injuries/lumbar-bone-stress-injury` and 301 the old Bridge Road URL to it (P3). If Bridge Road must keep a version, it carries a canonical to this site.
- Titles and descriptions never repeat across the two sites.

### 34.3 Bridge Road to-do list (outside this repo)

1. Cricket page on bridgeroad.physio linking to thecricket.physio, with UTM `utm_source=bridgeroad`.
2. 301 or canonical for the lumbar stress guide once moved.
3. Halaxy "cricket consult" and member-rate appointment types matching the five discounted services.
4. Confirm fee parity with `data/offers.json`.

---

## 35. Future product architecture

### 35.1 Where products live

| Kind | Home | Rule |
|---|---|---|
| Paid ongoing support (memberships, club subscriptions, seasonal packages) | `/cricket-performance/*` | New tiers or packages are entries in `data/offers.json`, rendered by the build |
| Free and paid tools (workload, RTP tracker, screening dashboard) | Subdomain apps, marketed from `/bowling` and memberships | The marketing page lives on the main site; the tool does not |
| Education (courses, workshops, webinars, mentoring, downloads) | `/resources` now, `/learn` when paid products exist | Waitlist before build |
| Member accounts and dashboards | `app.thecricket.physio` | One login for tool and membership, eventually |

### 35.2 Roadmap of products

| Product | Audience | Phase | Depends on |
|---|---|---|---|
| Bowling Workload Tool, free tier | Bowlers | Live | Open sign-up (1.4 item 2) |
| Essentials automation: alerts, check-ins, libraries | Essentials members | Before launch | Tool features (1.4 item 1) |
| Checkout and customer portal | All members | P1 to P5 | Stripe |
| Player dashboard with clinician view | Performance, Integrated | P5 | Accounts |
| Club monitoring dashboard with consent controls | Club packages | P5 | Accounts, consent model |
| Fast bowler pre-season program (one-off purchase) | Bowlers | P5 | Checkout |
| Screening packages for squads | Clubs | P5 | `/screening` page |
| Return-to-bowling course for physios | Clinicians | P5 | Waitlist of 50+ |
| Workshops and webinars | Coaches, clinicians | P4 to P5 | Mailing list |
| Mentoring | Early-career sports physios | P5 | Capacity |
| Downloadable tools (RTB template, workload sheet) | Clinicians, coaches | P4 | Resources rebuild |

### 35.3 Keeping the main site clean

- New products do not get a top-nav item. They sit under Memberships, Fast bowling or Resources until one drives more than 15% of conversions for a quarter (Opinion).
- Every product page follows the product template: dark compact hero, who it is for, what is included and not, price from `data/offers.json`, rules, FAQ, one CTA.
- Every product adds its events to the registry before launch.

---

## 36. What to remove from the existing site

| Item | Where | Action | Status |
|---|---|---|---|
| Serif headings and teal palette | Site-wide | Replaced by the new system | Done |
| Entrance animation (`.rise`) | Home cards | Removed | Done |
| Header theme toggle | Every page | Moved to the footer in version 1; removed with the light theme in version 2 | Done |
| Light theme | Site-wide | Removed (version 2) | Done |
| Navy, off-white and green palette; Archivo and Plex | Site-wide | Replaced by the version 2 system | Done |
| Drawn SVG mark and text wordmark | Header, favicon | Replaced by the master logo reversed for dark | Done |
| "Who I work with" audience cards | Home | Replaced by the problem selector | Done |
| Six-card injury grid | Home | Replaced by selector, fast bowler band, guides list | Done |
| "Four ways to work together" card grid | Home | Replaced by "Three ways in" | Done |
| Home FAQ | Home | Removed; lives on `/faq` | Done |
| Long "Why cricket specifically" biography | Home | Replaced by a short profile block | Done |
| "Access is by request" tool copy | Home, `/bowling`, `/resources` | Replaced with free-tier wording | Done, pending 1.4 item 2 |
| "programme" spelling | 5 pages | "program" | Done |
| Double-counted form event | `site-config.js` | Removed | Done |
| Google Fonts | Every page | Self-hosted | Done |
| Raw logos served publicly | `cricket-logo/` | `.vercelignore` | Done |
| Card grids on hubs | `/services`, `/resources` | Rebuilt in version 2 (help list, Journal) | Done |
| Card grids on hubs | `/cricket-injuries` | Journal cards | P2 |
| Duplicated injury blurbs | Home, hub, resources | One description per guide, in the hub | P2 |
| `cricket-physio-site-map.md` | Repo | Marked superseded by this brief | Done |
| "Access by request" line in `site-config.js` comments | Config | Updated | Done |
| Any "Most Popular" label | Product pages | Never added; "Individual clinical support" instead | Done |

---

## 37. Priority implementation roadmap

Priority: **P0** blocks launch, **High** this phase, **Medium** next phase, **Low** when convenient. Status is as of this branch.

### Phase 1: critical positioning, navigation, UX, technical and conversion fixes

| ID | Action | Rationale | Affected | Priority | Depends on | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|
| 1.1 | New design tokens and type | The "vibe" problem is visual system first | `style.css`, all pages | P0 | | Contrast table in 9.2 holds; no teal left; Archivo and Plex render | Done |
| 1.2 | Header and footer partials plus build tool | 21 copies of the nav drift | `_partials/`, `_tools/build.py`, all pages | P0 | | `build.py --check` passes; `aria-current` correct on every section | Done |
| 1.3 | New navigation | Route by what people want, add memberships | Header, footer | P0 | 1.2 | Six items plus Book; phone header shows Book | Done |
| 1.4 | Homepage rebuild | Answer who, what, why, trust, next within one screen | `index.html` | P0 | 1.1 | Section 15.2 built; primary CTA in first 844px at 390px | Done |
| 1.5 | Membership landing, players and clubs pages | New commercial offer | `cricket-performance/*` | P0 | 1.1, 1.6 | Every brief section present; no horizontal scroll; lint clean | Done |
| 1.6 | `data/offers.json` single source | Prices must not drift | Build, product pages | P0 | | Changing one price and rebuilding updates every mention, schema included | Done |
| 1.7 | Player and club forms plus API | Capture applications | `api/enquiry.js`, `script.js` | P0 | | Handler tests pass for all three form types; e2e form tests pass | Done |
| 1.8 | Event registry | Measure what matters from day one | `site-config.js`, `script.js` | High | | Events in 33.1 fire in a browser test | Done |
| 1.9 | Self-host fonts, tighten CSP | Speed, privacy, resilience | `assets/fonts`, `vercel.json`, heads | High | | No request to Google; fonts under 100 KB preloaded | Done |
| 1.10 | Privacy policy for applications and fonts | Health information now collected | `privacy.html` | P0 | 1.7 | Names Resend, consent, members' data; **reviewed by someone qualified** | Done, review pending |
| 1.11 | Resolve launch gates 1 to 7 in section 1.4 | Legal and factual accuracy of the offer | `data/offers.json` | P0 | Owner | Every Essentials feature exists or is removed; fees confirmed; GST advice received | To do |
| 1.12 | Set `RESEND_API_KEY` and verify the sending domain; send one real submission from each form | Forms fail without it | Vercel dashboard | P0 | | Three test emails received with correct subjects | To do |
| 1.13 | Connect analytics (Plausible or Vercel) | Events go nowhere today | Heads, privacy, CSP | High | 1.10 | Events visible in the dashboard; privacy updated in the same commit | To do |
| 1.14 | Stripe Payment Link for Essentials | Remove the manual step for the lowest tier | `data/offers.json` | High | 1.11 | Join Essentials opens checkout; `checkout_start` fires | To do |
| 1.16 | Version 2: dark-only system, logo everywhere, Thihan to the front | Owner direction (1.5) | All pages, `style.css`, partials, assets | P0 | | Sections 9, 10, 14, 15 and 28 built; contrast table 9.2 holds; e2e passes | Done |
| 1.17 | `/professional-players` page and `pro` form | International professionals are now a target audience | New page, `api/enquiry.js`, nav, footer, sitemap | P0 | 1.16 | Section 16.18 built; handler accepts `pro` and rejects missing consent; events fire | Done |
| 1.18 | Photo consent and logo permissions | Identifiable player in an injury context; trade marks | Home, `/professional-players`, `/about` | P0 | Owner | Written consent for the pitch-side and gym images; written permission for each logo, or the fallbacks in 1.4 items 12 to 14 applied | To do |
| 1.15 | CI check on pull requests | Stop stale builds and banned words reaching main | `.github/workflows` | Medium | 1.2 | PR fails when `build.py --check`, `qa.py` or `lint.py` fails | To do |

### Phase 2: core page rebuild

| ID | Action | Rationale | Affected | Priority | Depends on | Acceptance criteria |
|---|---|---|---|---|---|---|
| 2.1 | Rebuild `/services` around the problem map | Most injured players land here | `/services` | High | 1.1 | Section 16.4; one primary CTA. **Done in version 2** (six pathways); add screening when 2.3 lands |
| 2.2 | Rebuild `/return-to-performance` as the pillar | The brand's defining idea | `/return-to-performance` | High | | Section 16.7 and 19; continuum component; stage table reviewed by Thihan |
| 2.3 | New `/screening` page | Paid product without a page | `/screening`, sitemap | High | 1.11 | Section 16.8; states plainly that screening does not predict injury |
| 2.4 | `/bowling` becomes the fast bowling hub | Pillar needs a hub | `/bowling` | High | | Section 16.9; `#return-to-bowling` still resolves |
| 2.5 | Rebuild `/teams` | Consulting needs structure and proof | `/teams` | High | | Section 21; one case summary signed off |
| 2.6 | Refresh `/telehealth` | Objections unanswered | `/telehealth` | Medium | | Section 20.2 and 20.3 content present |
| 2.7 | Refresh `/about` | Trust page for organisations | `/about` | Medium | Photo 10 (delivered) | Portrait in place; roles with years; under 900 words. **Rebuilt in version 2**; role years still to confirm |
| 2.8 | Membership routes on `/book`, `/contact`, `/faq`; selector on 404 | Close dead ends | Those pages | Medium | | Each has a route to memberships |
| 2.9 | FAQ schema marker on `/faq` | Schema must match the page | `faq.html` | Low | | Hand-written JSON-LD removed; build generates it |
| 2.10 | Photography shoot or archive pull | Imagery should carry the brand | Assets | High | Consent forms | At least shots 1 to 6 and 10 delivered at 2400px |
| 2.11 | Screen reader and zoom pass | Close the a11y gap | Home, product pages, one guide | Medium | | No blockers in VoiceOver iOS or NVDA; usable at 200% |

### Phase 3: SEO and content architecture

| ID | Action | Rationale | Affected | Priority | Depends on | Acceptance criteria |
|---|---|---|---|---|---|---|
| 3.1 | Move the LBSI guide from Bridge Road; 301 the old URL | One authoritative URL | New guide, Bridge Road | High | Bridge Road access | Old URL 301s here; cross-linked with back pain guide |
| 3.2 | Split `/bowling` into `/bowling/workload` and `/bowling/return-to-bowling` | One intent per URL | Bowling pages, sitemap | High | 2.4 | Each ranks for its own query; hub links both |
| 3.3 | `/bowling/junior-fast-bowlers` | Parents search for this | New page | High | Current CA guidelines checked | Every number verified against the CA document |
| 3.4 | `/cricket-injuries/side-strain` | Common bowling injury with no page | New page | Medium | | Guide template complete |
| 3.5 | `MedicalWebPage` schema on guides | Medical credibility signals | Guides | Medium | | Valid in the Rich Results Test |
| 3.6 | Related-content and author-box components | Internal linking and E-E-A-T | Guides | Medium | | Every guide has 3 related links and an author box |
| 3.7 | Per-page OG images generated at build | Better shares | Build, assets | Low | | Each product page and guide has its own OG image |
| 3.8 | Search Console and sitemap submission; 8-week keyword review | Targets need data | All | High | | Section 24.1 targets revised with real queries |

### Phase 4: authority content and resources

| ID | Action | Rationale | Affected | Priority | Depends on | Acceptance criteria |
|---|---|---|---|---|---|---|
| 4.1 | Add `/resources/clinicians`, `/resources/coaches` (the Journal itself was rebuilt in version 2) | Education audiences | Resources | Medium | | Each has at least three useful items |
| 4.2 | `/speaking` | Event organisers and media | New page | Medium | | Topics, bios in two lengths, headshot download |
| 4.3 | Mailing list with double opt-in | Build the audience | Resources, footer, privacy | Medium | 1.13 | Sign-up works; privacy updated |
| 4.4 | Guides: pre-season bowling, bowling shoulder, ankle | Complete the fast bowling cluster | New guides | Medium | 3.2 | Guide template, references, reviewed dates |
| 4.5 | Photography integrated site-wide | Brand carried by real images | Home, product pages, guides | High | 2.10 | Every hero on product pages has a genuine photo within budget |
| 4.6 | Case examples (de-identified, consented) | Proof without testimonials | `/teams`, guides | Medium | Consent | At least two published |
| 4.7 | Short exercise videos in guides | Show, not tell | Guides | Low | | Captioned, click to play, poster set |

### Phase 5: digital products and tools

| ID | Action | Rationale | Affected | Priority | Depends on | Acceptance criteria |
|---|---|---|---|---|---|---|
| 5.1 | Checkout for all tiers and upfront options; `/cricket-performance/welcome` | Remove manual payment | Product pages, API | High | 1.14 | `purchase_complete` fires; welcome page noindex |
| 5.2 | Stripe Customer Portal | Pauses and changes follow 17.3 rules | Accounts | Medium | 5.1 | Minimums and notice periods enforced |
| 5.3 | Onboarding questionnaire and consent flow | Brief's lead flow | App | High | Accounts | Consent recorded per player, withdrawable |
| 5.4 | Member and club dashboards on `app.` | Deliver the oversight promised | App | High | 5.3 | Players see only their data; staff only with consent |
| 5.5 | Education products via waitlist | Revenue beyond clinical hours | `/learn` | Low | 4.3 | Waitlist over 50 before building a course |
| 5.6 | One-off digital products (pre-season program, templates) | Low-touch revenue | Product pages | Low | 5.1 | Delivered by email automatically on purchase |

---

## 38. Final design-system specification

### 38.1 Tokens

```css
/* Brand, from the logo reversed for dark */
--teal #14ACAA; --teal-bright #3FD0CB; --teal-deep #0B6F6D; --grey #ADA7AC; --clay #CB7A55;

/* Surfaces, darkest first */
--bg #071012; --bg-2 #0A1618; --surface #0F1D20; --surface-2 #142629; --glass rgba(10,22,24,.72);

/* Text and lines */
--ink #F4F1EA; --text #C4CDCB; --muted #8E9C9A;
--line rgba(196,226,223,.10); --line-2 rgba(196,226,223,.18); --line-strong #627C80;

/* Semantic */
--link var(--teal); --link-hover var(--teal-bright); --accent var(--teal); --accent-wash rgba(20,172,170,.10);
--btn-fg #041012; --btn-grad linear-gradient(135deg, #1BB8B4 0%, #129E9B 55%, #0E8C89 100%);
--focus #F2B35B; --danger #FF8A73;

/* Effects */
--glow-teal radial-gradient(60% 60% at 50% 40%, rgba(20,172,170,.22), transparent 70%);
--shadow-2 0 30px 80px -30px rgba(0,0,0,.9), 0 0 0 1px var(--line);
--shadow-glow 0 0 0 1px rgba(20,172,170,.35), 0 20px 60px -20px rgba(20,172,170,.35);
--ease cubic-bezier(.2, .7, .2, 1);

/* Type */
--font-display "Instrument Serif"; --font-text "Manrope";

/* Space: 4 8 12 16 24 32 48 64 96 128 px */
--s1 .25rem  --s2 .5rem  --s3 .75rem  --s4 1rem  --s5 1.5rem
--s6 2rem    --s7 3rem   --s8 4rem    --s9 6rem  --s10 8rem

/* Layout */
--wrap 80rem; --measure 42rem; --gutter 1.25rem → 2rem (768px) → 3rem (1280px); --hdr 4.5rem;

/* Shape */
--radius 999px (buttons, chips, bylines); --radius-sm 10px (inputs); --radius-lg 20px (cards, images, tables);

color-scheme: dark;
```

### 38.2 Rules for components

| Element | Specification |
|---|---|
| Buttons | Pills; min height 52px; padding 15px 26px; Manrope 700 at 15.6px; primary uses `--btn-grad` with a teal glow and a sheen on hover; one primary per view; full width below 480px in heroes |
| Links | Teal, 1px underline at 0.2em offset; hover teal bright |
| Cards | `--surface` with a 1px `--line` or `--line-2` border, radius 20px, padding about 28px. Hover: border brightens, lift of 2 to 3px, spotlight on `.spot`. Featured tier: turning conic border plus a text flag |
| Tables | `--surface`, radius 20px; header row sticky under the site header; group rows in uppercase labels |
| Inputs | Min height 48px; `--surface`; 1px `--line-strong`; radius 10px; 16px text (prevents iOS zoom); focus adds a teal border and halo; invalid is a 2px danger border |
| Checkboxes | Native, `accent-color` teal |
| Icons | Inline SVG, `currentColor`. Used for menu, back to top and social links. The logo is an image, never an icon font |
| Images | `<picture>`, WebP plus JPEG, width and height set, radius 20px inline, 0 full-bleed; the build adds the cache-busting hash |
| Sections | Padding scales from about 56px on phones to 96px on desktop; alternate `--bg` and `--bg-2` (the `.band--stone` class now maps to `--bg-2`); at most one image band per page |
| Grid | Splits 5/7 or 6/6; cards 2, 3 or 4 across; tiers 3 |
| Motion | Hover transitions 150 to 400ms on `--ease`; reveals 900ms, staggered 80ms, once; pathway draw 1.6s; tier border turns every 8s; marquee loops slowly. Everything stops under reduced motion |
| Grain | Fractal-noise SVG at 4.5% opacity over the page from 768px |
| Z-index | Skip link 500, grain 400, progress 150, header 100, sticky CTA 95, back to top 90 |

### 38.3 Breakpoints

368px · 576px · 640px · 768px · 1024px · 1200px (nav) · 1280px. Mobile-first `min-width` queries, except the nav, stacked tables and tiny-screen tweaks, which use `max-width`.

### 38.4 Brand assets

| File | Size | Use |
|---|---|---|
| `assets/brand/logo-header.{webp,png}` | 396 × 150 | Header |
| `assets/brand/logo-full.{webp,png}` | 634 × 240 | Footer |
| `favicon.ico` | 16, 32, 48 | Browsers |
| `assets/brand/favicon-{16,32,48}.png` | | Browsers |
| `assets/apple-touch-icon.png` | 180 × 180 | iOS home screen |
| `assets/brand/icon-{192,512}.png`, `icon-maskable-512.png` | | Manifest, `Organization` logo |
| `site.webmanifest` | | Name, colours and icons |

All generated from the master logo in `cricket-logo/`, recoloured for dark. If an official reversed logo arrives, regenerate every file above from it.

---

## Appendix A. Persona check of the current build

Run on this branch at 390px and 1440px. "Pass" means the requirement holds in the build today; notes flag what still depends on a launch gate.

| Persona | Offer clear in 10 s | Tier difference obvious | Pricing easy to find | Exclusions clear | Next action obvious | No misleading medical language | Notes |
|---|---|---|---|---|---|---|---|
| Recreational cricketer with a recurring injury | Pass: selector row "I keep breaking down" | Pass: scenario names Performance | Pass | Pass: "Not included" on every card | Pass | Pass | |
| Fast bowler increasing pre-season load | Pass: "I am increasing my bowling" → `/bowling` | Pass | Pass | Pass | Pass: Start tracking your bowling | Pass: workload nuance stated | Depends on tool open sign-up (1.4 item 2) |
| Parent of a talented 16-year-old | Pass | Pass | Pass: junior table and FAQ | Pass | Pass: guardian fields appear under 18 | Pass | Junior guide is P3; junior upfront pricing undefined |
| Professional player with an existing S&C coach | Pass | Pass: Integrated "coordination across the support team" | Pass | Pass | Pass: Apply | Pass | FAQ "Do you replace my club physio or S&C coach?" answers the objection |
| International professional, overseas, wanting a second opinion (version 2) | Pass: home band, nav item "Professionals", `/professional-players` | n/a | Pass: consultation fees on `/telehealth`; Integrated on the players page | Pass: "Honest limits" and FAQ | Pass: Discuss your situation | Pass | Blocked by the pitch-side photo consent (1.4 item 12) |
| Club coach without a full-time physio | Pass: hero H1 says it | Pass: comparison table | Pass: from $5,000 in hero | Pass: "Not included" list | Pass: Discuss club support | Pass | |
| Club physio wanting cricket-specific support | Partial | n/a | n/a | n/a | Partial: routes via `/teams` or `/contact` | Pass | A clinician route is P2 (2.8) and P4 (4.1) |
| iPhone user | Pass: H1 four lines, CTA in first screen | Pass: tables regroup by feature | Pass | Pass | Pass: Book always in header; sticky product CTA | Pass | No horizontal scroll on tested pages; forms 16px so no zoom |

Also checked (Fact, version 2): forms validate and submit (mocked, all four types); analytics events fire; all internal links resolve (`qa.py`); no placeholder copy; lint clean; no JavaScript errors; no horizontal scroll at 390px on 20 pages; tablet layouts checked at 820px.

**Not checked:** real form delivery (needs `RESEND_API_KEY` on a deployment); real checkout (none exists); screen readers.

---

## Appendix B. Open questions log

| # | Question | Owner | Blocks |
|---|---|---|---|
| 1 | Which Essentials features are live? | Thihan | Launch |
| 2 | Is the workload tool open sign-up live? | Thihan | Launch |
| 3 | Telehealth injury triage price | Thihan | Essentials discount clarity |
| 4 | Confirm in-person fees match Bridge Road | Thihan | Member-rate table |
| 5 | GST treatment of memberships | Accountant | Price display |
| 6 | Private health position on membership fees | Thihan | FAQ |
| 7 | Junior upfront pricing | Thihan | Junior table |
| 8 | Club report consent practice | Thihan | Clubs page |
| 9 | Privacy policy review, APP 8 | Qualified reviewer | Launch |
| 10 | Indemnity for overseas telehealth | Insurer | Telehealth copy |
| 11 | Photography shoot (shot 10 delivered; shots 1 to 9 outstanding) | Thihan | P2 |
| 15 | FCRI permission for the crest visible in the portrait | Thihan | Low; before wider photo use |
| 12 | Master logo refresh: superseded. Version 2 uses the master logo, reversed for dark; confirm the reversal (1.4 item 16) | Thihan | Low |
| 13 | Role titles and years for `/about` | Thihan | P2 |
| 14 | Reference sites: notes received and applied (1.5); URLs welcome for a check | Thihan | Low |
| 16 | Written consent: Bangladesh player in the pitch-side photo, plus BCB for kit and sponsor marks | Thihan | Launch of `/professional-players` and home |
| 17 | Consent for the Italy gym photo (player and FCRI kit) | Thihan | Launch |
| 18 | Written permission for each of the eight organisation logos | Thihan | Launch of the home marquee |
| 19 | "15+ years in elite cricket" versus "elite sport, most of it cricket" (2.3) | Thihan | Accuracy of home and footer |
