const PaginationManager = {
  create(config) {
    return {
      currentPage: 1,
      pageSize: config.pageSize || 10,
      isLoading: false,
      allLoaded: false,
      threshold: config.threshold || 300,

      init() {
        this.setupScrollHandler();
      },

      setupScrollHandler() {
        $(window).on("scroll", () => {
          if (this.shouldLoadMore()) {
            config.loadMore();
          }
        });
      },

      shouldLoadMore() {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();

        return !this.isLoading && !this.allLoaded && scrollTop + windowHeight > documentHeight - this.threshold;
      },

      reset() {
        this.currentPage = 1;
        this.isLoading = false;
        this.allLoaded = false;
      },

      setLoading(loading) {
        this.isLoading = loading;
      },

      setAllLoaded(loaded) {
        this.allLoaded = loaded;
      },

      nextPage() {
        this.currentPage++;
      }
    };
  }
};

window.PaginationManager = PaginationManager;
