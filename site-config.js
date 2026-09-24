/* ============================================================================
   The Cricket Physio — central site configuration
   ----------------------------------------------------------------------------
   ONE place to change the business details that appear in links across the
   site. Update this file, commit, and the site follows.

   Contact details are ALSO written into the HTML of every page, because search
   engines need them in the markup rather than injected by JavaScript. If you
   change a detail here, search this repo for the old value and change it there
   too.

   RELATED SITE: bridgeroad.physio has its own copy of this pattern in
   site-config.js. In-person appointments are booked there, not here. Keep the
   Halaxy URLs below in step with that file.
   ========================================================================== */

window.TCP = (function () {

  var cfg = {
    brand: 'The Cricket Physio',
    practitioner: 'Thihan Chandramohan',
    email: 'thihan@thecricket.physio',
    canonicalHost: 'https://www.thecricket.physio',

    /* --- The clinic where in-person appointments happen ------------------ *
       The Cricket Physio does not hold its own premises. Melbourne
       appointments are seen at Bridge Road Physiotherapy, and the booking is
       made on that site. Say so plainly wherever in-person work is mentioned:
       a patient should never be surprised about which door they walk through.
       NAP below mirrors bridgeroad.physio/site-config.js exactly. Do not
       publish a second, differing local-business identity for this address. */
    clinic: {
      name: 'Bridge Road Physiotherapy',
      street: '507 Bridge Road',
      suburb: 'Richmond',
      state: 'VIC',
      postcode: '3121',
      note: 'Inside Uplift Gym. No gym membership is needed.',
      phoneDisplay: '0458 007 583',
      phoneLink: 'tel:+61458007583',
      site: 'https://www.bridgeroad.physio'
    },

    /* --- Booking --------------------------------------------------------- *
       Every booking link leaves this domain. utm() below tags them so the
       Bridge Road analytics can tell a Cricket Physio referral from a local
       search. Never hand-write these URLs in the markup; call cfg.book(). */
    halaxy: {
      direct: 'https://www.halaxy.com/book/bridge-road-physiotherapy/location/1330449',
      widget: 'https://www.halaxy.com/book/widget/physiotherapist/mr-thihan-chandramohan/576911/1330449'
    },
    bridgeRoadBookPage: 'https://www.bridgeroad.physio/book.html',

    /* --- The bowling workload tool ---------------------------------------
       A separate product on its own subdomain. The basic version is free
       (ball-count logging and simple trends) and is the low-commitment next
       step across the site: "Start tracking your bowling". Paid memberships
       add history, soreness monitoring, alerts, dashboards and oversight.
       Membership prices live in data/offers.json, not here. */
    workloadTool: 'https://bowlingworkload.thecricket.physio',

    /* --- Professional profiles used as verifiable trust signals ----------- */
    links: {
      linkedin: 'https://www.linkedin.com/in/thihanchandramohan',
      instagram: 'https://www.instagram.com/thecricketphysio',
      smaFinder: 'https://sma.org.au/sports-healthcare-finder/'
    },

    /* AHPRA registration. Mirrors bridgeroad.physio. */
    ahpra: 'PHY0001614815'
  };

  /* --------------------------------------------------------------------- */
  /* Cross-domain attribution                                               */
  /* --------------------------------------------------------------------- */
  /* Tags links that LEAVE this domain for bridgeroad.physio or Halaxy, so a
     booking that started on the cricket brand is attributable.

     Deliberately NOT applied to internal links. Tagging same-site navigation
     restarts the session in most analytics tools and destroys the very
     attribution this is meant to collect. */
  cfg.utm = function (url, campaign) {
    if (!url || url.indexOf('http') !== 0) return url;
    if (url.indexOf('thecricket.physio') > -1) return url;   // never tag our own
    var join = url.indexOf('?') > -1 ? '&' : '?';
    return url + join +
      'utm_source=thecricketphysio' +
      '&utm_medium=referral' +
      '&utm_campaign=' + encodeURIComponent(campaign || 'cricket_physio');
  };

  cfg.book = function (campaign) { return cfg.utm(cfg.bridgeRoadBookPage, campaign); };

  /* --------------------------------------------------------------------- */
  /* Conversion tracking                                                    */
  /* --------------------------------------------------------------------- */
  /* No third-party tracker is loaded by this site. Any element carrying a
     data-track attribute fires a named event on click, pushed to
     window.dataLayer and dispatched as a DOM event. If analytics is added
     later it picks these up with no markup changes.

     Event names in use. Detail, where there is one, is in brackets.
       book_click                   Any link into the booking flow
       telehealth_click             Telehealth booking
       problem_select               Home page problem selector (href)
       find_level_click             "Find the right level of support"
       memberships_click            Any other link into /cricket-performance
       compare_click                "Compare memberships"
       membership_essentials_click  Join Essentials
       membership_performance_click Join Performance
       membership_integrated_apply  Apply for Integrated Performance
       checkout_start               A tier CTA that goes to checkout (tier)
       tier_card_view               Tier or club card half on screen (id)
       club_page_click              Link from elsewhere to club packages
       club_discuss_click           "Discuss club support"
       club_core_enquiry            Enquire about Club Core
       club_plus_enquiry            Enquire about Club Plus
       application_start            Player application: first interaction
       application_invalid          Blocked by validation (field name)
       application_complete         Player application sent (tier)
       application_error            Player application failed to send
       club_enquiry_start / _invalid / _complete / _error   Club form, same pattern
       team_enquiry_start / _invalid / _complete / _error   Team form, same pattern
       bowling_tool_click           Any link to the Bowling Workload Tool
       faq_open                     An FAQ answer opened (question)
       scroll_depth                 25, 50, 75, 100 per page view
       article_read                 Article scrolled past 75%
       phone_click / email_click / maps_click / bridgeroad_click
       theme_toggle                 Light/dark switched (new theme)

     Purchase completion happens on the payment provider. When checkout is
     connected, point its success URL at a page that fires purchase_complete.
  */

  cfg.track = function (action, detail) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'tcp_event', tcp_action: action, tcp_detail: detail || null });
      document.dispatchEvent(new CustomEvent('tcp:track', { detail: { action: action, detail: detail || null } }));
    } catch (e) { /* tracking must never block a booking or a phone call */ }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-track]') : null;
    if (el) cfg.track(el.getAttribute('data-track'), el.getAttribute('href'));
  });

  return cfg;
})();
