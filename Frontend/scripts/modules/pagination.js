class PaginationManager {
  constructor(config) {
    this.currentPage = 1;
    this.pageSize = config.pageSize || 10;
    this.isLoading = false;
    this.allLoaded = false;
    this.hasError = false;
    this.threshold = config.threshold || 300;
    this.loadMore = config.loadMore;

    if (!this.loadMore || typeof this.loadMore !== "function") {
      throw new Error("PaginationManager requires a loadMore callback function");
    }
  }

  init() {
    this.setupScrollHandler();
  }

  setupScrollHandler() {
    const throttledHandler = Utils.throttleAnimationFrame(() => {
      if (this.shouldLoadMore()) {
        this.handleLoadMore();
      }
    });

    $(window).on("scroll.pagination", throttledHandler);
  }

  handleLoadMore() {
    if (this.isLoading) return;

    this.setLoading(true);

    try {
      this.loadMore();
    } catch (error) {
      this.setError(true);
    }
  }

  shouldLoadMore() {
    if (this.isLoading || this.allLoaded || this.hasError) {
      return false;
    }

    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();

    return scrollTop + windowHeight > documentHeight - this.threshold;
  }

  reset() {
    this.currentPage = 1;
    this.isLoading = false;
    this.allLoaded = false;
    this.hasError = false;
  }

  setLoading(loading) {
    this.isLoading = loading;
  }

  setAllLoaded(loaded) {
    this.allLoaded = loaded;
  }

  setError(hasError) {
    this.hasError = hasError;
    this.isLoading = false;
  }

  nextPage() {
    this.currentPage++;
    this.setLoading(false);
  }

  getState() {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      isLoading: this.isLoading,
      allLoaded: this.allLoaded,
      hasError: this.hasError
    };
  }

  destroy() {
    $(window).off("scroll.pagination");
  }
}

window.PaginationManager = PaginationManager;
