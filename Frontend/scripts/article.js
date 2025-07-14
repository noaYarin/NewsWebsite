const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const isSignedIn = !!currentUser;

$(document).ready(function () {
  initializePage();
  setupEventHandlers();
});

function initializePage() {
  const articleJSON = sessionStorage.getItem("currentArticle");
  const article = JSON.parse(articleJSON);

  if (article && article.id) {
    populateArticleContent(article);
    setupCommenting(article);
  } else {
    $("#article-main-content").hide();
    $("#article-error-message").show();
  }
}

function populateArticleContent(article) {
  document.title = `${article.title || "Article"} | HORIZON`;
  $("#article-main-content").data("article-db-id", article.id);
  $(".article-source").text(article.sourceName || "Unknown Source");
  $(".article-title").text(article.title || "No Title Provided");
  $(".article-author").text(`By ${article.author || "No Author Provided"}`);
  $(".article-date").text(formatDate(article.publishedAt));
  $(".article-image").attr("src", article.imageUrl).attr("onerror", "this.style.display='none'; this.onerror=null;");
  $(".article-content").html(formatContent(article.description));
  $(".read-full-article-btn").attr("href", article.url);
}

function setupCommenting(article) {
  if (isSignedIn) {
    $(".article-actions").show();
    $("#comment-form").show();
    $("#comment-form-avatar").attr("src", currentUser.imageUrl || "../sources/images/no-image.png");
    loadComments(article.id);
  } else {
    $("#comment-form").hide();
    $("#comments-section").append('<p class="login-prompt">Please log in to view and post comments.</p>');
  }
}

function loadComments(articleId) {
  $("#comments-list").html("<p>Loading comments...</p>");
  getComments(
    articleId,
    (comments) => {
      const blockedUsers = currentUser.blockedUsers || [];
      populateComments(comments, blockedUsers);
    },
    (err) => {
      $("#comments-list").html("<p>Could not load comments at this time.</p>");
    }
  );
}

function populateComments(comments, blockedUsers) {
  const commentsList = $("#comments-list");
  commentsList.empty();

  if (!comments || comments.length === 0) {
    commentsList.html("<p>Be the first to comment!</p>");
    return;
  }

  const isUserBlocked = (authorId) => blockedUsers.some((bu) => bu.id === authorId);

  comments.forEach((comment) => {
    let commentHtml;
    if (isUserBlocked(comment.authorId)) {
      commentHtml = `<div class="comment-item"><div class="blocked-comment-message"><span>Comment from a blocked user.</span><button class="show-comment-btn" data-author-name="${
        comment.authorName
      }" data-author-avatar="${comment.authorAvatar || "../sources/images/no-image.png"}" data-text="${comment.content}">Show Comment</button></div></div>`;
    } else {
      commentHtml = `
        <div class="comment-item">
          <img src="${comment.authorAvatar || "../sources/images/no-image.png"}" alt="${comment.authorName}" class="comment-avatar" />
          <div class="comment-body">
            <p class="comment-author">${comment.authorName}</p>
            <p class="comment-text">${comment.content}</p>
          </div>
        </div>`;
    }
    commentsList.append(commentHtml);
  });
}

function prependNewComment(commentContent) {
  if (!currentUser) return;

  const commentsList = $("#comments-list");
  if (commentsList.find(".comment-item").length === 0) {
    commentsList.empty();
  }

  const newCommentHtml = `
        <div class="comment-item">
          <img src="${currentUser.imageUrl || "../sources/images/no-image.png"}" alt="${currentUser.firstName}" class="comment-avatar" />
          <div class="comment-body">
            <p class="comment-author">${currentUser.firstName} ${currentUser.lastName}</p>
            <p class="comment-text">${commentContent}</p>
          </div>
        </div>`;

  commentsList.prepend(newCommentHtml);
}

function setupEventHandlers() {
  $("#comments-list").on("click", ".show-comment-btn", function () {
    const button = $(this);
    const authorName = button.data("author-name");
    const authorAvatar = button.data("author-avatar");
    const text = button.data("text");
    const originalCommentHtml = `<img src="${authorAvatar}" alt="${authorName}" class="comment-avatar" /><div class="comment-body"><p class="comment-author">${authorName}</p><p class="comment-text">${text}</p></div>`;
    $(this).closest(".comment-item").html(originalCommentHtml);
  });

  $("#comment-form")
    .off("submit")
    .on("submit", function (e) {
      e.preventDefault();
      const commentText = $("#comment-textarea").val().trim();
      const articleId = $("#article-main-content").data("article-db-id");

      if (commentText && articleId && isSignedIn) {
        prependNewComment(commentText);
        $("#comment-textarea").val("");
        const commentRequestData = {
          ArticleId: articleId,
          Content: commentText,
          AuthorId: currentUser.id
        };

        addComment(
          commentRequestData,
          (response) => {},
          (err) => {
            showPopup("Failed to post comment. Please try again.", false);
            loadComments(articleId);
          }
        );
      }
    });

  $("#bookmark-btn").on("click", () => alert("Bookmark functionality coming soon!"));
  $("#share-btn").on("click", () => alert("Share functionality coming soon!"));
  $("#ai-summarize-btn").on("click", () => alert("AI summary functionality coming soon!"));
}

function formatContent(content) {
  if (!content) return "<p>No content available. Please read the full story on the source website.</p>";
  const cleanedContent = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");
  return cleanedContent
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
}

function formatDate(isoString) {
  if (!isoString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(isoString).toLocaleDateString(undefined, options);
}
