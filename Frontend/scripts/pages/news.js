class NewsPageManager {
  static SELECTORS = {
    navbar: "#navbar, #mobileMenu, #profileMenu",
    pageLoader: "#page-loader",
    mainContent: "#main-content"
  };

  static CONFIG = {
    LOADER_FADE_DURATION: 600
  };

  static CSS_PROPERTIES = {
    blocked: {
      "pointer-events": "none"
    },
    unblocked: {
      "pointer-events": "auto",
      opacity: "1"
    }
  };

  static async init() {
    this.blockNavbar();

    try {
      await this.initializeNewsContent();
    } catch (error) {
      await this.fallbackToCache();
    }

    this.setupCategoryLinks();
    this.hideLoader();
  }

  static async initializeNewsContent() {
    NewsSectionManager.initializeSectionRequirements();
    await NewsSectionManager.collectAllArticles();
    NewsSectionManager.fillAllSections();
  }

  static async fallbackToCache() {
    await NewsSectionManager.loadFromCacheOnly();
  }

  static setupCategoryLinks() {
    NewsLinkManager.setupCategoryLinks();
  }

  static blockNavbar() {
    const $navbar = $(this.SELECTORS.navbar);
    $navbar.css(this.CSS_PROPERTIES.blocked);
  }

  static unblockNavbar() {
    const $navbar = $(this.SELECTORS.navbar);
    $navbar.css(this.CSS_PROPERTIES.unblocked);
  }

  static hideLoader() {
    const $loader = $(this.SELECTORS.pageLoader);
    const $mainContent = $(this.SELECTORS.mainContent);

    if (!$loader.length || !$mainContent.length) return;

    this.animateLoaderOut($loader, $mainContent);
    this.unblockNavbar();
    this.scheduleLoaderRemoval($loader);
  }

  static animateLoaderOut($loader, $mainContent) {
    $loader.addClass("fade-out");
    $mainContent.show();
  }

  static scheduleLoaderRemoval($loader) {
    setTimeout(() => {
      $loader.remove();
    }, this.CONFIG.LOADER_FADE_DURATION);
  }
}

$(document).ready(() => {
  NewsPageManager.init();
});

window.NewsPageManager = NewsPageManager;
window.NewsSectionManager = NewsSectionManager;
window.NewsAPIManager = NewsAPIManager;
window.NewsLinkManager = NewsLinkManager;
