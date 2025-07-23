const NewsPage = {
  async init() {
    // Block navbar interactions during loading
    this.blockNavbar();

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

  blockNavbar() {
    const $navbar = $("#navbar, #mobileMenu, #profileMenu");
    $navbar.css({
      "pointer-events": "none"
    });
  },

  unblockNavbar() {
    const $navbar = $("#navbar, #mobileMenu, #profileMenu");
    $navbar.css({
      "pointer-events": "auto",
      opacity: "1"
    });
  },

  hideLoader() {
    const $loader = $("#page-loader");
    const $mainContent = $("#main-content");

    if ($loader.length && $mainContent.length) {
      $loader.addClass("fade-out");
      $mainContent.show();

      this.unblockNavbar();

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
