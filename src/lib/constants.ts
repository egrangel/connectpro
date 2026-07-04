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

export const MAX_PHOTOS_PER_LISTING = 10;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

export const LISTINGS_PAGE_SIZE = 12;
export const REVIEWS_PAGE_SIZE = 10;

// Minimum reviews before a listing can outrank unrated ones in rating sort.
export const RATING_SORT_MIN_REVIEWS = 3;

export const SESSION_COOKIE_NAME = "connect_session";
export const SESSION_DURATION_DAYS = 30;
