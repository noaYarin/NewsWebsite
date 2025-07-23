const NewsPage = {
  async init() {
    try {
      NewsSectionManager.initializeSectionRequirements();
      await NewsSectionManager.collectAllArticles();
      NewsSectionManager.fillAllSections();
    } catch (error) {
      await NewsSectionManager.loadFromCacheOnly();
    }

    NewsLinkManager.setupCategoryLinks();

    this.hideLoader();
  },

  hideLoader() {
    const $loader = $("#page-loader");
    const $mainContent = $("#main-content");

    if ($loader.length && $mainContent.length) {
      $loader.addClass("fade-out");

      $mainContent.show();

      setTimeout(() => {
        $loader.remove();
      }, 600);
    }
  }
};

$(document).ready(() => NewsPage.init());

window.NewsSectionManager = NewsSectionManager;
window.NewsAPIManager = NewsAPIManager;
window.NewsLinkManager = NewsLinkManager;
