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
      const isLiked = currentUser ? comment.isLikedByCurrentUser : false;
      const likeCount = comment.likeCount || 0;

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
                  <div class="comment-footer">
                    <div class="comment-likes">
                      <button class="like-comment-btn action-icon-btn ${isLiked ? "liked" : ""}" title="Like">
                          <img class="icon-heart-outline" src="../sources/icons/heart-svgrepo-com.svg" alt="Like" />
                          <img class="icon-heart-filled" src="../sources/icons/full-heart-svgrepo-com.svg" alt="Liked" />
                      </button>
                      <span class="like-count">${likeCount}</span>
                    </div>
                  </div>
              </div>
              <div class="comment-actions"></div>
          </div>`;

      const commentElement = $(commentHtml);

      let actionsHtml = `<button class="report-comment-btn action-icon-btn" title="Report comment">
                            <img src="../sources/icons/flag-svgrepo-com.svg" alt="Report" />
                         </button>`;

      if (currentUser && currentUser.id === comment.authorId) {
        actionsHtml += `
              <button class="edit-comment-btn action-icon-btn" title="Edit comment">
                  <img src="../sources/icons/edit-3-svgrepo-com.svg" alt="Edit" />
              </button>
              <button class="delete-comment-btn action-icon-btn" title="Delete comment">
                  <img src="../sources/icons/delete-2-svgrepo-com.svg" alt="Delete" />
              </button>`;
      }
      commentElement.find(".comment-actions").html(actionsHtml);
      commentsList.append(commentElement);
    }
  }
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
      const commentText = textarea.val().trim();

      if (commentText === "") {
        showPopup("Please enter a comment.", false);
        return;
      }
      if (!currentUser) {
        showPopup("Please log in to comment.", false);
        return;
      }

      textarea.val("");
      const commentData = {
        ArticleId: currentArticle.id,
        Content: commentText,
        AuthorId: currentUser.id
      };

      addComment(
        commentData,
        () => loadComments(),
        () => {
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
      () => showPopup("Failed to update comment. Please try again.", false)
    );
  });

  $(document).on("click", ".delete-comment-btn", function () {
    const commentItem = $(this).closest(".comment-item");
    const commentId = commentItem.data("comment-id");

    showDialog("Are you sure you want to delete this comment?").then((userClickedYes) => {
      if (userClickedYes) {
        deleteComment(
          commentId,
          () => {
            commentItem.fadeOut(300, function () {
              $(this).remove();
            });
            showPopup("Comment deleted.", true);
          },
          () => showPopup("Failed to delete comment. Please try again.", false)
        );
      }
    });
  });

  $(document).on("click", ".like-comment-btn", function () {
    if (!currentUser) {
      showPopup("Please log in to like comments.", false);
      return;
    }

    const button = $(this);
    const commentItem = button.closest(".comment-item");
    const commentId = commentItem.data("comment-id");
    const likeCountSpan = commentItem.find(".like-count");

    const wasLiked = button.hasClass("liked");
    const initialLikeCount = parseInt(likeCountSpan.text());

    const newLikeCount = wasLiked ? initialLikeCount - 1 : initialLikeCount + 1;
    likeCountSpan.text(newLikeCount);
    button.toggleClass("liked", !wasLiked);

    if (!wasLiked) {
      for (let i = 0; i < 7; i++) {
        const particle = $('<span class="like-particle">♥</span>');
        button.append(particle);
        const xOffset = (Math.random() - 0.5) * 40;
        const yOffset = (Math.random() - 0.5) * 20;
        const delay = Math.random() * 0.3;
        particle.css({
          transform: `translate(${xOffset}px, ${yOffset}px)`,
          "animation-delay": `${delay}s`
        });
        setTimeout(() => {
          particle.remove();
        }, 1000);
      }
    }

    toggleLikeComment(commentId, null, (error) => {
      showPopup("An error occurred. Please try again.", false);
      likeCountSpan.text(initialLikeCount);
      button.toggleClass("liked", wasLiked);
    });
  });

  $(document).on("click", ".report-comment-btn", function () {
    if (!currentUser) {
      showPopup("Please log in to report comments.", false);
      return;
    }

    const commentItem = $(this).closest(".comment-item");
    const commentId = commentItem.data("comment-id");

    showDialog("Are you sure you want to report this comment?").then((userClickedYes) => {
      if (userClickedYes) {
        reportComment(
          commentId,
          () => showPopup("Comment reported. Thank you for your feedback.", true),
          () => showPopup("Failed to report comment. Please try again.", false)
        );
      }
    });
  });

  $("#bookmark-btn, #share-btn, #ai-summarize-btn")
    .off("click")
    .on("click", function () {
      showPopup("This feature is coming soon!", "muted");
    });
}

function formatContent(content) {
  if (!content) {
    return "<p>No content available. Please read the full story on the source website.</p>";
  }
  const cleaned = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");
  return cleaned
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "Unknown Date";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    return "Unknown Date";
  }
}
