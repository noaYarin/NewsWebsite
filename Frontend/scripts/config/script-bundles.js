export const SCRIPT_BUNDLES = {
  core: ["./core/constants.js", "./core/helpers.js", "./api/api.js" /*, "./statistics/siteStatistics.js"*/],

  ui: ["./components/ui-manager.js", "./components/html-snippets.js", "./components/navigation.js", "./components/search-manager.js", "./components/friend-dialog.js"],

  modules: {
    validation: "./modules/validation.js",
    articleRenderer: "./modules/article-renderer.js",
    pagination: "./modules/pagination.js",
    comments: "./modules/comment-manager.js",
    bookmarks: "./modules/bookmark-manager.js",
    articleReporter: "./modules/article-reporter.js",
    backToTop: "./components/back-to-top.js",
    reportDialog: "./components/report-dialog.js",
    profileFormManager: "./modules/profile-form-manager.js",
    profileFriendsManager: "./modules/friends-manager.js"
  },

  news: ["./modules/news-section-manager.js", "./modules/news-api-manager.js", "./modules/news-link-manager.js"],

  coordinator: "./components.js"
};
