const CONSTANTS = {
  MOBILE_BREAKPOINT: 1024,
  SCROLL_THRESHOLD: 1200,
  SEARCH_PAGE_SIZE: 10,
  NEWS_PAGE_SIZE: 10,
  PLACEHOLDER_IMAGE_URL: "../sources/images/placeholder.png",
  DEFAULT_IMAGE: "../sources/images/placeholder.png",
  NO_IMAGE_URL: "../sources/images/no-image.png",

  PATHS: {
    ICONS: "../sources/icons/",
    IMAGES: "../sources/images/",
    CATEGORIES: "../sources/images/categories/"
  },

  API: {
    DOTNET_PORT: 7171,
    NODE_PORT: 3000
  },

  VALIDATION: {
    PASSWORD_REQUIREMENTS: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
      TOTAL_REQUIREMENTS: 3
    },
    AGE_LIMITS: {
      MIN_AGE: 18,
      MAX_AGE: 120
    }
  }
};

window.CONSTANTS = CONSTANTS;
