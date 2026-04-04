/**
 * Known cookie database — maps cookie names/patterns to categories and descriptions.
 *
 * Categories:
 *   necessary    — Essential for the site to function (session, auth, security, load balancing)
 *   functional   — Enhanced features, preferences, personalization (not strictly required)
 *   analytics    — Usage measurement, performance monitoring (Google Analytics, Hotjar, etc.)
 *   marketing    — Advertising, retargeting, cross-site tracking (Meta, Google Ads, LinkedIn, etc.)
 *
 * Each entry: { category, description, provider, maxDays? }
 *   maxDays = expected max lifetime; if actual expiry exceeds this, flag it.
 */

// Exact-match cookies (name === key)
export const EXACT = {

  // ── Google Analytics (GA4 + UA) ──────────────────────────────────────
  _ga:        { category: "analytics", provider: "Google Analytics", description: "Distinguishes unique users", maxDays: 730 },
  _ga_container: { category: "analytics", provider: "Google Analytics", description: "GA4 session state (container-specific)", maxDays: 730 },
  _gid:       { category: "analytics", provider: "Google Analytics", description: "Distinguishes users (24h)", maxDays: 1 },
  _gat:       { category: "analytics", provider: "Google Analytics", description: "Throttle request rate", maxDays: 1 },
  _gat_gtag:  { category: "analytics", provider: "Google Analytics", description: "Throttle request rate (gtag)", maxDays: 1 },
  __utma:     { category: "analytics", provider: "Google Analytics (UA)", description: "User tracking (legacy UA)", maxDays: 730 },
  __utmb:     { category: "analytics", provider: "Google Analytics (UA)", description: "Session tracking (legacy UA)", maxDays: 1 },
  __utmc:     { category: "analytics", provider: "Google Analytics (UA)", description: "Session tracking (legacy UA)", maxDays: 0 },
  __utmt:     { category: "analytics", provider: "Google Analytics (UA)", description: "Throttle rate (legacy UA)", maxDays: 1 },
  __utmz:     { category: "analytics", provider: "Google Analytics (UA)", description: "Traffic source (legacy UA)", maxDays: 180 },
  _gac:       { category: "marketing", provider: "Google Ads", description: "Campaign information for Google Ads", maxDays: 90 },

  // ── Google Ads / Conversion ──────────────────────────────────────────
  _gcl_au:    { category: "marketing", provider: "Google Ads", description: "Conversion linker (first-party)", maxDays: 90 },
  _gcl_aw:    { category: "marketing", provider: "Google Ads", description: "Google Ads click info", maxDays: 90 },
  _gcl_dc:    { category: "marketing", provider: "Google Ads", description: "DoubleClick/Floodlight click info", maxDays: 90 },
  _gcl_gb:    { category: "marketing", provider: "Google Ads", description: "Google Ads conversion (gbraid)", maxDays: 90 },
  _gcl_gs:    { category: "marketing", provider: "Google Ads", description: "Google Ads conversion (gclsrc)", maxDays: 90 },
  _gpc:       { category: "necessary", provider: "Browser", description: "Global Privacy Control signal", maxDays: 0 },
  _dc_gtm_UA: { category: "analytics", provider: "Google Tag Manager", description: "GTM throttle cookie", maxDays: 1 },

  // ── Google Consent Mode ──────────────────────────────────────────────
  __gads:     { category: "marketing", provider: "Google AdSense", description: "Ad serving and measurement", maxDays: 395 },
  __gpi:      { category: "marketing", provider: "Google Publisher", description: "Publisher ad optimization", maxDays: 395 },

  // ── Meta / Facebook ──────────────────────────────────────────────────
  _fbp:       { category: "marketing", provider: "Meta (Facebook)", description: "Browser ID for ad targeting", maxDays: 90 },
  _fbc:       { category: "marketing", provider: "Meta (Facebook)", description: "Click ID from Facebook ad", maxDays: 90 },
  fr:         { category: "marketing", provider: "Meta (Facebook)", description: "Ad delivery and measurement", maxDays: 90 },
  datr:       { category: "necessary", provider: "Meta (Facebook)", description: "Browser identification (security)", maxDays: 730 },
  sb:         { category: "necessary", provider: "Meta (Facebook)", description: "Browser identification (security)", maxDays: 730 },
  wd:         { category: "functional", provider: "Meta (Facebook)", description: "Screen dimensions", maxDays: 7 },

  // ── LinkedIn ─────────────────────────────────────────────────────────
  li_sugr:    { category: "marketing", provider: "LinkedIn", description: "Browser ID for ad targeting", maxDays: 90 },
  bcookie:    { category: "marketing", provider: "LinkedIn", description: "Browser ID cookie", maxDays: 730 },
  lidc:       { category: "functional", provider: "LinkedIn", description: "Data center selection", maxDays: 1 },
  UserMatchHistory: { category: "marketing", provider: "LinkedIn", description: "Ad targeting sync", maxDays: 30 },
  AnalyticsSyncHistory: { category: "analytics", provider: "LinkedIn", description: "Analytics sync tracking", maxDays: 30 },
  li_fat_id:  { category: "marketing", provider: "LinkedIn", description: "First-party ad tracking", maxDays: 30 },
  _li_ss:     { category: "marketing", provider: "LinkedIn", description: "Insight tag session", maxDays: 1 },
  li_giant:   { category: "marketing", provider: "LinkedIn", description: "Indirect identifier", maxDays: 7 },

  // ── Microsoft / Bing ─────────────────────────────────────────────────
  _uetsid:    { category: "marketing", provider: "Microsoft Ads (Bing)", description: "Session-level tracking", maxDays: 1 },
  _uetvid:    { category: "marketing", provider: "Microsoft Ads (Bing)", description: "Cross-session tracking", maxDays: 390 },
  MUID:       { category: "marketing", provider: "Microsoft", description: "Microsoft user ID", maxDays: 390 },
  _clck:      { category: "analytics", provider: "Microsoft Clarity", description: "User ID persistence", maxDays: 365 },
  _clsk:      { category: "analytics", provider: "Microsoft Clarity", description: "Session stitching", maxDays: 1 },
  CLID:       { category: "analytics", provider: "Microsoft Clarity", description: "Clarity user tracking", maxDays: 365 },

  // ── TikTok ───────────────────────────────────────────────────────────
  _ttp:       { category: "marketing", provider: "TikTok", description: "Tracking pixel ID", maxDays: 390 },
  _tt_enable_cookie: { category: "marketing", provider: "TikTok", description: "Cookie support check", maxDays: 390 },
  tt_pixel_session_index: { category: "marketing", provider: "TikTok", description: "Session tracking", maxDays: 0 },
  tt_sessionId: { category: "marketing", provider: "TikTok", description: "Session ID", maxDays: 0 },

  // ── Twitter / X ──────────────────────────────────────────────────────
  _twitter_sess: { category: "marketing", provider: "Twitter/X", description: "Session cookie", maxDays: 0 },
  personalization_id: { category: "marketing", provider: "Twitter/X", description: "Ad personalization", maxDays: 730 },
  muc_ads:    { category: "marketing", provider: "Twitter/X", description: "Ad tracking", maxDays: 730 },
  guest_id:   { category: "marketing", provider: "Twitter/X", description: "Guest identification", maxDays: 730 },

  // ── Pinterest ────────────────────────────────────────────────────────
  _pinterest_sess: { category: "marketing", provider: "Pinterest", description: "Session tracking", maxDays: 0 },
  _pin_unauth: { category: "marketing", provider: "Pinterest", description: "Unauthenticated user tracking", maxDays: 365 },
  _derived_epik: { category: "marketing", provider: "Pinterest", description: "Conversion tracking", maxDays: 365 },
  _epik:      { category: "marketing", provider: "Pinterest", description: "Pinterest tag click ID", maxDays: 365 },

  // ── HubSpot ──────────────────────────────────────────────────────────
  __hssc:     { category: "analytics", provider: "HubSpot", description: "Session tracking", maxDays: 1 },
  __hssrc:    { category: "analytics", provider: "HubSpot", description: "Session source", maxDays: 0 },
  __hstc:     { category: "analytics", provider: "HubSpot", description: "Visitor tracking", maxDays: 395 },
  hubspotutk: { category: "analytics", provider: "HubSpot", description: "Visitor identity", maxDays: 395 },
  __hs_opt_out: { category: "necessary", provider: "HubSpot", description: "Opt-out preference", maxDays: 395 },
  __hs_do_not_track: { category: "necessary", provider: "HubSpot", description: "Do-not-track flag", maxDays: 395 },
  __hs_cookie_cat_pref: { category: "necessary", provider: "HubSpot", description: "Cookie category preference", maxDays: 395 },
  messagesUtk: { category: "functional", provider: "HubSpot", description: "Chat widget identity", maxDays: 395 },

  // ── Hotjar ───────────────────────────────────────────────────────────
  _hjSessionUser: { category: "analytics", provider: "Hotjar", description: "User ID", maxDays: 365 },
  _hjSession:     { category: "analytics", provider: "Hotjar", description: "Session data", maxDays: 1 },
  _hjid:          { category: "analytics", provider: "Hotjar", description: "User ID (legacy)", maxDays: 365 },
  _hjFirstSeen:   { category: "analytics", provider: "Hotjar", description: "First session flag", maxDays: 1 },
  _hjIncludedInSessionSample: { category: "analytics", provider: "Hotjar", description: "Session sampling", maxDays: 1 },
  _hjAbsoluteSessionInProgress: { category: "analytics", provider: "Hotjar", description: "Active session flag", maxDays: 1 },
  _hjTLDTest:     { category: "analytics", provider: "Hotjar", description: "Top-level domain detection", maxDays: 0 },

  // ── Cloudflare ───────────────────────────────────────────────────────
  __cf_bm:        { category: "necessary", provider: "Cloudflare", description: "Bot management", maxDays: 1 },
  cf_clearance:   { category: "necessary", provider: "Cloudflare", description: "CAPTCHA clearance", maxDays: 1 },
  __cflb:         { category: "necessary", provider: "Cloudflare", description: "Load balancer sticky session", maxDays: 1 },
  __cfruid:       { category: "necessary", provider: "Cloudflare", description: "Rate limiting user ID", maxDays: 0 },

  // ── Stripe ───────────────────────────────────────────────────────────
  __stripe_mid:   { category: "necessary", provider: "Stripe", description: "Fraud prevention (machine ID)", maxDays: 365 },
  __stripe_sid:   { category: "necessary", provider: "Stripe", description: "Fraud prevention (session ID)", maxDays: 1 },

  // ── Cookie Consent Platforms ─────────────────────────────────────────
  CookieConsent:        { category: "necessary", provider: "Cookiebot", description: "Consent state", maxDays: 365 },
  CookieConsentBulkTicket: { category: "necessary", provider: "Cookiebot", description: "Bulk consent ID", maxDays: 365 },
  OptanonConsent:       { category: "necessary", provider: "OneTrust", description: "Consent preferences", maxDays: 365 },
  OptanonAlertBoxClosed: { category: "necessary", provider: "OneTrust", description: "Banner dismissed flag", maxDays: 365 },
  eupubconsent:         { category: "necessary", provider: "IAB TCF", description: "TCF consent string (v1)", maxDays: 365 },
  euconsent:            { category: "necessary", provider: "IAB TCF", description: "TCF consent string", maxDays: 365 },
  "euconsent-v2":       { category: "necessary", provider: "IAB TCF", description: "TCF v2 consent string", maxDays: 365 },
  cookieyes_consent:    { category: "necessary", provider: "CookieYes", description: "Consent preferences", maxDays: 365 },
  cookielawinfo_checkbox_necessary:    { category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Necessary consent", maxDays: 365 },
  cookielawinfo_checkbox_analytics:    { category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Analytics consent", maxDays: 365 },
  cookielawinfo_checkbox_advertisement:{ category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Marketing consent", maxDays: 365 },
  cookielawinfo_checkbox_functional:   { category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Functional consent", maxDays: 365 },
  viewed_cookie_policy: { category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Banner dismissed", maxDays: 365 },
  complianz_consent_status: { category: "necessary", provider: "Complianz", description: "Consent status", maxDays: 365 },
  cmplz_marketing:      { category: "necessary", provider: "Complianz", description: "Marketing consent", maxDays: 365 },
  cmplz_statistics:     { category: "necessary", provider: "Complianz", description: "Statistics consent", maxDays: 365 },
  cmplz_preferences:    { category: "necessary", provider: "Complianz", description: "Preferences consent", maxDays: 365 },
  cmplz_functional:     { category: "necessary", provider: "Complianz", description: "Functional consent", maxDays: 365 },

  // ── WordPress ────────────────────────────────────────────────────────
  wp_lang:    { category: "functional", provider: "WordPress", description: "Language preference", maxDays: 0 },

  // ── Shopify ──────────────────────────────────────────────────────────
  _shopify_s:  { category: "analytics", provider: "Shopify", description: "Session tracking", maxDays: 1 },
  _shopify_y:  { category: "analytics", provider: "Shopify", description: "User tracking", maxDays: 730 },
  _shopify_sa_t: { category: "analytics", provider: "Shopify", description: "Analytics referrer tracking", maxDays: 1 },
  _shopify_sa_p: { category: "analytics", provider: "Shopify", description: "Analytics page data", maxDays: 1 },
  cart_sig:    { category: "necessary", provider: "Shopify", description: "Cart signature", maxDays: 14 },
  cart_ts:     { category: "necessary", provider: "Shopify", description: "Cart timestamp", maxDays: 14 },
  cart_ver:    { category: "necessary", provider: "Shopify", description: "Cart version", maxDays: 14 },
  checkout_token: { category: "necessary", provider: "Shopify", description: "Checkout session token", maxDays: 1 },
  _tracking_consent: { category: "necessary", provider: "Shopify", description: "Tracking consent preferences", maxDays: 365 },

  // ── Common session / auth cookies ────────────────────────────────────
  JSESSIONID:   { category: "necessary", provider: "Java Application", description: "Java session ID", maxDays: 0 },
  PHPSESSID:    { category: "necessary", provider: "PHP", description: "PHP session ID", maxDays: 0 },
  "connect.sid":{ category: "necessary", provider: "Express.js", description: "Express session ID", maxDays: 0 },
  ASP_NET_SessionId: { category: "necessary", provider: "ASP.NET", description: "ASP.NET session ID", maxDays: 0 },
  "ASP.NET_SessionId": { category: "necessary", provider: "ASP.NET", description: "ASP.NET session ID", maxDays: 0 },
  laravel_session: { category: "necessary", provider: "Laravel", description: "Laravel session ID", maxDays: 0 },
  XSRF_TOKEN:   { category: "necessary", provider: "Web Framework", description: "CSRF protection token", maxDays: 0 },
  _csrf:        { category: "necessary", provider: "Web Framework", description: "CSRF protection token", maxDays: 0 },

  // ── Other common ─────────────────────────────────────────────────────
  _pk_id:       { category: "analytics", provider: "Matomo/Piwik", description: "Visitor ID", maxDays: 395 },
  _pk_ses:      { category: "analytics", provider: "Matomo/Piwik", description: "Session cookie", maxDays: 1 },
  _pk_ref:      { category: "analytics", provider: "Matomo/Piwik", description: "Referrer info", maxDays: 180 },
  amp_cookie_test: { category: "necessary", provider: "Amplitude", description: "Cookie support test", maxDays: 0 },
  intercom_id:  { category: "functional", provider: "Intercom", description: "User identity for chat", maxDays: 270 },
  intercom_session: { category: "functional", provider: "Intercom", description: "Chat session", maxDays: 7 },
  drift_aid:    { category: "functional", provider: "Drift", description: "Anonymous visitor ID", maxDays: 730 },
  drift_campaign_refresh: { category: "marketing", provider: "Drift", description: "Campaign targeting", maxDays: 1 },
  ajs_anonymous_id: { category: "analytics", provider: "Segment", description: "Anonymous user ID", maxDays: 365 },
  ajs_user_id: { category: "analytics", provider: "Segment", description: "User ID", maxDays: 365 },
};

// Prefix-match patterns (name.startsWith(prefix))
export const PREFIXES = [
  { prefix: "_ga_",    category: "analytics", provider: "Google Analytics (GA4)", description: "GA4 session state" },
  { prefix: "_gat_",   category: "analytics", provider: "Google Analytics", description: "Throttle rate" },
  { prefix: "_gac_",   category: "marketing", provider: "Google Ads", description: "Campaign info" },
  { prefix: "_gcl_",   category: "marketing", provider: "Google Ads", description: "Conversion linker" },
  { prefix: "_dc_gtm_",category: "analytics", provider: "Google Tag Manager", description: "GTM throttle" },
  { prefix: "_hj",     category: "analytics", provider: "Hotjar", description: "Session/behavior tracking" },
  { prefix: "mp_",     category: "analytics", provider: "Mixpanel", description: "Event tracking" },
  { prefix: "optimizelyEndUserId", category: "analytics", provider: "Optimizely", description: "A/B testing user ID" },
  { prefix: "optimizely", category: "analytics", provider: "Optimizely", description: "A/B testing" },
  { prefix: "_vis_opt_", category: "analytics", provider: "VWO", description: "A/B testing" },
  { prefix: "_vwo_",   category: "analytics", provider: "VWO", description: "A/B testing" },
  { prefix: "sc_",     category: "analytics", provider: "Snapchat", description: "Snap Pixel" },
  { prefix: "__adroll", category: "marketing", provider: "AdRoll", description: "Retargeting" },
  { prefix: "_shopify_", category: "analytics", provider: "Shopify", description: "Analytics/session" },
  { prefix: "cmplz_",  category: "necessary", provider: "Complianz", description: "Consent preference" },
  { prefix: "cookielawinfo_", category: "necessary", provider: "CookieYes/GDPR Plugin", description: "Consent preference" },
  { prefix: "wp-",     category: "functional", provider: "WordPress", description: "WordPress setting" },
  { prefix: "wordpress_", category: "necessary", provider: "WordPress", description: "Authentication" },
  { prefix: "intercom_", category: "functional", provider: "Intercom", description: "Chat widget" },
  { prefix: "_li_",    category: "marketing", provider: "LinkedIn", description: "Insight tracking" },
  { prefix: "_tt_",    category: "marketing", provider: "TikTok", description: "Pixel tracking" },
  { prefix: "tt_",     category: "marketing", provider: "TikTok", description: "Pixel tracking" },
];

// Domain-based classification (for third-party cookies identified by domain)
export const DOMAINS = {
  "doubleclick.net":    { category: "marketing", provider: "Google Ads (DoubleClick)" },
  "google-analytics.com": { category: "analytics", provider: "Google Analytics" },
  "googleadservices.com": { category: "marketing", provider: "Google Ads" },
  "googlesyndication.com": { category: "marketing", provider: "Google AdSense" },
  "googletagmanager.com": { category: "analytics", provider: "Google Tag Manager" },
  "facebook.com":       { category: "marketing", provider: "Meta (Facebook)" },
  "facebook.net":       { category: "marketing", provider: "Meta (Facebook)" },
  "fbcdn.net":          { category: "marketing", provider: "Meta (Facebook)" },
  "instagram.com":      { category: "marketing", provider: "Meta (Instagram)" },
  "linkedin.com":       { category: "marketing", provider: "LinkedIn" },
  "ads.linkedin.com":   { category: "marketing", provider: "LinkedIn Ads" },
  "bing.com":           { category: "marketing", provider: "Microsoft Ads (Bing)" },
  "bat.bing.com":       { category: "marketing", provider: "Microsoft Ads (Bing)" },
  "clarity.ms":         { category: "analytics", provider: "Microsoft Clarity" },
  "tiktok.com":         { category: "marketing", provider: "TikTok" },
  "twitter.com":        { category: "marketing", provider: "Twitter/X" },
  "t.co":               { category: "marketing", provider: "Twitter/X" },
  "pinterest.com":      { category: "marketing", provider: "Pinterest" },
  "hotjar.com":         { category: "analytics", provider: "Hotjar" },
  "hubspot.com":        { category: "analytics", provider: "HubSpot" },
  "hs-analytics.net":   { category: "analytics", provider: "HubSpot" },
  "hsforms.net":        { category: "functional", provider: "HubSpot Forms" },
  "intercom.io":        { category: "functional", provider: "Intercom" },
  "drift.com":          { category: "functional", provider: "Drift" },
  "segment.com":        { category: "analytics", provider: "Segment" },
  "segment.io":         { category: "analytics", provider: "Segment" },
  "mixpanel.com":       { category: "analytics", provider: "Mixpanel" },
  "amplitude.com":      { category: "analytics", provider: "Amplitude" },
  "fullstory.com":      { category: "analytics", provider: "FullStory" },
  "mouseflow.com":      { category: "analytics", provider: "Mouseflow" },
  "crazyegg.com":       { category: "analytics", provider: "Crazy Egg" },
  "optimizely.com":     { category: "analytics", provider: "Optimizely" },
  "vwo.com":            { category: "analytics", provider: "VWO" },
  "adroll.com":         { category: "marketing", provider: "AdRoll" },
  "criteo.com":         { category: "marketing", provider: "Criteo" },
  "criteo.net":         { category: "marketing", provider: "Criteo" },
  "taboola.com":        { category: "marketing", provider: "Taboola" },
  "outbrain.com":       { category: "marketing", provider: "Outbrain" },
  "snapchat.com":       { category: "marketing", provider: "Snapchat" },
  "sc-static.net":      { category: "marketing", provider: "Snapchat" },
  "nr-data.net":        { category: "analytics", provider: "New Relic" },
  "newrelic.com":       { category: "analytics", provider: "New Relic" },
  "sentry.io":          { category: "analytics", provider: "Sentry" },
  "cookiebot.com":      { category: "necessary", provider: "Cookiebot" },
  "onetrust.com":       { category: "necessary", provider: "OneTrust" },
  "cookieyes.com":      { category: "necessary", provider: "CookieYes" },
  "stripe.com":         { category: "necessary", provider: "Stripe" },
  "paypal.com":         { category: "necessary", provider: "PayPal" },
  "cloudflare.com":     { category: "necessary", provider: "Cloudflare" },
  "cloudflareinsights.com": { category: "analytics", provider: "Cloudflare Analytics" },
  "recaptcha.net":      { category: "necessary", provider: "Google reCAPTCHA" },
  "gstatic.com":        { category: "necessary", provider: "Google (static resources)" },
  "youtube.com":        { category: "marketing", provider: "YouTube (Google)" },
  "youtu.be":           { category: "marketing", provider: "YouTube (Google)" },
  "vimeo.com":          { category: "functional", provider: "Vimeo" },
  "typekit.net":        { category: "functional", provider: "Adobe Fonts" },
  "matomo.cloud":       { category: "analytics", provider: "Matomo" },
  "plausible.io":       { category: "analytics", provider: "Plausible" },
  "usefathom.com":      { category: "analytics", provider: "Fathom" },
};
