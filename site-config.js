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
       A separate product on its own subdomain. Access is by request, not open
       signup: say "request access", never "sign up free". */
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

     Event names in use:
       book_click            Any link into the Bridge Road booking flow
       telehealth_click      Telehealth booking or enquiry
       team_enquiry_submit   Team / organisation enquiry sent
       team_enquiry_error    Team enquiry failed to send
       team_enquiry_invalid  Blocked by inline validation; detail is the field
       tool_open             Bowling workload tool opened
       phone_click           Any tel: link
       email_click           Any mailto: link
       bridgeroad_click      Any outbound link to bridgeroad.physio
       article_read          Article scrolled past 75%
       theme_toggle          Light/dark switched; detail is the new theme      */

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

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.matches && f.matches('form[data-track]')) cfg.track(f.getAttribute('data-track'));
  });

  return cfg;
})();
