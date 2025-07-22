const ShareManager = {
  currentUser: null,
  currentArticle: null,
  friends: [],

  init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document).on("click", "#share-article-btn", (e) => this.handleShare(e));
    $(document).on("click", ".article-share-btn", (e) => this.handleShareFromElement(e));
  },

  handleShare(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to share articles.", false);
      return;
    }
    if (!this.currentArticle) return;

    this.loadFriends(() => {
      this.showShareDialog();
    });
  },

  handleShareFromElement(e) {
    e.preventDefault();
    const $button = $(e.currentTarget);
    const articleData = $button.data("article") || $button.closest("[data-article]").data("article");
    
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to share articles.", false);
      return;
    }
    
    if (!articleData) return;

    // Temporarily set the article for sharing
    const originalArticle = this.currentArticle;
    this.currentArticle = articleData;

    this.loadFriends(() => {
      this.showShareDialog(() => {
        // Restore original article after dialog closes
        this.currentArticle = originalArticle;
      });
    });
  },

  loadFriends(callback) {
    getFriends(
      this.currentUser.id,
      (friends) => {
        this.friends = friends;
        if (friends.length === 0) {
          UIManager.showPopup("You need to have friends to share articles with.", false);
          return;
        }
        callback();
      },
      () => {
        UIManager.showPopup("Failed to load friends list. Please try again.", false);
      }
    );
  },

  showShareDialog(onCloseCallback = null) {
    if ($("#share-article-dialog").length > 0) return;

    const dialogHtml = `
      <div id="share-article-dialog" class="dialog-popup share-article-dialog">
        <div class="dialog-content-wrapper">
          <div class="dialog-header">
            <h3 class="dialog-title">Share Article</h3>
            <button class="dialog-close-btn" id="closeShareDialog">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="article-preview">
              <h4 class="article-title">${this.currentArticle.title || 'Untitled Article'}</h4>
            </div>
            <div class="friends-selection">
              <h5>Select friends to share with:</h5>
              <div class="friends-list" id="shareablefriendslist">
                ${this.renderFriendsList()}
              </div>
            </div>
            <div class="message-section">
              <h5>Add a message (optional):</h5>
              <textarea 
                id="shareMessage" 
                class="share-message-input" 
                placeholder="Write a message to your friends..." 
                maxlength="200"
              ></textarea>
              <div class="character-count">
                <span id="messageCharCount">0</span>/200
              </div>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-cancel" id="cancelShare">Cancel</button>
            <button class="dialog-btn dialog-share" id="confirmShare" disabled>Share</button>
          </div>
        </div>
      </div>
    `;

    $("body").append(dialogHtml);
    
    setTimeout(() => $("#share-article-dialog").addClass("show"), 10);

    this.setupDialogEventHandlers(onCloseCallback);
  },

  renderFriendsList() {
    return this.friends.map(friend => `
      <div class="friend-item">
        <label class="friend-checkbox-label">
          <input type="checkbox" class="friend-checkbox" data-friend-id="${friend.id}" data-friend-name="${friend.fullName}">
          <span class="checkmark"></span>
          <img src="${friend.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${friend.fullName}" class="friend-avatar" />
          <span class="friend-name">${friend.fullName}</span>
        </label>
      </div>
    `).join('');
  },

  setupDialogEventHandlers(onCloseCallback = null) {
    // Close dialog handlers
    $(document).on("click.shareDialog", (e) => {
      if (!$(e.target).closest("#share-article-dialog .dialog-content-wrapper").length) {
        this.closeShareDialog(onCloseCallback);
      }
    });

    $("#closeShareDialog, #cancelShare").on("click", () => this.closeShareDialog(onCloseCallback));

    // Friend selection handlers
    $(document).on("change", ".friend-checkbox", () => this.updateShareButton());

    // Message character count
    $("#shareMessage").on("input", (e) => {
      const charCount = e.target.value.length;
      $("#messageCharCount").text(charCount);
    });

    // Share button handler
    $("#confirmShare").on("click", () => this.processShare(onCloseCallback));

    // ESC key to close
    $(document).on("keydown.shareDialog", (e) => {
      if (e.key === "Escape") {
        this.closeShareDialog(onCloseCallback);
      }
    });
  },

  updateShareButton() {
    const selectedFriends = $(".friend-checkbox:checked").length;
    const shareButton = $("#confirmShare");
    
    if (selectedFriends > 0) {
      shareButton.prop("disabled", false).removeClass("disabled");
    } else {
      shareButton.prop("disabled", true).addClass("disabled");
    }
  },

  processShare(onCloseCallback = null) {
    const selectedFriends = [];
    $(".friend-checkbox:checked").each(function() {
      selectedFriends.push({
        id: parseInt($(this).data("friend-id")),
        name: $(this).data("friend-name")
      });
    });

    if (selectedFriends.length === 0) {
      UIManager.showPopup("Please select at least one friend to share with.", false);
      return;
    }

    const message = $("#shareMessage").val().trim();
    
    // Show loading state
    $("#confirmShare").prop("disabled", true).text("Sharing...");

    // Send shares to each selected friend
    let sharesSent = 0;
    let sharesTotal = selectedFriends.length;
    let errors = [];

    selectedFriends.forEach(friend => {
      const shareData = {
        SenderId: this.currentUser.id,
        RecipientId: friend.id,
        ArticleId: this.currentArticle.id,
        Message: message || null
      };

      shareArticle(
        shareData,
        () => {
          sharesSent++;
          if (sharesSent === sharesTotal) {
            this.handleShareComplete(sharesTotal, errors, onCloseCallback);
          }
        },
        () => {
          errors.push(friend.name);
          sharesSent++;
          if (sharesSent === sharesTotal) {
            this.handleShareComplete(sharesTotal, errors, onCloseCallback);
          }
        }
      );
    });
  },

  handleShareComplete(total, errors, onCloseCallback = null) {
    this.closeShareDialog(onCloseCallback);
    
    if (errors.length === 0) {
      const friendText = total === 1 ? "friend" : "friends";
      UIManager.showPopup(`Article shared successfully with ${total} ${friendText}!`, true);
    } else if (errors.length === total) {
      UIManager.showPopup("Failed to share article. Please try again.", false);
    } else {
      const successCount = total - errors.length;
      const friendText = successCount === 1 ? "friend" : "friends";
      UIManager.showPopup(`Article shared with ${successCount} ${friendText}. Some shares failed.`, true);
    }
  },

  closeShareDialog(onCloseCallback = null) {
    $("#share-article-dialog").removeClass("show");
    setTimeout(() => {
      $("#share-article-dialog").remove();
      $(document).off("click.shareDialog");
      $(document).off("keydown.shareDialog");
      if (onCloseCallback && typeof onCloseCallback === 'function') {
        onCloseCallback();
      }
    }, 400);
  }
};

window.ShareManager = ShareManager;
