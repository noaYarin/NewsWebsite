class CategoryPageManager {
  static currentPage = 1;
  static pageSize = 10;
  static currentCategory = "";
  static isLoading = false;
  static allArticlesLoaded = false;
  static pagination = null;

  static SELECTORS = {
    categoryTitle: ".category-title",
    categoryBanner: ".category-banner",
    articlesList: "#category-articles-list",
    loadingMessage: "#category-loading-message",
    infiniteScrollLoader: "#infinite-scroll-loader"
  };

  static PAGINATION_CONFIG = {
    pageSize: 10,
    threshold: 300
  };

  static TEMPLATES = {
    initialLoading: `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun/sun.png" alt="Loading Articles" class="thinking-icon" />
        </div>
      </div>
    `,
    infiniteLoading: `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun/sun.png" alt="Loading More Articles" class="thinking-icon" />
        </div>
      </div>
    `,
    emptyState: (categoryName) => `
      <div class="empty-state">
        <img src="../sources/images/not-found.png" alt="No articles" class="empty-state-icon" />
        <h3>No articles found</h3>
        <p>No articles found in the ${categoryName} category.</p>
        <a href="../html/index.html" class="highlight">Browse All Articles</a>
      </div>
    `,
    errorState: (message) => `
      <div class="error-state">
        <img src="../sources/images/not-found.png" alt="Error" class="error-state-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button onclick="CategoryPageManager.retry()" class="retry-btn highlight">Try Again</button>
      </div>
    `
  };

  static init() {
    this.currentCategory = Utils.getUrlParam("name");

    if (this.currentCategory) {
      this.setupPage();
      this.setupPagination();
      this.loadArticles();
    } else {
      this.showError("No category specified.");
    }
  }

  static setupPage() {
    const formattedTitle = this.formatCategoryName(this.currentCategory);

    document.title = `HORIZON / ${formattedTitle}`;
    $(this.SELECTORS.categoryTitle).text(formattedTitle);

    this.setupCategoryBanner(formattedTitle);
  }

  static formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  static setupCategoryBanner(formattedTitle) {
    const bannerImageUrl = `${CONSTANTS.PATHS.CATEGORIES}${formattedTitle}.jpg`;
    $(this.SELECTORS.categoryBanner).css("background-image", `url('${bannerImageUrl}')`);
  }

  static setupPagination() {
    this.pagination = new PaginationManager({
      pageSize: this.PAGINATION_CONFIG.pageSize,
      threshold: this.PAGINATION_CONFIG.threshold,
      loadMore: () => this.loadArticles()
    });
    this.pagination.init();
  }

  static async loadArticles() {
    if (this.isLoading || this.allArticlesLoaded) return;

    this.isLoading = true;
    this.showLoadingState();

    try {
      if (this.currentPage === 1) {
        await this.fetchAndSyncFromAPI();
      }

      this.fetchArticlesFromDatabase();
    } catch (error) {
      this.handleLoadError();
    }
  }

  static showLoadingState() {
    const $initialLoadingMessage = $(this.SELECTORS.loadingMessage);
    const $infiniteScrollLoader = $(this.SELECTORS.infiniteScrollLoader);

    if (this.currentPage === 1) {
      $initialLoadingMessage.html(this.TEMPLATES.initialLoading).show();
    } else {
      $infiniteScrollLoader.html(this.TEMPLATES.infiniteLoading).show();
    }
  }

  static fetchArticlesFromDatabase() {
    getArticlesByCategoryPaged(
      this.currentCategory,
      this.currentPage,
      this.pageSize,
      (articles) => this.handleLoadSuccess(articles),
      () => this.handleLoadError()
    );
  }

  static async fetchAndSyncFromAPI() {
    return new Promise((resolve) => {
      getTopHeadlines(
        this.currentCategory,
        1,
        (response) => {
          if (response && response.data && response.data.length > 0) {
            const articles = this.mapAPIArticles(response.data);
            this.syncArticlesToDatabase(articles, resolve);
          } else {
            resolve();
          }
        },
        () => resolve()
      );
    });
  }

  static syncArticlesToDatabase(articles, callback) {
    syncArticles(
      articles,
      () => callback(),
      () => callback()
    );
  }

  static mapAPIArticles(articles) {
    return articles.map((article) => ({
      title: article.title,
      url: article.url,
      imageUrl: article.urlToImage,
      description: article.description || "",
      author: article.author || "Unknown Author",
      sourceName: (article.source && article.source.name) || "Unknown Source",
      publishedAt: article.publishedAt,
      category: article.category || this.formatCategoryName(this.currentCategory)
    }));
  }

  static handleLoadSuccess(articles) {
    this.hideLoadingIndicators();

    if (articles && articles.length > 0) {
      this.displayArticles(articles);
      this.currentPage++;
      this.pagination.nextPage();
    }

    this.checkIfAllArticlesLoaded(articles);
    this.updateLoadingState();
  }

  static handleLoadError() {
    this.hideLoadingIndicators();
    this.showError("Could not load articles.");
    this.setLoadingComplete();
  }

  static hideLoadingIndicators() {
    $(this.SELECTORS.loadingMessage).hide();
    $(this.SELECTORS.infiniteScrollLoader).hide();
  }

  static displayArticles(articles) {
    const container = $(this.SELECTORS.articlesList);
    articles.forEach((article) => {
      const articleHtml = ArticleRenderer.renderListItem(article);
      container.append(articleHtml);
    });
  }

  static checkIfAllArticlesLoaded(articles) {
    if (!articles || articles.length < this.pageSize) {
      this.allArticlesLoaded = true;
      this.pagination.setAllLoaded(true);

      const container = $(this.SELECTORS.articlesList);
      if (container.is(":empty")) {
        this.showEmptyState();
      }
    }
  }

  static updateLoadingState() {
    this.isLoading = false;
    this.pagination.setLoading(false);
  }

  static setLoadingComplete() {
    this.isLoading = false;
    this.allArticlesLoaded = true;
    this.pagination.setLoading(false);
    this.pagination.setAllLoaded(true);
  }

  static showEmptyState() {
    const container = $(this.SELECTORS.articlesList);
    const categoryName = this.formatCategoryName(this.currentCategory);
    container.html(this.TEMPLATES.emptyState(categoryName));
  }

  static showError(message) {
    this.allArticlesLoaded = true;
    const container = $(this.SELECTORS.articlesList);
    container.html(this.TEMPLATES.errorState(message));
  }

  static retry() {
    this.resetPaginationState();
    this.clearArticlesList();
    this.showInitialLoading();
    this.loadArticles();
  }

  static resetPaginationState() {
    this.currentPage = 1;
    this.isLoading = false;
    this.allArticlesLoaded = false;
    this.pagination.reset();
  }

  static clearArticlesList() {
    $(this.SELECTORS.articlesList).empty();
  }

  static showInitialLoading() {
    $(this.SELECTORS.loadingMessage).show();
  }
}

$(document).ready(() => {
  CategoryPageManager.init();
});

window.CategoryPageManager = CategoryPageManager;
