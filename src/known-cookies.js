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

  // ── Other analytics ─────────────────────────────────────────────────
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

  // ── Heap ──────────────────────────────────────────────────────────────
  _hp2_id:      { category: "analytics", provider: "Heap", description: "User identity", maxDays: 395 },
  _hp2_ses_props: { category: "analytics", provider: "Heap", description: "Session properties", maxDays: 1 },
  _hp2_props:   { category: "analytics", provider: "Heap", description: "Event properties", maxDays: 395 },
  _hp2_hld:     { category: "analytics", provider: "Heap", description: "Cross-domain tracking hold", maxDays: 1 },

  // ── PostHog ───────────────────────────────────────────────────────────
  ph_phc:       { category: "analytics", provider: "PostHog", description: "User identity", maxDays: 365 },

  // ── Pendo ─────────────────────────────────────────────────────────────
  _pendo_visitorId: { category: "analytics", provider: "Pendo", description: "Visitor ID", maxDays: 730 },
  _pendo_accountId: { category: "analytics", provider: "Pendo", description: "Account ID", maxDays: 730 },
  _pendo_meta:  { category: "analytics", provider: "Pendo", description: "Metadata", maxDays: 730 },

  // ── FullStory ─────────────────────────────────────────────────────────
  fs_uid:       { category: "analytics", provider: "FullStory", description: "User identity", maxDays: 365 },
  fs_lua:       { category: "analytics", provider: "FullStory", description: "Last user activity", maxDays: 365 },

  // ── Amplitude ─────────────────────────────────────────────────────────
  amp_deviceId: { category: "analytics", provider: "Amplitude", description: "Device identifier", maxDays: 365 },
  AMP_MKTG_:    { category: "marketing", provider: "Amplitude", description: "Marketing attribution", maxDays: 365 },

  // ── Snowplow ──────────────────────────────────────────────────────────
  sp:           { category: "analytics", provider: "Snowplow", description: "Session cookie", maxDays: 1 },
  _sp_id:       { category: "analytics", provider: "Snowplow", description: "Domain user ID", maxDays: 730 },
  _sp_ses:      { category: "analytics", provider: "Snowplow", description: "Session cookie", maxDays: 1 },

  // ── Mouseflow ─────────────────────────────────────────────────────────
  mf_user:      { category: "analytics", provider: "Mouseflow", description: "User identity", maxDays: 90 },
  mf_:          { category: "analytics", provider: "Mouseflow", description: "Session data", maxDays: 1 },

  // ── Lucky Orange ──────────────────────────────────────────────────────
  _lo_u:        { category: "analytics", provider: "Lucky Orange", description: "User identity", maxDays: 365 },
  _lo_v:        { category: "analytics", provider: "Lucky Orange", description: "Visit tracking", maxDays: 1 },

  // ── Reddit ────────────────────────────────────────────────────────────
  _rdt_uuid:    { category: "marketing", provider: "Reddit", description: "User tracking for ad attribution", maxDays: 90 },
  rdt_em:       { category: "marketing", provider: "Reddit", description: "Hashed email for ad matching", maxDays: 90 },

  // ── Quora ─────────────────────────────────────────────────────────────
  q_pix:        { category: "marketing", provider: "Quora", description: "Pixel tracking", maxDays: 90 },

  // ── Amazon ────────────────────────────────────────────────────────────
  "ad-id":      { category: "marketing", provider: "Amazon Ads", description: "Ad tracking identifier", maxDays: 230 },
  "ad-privacy": { category: "necessary", provider: "Amazon Ads", description: "Ad privacy preferences", maxDays: 395 },
  "session-id": { category: "necessary", provider: "Amazon", description: "Session identifier", maxDays: 730 },
  "ubid-main":  { category: "necessary", provider: "Amazon", description: "Browser identity", maxDays: 730 },
  "i18n-prefs":  { category: "functional", provider: "Amazon", description: "Internationalization preferences", maxDays: 365 },

  // ── Yahoo / Oath ──────────────────────────────────────────────────────
  A3:           { category: "marketing", provider: "Yahoo", description: "Ad targeting ID", maxDays: 365 },
  B:            { category: "functional", provider: "Yahoo", description: "Browser identification", maxDays: 365 },

  // ── Salesforce / Pardot ───────────────────────────────────────────────
  visitor_id:   { category: "marketing", provider: "Salesforce Pardot", description: "Visitor tracking ID", maxDays: 365 },
  pardot:       { category: "marketing", provider: "Salesforce Pardot", description: "Session cookie", maxDays: 0 },
  lpv:          { category: "analytics", provider: "Salesforce Pardot", description: "Landing page views", maxDays: 1 },

  // ── Adobe ─────────────────────────────────────────────────────────────
  AMCV_:        { category: "analytics", provider: "Adobe Experience Cloud", description: "Visitor ID", maxDays: 730 },
  AMCVS_:       { category: "analytics", provider: "Adobe Experience Cloud", description: "Session indicator", maxDays: 0 },
  s_cc:         { category: "analytics", provider: "Adobe Analytics", description: "Cookie support check", maxDays: 0 },
  s_sq:         { category: "analytics", provider: "Adobe Analytics", description: "Previous link click data", maxDays: 0 },
  s_vi:         { category: "analytics", provider: "Adobe Analytics", description: "Visitor ID", maxDays: 730 },
  s_fid:        { category: "analytics", provider: "Adobe Analytics", description: "Fallback visitor ID", maxDays: 730 },
  s_nr:         { category: "analytics", provider: "Adobe Analytics", description: "New/repeat visitor flag", maxDays: 730 },
  s_ppv:        { category: "analytics", provider: "Adobe Analytics", description: "Page view percentage", maxDays: 0 },
  mbox:         { category: "marketing", provider: "Adobe Target", description: "A/B testing session", maxDays: 730 },
  at_check:     { category: "marketing", provider: "Adobe Target", description: "Cookie support test", maxDays: 0 },
  demdex:       { category: "marketing", provider: "Adobe Audience Manager", description: "Cross-domain ID", maxDays: 180 },

  // ── Baidu ─────────────────────────────────────────────────────────────
  BAIDUID:      { category: "marketing", provider: "Baidu", description: "User identifier", maxDays: 365 },
  BIDUPSID:     { category: "marketing", provider: "Baidu", description: "Persistent identifier", maxDays: 365 },
  Hm_lvt_:      { category: "analytics", provider: "Baidu Analytics", description: "Visit timestamp", maxDays: 365 },
  Hm_lpvt_:     { category: "analytics", provider: "Baidu Analytics", description: "Page view timestamp", maxDays: 0 },

  // ── Yandex ────────────────────────────────────────────────────────────
  _ym_uid:      { category: "analytics", provider: "Yandex Metrica", description: "User identity", maxDays: 365 },
  _ym_d:        { category: "analytics", provider: "Yandex Metrica", description: "First visit date", maxDays: 365 },
  _ym_isad:     { category: "analytics", provider: "Yandex Metrica", description: "Ad blocker detection", maxDays: 1 },
  _ym_visorc:   { category: "analytics", provider: "Yandex Metrica", description: "Session replay", maxDays: 1 },
  yandexuid:    { category: "marketing", provider: "Yandex", description: "User identifier", maxDays: 365 },

  // ── PayPal ────────────────────────────────────────────────────────────
  ts:           { category: "necessary", provider: "PayPal", description: "Security token", maxDays: 0 },
  x_pp_s:       { category: "necessary", provider: "PayPal", description: "Session cookie", maxDays: 0 },
  tsrce:        { category: "necessary", provider: "PayPal", description: "Traffic source", maxDays: 0 },
  nsid:         { category: "necessary", provider: "PayPal", description: "Session identifier", maxDays: 0 },

  // ── Auth0 ─────────────────────────────────────────────────────────────
  auth0:        { category: "necessary", provider: "Auth0", description: "Authentication session", maxDays: 0 },
  "auth0.is.authenticated": { category: "necessary", provider: "Auth0", description: "Authentication state flag", maxDays: 1 },
  did:          { category: "necessary", provider: "Auth0", description: "Device identifier", maxDays: 365 },
  did_compat:   { category: "necessary", provider: "Auth0", description: "Device ID compatibility", maxDays: 365 },

  // ── Supabase ──────────────────────────────────────────────────────────
  "sb-access-token": { category: "necessary", provider: "Supabase", description: "Access token", maxDays: 0 },
  "sb-refresh-token": { category: "necessary", provider: "Supabase", description: "Refresh token", maxDays: 0 },

  // ── WooCommerce ───────────────────────────────────────────────────────
  woocommerce_cart_hash: { category: "necessary", provider: "WooCommerce", description: "Cart contents hash", maxDays: 0 },
  woocommerce_items_in_cart: { category: "necessary", provider: "WooCommerce", description: "Items in cart flag", maxDays: 0 },
  wp_woocommerce_session_: { category: "necessary", provider: "WooCommerce", description: "Session identifier", maxDays: 2 },
  wc_cart_created: { category: "necessary", provider: "WooCommerce", description: "Cart creation timestamp", maxDays: 0 },

  // ── Magento ───────────────────────────────────────────────────────────
  PHPSESSID_MAGE: { category: "necessary", provider: "Magento", description: "Session ID", maxDays: 0 },
  form_key:     { category: "necessary", provider: "Magento", description: "Form key for CSRF", maxDays: 0 },
  mage_cache_storage: { category: "necessary", provider: "Magento", description: "Cache storage", maxDays: 0 },
  mage_cache_sessid: { category: "necessary", provider: "Magento", description: "Cache session ID", maxDays: 0 },

  // ── Consent platforms (additional) ────────────────────────────────────
  usprivacy:    { category: "necessary", provider: "IAB US Privacy", description: "US Privacy/CCPA consent string", maxDays: 365 },
  _iub_cs:      { category: "necessary", provider: "iubenda", description: "Consent state", maxDays: 365 },
  _iub_cs_s:    { category: "necessary", provider: "iubenda", description: "Consent state (session)", maxDays: 0 },
  uc_user_interaction: { category: "necessary", provider: "Usercentrics", description: "User interaction recorded", maxDays: 365 },
  uc_settings:  { category: "necessary", provider: "Usercentrics", description: "Consent settings", maxDays: 365 },
  moove_gdpr_popup: { category: "necessary", provider: "Moove GDPR", description: "Consent popup state", maxDays: 365 },
  tarteaucitron: { category: "necessary", provider: "Tarteaucitron", description: "Cookie consent preferences", maxDays: 365 },
  klaro:        { category: "necessary", provider: "Klaro", description: "Consent preferences", maxDays: 365 },
  cc_cookie:    { category: "necessary", provider: "Cookie Consent (Osano)", description: "Consent state", maxDays: 365 },
  borlabs_cookie: { category: "necessary", provider: "Borlabs Cookie", description: "Consent preferences", maxDays: 365 },

  // ── Akamai ────────────────────────────────────────────────────────────
  AKA_A2:       { category: "necessary", provider: "Akamai", description: "Adaptive acceleration", maxDays: 1 },
  "RT":         { category: "necessary", provider: "Akamai mPulse", description: "Real user monitoring", maxDays: 7 },
  ak_bmsc:      { category: "necessary", provider: "Akamai", description: "Bot management", maxDays: 1 },
  bm_sv:        { category: "necessary", provider: "Akamai", description: "Bot management session", maxDays: 1 },
  bm_sz:        { category: "necessary", provider: "Akamai", description: "Bot management security", maxDays: 1 },

  // ── Fastly ────────────────────────────────────────────────────────────
  fastly_region: { category: "necessary", provider: "Fastly", description: "CDN region selection", maxDays: 0 },

  // ── Imperva / Incapsula ───────────────────────────────────────────────
  visid_incap_: { category: "necessary", provider: "Imperva Incapsula", description: "Visitor ID for security", maxDays: 365 },
  incap_ses_:   { category: "necessary", provider: "Imperva Incapsula", description: "Security session", maxDays: 0 },
  nlbi_:        { category: "necessary", provider: "Imperva Incapsula", description: "Load balancing", maxDays: 0 },

  // ── Zendesk ───────────────────────────────────────────────────────────
  _zendesk_session: { category: "functional", provider: "Zendesk", description: "Support session", maxDays: 0 },
  _zendesk_shared_session: { category: "functional", provider: "Zendesk", description: "Shared session", maxDays: 0 },
  _zendesk_cookie: { category: "functional", provider: "Zendesk", description: "Cookie preferences", maxDays: 365 },
  ZD_suid:      { category: "functional", provider: "Zendesk", description: "Session user ID", maxDays: 0 },

  // ── Freshworks (Freshdesk/Freshchat) ──────────────────────────────────
  _fw_crm_v:    { category: "functional", provider: "Freshworks", description: "CRM visitor identity", maxDays: 365 },

  // ── LiveChat ──────────────────────────────────────────────────────────
  __lc_cid:     { category: "functional", provider: "LiveChat", description: "Customer ID", maxDays: 730 },
  __lc_cst:     { category: "functional", provider: "LiveChat", description: "Chat state", maxDays: 730 },
  __lc2_cid:    { category: "functional", provider: "LiveChat", description: "Customer ID (v2)", maxDays: 730 },
  __lc2_cst:    { category: "functional", provider: "LiveChat", description: "Chat state (v2)", maxDays: 730 },

  // ── Tawk.to ───────────────────────────────────────────────────────────
  TawkConnectionTime: { category: "functional", provider: "Tawk.to", description: "Connection timestamp", maxDays: 0 },
  __tawkuuid:   { category: "functional", provider: "Tawk.to", description: "Visitor identity", maxDays: 180 },

  // ── Crisp ─────────────────────────────────────────────────────────────
  crisp_client: { category: "functional", provider: "Crisp", description: "Chat client session", maxDays: 180 },

  // ── Calendly ──────────────────────────────────────────────────────────
  calendly_session: { category: "functional", provider: "Calendly", description: "Scheduling session", maxDays: 0 },

  // ── reCAPTCHA / hCaptcha ──────────────────────────────────────────────
  _GRECAPTCHA:  { category: "necessary", provider: "Google reCAPTCHA", description: "reCAPTCHA verification", maxDays: 180 },
  h_captcha:    { category: "necessary", provider: "hCaptcha", description: "CAPTCHA verification", maxDays: 0 },

  // ── Sentry ────────────────────────────────────────────────────────────
  sentryReplaySession: { category: "analytics", provider: "Sentry", description: "Session replay ID", maxDays: 0 },

  // ── LaunchDarkly ──────────────────────────────────────────────────────
  ld_uid:       { category: "functional", provider: "LaunchDarkly", description: "Feature flag user ID", maxDays: 365 },

  // ── Snapchat ──────────────────────────────────────────────────────────
  _scid:        { category: "marketing", provider: "Snapchat", description: "Snap Pixel user ID", maxDays: 395 },
  _scid_r:      { category: "marketing", provider: "Snapchat", description: "Snap Pixel ID (raw)", maxDays: 395 },
  sc_at:        { category: "marketing", provider: "Snapchat", description: "Snap Pixel attribution", maxDays: 395 },

  // ── Spotify ───────────────────────────────────────────────────────────
  sp_t:         { category: "marketing", provider: "Spotify", description: "Tracking token", maxDays: 365 },
  sp_landing:   { category: "marketing", provider: "Spotify", description: "Landing page tracking", maxDays: 1 },

  // ── TradeDoubler ──────────────────────────────────────────────────────
  TD:           { category: "marketing", provider: "TradeDoubler", description: "Affiliate tracking", maxDays: 365 },
  PI:           { category: "marketing", provider: "TradeDoubler", description: "Partner ID", maxDays: 365 },

  // ── Marketo ───────────────────────────────────────────────────────────
  _mkto_trk:    { category: "marketing", provider: "Marketo", description: "Visitor tracking", maxDays: 730 },
  BIGipServer:  { category: "necessary", provider: "F5 BIG-IP", description: "Load balancer persistence", maxDays: 0 },

  // ── Rollbar ───────────────────────────────────────────────────────────
  _rollbar_:    { category: "analytics", provider: "Rollbar", description: "Error tracking", maxDays: 365 },

  // ── Bugsnag ───────────────────────────────────────────────────────────
  bugsnag_anon_id: { category: "analytics", provider: "Bugsnag", description: "Anonymous error reporting ID", maxDays: 365 },

  // ── Datadog ───────────────────────────────────────────────────────────
  dd_cookie_test_: { category: "analytics", provider: "Datadog", description: "Cookie support test", maxDays: 0 },
  _dd_s:        { category: "analytics", provider: "Datadog RUM", description: "Session cookie", maxDays: 1 },

  // ── ContentSquare ─────────────────────────────────────────────────────
  _cs_c:        { category: "analytics", provider: "ContentSquare", description: "Consent state", maxDays: 395 },
  _cs_id:       { category: "analytics", provider: "ContentSquare", description: "User ID", maxDays: 395 },
  _cs_s:        { category: "analytics", provider: "ContentSquare", description: "Session data", maxDays: 1 },

  // ── AB Tasty ──────────────────────────────────────────────────────────
  ABTasty:      { category: "analytics", provider: "AB Tasty", description: "A/B testing visitor", maxDays: 395 },
  ABTastySession: { category: "analytics", provider: "AB Tasty", description: "A/B test session", maxDays: 0 },

  // ── Kameleoon ─────────────────────────────────────────────────────────
  kameleoonVisitorCode: { category: "analytics", provider: "Kameleoon", description: "A/B testing visitor code", maxDays: 365 },

  // ── Unbounce ──────────────────────────────────────────────────────────
  ubvs:         { category: "analytics", provider: "Unbounce", description: "Visitor session", maxDays: 0 },
  ubpv:         { category: "analytics", provider: "Unbounce", description: "Page views", maxDays: 0 },

  // ── Cookie-based auth tokens ──────────────────────────────────────────
  __Secure_next_auth_session_token: { category: "necessary", provider: "NextAuth.js", description: "Session token (secure)", maxDays: 30 },
  "next-auth.session-token": { category: "necessary", provider: "NextAuth.js", description: "Session token", maxDays: 30 },
  "next-auth.csrf-token": { category: "necessary", provider: "NextAuth.js", description: "CSRF token", maxDays: 0 },
  "next-auth.callback-url": { category: "necessary", provider: "NextAuth.js", description: "Callback URL", maxDays: 0 },
  __Host_next_auth_csrf_token: { category: "necessary", provider: "NextAuth.js", description: "Host-bound CSRF token", maxDays: 0 },

  // ── Vercel ────────────────────────────────────────────────────────────
  __vercel_live_token: { category: "necessary", provider: "Vercel", description: "Live preview token", maxDays: 0 },
  _vercel_jwt:  { category: "necessary", provider: "Vercel", description: "Authentication JWT", maxDays: 0 },

  // ── Netlify ───────────────────────────────────────────────────────────
  nf_jwt:       { category: "necessary", provider: "Netlify", description: "Authentication JWT", maxDays: 0 },
  nf_ab:        { category: "analytics", provider: "Netlify", description: "A/B test branch", maxDays: 365 },

  // ── Cookiebot / Cybot (additional) ────────────────────────────────────
  CookieConsentBulkSetting: { category: "necessary", provider: "Cookiebot", description: "Bulk consent setting", maxDays: 365 },
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
  { prefix: "_hp2_",   category: "analytics", provider: "Heap", description: "Behavior analytics" },
  { prefix: "ph_",     category: "analytics", provider: "PostHog", description: "Product analytics" },
  { prefix: "_pendo_", category: "analytics", provider: "Pendo", description: "Product analytics" },
  { prefix: "AMCV_",   category: "analytics", provider: "Adobe Experience Cloud", description: "Visitor ID" },
  { prefix: "AMCVS_",  category: "analytics", provider: "Adobe Experience Cloud", description: "Session" },
  { prefix: "s_",      category: "analytics", provider: "Adobe Analytics", description: "Analytics tracking" },
  { prefix: "_sp_",    category: "analytics", provider: "Snowplow", description: "Analytics tracking" },
  { prefix: "Hm_",     category: "analytics", provider: "Baidu Analytics", description: "Analytics tracking" },
  { prefix: "_ym_",    category: "analytics", provider: "Yandex Metrica", description: "Analytics tracking" },
  { prefix: "_rdt_",   category: "marketing", provider: "Reddit", description: "Ad tracking" },
  { prefix: "_cs_",    category: "analytics", provider: "ContentSquare", description: "UX analytics" },
  { prefix: "_iub_",   category: "necessary", provider: "iubenda", description: "Consent" },
  { prefix: "uc_",     category: "necessary", provider: "Usercentrics", description: "Consent" },
  { prefix: "_dd_",    category: "analytics", provider: "Datadog RUM", description: "Real user monitoring" },
  { prefix: "__lc",    category: "functional", provider: "LiveChat", description: "Chat widget" },
  { prefix: "_zendesk_", category: "functional", provider: "Zendesk", description: "Support widget" },
  { prefix: "woocommerce_", category: "necessary", provider: "WooCommerce", description: "E-commerce" },
  { prefix: "incap_",  category: "necessary", provider: "Imperva Incapsula", description: "Security" },
  { prefix: "visid_incap_", category: "necessary", provider: "Imperva Incapsula", description: "Security" },
  { prefix: "nlbi_",   category: "necessary", provider: "Imperva Incapsula", description: "Load balancing" },
  { prefix: "ak_bmsc", category: "necessary", provider: "Akamai", description: "Bot management" },
  { prefix: "bm_",     category: "necessary", provider: "Akamai", description: "Bot management" },
  { prefix: "next-auth.", category: "necessary", provider: "NextAuth.js", description: "Authentication" },
  { prefix: "__Secure-next-auth", category: "necessary", provider: "NextAuth.js", description: "Authentication" },
  { prefix: "__Host-next-auth", category: "necessary", provider: "NextAuth.js", description: "Authentication" },
  { prefix: "sb-",     category: "necessary", provider: "Supabase", description: "Authentication" },
  { prefix: "ABTasty", category: "analytics", provider: "AB Tasty", description: "A/B testing" },
  { prefix: "_scid",   category: "marketing", provider: "Snapchat", description: "Snap Pixel" },
  { prefix: "mf_",     category: "analytics", provider: "Mouseflow", description: "Session recording" },
  { prefix: "_lo_",    category: "analytics", provider: "Lucky Orange", description: "Session recording" },
  { prefix: "_fw_",    category: "functional", provider: "Freshworks", description: "Support/CRM" },
  { prefix: "BIGipServer", category: "necessary", provider: "F5 BIG-IP", description: "Load balancing" },
];

// Domain-based classification (for third-party cookies identified by domain)
export const DOMAINS = {
  // ── Google ────────────────────────────────────────────────────────────
  "doubleclick.net":    { category: "marketing", provider: "Google Ads (DoubleClick)" },
  "google-analytics.com": { category: "analytics", provider: "Google Analytics" },
  "googleadservices.com": { category: "marketing", provider: "Google Ads" },
  "googlesyndication.com": { category: "marketing", provider: "Google AdSense" },
  "googletagmanager.com": { category: "analytics", provider: "Google Tag Manager" },
  "googleapis.com":     { category: "necessary", provider: "Google APIs" },
  "google.com":         { category: "analytics", provider: "Google" },
  "googleoptimize.com": { category: "analytics", provider: "Google Optimize" },

  // ── Meta ──────────────────────────────────────────────────────────────
  "facebook.com":       { category: "marketing", provider: "Meta (Facebook)" },
  "facebook.net":       { category: "marketing", provider: "Meta (Facebook)" },
  "fbcdn.net":          { category: "marketing", provider: "Meta (Facebook)" },
  "instagram.com":      { category: "marketing", provider: "Meta (Instagram)" },
  "whatsapp.com":       { category: "functional", provider: "Meta (WhatsApp)" },

  // ── LinkedIn ──────────────────────────────────────────────────────────
  "linkedin.com":       { category: "marketing", provider: "LinkedIn" },
  "ads.linkedin.com":   { category: "marketing", provider: "LinkedIn Ads" },
  "licdn.com":          { category: "marketing", provider: "LinkedIn CDN" },

  // ── Microsoft ─────────────────────────────────────────────────────────
  "bing.com":           { category: "marketing", provider: "Microsoft Ads (Bing)" },
  "bat.bing.com":       { category: "marketing", provider: "Microsoft Ads (Bing)" },
  "clarity.ms":         { category: "analytics", provider: "Microsoft Clarity" },
  "microsoft.com":      { category: "analytics", provider: "Microsoft" },
  "msn.com":            { category: "marketing", provider: "Microsoft (MSN)" },

  // ── Social ────────────────────────────────────────────────────────────
  "tiktok.com":         { category: "marketing", provider: "TikTok" },
  "tiktokcdn.com":      { category: "marketing", provider: "TikTok CDN" },
  "twitter.com":        { category: "marketing", provider: "Twitter/X" },
  "x.com":              { category: "marketing", provider: "Twitter/X" },
  "t.co":               { category: "marketing", provider: "Twitter/X" },
  "pinterest.com":      { category: "marketing", provider: "Pinterest" },
  "pinimg.com":         { category: "marketing", provider: "Pinterest CDN" },
  "reddit.com":         { category: "marketing", provider: "Reddit" },
  "redditstatic.com":   { category: "marketing", provider: "Reddit" },
  "snapchat.com":       { category: "marketing", provider: "Snapchat" },
  "sc-static.net":      { category: "marketing", provider: "Snapchat" },
  "quora.com":          { category: "marketing", provider: "Quora" },

  // ── Analytics ─────────────────────────────────────────────────────────
  "hotjar.com":         { category: "analytics", provider: "Hotjar" },
  "hotjar.io":          { category: "analytics", provider: "Hotjar" },
  "hubspot.com":        { category: "analytics", provider: "HubSpot" },
  "hs-analytics.net":   { category: "analytics", provider: "HubSpot" },
  "hsforms.net":        { category: "functional", provider: "HubSpot Forms" },
  "segment.com":        { category: "analytics", provider: "Segment" },
  "segment.io":         { category: "analytics", provider: "Segment" },
  "mixpanel.com":       { category: "analytics", provider: "Mixpanel" },
  "amplitude.com":      { category: "analytics", provider: "Amplitude" },
  "fullstory.com":      { category: "analytics", provider: "FullStory" },
  "mouseflow.com":      { category: "analytics", provider: "Mouseflow" },
  "crazyegg.com":       { category: "analytics", provider: "Crazy Egg" },
  "optimizely.com":     { category: "analytics", provider: "Optimizely" },
  "vwo.com":            { category: "analytics", provider: "VWO" },
  "heap.io":            { category: "analytics", provider: "Heap" },
  "heapanalytics.com":  { category: "analytics", provider: "Heap" },
  "posthog.com":        { category: "analytics", provider: "PostHog" },
  "pendo.io":           { category: "analytics", provider: "Pendo" },
  "luckyorange.com":    { category: "analytics", provider: "Lucky Orange" },
  "luckyorange.net":    { category: "analytics", provider: "Lucky Orange" },
  "contentsquare.com":  { category: "analytics", provider: "ContentSquare" },
  "contentsquare.net":  { category: "analytics", provider: "ContentSquare" },
  "abtasty.com":        { category: "analytics", provider: "AB Tasty" },
  "kameleoon.com":      { category: "analytics", provider: "Kameleoon" },
  "matomo.cloud":       { category: "analytics", provider: "Matomo" },
  "plausible.io":       { category: "analytics", provider: "Plausible" },
  "usefathom.com":      { category: "analytics", provider: "Fathom" },
  "umami.is":           { category: "analytics", provider: "Umami" },
  "pirsch.io":          { category: "analytics", provider: "Pirsch" },

  // ── Advertising / Retargeting ─────────────────────────────────────────
  "adroll.com":         { category: "marketing", provider: "AdRoll" },
  "criteo.com":         { category: "marketing", provider: "Criteo" },
  "criteo.net":         { category: "marketing", provider: "Criteo" },
  "taboola.com":        { category: "marketing", provider: "Taboola" },
  "outbrain.com":       { category: "marketing", provider: "Outbrain" },
  "tradedoubler.com":   { category: "marketing", provider: "TradeDoubler" },
  "shareasale.com":     { category: "marketing", provider: "ShareASale" },
  "impact.com":         { category: "marketing", provider: "Impact" },
  "partnerize.com":     { category: "marketing", provider: "Partnerize" },
  "cj.com":             { category: "marketing", provider: "Commission Junction" },
  "awin1.com":          { category: "marketing", provider: "Awin" },
  "demdex.net":         { category: "marketing", provider: "Adobe Audience Manager" },
  "2o7.net":            { category: "analytics", provider: "Adobe Analytics" },
  "omtrdc.net":         { category: "analytics", provider: "Adobe Analytics" },
  "everesttech.net":    { category: "marketing", provider: "Adobe Advertising" },
  "marketo.net":        { category: "marketing", provider: "Marketo" },
  "mktoresp.com":       { category: "marketing", provider: "Marketo" },
  "pardot.com":         { category: "marketing", provider: "Salesforce Pardot" },
  "salesforce.com":     { category: "marketing", provider: "Salesforce" },
  "eloqua.com":         { category: "marketing", provider: "Oracle Eloqua" },
  "addthis.com":        { category: "marketing", provider: "AddThis" },
  "sharethis.com":      { category: "marketing", provider: "ShareThis" },
  "amazon-adsystem.com": { category: "marketing", provider: "Amazon Ads" },

  // ── Monitoring / Error tracking ───────────────────────────────────────
  "nr-data.net":        { category: "analytics", provider: "New Relic" },
  "newrelic.com":       { category: "analytics", provider: "New Relic" },
  "sentry.io":          { category: "analytics", provider: "Sentry" },
  "rollbar.com":        { category: "analytics", provider: "Rollbar" },
  "bugsnag.com":        { category: "analytics", provider: "Bugsnag" },
  "datadoghq.com":      { category: "analytics", provider: "Datadog" },
  "logrocket.io":       { category: "analytics", provider: "LogRocket" },
  "logrocket.com":      { category: "analytics", provider: "LogRocket" },
  "logr-ingest.com":    { category: "analytics", provider: "LogRocket" },

  // ── Chat / Support ────────────────────────────────────────────────────
  "intercom.io":        { category: "functional", provider: "Intercom" },
  "drift.com":          { category: "functional", provider: "Drift" },
  "zendesk.com":        { category: "functional", provider: "Zendesk" },
  "zdassets.com":       { category: "functional", provider: "Zendesk" },
  "freshdesk.com":      { category: "functional", provider: "Freshworks (Freshdesk)" },
  "freshchat.com":      { category: "functional", provider: "Freshworks (Freshchat)" },
  "livechatinc.com":    { category: "functional", provider: "LiveChat" },
  "livechat.com":       { category: "functional", provider: "LiveChat" },
  "tawk.to":            { category: "functional", provider: "Tawk.to" },
  "crisp.chat":         { category: "functional", provider: "Crisp" },
  "olark.com":          { category: "functional", provider: "Olark" },
  "tidio.co":           { category: "functional", provider: "Tidio" },

  // ── Consent platforms ─────────────────────────────────────────────────
  "cookiebot.com":      { category: "necessary", provider: "Cookiebot" },
  "onetrust.com":       { category: "necessary", provider: "OneTrust" },
  "cookieyes.com":      { category: "necessary", provider: "CookieYes" },
  "usercentrics.eu":    { category: "necessary", provider: "Usercentrics" },
  "iubenda.com":        { category: "necessary", provider: "iubenda" },
  "didomi.io":          { category: "necessary", provider: "Didomi" },
  "quantcast.com":      { category: "necessary", provider: "Quantcast" },
  "termly.io":          { category: "necessary", provider: "Termly" },
  "osano.com":          { category: "necessary", provider: "Osano" },

  // ── Payment / E-commerce ──────────────────────────────────────────────
  "stripe.com":         { category: "necessary", provider: "Stripe" },
  "paypal.com":         { category: "necessary", provider: "PayPal" },
  "braintreegateway.com": { category: "necessary", provider: "Braintree (PayPal)" },
  "shopify.com":        { category: "necessary", provider: "Shopify" },
  "klarna.com":         { category: "necessary", provider: "Klarna" },
  "adyen.com":          { category: "necessary", provider: "Adyen" },
  "mollie.com":         { category: "necessary", provider: "Mollie" },

  // ── CDN / Infrastructure ──────────────────────────────────────────────
  "cloudflare.com":     { category: "necessary", provider: "Cloudflare" },
  "cloudflareinsights.com": { category: "analytics", provider: "Cloudflare Analytics" },
  "akamai.com":         { category: "necessary", provider: "Akamai" },
  "akamaiedge.net":     { category: "necessary", provider: "Akamai" },
  "akamaihd.net":       { category: "necessary", provider: "Akamai" },
  "fastly.net":         { category: "necessary", provider: "Fastly" },
  "incapsula.com":      { category: "necessary", provider: "Imperva Incapsula" },
  "sucuri.net":         { category: "necessary", provider: "Sucuri" },

  // ── Auth / Identity ───────────────────────────────────────────────────
  "auth0.com":          { category: "necessary", provider: "Auth0" },
  "okta.com":           { category: "necessary", provider: "Okta" },
  "onelogin.com":       { category: "necessary", provider: "OneLogin" },

  // ── Google (functional / necessary) ───────────────────────────────────
  "recaptcha.net":      { category: "necessary", provider: "Google reCAPTCHA" },
  "gstatic.com":        { category: "necessary", provider: "Google (static resources)" },
  "hcaptcha.com":       { category: "necessary", provider: "hCaptcha" },

  // ── Media / Embeds ────────────────────────────────────────────────────
  "youtube.com":        { category: "marketing", provider: "YouTube (Google)" },
  "youtu.be":           { category: "marketing", provider: "YouTube (Google)" },
  "vimeo.com":          { category: "functional", provider: "Vimeo" },
  "spotify.com":        { category: "marketing", provider: "Spotify" },
  "soundcloud.com":     { category: "functional", provider: "SoundCloud" },
  "wistia.com":         { category: "analytics", provider: "Wistia" },
  "wistia.net":         { category: "analytics", provider: "Wistia" },
  "typekit.net":        { category: "functional", provider: "Adobe Fonts" },
  "use.typekit.net":    { category: "functional", provider: "Adobe Fonts" },
  "fonts.googleapis.com": { category: "functional", provider: "Google Fonts" },

  // ── Email marketing ───────────────────────────────────────────────────
  "mailchimp.com":      { category: "marketing", provider: "Mailchimp" },
  "list-manage.com":    { category: "marketing", provider: "Mailchimp" },
  "sendinblue.com":     { category: "marketing", provider: "Brevo (Sendinblue)" },
  "brevo.com":          { category: "marketing", provider: "Brevo" },
  "klaviyo.com":        { category: "marketing", provider: "Klaviyo" },
  "convertkit.com":     { category: "marketing", provider: "ConvertKit" },
  "activecampaign.com": { category: "marketing", provider: "ActiveCampaign" },

  // ── Asian ad/analytics ────────────────────────────────────────────────
  "baidu.com":          { category: "marketing", provider: "Baidu" },
  "hm.baidu.com":       { category: "analytics", provider: "Baidu Analytics" },
  "yandex.ru":          { category: "analytics", provider: "Yandex" },
  "yandex.com":         { category: "analytics", provider: "Yandex" },
  "mc.yandex.ru":       { category: "analytics", provider: "Yandex Metrica" },

  // ── Scheduling ────────────────────────────────────────────────────────
  "calendly.com":       { category: "functional", provider: "Calendly" },

  // ── Hosting platforms ─────────────────────────────────────────────────
  "vercel.com":         { category: "necessary", provider: "Vercel" },
  "netlify.com":        { category: "necessary", provider: "Netlify" },
  "herokuapp.com":      { category: "necessary", provider: "Heroku" },

  // ── Feature flags ─────────────────────────────────────────────────────
  "launchdarkly.com":   { category: "functional", provider: "LaunchDarkly" },
  "split.io":           { category: "functional", provider: "Split.io" },
  "flagsmith.com":      { category: "functional", provider: "Flagsmith" },

  // ── Form / Survey ─────────────────────────────────────────────────────
  "typeform.com":       { category: "functional", provider: "Typeform" },
  "jotform.com":        { category: "functional", provider: "JotForm" },
  "surveymonkey.com":   { category: "functional", provider: "SurveyMonkey" },
};
