let cache = {};
let userEmail = "";
let signupData = {};
let selectedInterests = [];

const validationMap = {
  email: validateEmail,
  firstName: (val) => validateName(val, "First name"),
  lastName: (val) => validateName(val, "Last name"),
  birthdate: validateBirthdate,
  password: validatePassword
};

// ========== UI & State Functions ==========
function showPasswordCriteria() {
  cache.passwordCriteria.addClass("show");
}

function resetPasswordCriteria() {
  cache.passwordCriteria.removeClass("show");
  cache.passwordProgressFill.removeClass("weak medium strong");
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

function updatePasswordProgress(validCount) {
  const strengthLevels = { 0: "", 1: "weak", 2: "medium", 3: "strong" };
  const level = strengthLevels[validCount];
  cache.passwordProgressFill.removeClass("weak medium strong").addClass(level);
}

function validateForm(formId) {
  let isValid = true;
  const form = $(formId);

  form.find(".input-error").removeClass("input-error");
  form.find(".error-message").hide();

  form.find("input").each(function () {
    const input = $(this);
    const inputName = input.attr("name");
    const value = input.val().trim();
    const validator = validationMap[inputName];

    if (validator) {
      const validation = validator(value);
      if (!validation.valid) {
        showError(input, validation.message);
        isValid = false;
      }
    }
  });

  if (!isValid) {
    form.find(".input-error").first().focus();
  }
  return isValid;
}

// ========== Page Flow & Form Switching ==========
function switchForm(activeForm, title) {
  cache.authContainer.removeClass("interests-active");

  $(".auth-form").removeClass("active");
  activeForm.addClass("active");
  cache.authTitle.text(title);

  const docTitleMap = {
    signupForm: "HORIZON / Sign Up",
    signinForm: "HORIZON / Sign In",
    interestsForm: "HORIZON / Personalize"
  };
  document.title = docTitleMap[activeForm.attr("id")] || "HORIZON";

  if (activeForm.is(cache.interestsForm)) {
    cache.authContainer.addClass("interests-active");
  }
}

function showSigninForm(email) {
  switchForm(cache.signinForm, "Welcome back!");
  cache.signinForm.find(".email-text").text(email);
  setTimeout(() => cache.signinForm.find("input[name='password']").focus(), 100);
}

function showSignupForm(email) {
  switchForm(cache.signupForm, "Create Your Account");
  cache.signupForm.find(".email-text").text(email);
  setTimeout(() => cache.signupForm.find("input[name='firstName']").focus(), 100);
}

// ========== API Call Simulation ==========
function checkUserExists(email) {
  console.log("Checking if user exists:", email);
  const button = $("#emailFormData .auth-button");
  button.text("Checking...").prop("disabled", true);

  setTimeout(() => {
    button.text("Continue").prop("disabled", false);
    const userExists = Math.random() > 0.5; // Simulate API response
    userExists ? showSigninForm(email) : showSignupForm(email);
  }, 1000);
}

// ========== Event Handlers ==========
function handleEmailSubmit(e) {
  e.preventDefault();
  if (!validateForm("#emailFormData")) return;
  const email = $(this).find("input[name='email']").val().trim();
  userEmail = email;
  checkUserExists(email);
}

function handleSignin(e) {
  e.preventDefault();

  const passwordInput = $(this).find('input[name="password"]');
  const password = passwordInput.val();

  if (!password) {
    showError(passwordInput, "Password is required.");
    return;
  }

  console.log("Sign in:", { email: userEmail, password: password });
  alert("Sign in successful! (This is just a demo)");
}

function handleSignup(e) {
  e.preventDefault();
  if (!validateForm("#signupFormData")) return;

  signupData = Object.fromEntries(new FormData(e.target));
  switchForm(cache.interestsForm, "Tell Us What You Like");
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

function handleFinalSignup(e) {
  e.preventDefault();
  if (selectedInterests.length < 3) {
    updateInterestSubtitle(selectedInterests.length, true);
    return;
  }

  const finalUserData = {
    email: userEmail,
    ...signupData,
    interests: selectedInterests
  };

  console.log("Final account data:", finalUserData);
  alert("Account created successfully! Check the console for the final data object.");
}

function handleChangeEmail() {
  switchForm(cache.emailForm, "Welcome to Horizon");
  cache.emailForm.find("input[name='email']").val("").focus();
  resetPasswordCriteria();
  cache.sunImage.attr("src", "../sources/images/sun/sun-0.png");
}

function handleForgotPassword(e) {
  e.preventDefault();
  alert(`Password reset link will be sent to: ${userEmail}`);
}

function handlePasswordToggle() {
  const button = $(this);
  const passwordInput = button.siblings('input[name="password"]');
  const icon = button.find(".password-toggle-icon");
  const isPassword = passwordInput.attr("type") === "password";

  const cursorPosition = passwordInput[0].selectionStart;

  passwordInput.attr("type", isPassword ? "text" : "password");
  icon.attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");
  icon.attr("alt", isPassword ? "Hide password" : "Show password");

  passwordInput.focus();
  passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);

  setTimeout(() => {
    if (isPassword && window.animatePasswordShow) window.animatePasswordShow();
    if (!isPassword && window.animatePasswordHide) window.animatePasswordHide();
  }, 10);
}

// ========== Initialization ==========
function setupAuthHandlers() {
  $(document)
    .on("submit", "#emailFormData", handleEmailSubmit)
    .on("submit", "#signinFormData", handleSignin)
    .on("submit", "#signupFormData", handleSignup)
    .on("submit", "#interestsFormData", handleFinalSignup)
    .on("click", ".change-email-btn", handleChangeEmail)
    .on("click", ".forgot-password", handleForgotPassword)
    .on("click", ".password-toggle-btn", handlePasswordToggle)
    .on("click", ".interest-card", localHandleInterestSelection);
}

function setupFormValidation() {
  $(document)
    .on("focus", '#signupFormData input[name="password"]', showPasswordCriteria)
    .on("input", '#signupFormData input[name="password"]', (e) => updatePasswordCriteria($(e.target).val()))
    .on("input", ".form-group input", (e) => clearValidationState($(e.target)))
    .on("input change", 'input[type="date"]', (e) => $(e.target).toggleClass("has-value", !!$(e.target).val()));
}

function init() {
  cache = {
    document: $(document),
    authContainer: $(".auth-container"),
    sunImage: $(".auth-logo img"),
    authTitle: $(".auth-title"),
    emailForm: $("#emailForm"),
    signinForm: $("#signinForm"),
    signupForm: $("#signupForm"),
    interestsForm: $("#interestsForm"),
    interestsSubtitle: $(".interests-subtitle"),
    passwordCriteria: $(".password-criteria"),
    passwordProgressFill: $(".password-progress-fill")
  };

  populateInterestsGrid();
  setupAuthHandlers();
  setupFormValidation();
}

$(document).ready(init);
