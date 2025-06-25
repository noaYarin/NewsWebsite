const currentUser = {
  email: "testuser@horizon.com",
  firstName: "John",
  lastName: "Doe",
  birthdate: "1990-05-15",
  imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
  interests: ["business", "technology", "sports"],
  blockedUsers: [
    { id: "u001", name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: "u002", name: "Mike Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: "u003", name: "Emily White", avatar: "https://randomuser.me/api/portraits/women/65.jpg" }
  ]
};

let selectedInterests = [];
let currentBlockedUsers = [];

function validatePasswordMatch() {
  const newPassword = $("#newPassword").val();
  const confirmPassword = $("#confirmPassword").val();
  if (newPassword !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true };
}

const validationMap = {
  firstName: (val) => validateName(val, "First name"),
  lastName: (val) => validateName(val, "Last name"),
  birthdate: validateBirthdate,
  imageUrl: validateImageUrl,
  newPassword: validatePassword,
  confirmPassword: validatePasswordMatch
};

function populateForm(user) {
  $("#emailDisplay").text(user.email);
  $("#firstName").val(user.firstName);
  $("#lastName").val(user.lastName);
  $("#birthdate").val(user.birthdate);
  $("#imageUrl").val(user.imageUrl);
  $("#avatarPreview").attr("src", user.imageUrl);

  selectedInterests = [...user.interests];
  selectedInterests.forEach((interest) => {
    $(`.interest-item[data-interest="${interest}"]`).addClass("selected");
  });

  currentBlockedUsers = [...user.blockedUsers];
  populateBlockedUsersList(currentBlockedUsers);
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
        <img src="${user.avatar}" alt="${user.name}" class="blocked-user-avatar" />
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
  const userId = item.data("user-id");

  item.fadeOut(300, function () {
    $(this).remove();
    currentBlockedUsers = currentBlockedUsers.filter((user) => user.id !== userId);
    if (currentBlockedUsers.length === 0) {
      populateBlockedUsersList(currentBlockedUsers);
    }
  });
}

function handleImagePreview() {
  const newUrl = $(this).val();
  if (newUrl && CONFIG.VALIDATION_REGEX.URL.test(newUrl)) {
    $("#avatarPreview").attr("src", newUrl);
  }
}

function handleProfileUpdate(e) {
  e.preventDefault();
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
  }

  if (isValid) {
    const updatedData = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      birthdate: $("#birthdate").val(),
      imageUrl: $("#imageUrl").val(),
      interests: selectedInterests,
      // Add the updated blocked users list to the final data
      blockedUsers: currentBlockedUsers
    };

    if (newPassword) {
      updatedData.newPassword = newPassword;
    }

    console.log("Updated User Data:", updatedData);
    alert("Profile updated successfully! Check the console for the data.");
  }

  if (!isValid) {
    form.find(".input-error").first().focus();
  }
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

  if (passwordValue) {
    confirmContainer.addClass("show");
  } else {
    confirmContainer.removeClass("show");
  }

  updatePasswordCriteria(passwordValue);
}

$(document).ready(function () {
  populateInterestsList();
  populateForm(currentUser);

  $(document)
    .on("input change", 'input[type="date"]', (e) => $(e.target).toggleClass("has-value", !!$(e.target).val()))
    .on("click", ".interest-item", handleInterestListItemSelection)
    .on("click", ".unblock-btn", handleUnblockUser) // Add listener for unblock button
    .on("input", "#imageUrl", handleImagePreview)
    .on("submit", "#profileForm", handleProfileUpdate)
    .on("input", ".form-group input", function () {
      clearValidationState($(this));
    });

  $(document).on("focus", "#newPassword", showPasswordCriteria);
  $(document).on("input", "#newPassword", handleNewPasswordInput);
  $(document).on("click", ".password-toggle-btn", handlePasswordToggle);

  $(document).on("blur", "#newPassword", function (e) {
    const relatedTarget = e.relatedTarget;
    const isClickingToggle = $(relatedTarget).is(".password-toggle-btn");

    if (isClickingToggle) {
      return;
    }

    if (!$(this).val()) {
      resetPasswordCriteria();
    }
  });

  $("#avatarPreview").on("error", function () {
    $(this).attr("src", "../sources/images/test.avif");
  });
});
