const CONFIG = {
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    TOTAL_REQUIREMENTS: 3
  },
  VALIDATION_REGEX: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NAME: /^[a-zA-Z\s'-]{2,30}$/,
    PASSWORD_LETTER_AND_NUMBER: /^(?=.*[a-zA-Z])(?=.*\d)/,
    PASSWORD_LETTER_AND_SPECIAL: /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
    PASSWORD_UPPERCASE_LOWERCASE: /^(?=.*[a-z])(?=.*[A-Z])/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  },
  AGE_LIMITS: {
    MIN_AGE: 18,
    MAX_AGE: 120
  },
  INTERESTS: ["Business", "Entertainment", "General", "Health", "Science", "Sports", "Technology", "Travel", "Culture"]
};

// ========== Shared Validation Functions ==========

function validateEmail(val) {
  if (!val) return { valid: false, message: "Email is required" };
  if (!CONFIG.VALIDATION_REGEX.EMAIL.test(val)) return { valid: false, message: "Please enter a valid email address" };
  return { valid: true };
}

function validateName(name, fieldName) {
  if (!name) return { valid: false, message: `${fieldName} is required` };
  if (!CONFIG.VALIDATION_REGEX.NAME.test(name)) return { valid: false, message: `${fieldName} must be 2-30 letters, spaces, hyphens, or apostrophes` };
  return { valid: true };
}

function validateBirthdate(val) {
  if (!val) return { valid: false, message: "Birthdate is required" };
  const today = new Date();
  const selectedDate = new Date(val);
  let age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) age--;

  if (selectedDate > today) return { valid: false, message: "Birthdate cannot be in the future" };
  if (age < CONFIG.AGE_LIMITS.MIN_AGE) return { valid: false, message: `You must be at least ${CONFIG.AGE_LIMITS.MIN_AGE} years old` };
  if (age > CONFIG.AGE_LIMITS.MAX_AGE) return { valid: false, message: "Please enter a valid birthdate" };
  return { valid: true };
}

function validatePassword(val) {
  const hasLetterAndNumber = CONFIG.VALIDATION_REGEX.PASSWORD_LETTER_AND_NUMBER.test(val) || CONFIG.VALIDATION_REGEX.PASSWORD_LETTER_AND_SPECIAL.test(val);
  const hasMixedCase = CONFIG.VALIDATION_REGEX.PASSWORD_UPPERCASE_LOWERCASE.test(val);

  if (!val) return { valid: false, message: "Password is required" };
  if (val.length < CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH)
    return { valid: false, message: `Password must be at least ${CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long` };

  if (!hasMixedCase) return { valid: false, message: "Password must include both uppercase and lowercase letters" };

  if (!hasLetterAndNumber) return { valid: false, message: "Password must contain letters with a number or special character" };

  return { valid: true };
}

function validateImageUrl(val) {
  if (!val) return { valid: true }; // URL is optional
  if (!CONFIG.VALIDATION_REGEX.URL.test(val)) return { valid: false, message: "Please enter a valid URL." };
  return { valid: true };
}

// ========== Shared UI Helper Functions ==========

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  formGroup.find(".error-message").text(message).show();
  input.addClass("input-error");
}

function clearValidationState(input) {
  const formGroup = input.closest(".form-group");
  formGroup.find(".error-message").hide();
  input.removeClass("input-error");
}

// ========== Shared Interest Handling Logic ==========

function populateInterestsList() {
  const listContainer = $("#interestsList");
  CONFIG.INTERESTS.forEach((interest) => {
    const interestSlug = interest.toLowerCase();
    const item = `
      <div class="interest-item" data-interest="${interestSlug}">
        ${interest}
      </div>
    `;
    listContainer.append(item);
  });
}

function populateInterestsGrid() {
  const grid = $("#interestsGrid");
  CONFIG.INTERESTS.forEach((interest) => {
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

function updateInterestSubtitle(selectedCount, isError = false) {
  const remaining = 3 - selectedCount;
  const subtitle = $(".interests-subtitle");

  subtitle.removeClass("is-valid is-invalid");

  if (isError) {
    subtitle.text("Please select at least 3 interests to continue.").addClass("is-invalid");
    if ($(window).width() <= MOBILE_BREAKPOINT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  if (selectedCount < 3) {
    subtitle.text(`Select ${remaining} more interest${remaining > 1 ? "s" : ""} to continue.`);
  } else {
    subtitle.text(`You've selected ${selectedCount} interests. You're all set!`).addClass("is-valid");
  }
}

function handleInterestSelection(e) {
  const card = $(e.currentTarget);
  const interest = card.data("interest");
  const title = card.find(".interest-card-title");

  card.toggleClass("selected");
  title.toggleClass("selected");

  return interest;
}

// ========== Shared Password Criteria UI Logic ==========

function showPasswordCriteria() {
  $(".password-criteria").addClass("show");
}

function resetPasswordCriteria() {
  $(".password-criteria").removeClass("show");
  $(".password-progress-fill").removeClass("weak medium strong");
}

function updatePasswordProgress(validCount) {
  const strengthLevels = { 0: "", 1: "weak", 2: "medium", 3: "strong" };
  const level = strengthLevels[validCount];
  $(".password-progress-fill").removeClass("weak medium strong").addClass(level);
}

function updatePasswordCriteria(password) {
  const requirements = {
    length: $('.password-requirement[data-requirement="length"]'),
    alphanumeric: $('.password-requirement[data-requirement="alphanumeric"]'),
    case: $('.password-requirement[data-requirement="case"]')
  };

  const validations = {
    isLengthValid: password.length >= CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasLetterAndNumber: CONFIG.VALIDATION_REGEX.PASSWORD_LETTER_AND_NUMBER.test(password) || CONFIG.VALIDATION_REGEX.PASSWORD_LETTER_AND_SPECIAL.test(password),
    hasMixedCase: CONFIG.VALIDATION_REGEX.PASSWORD_UPPERCASE_LOWERCASE.test(password)
  };

  requirements.length.toggleClass("valid", validations.isLengthValid).toggleClass("invalid", !validations.isLengthValid);
  requirements.alphanumeric.toggleClass("valid", validations.hasLetterAndNumber).toggleClass("invalid", !validations.hasLetterAndNumber);
  requirements.case.toggleClass("valid", validations.hasMixedCase).toggleClass("invalid", !validations.hasMixedCase);

  const validCount = Object.values(validations).filter(Boolean).length;
  updatePasswordProgress(validCount);
}
