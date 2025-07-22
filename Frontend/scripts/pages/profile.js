let currentUser = null;
let selectedInterests = [];
let originalFormState = null;
let lastSearchedEmail = null;
let pendingFriendRequests = new Set();
let outgoingFriendRequests = new Set();
let currentFriends = new Set();

let searchPagination = {
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  isLoading: false,
  lastSearchTerm: ""
};

const validationMap = {
  firstName: (val) => ValidationManager.validateName(val, "First name"),
  lastName: (val) => ValidationManager.validateName(val, "Last name"),
  birthdate: ValidationManager.validateBirthdate,
  imageUrl: ValidationManager.validateImageUrl,
  newPassword: (val) => (val ? ValidationManager.validatePassword(val) : { valid: true }),
  confirmPassword: () => {
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    return newPassword !== confirmPassword ? { valid: false, message: "Passwords do not match." } : { valid: true };
  }
};

function captureOriginalFormState() {
  originalFormState = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    birthdate: $("#birthdate").val(),
    imageUrl: $("#imageUrl").val(),
    interests: [...selectedInterests],
    newPassword: ""
  };
}

function hasFormChanged() {
  if (!originalFormState) return false;

  const currentState = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    birthdate: $("#birthdate").val(),
    imageUrl: $("#imageUrl").val(),
    interests: [...selectedInterests],
    newPassword: $("#newPassword").val()
  };

  return Object.keys(currentState).some((key) =>
    key === "interests" ? JSON.stringify(currentState.interests.sort()) !== JSON.stringify(originalFormState.interests.sort()) : currentState[key] !== originalFormState[key]
  );
}

function updateSubmitButtonState() {
  const submitButton = $("#profileForm button[type='submit']");
  const hasChanges = hasFormChanged();

  submitButton.prop("disabled", !hasChanges);
  submitButton.text(hasChanges ? "Save Changes" : "No Changes").toggleClass("no-changes", !hasChanges);
}

function populateForm(userProfile) {
  $("#emailDisplay").text(userProfile.email);
  $("#firstName").val(userProfile.firstName);
  $("#lastName").val(userProfile.lastName);
  $("#birthdate").val(userProfile.birthDate);
  $("#imageUrl").val(userProfile.imageUrl);
  $("#avatarPreview").attr("src", userProfile.imageUrl || CONSTANTS.NO_IMAGE_URL);

  selectedInterests = [...userProfile.interests];
  $(".interest-item").removeClass("selected");
  selectedInterests.forEach((interest) => $(`.interest-item[data-interest="${interest}"]`).addClass("selected"));
  ValidationManager.updateInterestSubtitle(selectedInterests.length);

  populateBlockedUsersList(userProfile.blockedUsers);
  loadAndPopulateFriendsList();

  captureOriginalFormState();
  updateSubmitButtonState();
}

function populateBlockedUsersList(users) {
  const listContainer = $("#blockedUsersList");
  listContainer.empty();

  if (users.length === 0) {
    listContainer.html('<p class="empty-list-message">You have no blocked users.</p>');
    return;
  }

  users.forEach((user) => {
    listContainer.append(`
      <div class="user-list-item" data-user-id="${user.id}">
        <img src="${user.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${user.name}" class="user-list-avatar" />
        <span class="user-list-name">${user.name}</span>
        <button type="button" class="unblock-btn">Unblock</button>
      </div>
    `);
  });
}

function loadAndPopulateFriendsList() {
  $("#friendsList").hide();
  $(".friends-count").text("Loading friends...");

  getFriends(
    currentUser.id,
    (friends) => {
      populateFriendsList(friends);
      $("#friendsList").show();
      loadPendingFriendRequests();
      refreshCurrentSearchResults();
    },
    () => {
      $("#friendsList").html('<div class="alert alert-danger">Failed to load friends list.</div>').show();
    }
  );
}

function populateFriendsList(friends) {
  const listContainer = $("#friendsList");
  listContainer.empty();

  currentFriends.clear();
  friends.forEach((friend) => currentFriends.add(friend.id));

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
}

function handleRemoveFriend(e) {
  const friendId = $(e.currentTarget).data("friend-id");
  const friendName = $(e.currentTarget).data("friend-name");

  UIManager.showDialog(`Are you sure you want to remove ${friendName} from your friends list?`).then((confirmed) => {
    if (!confirmed) return;

    removeFriend(
      { userId: currentUser.id, friendId },
      () => {
        UIManager.showPopup(`${friendName} has been removed from your friends list.`, true);
        loadAndPopulateFriendsList();
      },
      () => UIManager.showPopup("Failed to remove friend. Please try again.", false)
    );
  });
}

function handleInterestListItemSelection(e) {
  const item = $(e.currentTarget);
  const interest = item.data("interest");
  item.toggleClass("selected");

  if (item.hasClass("selected")) {
    selectedInterests.push(interest);
  } else {
    selectedInterests = selectedInterests.filter((i) => i !== interest);
  }
  ValidationManager.updateInterestSubtitle(selectedInterests.length);
  updateSubmitButtonState();
}

function showAddFriendDialog() {
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
      closeAddFriendDialog();
    }
  });

  $("#searchUserButton").on("click", handleUserSearch);
  $("#friendEmailInput")
    .on("keypress", (e) => {
      if (e.which === 13) {
        e.preventDefault();
        handleUserSearch(e);
      }
    })
    .on("input", function () {
      $(this).removeClass("error");
      if (!$(this).val().trim()) {
        $("#searchResultsSection").removeClass("show");
        lastSearchedEmail = null;
      }
    });
}

function closeAddFriendDialog() {
  $("#add-friend-dialog").removeClass("show");
  setTimeout(() => {
    $("#add-friend-dialog").remove();
    $(document).off("click.addFriend");
    lastSearchedEmail = null;
  }, 400);
}

function handleUserSearch(e) {
  if (e) e.stopPropagation();

  const email = $("#friendEmailInput").val().trim();
  const emailInput = $("#friendEmailInput");
  const resultsSection = $("#searchResultsSection");

  if (email === lastSearchedEmail) return;

  emailInput.removeClass("error");

  if (!email) {
    resultsSection.removeClass("show");
    emailInput.addClass("error");
    setTimeout(() => emailInput.removeClass("error"), 2000);
    return;
  }

  lastSearchedEmail = email;

  if (resultsSection.hasClass("show")) {
    resultsSection.removeClass("show");
    setTimeout(() => performSearch(email, resultsSection), 500);
  } else {
    performSearch(email, resultsSection);
  }
}

function performSearch(searchTerm, resultsSection) {
  if (searchPagination.lastSearchTerm !== searchTerm) {
    searchPagination.currentPage = 1;
    searchPagination.hasNextPage = false;
    searchPagination.lastSearchTerm = searchTerm;
  }

  resultsSection.html('<div class="loader-container"><div class="spinner"></div></div>').addClass("show");
  searchPagination.isLoading = true;

  searchUsersPaginated(
    searchTerm,
    searchPagination.currentPage,
    searchPagination.pageSize,
    (response) => {
      searchPagination.isLoading = false;
      searchPagination.hasNextPage = response.hasNextPage;
      displaySearchResults(response.users, searchPagination.currentPage === 1);
      setupInfiniteScroll(resultsSection, searchTerm);
    },
    () => {
      searchPagination.isLoading = false;
      resultsSection.html('<p class="empty-search-message">Error searching for users.</p>');
      UIManager.showPopup("Error searching for users.", false);
      $("#friendEmailInput").addClass("error");
    }
  );
}

function displaySearchResults(users, isNewSearch = true) {
  const resultsSection = $("#searchResultsSection");
  const filteredUsers = users.filter((user) => user.id !== currentUser.id);

  if (isNewSearch && filteredUsers.length === 0) {
    resultsSection.html('<p class="empty-search-message">No users found.</p>');
    return;
  }

  const userItems = filteredUsers
    .map((user) => {
      const hasPendingOutgoing = outgoingFriendRequests.has(user.id);
      const hasPendingIncoming = pendingFriendRequests.has(user.id);
      const isAlreadyFriend = currentFriends.has(user.id);

      let buttonText, buttonClass;

      if (isAlreadyFriend) {
        buttonText = "Unfriend";
        buttonClass = "unfriend-btn danger-btn";
      } else if (hasPendingOutgoing) {
        buttonText = "Unsend";
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

  $(".send-friend-request-btn").on("click", handleSendFriendRequest);
  $(".cancel-friend-request-btn").on("click", handleCancelFriendRequest);
  $(".accept-friend-request-btn").on("click", handleAcceptFriendRequestFromSearch);
  $(".unfriend-btn").on("click", handleUnfriendFromSearch);
}

function setupInfiniteScroll(resultsSection, searchTerm) {
  resultsSection.off("scroll.infiniteSearch");

  if (!searchPagination.hasNextPage) return;

  resultsSection.on("scroll.infiniteSearch", function () {
    const scrollTop = $(this).scrollTop();
    const scrollHeight = $(this)[0].scrollHeight;
    const clientHeight = $(this).height();

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMoreUsers(searchTerm, resultsSection);
    }
  });
}

function loadMoreUsers(searchTerm, resultsSection) {
  if (searchPagination.isLoading || !searchPagination.hasNextPage) return;

  searchPagination.isLoading = true;
  searchPagination.currentPage++;

  resultsSection.find(".user-search-results").append('<div class="loading-more">Loading more users...</div>');

  searchUsersPaginated(
    searchTerm,
    searchPagination.currentPage,
    searchPagination.pageSize,
    (response) => {
      searchPagination.isLoading = false;
      searchPagination.hasNextPage = response.hasNextPage;
      resultsSection.find(".loading-more").remove();
      displaySearchResults(response.users, false);
      if (searchPagination.hasNextPage) {
        setupInfiniteScroll(resultsSection, searchTerm);
      }
    },
    () => {
      searchPagination.isLoading = false;
      searchPagination.currentPage--;
      resultsSection.find(".loading-more").remove();
    }
  );
}

function refreshCurrentSearchResults() {
  const resultsSection = $("#searchResultsSection");
  if (!resultsSection.is(":visible") || !searchPagination.lastSearchTerm) return;

  resultsSection.find(".user-search-item").each(function () {
    const $item = $(this);
    const userId = parseInt($item.data("user-id"));
    const $btn = $item.find("button");

    let buttonText, buttonClass;

    if (currentFriends.has(userId)) {
      buttonText = "Unfriend";
      buttonClass = "unfriend-btn danger-btn";
    } else if (pendingFriendRequests.has(userId)) {
      buttonText = "Accept";
      buttonClass = "accept-friend-request-btn primary-btn";
    } else if (outgoingFriendRequests.has(userId)) {
      buttonText = "Unsend";
      buttonClass = "cancel-friend-request-btn success-btn";
    } else {
      buttonText = "Send Request";
      buttonClass = "send-friend-request-btn";
    }

    $btn
      .text(buttonText)
      .removeClass("unfriend-btn danger-btn accept-friend-request-btn primary-btn cancel-friend-request-btn success-btn send-friend-request-btn")
      .addClass(buttonClass);
  });
}

function updateFriendsListWithPendingRequests(incomingRequests) {
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
}

function handleSendFriendRequest(e) {
  const button = $(e.currentTarget);
  const userId = button.data("user-id");
  const userName = button.data("user-name");

  button.text("Sending...").prop("disabled", true);

  sendFriendRequest(
    { SenderId: currentUser.id, RecipientId: userId },
    () => {
      UIManager.showPopup(`Friend request sent to ${userName}!`, true);
      outgoingFriendRequests.add(userId);
      button.text("Cancel Request").prop("disabled", false).removeClass("send-friend-request-btn").addClass("cancel-friend-request-btn success-btn");
      button.off("click").on("click", handleCancelFriendRequest);
    },
    () => {
      button.text("Send Request").prop("disabled", false);
      UIManager.showPopup("Failed to send friend request. Please try again.", false);
    }
  );
}

function handleCancelFriendRequest(e) {
  const button = $(e.currentTarget);
  const userId = button.data("user-id");
  const userName = button.data("user-name");

  button.text("Unsending...").prop("disabled", true);

  cancelFriendRequest(
    { SenderId: currentUser.id, RecipientId: userId },
    () => {
      UIManager.showPopup(`Friend request to ${userName} unsent.`, true);
      outgoingFriendRequests.delete(userId);
      button.text("Send Request").prop("disabled", false).removeClass("cancel-friend-request-btn success-btn").addClass("send-friend-request-btn");
      button.off("click").on("click", handleSendFriendRequest);
    },
    () => {
      button.text("Unsend").prop("disabled", false);
      UIManager.showPopup("Failed to unsend friend request. Please try again.", false);
    }
  );
}

function handleAcceptFriendRequestFromSearch(e) {
  const button = $(e.currentTarget);
  const userId = button.data("user-id");
  const userName = button.data("user-name");

  button.text("Accepting...").prop("disabled", true);

  respondToFriendRequest(
    { RequesterId: userId, ResponderId: currentUser.id, Response: 1 },
    () => {
      UIManager.showPopup(`You are now friends with ${userName}!`, true);
      pendingFriendRequests.delete(userId);
      loadAndPopulateFriendsList();
    },
    () => {
      button.text("Accept").prop("disabled", false);
      UIManager.showPopup("Failed to accept friend request. Please try again.", false);
    }
  );
}

function handleUnfriendFromSearch(e) {
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
        loadAndPopulateFriendsList();
      },
      () => {
        button.text("Unfriend").prop("disabled", false);
        UIManager.showPopup("Failed to unfriend user. Please try again.", false);
      }
    );
  });
}

function handleAcceptFriendRequest(e) {
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
      pendingFriendRequests.delete(userId);

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
        loadAndPopulateFriendsList();
      });
    },
    () => {
      button.text("Accept").prop("disabled", false);
      button.siblings(".decline-friend-btn").prop("disabled", false);
      UIManager.showPopup("Failed to accept friend request. Please try again.", false);
    }
  );
}

function handleDeclineFriendRequest(e) {
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
      pendingFriendRequests.delete(userId);

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
}

function handleUnblockUser(e) {
  const item = $(e.currentTarget).closest(".user-list-item");
  const blockedUserId = item.data("user-id");
  const userName = item.find(".user-list-name").text();

  UIManager.showDialog(`Are you sure you want to unblock ${userName}?`).then((confirmed) => {
    if (!confirmed) return;

    toggleBlockUser(
      currentUser.id,
      blockedUserId,
      (response) => {
        UIManager.showPopup(response.message, true);

        if (currentUser && currentUser.blockedUsers) {
          currentUser.blockedUsers = currentUser.blockedUsers.filter((user) => user.id != blockedUserId);
        }
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        item.fadeOut(300, function () {
          $(this).remove();
          if ($("#blockedUsersList .user-list-item").length === 0) {
            $("#blockedUsersList").html('<p class="empty-list-message">You have no blocked users.</p>');
          }
        });
      },
      () => UIManager.showPopup("Failed to unblock user. Please try again.", false)
    );
  });
}

function handleImagePreview() {
  const imageUrlInput = $(this);
  const cleanedUrl = ValidationManager.cleanImageUrl(imageUrlInput.val().trim());
  imageUrlInput.val(cleanedUrl);

  const avatarPreview = $("#avatarPreview");
  const fallbackImage = CONSTANTS.NO_IMAGE_URL;

  if (!cleanedUrl) {
    avatarPreview.attr("src", fallbackImage);
    return;
  }

  const validation = ValidationManager.validateImageUrl(cleanedUrl);
  if (!validation.valid) return;

  const tempImage = new Image();
  tempImage.onload = () => avatarPreview.attr("src", cleanedUrl);
  tempImage.onerror = () => avatarPreview.attr("src", fallbackImage);
  tempImage.src = cleanedUrl;
}

function handleProfileUpdate(e) {
  e.preventDefault();

  if (!hasFormChanged()) return;

  const imageUrlInput = $("#imageUrl");
  const cleanedUrl = ValidationManager.cleanImageUrl(imageUrlInput.val().trim());
  imageUrlInput.val(cleanedUrl);

  let isValid = true;
  const form = $("#profileForm");

  form.find(".input-error").removeClass("input-error");
  form.find(".error-message").hide();

  // Validate form fields
  ["firstName", "lastName", "birthdate", "imageUrl"].forEach((fieldName) => {
    const input = form.find(`input[name="${fieldName}"]`);
    const validator = validationMap[fieldName];
    if (validator) {
      const result = validator(input.val().trim());
      if (!result.valid) {
        isValid = false;
        ValidationManager.showError(input, result.message);
      }
    }
  });

  // Validate passwords if changed
  const newPassword = $("#newPassword").val();
  if (newPassword) {
    const newPasswordResult = validationMap.newPassword(newPassword);
    if (!newPasswordResult.valid) {
      isValid = false;
      ValidationManager.showError($("#newPassword"), newPasswordResult.message);
    }

    const confirmPasswordResult = validationMap.confirmPassword();
    if (!confirmPasswordResult.valid) {
      isValid = false;
      ValidationManager.showError($("#confirmPassword"), confirmPasswordResult.message);
    }
  }

  // Validate interests
  if (selectedInterests.length < 3) {
    $("#interestsError").text("Please select at least 3 interests.").show();
    isValid = false;
  } else {
    $("#interestsError").hide();
  }

  if (!isValid) {
    form.find(".input-error").first().focus();
    return;
  }

  const updatedData = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    birthdate: $("#birthdate").val(),
    imageUrl: $("#imageUrl").val(),
    interests: selectedInterests,
    newPassword: newPassword || null
  };

  const button = $(this).find('button[type="submit"]');
  button.text("Saving...").prop("disabled", true);

  updateProfile(
    currentUser.id,
    updatedData,
    (updatedUserFromServer) => {
      UIManager.showPopup("Profile updated successfully!", true);

      localStorage.setItem("currentUser", JSON.stringify(updatedUserFromServer));
      currentUser = updatedUserFromServer;
      $(".nav-profile-picture").attr("src", currentUser.imageUrl || CONSTANTS.NO_IMAGE_URL);

      $("#newPassword").val("");
      $("#confirmPassword").val("");
      $(".confirm-password-container").removeClass("show");

      captureOriginalFormState();
      updateSubmitButtonState();
    },
    () => {
      UIManager.showPopup("Failed to update profile. Please check your inputs.", false);
      updateSubmitButtonState();
    }
  );
}

function handlePasswordToggle() {
  const button = $(this);
  const passwordInput = button.closest(".password-input-group").find("input");
  const isPassword = passwordInput.attr("type") === "password";
  const cursorPosition = passwordInput[0].selectionStart;

  passwordInput.attr("type", isPassword ? "text" : "password");
  button.find(".password-toggle-icon").attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");

  passwordInput.focus();
  passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);
}

function handleNewPasswordInput() {
  const passwordValue = $(this).val();
  $(".confirm-password-container").toggleClass("show", !!passwordValue);
  ValidationManager.updatePasswordCriteria(passwordValue);
}

function loadPendingFriendRequests() {
  if (!currentUser || !currentUser.id) return;

  getPendingFriendRequests(
    currentUser.id,
    (incomingRequests) => {
      pendingFriendRequests.clear();
      incomingRequests.forEach((request) => pendingFriendRequests.add(request.id));
      updateFriendsListWithPendingRequests(incomingRequests);
    },
    () => {}
  );

  getOutgoingFriendRequests(
    currentUser.id,
    (outgoingRequests) => {
      outgoingFriendRequests.clear();
      outgoingRequests.forEach((request) => outgoingFriendRequests.add(request.id));
    },
    () => {}
  );
}

function loadUserProfile() {
  if (!currentUser || !currentUser.id) return;

  getProfile(
    currentUser.id,
    (profileData) => populateForm(profileData),
    () => {
      UIManager.showPopup("Could not load your profile data. Please log in again.", false);
      localStorage.removeItem("currentUser");
      window.location.href = "auth.html";
    }
  );
}

$(document).ready(function () {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) {
    window.location.href = "auth.html";
    return;
  }
  currentUser = JSON.parse(userJson);

  ValidationManager.populateInterestsList();
  loadUserProfile();

  // Event handlers
  $(document)
    .on("click", ".interest-item", handleInterestListItemSelection)
    .on("click", ".unblock-btn", handleUnblockUser)
    .on("click", ".remove-friend-btn", handleRemoveFriend)
    .on("click", ".accept-friend-btn", handleAcceptFriendRequest)
    .on("click", ".decline-friend-btn", handleDeclineFriendRequest)
    .on("click", "#addFriendsBtn", showAddFriendDialog)
    .on("input", "#imageUrl", handleImagePreview)
    .on("submit", "#profileForm", handleProfileUpdate)
    .on("click", ".password-toggle-btn", handlePasswordToggle)
    .on("input", "#newPassword", handleNewPasswordInput)
    .on("focus", "#newPassword", ValidationManager.showPasswordCriteria)
    .on("input", ".form-group input", function () {
      ValidationManager.clearValidationState($(this));
      updateSubmitButtonState();
    })
    .on("input change", 'input[type="date"]', (e) => {
      $(e.target).toggleClass("has-value", !!$(e.target).val());
      updateSubmitButtonState();
    });

  $("#avatarPreview").on("error", function () {
    $(this).off("error").attr("src", CONSTANTS.NO_IMAGE_URL);
  });
});
