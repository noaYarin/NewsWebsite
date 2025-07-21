const BookmarkManager = {
  currentUser: null,
  currentArticle: null,

  init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
    this.checkStatus();
    this.setupEventHandlers();
  },

  checkStatus() {
    if (!this.currentUser || !this.currentArticle) return;

    isArticleBookmarked(
      this.currentUser.id,
      this.currentArticle.id,
      (response) => this.updateButton(response.isBookmarked),
      () => {}
    );
  },

  updateButton(isBookmarked) {
    const $button = $("#bookmark-btn");
    if (isBookmarked) {
      $button.addClass("bookmarked").attr("title", "Remove from Bookmarks");
      $button.find("span").text("Saved");
    } else {
      $button.removeClass("bookmarked").attr("title", "Save Article");
      $button.find("span").text("Save");
    }
  },

  setupEventHandlers() {
    $(document).on("click", "#bookmark-btn", (e) => this.handleToggle(e));
  },

  handleToggle(e) {
    if (!this.currentUser || !this.currentArticle) {
      UIManager.showPopup("Please log in to save articles.", false);
      return;
    }

    const data = { UserId: this.currentUser.id, ArticleId: this.currentArticle.id };

    toggleBookmark(
      data,
      (response) => {
        this.updateButton(response.isBookmarked);
        const message = response.isBookmarked ? "Article saved!" : "Article removed from bookmarks.";
        UIManager.showPopup(message, true);
      },
      () => UIManager.showPopup("An error occurred. Please try again.", false)
    );
  }
};

window.BookmarkManager = BookmarkManager;
