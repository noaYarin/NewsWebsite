const ProfileFormManager = {
  selectedInterests: [],
  originalFormState: null,
  validationMap: {
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
  },

  init() {
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document)
      .on("click", ".interest-item", (e) => this.handleInterestListItemSelection(e))
      .on("click", ".unblock-btn", (e) => this.handleUnblockUser(e))
      .on("input", "#imageUrl", this.handleImagePreview)
      .on("submit", "#profileForm", (e) => this.handleProfileUpdate(e))
      .on("click", ".password-toggle-btn", this.handlePasswordToggle)
      .on("input", "#newPassword", this.handleNewPasswordInput)
      .on("focus", "#newPassword", ValidationManager.showPasswordCriteria)
      .on("input", ".form-group input", function () {
        ValidationManager.clearValidationState($(this));
        ProfileFormManager.updateSubmitButtonState();
      })
      .on("input change", 'input[type="date"]', (e) => {
        $(e.target).toggleClass("has-value", !!$(e.target).val());
        ProfileFormManager.updateSubmitButtonState();
      });

    $("#avatarPreview").on("error", function () {
      $(this).off("error").attr("src", CONSTANTS.NO_IMAGE_URL);
    });
  },

  captureOriginalFormState() {
    this.originalFormState = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      birthdate: $("#birthdate").val(),
      imageUrl: $("#imageUrl").val(),
      interests: [...this.selectedInterests],
      newPassword: ""
    };
  },

  hasFormChanged() {
    if (!this.originalFormState) return false;

    const currentState = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      birthdate: $("#birthdate").val(),
      imageUrl: $("#imageUrl").val(),
      interests: [...this.selectedInterests],
      newPassword: $("#newPassword").val()
    };

    return Object.keys(currentState).some((key) =>
      key === "interests"
        ? JSON.stringify(currentState.interests.sort()) !== JSON.stringify(this.originalFormState.interests.sort())
        : currentState[key] !== this.originalFormState[key]
    );
  },

  updateSubmitButtonState() {
    const submitButton = $("#profileForm button[type='submit']");
    const hasChanges = this.hasFormChanged();

    submitButton.prop("disabled", !hasChanges);
    submitButton.text(hasChanges ? "Save Changes" : "No Changes").toggleClass("no-changes", !hasChanges);
  },

  populateForm(userProfile) {
    $("#emailDisplay").text(userProfile.email);
    $("#firstName").val(userProfile.firstName);
    $("#lastName").val(userProfile.lastName);
    $("#birthdate").val(userProfile.birthDate);
    $("#imageUrl").val(userProfile.imageUrl);
    $("#avatarPreview").attr("src", userProfile.imageUrl || CONSTANTS.NO_IMAGE_URL);

    this.selectedInterests = [...userProfile.interests];
    $(".interest-item").removeClass("selected");
    this.selectedInterests.forEach((interest) => $(`.interest-item[data-interest="${interest}"]`).addClass("selected"));
    ValidationManager.updateInterestSubtitle(this.selectedInterests.length);

    this.populateBlockedUsersList(userProfile.blockedUsers);
    ProfileFriendsManager.loadAndPopulateFriendsList();

    this.captureOriginalFormState();
    this.updateSubmitButtonState();
  },

  populateBlockedUsersList(users) {
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
  },

  handleInterestListItemSelection(e) {
    const item = $(e.currentTarget);
    const interest = item.data("interest");
    item.toggleClass("selected");

    if (item.hasClass("selected")) {
      this.selectedInterests.push(interest);
    } else {
      this.selectedInterests = this.selectedInterests.filter((i) => i !== interest);
    }
    ValidationManager.updateInterestSubtitle(this.selectedInterests.length);
    this.updateSubmitButtonState();
  },

  handleUnblockUser(e) {
    const currentUser = Utils.getCurrentUser();
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
  },

  handleImagePreview() {
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
  },

  handleProfileUpdate(e) {
    e.preventDefault();

    if (!this.hasFormChanged()) return;

    const currentUser = Utils.getCurrentUser();
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
      const validator = this.validationMap[fieldName];
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
      const newPasswordResult = this.validationMap.newPassword(newPassword);
      if (!newPasswordResult.valid) {
        isValid = false;
        ValidationManager.showError($("#newPassword"), newPasswordResult.message);
      }

      const confirmPasswordResult = this.validationMap.confirmPassword();
      if (!confirmPasswordResult.valid) {
        isValid = false;
        ValidationManager.showError($("#confirmPassword"), confirmPasswordResult.message);
      }
    }

    // Validate interests
    if (this.selectedInterests.length < 3) {
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
      interests: this.selectedInterests,
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
        $(".nav-profile-picture").attr("src", updatedUserFromServer.imageUrl || CONSTANTS.NO_IMAGE_URL);

        $("#newPassword").val("");
        $("#confirmPassword").val("");
        $(".confirm-password-container").removeClass("show");

        this.captureOriginalFormState();
        this.updateSubmitButtonState();
      },
      () => {
        UIManager.showPopup("Failed to update profile. Please check your inputs.", false);
        this.updateSubmitButtonState();
      }
    );
  },

  handlePasswordToggle() {
    const button = $(this);
    const passwordInput = button.closest(".password-input-group").find("input");
    const isPassword = passwordInput.attr("type") === "password";
    const cursorPosition = passwordInput[0].selectionStart;

    passwordInput.attr("type", isPassword ? "text" : "password");
    button.find(".password-toggle-icon").attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");

    passwordInput.focus();
    passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);
  },

  handleNewPasswordInput() {
    const passwordValue = $(this).val();
    $(".confirm-password-container").toggleClass("show", !!passwordValue);
    ValidationManager.updatePasswordCriteria(passwordValue);
  },

  loadUserProfile() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || !currentUser.id) return;

    getProfile(
      currentUser.id,
      (profileData) => this.populateForm(profileData),
      () => {
        UIManager.showPopup("Could not load your profile data. Please log in again.", false);
        localStorage.removeItem("currentUser");
        window.location.href = "auth.html";
      }
    );
  }
};

window.ProfileFormManager = ProfileFormManager;
