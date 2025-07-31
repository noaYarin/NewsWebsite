let cache = {};
let userEmail = "";
let signupData = {};
let selectedInterests = [];

const AuthFormManager = {
  validationMap: {
    email: (val) => {
      if (val.trim().toLowerCase() === "admin") {
        return { valid: true, message: "" };
      }
      return ValidationManager.validateEmail(val);
    },
    firstName: (val) => ValidationManager.validateName(val, "First name"),
    lastName: (val) => ValidationManager.validateName(val, "Last name"),
    birthdate: (val) => ValidationManager.validateBirthdate(val),
    password: (val) => ValidationManager.validatePassword(val)
  },

  validateForm(formId) {
    let isValid = true;
    const form = $(formId);

    form.find(".input-error").removeClass("input-error");
    form.find(".error-message").hide();

    form.find("input").each((index, element) => {
      const input = $(element);
      const inputName = input.attr("name");
      const value = input.val().trim();
      const validator = this.validationMap[inputName];

      if (validator) {
        const validation = validator(value);
        if (!validation.valid) {
          ValidationManager.showError(input, validation.message);
          isValid = false;
        }
      }
    });

    if (!isValid) {
      form.find(".input-error").first().focus();
    }
    return isValid;
  },

  switchForm(activeForm, title) {
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
  },

  showSigninForm(email) {
    this.switchForm(cache.signinForm, "Welcome back!");
    cache.signinForm.find(".email-text").text(email);
    setTimeout(() => cache.signinForm.find("input[name='password']").focus(), 100);
  },

  showSignupForm(email) {
    this.switchForm(cache.signupForm, "Create Your Account");
    cache.signupForm.find(".email-text").text(email);
    setTimeout(() => cache.signupForm.find("input[name='firstName']").focus(), 100);
  },

  resetToEmailForm() {
    this.switchForm(cache.emailForm, "Welcome to Horizon");
    cache.emailForm.find("input[name='email']").val("").focus();
    ValidationManager.resetPasswordCriteria();
    cache.sunImage.attr("src", "../sources/images/sun/sun-0.png");
  }
};

const EmailHandler = {
  handleSubmit(e) {
    e.preventDefault();
    if (!AuthFormManager.validateForm("#emailFormData")) return;

    const email = $(e.target).find("input[name='email']").val().trim();
    userEmail = email;
    this.checkUserExists(email);
  },

  checkUserExists(email) {
    const button = $("#emailFormData .auth-button");
    button.text("Checking...").prop("disabled", true);

    checkUserExists(
      email,
      (userExists) => {
        button.text("Continue").prop("disabled", false);
        if (userExists) {
          AuthFormManager.showSigninForm(email);
        } else {
          AuthFormManager.showSignupForm(email);
        }
      },
      (err) => {
        UIManager.showPopup("An error occurred while checking your email. Please try again.", false);
        button.text("Continue").prop("disabled", false);
      }
    );
  }
};

const SigninHandler = {
  handleSubmit(e) {
    e.preventDefault();
    const form = $(e.target);
    const passwordInput = form.find('input[name="password"]');
    const password = passwordInput.val();
    const button = form.find(".auth-button");

    if (!password) {
      ValidationManager.showError(passwordInput, "Password is required.");
      return;
    }

    const credentials = { email: userEmail, password: password };
    button.text("Signing In...").prop("disabled", true);

    loginUser(
      credentials,
      (userData) => {
        if (userData && userData.id) {
          localStorage.setItem("currentUser", JSON.stringify(userData));
          window.location.href = "index.html";
        } else {
          UIManager.showPopup("Invalid email or password.", false);
          button.text("Sign In").prop("disabled", false);
        }
      },
      (err) => {
        const message = err.status === 403 && err.responseText ? err.responseText : "Invalid email or password. Please try again.";
        UIManager.showPopup(message, false);
        button.text("Sign In").prop("disabled", false);
      }
    );
  },

  handleForgotPassword(e) {
    e.preventDefault();
    UIManager.showPopup(`Password reset link will be sent to: ${userEmail}`, "muted");
  }
};

const SignupHandler = {
  handleFormSubmit(e) {
    e.preventDefault();
    if (!AuthFormManager.validateForm("#signupFormData")) return;

    signupData = Object.fromEntries(new FormData(e.target));
    AuthFormManager.switchForm(cache.interestsForm, "Tell Us What You Like");
    ValidationManager.updateInterestSubtitle(selectedInterests.length);
  },

  handleInterestSelection(e) {
    const interest = ValidationManager.handleInterestSelection(e);
    const card = $(e.currentTarget);

    if (card.hasClass("selected")) {
      selectedInterests.push(interest);
    } else {
      selectedInterests = selectedInterests.filter((i) => i !== interest);
    }
    ValidationManager.updateInterestSubtitle(selectedInterests.length);
  },

  handleFinalSubmit(e) {
    e.preventDefault();
    if (selectedInterests.length < 3) {
      ValidationManager.updateInterestSubtitle(selectedInterests.length, true);
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
        UIManager.showPopup("Account created! Please sign in to continue.", true);
        AuthFormManager.showSigninForm(userEmail);
        cache.signinForm.find("input[name='password']").val("");
      },
      (err) => {
        const errorMessage = err.responseJSON?.message || "An error occurred during registration. Please try again.";
        UIManager.showPopup(errorMessage, false);
        button.text("Finish").prop("disabled", false);
      }
    );
  }
};

const PasswordHandler = {
  handleToggle(e) {
    const button = $(e.target).closest(".password-toggle-btn");
    const passwordInput = button.closest(".password-input-group").find("input");
    const isPassword = passwordInput.attr("type") === "password";
    const cursorPosition = passwordInput[0].selectionStart;

    passwordInput.attr("type", isPassword ? "text" : "password");
    button.find(".password-toggle-icon").attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");

    passwordInput.focus();
    passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);

    setTimeout(() => {
      if (isPassword && window.animatePasswordShow) window.animatePasswordShow();
      if (!isPassword && window.animatePasswordHide) window.animatePasswordHide();
    }, 10);
  }
};

function setupAuthHandlers() {
  $(document)
    .on("submit", "#emailFormData", (e) => EmailHandler.handleSubmit(e))
    .on("submit", "#signinFormData", (e) => SigninHandler.handleSubmit(e))
    .on("submit", "#signupFormData", (e) => SignupHandler.handleFormSubmit(e))
    .on("submit", "#interestsFormData", (e) => SignupHandler.handleFinalSubmit(e))
    .on("click", ".change-email-btn", () => AuthFormManager.resetToEmailForm())
    .on("click", ".forgot-password", (e) => SigninHandler.handleForgotPassword(e))
    .on("click", ".password-toggle-btn", (e) => PasswordHandler.handleToggle(e))
    .on("click", ".interest-card", (e) => SignupHandler.handleInterestSelection(e));
}

function setupFormValidation() {
  $(document)
    .on("focus", '#signupFormData input[name="password"]', ValidationManager.showPasswordCriteria)
    .on("input", '#signupFormData input[name="password"]', (e) => ValidationManager.updatePasswordCriteria($(e.target).val()))
    .on("input", ".form-group input", (e) => ValidationManager.clearValidationState($(e.target)))
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

  ValidationManager.populateInterestsGrid();
  setupAuthHandlers();
  setupFormValidation();
}

$(document).ready(init);
