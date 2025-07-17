let currentUser = null;
let currentArticle = null;

$(document).ready(function () {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (articleId) {
    getArticleById(
      articleId,
      function (articleData) {
        currentArticle = articleData;
        showArticle();
      },
      function () {
        showError();
      }
    );
  } else {
    showError();
  }

  setupArticleEventHandlers();
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
    currentUser ? currentUser.id : null,
    function (comments) {
      showComments(comments);
    },
    function () {
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
    const isAuthorBlocked = blockedUsers.some((user) => user.id == comment.authorId);
    const isLiked = comment.isLikedByCurrentUser;
    const likeCount = comment.likeCount;
    const isAuthor = currentUser && currentUser.id == comment.authorId;
    const isAdmin = currentUser && currentUser.isAdmin;

    let actionsHtml = "";
    if (!isAuthor) {
      actionsHtml += `<button class="report-comment-btn action-icon-btn" title="Report comment"><img src="../sources/icons/flag-svgrepo-com.svg" alt="Report" /></button>`;
      if (isAuthorBlocked) {
        actionsHtml += `<button class="unblock-user-btn action-icon-btn" title="Unblock User"><img src="../sources/icons/unblock-svgrepo-com.svg" alt="Unblock" /></button>`;
      } else {
        actionsHtml += `<button class="block-user-btn action-icon-btn" title="Block User"><img src="../sources/icons/block-2-svgrepo-com.svg" alt="Block" /></button>`;
      }
    }
    if (isAuthor) {
      actionsHtml += `<button class="edit-comment-btn action-icon-btn" title="Edit comment"><img src="../sources/icons/edit-3-svgrepo-com.svg" alt="Edit" /></button>`;
    }
    if (isAuthor || isAdmin) {
      actionsHtml += `<button class="delete-comment-btn action-icon-btn" title="Delete comment"><img src="../sources/icons/delete-2-svgrepo-com.svg" alt="Delete" /></button>`;
    }

    const fullCommentHtml = `
        <div class="comment-item" data-comment-id="${comment.id}" data-author-id="${comment.authorId}">
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
            <div class="comment-actions">${actionsHtml}</div>
        </div>`;

    if (isAuthorBlocked) {
      const blockedHtml = `
          <div class="comment-item">
              <div class="blocked-comment-message">
                  <span>Comment from a blocked user.</span>
                  <button class="show-comment-btn" data-full-comment="${encodeURIComponent(fullCommentHtml)}">
                      Show Comment
                  </button>
              </div>
          </div>`;
      commentsList.append(blockedHtml);
    } else {
      commentsList.append(fullCommentHtml);
    }
  }
}

function setupArticleEventHandlers() {
  $(document)
    .off("click", ".show-comment-btn")
    .on("click", ".show-comment-btn", function () {
      const button = $(this);
      const fullCommentHtml = decodeURIComponent(button.data("full-comment"));
      button.closest(".comment-item").replaceWith(fullCommentHtml);
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

    const commentData = {
      AuthorId: currentUser.id,
      Content: newContent
    };

    updateComment(
      commentId,
      commentData,
      function (response) {
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
    const authorId = parseInt(commentItem.data("author-id"), 10);

    showDialog("Are you sure you want to delete this comment?").then((userClickedYes) => {
      if (!userClickedYes) return;

      deleteComment(
        commentId,
        currentUser.id,
        () => {
          commentItem.fadeOut(300, function () {
            $(this).remove();
            if ($("#comments-list").children(".comment-item").length === 0) {
              $("#comments-list").html('<p class="comment-prompt">No comments yet.</p>');
            }
          });
          showPopup("Comment deleted.", true);

          const isAdminDeletingOthersComment = currentUser.isAdmin && currentUser.id !== authorId;

          if (isAdminDeletingOthersComment) {
            setTimeout(() => {
              showDialog("Do you also want to ban this user?").then((wantsToBan) => {
                if (wantsToBan) {
                  toggleUserStatus(
                    authorId,
                    "IsLocked",
                    () => showPopup("User has been banned successfully.", true),
                    () => showPopup("Failed to ban user.", false)
                  );
                }
              });
            }, 500);
          }
        },
        () => showPopup("Failed to delete comment. Please try again.", false)
      );
    });
  });

  $(document).on("click", ".block-user-btn", function () {
    if (!currentUser) {
      showPopup("Please log in to block users.", false);
      return;
    }

    const commentItem = $(this).closest(".comment-item");
    const authorId = commentItem.data("author-id");

    showDialog("Are you sure you want to block this user?").then((userClickedYes) => {
      if (!userClickedYes) return;

      toggleBlockUser(
        currentUser.id,
        authorId,
        () => {
          if (!currentUser.blockedUsers) {
            currentUser.blockedUsers = [];
          }
          currentUser.blockedUsers.push({ id: authorId });
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
          showPopup("User has been blocked.", true);
          loadComments();
        },
        () => {
          showPopup("Failed to block user. Please try again.", false);
        }
      );
    });
  });

  $(document).on("click", ".unblock-user-btn", function () {
    if (!currentUser) {
      showPopup("Please log in.", false);
      return;
    }

    const commentItem = $(this).closest(".comment-item");
    const authorId = commentItem.data("author-id");

    showDialog("Are you sure you want to unblock this user?").then((userClickedYes) => {
      if (!userClickedYes) return;

      toggleBlockUser(
        currentUser.id,
        authorId,
        () => {
          if (currentUser.blockedUsers) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter((user) => user.id != authorId);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
          showPopup("User has been unblocked.", true);
          loadComments();
        },
        () => {
          showPopup("Failed to unblock user. Please try again.", false);
        }
      );
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

    toggleLikeComment(
      commentId,
      currentUser.id,
      () => {},
      () => {
        showPopup("An error occurred. Please try again.", false);
        likeCountSpan.text(initialLikeCount);
        button.toggleClass("liked", wasLiked);
      }
    );
  });

  $(document).on("click", ".report-comment-btn", function () {
    if (!currentUser) {
      showPopup("Please log in to report comments.", false);
      return;
    }

    const commentItem = $(this).closest(".comment-item");
    const commentId = commentItem.data("comment-id");

    showDialog("Are you sure you want to report this comment?", true).then((result) => {
      if (result && result.reported) {
        const reportData = {
          reporterUserId: currentUser.id,
          commentId: commentId,
          reason: result.reasonCategory,
          details: result.reason
        };

        reportComment(
          reportData,
          () => showPopup("Comment reported. Thank you for your feedback.", true),
          () => showPopup("Failed to report comment. Please try again.", false)
        );
      }
    });
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
