const GlobalFriendDialog = {
  pendingFriendRequests: new Set(),
  outgoingFriendRequests: new Set(),
  currentFriends: new Set(),
  searchPagination: {
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    isLoading: false,
    lastSearchTerm: ""
  },
  lastSearchedEmail: null,

  init() {
    this.loadUserFriendshipData();
  },

  reloadFriendshipState() {
    this.loadUserFriendshipData();

    setTimeout(() => this.refreshCurrentSearchResults(), 500);
  },

  loadUserFriendshipData() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || !currentUser.id) return;

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
  },

  showAddFriendDialog() {
    if ($("#add-friend-dialog").length > 0) return;
    const dialogHtml = `
      <div id="add-friend-dialog" class="dialog-popup add-friend-dialog">
        <div class="dialog-content-wrapper">
          <p class="dialog-message">Add Friend</p>
          <div class="add-friend-form">
            <div class="search-input-row">
              <input type="text" id="friendEmailInput" placeholder="Enter email or name..." />
              <button class="search-btn" id="searchUserButton"><img src="../sources/icons/search-svgrepo-com-menu.svg" /></button>
            </div>
          </div>
          <div id="searchResultsSection" class="search-results-section"></div>
        </div>
      </div>
    `;
    $("body").append(dialogHtml);
    $("#friendEmailInput").focus();
    setTimeout(() => $("#add-friend-dialog").addClass("show"), 10);
    $(document).on("click.addFriend", (e) => {
      if (!$(e.target).closest("#add-friend-dialog").length && !$(e.target).is("#addFriendsBtn")) {
        this.closeAddFriendDialog();
      }
    });
    $("#searchUserButton").on("click", (e) => this.handleUserSearch(e));
    $("#friendEmailInput")
      .on("keypress", (e) => {
        if (e.which === 13) {
          e.preventDefault();
          this.handleUserSearch(e);
        }
      })
      .on("input", function () {
        if (!$(this).val().trim()) {
          $("#searchResultsSection").removeClass("show");
        }
      });
  },

  closeAddFriendDialog() {
    $("#add-friend-dialog").removeClass("show");
    setTimeout(() => {
      $("#add-friend-dialog").remove();
      $(document).off("click.addFriend");
    }, 400);
  },

  handleUserSearch(e) {
    if (e) e.stopPropagation();
    const email = $("#friendEmailInput").val().trim();
    if (email === this.lastSearchedEmail) return;
    if (!email) {
      $("#searchResultsSection").removeClass("show");
      return;
    }
    this.lastSearchedEmail = email;
    this.searchPagination.currentPage = 1;
    this.performSearch(email);
  },

  performSearch(searchTerm) {
    const resultsSection = $("#searchResultsSection");
    if (this.searchPagination.isLoading) return;
    this.searchPagination.isLoading = true;
    this.searchPagination.lastSearchTerm = searchTerm;
    resultsSection.html('<div class="loading-spinner"></div>').addClass("show");

    searchUsersPaginated(
      searchTerm,
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        this.displaySearchResults(response.users, true);
      },
      () => {
        this.searchPagination.isLoading = false;
        resultsSection.html('<p class="empty-search-message">Error searching for users.</p>');
      }
    );
  },

  displaySearchResults(users, isNewSearch) {
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
        const btn = this.getButtonState(user);
        return `
        <div class="user-search-item" data-user-id="${user.id}">
          <img src="${user.imageUrl || user.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${user.fullName}" class="user-list-avatar" />
          <div class="user-info"><span class="user-list-name">${user.fullName}</span><span class="user-email">${user.email}</span></div>
          <button type="button" class="${btn.cssClass}" data-user-id="${user.id}" data-user-name="${user.fullName}">${btn.text}</button>
        </div>`;
      })
      .join("");
    resultsContainer.append(userItems);
    this.setupInfiniteScroll(resultsSection, this.searchPagination.lastSearchTerm);
  },

  getButtonState(user) {
    if (this.currentFriends.has(user.id)) return { text: "Unfriend", cssClass: "unfriend-btn danger-btn" };
    if (this.outgoingFriendRequests.has(user.id)) return { text: "Cancel Request", cssClass: "cancel-friend-request-btn success-btn" };
    if (this.pendingFriendRequests.has(user.id)) return { text: "Accept", cssClass: "accept-friend-request-btn primary-btn" };
    return { text: "Send Request", cssClass: "send-friend-request-btn" };
  },

  refreshCurrentSearchResults() {
    const resultsSection = $("#searchResultsSection");
    if (!resultsSection.is(":visible")) return;
    resultsSection.find(".user-search-item").each((i, el) => {
      const item = $(el);
      const userId = item.data("user-id");
      const button = item.find("button");
      const btnState = this.getButtonState({ id: userId });
      button.text(btnState.text).attr("class", btnState.cssClass);
    });
  },

  setupEventDelegation(resultsSection) {
    resultsSection.off("click.friendButtons").on("click.friendButtons", "button", (e) => {
      const button = $(e.currentTarget);
      const handlerMap = {
        "send-friend-request-btn": this.handleSendFriendRequest,
        "cancel-friend-request-btn": this.handleCancelFriendRequest,
        "accept-friend-request-btn": this.handleAcceptFriendRequest,
        "unfriend-btn": this.handleUnfriend
      };
      for (const className in handlerMap) {
        if (button.hasClass(className)) {
          handlerMap[className].call(this, e);
          break;
        }
      }
    });
  },

  setupInfiniteScroll(resultsSection, searchTerm) {
    resultsSection.off("scroll.infiniteSearch");
    if (!this.searchPagination.hasNextPage) return;
    resultsSection.on("scroll.infiniteSearch", () => {
      if (resultsSection.scrollTop() + resultsSection.innerHeight() >= resultsSection[0].scrollHeight - 100) {
        this.loadMoreUsers(searchTerm);
      }
    });
  },

  loadMoreUsers(searchTerm) {
    if (this.searchPagination.isLoading) return;
    this.searchPagination.isLoading = true;
    this.searchPagination.currentPage++;
    const resultsContainer = $("#searchResultsSection .user-search-results");
    resultsContainer.append('<div class="loading-spinner"></div>');

    searchUsersPaginated(
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        resultsContainer.find(".loading-spinner").remove();
        this.displaySearchResults(response.users, false);
      },
      () => {
        this.searchPagination.isLoading = false;
        this.searchPagination.currentPage--;
        resultsContainer.find(".loading-spinner").remove();
      }
    );
  },

  handleSendFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    button.text("Sending...").prop("disabled", true);
    sendFriendRequest(
      { SenderId: currentUser.id, RecipientId: userId },
      () => {
        this.outgoingFriendRequests.add(userId);
        button.text("Cancel Request").prop("disabled", false).removeClass("send-friend-request-btn").addClass("cancel-friend-request-btn success-btn");
      },
      () => {
        button.text("Send Request").prop("disabled", false);
        UIManager.showPopup("Failed to send friend request.", false);
      }
    );
  },

  handleCancelFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    button.text("Canceling...").prop("disabled", true);
    cancelFriendRequest(
      { SenderId: currentUser.id, RecipientId: userId },
      () => {
        this.outgoingFriendRequests.delete(userId);
        button.text("Send Request").prop("disabled", false).removeClass("cancel-friend-request-btn success-btn").addClass("send-friend-request-btn");
      },
      () => {
        button.text("Cancel Request").prop("disabled", false);
        UIManager.showPopup("Failed to cancel friend request.", false);
      }
    );
  },

  handleAcceptFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    button.text("Accepting...").prop("disabled", true);
    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 1 },
      () => {
        this.pendingFriendRequests.delete(userId);
        this.currentFriends.add(userId);
        button.text("Unfriend").prop("disabled", false).removeClass("accept-friend-request-btn primary-btn").addClass("unfriend-btn danger-btn");
        if (window.ProfileFriendsManager) {
          ProfileFriendsManager.loadAndPopulateFriendsList();
        }
      },
      () => {
        button.text("Accept").prop("disabled", false);
        UIManager.showPopup("Failed to accept friend request.", false);
      }
    );
  },

  handleUnfriend(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    UIManager.showDialog(`Are you sure you want to unfriend ${userName}?`).then((confirmed) => {
      if (!confirmed) return;
      button.text("Unfriending...").prop("disabled", true);
      removeFriend(
        { userId: currentUser.id, friendId: userId },
        () => {
          this.currentFriends.delete(userId);
          button.text("Send Request").prop("disabled", false).removeClass("unfriend-btn danger-btn").addClass("send-friend-request-btn");
          if (window.ProfileFriendsManager) {
            ProfileFriendsManager.loadAndPopulateFriendsList();
          }
        },
        () => {
          button.text("Unfriend").prop("disabled", false);
          UIManager.showPopup("Failed to unfriend user.", false);
        }
      );
    });
  }
};

window.GlobalFriendDialog = GlobalFriendDialog;

$(() => GlobalFriendDialog.init());
