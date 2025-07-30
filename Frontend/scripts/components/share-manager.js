class ShareManager {
  static currentUser = null;
  static currentArticle = null;
  static friends = [];

  static init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
    this.setupEventHandlers();
  }

  static setupEventHandlers() {
    $(document).on("click", "#share-article-btn", (e) => this.handleShare(e));
  }

  static handleShare(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to share articles.", false);
      return;
    }
    if (!this.currentArticle) return;

    this.loadFriends(() => {
      this.showShareDialog();
    });
  }

  static loadFriends(callback) {
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
  }

  static showShareDialog(onCloseCallback = null) {
    if ($("#share-article-dialog").length > 0) return;

    const dialogHtml = `
      <div id="share-article-dialog" class="dialog-popup share-article-dialog">
        <div class="dialog-content-wrapper">
          <div class="dialog-header">
            <h3 class="dialog-title">Share Article</h3>
          </div>
          <div class="dialog-body">
            <div class="article-preview">
              <h4 class="article-title">${this.currentArticle.title || "Untitled Article"}</h4>
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
            </div>
          </div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-share" id="confirmShare" disabled>Share</button>
          </div>
        </div>
      </div>
    `;

    $("body").append(dialogHtml);
    setTimeout(() => $("#share-article-dialog").addClass("show"), 10);
    this.setupDialogEventHandlers(onCloseCallback);
  }

  static renderFriendsList() {
    return this.friends
      .map(
        (friend) => `
        <div class="friend-item">
          <label class="friend-checkbox-label">
            <input type="checkbox" class="friend-checkbox" data-friend-id="${friend.id}" data-friend-name="${friend.fullName}">
            <span class="checkmark"></span>
            <img src="${friend.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${friend.fullName}" class="friend-avatar" />
            <span class="friend-name">${friend.fullName}</span>
          </label>
        </div>
      `
      )
      .join("");
  }

  static setupDialogEventHandlers(onCloseCallback = null) {
    // Close dialog on outside click
    $(document).on("click.shareDialog", (e) => {
      if (!$(e.target).closest("#share-article-dialog .dialog-content-wrapper").length) {
        this.closeShareDialog(onCloseCallback);
      }
    });

    // Friend selection handlers
    $(document).on("change", ".friend-checkbox", () => this.updateShareButton());

    // Share button handler
    $("#confirmShare").on("click", () => this.processShare(onCloseCallback));

    $(document).on("keydown.shareDialog", (e) => {
      if (e.key === "Escape") {
        this.closeShareDialog(onCloseCallback);
      }
    });
  }

  static updateShareButton() {
    const selectedFriends = $(".friend-checkbox:checked").length;
    const shareButton = $("#confirmShare");

    if (selectedFriends > 0) {
      shareButton.prop("disabled", false).removeClass("disabled");
    } else {
      shareButton.prop("disabled", true).addClass("disabled");
    }
  }

  static processShare(onCloseCallback = null) {
    const selectedFriends = this.getSelectedFriends();

    if (selectedFriends.length === 0) {
      UIManager.showPopup("Please select at least one friend to share with.", false);
      return;
    }

    const message = $("#shareMessage").val().trim();
    Utils.setButtonLoading($("#confirmShare"), "Sharing...");
    this.sendSharesToFriends(selectedFriends, message, onCloseCallback);
  }

  static getSelectedFriends() {
    const selectedFriends = [];
    $(".friend-checkbox:checked").each(function () {
      selectedFriends.push({
        id: parseInt($(this).data("friend-id")),
        name: $(this).data("friend-name")
      });
    });
    return selectedFriends;
  }

  static sendSharesToFriends(selectedFriends, message, onCloseCallback) {
    let sharesSent = 0;
    const sharesTotal = selectedFriends.length;
    const errors = [];

    selectedFriends.forEach((friend) => {
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
  }

  static handleShareComplete(total, errors, onCloseCallback = null) {
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
  }

  static closeShareDialog(onCloseCallback = null) {
    $("#share-article-dialog").removeClass("show");
    setTimeout(() => {
      $("#share-article-dialog").remove();
      $(document).off("click.shareDialog");
      $(document).off("keydown.shareDialog");
      if (onCloseCallback && typeof onCloseCallback === "function") {
        onCloseCallback();
      }
    }, 400);
  }
}

window.ShareManager = ShareManager;
