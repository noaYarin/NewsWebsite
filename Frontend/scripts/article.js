let currentUser = null;
let currentArticle = null;

// Load page when DOM is ready
$(document).ready(function () {
  console.log("Article page loading...");

  // Get current user
  currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Get article data
  const articleData = sessionStorage.getItem("currentArticle");
  if (articleData) {
    currentArticle = JSON.parse(articleData);
    console.log("Article loaded:", currentArticle.title);
    showArticle();
  } else {
    console.log("No article data found");
    showError();
  }

  setupEventHandlers();
});

// Show the article content
function showArticle() {
  if (!currentArticle) {
    showError();
    return;
  }

  // Update page title
  document.title = `${currentArticle.title || "Article"} | HORIZON`;

  // Fill in article content
  $(".article-source").text(currentArticle.sourceName || "Unknown Source");
  $(".article-title").text(currentArticle.title || "No Title");
  $(".article-author").text(currentArticle.author ? `By ${currentArticle.author}` : "No Author");
  $(".article-date").text(formatDate(currentArticle.publishedAt));

  // Set article image
  if (currentArticle.imageUrl) {
    $(".article-image").attr("src", currentArticle.imageUrl);
    $(".article-image").attr("onerror", "this.style.display='none';");
  } else {
    $(".article-image").hide();
  }

  // Set article content
  const content = formatContent(currentArticle.description);
  $(".article-content").html(content);

  // Set read full article link
  if (currentArticle.url) {
    $(".read-full-article-btn").attr("href", currentArticle.url);
  } else {
    $(".read-full-article-btn").hide();
  }

  // Show the article
  $("#article-main-content").show();
  $("#article-error-message").hide();

  // Setup comments section
  setupComments();
}

// Show error message
function showError() {
  $("#article-main-content").hide();
  $("#article-error-message").show();
}

// Setup comments based on user login status
function setupComments() {
  if (currentUser) {
    console.log("User is logged in, showing comment form");

    // Show action buttons
    $(".article-actions").show();

    // Show comment form
    $("#comment-form").show();
    $("#comment-form-avatar").attr("src", currentUser.imageUrl || "../sources/images/no-image.png");

    // Try to load comments if we have article ID
    if (currentArticle.id) {
      loadComments();
    } else {
      // No article ID means it's a fresh article from API, no comments yet
      $("#comments-list").html("<p>Comments are not available for this article yet.</p>");
    }
  } else {
    console.log("User not logged in, hiding comment form");

    // Hide action buttons and comment form
    $(".article-actions").hide();
    $("#comment-form").hide();

    // Show login prompt
    $("#comments-list").html('<p class="login-prompt">Please log in to view and post comments.</p>');
  }
}

// Load comments from database
function loadComments() {
  if (!currentArticle.id) {
    $("#comments-list").html("<p>No comments available for this article.</p>");
    return;
  }

  $("#comments-list").html("<p>Loading comments...</p>");

  getComments(
    currentArticle.id,
    function (comments) {
      console.log("Comments loaded:", comments.length);
      showComments(comments);
    },
    function (error) {
      console.error("Failed to load comments:", error);
      $("#comments-list").html("<p>Could not load comments.</p>");
    }
  );
}

// Display comments in the list
function showComments(comments) {
  const commentsList = $("#comments-list");
  commentsList.empty();

  if (!comments || comments.length === 0) {
    commentsList.html("<p>No comments yet. Be the first to comment!</p>");
    return;
  }

  // Get blocked users list
  const blockedUsers = currentUser.blockedUsers || [];

  // Show each comment
  for (let comment of comments) {
    const isBlocked = blockedUsers.some((blocked) => blocked.id === comment.authorId);

    if (isBlocked) {
      // Show blocked comment placeholder
      const blockedHtml = `
                <div class="comment-item">
                    <div class="blocked-comment-message">
                        <span>Comment from a blocked user.</span>
                        <button class="show-comment-btn" 
                                data-author-name="${comment.authorName}"
                                data-author-avatar="${comment.authorAvatar || "../sources/images/no-image.png"}"
                                data-text="${comment.content}">
                            Show Comment
                        </button>
                    </div>
                </div>`;
      commentsList.append(blockedHtml);
    } else {
      // Show normal comment
      const commentHtml = `
                <div class="comment-item">
                    <img src="${comment.authorAvatar || "../sources/images/no-image.png"}" 
                         alt="${comment.authorName}" 
                         class="comment-avatar" />
                    <div class="comment-body">
                        <p class="comment-author">${comment.authorName}</p>
                        <p class="comment-text">${comment.content}</p>
                    </div>
                </div>`;
      commentsList.append(commentHtml);
    }
  }
}

// Add a new comment to the top of the list
function addNewCommentToList(commentText) {
  if (!currentUser) return;

  const commentsList = $("#comments-list");

  // Remove "no comments" message if it exists
  if (commentsList.find("p").length === 1) {
    commentsList.empty();
  }

  // Create new comment HTML
  const newCommentHtml = `
        <div class="comment-item">
            <img src="${currentUser.imageUrl || "../sources/images/no-image.png"}" 
                 alt="${currentUser.firstName}" 
                 class="comment-avatar" />
            <div class="comment-body">
                <p class="comment-author">${currentUser.firstName} ${currentUser.lastName}</p>
                <p class="comment-text">${commentText}</p>
            </div>
        </div>`;

  // Add to top of list
  commentsList.prepend(newCommentHtml);
}

// Setup all event handlers
// article.js

function setupEventHandlers() {
  // By chaining .off() before .on(), we prevent duplicate event handlers
  // from being attached, which solves the "popup twice" issue.

  // Handle showing blocked comments
  $(document)
    .off("click", ".show-comment-btn")
    .on("click", ".show-comment-btn", function () {
      const button = $(this);
      const authorName = button.data("author-name");
      const authorAvatar = button.data("author-avatar");
      const text = button.data("text");

      const commentHtml = `
            <img src="${authorAvatar}" alt="${authorName}" class="comment-avatar" />
            <div class="comment-body">
                <p class="comment-author">${authorName}</p>
                <p class="comment-text">${text}</p>
            </div>`;

      button.closest(".comment-item").html(commentHtml);
    });

  // Handle comment form submission
  $("#comment-form")
    .off("submit")
    .on("submit", function (e) {
      e.preventDefault();

      const textarea = $(this).find("textarea");
      const commentText = textarea.val();

      if (!commentText || commentText.trim() === "") {
        showPopup("Please enter a comment.", false);
        return;
      }

      const trimmedComment = commentText.trim();

      if (!currentUser) {
        showPopup("Please log in to comment.", false);
        return;
      }

      if (!currentArticle.id) {
        showPopup("This article does not support comments.", false);
        return;
      }

      console.log("Posting comment:", trimmedComment);

      addNewCommentToList(trimmedComment);

      textarea.val("");

      const commentData = {
        ArticleId: currentArticle.id,
        Content: trimmedComment,
        AuthorId: currentUser.id
      };

      addComment(
        commentData,
        function (response) {
          console.log("Comment posted successfully");
        },
        function (error) {
          console.error("Failed to post comment:", error);
          showPopup("Failed to post comment. Please try again.", false);
          loadComments();
        }
      );
    });

  // Handle action buttons
  $("#bookmark-btn")
    .off("click")
    .on("click", function () {
      showPopup("Bookmark feature coming soon!", "muted");
    });

  $("#share-btn")
    .off("click")
    .on("click", function () {
      showPopup("Share feature coming soon!", "muted");
    });

  $("#ai-summarize-btn")
    .off("click")
    .on("click", function () {
      showPopup("AI summarize feature coming soon!", "muted");
    });
}

// Format article content for display
function formatContent(content) {
  if (!content) {
    return "<p>No content available. Please read the full story on the source website.</p>";
  }

  // Remove "[+X chars]" from end if present
  const cleaned = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");

  // Split into paragraphs and format
  const paragraphs = cleaned
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`);

  return paragraphs.join("");
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "Unknown Date";

  try {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    return "Unknown Date";
  }
}
