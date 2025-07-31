class ProfileFriendsManager {
  static pendingFriendRequests = new Set();
  static outgoingFriendRequests = new Set();
  static currentFriends = new Set();

  static selectors = {
    friendsList: "#friendsList",
    friendsCount: ".friends-count",
    addFriendsBtn: "#addFriendsBtn",
    pendingRequestsSection: ".pending-requests-section",
    requestNumber: ".request-number",
    pendingRequestItem: ".pending-request-item"
  };

  static buttonStates = {
    accepting: "Accepting...",
    declining: "Declining...",
    accept: "Accept",
    decline: "Decline"
  };

  static init() {
    this.setupEventHandlers();
  }

  // === Event Handler Setup ===
  static setupEventHandlers() {
    this.setupFriendManagementHandlers();
    this.setupFriendRequestHandlers();
  }

  static setupFriendManagementHandlers() {
    $(document)
      .on("click", this.selectors.addFriendsBtn, () => GlobalFriendDialog.showAddFriendDialog())
      .on("click", ".remove-friend-btn", (e) => this.handleRemoveFriend(e));
  }

  static setupFriendRequestHandlers() {
    $(document)
      .on("click", ".accept-friend-btn", (e) => this.handleAcceptFriendRequest(e))
      .on("click", ".decline-friend-btn", (e) => this.handleDeclineFriendRequest(e));
  }

  // === Friends List Management ===
  static loadAndPopulateFriendsList() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser) return;

    this.showLoadingState();

    getFriends(
      currentUser.id,
      (friends) => this.handleFriendsLoadSuccess(friends),
      () => this.handleFriendsLoadError()
    );
  }

  static showLoadingState() {
    $(this.selectors.friendsList).hide();
    $(this.selectors.friendsCount).text("Loading friends...");
  }

  static handleFriendsLoadSuccess(friends) {
    this.populateFriendsList(friends);
    $(this.selectors.friendsList).show();
    this.loadPendingFriendRequests();
  }

  static handleFriendsLoadError() {
    $(this.selectors.friendsList).html('<div class="alert alert-danger">Failed to load friends list.</div>').show();
  }

  static populateFriendsList(friends) {
    this.preservePendingRequestsSection();
    this.updateFriendsData(friends);
    this.renderFriendsList(friends);
  }

  static preservePendingRequestsSection() {
    const listContainer = $(this.selectors.friendsList);
    const pendingRequestsSection = listContainer.find(this.selectors.pendingRequestsSection).detach();
    listContainer.empty();
    if (pendingRequestsSection.length) {
      listContainer.append(pendingRequestsSection);
    }
  }

  static updateFriendsData(friends) {
    this.currentFriends.clear();
    friends.forEach((friend) => this.currentFriends.add(friend.id));
    this.updateFriendsCount(friends.length);
  }

  static updateFriendsCount(count) {
    const friendsText = count === 1 ? "friend" : "friends";
    $(this.selectors.friendsCount).text(`${count} ${friendsText}`);
  }

  static renderFriendsList(friends) {
    if (friends.length === 0) {
      this.showEmptyFriendsMessage();
      return;
    }

    const friendsHtml = friends.map((friend) => this.createFriendItem(friend)).join("");
    $(this.selectors.friendsList).append(friendsHtml);
  }

  static showEmptyFriendsMessage() {
    const hasPendingRequests = $(this.selectors.pendingRequestsSection).length > 0;
    if (!hasPendingRequests) {
      $(this.selectors.friendsList).append('<p class="empty-list-message">You have no friends yet.</p>');
    }
  }

  static createFriendItem(friend) {
    return `
      <div class="user-list-item" data-friend-id="${friend.id}">
        <img src="${friend.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${friend.fullName}" class="user-list-avatar" />
        <span class="user-list-name">${friend.fullName}</span>
        <button type="button" class="unblock-btn remove-friend-btn" 
                data-friend-id="${friend.id}" 
                data-friend-name="${friend.fullName}"
                title="Remove Friend">Remove</button>
      </div>
    `;
  }

  // === Friend Removal ===
  static handleRemoveFriend(e) {
    const currentUser = Utils.getCurrentUser();
    const { friendId, friendName } = this.extractFriendData(e);

    UIManager.showDialog(`Are you sure you want to remove ${friendName}?`).then((confirmed) => {
      if (!confirmed) return;
      this.executeFriendRemoval(currentUser, friendId, friendName);
    });
  }

  static extractFriendData(e) {
    const button = $(e.currentTarget);
    return {
      friendId: button.data("friend-id"),
      friendName: button.data("friend-name")
    };
  }

  static executeFriendRemoval(currentUser, friendId, friendName) {
    removeFriend(
      { userId: currentUser.id, friendId },
      () => this.handleRemoveFriendSuccess(friendName),
      () => this.handleRemoveFriendError()
    );
  }

  static handleRemoveFriendSuccess(friendName) {
    UIManager.showPopup(`${friendName} has been removed from your friends list.`, true);
    this.loadAndPopulateFriendsList();
    this.notifyGlobalFriendDialog();
  }

  static handleRemoveFriendError() {
    UIManager.showPopup("Failed to remove friend. Please try again.", false);
  }

  static notifyGlobalFriendDialog() {
    if (window.GlobalFriendDialog) {
      GlobalFriendDialog.reloadFriendshipState();
    }
  }

  // === Pending Friend Requests ===
  static loadPendingFriendRequests() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || !currentUser.id) return;

    this.loadIncomingRequests(currentUser.id);
    this.loadOutgoingRequests(currentUser.id);
  }

  static loadIncomingRequests(userId) {
    getPendingFriendRequests(userId, (incomingRequests) => {
      this.updateFriendsListWithPendingRequests(incomingRequests);
    });
  }

  static loadOutgoingRequests(userId) {
    getOutgoingFriendRequests(userId, (outgoingRequests) => {
      this.outgoingFriendRequests.clear();
      outgoingRequests.forEach((request) => this.outgoingFriendRequests.add(request.id));
    });
  }

  static updateFriendsListWithPendingRequests(incomingRequests) {
    this.removePendingRequestsSection();

    if (incomingRequests.length === 0) return;

    this.updatePendingRequestsData(incomingRequests);
    this.renderPendingRequestsSection(incomingRequests);
  }

  static removePendingRequestsSection() {
    $(this.selectors.pendingRequestsSection).remove();
  }

  static updatePendingRequestsData(incomingRequests) {
    this.pendingFriendRequests.clear();
    incomingRequests.forEach((request) => this.pendingFriendRequests.add(request.id));
  }

  static renderPendingRequestsSection(incomingRequests) {
    const pendingRequestsHtml = this.createPendingRequestsHTML(incomingRequests);
    $(this.selectors.friendsList).prepend(pendingRequestsHtml);
  }

  static createPendingRequestsHTML(incomingRequests) {
    const requestsList = incomingRequests.map((request) => this.createPendingRequestItem(request)).join("");

    return `
      <div class="pending-requests-section">
        <h4 class="pending-requests-title">Pending Friend Requests (<span class="request-number">${incomingRequests.length}</span>)</h4>
        <div class="pending-requests-list">
          ${requestsList}
        </div>
      </div>
    `;
  }

  static createPendingRequestItem(request) {
    return `
      <div class="user-list-item pending-request-item" data-user-id="${request.id}">
        <img src="${request.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${request.fullName}" class="user-list-avatar" />
        <span class="user-list-name">${request.fullName}</span>
        <div class="pending-request-buttons">
          <button type="button" class="accept-friend-btn" data-user-id="${request.id}" data-user-name="${request.fullName}">Accept</button>
          <button type="button" class="decline-friend-btn" data-user-id="${request.id}" data-user-name="${request.fullName}">Decline</button>
        </div>
      </div>
    `;
  }

  // === Friend Request Actions ===
  static handleAcceptFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const { button, userId, userName, item } = this.extractRequestData(e);

    this.setButtonLoadingState(button, this.buttonStates.accepting, true);

    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 1 },
      () => this.handleAcceptSuccess(userId, userName, item),
      () => this.handleAcceptError(button)
    );
  }

  static handleDeclineFriendRequest(e) {
    const currentUser = Utils.getCurrentUser();
    const { button, userId, userName, item } = this.extractRequestData(e);

    this.setButtonLoadingState(button, this.buttonStates.declining, true);

    respondToFriendRequest(
      { RequesterId: userId, ResponderId: currentUser.id, Response: 2 },
      () => this.handleDeclineSuccess(userId, userName, item),
      () => this.handleDeclineError(button)
    );
  }

  static extractRequestData(e) {
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    const item = button.closest(this.selectors.pendingRequestItem);

    return { button, userId, userName, item };
  }

  static setButtonLoadingState(button, text, disabled) {
    button.text(text).prop("disabled", disabled);
    button.siblings("button").prop("disabled", disabled);
  }

  static handleAcceptSuccess(userId, userName, item) {
    UIManager.showPopup(`You are now friends with ${userName}!`, true);
    this.pendingFriendRequests.delete(userId);
    this.removeRequestItemWithAnimation(item, () => {
      this.loadAndPopulateFriendsList();
      this.notifyGlobalFriendDialog();
    });
  }

  static handleAcceptError(button) {
    this.resetButtonState(button, this.buttonStates.accept);
    UIManager.showPopup("Failed to accept friend request. Please try again.", false);
  }

  static handleDeclineSuccess(userId, userName, item) {
    UIManager.showPopup(`Friend request from ${userName} declined.`, true);
    this.pendingFriendRequests.delete(userId);
    this.removeRequestItemWithAnimation(item, () => {
      this.notifyGlobalFriendDialog();
    });
  }

  static handleDeclineError(button) {
    this.resetButtonState(button, this.buttonStates.decline);
    UIManager.showPopup("Failed to decline friend request. Please try again.", false);
  }

  static resetButtonState(button, text) {
    button.text(text).prop("disabled", false);
    button.siblings("button").prop("disabled", false);
  }

  static removeRequestItemWithAnimation(item, callback) {
    item.fadeOut(300, function () {
      $(this).remove();
      ProfileFriendsManager.updatePendingRequestsCount();
      if (callback) callback();
    });
  }

  static updatePendingRequestsCount() {
    const remainingRequests = $(this.selectors.pendingRequestItem).length;

    if (remainingRequests === 0) {
      this.removePendingRequestsSectionWithAnimation();
    } else {
      $(this.selectors.requestNumber).text(remainingRequests);
    }
  }

  static removePendingRequestsSectionWithAnimation() {
    $(this.selectors.pendingRequestsSection).fadeOut(300, function () {
      $(this).remove();
    });
  }
}

window.ProfileFriendsManager = ProfileFriendsManager;
