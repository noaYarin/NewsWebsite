class ProfileFormManager {
  static selectedInterests = [];
  static originalFormState = null;

  static validationMap = {
    firstName: (val) => ValidationManager.validateName(val, "First name"),
    lastName: (val) => ValidationManager.validateName(val, "Last name"),
    birthdate: ValidationManager.validateBirthdate,
    imageUrl: ValidationManager.validateImageUrl,
    newPassword: (val) => (val ? ValidationManager.validatePassword(val) : { valid: true }),
    confirmPassword: () => this.validatePasswordConfirmation()
  };

  static selectors = {
    form: "#profileForm",
    firstName: "#firstName",
    lastName: "#lastName",
    birthdate: "#birthdate",
    imageUrl: "#imageUrl",
    avatarPreview: "#avatarPreview",
    newPassword: "#newPassword",
    confirmPassword: "#confirmPassword",
    submitButton: "#profileForm button[type='submit']",
    blockedUsersList: "#blockedUsersList",
    interestsError: "#interestsError"
  };

  static init() {
    this.setupEventHandlers();
  }

  static setupEventHandlers() {
    this.setupInterestHandlers();
    this.setupBlockedUsersHandlers();
    this.setupImageHandlers();
    this.setupFormHandlers();
    this.setupPasswordHandlers();
  }

  static setupInterestHandlers() {
    $(document).on("click", ".interest-item", (e) => this.handleInterestSelection(e));
  }

  static setupBlockedUsersHandlers() {
    $(document).on("click", ".unblock-btn", (e) => this.handleUnblockUser(e));
  }

  static setupImageHandlers() {
    $(document).on("input", this.selectors.imageUrl, this.handleImagePreview);
    $(this.selectors.avatarPreview).on("error", this.handleImageError);
  }

  static setupFormHandlers() {
    $(document)
      .on("submit", this.selectors.form, (e) => this.handleProfileUpdate(e))
      .on("input", ".form-group input", this.handleFormInput)
      .on("input change", 'input[type="date"]', this.handleDateInput);
  }

  static setupPasswordHandlers() {
    $(document)
      .on("click", ".password-toggle-btn", this.handlePasswordToggle)
      .on("input", this.selectors.newPassword, this.handleNewPasswordInput)
      .on("focus", this.selectors.newPassword, ValidationManager.showPasswordCriteria);
  }

  // === Form State Management ===
  static captureOriginalFormState() {
    this.originalFormState = this.getCurrentFormState();
  }

  static getCurrentFormState() {
    return {
      firstName: $(this.selectors.firstName).val(),
      lastName: $(this.selectors.lastName).val(),
      birthdate: $(this.selectors.birthdate).val(),
      imageUrl: $(this.selectors.imageUrl).val(),
      interests: [...this.selectedInterests],
      newPassword: $(this.selectors.newPassword).val() || ""
    };
  }

  static hasFormChanged() {
    if (!this.originalFormState) return false;

    const currentState = this.getCurrentFormState();

    return Object.keys(currentState).some((key) => {
      if (key === "interests") {
        return JSON.stringify(currentState.interests.sort()) !== JSON.stringify(this.originalFormState.interests.sort());
      }
      return currentState[key] !== this.originalFormState[key];
    });
  }

  static updateSubmitButtonState() {
    const submitButton = $(this.selectors.submitButton);
    const hasChanges = this.hasFormChanged();

    submitButton
      .prop("disabled", !hasChanges)
      .text(hasChanges ? "Save Changes" : "No Changes")
      .toggleClass("no-changes", !hasChanges);
  }

  // === Form Population Methods ===
  static populateForm(userProfile) {
    this.populateBasicFields(userProfile);
    this.populateInterests(userProfile.interests);
    this.populateBlockedUsersList(userProfile.blockedUsers);

    ProfileFriendsManager.loadAndPopulateFriendsList();

    this.captureOriginalFormState();
    this.updateSubmitButtonState();
  }

  static populateBasicFields(userProfile) {
    $("#emailDisplay").text(userProfile.email);
    $(this.selectors.firstName).val(userProfile.firstName);
    $(this.selectors.lastName).val(userProfile.lastName);
    $(this.selectors.birthdate).val(userProfile.birthDate);
    $(this.selectors.imageUrl).val(userProfile.imageUrl);
    $(this.selectors.avatarPreview).attr("src", userProfile.imageUrl || CONSTANTS.NO_IMAGE_URL);
  }

  static populateInterests(interests) {
    this.selectedInterests = [...interests];
    $(".interest-item").removeClass("selected");

    this.selectedInterests.forEach((interest) => {
      $(`.interest-item[data-interest="${interest}"]`).addClass("selected");
    });

    ValidationManager.updateInterestSubtitle(this.selectedInterests.length);
  }

  static populateBlockedUsersList(users) {
    const listContainer = $(this.selectors.blockedUsersList);
    listContainer.empty();

    if (users.length === 0) {
      listContainer.html('<p class="empty-list-message">You have no blocked users.</p>');
      return;
    }

    const userItems = users.map((user) => this.createBlockedUserItem(user)).join("");
    listContainer.html(userItems);
  }

  static createBlockedUserItem(user) {
    return `
      <div class="user-list-item" data-user-id="${user.id}">
        <img src="${user.avatar || CONSTANTS.NO_IMAGE_URL}" alt="${user.name}" class="user-list-avatar" />
        <span class="user-list-name">${user.name}</span>
        <button type="button" class="unblock-btn">Unblock</button>
      </div>
    `;
  }

  // === Event Handlers ===
  static handleInterestSelection(e) {
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
  }

  static handleUnblockUser(e) {
    const currentUser = Utils.getCurrentUser();
    const item = $(e.currentTarget).closest(".user-list-item");
    const blockedUserId = item.data("user-id");
    const userName = item.find(".user-list-name").text();

    UIManager.showDialog(`Are you sure you want to unblock ${userName}?`).then((confirmed) => {
      if (!confirmed) return;

      this.executeUnblockUser(currentUser, blockedUserId, item);
    });
  }

  static executeUnblockUser(currentUser, blockedUserId, item) {
    toggleBlockUser(
      currentUser.id,
      blockedUserId,
      (response) => {
        UIManager.showPopup(response.message, true);
        this.updateLocalUserData(currentUser, blockedUserId);
        this.removeBlockedUserFromUI(item);
      },
      () => UIManager.showPopup("Failed to unblock user. Please try again.", false)
    );
  }

  static updateLocalUserData(currentUser, blockedUserId) {
    if (currentUser && currentUser.blockedUsers) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter((user) => user.id != blockedUserId);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }

  static removeBlockedUserFromUI(item) {
    item.fadeOut(300, function () {
      $(this).remove();
      if ($("#blockedUsersList .user-list-item").length === 0) {
        $("#blockedUsersList").html('<p class="empty-list-message">You have no blocked users.</p>');
      }
    });
  }

  static handleImagePreview() {
    const imageUrlInput = $(this);
    const cleanedUrl = ValidationManager.cleanImageUrl(imageUrlInput.val().trim());
    imageUrlInput.val(cleanedUrl);

    if (!cleanedUrl) {
      ProfileFormManager.setAvatarPreview(CONSTANTS.NO_IMAGE_URL);
      return;
    }

    const validation = ValidationManager.validateImageUrl(cleanedUrl);
    if (!validation.valid) return;

    ProfileFormManager.loadImagePreview(cleanedUrl);
  }

  static loadImagePreview(imageUrl) {
    const tempImage = new Image();
    tempImage.onload = () => this.setAvatarPreview(imageUrl);
    tempImage.onerror = () => this.setAvatarPreview(CONSTANTS.NO_IMAGE_URL);
    tempImage.src = imageUrl;
  }

  static setAvatarPreview(imageUrl) {
    $(this.selectors.avatarPreview).attr("src", imageUrl);
  }

  static handleImageError() {
    $(this).off("error").attr("src", CONSTANTS.NO_IMAGE_URL);
  }

  static handleFormInput() {
    ValidationManager.clearValidationState($(this));
    ProfileFormManager.updateSubmitButtonState();
  }

  static handleDateInput(e) {
    $(e.target).toggleClass("has-value", !!$(e.target).val());
    ProfileFormManager.updateSubmitButtonState();
  }

  static handlePasswordToggle() {
    const button = $(this);
    const passwordInput = button.closest(".password-input-group").find("input");
    const isPassword = passwordInput.attr("type") === "password";
    const cursorPosition = passwordInput[0].selectionStart;

    ProfileFormManager.togglePasswordVisibility(passwordInput, button, isPassword, cursorPosition);
  }

  static togglePasswordVisibility(passwordInput, button, isPassword, cursorPosition) {
    passwordInput.attr("type", isPassword ? "text" : "password");
    button.find(".password-toggle-icon").attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");

    passwordInput.focus();
    passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);
  }

  static handleNewPasswordInput() {
    const passwordValue = $(this).val();
    $(".confirm-password-container").toggleClass("show", !!passwordValue);
    ValidationManager.updatePasswordCriteria(passwordValue);
  }

  // === Form Validation ===
  static validatePasswordConfirmation() {
    const newPassword = $(this.selectors.newPassword).val();
    const confirmPassword = $(this.selectors.confirmPassword).val();

    return newPassword !== confirmPassword ? { valid: false, message: "Passwords do not match." } : { valid: true };
  }

  static validateAllFields() {
    const form = $(this.selectors.form);
    let isValid = true;

    // Clear previous errors
    form.find(".input-error").removeClass("input-error");
    form.find(".error-message").hide();

    // Validate basic fields
    isValid = this.validateBasicFields(form) && isValid;

    // Validate passwords if present
    isValid = this.validatePasswords() && isValid;

    // Validate interests
    isValid = this.validateInterests() && isValid;

    return isValid;
  }

  static validateBasicFields(form) {
    let isValid = true;
    const fieldsToValidate = ["firstName", "lastName", "birthdate", "imageUrl"];

    fieldsToValidate.forEach((fieldName) => {
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

    return isValid;
  }

  static validatePasswords() {
    const newPassword = $(this.selectors.newPassword).val();
    if (!newPassword) return true;

    let isValid = true;

    const newPasswordResult = this.validationMap.newPassword(newPassword);
    if (!newPasswordResult.valid) {
      isValid = false;
      ValidationManager.showError($(this.selectors.newPassword), newPasswordResult.message);
    }

    const confirmPasswordResult = this.validationMap.confirmPassword();
    if (!confirmPasswordResult.valid) {
      isValid = false;
      ValidationManager.showError($(this.selectors.confirmPassword), confirmPasswordResult.message);
    }

    return isValid;
  }

  static validateInterests() {
    if (this.selectedInterests.length < 3) {
      $(this.selectors.interestsError).text("Please select at least 3 interests.").show();
      return false;
    }

    $(this.selectors.interestsError).hide();
    return true;
  }

  // === Form Submission ===
  static handleProfileUpdate(e) {
    e.preventDefault();

    if (!this.hasFormChanged()) return;

    this.cleanImageUrl();

    if (!this.validateAllFields()) {
      this.focusFirstError();
      return;
    }

    this.submitProfileUpdate(e);
  }

  static cleanImageUrl() {
    const imageUrlInput = $(this.selectors.imageUrl);
    const cleanedUrl = ValidationManager.cleanImageUrl(imageUrlInput.val().trim());
    imageUrlInput.val(cleanedUrl);
  }

  static focusFirstError() {
    $(this.selectors.form).find(".input-error").first().focus();
  }

  static submitProfileUpdate(e) {
    const currentUser = Utils.getCurrentUser();
    const updatedData = this.buildUpdateData();
    const button = $(e.target).find('button[type="submit"]');

    button.text("Saving...").prop("disabled", true);

    updateProfile(
      currentUser.id,
      updatedData,
      (updatedUserFromServer) => this.handleUpdateSuccess(updatedUserFromServer),
      () => this.handleUpdateError()
    );
  }

  static buildUpdateData() {
    return {
      firstName: $(this.selectors.firstName).val(),
      lastName: $(this.selectors.lastName).val(),
      birthdate: $(this.selectors.birthdate).val(),
      imageUrl: $(this.selectors.imageUrl).val(),
      interests: this.selectedInterests,
      newPassword: $(this.selectors.newPassword).val() || null
    };
  }

  static handleUpdateSuccess(updatedUserFromServer) {
    UIManager.showPopup("Profile updated successfully!", true);

    // Update local storage and UI
    localStorage.setItem("currentUser", JSON.stringify(updatedUserFromServer));
    $(".nav-profile-picture").attr("src", updatedUserFromServer.imageUrl || CONSTANTS.NO_IMAGE_URL);

    // Reset password fields
    this.clearPasswordFields();

    // Update form state
    this.captureOriginalFormState();
    this.updateSubmitButtonState();
  }

  static handleUpdateError() {
    UIManager.showPopup("Failed to update profile. Please check your inputs.", false);
    this.updateSubmitButtonState();
  }

  static clearPasswordFields() {
    $(this.selectors.newPassword).val("");
    $(this.selectors.confirmPassword).val("");
    $(".confirm-password-container").removeClass("show");
    $(".password-criteria").removeClass("show");
  }

  // === Profile Loading ===
  static loadUserProfile() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || !currentUser.id) return;

    getProfile(
      currentUser.id,
      (profileData) => this.populateForm(profileData),
      () => this.handleProfileLoadError()
    );
  }

  static handleProfileLoadError() {
    UIManager.showPopup("Could not load your profile data. Please log in again.", false);
    localStorage.removeItem("currentUser");
    window.location.href = "auth.html";
  }
}

window.ProfileFormManager = ProfileFormManager;
