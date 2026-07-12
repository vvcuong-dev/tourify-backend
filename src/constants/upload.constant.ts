export const UPLOAD_LIMITS = {
  AVATAR: {
    maxSize: 5,
    maxFilesCount: 1,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
  TOUR_IMAGE: {
    maxSize: 8,
    maxFilesCount: 8,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
  CATEGORY_IMAGE: {
    maxSize: 5,
    maxFilesCount: 1,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
} as const;

export const MB_TO_BYTES = 1024 * 1024;
