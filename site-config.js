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
   site-config.js. In-person consults are booked on the Bridge Road calendar.
   Keep the cricket consult link below in step with that clinic's Halaxy setup.
   ========================================================================== */

window.TCP = (function () {

  var cfg = {
    brand: 'The Cricket Physio',
    practitioner: 'Thihan Chandramohan',
    email: 'thihan@thecricket.physio',
    canonicalHost: 'https://www.thecricket.physio',

    /* --- Where in-person consults happen --------------------------------- *
       The Cricket Physio has no premises and no address of its own. In-person
       consults happen at Bridge Road Physiotherapy in Richmond, and that
       clinic's site and Google Business Profile carry the one street address.
       Do not publish it here: a second listing for the same address confuses
       local search and makes the cricket brand look like a second clinic.

       Bridge Road is named in four places only, as the brief sets out: the
       Home line under the players door, the Players booking section, one
       sentence on About, and the footer line. Privacy and Terms also name
       it, because it holds the in-person clinical records. lint.py enforces
       this. Each approved spot carries a data-br-spot attribute. */
    clinic: {
      name: 'Bridge Road Physiotherapy',
      suburb: 'Richmond',
      state: 'VIC',
      site: 'https://www.bridgeroad.physio'
    },

    /* --- Booking --------------------------------------------------------- *
       Two Halaxy calendars, two booking links, as the brief sets out.

         telehealth    The Cricket Physio's own telehealth calendar.
         bridgeRoad    The "cricket consult" service on the Bridge Road
                       calendar, for in-person consults in Richmond.

       Both are placeholders until Thihan sends the links. When they arrive,
       search the repo for TODO_TELEHEALTH_URL and TODO_BRIDGE_ROAD_CRICKET_URL
       and replace every instance: the markup carries the real href so the
       buttons work with JavaScript off.

       Links that leave this domain carry data-utm; script.js tags them at
       load with utm() below. The placeholders are not http links, so they
       stay untagged until the real URLs go in. */
    booking: {
      telehealth: 'TODO_TELEHEALTH_URL',
      bridgeRoad: 'TODO_BRIDGE_ROAD_CRICKET_URL'
    },

    /* --- The bowling workload tool ---------------------------------------
       A separate product on its own subdomain. Access is by request, not open
       signup: say "request access", never "sign up free". */
    workloadTool: 'https://bowlingworkload.thecricket.physio',

    /* --- Professional profiles used as verifiable trust signals ----------- */
    links: {
      linkedin: 'https://www.linkedin.com/in/thihanchandramohan',
      instagram: 'https://www.instagram.com/thecricketphysio',
      ahpraRegister: 'https://www.ahpra.gov.au/registration/registers-of-practitioners.aspx'
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

  /* --------------------------------------------------------------------- */
  /* Conversion tracking                                                    */
  /* --------------------------------------------------------------------- */
  /* No third-party tracker is loaded yet. Every booking and enquiry element
     carries two attributes:

       data-track            the event, from the list below
       data-track-location   where it sits, for example header, footer,
                             players_booking, org_hero

     A click pushes one object to window.dataLayer and dispatches a DOM event:

       { event: 'tcp_event', tcp_action, tcp_location, tcp_detail }

     tcp_detail is data-track-detail when set, otherwise the link's href.
     When Google Tag Manager arrives: one Custom Event trigger on tcp_event,
     and three Data Layer Variables for tcp_action, tcp_location and
     tcp_detail. No markup changes needed.

     Event names in use:
       book_telehealth       Book telehealth button (Players)
       book_bridge_road      Any link to the Bridge Road cricket booking page
                             (Players, Home line, About sentence, footer)
       book_route            A link that takes a player to the booking pair
                             on /players (guides, Contact, 404)
       enquiry_scoping_call  Book a scoping call (Organisations)
       enquiry_click         Any other link to the Contact form
       enquiry_submit        Contact form sent; detail is the "I am a" value
       enquiry_invalid       Blocked by inline validation; detail is the field
       enquiry_error         Contact form failed to send; detail is the error
       door_click            The three doors on Home; detail names the door
       email_click           Any mailto: link
       bridgeroad_click      Any other outbound link to bridgeroad.physio
       tool_open             Bowling workload tool opened
       article_read          Article scrolled past 75%
       theme_toggle          Light/dark switched; detail is the new theme

     lint.py fails the build on any booking or enquiry link that is missing
     either attribute. */

  cfg.track = function (action, detail, location) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'tcp_event',
        tcp_action: action,
        tcp_location: location || null,
        tcp_detail: detail || null
      });
      document.dispatchEvent(new CustomEvent('tcp:track', {
        detail: { action: action, location: location || null, detail: detail || null }
      }));
    } catch (e) { /* tracking must never block a booking or an enquiry */ }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('a[data-track], button[data-track]') : null;
    if (!el) return;
    cfg.track(
      el.getAttribute('data-track'),
      el.getAttribute('data-track-detail') || el.getAttribute('href'),
      el.getAttribute('data-track-location')
    );
  });

  /* Forms marked data-enquiry report their own outcome from script.js
     (sent, invalid or failed), so a submit attempt alone is not counted. */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.matches && f.matches('form[data-track]:not([data-enquiry])')) {
      cfg.track(f.getAttribute('data-track'), null, f.getAttribute('data-track-location'));
    }
  });

  return cfg;
})();
