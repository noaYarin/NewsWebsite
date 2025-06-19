$(document).ready(function () {
  updateMonthTitle();
});

function updateMonthTitle() {
  const now = new Date();
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  $("#month-title").text(`${currentMonth} ${currentYear} NEWS`);
}

/* ALL THIS CODE NEEDS TO BE DELETED, ITS SOMETHING THE CHAT GAVE JUST TO CHECK THAT IT ACTUALLY WORKS, CHANGE THE API KEY TO ACTUALLY CHECK IT */

$(document).ready(function () {
  // List of blocked sources
  const blockedSources = ["Al Jazeera", "Al Jazeera English"];

  function populateArticles(articles) {
    // Filter out blocked sources
    const filteredArticles = articles.filter((article) => {
      const sourceName = article.source?.name || "";
      return !blockedSources.some((blocked) => sourceName.toLowerCase().includes(blocked.toLowerCase()));
    });

    // Get all elements with data-article-index
    const $articleElements = $("[data-article-index]");

    $articleElements.each(function (elementIndex) {
      const $articleElement = $(this);
      // Use modulo to cycle through articles if we don't have enough
      const articleIndex = elementIndex % filteredArticles.length;
      const article = filteredArticles[articleIndex];

      if (article) {
        $articleElement.find("[data-title-target]").text(article.title || "No title available");
        $articleElement.find("[data-description-target]").text(article.description || "No description available");
        $articleElement.find("[data-image-target]").attr({
          src: article.urlToImage || "../sources/images/test.avif",
          alt: article.title || "Article image"
        });
        $articleElement.find("[data-source-target]").text(article.source?.name || "Unknown Source");
        $articleElement.find("[data-author-target]").text(article.author || "Unknown Author");
        $articleElement.find("[data-url-target]").attr("href", article.url || "#");
      }
    });
  }

  function fetchNews() {
    const API_KEY = "key";
    const BASE_URL = "https://newsapi.org/v2/top-headlines";
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${BASE_URL}?country=us&category=general&pageSize=100&apiKey=${API_KEY}`)}`;

    showLoadingState();

    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (response) {
        try {
          const data = JSON.parse(response.contents);
          if (data.status === "ok" && data.articles) {
            populateArticles(data.articles);
          } else {
            fetchMockNews();
          }
        } catch {
          fetchMockNews();
        }
        hideLoadingState();
      },
      error: function () {
        fetchMockNews();
        hideLoadingState();
      }
    });
  }

  function fetchMockNews() {
    const mockArticles = [
      {
        title: "Breaking: Technology Advances in 2025",
        description: "Latest developments in artificial intelligence and machine learning are reshaping industries worldwide.",
        url: "https://example.com/tech-news",
        urlToImage: "https://via.placeholder.com/400x200/0066cc/ffffff?text=Tech+News",
        source: { name: "Tech Today" },
        author: "Jane Smith"
      },
      {
        title: "Global Climate Summit Reaches Historic Agreement",
        description: "World leaders unite on unprecedented climate action plan for the next decade.",
        url: "https://example.com/climate-news",
        urlToImage: "https://via.placeholder.com/400x200/00cc66/ffffff?text=Climate+News",
        source: { name: "Environmental Times" },
        author: "Dr. Sarah Green"
      },
      {
        title: "Sports Championship Final Breaks Viewership Records",
        description: "Historic match draws largest global audience in sports broadcasting history.",
        url: "https://example.com/sports-news",
        urlToImage: "https://via.placeholder.com/400x200/cc6600/ffffff?text=Sports+News",
        source: { name: "Sports Central" },
        author: "Mike Johnson"
      }
    ];

    // Create more mock articles by cycling through the base ones
    const expandedArticles = Array.from({ length: 50 }, (_, i) => ({
      ...mockArticles[i % mockArticles.length],
      title: `${mockArticles[i % mockArticles.length].title} - Story ${i + 1}`
    }));

    populateArticles(expandedArticles);
  }

  function showLoadingState() {
    $("[data-title-target]").text("Loading...");
    $("[data-description-target]").text("Fetching latest news...");
  }

  function hideLoadingState() {}

  fetchNews();
});
