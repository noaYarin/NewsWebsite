let currentUser = null;
let currentArticle = null;

$(document).ready(function () {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const articleData = sessionStorage.getItem("currentArticle");
  if (articleData) {
    currentArticle = JSON.parse(articleData);
    showArticle();
  } else {
    showError();
  }

  setupEventHandlers();
});

function showArticle() {
  if (!currentArticle) {
    showError();
    return;
  }

  document.title = `${currentArticle.title || "Article"} | HORIZON`;
  $(".article-source").text(currentArticle.sourceName || "Unknown Source");
  $(".article-title").text(currentArticle.title || "No Title");
  $(".article-author").text(currentArticle.author ? `By ${currentArticle.author}` : "No Author");
  $(".article-date").text(formatDate(currentArticle.publishedAt));

  if (currentArticle.imageUrl) {
    $(".article-image").attr("src", currentArticle.imageUrl);
    $(".article-image").attr("onerror", "this.style.display='none';");
  } else {
    $(".article-image").hide();
  }

  const content = formatContent(currentArticle.description);
  $(".article-content").html(content);

  if (currentArticle.url) {
    $(".read-full-article-btn").attr("href", currentArticle.url);
  } else {
    $(".read-full-article-btn").hide();
  }

  $("#article-main-content").show();
  $("#article-error-message").hide();

  setupComments();
}

function showError() {
  $("#article-main-content").hide();
  $("#article-error-message").show();
}

function setupComments() {
  if (currentUser) {
    $(".article-actions").show();

    $("#comment-form").show();
    $("#comment-form-avatar").attr("src", currentUser.imageUrl || "../sources/images/no-image.png");

    if (currentArticle.id) {
      loadComments();
    } else {
      $("#comments-list").html('<p class="comment-prompt">Comments are not available for this article.</p>');
    }
  } else {
    $(".article-actions").hide();
    $("#comment-form").hide();

    $("#comments-list").html('<p class="comment-prompt">Please log in to view and post comments.</p>');
  }
}

function loadComments() {
  if (!currentArticle.id) {
    $("#comments-list").html('<p class="comment-prompt">No comments available for this article.</p>');
    return;
  }

  $("#comments-list").html('<p class="comment-prompt">Loading comments...</p>');

  getComments(
    currentArticle.id,
    function (comments) {
      showComments(comments);
    },
    function (error) {
      $("#comments-list").html('<p class="comment-prompt">Could not load comments.</p>');
    }
  );
}

function showComments(comments) {
  const commentsList = $("#comments-list");
  commentsList.empty();

  if (!comments || comments.length === 0) {
    commentsList.html('<p class="comment-prompt">No comments yet.</p>');
    return;
  }

  const blockedUsers = currentUser ? currentUser.blockedUsers || [] : [];

  for (let comment of comments) {
    const isBlocked = blockedUsers.some((blocked) => blocked.id === comment.authorId);

    if (isBlocked) {
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
      const commentHtml = `
          <div class="comment-item" data-comment-id="${comment.id}">
              <img src="${comment.authorAvatar || "../sources/images/no-image.png"}" 
                   alt="${comment.authorName}" 
                   class="comment-avatar" />
              <div class="comment-body">
                  <p class="comment-author">${comment.authorName}</p>
                  <div class="comment-content-wrapper">
                    <p class="comment-text">${comment.content}</p>
                    <div class="comment-edit-form">
                        <textarea class="comment-edit-textarea">${comment.content}</textarea>
                        <div class="comment-edit-actions">
                            <button class="save-edit-btn">Save</button>
                            <button class="cancel-edit-btn">Cancel</button>
                        </div>
                    </div>
                  </div>
              </div>
              <div class="comment-actions"></div>
          </div>`;

      const commentElement = $(commentHtml);

      if (currentUser && currentUser.id === comment.authorId) {
        const actionsHtml = `
              <button class="edit-comment-btn action-icon-btn" title="Edit comment">
                  <img src="../sources/icons/edit-3-svgrepo-com.svg" alt="Edit" />
              </button>
              <button class="delete-comment-btn action-icon-btn" title="Delete comment">
                  <img src="../sources/icons/delete-2-svgrepo-com.svg" alt="Delete" />
              </button>`;
        commentElement.find(".comment-actions").html(actionsHtml);
      }
      commentsList.append(commentElement);
    }
  }
}

function addNewCommentToList(commentText) {
  if (!currentUser) return;

  const commentsList = $("#comments-list");

  if (commentsList.find("p").length === 1) {
    commentsList.empty();
  }

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

  commentsList.prepend(newCommentHtml);
}

function setupEventHandlers() {
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

      textarea.val("");

      const commentData = {
        ArticleId: currentArticle.id,
        Content: trimmedComment,
        AuthorId: currentUser.id
      };

      addComment(
        commentData,
        function (response) {
          loadComments();
        },
        function (error) {
          showPopup("Failed to post comment. Please try again.", false);
          loadComments();
        }
      );
    });

  $(document).on("click", ".edit-comment-btn", function () {
    const commentItem = $(this).closest(".comment-item");
    commentItem.find(".comment-text").hide();
    commentItem.find(".comment-edit-form").show();
  });

  $(document).on("click", ".cancel-edit-btn", function () {
    const commentItem = $(this).closest(".comment-item");
    commentItem.find(".comment-edit-form").hide();
    commentItem.find(".comment-text").show();
    const originalText = commentItem.find(".comment-text").text();
    commentItem.find(".comment-edit-textarea").val(originalText);
  });

  $(document).on("click", ".save-edit-btn", function () {
    const commentItem = $(this).closest(".comment-item");
    const commentId = commentItem.data("comment-id");
    const textarea = commentItem.find(".comment-edit-textarea");
    const newContent = textarea.val().trim();

    if (newContent === "") {
      showPopup("Comment cannot be empty.", false);
      return;
    }

    updateComment(
      commentId,
      { content: newContent },
      function (updatedComment) {
        commentItem.find(".comment-text").text(newContent).show();
        commentItem.find(".comment-edit-form").hide();
        showPopup("Comment updated successfully.", true);
      },
      function (error) {
        showPopup("Failed to update comment. Please try again.", false);
      }
    );
  });

  $(document).on("click", ".delete-comment-btn", function () {
    const commentItem = $(this).closest(".comment-item");
    const commentId = commentItem.data("comment-id");

    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment(
        commentId,
        function () {
          commentItem.fadeOut(300, function () {
            $(this).remove();
          });
          showPopup("Comment deleted.", true);
        },
        function (error) {
          showPopup("Failed to delete comment. Please try again.", false);
        }
      );
    }
  });

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

function formatContent(content) {
  if (!content) {
    return "<p>No content available. Please read the full story on the source website.</p>";
  }

  const cleaned = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");

  const paragraphs = cleaned
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`);

  return paragraphs.join("");
}

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
