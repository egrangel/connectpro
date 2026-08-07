// String unions instead of DB enums: the SQLite connector has no enum support,
// and these stay valid after the planned PostgreSQL migration.

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const LISTING_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

export const REVIEW_STATUS = {
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
} as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const REVIEW_COMMENT_MAX_LENGTH = 2000;

// Shared by the Zod schema and the admin form, so the counter shown to the
// admin can never disagree with what the server accepts.
export const LISTING_TITLE_MIN_LENGTH = 3;
export const LISTING_TITLE_MAX_LENGTH = 120;
export const LISTING_DESCRIPTION_MIN_LENGTH = 10;
export const LISTING_DESCRIPTION_MAX_LENGTH = 5000;

// Photos per listing is configurable in admin → Configurações. This is the
// value used until an admin changes it, plus the range the form accepts.
export const DEFAULT_MAX_PHOTOS_PER_LISTING = 10;
export const PHOTOS_PER_LISTING_MIN = 1;
export const PHOTOS_PER_LISTING_MAX = 20;

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

// Consent agreement shown at registration, editable in admin → Configurações.
// Generous on purpose: a legal text that hits the ceiling would be silently
// unsaveable, and the admin textarea shares this bound with the schema.
export const TERMS_TEXT_MAX_LENGTH = 20000;

// Photo guidance shown on the upload form. The same image is cropped to 4:3 on
// the listing cards and 16:9 on the listing page (both object-cover), so the
// recommendation is a 4:3 source wide enough to stay sharp in the wider crop.
export const PHOTO_RECOMMENDED_WIDTH = 1600;
export const PHOTO_RECOMMENDED_HEIGHT = 1200;
export const PHOTO_MIN_WIDTH = 1200;
export const PHOTO_MIN_HEIGHT = 900;

export const LISTINGS_PAGE_SIZE = 12;
export const REVIEWS_PAGE_SIZE = 10;

// Minimum reviews before a listing can outrank unrated ones in rating sort.
export const RATING_SORT_MIN_REVIEWS = 3;

// Longest search query accepted from the URL; anything beyond is truncated.
export const SEARCH_QUERY_MAX_LENGTH = 120;

// Search report: terms shorter than this are noise ("de", "e", stray letters),
// longer ones are pasted junk that would sit in the table forever.
export const SEARCH_TERM_MIN_LENGTH = 3;
export const SEARCH_TERM_MAX_LENGTH = 40;
export const SEARCH_REPORT_PAGE_SIZE = 50;

export const SESSION_COOKIE_NAME = "connect_session";
export const SESSION_DURATION_DAYS = 30;

// Short-lived on purpose: a reset link sitting in an inbox is a standing key
// to the account.
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;
