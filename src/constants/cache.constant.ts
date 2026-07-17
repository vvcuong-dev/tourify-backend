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
  CATEGORY: {
    _VER: 'v1',
    _KEY: {
      DETAIL_BY_SLUG: (slug: string) =>
        `${PREFIX}:${GLOBAL_VER}:categories:${CACHE.CATEGORY._VER}:detail:slug_${slug}`,
      TREE: () =>
        `${PREFIX}:${GLOBAL_VER}:categories:${CACHE.CATEGORY._VER}:tree`,
    },
    TAGS: {
      ROOT: () => [`${PREFIX}:category`],
      DETAIL: (slug: string) => [`${PREFIX}:category`, slug],
      TREE: () => [`${PREFIX}:category`, 'tree'],
    },
  },
  TOUR: {
    _VER: 'v1',
    _KEY: {
      DETAIL_BY_SLUG: (slug: string) =>
        `${PREFIX}:${GLOBAL_VER}:tours:${CACHE.TOUR._VER}:detail:slug_${slug}`,
      SEARCH: (queryHash: string) =>
        `${PREFIX}:${GLOBAL_VER}:tours:${CACHE.TOUR._VER}:search:${queryHash}`,
    },
    TAGS: {
      ROOT: () => [`${PREFIX}:tour`],
      DETAIL: (slug: string) => [`${PREFIX}:tour`, slug],
      SEARCH: () => [`${PREFIX}:tour`, 'search'],
    },
  },
  CITY: {
    _VER: 'v1',
    _KEY: {
      LIST: () => `${PREFIX}:${GLOBAL_VER}:cities:${CACHE.CITY._VER}:list`,
    },
    TAGS: {
      ROOT: () => [`${PREFIX}:city`],
    },
  },
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
  AUTH: {
    _VER: 'v1',
    _KEY: {
      REFRESH_TOKEN: (userId: number, jti: string) =>
        `${PREFIX}:${GLOBAL_VER}:auth:${CACHE.AUTH._VER}:refresh:id_${userId}:jti_${jti}`,
      BLACKLIST: (jti: string) =>
        `${PREFIX}:${GLOBAL_VER}:auth:${CACHE.AUTH._VER}:blacklist:jti_${jti}`,
    },
    _PATTERN: {
      ALL_REFRESH_TOKENS: (userId: number) =>
        `${PREFIX}:${GLOBAL_VER}:auth:${CACHE.AUTH._VER}:refresh:id_${userId}:jti_*`,
    },
  },
};
