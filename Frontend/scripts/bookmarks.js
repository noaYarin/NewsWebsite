$(document).ready(function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "auth.html";
    return;
  }

  loadBookmarks(currentUser.id);
});

function loadBookmarks(userId) {
  const $listContainer = $("#bookmarks-list");
  const $loadingMessage = $("#bookmarks-loading-message");

  getUserBookmarks(
    userId,
    (articles) => {
      $loadingMessage.hide();
      if (articles && articles.length > 0) {
        displayBookmarks($listContainer, articles);
      } else {
        $listContainer.html(`<p class="error-message">You have no saved articles.</p>`);
      }
    },
    (error) => {
      $loadingMessage.hide();
      $listContainer.html(`<p class="error-message">Could not load your bookmarks.</p>`);
    }
  );
}

function displayBookmarks(container, articles) {
  container.empty();
  articles.forEach((article) => {
    const articleHtml = `
      <a href="../html/article.html?id=${article.id}" class="article-list-item">
        <div class="article-item-image">
          <img src="${article.imageUrl || "../sources/images/placeholder.png"}" alt="${article.title}" />
        </div>
        <div class="article-item-content">
          <span class="category-tag">${article.sourceName || "News"}</span>
          <h3 class="article-item-title">${article.title}</h3>
          <span class="article-item-author">${article.author || "Unknown Author"}</span>
        </div>
      </a>
    `;
    container.append(articleHtml);
  });
}
