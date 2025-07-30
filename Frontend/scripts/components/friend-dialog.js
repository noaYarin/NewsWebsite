class GlobalFriendDialog {
  static currentFriends = new Set();
  static pendingFriendRequests = new Set();
  static outgoingFriendRequests = new Set();
  static searchPagination = {
    currentPage: 1,
    pageSize: CONSTANTS.SEARCH_PAGE_SIZE,
    hasNextPage: false,
    isLoading: false,
    lastSearchTerm: ""
  };

  static init() {
    this.loadUserFriendshipData();
  }

  static reloadFriendshipState() {
    this.loadUserFriendshipData();
    setTimeout(() => this.refreshCurrentSearchResults(), 500);
  }

  static loadUserFriendshipData() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser?.id) return;

    getFriends(currentUser.id, (friends) => {
      this.currentFriends.clear();
      friends.forEach((friend) => this.currentFriends.add(friend.id));
    });

    getPendingFriendRequests(currentUser.id, (incomingRequests) => {
      this.pendingFriendRequests.clear();
      incomingRequests.forEach((request) => this.pendingFriendRequests.add(request.id));
    });

    getOutgoingFriendRequests(currentUser.id, (outgoingRequests) => {
      this.outgoingFriendRequests.clear();
      outgoingRequests.forEach((request) => this.outgoingFriendRequests.add(request.id));
    });
  }

  static showAddFriendDialog() {
    if ($("#add-friend-dialog").length > 0) return;

    const dialogHtml = `
      <div id="add-friend-dialog" class="dialog-popup add-friend-dialog">
        <div class="dialog-content-wrapper">
          <p class="dialog-message">Add Friend</p>
          <div class="add-friend-form">
            <div class="search-input-row">
              <input type="text" id="friendEmailInput" placeholder="Enter email or name..." autocomplete="off" />
              <button class="search-btn" id="searchUserButton">
                <img src="../sources/icons/search-svgrepo-com-menu.svg" />
              </button>
            </div>
          </div>
          <div id="searchResultsSection" class="search-results-section"></div>
        </div>
      </div>
    `;

    $("body").append(dialogHtml);
    $("#friendEmailInput").focus();
    $("#add-friend-dialog").addClass("show");

    $(document).on("click.addFriend", (e) => {
      // Close dialog if clicked not on dialog or button
      if (!$(e.target).closest("#add-friend-dialog").length && !$(e.target).closest("#addFriendsBtn").length) {
        this.closeAddFriendDialog();
      }
    });

    $("#searchUserButton").on("click", (e) => this.handleUserSearch(e));
    $("#friendEmailInput")
      .on("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleUserSearch(e);
        }
      })
      .on("input", function () {
        if (!$(this).val().trim()) {
          $("#searchResultsSection").removeClass("show");
          GlobalFriendDialog.searchPagination.lastSearchTerm = "";
        }
      });
  }

  static closeAddFriendDialog() {
    $("#add-friend-dialog").removeClass("show");
    setTimeout(() => {
      $("#add-friend-dialog").remove();
      $(document).off("click.addFriend");
      this.resetSearchPagination();
    }, 500);
  }

  static resetSearchPagination() {
    this.searchPagination = {
      currentPage: 1,
      pageSize: CONSTANTS.SEARCH_PAGE_SIZE,
      hasNextPage: false,
      isLoading: false,
      lastSearchTerm: ""
    };
  }

  static handleUserSearch(e) {
    if (e) e.stopPropagation();

    const searchInput = $("#friendEmailInput");
    const searchTerm = searchInput.val().trim();

    if (!searchTerm) {
      Utils.showInputError(searchInput);
      return;
    }

    if (searchTerm === this.searchPagination.lastSearchTerm) return;

    this.searchPagination.currentPage = 1;
    this.performSearch(searchTerm);
  }

  static performSearch(searchTerm) {
    const resultsSection = $("#searchResultsSection");
    if (this.searchPagination.isLoading) return;

    this.searchPagination.isLoading = true;
    this.searchPagination.lastSearchTerm = searchTerm;

    resultsSection.html(Utils.createLoadingIndicator()).addClass("show");

    searchUsersPaginated(
      searchTerm,
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        this.displaySearchResults(response.users, this.searchPagination.currentPage === 1);
      },
      () => {
        this.searchPagination.isLoading = false;
        UIManager.showPopup("Error searching for users.", false);
      }
    );
  }

  static displaySearchResults(users, isNewSearch) {
    const currentUser = Utils.getCurrentUser();
    const resultsSection = $("#searchResultsSection");

    if (isNewSearch) {
      resultsSection.html('<div class="user-search-results"></div>');
      this.setupEventDelegation(resultsSection);
    }

    const resultsContainer = resultsSection.find(".user-search-results");

    if (isNewSearch && users.length === 0) {
      resultsContainer.html('<p class="empty-search-message">No users found.</p>');
      return;
    }

    const userItems = users
      .filter((user) => user.id !== currentUser.id)
      .map((user) => {
        const buttonState = this.getButtonState(user);
        return `
          <div class="user-search-item" data-user-id="${user.id}">
            <img src="${user.imageUrl || CONSTANTS.NO_IMAGE_URL}"
                 alt="${user.fullName}" class="user-list-avatar" />
            <div class="user-info">
              <span class="user-list-name">${user.fullName}</span>
              <span class="user-email">${user.email}</span>
            </div>
            <button type="button" class="${buttonState.cssClass}" 
                    data-user-id="${user.id}" data-user-name="${user.fullName}">
              ${buttonState.text}
            </button>
          </div>
        `;
      })
      .join("");

    resultsContainer.append(userItems);
    this.setupInfiniteScroll(resultsSection, this.searchPagination.lastSearchTerm);
  }

  static getButtonState(user) {
    if (this.currentFriends.has(user.id)) {
      return { text: "Unfriend", cssClass: "unfriend-btn danger-btn" };
    }
    if (this.outgoingFriendRequests.has(user.id)) {
      return { text: "Cancel Request", cssClass: "cancel-friend-request-btn success-btn" };
    }
    if (this.pendingFriendRequests.has(user.id)) {
      return { text: "Accept", cssClass: "accept-friend-request-btn primary-btn" };
    }
    return { text: "Send Request", cssClass: "send-friend-request-btn" };
  }

  static setupEventDelegation(resultsSection) {
    resultsSection.off("click.friendButtons").on("click.friendButtons", "button", (e) => {
      const button = $(e.currentTarget);

      if (button.hasClass("send-friend-request-btn")) {
        this.handleFriendAction(e, "send");
      } else if (button.hasClass("cancel-friend-request-btn")) {
        this.handleFriendAction(e, "cancel");
      } else if (button.hasClass("accept-friend-request-btn")) {
        this.handleFriendAction(e, "accept");
      } else if (button.hasClass("unfriend-btn")) {
        this.handleFriendAction(e, "unfriend");
      }
    });
  }

  static setupInfiniteScroll(resultsSection, searchTerm) {
    resultsSection.off("scroll.infiniteSearch");
    if (!this.searchPagination.hasNextPage) return;
    resultsSection.on("scroll.infiniteSearch", () => {
      if (resultsSection.scrollTop() + resultsSection.innerHeight() >= resultsSection[0].scrollHeight - 100) {
        this.loadMoreUsers(searchTerm);
      }
    });
  }

  static loadMoreUsers(searchTerm) {
    if (this.searchPagination.isLoading) return;

    this.searchPagination.isLoading = true;
    this.searchPagination.currentPage++;

    const resultsContainer = $("#searchResultsSection .user-search-results");
    resultsContainer.append(Utils.createLoadingIndicator());

    searchUsersPaginated(
      searchTerm,
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        resultsContainer.find(".sun-loading").remove();
        this.displaySearchResults(response.users, false);
      },
      () => {
        this.searchPagination.isLoading = false;
        this.searchPagination.currentPage--;
        resultsContainer.find(".sun-loading").remove();
      }
    );
  }

  static handleFriendAction(e, actionType) {
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    if (actionType === "unfriend") {
      UIManager.showDialog(`Are you sure you want to unfriend ${userName}?`).then((confirmed) => {
        if (confirmed) {
          this.executeFriendAction(button, userId, userName, actionType);
        }
      });
      return;
    }

    this.executeFriendAction(button, userId, userName, actionType);
  }

  static executeFriendAction(button, userId, userName, actionType) {
    const currentUser = Utils.getCurrentUser();

    const actionConfig = {
      send: {
        loadingText: "Sending...",
        apiCall: (successCB, errorCB) => sendFriendRequest({ SenderId: currentUser.id, RecipientId: userId }, successCB, errorCB),
        successMessage: `Friend request sent to ${userName}!`,
        successAction: () => this.outgoingFriendRequests.add(userId),
        successButton: { text: "Cancel Request", classes: "cancel-friend-request-btn success-btn", oldClasses: "send-friend-request-btn" },
        errorButton: { text: "Send Request" }
      },
      cancel: {
        loadingText: "Canceling...",
        apiCall: (successCB, errorCB) => cancelFriendRequest({ SenderId: currentUser.id, RecipientId: userId }, successCB, errorCB),
        successMessage: `Friend request to ${userName} unsent.`,
        successAction: () => this.outgoingFriendRequests.delete(userId),
        successButton: { text: "Send Request", classes: "send-friend-request-btn", oldClasses: "cancel-friend-request-btn success-btn" },
        errorButton: { text: "Cancel Request" }
      },
      accept: {
        loadingText: "Accepting...",
        apiCall: (successCB, errorCB) => respondToFriendRequest({ RequesterId: userId, ResponderId: currentUser.id, Response: 1 }, successCB, errorCB),
        successMessage: `You are now friends with ${userName}!`,
        successAction: () => {
          this.pendingFriendRequests.delete(userId);
          this.currentFriends.add(userId);
          if (window.ProfileFriendsManager) ProfileFriendsManager.loadAndPopulateFriendsList();
        },
        successButton: { text: "Unfriend", classes: "unfriend-btn danger-btn", oldClasses: "accept-friend-request-btn primary-btn" },
        errorButton: { text: "Accept" }
      },
      unfriend: {
        loadingText: "Unfriending...",
        apiCall: (successCB, errorCB) => removeFriend({ userId: currentUser.id, friendId: userId }, successCB, errorCB),
        successMessage: `${userName} has been removed from your friends list.`,
        successAction: () => {
          this.currentFriends.delete(userId);
          if (window.ProfileFriendsManager) ProfileFriendsManager.loadAndPopulateFriendsList();
        },
        successButton: { text: "Send Request", classes: "send-friend-request-btn", oldClasses: "unfriend-btn danger-btn" },
        errorButton: { text: "Unfriend" }
      }
    };

    const config = actionConfig[actionType];
    Utils.setButtonLoading(button, config.loadingText);

    config.apiCall(
      () => {
        UIManager.showPopup(config.successMessage, true);
        config.successAction();
        Utils.updateButtonState(button, config.successButton.text, config.successButton.classes, config.successButton.oldClasses);
      },
      () => {
        Utils.resetButtonState(button, config.errorButton.text);
        UIManager.showPopup(`Failed to ${actionType} friend request.`, false);
      }
    );
  }
}

window.GlobalFriendDialog = GlobalFriendDialog;
$(() => GlobalFriendDialog.init());
