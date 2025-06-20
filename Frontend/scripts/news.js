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

/*
$(document).ready(function () {
  // List of blocked sources
  const blockedSources = ["Al Jazeera", "Al Jazeera English"];

  // Section-specific keywords for filtering articles
  const sectionKeywords = {
    general: ["politics", "world", "breaking", "government", "election", "economy", "finance", "business"],
    travel: ["travel", "tourism", "vacation", "adventure", "nature", "outdoor", "hiking", "camping", "explore", "destination", "journey", "wildlife", "environment"],
    horizon: ["science", "technology", "innovation", "research", "discovery", "future", "breakthrough", "analysis"],
    beyond: ["culture", "society", "human", "lifestyle", "feature", "investigation", "special", "documentary", "story"],
    trending: ["viral", "popular", "social", "entertainment", "celebrity", "sports", "trending", "hot", "latest"]
  };

  function categorizeArticles(articles) {
    const categorized = {
      general: [],
      travel: [],
      horizon: [],
      beyond: [],
      trending: []
    };

    articles.forEach((article) => {
      const title = (article.title || "").toLowerCase();
      const description = (article.description || "").toLowerCase();
      const content = title + " " + description;

      let assigned = false;

      // Check for travel/nature keywords first (most specific)
      if (sectionKeywords.travel.some((keyword) => content.includes(keyword))) {
        categorized.travel.push(article);
        assigned = true;
      }
      // Check for science/tech keywords
      else if (sectionKeywords.horizon.some((keyword) => content.includes(keyword))) {
        categorized.horizon.push(article);
        assigned = true;
      }
      // Check for culture/lifestyle keywords
      else if (sectionKeywords.beyond.some((keyword) => content.includes(keyword))) {
        categorized.beyond.push(article);
        assigned = true;
      }
      // Check for trending/entertainment keywords
      else if (sectionKeywords.trending.some((keyword) => content.includes(keyword))) {
        categorized.trending.push(article);
        assigned = true;
      }

      // If not categorized, add to general
      if (!assigned) {
        categorized.general.push(article);
      }
    });

    return categorized;
  }

  function populateArticles(articles) {
    // Filter out blocked sources
    const filteredArticles = articles.filter((article) => {
      const sourceName = article.source?.name || "";
      return !blockedSources.some((blocked) => sourceName.toLowerCase().includes(blocked.toLowerCase()));
    });

    // Categorize articles by section
    const categorized = categorizeArticles(filteredArticles);

    // Define section mappings
    const sectionMappings = [
      // General news section (indices 0-11)
      { indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], category: "general" },
      // This month section (indices 12-17)
      { indices: [12, 13, 14, 15, 16, 17], category: "general" },
      // Horizon series section (indices 18-20)
      { indices: [18, 19, 20], category: "horizon" },
      // Beyond headlines section (indices 21-24)
      { indices: [21, 22, 23, 24], category: "beyond" },
      // Trending section (indices 25-30)
      { indices: [25, 26, 27, 28, 29, 30], category: "trending" }
    ];

    // Travel section articles (for discover more section)
    const travelIndices = ["travel-1", "travel-2", "travel-3", "travel-4", "travel-5"];

    // Populate each section
    sectionMappings.forEach((section) => {
      const articles = categorized[section.category];
      if (articles.length === 0) {
        // Fallback to general articles if category is empty
        section.category = "general";
      }

      section.indices.forEach((index, i) => {
        const articleIndex = i % (categorized[section.category].length || 1);
        const article = categorized[section.category][articleIndex] || filteredArticles[0];
        populateArticleElement(index, article);
      });
    });

    // Handle travel section separately
    travelIndices.forEach((index, i) => {
      const travelArticles = categorized.travel.length > 0 ? categorized.travel : filteredArticles;
      const articleIndex = i % travelArticles.length;
      const article = travelArticles[articleIndex];
      populateArticleElement(index, article);
    });
  }

  function populateArticleElement(index, article) {
    const $articleElement = $(`[data-article-index="${index}"]`);

    if ($articleElement.length && article) {
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
  }

  function fetchNews() {
    const API_KEY = "key";
    const BASE_URL = "https://newsapi.org/v2/everything"; // Changed to 'everything' for better keyword search

    // Multiple API calls for different categories
    const queries = [
      `${BASE_URL}?q=breaking news politics world&language=en&sortBy=publishedAt&pageSize=30&apiKey=${API_KEY}`,
      `${BASE_URL}?q=travel adventure nature outdoor hiking&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`,
      `${BASE_URL}?q=technology science innovation research&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`,
      `${BASE_URL}?q=culture lifestyle society investigation&language=en&sortBy=publishedAt&pageSize=15&apiKey=${API_KEY}`,
      `${BASE_URL}?q=trending viral entertainment sports&language=en&sortBy=popularity&pageSize=15&apiKey=${API_KEY}`
    ];

    showLoadingState();

    const allRequests = queries.map((query) => {
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(query)}`;
      return $.ajax({
        url: apiUrl,
        method: "GET"
      });
    });

    Promise.all(allRequests)
      .then((responses) => {
        let allArticles = [];

        responses.forEach((response) => {
          try {
            const data = JSON.parse(response.contents);
            if (data.status === "ok" && data.articles) {
              allArticles = allArticles.concat(data.articles);
            }
          } catch (e) {
            console.log("Error parsing response:", e);
          }
        });

        if (allArticles.length > 0) {
          populateArticles(allArticles);
        } else {
          fetchMockNews();
        }
        hideLoadingState();
      })
      .catch(() => {
        fetchMockNews();
        hideLoadingState();
      });
  }

  function fetchMockNews() {
    const mockArticles = [
      // General news
      {
        title: "Breaking: Global Economic Summit Reaches Historic Agreement",
        description: "World leaders unite on unprecedented economic cooperation plan for sustainable growth and climate action.",
        url: "https://example.com/economic-news",
        urlToImage: "https://via.placeholder.com/400x200/0066cc/ffffff?text=Economic+News",
        source: { name: "World Economic Times" },
        author: "Sarah Johnson"
      },
      {
        title: "Election Results Show Shift in Political Landscape",
        description: "Analysis of recent elections reveals changing voter preferences and emerging political trends across regions.",
        url: "https://example.com/political-news",
        urlToImage: "https://via.placeholder.com/400x200/cc0066/ffffff?text=Political+News",
        source: { name: "Political Review" },
        author: "Michael Chen"
      },
      // Travel/Adventure
      {
        title: "Hidden Mountain Trails Offer Breathtaking Adventure",
        description: "Discover secret hiking paths that lead to stunning vistas and unforgettable outdoor experiences.",
        url: "https://example.com/adventure-news",
        urlToImage: "https://via.placeholder.com/400x200/00cc66/ffffff?text=Adventure+News",
        source: { name: "Outdoor Explorer" },
        author: "Emma Martinez"
      },
      {
        title: "Sustainable Tourism Trends Reshape Travel Industry",
        description: "Eco-friendly travel options gain popularity as travelers seek meaningful and responsible adventures.",
        url: "https://example.com/travel-news",
        urlToImage: "https://via.placeholder.com/400x200/66cc00/ffffff?text=Travel+News",
        source: { name: "Green Travel Guide" },
        author: "David Park"
      },
      // Science/Technology
      {
        title: "Revolutionary AI Breakthrough Changes Scientific Research",
        description: "Latest artificial intelligence developments accelerate discovery in medicine, climate science, and space exploration.",
        url: "https://example.com/tech-news",
        urlToImage: "https://via.placeholder.com/400x200/6600cc/ffffff?text=Tech+News",
        source: { name: "Future Science" },
        author: "Dr. Lisa Wong"
      },
      {
        title: "Space Exploration Reaches New Milestone",
        description: "International space mission achieves unprecedented scientific discoveries about distant planets and cosmic phenomena.",
        url: "https://example.com/space-news",
        urlToImage: "https://via.placeholder.com/400x200/cc6600/ffffff?text=Space+News",
        source: { name: "Cosmic Research" },
        author: "James Rodriguez"
      },
      // Culture/Lifestyle
      {
        title: "Cultural Renaissance Emerges in Urban Communities",
        description: "Local artists and community leaders collaborate to revitalize neighborhoods through innovative cultural programs.",
        url: "https://example.com/culture-news",
        urlToImage: "https://via.placeholder.com/400x200/cc0000/ffffff?text=Culture+News",
        source: { name: "Cultural Digest" },
        author: "Maria Garcia"
      },
      {
        title: "Investigation Reveals Hidden Stories of Resilience",
        description: "In-depth look at communities overcoming challenges through unity, innovation, and determination.",
        url: "https://example.com/investigation-news",
        urlToImage: "https://via.placeholder.com/400x200/00cccc/ffffff?text=Investigation",
        source: { name: "Deep Stories" },
        author: "Robert Kim"
      },
      // Trending/Entertainment
      {
        title: "Viral Social Movement Inspires Global Change",
        description: "Online campaign grows into worldwide phenomenon, demonstrating the power of digital connectivity for social good.",
        url: "https://example.com/viral-news",
        urlToImage: "https://via.placeholder.com/400x200/cc00cc/ffffff?text=Viral+News",
        source: { name: "Social Trends" },
        author: "Ashley Taylor"
      },
      {
        title: "Sports Championship Breaks All-Time Viewership Records",
        description: "Historic athletic competition captures global attention with unprecedented fan engagement and memorable performances.",
        url: "https://example.com/sports-news",
        urlToImage: "https://via.placeholder.com/400x200/cccc00/ffffff?text=Sports+News",
        source: { name: "Sports Central" },
        author: "Kevin Brown"
      }
    ];

    // Create more articles by cycling through base ones with variations
    const expandedArticles = Array.from({ length: 100 }, (_, i) => ({
      ...mockArticles[i % mockArticles.length],
      title: `${mockArticles[i % mockArticles.length].title} - Update ${Math.floor(i / mockArticles.length) + 1}`
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
*/
