const CategoryPage = {
  currentPage: 1,
  pageSize: 10,
  currentCategory: "",
  isLoading: false,
  allArticlesLoaded: false,
  pagination: null,

  init() {
    this.currentCategory = Utils.getUrlParam("name");

    if (this.currentCategory) {
      this.setupPage();
      this.setupPagination();
      this.loadArticles();
    } else {
      this.showError("No category specified.");
    }
  },

  setupPage() {
    const formattedTitle = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
    document.title = `HORIZON / ${formattedTitle}`;
    $(".category-title").text(formattedTitle);

    const bannerImageUrl = `${CONSTANTS.PATHS.CATEGORIES}${formattedTitle}.jpg`;
    $(".category-banner").css("background-image", `url('${bannerImageUrl}')`);
  },

  setupPagination() {
    this.pagination = PaginationManager.create({
      pageSize: this.pageSize,
      threshold: 300,
      loadMore: () => this.loadArticles()
    });
    this.pagination.init();
  },

  loadArticles() {
    if (this.isLoading || this.allArticlesLoaded) return;
    this.isLoading = true;

    const $listContainer = $("#category-articles-list");
    const $initialLoadingMessage = $("#category-loading-message");
    const $infiniteScrollLoader = $("#infinite-scroll-loader");

    this.showLoadingState($initialLoadingMessage, $infiniteScrollLoader);

    getArticlesByCategoryPaged(
      this.currentCategory,
      this.currentPage,
      this.pageSize,
      (articles) => this.handleSuccess(articles, $listContainer, $initialLoadingMessage, $infiniteScrollLoader),
      () => this.handleError($initialLoadingMessage, $infiniteScrollLoader)
    );
  },

  showLoadingState($initialLoadingMessage, $infiniteScrollLoader) {
    if (this.currentPage === 1) {
      $initialLoadingMessage.show();
    } else {
      $infiniteScrollLoader.show();
    }
  },

  handleSuccess(articles, $listContainer, $initialLoadingMessage, $infiniteScrollLoader) {
    $initialLoadingMessage.hide();
    $infiniteScrollLoader.hide();

    if (articles && articles.length > 0) {
      this.displayArticles($listContainer, articles);
      this.currentPage++;

      this.pagination.nextPage();
    }

    if (!articles || articles.length < this.pageSize) {
      this.allArticlesLoaded = true;
      this.pagination.setAllLoaded(true);

      if ($listContainer.is(":empty")) {
        this.showEmptyState($listContainer);
      }
    }

    this.isLoading = false;
    this.pagination.setLoading(false);
  },

  handleError($initialLoadingMessage, $infiniteScrollLoader) {
    $initialLoadingMessage.hide();
    $infiniteScrollLoader.hide();
    this.showError("Could not load articles. Please try again later.");
    this.isLoading = false;
    this.allArticlesLoaded = true;
    this.pagination.setLoading(false);
    this.pagination.setAllLoaded(true);
  },

  displayArticles(container, articles) {
    articles.forEach((article) => {
      const articleHtml = ArticleRenderer.renderListItem(article);
      container.append(articleHtml);
    });
  },

  showEmptyState(container) {
    const categoryName = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
    container.html(`
      <div class="empty-state">
        <img src="../sources/icons/search-svgrepo-com.svg" alt="No articles" class="empty-state-icon" />
        <h3>No articles found</h3>
        <p>No articles found in the ${categoryName} category.</p>
        <a href="../html/index.html" class="highlight">Browse All Articles</a>
      </div>
    `);
  },

  showError(message) {
    this.allArticlesLoaded = true;
    const $listContainer = $("#category-articles-list");
    $listContainer.html(`
      <div class="error-state">
        <img src="../sources/icons/alert-circle-svgrepo-com.svg" alt="Error" class="error-state-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button onclick="CategoryPage.retry()" class="retry-btn">Try Again</button>
      </div>
    `);
  },

  retry() {
    // Reset state
    this.currentPage = 1;
    this.isLoading = false;
    this.allArticlesLoaded = false;
    this.pagination.reset();

    // Clear container and retry
    $("#category-articles-list").empty();
    $("#category-loading-message").show();
    this.loadArticles();
  }
};

$(document).ready(() => CategoryPage.init());
