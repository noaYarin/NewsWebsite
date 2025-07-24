const ProfileFriendsManager = {
  pendingFriendRequests: new Set(),
  outgoingFriendRequests: new Set(),
  currentFriends: new Set(),

  init() {
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document)
      // This now calls the global dialog instead of its own method
      .on("click", "#addFriendsBtn", () => GlobalFriendDialog.showAddFriendDialog())
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
        // It's important to still load pending requests to update the state
        this.loadPendingFriendRequests();
      },
      () => {
        $("#friendsList").html('<div class="alert alert-danger">Failed to load friends list.</div>').show();
      }
    );
  },

  populateFriendsList(friends) {
    const listContainer = $("#friendsList");
    // Preserve pending requests if they are already displayed
    const pendingRequestsSection = listContainer.find(".pending-requests-section").detach();
    listContainer.empty();
    listContainer.append(pendingRequestsSection);

    this.currentFriends.clear();
    friends.forEach((friend) => this.currentFriends.add(friend.id));

    $(".friends-count").text(`${friends.length} friend${friends.length !== 1 ? "s" : ""}`);

    if (friends.length === 0) {
      // Don't show the "no friends" message if there are pending requests
      if (pendingRequestsSection.length === 0) {
        listContainer.append('<p class="empty-list-message">You have no friends yet.</p>');
      }
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

  updateFriendsListWithPendingRequests(incomingRequests) {
    // Remove existing pending requests section before adding a new one
    $(".pending-requests-section").remove();

    if (incomingRequests.length === 0) return;

    this.pendingFriendRequests.clear();
    incomingRequests.forEach((request) => this.pendingFriendRequests.add(request.id));

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
          // Reload the entire friends list to move the new friend to the main list
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
