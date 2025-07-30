class SearchManager {
  static scope = null;
  static currentPage = 1;
  static isLoading = false;
  static allResultsLoaded = false;
  static lastQuery = "";

  static init() {
    this.setupEventHandlers();
  }

  static setupEventHandlers() {
    // Toggle search overlay on various clicks
    $(document).on("click", ".nav-right .search-icon, .close-search, .mobile-close-search", () => {
      this.toggle(false);
    });

    // Toggle search on mobile menu icon click
    $(document).on("click", ".mobile-menu-header .search-icon", () => {
      if ($("#mobileMenu").hasClass("active")) {
        Navigation.toggleMobileMenu();
      }
      this.toggle(true);
    });

    // Toggle search from profile menu
    $(document).on("click", ".nav-profile-menu-search", (e) => {
      e.preventDefault();

      // Close profile menu first
      if ($("#profileMenu").hasClass("active")) {
        Navigation.toggleProfileMenu();
      }

      // If search is already open, focus instead of closing
      if ($("#searchOverlay").hasClass("active")) {
        this.focusSearchInput();
      } else {
        this.toggle(true);
      }
    });

    const debouncedSearch = Utils.debounce((query) => {
      this.handleSearch(query, true);
    }, 500);

    $(document).on("input", ".search-input, .mobile-search-input", function () {
      const query = $(this).val().trim();
      debouncedSearch(query);
    });

    $(document).on("keydown", ".search-input, .mobile-search-input", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = $(e.target).val().trim();
        this.handleSearch(query, true);
      }
    });

    $(window).on("scroll", () => {
      this.handleInfiniteScroll();
    });

    $(document).on("click", ".remove-scope", () => {
      this.removeScope();
    });
  }

  static handleInfiniteScroll() {
    const $container = $("#search-results-container");
    if (!$container.length || !$container.is(":visible")) return;

    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();

    if (scrollTop + windowHeight > documentHeight - 400) {
      if (!this.isLoading && !this.allResultsLoaded && this.lastQuery) {
        this.performSearch(this.lastQuery, false);
      }
    }
  }

  static toggle(removeFilter = false) {
    const $overlay = $("#searchOverlay");
    $overlay.toggleClass("active");

    if ($overlay.hasClass("active")) {
      removeFilter ? this.clearScope() : this.setScope();
      this.focusSearchInput();
    } else {
      this.cleanup();
    }
  }

  static focusSearchInput() {
    setTimeout(() => {
      const inputSelector = $(window).width() <= CONSTANTS.MOBILE_BREAKPOINT ? ".mobile-search-input" : ".search-input";
      $(inputSelector).focus();
    }, 100);
  }

  // === Search Scope Management ===
  static clearScope() {
    this.scope = null;
    $(".search-scope-indicator").hide();
    $(".search-input, .mobile-search-input").removeClass("scoped").attr("placeholder", "Search Here...");
  }

  static setScope() {
    const pathname = window.location.pathname;

    if (pathname.includes("category.html")) {
      const category = Utils.getUrlParam("name");
      if (category) {
        this.scope = category;
      }
    } else if (pathname.includes("bookmarks.html")) {
      this.scope = "bookmarks";
    } else {
      this.clearScope();
      return;
    }

    if (this.scope) {
      this.applyScopeToUI();
    }
  }

  static applyScopeToUI() {
    const scopeText = this.formatScopeText(this.scope);
    const fullName = this.getFullCategoryName(this.scope);

    const $scopeIndicator = $(".search-scope-indicator");
    const $scopeSpan = $scopeIndicator.find("span");

    $scopeSpan.text(scopeText).attr("title", fullName);
    this.applyScopeClasses(scopeText, $scopeIndicator);
    $scopeIndicator.show();

    const placeholder = `Search in ${scopeText}`;
    $(".search-input, .mobile-search-input").addClass("scoped").attr("placeholder", placeholder);
  }

  static formatScopeText(scope) {
    return this.getFullCategoryName(scope);
  }

  static getFullCategoryName(scope) {
    if (scope === "bookmarks") {
      return "Bookmarks";
    }

    // Check if it's a valid nav category, otherwise just capitalize
    const lowerScope = scope.toLowerCase();
    if (CONSTANTS.NAV_CATEGORIES.includes(lowerScope)) {
      return Utils.capitalizeFirst(lowerScope);
    }

    return Utils.capitalizeFirst(scope);
  }

  static applyScopeClasses(scopeText, $scopeIndicator) {
    const $container = $(".search-container");

    $scopeIndicator.removeClass("two-line with-icon");
    $container.removeClass("long-category");

    const isLongText = scopeText.length > 10;
    const isMobile = $(window).width() <= 768;

    if (isLongText && isMobile) {
      $scopeIndicator.addClass("two-line");
    } else if (isLongText) {
      $scopeIndicator.addClass("with-icon");
    }
  }

  static removeScope() {
    this.scope = null;
    $(".search-scope-indicator").hide();

    const $input = $(window).width() <= CONSTANTS.MOBILE_BREAKPOINT ? $(".mobile-search-input") : $(".search-input");

    $input.removeClass("scoped").attr("placeholder", "Search Here...").focus();

    const currentQuery = $input.val().trim();
    if (currentQuery.length > 2) {
      this.handleSearch(currentQuery, true);
    } else {
      this.clearSearchResults();
    }
  }

  // === Search Cleanup ===
  static cleanup() {
    this.clearSearchResults();
    this.scope = null;
    $(".search-scope-indicator").hide();
    $(".search-input, .mobile-search-input").removeClass("scoped").attr("placeholder", "Search Here...").val("");
  }

  static clearSearchResults() {
    $("#search-results-container").remove();
    $("main").show();
    this.resetPaginationState();
  }

  static resetPaginationState() {
    this.lastQuery = "";
    this.currentPage = 1;
    this.allResultsLoaded = false;
  }

  // === Search Handling ===
  static handleSearch(query, isNewSearch) {
    if (query.length > 2) {
      if (query !== this.lastQuery || isNewSearch) {
        this.lastQuery = query;
        this.currentPage = 1;
        this.allResultsLoaded = false;
        this.performSearch(query, true);
      }
    } else {
      this.clearSearchResults();
    }
  }

  static async performSearch(query, isNewSearch) {
    if (this.isLoading || (this.allResultsLoaded && !isNewSearch)) return;

    this.isLoading = true;

    if (isNewSearch) {
      this.setupSearchResultsContainer();
    } else {
      $("#search-loading-message").show();
    }

    try {
      const articles = await this.fetchSearchResults(query);
      this.handleSearchResults(articles, query);
    } catch (error) {
      this.handleSearchError();
    }
  }

  static setupSearchResultsContainer() {
    $("main").hide();
    $("#search-results-container").remove();

    const searchContainerHtml = `
      <div id="search-results-container">
        <div class="search-results-content">
          <div id="search-results-list" class="articles-list"></div>
          <div id="search-loading-message" class="loading-message">
            ${Utils.createLoadingIndicator("../sources/images/sun/sun.png", "Searching Articles")}
          </div>
        </div>
      </div>
    `;

    $("#footer").before(searchContainerHtml);
  }

  // === Search Results Fetching ===
  static async fetchSearchResults(query) {
    const currentUser = Utils.getCurrentUser();

    if (this.scope === "bookmarks" && currentUser) {
      return this.fetchBookmarkResults(currentUser.id, query);
    } else {
      return this.fetchArticleResults(query);
    }
  }

  static fetchBookmarkResults(userId, query) {
    return new Promise((resolve, reject) => {
      searchBookmarks(userId, query, this.currentPage, CONSTANTS.SEARCH_PAGE_SIZE, resolve, reject);
    });
  }

  static async fetchArticleResults(query) {
    const databaseResults = await this.searchDatabase(query);

    // Try to enhance with API results only on first page
    if (this.currentPage === 1) {
      try {
        await this.fetchAndSyncFromAPI(query);
        // Re-search database to get any newly synced articles
        return await this.searchDatabase(query);
      } catch (error) {
        return databaseResults;
      }
    }

    return databaseResults;
  }

  static searchDatabase(query) {
    return new Promise((resolve) => {
      searchDatabaseArticles(
        query,
        this.currentPage,
        CONSTANTS.SEARCH_PAGE_SIZE,
        (articles) => {
          let filteredArticles = articles || [];

          if (this.scope && this.scope !== "bookmarks") {
            filteredArticles = filteredArticles.filter((article) => article.category && article.category.toLowerCase() === this.scope.toLowerCase());
          }

          resolve(filteredArticles);
        },
        () => resolve([])
      );
    });
  }

  static async fetchAndSyncFromAPI(query) {
    if (this.currentPage !== 1) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Failsafe timeout to prevent hanging
      const timeout = setTimeout(() => {
        resolve();
      }, 10000);

      searchNews(
        query,
        1,
        (response) => {
          clearTimeout(timeout);
          if (response?.data?.length > 0) {
            const articles = this.mapAPIArticles(response.data);
            syncArticles(
              articles,
              () => {
                resolve();
              },
              () => {
                resolve();
              }
            );
          } else {
            resolve();
          }
        },
        () => {
          clearTimeout(timeout);
          resolve(); // Don't reject. just continue without API results
        }
      );
    });
  }

  static mapAPIArticles(articles) {
    return articles.map((article) => ({
      title: article.title,
      url: article.url,
      imageUrl: article.urlToImage,
      description: article.description || "",
      author: article.author || "Unknown Author",
      sourceName: article.source?.name || "Unknown Source",
      publishedAt: article.publishedAt,
      category: article.category || (this.scope ? Utils.capitalizeFirst(this.scope) : "General")
    }));
  }

  // === UI Management ===
  static handleSearchResults(articles, query) {
    $("#search-loading-message").hide();
    this.isLoading = false;

    if (!articles?.length) {
      this.allResultsLoaded = true;
      if (this.currentPage === 1) {
        this.showNoResultsMessage(query);
      }
      return;
    }

    if (articles.length < CONSTANTS.SEARCH_PAGE_SIZE) {
      this.allResultsLoaded = true;
    }

    const processedArticles = this.processSearchResults(articles);
    this.displayResults(processedArticles);
    this.currentPage++;
  }

  static showNoResultsMessage(query) {
    const message = this.scope ? `No articles found for "${query}" in ${this.scope}.` : `No articles found for "${query}".`;
    $("#search-results-list").html(`<p class="error-message">${message}</p>`);
  }

  static processSearchResults(articles) {
    const uniqueArticles = Array.from(new Map(articles.map((article) => [article.url, article])).values());
    return uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  static handleSearchError() {
    $("#search-loading-message").hide();
    this.isLoading = false;
    this.allResultsLoaded = true;
    $("#search-results-list").append('<p class="error-message">An error occurred while searching.</p>');
  }

  static displayResults(articles) {
    const $listContainer = $("#search-results-list");

    if (this.currentPage === 1 && $listContainer.is(":empty")) {
      $listContainer.empty();
    }

    articles.forEach((article) => {
      const articleHtml = this.createArticleHTML(article);
      $listContainer.append(articleHtml);
    });
  }

  static createArticleHTML(article) {
    const imageUrl = article.imageUrl || CONSTANTS.PLACEHOLDER_IMAGE_URL;
    const category = article.category || "News";
    const author = article.author || "Unknown Author";

    return `
      <a href="../html/article.html?id=${article.id}" class="article-list-item">
        <div class="article-item-image">
          <img src="${imageUrl}" alt="${article.title}" />
        </div>
        <div class="article-item-content">
          <span class="category-tag">${category}</span>
          <h3 class="article-item-title">${article.title}</h3>
          <span class="article-item-author">${author}</span>
        </div>
      </a>
    `;
  }
}

window.SearchManager = SearchManager;
