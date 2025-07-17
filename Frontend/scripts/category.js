$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryName = urlParams.get("name");

  if (categoryName) {
    const formattedTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    document.title = `HORIZON / ${formattedTitle}`;
    $(".category-title").text(formattedTitle);
    loadCategoryArticles(categoryName);
  } else {
    showCategoryError("No category specified.");
  }
});

function loadCategoryArticles(categoryName) {
  const $listContainer = $("#category-articles-list");
  const $loadingMessage = $("#category-loading-message");

  getRecentArticles(
    categoryName,
    (articles) => {
      $loadingMessage.hide();
      if (articles && articles.length > 0) {
        displayArticles($listContainer, articles);
      } else {
        showCategoryError(`No articles found for ${categoryName}.`);
      }
    },
    (error) => {
      $loadingMessage.hide();
      showCategoryError("Could not load articles. Please try again later.");
      console.error("Error fetching category articles:", error);
    }
  );
}

function displayArticles(container, articles) {
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
          <p class="article-item-description">${article.description || ""}</p>
          <span class="article-item-author">${article.author || "Unknown Author"}</span>
        </div>
      </a>
    `;
    container.append(articleHtml);
  });
}

function showCategoryError(message) {
  const $listContainer = $("#category-articles-list");
  $listContainer.html(`<p class="error-message">${message}</p>`);
}
