const CommentManager = {
  currentUser: null,
  currentArticle: null,
  currentFriends: new Set(),
  outgoingFriendRequests: new Set(),
  pendingFriendRequests: new Set(),
  lastCommentsData: null,

  init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
    if (this.currentUser) {
      this.loadFriendshipData().then(() => {
        if (this.lastCommentsData) {
          this.display(this.lastCommentsData);
        }
      });
    }
  },

  loadFriendshipData() {
    if (!this.currentUser || !this.currentUser.id) return Promise.resolve();

    const promises = [];

    const friendsPromise = new Promise((resolve) => {
      getFriends(
        this.currentUser.id,
        (friends) => {
          this.currentFriends.clear();
          friends.forEach((friend) => this.currentFriends.add(friend.id));
          resolve();
        },
        () => resolve()
      );
    });

    const pendingPromise = new Promise((resolve) => {
      getPendingFriendRequests(
        this.currentUser.id,
        (incomingRequests) => {
          this.pendingFriendRequests.clear();
          incomingRequests.forEach((request) => this.pendingFriendRequests.add(request.id));
          resolve();
        },
        () => resolve()
      );
    });

    const outgoingPromise = new Promise((resolve) => {
      getOutgoingFriendRequests(
        this.currentUser.id,
        (outgoingRequests) => {
          this.outgoingFriendRequests.clear();
          outgoingRequests.forEach((request) => this.outgoingFriendRequests.add(request.id));
          resolve();
        },
        () => resolve()
      );
    });

    promises.push(friendsPromise, pendingPromise, outgoingPromise);
    return Promise.all(promises);
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
      (comments) => {
        this.lastCommentsData = comments;

        if (this.currentUser) {
          const friendshipPromise = this.loadFriendshipData();
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));

          Promise.race([friendshipPromise, timeoutPromise]).then(() => {
            this.display(comments);
          });
        } else {
          this.display(comments);
        }
      },
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

    const isAlreadyFriend = this.currentFriends.has(comment.authorId);
    const hasPendingOutgoing = this.outgoingFriendRequests.has(comment.authorId);
    const hasPendingIncoming = this.pendingFriendRequests.has(comment.authorId);

    let actionsHtml = "";
    if (!isAuthor) {
      actionsHtml += `<button class="report-comment-btn action-icon-btn" title="Report comment"><img src="../sources/icons/flag-svgrepo-com.svg" alt="Report" /></button>`;
      if (isAuthorBlocked) {
        actionsHtml += `<button class="unblock-user-btn action-icon-btn" title="Unblock User"><img src="../sources/icons/unblock-svgrepo-com.svg" alt="Unblock" /></button>`;
      } else {
        actionsHtml += `<button class="block-user-btn action-icon-btn" title="Block User"><img src="../sources/icons/block-2-svgrepo-com.svg" alt="Block" /></button>`;

        if (isAlreadyFriend) {
          actionsHtml += `<button class="unfriend-user-btn action-icon-btn" title="Unfriend User" data-user-id="${comment.authorId}" data-user-name="${comment.authorName}"><img src="../sources/icons/user-remove-svgrepo-com.svg" alt="Unfriend" /></button>`;
        } else if (hasPendingOutgoing) {
          actionsHtml += `<button class="cancel-friend-request-btn action-icon-btn" title="Cancel Friend Request" data-user-id="${comment.authorId}" data-user-name="${comment.authorName}"><img src="../sources/icons/user-unsend-svgrepo-com.svg" alt="Pending" /></button>`;
        } else if (hasPendingIncoming) {
          actionsHtml += `<button class="accept-friend-request-btn action-icon-btn" title="Accept Friend Request" data-user-id="${comment.authorId}" data-user-name="${comment.authorName}"><img src="../sources/icons/user-accept-svgrepo-com.svg" alt="Accept" /></button>`;
        } else {
          actionsHtml += `<button class="send-friend-request-btn action-icon-btn" title="Send Friend Request" data-user-id="${comment.authorId}" data-user-name="${comment.authorName}"><img src="../sources/icons/add-friend-svgrepo-com.svg" alt="Add Friend" /></button>`;
        }
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
    $(document)
      .off("click", ".show-comment-btn")
      .on("click", ".show-comment-btn", (e) => {
        const button = $(e.target).closest(".show-comment-btn");
        const fullCommentHtml = decodeURIComponent(button.data("full-comment"));
        button.closest(".comment-item").replaceWith(fullCommentHtml);
      });

    $("#comment-form")
      .off("submit")
      .on("submit", (e) => this.handleSubmit(e));

    $(document)
      .on("click", ".edit-comment-btn", (e) => this.handleEdit(e))
      .on("click", ".cancel-edit-btn", (e) => this.handleCancelEdit(e))
      .on("click", ".save-edit-btn", (e) => this.handleSaveEdit(e))
      .on("click", ".delete-comment-btn", (e) => this.handleDelete(e))
      .on("click", ".like-comment-btn", (e) => this.handleLike(e))
      .on("click", ".report-comment-btn", (e) => this.handleReport(e))
      .on("click", ".block-user-btn", (e) => this.handleBlock(e))
      .on("click", ".unblock-user-btn", (e) => this.handleUnblock(e))
      .on("click", ".send-friend-request-btn", (e) => this.handleSendFriendRequest(e))
      .on("click", ".unfriend-user-btn", (e) => this.handleUnfriend(e))
      .on("click", ".cancel-friend-request-btn", (e) => this.handleCancelFriendRequest(e))
      .on("click", ".accept-friend-request-btn", (e) => this.handleAcceptFriendRequest(e));
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
  },

  handleSendFriendRequest(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to send friend requests.", false);
      return;
    }

    const button = $(e.target).closest(".send-friend-request-btn");
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    UIManager.showDialog(`Send friend request to ${userName}?`).then((confirmed) => {
      if (!confirmed) return;

      const requestData = {
        SenderId: this.currentUser.id,
        RecipientId: userId
      };

      sendFriendRequest(
        requestData,
        () => {
          this.outgoingFriendRequests.add(userId);
          UIManager.showPopup(`Friend request sent to ${userName}.`, true);
          this.display(this.lastCommentsData || []);
        },
        () => UIManager.showPopup("Failed to send friend request. Please try again.", false)
      );
    });
  },

  handleUnfriend(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in.", false);
      return;
    }

    const button = $(e.target).closest(".unfriend-user-btn");
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    UIManager.showDialog(`Remove ${userName} from your friends list?`).then((confirmed) => {
      if (!confirmed) return;

      const requestData = {
        userId: this.currentUser.id,
        friendId: userId
      };

      removeFriend(
        requestData,
        () => {
          this.currentFriends.delete(userId);
          UIManager.showPopup(`${userName} has been removed from your friends list.`, true);
          this.display(this.lastCommentsData || []);
        },
        () => UIManager.showPopup("Failed to remove friend. Please try again.", false)
      );
    });
  },

  handleCancelFriendRequest(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in.", false);
      return;
    }

    const button = $(e.target).closest(".cancel-friend-request-btn");
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    UIManager.showDialog(`Cancel friend request to ${userName}?`).then((confirmed) => {
      if (!confirmed) return;

      const requestData = {
        SenderId: this.currentUser.id,
        RecipientId: userId
      };

      cancelFriendRequest(
        requestData,
        () => {
          this.outgoingFriendRequests.delete(userId);
          UIManager.showPopup(`Friend request to ${userName} has been cancelled.`, true);
          this.display(this.lastCommentsData || []);
        },
        () => UIManager.showPopup("Failed to cancel friend request. Please try again.", false)
      );
    });
  },

  handleAcceptFriendRequest(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in.", false);
      return;
    }

    const button = $(e.target).closest(".accept-friend-request-btn");
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    UIManager.showDialog(`Accept friend request from ${userName}?`).then((confirmed) => {
      if (!confirmed) return;

      const requestData = {
        RequesterId: userId,
        ResponderId: this.currentUser.id,
        Response: 1
      };

      respondToFriendRequest(
        requestData,
        () => {
          this.pendingFriendRequests.delete(userId);
          this.currentFriends.add(userId);
          UIManager.showPopup(`You are now friends with ${userName}!`, true);
          this.display(this.lastCommentsData || []);
        },
        () => UIManager.showPopup("Failed to accept friend request. Please try again.", false)
      );
    });
  }
};

window.CommentManager = CommentManager;
