class BookmarksPageManager {
  static currentUser = null;

  static SELECTORS = {
    bookmarksList: "#bookmarks-list",
    loadingMessage: "#bookmarks-loading-message"
  };

  static TEMPLATES = {
    loading: `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun/sun.png" alt="Loading Bookmarks" class="thinking-icon" />
        </div>
      </div>
    `,
    emptyState: `
      <div class="empty-state">
        <img src="../sources/images/not-found.png" alt="No bookmarks" class="empty-state-icon" />
        <h3>No saved articles yet</h3>
        <p>Articles you bookmark will appear here for easy access later.</p>
        <a href="../html/index.html" class="highlight">Browse Articles</a>
      </div>
    `,
    errorState: `
      <div class="error-state">
        <img src="../sources/images/not-found.png" alt="Error" class="error-state-icon" />
        <h3>Could not load your bookmarks</h3>
        <p>There was an error loading your saved articles.</p>
        <button onclick="BookmarksPageManager.loadBookmarks()" class="retry-btn highlight">Try Again</button>
      </div>
    `
  };

  static init() {
    this.currentUser = Utils.getCurrentUser();

    if (!this.currentUser) {
      window.location.href = "auth.html";
      return;
    }

    this.loadBookmarks();
  }

  static loadBookmarks() {
    this.showLoadingState();
    this.clearBookmarksList();

    getUserBookmarks(
      this.currentUser.id,
      (articles) => this.handleBookmarksLoadSuccess(articles),
      () => this.handleBookmarksLoadError()
    );
  }

  static showLoadingState() {
    const $loadingMessage = $(this.SELECTORS.loadingMessage);
    $loadingMessage.html(this.TEMPLATES.loading).show();
  }

  static clearBookmarksList() {
    $(this.SELECTORS.bookmarksList).empty();
  }

  static handleBookmarksLoadSuccess(articles) {
    this.hideLoadingMessage();

    if (articles && articles.length > 0) {
      this.displayBookmarks(articles);
    } else {
      this.showEmptyState();
    }
  }

  static handleBookmarksLoadError() {
    this.hideLoadingMessage();
    this.showErrorState();
  }

  static hideLoadingMessage() {
    $(this.SELECTORS.loadingMessage).hide();
  }

  static displayBookmarks(articles) {
    const container = $(this.SELECTORS.bookmarksList);
    container.empty();

    articles.forEach((article) => {
      const articleHtml = ArticleRenderer.renderListItem(article);
      container.append(articleHtml);
    });
  }

  static showEmptyState() {
    const container = $(this.SELECTORS.bookmarksList);
    container.html(this.TEMPLATES.emptyState);
  }

  static showErrorState() {
    const container = $(this.SELECTORS.bookmarksList);
    container.html(this.TEMPLATES.errorState);
  }
}

$(document).ready(() => {
  BookmarksPageManager.init();
});

window.BookmarksPageManager = BookmarksPageManager;
