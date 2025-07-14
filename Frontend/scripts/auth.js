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

/* Email Submit Form */
function handleEmailSubmit(e) {
  e.preventDefault();
  if (!validateForm("#emailFormData")) return;
  const email = $(this).find("input[name='email']").val().trim();
  userEmail = email;
  handleUserExistsCheck(email);
}

function handleUserExistsCheck(email) {
  const button = $("#emailFormData .auth-button");
  button.text("Checking...").prop("disabled", true);

  checkUserExists(
    email,
    (userExists) => {
      button.text("Continue").prop("disabled", false);
      if (userExists) {
        showSigninForm(email);
      } else {
        showSignupForm(email);
      }
    },
    (err) => {
      showPopup("An error occurred while checking your email. Please try again.", false);
      button.text("Continue").prop("disabled", false);
    }
  );
}

function handleChangeEmail() {
  switchForm(cache.emailForm, "Welcome to Horizon");
  cache.emailForm.find("input[name='email']").val("").focus();
  resetPasswordCriteria();
  cache.sunImage.attr("src", "../sources/images/sun/sun-0.png");
}

function handleForgotPassword(e) {
  e.preventDefault();
  // TODO: Implement actual password reset logic
  showPopup(`Password reset link will be sent to: ${userEmail}`, "muted");
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

  // Trigger sun animation
  setTimeout(() => {
    if (isPassword && window.animatePasswordShow) window.animatePasswordShow();
    if (!isPassword && window.animatePasswordHide) window.animatePasswordHide();
  }, 10);
}

/* Form Switching */
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

/* Sign in Form */
function handleSignin(e) {
  e.preventDefault();
  const form = $(this);
  const passwordInput = form.find('input[name="password"]');
  const password = passwordInput.val();
  const button = form.find(".auth-button");

  if (!password) {
    showError(passwordInput, "Password is required.");
    return;
  }

  const credentials = {
    email: userEmail,
    password: password
  };

  button.text("Signing In...").prop("disabled", true);

  loginUser(
    credentials,
    (userData) => {
      if (userData && userData.id) {
        localStorage.setItem("currentUser", JSON.stringify(userData));
        window.location.href = "index.html";
      } else {
        showPopup("Invalid email or password.", false);
        button.text("Sign In").prop("disabled", false);
      }
    },
    (err) => {
      showPopup("Invalid email or password. Please try again.", false);
      button.text("Sign In").prop("disabled", false);
    }
  );
}

/* Sign up Form */
function handleSignupFormSubmit(e) {
  e.preventDefault();
  if (!validateForm("#signupFormData")) return;

  // Store data from the first form temporarily
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
  const button = $(e.currentTarget).find(".auth-button");

  const finalUserData = {
    Email: userEmail,
    FirstName: signupData.firstName,
    LastName: signupData.lastName,
    BirthDate: signupData.birthdate,
    Password: signupData.password,
    Tags: selectedInterests.map((interestName) => ({ Name: interestName }))
  };

  button.text("Creating Account...").prop("disabled", true);

  registerUser(
    finalUserData,
    (response) => {
      showPopup("Account created! Please sign in to continue.", true);
      showSigninForm(userEmail);
      cache.signinForm.find("input[name='password']").val("");
    },
    (err) => {
      const errorMessage = err.responseJSON?.message || "An error occurred during registration. Please try again.";
      showPopup(errorMessage, false);
      button.text("Finish").prop("disabled", false);
    }
  );
}

/* General Utility Functions */
function setupAuthHandlers() {
  $(document)
    .on("submit", "#emailFormData", handleEmailSubmit)
    .on("submit", "#signinFormData", handleSignin)
    .on("submit", "#signupFormData", handleSignupFormSubmit)
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
    interestsForm: $("#interestsForm")
  };

  populateInterestsGrid();
  setupAuthHandlers();
  setupFormValidation();
}

$(document).ready(init);
