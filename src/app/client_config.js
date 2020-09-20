// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = "Voilk";
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN = "Voilk";
export const APP_NAME_UPPERCASE = "VOILK";
export const APP_ICON = "voilk";
// FIXME figure out best way to do this on both client and server from env
// vars. client should read $SHR_Config, server should read config package.
export const APP_URL = "https://voilk.com";
export const APP_DOMAIN = "voilk.com";
export const LIQUID_TOKEN = "Voilk";
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const LIQUID_TOKEN_UPPERCASE = "VOILK";
export const COINING_TOKEN = "VOILK POWER";
export const INCOIN_TOKEN_UPPERCASE = "VOILK POWER";
export const INCOIN_TOKEN_SHORT = "VP";
export const DEBT_TOKEN = "VOILK DOLLAR";
export const DEBT_TOKENS = "VOILK DOLLARS";
export const CURRENCY_SIGN = "$";
export const WIKI_URL = ""; // https://wiki.golos.io/
export const LANDING_PAGE_URL = "https://voilk.com/";
export const TERMS_OF_SERVICE_URL = "https://" + APP_DOMAIN + "/tos.html";
export const PRIVACY_POLICY_URL = "https://" + APP_DOMAIN + "/privacy.html";
export const WHITEPAPER_URL = "https://voilk.com/VoilkWhitePaper.pdf";

// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = "VOILK";
export const COIN_TICKER = "COINS";
export const DEBT_TICKER = "VSD";
export const DEBT_TOKEN_SHORT = "VSD";

// application settings
export const DEFAULT_LANGUAGE = "en"; // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = "USD";
export const ALLOWED_CURRENCIES = ["USD"];
export const FRACTION_DIGITS = 2; // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3; // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = "@voilknetwork";
export const SHARE_IMAGE =
  "https://" + APP_DOMAIN + "/images/voilknetwork-share.png";
export const TWITTER_SHARE_IMAGE =
  "https://" + APP_DOMAIN + "/images/voilknetwork-twshare.png";
export const SITE_DESCRIPTION =
  "Voilknetwork is a social media platform where everyone gets paid for " +
  "creating and curating content. It leverages a robust digital points system, called Voilk, that " +
  "supports real value for digital rewards through market price discovery and liquidity";

// various
export const SUPPORT_EMAIL = "support@" + APP_DOMAIN;
