export const SCRIPT_BUNDLES = {
  core: ["./core/constants.js", "./core/utils.js", "./api/api.js"],

  ui: ["./components/ui-manager.js", "./components/html-snippets.js", "./components/navigation.js", "./components/search-manager.js", "./components/friend-dialog.js"],

  modules: {
    validation: "./modules/validation.js",
    articleRenderer: "./modules/article-renderer.js",
    pagination: "./modules/pagination.js",
    comments: "./modules/comment-manager.js",
    bookmarks: "./modules/bookmark-manager.js",
    articleReporter: "./modules/article-reporter.js",
    shareManager: "./components/share-manager.js",
    backToTop: "./components/back-to-top.js",
    reportDialog: "./components/report-dialog.js",
    profileFormManager: "./modules/profile-form-manager.js",
    profileFriendsManager: "./modules/profile-friends-manager.js",
    adminDataManager: "./modules/admin-data-manager.js",
    adminChartManager: "./modules/admin-chart-manager.js",
    adminReportManager: "./modules/admin-report-manager.js",
    adminUserManager: "./modules/admin-user-manager.js"
  },

  news: ["./modules/news-section-manager.js", "./modules/news-api-manager.js", "./modules/news-link-manager.js"],

  coordinator: "./components.js"
};
