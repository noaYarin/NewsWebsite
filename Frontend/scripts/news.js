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
  }
};

$(document).ready(() => NewsPage.init());

window.NewsSectionManager = NewsSectionManager;
window.NewsAPIManager = NewsAPIManager;
window.NewsLinkManager = NewsLinkManager;
