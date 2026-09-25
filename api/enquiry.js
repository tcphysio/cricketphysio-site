/* ============================================================================
   The Cricket Physio — enquiry handler
   ----------------------------------------------------------------------------
   Receives the site's three forms and emails each one through Resend:
     team    team and organisation enquiry          (/teams)
     pro     professional player enquiry            (/professional-players)
     player  player membership application          (/cricket-performance/players)
     club    club and academy package enquiry       (/cricket-performance/clubs)

   The form says which it is in a hidden `form` field. Anything without one is
   treated as a team enquiry, so older cached pages keep working.

   Runs as a Vercel Function, so submissions are never stored by a third-party
   form service. Nothing is written to disk or to a database: the submission
   becomes an email and is then gone from here. Player applications carry
   health information, collected with the consent box on the form; the
   privacy policy names Resend as the service that relays the email.

   This mirrors the handler on bridgeroad.physio. If you fix a bug in the
   shared parts (address cleaning, header safety), fix it in the other.

   REQUIRED environment variable, set in the Vercel dashboard:
     RESEND_API_KEY     from resend.com, starts with "re_"

   OPTIONAL, with the defaults below:
     ENQUIRY_TO         where enquiries land    (thihan@thecricket.physio)
     ENQUIRY_FROM       the verified sender
                        (The Cricket Physio <enquiries@thecricket.physio>)

   ENQUIRY_FROM must sit on a domain verified in Resend or the send is
   rejected. The sender's own address goes in Reply-To.

   No npm dependencies on purpose: this uses the global fetch built into the
   Node runtime, so the project needs no package.json and no build step.
   ========================================================================== */

const DEFAULT_TO   = 'thihan@thecricket.physio';
const DEFAULT_FROM = 'The Cricket Physio <enquiries@thecricket.physio>';

/* Each form: the fields accepted (name, label, max length), the ones that
   must be present, a title for the email and a subject line. Fields not
   listed here are dropped, whatever the browser sends. */
const TIER_NAMES = { essentials: 'Essentials', performance: 'Performance', integrated: 'Integrated Performance', unsure: 'Not sure yet' };
const PACKAGE_NAMES = { 'club-core': 'Club Core', 'club-plus': 'Club Plus', unsure: 'Not sure yet' };

const FORMS = {
  team: {
    title: 'Team / organisation enquiry',
    fields: [
      ['name', 'Name', 120], ['email', 'Email', 160], ['organisation', 'Organisation', 160], ['message', 'Message', 5000]
    ],
    required: ['name', 'email', 'message'],
    subject: d => 'Cricket Physio enquiry: ' + d.name + (d.organisation ? ' (' + d.organisation + ')' : '')
  },
  player: {
    title: 'Player membership application',
    fields: [
      ['membership', 'Preferred membership', 40], ['name', 'Name', 120], ['email', 'Email', 160], ['phone', 'Phone', 40],
      ['age', 'Age', 3], ['location', 'Location', 160], ['guardian_name', 'Parent or guardian', 120],
      ['guardian_email', 'Parent or guardian email', 160], ['level', 'Playing level', 80], ['role', 'Playing role', 80],
      ['club', 'Club', 160], ['bowling_status', 'Current bowling status', 80], ['injury_status', 'Current injury status', 80],
      ['injury', 'Current injury', 2000], ['reason', 'Main reason for joining', 3000], ['support_team', 'Current support team', 200],
      ['other', 'Anything else', 3000], ['consent', 'Consent to collect health information', 3]
    ],
    required: ['membership', 'name', 'email', 'age', 'location', 'level', 'role', 'injury_status', 'reason', 'consent'],
    subject: d => 'Membership application: ' + (TIER_NAMES[d.membership] || d.membership) + ', ' + d.name + (Number(d.age) < 18 ? ' (under 18)' : ''),
    check: d => {
      if (d.consent !== 'yes') return 'Consent not given';
      if (!/^\d{1,3}$/.test(d.age)) return 'Invalid age';
      if (Number(d.age) < 18 && (!d.guardian_name || !d.guardian_email)) return 'Parent or guardian details required';
      if (d.guardian_email && !EMAIL.test(d.guardian_email)) return 'Invalid guardian email';
      return null;
    }
  },
  pro: {
    title: 'Professional player enquiry',
    fields: [
      ['name', 'Name', 120], ['email', 'Email', 160], ['phone', 'Phone or WhatsApp', 40], ['team', 'Team or contract', 160],
      ['contact_via', 'Preferred contact', 80], ['manager_ok', 'Manager or agent may be contacted', 3], ['message', 'What is going on', 5000],
      ['consent', 'Consent to collect health information', 3]
    ],
    required: ['name', 'email', 'message', 'consent'],
    subject: d => 'Professional player enquiry: ' + d.name + (d.team ? ' (' + d.team + ')' : ''),
    check: d => (d.consent !== 'yes' ? 'Consent not given' : null)
  },
  club: {
    title: 'Club package enquiry',
    fields: [
      ['package', 'Preferred package', 40], ['club', 'Club or academy', 160], ['competition', 'Competition level', 80],
      ['squad_size', 'Squad size', 4], ['fast_bowlers', 'Fast bowlers', 4], ['name', 'Contact person', 120],
      ['contact_role', 'Role', 120], ['email', 'Email', 160], ['phone', 'Phone', 40],
      ['current_support', 'Current medical and S&C support', 2000], ['problems', 'What they want help with', 5000],
      ['start_date', 'Preferred start date', 80]
    ],
    required: ['club', 'competition', 'squad_size', 'name', 'contact_role', 'email', 'problems'],
    subject: d => 'Club enquiry: ' + d.club + ', ' + (PACKAGE_NAMES[d.package] || 'package not chosen')
  }
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* An address pasted into a dashboard picks up things Resend will not accept:
   wrapping quotes, a non-breaking space, curly quotes, a stray newline. Clean
   the common cases; if what is left still does not look like an address, log
   it and fall back rather than failing every enquiry. */
function normaliseAddress(raw, fallback, label) {
  if (!raw) return fallback;
  let v = String(raw)
    .replace(/[   ]/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim();
  const bare  = /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/;
  const named = /^(.+?)\s*<\s*([^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+)\s*>$/;
  if (bare.test(v)) return v;
  const m = v.match(named);
  if (m) {
    const display = m[1].replace(/^["']|["']$/g, '').trim();
    return display ? display + ' <' + m[2] + '>' : m[2];
  }
  console.error('enquiry: ' + label + ' is not a usable address, falling back. Got:', JSON.stringify(v));
  return fallback;
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\r\n/g, '\n').trim().slice(0, max);
}

/* Header injection guard: nothing that lands in a header keeps a newline. */
function headerSafe(v) { return v.replace(/[\r\n]+/g, ' '); }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Bad request' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Bad request' });

  /* Honeypot. A real person leaves this empty; a bot fills every field.
     Answer 200 so the bot learns nothing and does not retune. */
  if (clean(body.company, 50)) return res.status(200).json({ ok: true });

  const type = Object.prototype.hasOwnProperty.call(FORMS, body.form) ? body.form : 'team';
  const spec = FORMS[type];

  const d = {};
  for (const [key, , max] of spec.fields) d[key] = clean(body[key], max);

  for (const key of spec.required) {
    if (!d[key]) return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!EMAIL.test(d.email)) return res.status(400).json({ error: 'Invalid email' });
  if (spec.check) {
    const problem = spec.check(d);
    if (problem) return res.status(400).json({ error: problem });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('enquiry: RESEND_API_KEY is not set; enquiry not sent');
    return res.status(500).json({ error: 'Email is not configured' });
  }

  const to   = normaliseAddress(process.env.ENQUIRY_TO,   DEFAULT_TO,   'ENQUIRY_TO');
  const from = normaliseAddress(process.env.ENQUIRY_FROM, DEFAULT_FROM, 'ENQUIRY_FROM');

  const display = (k, v) => k === 'membership' ? (TIER_NAMES[v] || v) : k === 'package' ? (PACKAGE_NAMES[v] || v) : v;
  const rows = spec.fields.filter(([k]) => d[k]).map(([k, label]) => [label, display(k, d[k])]);
  const received = new Date().toISOString();

  const text = spec.title + ' from thecricket.physio\n\n' +
    rows.map(([l, v]) => (v.indexOf('\n') > -1 ? l + ':\n' + v + '\n' : l + ': ' + v)).join('\n') +
    '\n\nReceived ' + received + '\n';

  const html = '<h2>' + escapeHtml(spec.title) + '</h2><table cellpadding="6" style="border-collapse:collapse">' +
    rows.map(([l, v]) => '<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">' + escapeHtml(l) +
      '</th><td style="border-bottom:1px solid #ddd">' + escapeHtml(v).replace(/\n/g, '<br>') + '</td></tr>').join('') +
    '</table><p style="color:#666;font-size:12px">Received ' + received + ' from the ' + type + ' form on thecricket.physio</p>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: headerSafe(spec.subject(d)), text, html })
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('enquiry: Resend rejected the send', r.status, detail);
      return res.status(502).json({ error: 'Could not send' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('enquiry: send failed', err);
    return res.status(502).json({ error: 'Could not send' });
  }
}
