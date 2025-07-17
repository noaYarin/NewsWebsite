let currentPage = 1;
const pageSize = 10;
let currentCategory = "";
let isLoading = false;

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  currentCategory = urlParams.get("name");

  if (currentCategory) {
    const formattedTitle = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    document.title = `HORIZON / ${formattedTitle}`;
    $(".category-title").text(formattedTitle);
    loadCategoryArticles();
  } else {
    showCategoryError("No category specified.");
  }

  $("#show-more-btn").on("click", loadCategoryArticles);
});

function loadCategoryArticles() {
  if (isLoading) return;
  isLoading = true;

  const $listContainer = $("#category-articles-list");
  const $loadingMessage = $("#category-loading-message");
  const $showMoreBtn = $("#show-more-btn");

  if (currentPage === 1) {
    $loadingMessage.show();
  }
  $showMoreBtn.text("Loading...").prop("disabled", true);

  getArticlesByCategoryPaged(
    currentCategory,
    currentPage,
    pageSize,
    (articles) => {
      $loadingMessage.hide();

      if (articles && articles.length > 0) {
        displayArticles($listContainer, articles);
        currentPage++;
      }

      if (!articles || articles.length < pageSize) {
        $showMoreBtn.hide();
        if ($listContainer.is(":empty")) {
          showCategoryError(`No articles found for ${currentCategory}.`);
        }
      } else {
        $showMoreBtn.show();
      }

      isLoading = false;
      $showMoreBtn.text("Show More").prop("disabled", false);
    },
    (error) => {
      $loadingMessage.hide();
      showCategoryError("Could not load articles. Please try again later.");
      isLoading = false;
      $showMoreBtn.text("Show More").prop("disabled", false);
    }
  );
}

function displayArticles(container, articles) {
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
