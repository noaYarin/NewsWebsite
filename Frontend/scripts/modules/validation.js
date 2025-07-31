class ValidationManager {
  static rules = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    name: /^[a-zA-Z\s'-]{2,30}$/,
    passwordLetterAndNumber: /^(?=.*[a-zA-Z])(?=.*\d)/,
    passwordLetterAndSpecial: /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
    passwordUpperLower: /^(?=.*[a-z])(?=.*[A-Z])/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  };

  static interests = ["Business", "Entertainment", "General", "Health", "Science", "Sports", "Technology", "Travel", "Culture"];

  static validateEmail(val) {
    if (!val) return { valid: false, message: "Email is required" };
    if (!this.rules.email.test(val)) return { valid: false, message: "Please enter a valid email address" };
    return { valid: true };
  }

  static validateName(name, fieldName) {
    if (!name) return { valid: false, message: `${fieldName} is required` };
    if (!this.rules.name.test(name)) return { valid: false, message: `${fieldName} must be 2-30 letters, spaces, hyphens, or apostrophes` };
    return { valid: true };
  }

  static validatePassword(val) {
    const constants = window.CONSTANTS || { VALIDATION: { PASSWORD_REQUIREMENTS: { MIN_LENGTH: 8 } } };
    const hasLetterAndNumber = this.rules.passwordLetterAndNumber.test(val) || this.rules.passwordLetterAndSpecial.test(val);
    const hasMixedCase = this.rules.passwordUpperLower.test(val);

    if (!val) return { valid: false, message: "Password is required" };
    if (val.length < constants.VALIDATION.PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      return { valid: false, message: `Password must be at least ${constants.VALIDATION.PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long` };
    }
    if (!hasMixedCase) return { valid: false, message: "Password must include both uppercase and lowercase letters" };
    if (!hasLetterAndNumber) return { valid: false, message: "Password must contain letters with a number or special character" };

    return { valid: true };
  }

  static validateBirthdate(val) {
    const constants = window.CONSTANTS || { VALIDATION: { AGE_LIMITS: { MIN_AGE: 18, MAX_AGE: 120 } } };
    if (!val) return { valid: false, message: "Birthdate is required" };

    const today = new Date();
    const selectedDate = new Date(val);
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) age--;

    if (selectedDate > today) return { valid: false, message: "Birthdate cannot be in the future" };
    if (age < constants.VALIDATION.AGE_LIMITS.MIN_AGE) return { valid: false, message: `You must be at least ${constants.VALIDATION.AGE_LIMITS.MIN_AGE} years old` };
    if (age > constants.VALIDATION.AGE_LIMITS.MAX_AGE) return { valid: false, message: "Please enter a valid birthdate" };

    return { valid: true };
  }

  static validateImageUrl(url) {
    if (!url) return { valid: false };

    const pattern = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)$/i;

    const isValid = pattern.test(url);
    return {
      valid: isValid,
      message: isValid ? "" : "Image URL cannot contain parameters. Please use a direct link."
    };
  }

  static cleanImageUrl(url) {
    if (!url) return "";
    const queryIndex = url.indexOf("?");
    if (queryIndex !== -1) {
      return url.substring(0, queryIndex);
    }
    return url;
  }

  static showError(input, message) {
    const formGroup = input.closest(".form-group");
    formGroup.find(".error-message").text(message).show();
    input.addClass("input-error");
  }

  static clearValidationState(input) {
    const formGroup = input.closest(".form-group");
    formGroup.find(".error-message").hide();
    input.removeClass("input-error");
  }

  static populateInterestsList() {
    const listContainer = $("#interestsList");
    if (!listContainer.length) return;

    this.interests.forEach((interest) => {
      const interestSlug = interest.toLowerCase();
      const item = `
        <div class="interest-item" data-interest="${interestSlug}">
          ${interest}
        </div>
      `;
      listContainer.append(item);
    });
  }

  static populateInterestsGrid() {
    const grid = $("#interestsGrid");
    if (!grid.length) return;

    this.interests.forEach((interest) => {
      const interestSlug = interest.toLowerCase();
      const imageUrl = `../sources/images/categories/${interest}.jpg`;
      const card = `
        <div class="col-12 col-md-4">
          <div class="interest-card" data-interest="${interestSlug}" style="background-image: url('${imageUrl}');">
            <span class="interest-card-title">${interest}</span>
          </div>
        </div>
      `;
      grid.append(card);
    });
  }

  static updateInterestSubtitle(selectedCount, isError = false) {
    const remaining = 3 - selectedCount;
    const subtitle = $(".interests-subtitle");
    if (!subtitle.length) return;

    subtitle.removeClass("is-valid is-invalid");

    if (isError) {
      subtitle.text("Please select at least 3 interests to continue.").addClass("is-invalid");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (selectedCount < 3) {
      subtitle.text(`Select ${remaining} more interest${remaining > 1 ? "s" : ""} to continue.`);
    } else {
      subtitle.text(`You've selected ${selectedCount} interests. You're all set!`).addClass("is-valid");
    }
  }

  static handleInterestSelection(e) {
    const card = $(e.currentTarget);
    const interest = card.data("interest");
    const title = card.find(".interest-card-title");

    card.toggleClass("selected");
    title.toggleClass("selected");

    return interest;
  }

  static showPasswordCriteria() {
    $(".password-criteria").addClass("show");
  }

  static resetPasswordCriteria() {
    $(".password-criteria").removeClass("show");
    $(".password-progress-fill").removeClass("weak medium strong");
  }

  static updatePasswordProgress(validCount) {
    const strengthLevels = { 0: "", 1: "weak", 2: "medium", 3: "strong" };
    const level = strengthLevels[validCount];
    $(".password-progress-fill").removeClass("weak medium strong").addClass(level);
  }

  static updatePasswordCriteria(password) {
    const constants = window.CONSTANTS || { VALIDATION: { PASSWORD_REQUIREMENTS: { MIN_LENGTH: 8 } } };
    const requirements = {
      length: $('.password-requirement[data-requirement="length"]'),
      alphanumeric: $('.password-requirement[data-requirement="alphanumeric"]'),
      case: $('.password-requirement[data-requirement="case"]')
    };

    const validations = {
      isLengthValid: password.length >= constants.VALIDATION.PASSWORD_REQUIREMENTS.MIN_LENGTH,
      hasLetterAndNumber: this.rules.passwordLetterAndNumber.test(password) || this.rules.passwordLetterAndSpecial.test(password),
      hasMixedCase: this.rules.passwordUpperLower.test(password)
    };

    requirements.length.toggleClass("valid", validations.isLengthValid).toggleClass("invalid", !validations.isLengthValid);
    requirements.alphanumeric.toggleClass("valid", validations.hasLetterAndNumber).toggleClass("invalid", !validations.hasLetterAndNumber);
    requirements.case.toggleClass("valid", validations.hasMixedCase).toggleClass("invalid", !validations.hasMixedCase);

    const validCount = Object.values(validations).filter(Boolean).length;
    this.updatePasswordProgress(validCount);
  }
}

window.ValidationManager = ValidationManager;
