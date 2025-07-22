export const PAGE_CONFIGS = {
  "auth.html": {
    bundles: ["core", "ui"],
    modules: ["validation"],
    page: "./pages/auth.js",
    extras: ["./pages/sun.js"]
  },

  "index.html": {
    bundles: ["core", "ui", "news"],
    modules: ["articleRenderer", "backToTop", "reportDialog"],
    page: "./pages/news.js"
  },

  "article.html": {
    bundles: ["core", "ui"],
    modules: ["comments", "bookmarks", "articleReporter", "reportDialog"],
    page: "./pages/article.js"
  },

  "bookmarks.html": {
    bundles: ["core", "ui"],
    modules: ["articleRenderer"],
    page: "./pages/bookmarks.js"
  },

  "category.html": {
    bundles: ["core", "ui"],
    modules: ["pagination", "articleRenderer"],
    page: "./pages/category.js"
  },

  "profile.html": {
    bundles: ["core", "ui"],
    modules: ["validation", "profileFormManager", "profileFriendsManager"],
    page: "./pages/profile.js"
  },

  "notifications.html": {
    bundles: ["core", "ui"],
    modules: [],
    page: "./pages/notifications.js"
  }
};
