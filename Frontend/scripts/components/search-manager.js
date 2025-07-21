const SearchManager = {
  scope: null,
  currentPage: 1,
  isLoading: false,
  allResultsLoaded: false,
  lastQuery: "",

  init() {
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document).on("click", ".nav-right .search-icon, .close-search, .mobile-close-search", () => {
      this.toggle(false);
    });

    $(document).on("click", ".mobile-menu-header .search-icon", () => {
      if ($("#mobileMenu").hasClass("active")) {
        Navigation.toggleMobileMenu();
      }
      this.toggle(true);
    });

    $(document).on("click", ".nav-profile-menu-search", (e) => {
      e.preventDefault();
      if ($("#profileMenu").hasClass("active")) {
        Navigation.toggleProfileMenu();
      }
      this.toggle(true);
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
      if ($("#search-results-container").length && $("#search-results-container").is(":visible")) {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();

        if (scrollTop + windowHeight > documentHeight - 400) {
          if (!this.isLoading && !this.allResultsLoaded && this.lastQuery) {
            this.performSearch(this.lastQuery, false);
          }
        }
      }
    });

    $(document).on("click", ".remove-scope", () => {
      this.removeScope();
    });
  },

  toggle(removeFilter = false) {
    const $overlay = $("#searchOverlay");
    $overlay.toggleClass("active");

    if ($overlay.hasClass("active")) {
      if (removeFilter) {
        this.clearScope();
      } else {
        this.setScope();
      }

      setTimeout(() => {
        const inputToFocus = $(window).width() <= CONSTANTS.MOBILE_BREAKPOINT ? ".mobile-search-input" : ".search-input";
        $(inputToFocus).focus();
      }, 100);
    } else {
      this.cleanup();
    }
  },

  clearScope() {
    this.scope = null;
    $(".search-scope-indicator").hide();
    $(".search-input, .mobile-search-input").removeClass("scoped").attr("placeholder", "Search Here...");
  },

  setScope() {
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
      const scopeText = this.formatScopeText(this.scope);
      const $scopeIndicator = $(".search-scope-indicator");
      const $scopeSpan = $scopeIndicator.find("span");

      $scopeSpan.text(scopeText).attr("title", this.getFullCategoryName(this.scope));
      this.applyScopeClasses(scopeText, $scopeIndicator);
      $scopeIndicator.show();

      const placeholder = `Search in ${scopeText}`;
      $(".search-input, .mobile-search-input").addClass("scoped").attr("placeholder", placeholder);
    }
  },

  formatScopeText(scope) {
    const categoryNames = {
      business: "Business",
      entertainment: "Entertainment",
      general: "General",
      health: "Health",
      science: "Science",
      sports: "Sports",
      technology: "Technology",
      travel: "Travel",
      bookmarks: "Bookmarks"
    };

    const fullName = categoryNames[scope.toLowerCase()] || scope.charAt(0).toUpperCase() + scope.slice(1);

    if ($(window).width() <= 768 && fullName.length > 10) {
      const abbreviations = {
        Entertainment: "Entertain.",
        Technology: "Tech",
        Business: "Business",
        General: "General",
        Health: "Health",
        Science: "Science",
        Sports: "Sports",
        Travel: "Travel",
        Bookmarks: "Saved"
      };
      return abbreviations[fullName] || fullName.substring(0, 8) + "...";
    }

    return fullName;
  },

  getFullCategoryName(scope) {
    const categoryNames = {
      business: "Business",
      entertainment: "Entertainment",
      general: "General",
      health: "Health",
      science: "Science",
      sports: "Sports",
      technology: "Technology",
      travel: "Travel",
      bookmarks: "Bookmarks"
    };

    return categoryNames[scope.toLowerCase()] || scope.charAt(0).toUpperCase() + scope.slice(1);
  },

  applyScopeClasses(scopeText, $scopeIndicator) {
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
  },

  removeScope() {
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
  },

  cleanup() {
    this.clearSearchResults();
    this.scope = null;
    $(".search-scope-indicator").hide();
    $(".search-input, .mobile-search-input").removeClass("scoped").attr("placeholder", "Search Here...");
  },

  clearSearchResults() {
    $("#search-results-container").remove();
    $("main").show();
    this.lastQuery = "";
    this.currentPage = 1;
    this.allResultsLoaded = false;
  },

  handleSearch(query, isNewSearch) {
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
  },

  async performSearch(query, isNewSearch) {
    if (this.isLoading || (this.allResultsLoaded && !isNewSearch)) return;

    this.isLoading = true;

    if (isNewSearch) {
      $("main").hide();
      $("#search-results-container").remove();
      const searchContainerHtml = `
        <div id="search-results-container">
          <div class="search-results-content">
            <div id="search-results-list" class="articles-list"></div>
            <div id="search-loading-message" class="loading-message">
              <p>Searching articles...</p>
            </div>
          </div>
        </div>`;
      $("#footer").before(searchContainerHtml);
    } else {
      $("#search-loading-message").show();
    }

    try {
      const articles = await this.fetchSearchResults(query);
      this.handleSearchResults(articles, query);
    } catch (error) {
      this.handleSearchError();
    }
  },

  async fetchSearchResults(query) {
    const currentUser = Utils.getCurrentUser();

    if (this.scope === "bookmarks" && currentUser) {
      return new Promise((resolve, reject) => {
        searchBookmarks(currentUser.id, query, this.currentPage, CONSTANTS.SEARCH_PAGE_SIZE, resolve, reject);
      });
    } else {
      await this.fetchAndSyncFromAPI(query);

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
  },

  async fetchAndSyncFromAPI(query) {
    if (this.currentPage !== 1) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      searchNews(
        query,
        1,
        (response) => {
          if (response && response.data && response.data.length > 0) {
            const articles = this.mapAPIArticles(response.data);
            syncArticles(
              articles,
              () => resolve(),
              () => resolve()
            );
          } else {
            resolve();
          }
        },
        () => resolve()
      );
    });
  },

  mapAPIArticles(articles) {
    return articles.map((article) => ({
      title: article.title,
      url: article.url,
      imageUrl: article.urlToImage,
      description: article.description || "",
      author: article.author || "Unknown Author",
      sourceName: (article.source && article.source.name) || "Unknown Source",
      publishedAt: article.publishedAt,
      category: article.category || (this.scope ? this.scope.charAt(0).toUpperCase() + this.scope.slice(1) : "General")
    }));
  },

  handleSearchResults(articles, query) {
    $("#search-loading-message").hide();
    this.isLoading = false;

    if (!articles || articles.length === 0) {
      this.allResultsLoaded = true;
      if (this.currentPage === 1) {
        const message = this.scope ? `No articles found for "${query}" in ${this.scope}.` : `No articles found for "${query}".`;
        $("#search-results-list").html(`<p class="error-message">${message}</p>`);
      }
      return;
    }

    if (articles.length < CONSTANTS.SEARCH_PAGE_SIZE) {
      this.allResultsLoaded = true;
    }

    const uniqueArticles = Array.from(new Map(articles.map((article) => [article.url, article])).values());
    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    this.displayResults(uniqueArticles);
    this.currentPage++;
  },

  handleSearchError() {
    $("#search-loading-message").hide();
    this.isLoading = false;
    this.allResultsLoaded = true;
    $("#search-results-list").append(`<p class="error-message">An error occurred while searching.</p>`);
  },

  displayResults(articles) {
    const $listContainer = $("#search-results-list");
    if (this.currentPage === 1 && $listContainer.is(":empty")) {
      $listContainer.empty();
    }

    articles.forEach((article) => {
      const articleHtml = `
        <a href="../html/article.html?id=${article.id}" class="article-list-item">
          <div class="article-item-image">
            <img src="${article.imageUrl || CONSTANTS.PLACEHOLDER_IMAGE_URL}" alt="${article.title}" />
          </div>
          <div class="article-item-content">
            <span class="category-tag">${article.category || "News"}</span>
            <h3 class="article-item-title">${article.title}</h3>
            <span class="article-item-author">${article.author || "Unknown Author"}</span>
          </div>
        </a>`;
      $listContainer.append(articleHtml);
    });
  }
};

window.SearchManager = SearchManager;
