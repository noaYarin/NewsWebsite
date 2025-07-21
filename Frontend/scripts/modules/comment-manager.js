const CommentManager = {
  currentUser: null,
  currentArticle: null,

  init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
  },

  setup() {
    if (this.currentUser) {
      $("#comment-form").show();
      $("#comment-form-avatar").attr("src", this.currentUser.imageUrl || CONSTANTS.NO_IMAGE_URL);

      if (this.currentArticle.id) {
        this.load();
      } else {
        $("#comments-list").html('<p class="comment-prompt">Comments are not available for this article.</p>');
      }
    } else {
      $("#comment-form").hide();
      $("#comments-list").html('<p class="comment-prompt">Please log in to view and post comments.</p>');
    }
  },

  load() {
    if (!this.currentArticle.id) {
      $("#comments-list").html('<p class="comment-prompt">No comments available for this article.</p>');
      return;
    }

    $("#comments-list").html('<p class="comment-prompt">Loading comments...</p>');

    getComments(
      this.currentArticle.id,
      this.currentUser ? this.currentUser.id : null,
      (comments) => this.display(comments),
      () => $("#comments-list").html('<p class="comment-prompt">Could not load comments.</p>')
    );
  },

  display(comments) {
    const commentsList = $("#comments-list");
    commentsList.empty();

    if (!comments || comments.length === 0) {
      commentsList.html('<p class="comment-prompt">No comments yet.</p>');
      return;
    }

    const blockedUsers = this.currentUser ? this.currentUser.blockedUsers || [] : [];

    comments.forEach((comment) => {
      const commentHtml = this.generateHtml(comment, blockedUsers);
      commentsList.append(commentHtml);
    });
  },

  generateHtml(comment, blockedUsers) {
    const isAuthorBlocked = blockedUsers.some((user) => user.id == comment.authorId);
    const isLiked = comment.isLikedByCurrentUser;
    const likeCount = comment.likeCount;
    const isAuthor = this.currentUser && this.currentUser.id == comment.authorId;
    const isAdmin = this.currentUser && this.currentUser.isAdmin;

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
            <img src="${comment.authorAvatar || CONSTANTS.NO_IMAGE_URL}"
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
      return `
          <div class="comment-item">
              <div class="blocked-comment-message">
                  <span>Comment from a blocked user.</span>
                  <button class="show-comment-btn" data-full-comment="${encodeURIComponent(fullCommentHtml)}">
                      Show Comment
                  </button>
              </div>
          </div>`;
    }

    return fullCommentHtml;
  },

  setupEventHandlers() {
    // Show blocked comment
    $(document)
      .off("click", ".show-comment-btn")
      .on("click", ".show-comment-btn", (e) => {
        const button = $(e.target).closest(".show-comment-btn");
        const fullCommentHtml = decodeURIComponent(button.data("full-comment"));
        button.closest(".comment-item").replaceWith(fullCommentHtml);
      });

    // Comment form submission
    $("#comment-form")
      .off("submit")
      .on("submit", (e) => this.handleSubmit(e));

    // Comment actions
    $(document)
      .on("click", ".edit-comment-btn", (e) => this.handleEdit(e))
      .on("click", ".cancel-edit-btn", (e) => this.handleCancelEdit(e))
      .on("click", ".save-edit-btn", (e) => this.handleSaveEdit(e))
      .on("click", ".delete-comment-btn", (e) => this.handleDelete(e))
      .on("click", ".like-comment-btn", (e) => this.handleLike(e))
      .on("click", ".report-comment-btn", (e) => this.handleReport(e))
      .on("click", ".block-user-btn", (e) => this.handleBlock(e))
      .on("click", ".unblock-user-btn", (e) => this.handleUnblock(e));
  },

  handleSubmit(e) {
    e.preventDefault();
    const textarea = $(e.target).find("textarea");
    const commentText = textarea.val().trim();

    if (commentText === "") {
      UIManager.showPopup("Please enter a comment.", false);
      return;
    }
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to comment.", false);
      return;
    }

    textarea.val("");
    const commentData = {
      ArticleId: this.currentArticle.id,
      Content: commentText,
      AuthorId: this.currentUser.id
    };

    addComment(
      commentData,
      () => this.load(),
      () => {
        UIManager.showPopup("Failed to post comment. Please try again.", false);
        this.load();
      }
    );
  },

  handleEdit(e) {
    const commentItem = $(e.target).closest(".comment-item");
    commentItem.find(".comment-text").hide();
    commentItem.find(".comment-edit-form").show();
  },

  handleCancelEdit(e) {
    const commentItem = $(e.target).closest(".comment-item");
    commentItem.find(".comment-edit-form").hide();
    commentItem.find(".comment-text").show();
    const originalText = commentItem.find(".comment-text").text();
    commentItem.find(".comment-edit-textarea").val(originalText);
  },

  handleSaveEdit(e) {
    const commentItem = $(e.target).closest(".comment-item");
    const commentId = commentItem.data("comment-id");
    const textarea = commentItem.find(".comment-edit-textarea");
    const newContent = textarea.val().trim();

    if (newContent === "") {
      UIManager.showPopup("Comment cannot be empty.", false);
      return;
    }

    const commentData = { AuthorId: this.currentUser.id, Content: newContent };

    updateComment(
      commentId,
      commentData,
      (response) => {
        commentItem.find(".comment-text").text(newContent).show();
        commentItem.find(".comment-edit-form").hide();
        UIManager.showPopup("Comment updated successfully.", true);
      },
      () => UIManager.showPopup("Failed to update comment. Please try again.", false)
    );
  },

  handleDelete(e) {
    const commentItem = $(e.target).closest(".comment-item");
    const commentId = commentItem.data("comment-id");
    const authorId = parseInt(commentItem.data("author-id"), 10);

    UIManager.showDialog("Are you sure you want to delete this comment?").then((userClickedYes) => {
      if (!userClickedYes) return;

      deleteComment(
        commentId,
        this.currentUser.id,
        () => {
          commentItem.fadeOut(300, function () {
            $(this).remove();
            if ($("#comments-list").children(".comment-item").length === 0) {
              $("#comments-list").html('<p class="comment-prompt">No comments yet.</p>');
            }
          });
          UIManager.showPopup("Comment deleted.", true);

          const isAdminDeletingOthersComment = this.currentUser.isAdmin && this.currentUser.id !== authorId;

          if (isAdminDeletingOthersComment) {
            setTimeout(() => {
              UIManager.showDialog("Do you also want to ban this user?").then((wantsToBan) => {
                if (wantsToBan) {
                  toggleUserStatus(
                    authorId,
                    "IsLocked",
                    () => UIManager.showPopup("User has been banned successfully.", true),
                    () => UIManager.showPopup("Failed to ban user.", false)
                  );
                }
              });
            }, 500);
          }
        },
        () => UIManager.showPopup("Failed to delete comment. Please try again.", false)
      );
    });
  },

  handleLike(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to like comments.", false);
      return;
    }

    const button = $(e.target).closest(".like-comment-btn");
    const commentItem = button.closest(".comment-item");
    const commentId = commentItem.data("comment-id");
    const likeCountSpan = commentItem.find(".like-count");

    const wasLiked = button.hasClass("liked");
    const initialLikeCount = parseInt(likeCountSpan.text());
    const newLikeCount = wasLiked ? initialLikeCount - 1 : initialLikeCount + 1;
    likeCountSpan.text(newLikeCount);
    button.toggleClass("liked", !wasLiked);

    if (!wasLiked) {
      this.createLikeParticles(button);
    }

    toggleLikeComment(
      commentId,
      this.currentUser.id,
      () => {},
      () => {
        UIManager.showPopup("An error occurred. Please try again.", false);
        likeCountSpan.text(initialLikeCount);
        button.toggleClass("liked", wasLiked);
      }
    );
  },

  handleReport(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to report comments.", false);
      return;
    }

    const commentItem = $(e.target).closest(".comment-item");
    const commentId = commentItem.data("comment-id");

    UIManager.showDialog("Are you sure you want to report this comment?", true).then((result) => {
      if (result && result.reported) {
        const reportData = {
          reporterUserId: this.currentUser.id,
          commentId: commentId,
          reason: result.reasonCategory,
          details: result.reason
        };

        reportComment(
          reportData,
          () => UIManager.showPopup("Comment reported. Thank you for your feedback.", true),
          () => UIManager.showPopup("Failed to report comment. Please try again.", false)
        );
      }
    });
  },

  handleBlock(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to block users.", false);
      return;
    }

    const commentItem = $(e.target).closest(".comment-item");
    const authorId = commentItem.data("author-id");

    UIManager.showDialog("Are you sure you want to block this user?").then((userClickedYes) => {
      if (!userClickedYes) return;

      toggleBlockUser(
        this.currentUser.id,
        authorId,
        () => {
          this.updateBlockedUsersList(authorId, true);
          UIManager.showPopup("User has been blocked.", true);
          this.load();
        },
        () => UIManager.showPopup("Failed to block user. Please try again.", false)
      );
    });
  },

  handleUnblock(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in.", false);
      return;
    }

    const commentItem = $(e.target).closest(".comment-item");
    const authorId = commentItem.data("author-id");

    UIManager.showDialog("Are you sure you want to unblock this user?").then((userClickedYes) => {
      if (!userClickedYes) return;

      toggleBlockUser(
        this.currentUser.id,
        authorId,
        () => {
          this.updateBlockedUsersList(authorId, false);
          UIManager.showPopup("User has been unblocked.", true);
          this.load();
        },
        () => UIManager.showPopup("Failed to unblock user. Please try again.", false)
      );
    });
  },

  updateBlockedUsersList(userId, isBlocking) {
    if (!this.currentUser.blockedUsers) {
      this.currentUser.blockedUsers = [];
    }

    if (isBlocking) {
      this.currentUser.blockedUsers.push({ id: userId });
    } else {
      this.currentUser.blockedUsers = this.currentUser.blockedUsers.filter((user) => user.id != userId);
    }

    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
  },

  createLikeParticles(button) {
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
      setTimeout(() => particle.remove(), 1000);
    }
  }
};

window.CommentManager = CommentManager;
