/* ============================================================================
   The Cricket Physio — team and organisation enquiry handler
   ----------------------------------------------------------------------------
   Receives the enquiry form and emails it through Resend. Runs as a Vercel
   Function, so enquiries are never stored by a third-party form service.
   Nothing is written to disk or to a database: the submission becomes an
   email and is then gone from here.

   This mirrors the handler on bridgeroad.physio. If you fix a bug in one,
   fix it in the other.

   REQUIRED environment variable, set in the Vercel dashboard:
     RESEND_API_KEY     from resend.com, starts with "re_"

   OPTIONAL, with the defaults below:
     ENQUIRY_TO         where enquiries land    (thihan@thecricket.physio)
     ENQUIRY_FROM       the verified sender
                        (The Cricket Physio <enquiries@thecricket.physio>)

   ENQUIRY_FROM must sit on a domain verified in Resend or the send is
   rejected. The sender's own address goes in Reply-To, so replying from the
   inbox goes straight back to them.

   No npm dependencies on purpose: this uses the global fetch built into the
   Node runtime, so the project needs no package.json and no build step.
   ========================================================================== */

const DEFAULT_TO   = 'thihan@thecricket.physio';
const DEFAULT_FROM = 'The Cricket Physio <enquiries@thecricket.physio>';
const MAX = { name: 120, email: 160, organisation: 160, message: 5000 };

/* An address pasted into a dashboard picks up things Resend will not accept:
   wrapping quotes, a non-breaking space from copying out of a web page, curly
   quotes, a stray newline. Resend answers with a bare "Invalid `from` field",
   which says nothing about which of those it was. Clean the common cases, and
   if what is left still does not look like an address, log it and fall back
   rather than failing every enquiry. */
function normaliseAddress(raw, fallback, label) {
  if (!raw) return fallback;
  let v = String(raw)
    .replace(/[   ]/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
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

/* Header injection guard: a newline in a header value lets an attacker append
   headers of their own. The message body is allowed newlines; nothing that
   lands in a header is. */
function headerSafe(v) { return v.replace(/[\r\n]+/g, ' '); }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
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

  const name  = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const org   = clean(body.organisation, MAX.organisation);
  const msg   = clean(body.message, MAX.message);

  if (!name || !email || !msg) return res.status(400).json({ error: 'Missing required fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('enquiry: RESEND_API_KEY is not set; enquiry not sent');
    return res.status(500).json({ error: 'Email is not configured' });
  }

  const to   = normaliseAddress(process.env.ENQUIRY_TO,   DEFAULT_TO,   'ENQUIRY_TO');
  const from = normaliseAddress(process.env.ENQUIRY_FROM, DEFAULT_FROM, 'ENQUIRY_FROM');

  const text =
    'Team / organisation enquiry from thecricket.physio\n\n' +
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'Organisation: ' + (org || 'not given') + '\n\n' +
    'Message:\n' + msg + '\n';

  const html =
    '<h2>Team / organisation enquiry</h2>' +
    '<p><strong>Name:</strong> ' + escapeHtml(name) + '<br>' +
    '<strong>Email:</strong> ' + escapeHtml(email) + '<br>' +
    '<strong>Organisation:</strong> ' + escapeHtml(org || 'not given') + '</p>' +
    '<p><strong>Message</strong></p><p>' + escapeHtml(msg).replace(/\n/g, '<br>') + '</p>' +
    '<hr><p style="color:#666;font-size:12px">Sent from the enquiry form on thecricket.physio</p>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,
        subject: headerSafe('Cricket Physio enquiry: ' + name + (org ? ' (' + org + ')' : '')),
        text: text,
        html: html
      })
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
