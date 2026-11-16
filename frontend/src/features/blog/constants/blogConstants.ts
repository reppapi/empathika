// ==========================================
// CONSTANTS UNTUK FITUR BLOG FRONTEND
// ==========================================

export const BLOG_CONSTANTS = {
  MAX_FILE_SIZE_BYTES: 30 * 1024 * 1024, // 30 MB
  DEFAULT_PAGE_SIZE: 10,
  PUBLIC_POSTS_PER_PAGE: 4,
  MAX_PAGE_SIZE: 100,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 255,
  CONTENT_MIN_LENGTH: 10,
  EXCERPT_MAX_LENGTH: 150,
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
} as const

