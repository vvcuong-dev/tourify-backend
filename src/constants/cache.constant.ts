const PREFIX = 'tourify';
const GLOBAL_VER = 'v1';

export type CacheFetcher<T> = () => Promise<T>;

// Time to live for cache entries in seconds
export const TTL = {
  TINY: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
  WEEK: 604800, // 1 week
};

// Manage cache keys with a consistent prefix and versioning

export const CACHE = {
  USER: {
    _VER: 'v1',
    _KEY: {
      DETAIL: (id: number) =>
        `${PREFIX}:${GLOBAL_VER}:users:${CACHE.USER._VER}:detail:id_${id}`,
    },
    TAGS: {
      ROOT: () => [`${PREFIX}:user`],
      DETAIL: (id: string) => [`${PREFIX}:user`, id],
      LIST: () => [`${PREFIX}:user-list`],
    },
  },
};
