const currentUser = {
  email: "testuser@horizon.com",
  firstName: "John",
  lastName: "Doe",
  birthdate: "1990-05-15",
  imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
  interests: ["business", "technology", "sports"]
};

let selectedInterests = [];

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
    $(`.interest-card[data-interest="${interest}"]`).addClass("selected").find(".interest-card-title").addClass("selected");
  });
  updateInterestSubtitle(selectedInterests.length);
}

function localHandleInterestSelection(e) {
  const interest = handleInterestSelection(e);
  const card = $(e.currentTarget);

  if (card.hasClass("selected")) {
    selectedInterests.push(interest);
  } else {
    selectedInterests = selectedInterests.filter((i) => i !== interest);
  }
  updateInterestSubtitle(selectedInterests.length);
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
      interests: selectedInterests
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
  populateInterestsGrid();
  populateForm(currentUser);

  $(document)
    .on("input change", 'input[type="date"]', (e) => $(e.target).toggleClass("has-value", !!$(e.target).val()))
    .on("click", ".interest-card", localHandleInterestSelection)
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

    // If the user is clicking the toggle button while the password input is focused,
    // we don't want to reset the criteria immediately.
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
