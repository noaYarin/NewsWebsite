let currentPage = 1;
const pageSize = 10;
let currentCategory = "";
let isLoading = false;
let allArticlesLoaded = false;

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  currentCategory = urlParams.get("name");

  if (currentCategory) {
    const formattedTitle = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    document.title = `HORIZON / ${formattedTitle}`;
    $(".category-title").text(formattedTitle);

    // ADDED: Set the background image of the banner
    const bannerImageUrl = `../sources/images/categories/${formattedTitle}.jpg`;
    $(".category-banner").css("background-image", `url('${bannerImageUrl}')`);

    loadCategoryArticles();
  } else {
    showCategoryError("No category specified.");
  }

  $(window).on("scroll", function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 300) {
      if (!isLoading && !allArticlesLoaded) {
        loadCategoryArticles();
      }
    }
  });
});

// ... The rest of the file (loadCategoryArticles, displayArticles, etc.) remains the same
function loadCategoryArticles() {
  if (isLoading || allArticlesLoaded) return;
  isLoading = true;

  const $listContainer = $("#category-articles-list");
  const $initialLoadingMessage = $("#category-loading-message");
  const $infiniteScrollLoader = $("#infinite-scroll-loader");

  if (currentPage === 1) {
    $initialLoadingMessage.show();
  } else {
    $infiniteScrollLoader.show();
  }

  getArticlesByCategoryPaged(
    currentCategory,
    currentPage,
    pageSize,
    (articles) => {
      $initialLoadingMessage.hide();
      $infiniteScrollLoader.hide();

      if (articles && articles.length > 0) {
        displayArticles($listContainer, articles);
        currentPage++;
      }

      if (!articles || articles.length < pageSize) {
        allArticlesLoaded = true;
        if ($listContainer.is(":empty")) {
          showCategoryError(`No articles found for "${currentCategory}".`);
        }
      }
      isLoading = false;
    },
    (error) => {
      $initialLoadingMessage.hide();
      $infiniteScrollLoader.hide();
      showCategoryError("Could not load articles. Please try again later.");
      isLoading = false;
      allArticlesLoaded = true;
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
          <span class="article-item-author">${article.author || "Unknown Author"}</span>
        </div>
      </a>
    `;
    container.append(articleHtml);
  });
}

function showCategoryError(message) {
  allArticlesLoaded = true;
  const $listContainer = $("#category-articles-list");
  $listContainer.html(`<p class="error-message">${message}</p>`);
}
