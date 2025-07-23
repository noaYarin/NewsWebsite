const ProfileFriendsManager = {
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
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document)
      .on("click", "#addFriendsBtn", () => this.showAddFriendDialog())
      .on("click", ".remove-friend-btn", (e) => this.handleRemoveFriend(e))
      .on("click", ".accept-friend-btn", (e) => this.handleAcceptFriendRequest(e))
      .on("click", ".decline-friend-btn", (e) => this.handleDeclineFriendRequest(e));
  },

  loadAndPopulateFriendsList() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser) return;

    $("#friendsList").hide();
    $(".friends-count").text("Loading friends...");

    getFriends(
      currentUser.id,
      (friends) => {
        this.populateFriendsList(friends);
        $("#friendsList").show();
        this.loadPendingFriendRequests();
        this.refreshCurrentSearchResults();
      },
      () => {
        $("#friendsList").html('<div class="alert alert-danger">Failed to load friends list.</div>').show();
      }
    );
  },

  populateFriendsList(friends) {
    const listContainer = $("#friendsList");
    listContainer.empty();

    this.currentFriends.clear();
    friends.forEach((friend) => this.currentFriends.add(friend.id));

    $(".friends-count").text(`${friends.length} friend${friends.length !== 1 ? "s" : ""}`);

    if (friends.length === 0) {
      listContainer.html('<p class="empty-list-message">You have no friends yet.</p>');
      return;
    }

    friends.forEach((friend) => {
      listContainer.append(`
        <div class="user-list-item" data-friend-id="${friend.id}">
          <img src="${friend.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${friend.fullName}" class="user-list-avatar" />
          <span class="user-list-name">${friend.fullName}</span>
          <button type="button" class="unblock-btn remove-friend-btn" 
                  data-friend-id="${friend.id}" 
                  data-friend-name="${friend.fullName}"
                  title="Remove Friend">Remove</button>
        </div>
      `);
    });
  },

  handleRemoveFriend(e) {
    const currentUser = Utils.getCurrentUser();
    const friendId = $(e.currentTarget).data("friend-id");
    const friendName = $(e.currentTarget).data("friend-name");

    UIManager.showDialog(`Are you sure you want to remove ${friendName} from your friends list?`).then((confirmed) => {
      if (!confirmed) return;

      removeFriend(
        { userId: currentUser.id, friendId },
        () => {
          UIManager.showPopup(`${friendName} has been removed from your friends list.`, true);
          this.loadAndPopulateFriendsList();
        },
        () => UIManager.showPopup("Failed to remove friend. Please try again.", false)
      );
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
      if (!$(e.target).closest("#add-friend-dialog").length) {
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
        $(this).removeClass("error");
        if (!$(this).val().trim()) {
          $("#searchResultsSection").removeClass("show");
          ProfileFriendsManager.lastSearchedEmail = null;
        }
      });
  },

  closeAddFriendDialog() {
    $("#add-friend-dialog").removeClass("show");
    setTimeout(() => {
      $("#add-friend-dialog").remove();
      $(document).off("click.addFriend");
      this.lastSearchedEmail = null;
      this.searchPagination.currentPage = 1;
      this.searchPagination.hasNextPage = false;
      this.searchPagination.isLoading = false;
      this.searchPagination.lastSearchTerm = "";
    }, 400);
  },

  handleUserSearch(e) {
    if (e) e.stopPropagation();

    const email = $("#friendEmailInput").val().trim();
    const emailInput = $("#friendEmailInput");
    const resultsSection = $("#searchResultsSection");

    if (email === this.lastSearchedEmail) return;

    emailInput.removeClass("error");

    if (!email) {
      resultsSection.removeClass("show");
      emailInput.addClass("error");
      setTimeout(() => emailInput.removeClass("error"), 2000);
      return;
    }

    this.lastSearchedEmail = email;

    if (resultsSection.hasClass("show")) {
      resultsSection.removeClass("show");
      setTimeout(() => this.performSearch(email, resultsSection), 500);
    } else {
      this.performSearch(email, resultsSection);
    }
  },

  performSearch(searchTerm, resultsSection) {
    if (this.searchPagination.lastSearchTerm !== searchTerm) {
      this.searchPagination.currentPage = 1;
      this.searchPagination.hasNextPage = false;
      this.searchPagination.lastSearchTerm = searchTerm;
    }

    resultsSection
      .html(
        `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun/sun.png" alt="Searching Users" class="thinking-icon" />
        </div>
      </div>
    `
      )
      .addClass("show");
    this.searchPagination.isLoading = true;

    searchUsersPaginated(
      searchTerm,
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        this.displaySearchResults(response.users, this.searchPagination.currentPage === 1);
        this.setupInfiniteScroll(resultsSection, searchTerm);
      },
      () => {
        this.searchPagination.isLoading = false;
        resultsSection.html('<p class="empty-search-message">Error searching for users.</p>');
        UIManager.showPopup("Error searching for users.", false);
        $("#friendEmailInput").addClass("error");
      }
    );
  },

  displaySearchResults(users, isNewSearch = true) {
    const currentUser = Utils.getCurrentUser();
    const resultsSection = $("#searchResultsSection");
    const filteredUsers = users.filter((user) => user.id !== currentUser.id);

    if (isNewSearch && filteredUsers.length === 0) {
      resultsSection.html('<p class="empty-search-message">No users found.</p>');
      return;
    }

    const userItems = filteredUsers
      .map((user) => {
        const hasPendingOutgoing = this.outgoingFriendRequests.has(user.id);
        const hasPendingIncoming = this.pendingFriendRequests.has(user.id);
        const isAlreadyFriend = this.currentFriends.has(user.id);

        let buttonText, buttonClass;

        if (isAlreadyFriend) {
          buttonText = "Unfriend";
          buttonClass = "unfriend-btn danger-btn";
        } else if (hasPendingOutgoing) {
          buttonText = "Cancel Request";
          buttonClass = "cancel-friend-request-btn success-btn";
        } else if (hasPendingIncoming) {
          buttonText = "Accept";
          buttonClass = "accept-friend-request-btn primary-btn";
        } else {
          buttonText = "Send Request";
          buttonClass = "send-friend-request-btn";
        }

        return `
        <div class="user-search-item" data-user-id="${user.id}">
          <img src="${user.imageUrl || user.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${user.fullName}" class="user-list-avatar" />
          <div class="user-info">
            <span class="user-list-name">${user.fullName}</span>
            <span class="user-email">${user.email}</span>
          </div>
          <button type="button" class="${buttonClass}" data-user-id="${user.id}" data-user-name="${user.fullName}">
            ${buttonText}
          </button>
        </div>
      `;
      })
      .join("");

    if (isNewSearch) {
      resultsSection.html(`<div class="user-search-results">${userItems}</div>`);
    } else {
      resultsSection.find(".user-search-results").append(userItems);
    }

    $(".send-friend-request-btn").on("click", (e) => this.handleSendFriendRequest(e));
    $(".cancel-friend-request-btn").on("click", (e) => this.handleCancelFriendRequest(e));
    $(".accept-friend-request-btn").on("click", (e) => this.handleAcceptFriendRequestFromSearch(e));
    $(".unfriend-btn").on("click", (e) => this.handleUnfriendFromSearch(e));
  },

  setupInfiniteScroll(resultsSection, searchTerm) {
    resultsSection.off("scroll.infiniteSearch");

    if (!this.searchPagination.hasNextPage) return;

    resultsSection.on("scroll.infiniteSearch", function () {
      const scrollTop = $(this).scrollTop();
      const scrollHeight = $(this)[0].scrollHeight;
      const clientHeight = $(this).height();

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        ProfileFriendsManager.loadMoreUsers(searchTerm, resultsSection);
      }
    });
  },

  loadMoreUsers(searchTerm, resultsSection) {
    if (this.searchPagination.isLoading || !this.searchPagination.hasNextPage) return;

    this.searchPagination.isLoading = true;
    this.searchPagination.currentPage++;

    resultsSection.find(".user-search-results").append(`
      <div class="loading-more">
        <div class="sun-loading">
          <div class="thinking-container">
            <img src="../sources/images/sun/sun.png" alt="Loading More Users" class="thinking-icon" />
          </div>
        </div>
      </div>
    `);

    searchUsersPaginated(
      searchTerm,
      this.searchPagination.currentPage,
      this.searchPagination.pageSize,
      (response) => {
        this.searchPagination.isLoading = false;
        this.searchPagination.hasNextPage = response.hasNextPage;
        resultsSection.find(".loading-more").remove();
        this.displaySearchResults(response.users, false);
        if (this.searchPagination.hasNextPage) {
          this.setupInfiniteScroll(resultsSection, searchTerm);
        }
      },
      () => {
        this.searchPagination.isLoading = false;
        this.searchPagination.currentPage--;
        resultsSection.find(".loading-more").remove();
      }
    );
  },

  refreshCurrentSearchResults() {
    const resultsSection = $("#searchResultsSection");
    if (!resultsSection.is(":visible") || !this.searchPagination.lastSearchTerm) return;

    resultsSection.find(".user-search-item").each(
      function () {
        const $item = $(this);
        const userId = parseInt($item.data("user-id"));
        const $btn = $item.find("button");

        let buttonText, buttonClass;

        if (this.currentFriends.has(userId)) {
          buttonText = "Unfriend";
          buttonClass = "unfriend-btn danger-btn";
        } else if (this.pendingFriendRequests.has(userId)) {
          buttonText = "Accept";
          buttonClass = "accept-friend-request-btn primary-btn";
        } else if (this.outgoingFriendRequests.has(userId)) {
          buttonText = "Cancel Request";
          buttonClass = "cancel-friend-request-btn success-btn";
        } else {
          buttonText = "Send Request";
          buttonClass = "send-friend-request-btn";
        }

        $btn
          .text(buttonText)
          .removeClass("unfriend-btn danger-btn accept-friend-request-btn primary-btn cancel-friend-request-btn success-btn send-friend-request-btn")
          .addClass(buttonClass);
      }.bind(this)
    );
  },

  updateFriendsListWithPendingRequests(incomingRequests) {
    $(".pending-requests-section").remove();

    if (incomingRequests.length === 0) return;

    const pendingRequestsHtml = `
      <div class="pending-requests-section">
        <h4 class="pending-requests-title">Pending Friend Requests (<span class="request-number">${incomingRequests.length}</span>)</h4>
        <div class="pending-requests-list">
          ${incomingRequests
            .map(
              (request) => `
            <div class="user-list-item pending-request-item" data-user-id="${request.id}">
              <img src="${request.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${request.fullName}" class="user-list-avatar" />
              <span class="user-list-name">${request.fullName}</span>
              <div class="pending-request-buttons">
                <button type="button" class="accept-friend-btn" data-user-id="${request.id}" data-user-name="${request.fullName}">
                  Accept
                </button>
                <button type="button" class="decline-friend-btn" data-user-id="${request.id}" data-user-name="${request.fullName}">
                  Decline
                </button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    $("#friendsList").prepend(pendingRequestsHtml);
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
        UIManager.showPopup(`Friend request sent to ${userName}!`, true);
        this.outgoingFriendRequests.add(userId);
        button.text("Cancel Request").prop("disabled", false).removeClass("send-friend-request-btn").addClass("cancel-friend-request-btn success-btn");
        button.off("click").on("click", (e) => this.handleCancelFriendRequest(e));
      },
      () => {
        button.text("Send Request").prop("disabled", false);
        UIManager.showPopup("Failed to send friend request. Please try again.", false);
      }
    );
  },

  handleCancelFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    button.text("Canceling...").prop("disabled", true);

    cancelFriendRequest(
      { SenderId: currentUser.id, RecipientId: userId },
      () => {
        UIManager.showPopup(`Friend request to ${userName} unsent.`, true);
        this.outgoingFriendRequests.delete(userId);
        button.text("Send Request").prop("disabled", false).removeClass("cancel-friend-request-btn success-btn").addClass("send-friend-request-btn");
        button.off("click").on("click", (e) => this.handleSendFriendRequest(e));
      },
      () => {
        button.text("Cancel Request").prop("disabled", false);
        UIManager.showPopup("Failed to cancel friend request. Please try again.", false);
      }
    );
  },

  handleAcceptFriendRequestFromSearch(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");

    button.text("Accepting...").prop("disabled", true);

    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 1 },
      () => {
        UIManager.showPopup(`You are now friends with ${userName}!`, true);
        this.pendingFriendRequests.delete(userId);
        this.loadAndPopulateFriendsList();
      },
      () => {
        button.text("Accept").prop("disabled", false);
        UIManager.showPopup("Failed to accept friend request. Please try again.", false);
      }
    );
  },

  handleUnfriendFromSearch(e) {
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
          UIManager.showPopup(`${userName} has been removed from your friends list.`, true);
          this.loadAndPopulateFriendsList();
        },
        () => {
          button.text("Unfriend").prop("disabled", false);
          UIManager.showPopup("Failed to unfriend user. Please try again.", false);
        }
      );
    });
  },

  handleAcceptFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    const item = button.closest(".pending-request-item");

    button.text("Accepting...").prop("disabled", true);
    button.siblings(".decline-friend-btn").prop("disabled", true);

    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 1 },
      () => {
        UIManager.showPopup(`You are now friends with ${userName}!`, true);
        this.pendingFriendRequests.delete(userId);

        item.fadeOut(300, function () {
          $(this).remove();
          const remainingRequests = $(".pending-request-item").length;
          if (remainingRequests === 0) {
            $(".pending-requests-section").fadeOut(300, function () {
              $(this).remove();
            });
          } else {
            $(".request-number").text(remainingRequests);
          }
          ProfileFriendsManager.loadAndPopulateFriendsList();
        });
      },
      () => {
        button.text("Accept").prop("disabled", false);
        button.siblings(".decline-friend-btn").prop("disabled", false);
        UIManager.showPopup("Failed to accept friend request. Please try again.", false);
      }
    );
  },

  handleDeclineFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    const item = button.closest(".pending-request-item");

    button.text("Declining...").prop("disabled", true);
    button.siblings(".accept-friend-btn").prop("disabled", true);

    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 2 },
      () => {
        UIManager.showPopup(`Friend request from ${userName} declined.`, true);
        this.pendingFriendRequests.delete(userId);

        item.fadeOut(300, function () {
          $(this).remove();
          const remainingRequests = $(".pending-request-item").length;
          if (remainingRequests === 0) {
            $(".pending-requests-section").fadeOut(300, function () {
              $(this).remove();
            });
          } else {
            $(".request-number").text(remainingRequests);
          }
        });
      },
      () => {
        button.text("Decline").prop("disabled", false);
        button.siblings(".accept-friend-btn").prop("disabled", false);
        UIManager.showPopup("Failed to decline friend request. Please try again.", false);
      }
    );
  },

  loadPendingFriendRequests() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || !currentUser.id) return;

    getPendingFriendRequests(
      currentUser.id,
      (incomingRequests) => {
        this.pendingFriendRequests.clear();
        incomingRequests.forEach((request) => this.pendingFriendRequests.add(request.id));
        this.updateFriendsListWithPendingRequests(incomingRequests);
      },
      () => {}
    );

    getOutgoingFriendRequests(
      currentUser.id,
      (outgoingRequests) => {
        this.outgoingFriendRequests.clear();
        outgoingRequests.forEach((request) => this.outgoingFriendRequests.add(request.id));
      },
      () => {}
    );
  }
};

window.ProfileFriendsManager = ProfileFriendsManager;
