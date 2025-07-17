let currentUser = null;
let selectedInterests = [];

const validationMap = {
  firstName: (val) => validateName(val, "First name"),
  lastName: (val) => validateName(val, "Last name"),
  birthdate: validateBirthdate,
  imageUrl: validateImageUrl,
  newPassword: (val) => {
    return val ? validatePassword(val) : { valid: true };
  },
  confirmPassword: () => {
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    if (newPassword !== confirmPassword) {
      return { valid: false, message: "Passwords do not match." };
    }
    return { valid: true };
  }
};

function populateForm(userProfile) {
  $("#emailDisplay").text(userProfile.email);
  $("#firstName").val(userProfile.firstName);
  $("#lastName").val(userProfile.lastName);
  $("#birthdate").val(userProfile.birthDate);
  $("#imageUrl").val(userProfile.imageUrl);
  $("#avatarPreview").attr("src", userProfile.imageUrl || "../sources/images/no-image.png");

  selectedInterests = [...userProfile.interests];
  $(".interest-item").removeClass("selected");
  selectedInterests.forEach((interest) => {
    $(`.interest-item[data-interest="${interest}"]`).addClass("selected");
  });
  updateInterestSubtitle(selectedInterests.length);

  populateBlockedUsersList(userProfile.blockedUsers);
}

function populateBlockedUsersList(users) {
  const listContainer = $("#blockedUsersList");
  listContainer.empty();

  if (users.length === 0) {
    listContainer.html('<p class="empty-list-message">You have no blocked users.</p>');
    return;
  }

  users.forEach((user) => {
    const userHtml = `
      <div class="blocked-user-item" data-user-id="${user.id}">
        <img src="${user.avatar || "../sources/images/no-image.png"}" alt="${user.name}" class="blocked-user-avatar" />
        <span class="blocked-user-name">${user.name}</span>
        <button type="button" class="unblock-btn">Unblock</button>
      </div>
    `;
    listContainer.append(userHtml);
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
  updateInterestSubtitle(selectedInterests.length);
}

function handleUnblockUser(e) {
  const item = $(e.currentTarget).closest(".blocked-user-item");
  const blockedUserId = item.data("user-id");

  toggleBlockUser(
    currentUser.id,
    blockedUserId,
    (response) => {
      showPopup(response.message, true);

      // Update the currentUser object and save it to localStorage
      if (currentUser && currentUser.blockedUsers) {
        currentUser.blockedUsers = currentUser.blockedUsers.filter((user) => user.id != blockedUserId);
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      item.fadeOut(300, function () {
        $(this).remove();

        if ($("#blockedUsersList .blocked-user-item").length === 0) {
          $("#blockedUsersList").html('<p class="empty-list-message">You have no blocked users.</p>');
        }
      });
    },
    () => {
      showPopup("Failed to unblock user. Please try again.", false);
    }
  );
}

function handleImagePreview() {
  const imageUrlInput = $(this);
  const cleanedUrl = cleanImageUrl(imageUrlInput.val().trim());
  imageUrlInput.val(cleanedUrl);

  const newUrl = cleanedUrl;
  const avatarPreview = $("#avatarPreview");
  const fallbackImage = "../sources/images/no-image.png";

  if (!newUrl) {
    avatarPreview.attr("src", fallbackImage);
    return;
  }

  const validation = validateImageUrl(newUrl);
  if (!validation.valid) {
    return;
  }

  const tempImage = new Image();

  tempImage.onload = function () {
    avatarPreview.attr("src", newUrl);
  };

  tempImage.onerror = function () {
    avatarPreview.attr("src", fallbackImage);
  };

  tempImage.src = newUrl;
}

function handleProfileUpdate(e) {
  e.preventDefault();

  const imageUrlInput = $("#imageUrl");
  const cleanedUrl = cleanImageUrl(imageUrlInput.val().trim());
  imageUrlInput.val(cleanedUrl);

  let isValid = true;
  const form = $("#profileForm");

  form.find(".input-error").removeClass("input-error");
  form.find(".error-message").hide();

  form.find('input[name="firstName"], input[name="lastName"], input[name="birthdate"], input[name="imageUrl"]').each(function () {
    const input = $(this);
    const validator = validationMap[input.attr("name")];
    if (validator) {
      const result = validator(input.val().trim());
      if (!result.valid) {
        isValid = false;
        showError(input, result.message);
      }
    }
  });

  const newPasswordInput = $("#newPassword");
  const confirmPasswordInput = $("#confirmPassword");
  const newPassword = newPasswordInput.val();

  if (newPassword) {
    const newPasswordResult = validationMap.newPassword(newPassword);
    if (!newPasswordResult.valid) {
      isValid = false;
      showError(newPasswordInput, newPasswordResult.message);
    }

    const confirmPasswordResult = validationMap.confirmPassword();
    if (!confirmPasswordResult.valid) {
      isValid = false;
      showError(confirmPasswordInput, confirmPasswordResult.message);
    }
  }

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
      showPopup("Profile updated successfully!", true);

      localStorage.setItem("currentUser", JSON.stringify(updatedUserFromServer));

      currentUser = updatedUserFromServer;
      $(".nav-profile-picture").attr("src", currentUser.imageUrl || "../sources/images/no-image.png");

      button.text("Save Changes").prop("disabled", false);
    },
    (err) => {
      showPopup("Failed to update profile. Please check your inputs.", false);
      button.text("Save Changes").prop("disabled", false);
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
  const confirmContainer = $(".confirm-password-container");
  const passwordValue = $(this).val();
  confirmContainer.toggleClass("show", !!passwordValue);
  updatePasswordCriteria(passwordValue);
}

function loadUserProfile() {
  if (!currentUser || !currentUser.id) return;

  getProfile(
    currentUser.id,
    (profileData) => {
      populateForm(profileData);
    },
    (err) => {
      showPopup("Could not load your profile data. Please log in again.", false);
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

  populateInterestsList();
  loadUserProfile();

  $(document)
    .on("click", ".interest-item", handleInterestListItemSelection)
    .on("click", ".unblock-btn", handleUnblockUser)
    .on("input", "#imageUrl", handleImagePreview)
    .on("submit", "#profileForm", handleProfileUpdate)
    .on("click", ".password-toggle-btn", handlePasswordToggle)
    .on("input", "#newPassword", handleNewPasswordInput)
    .on("focus", "#newPassword", showPasswordCriteria)
    .on("input", ".form-group input", function () {
      clearValidationState($(this));
    })
    .on("input change", 'input[type="date"]', (e) => $(e.target).toggleClass("has-value", !!$(e.target).val()));

  $("#avatarPreview").on("error", function () {
    $(this).off("error").attr("src", "../sources/images/no-image.png");
  });
});
