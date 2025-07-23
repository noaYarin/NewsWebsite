const BookmarksPage = {
  currentUser: null,

  init() {
    this.currentUser = Utils.getCurrentUser();

    if (!this.currentUser) {
      window.location.href = "auth.html";
      return;
    }

    this.loadBookmarks();
  },

  loadBookmarks() {
    const $listContainer = $("#bookmarks-list");
    const $loadingMessage = $("#bookmarks-loading-message");

    $loadingMessage
      .html(
        `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun/sun.png" alt="Loading Bookmarks" class="thinking-icon" />
        </div>
      </div>
    `
      )
      .show();

    getUserBookmarks(
      this.currentUser.id,
      (articles) => {
        $loadingMessage.hide();
        if (articles && articles.length > 0) {
          this.displayBookmarks($listContainer, articles);
        } else {
          this.showEmptyState($listContainer);
        }
      },
      (error) => {
        $loadingMessage.hide();
        this.showErrorState($listContainer);
      }
    );
  },

  displayBookmarks(container, articles) {
    container.empty();
    articles.forEach((article) => {
      const articleHtml = ArticleRenderer.renderListItem(article);
      container.append(articleHtml);
    });
  },

  showEmptyState(container) {
    container.html(`
      <div class="empty-state">
        <img src="../sources/images/not-found.png" alt="No bookmarks" class="empty-state-icon" />
        <h3>No saved articles yet</h3>
        <p>Articles you bookmark will appear here for easy access later.</p>
        <a href="../html/index.html" class="highlight">Browse Articles</a>
      </div>
    `);
  },

  showErrorState(container) {
    container.html(`
      <div class="error-state">
        <img src="../sources/images/not-found.png" alt="Error" class="error-state-icon" />
        <h3>Could not load your bookmarks</h3>
        <p>There was an error loading your saved articles.</p>
        <button onclick="BookmarksPage.loadBookmarks()" class="retry-btn highlight">Try Again</button>
      </div>
    `);
  }
};

$(document).ready(() => BookmarksPage.init());
