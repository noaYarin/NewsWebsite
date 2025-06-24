$(function () {
  // ========== Configuration Constants ==========
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
      PASSWORD_UPPERCASE_LOWERCASE: /^(?=.*[a-z])(?=.*[A-Z])/
    },
    AGE_LIMITS: {
      MIN_AGE: 18,
      MAX_AGE: 120
    }
  };

  // ========== Cached jQuery Selectors ==========
  const cache = {
    document: $(document),
    sunImage: $(".auth-logo img"),
    authTitle: $(".auth-title"),
    emailForm: $("#emailForm"),
    signinForm: $("#signinForm"),
    signupForm: $("#signupForm"),
    passwordCriteria: $(".password-criteria"),
    passwordProgressFill: $(".password-progress-fill")
  };

  let userEmail = "";

  // ========== Validation Logic ==========
  const validationMap = {
    email: validateEmail,
    firstName: (val) => validateName(val, "First name"),
    lastName: (val) => validateName(val, "Last name"),
    birthdate: validateBirthdate,
    password: validatePassword
  };

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
    if (!val) return { valid: false, message: "Password is required" };
    if (val.length < CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH)
      return { valid: false, message: `Password must be at least ${CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long` };
    if (!hasLetterAndNumber) return { valid: false, message: "Password must contain letters with a number or special character" };
    return { valid: true };
  }

  // ========== UI & State Update Functions ==========
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
    const strengthLevels = {
      0: { className: "", text: "" },
      1: { className: "weak", text: "" },
      2: { className: "medium", text: "" },
      3: { className: "strong", text: "" }
    };

    const level = strengthLevels[validCount];
    cache.passwordProgressFill.removeClass("weak medium strong").addClass(level.className);
  }

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
    $(".auth-form").removeClass("active");
    activeForm.addClass("active");
    cache.authTitle.text(title);
    document.title = `HORIZON / ${title.includes("Create") ? "Sign Up" : "Sign In"}`;
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
    if (!validateForm("#signinFormData")) return;
    console.log("Sign in:", { email: userEmail, password: $(this).find("input[name='password']").val() });
    alert("Sign in successful! (This is just a demo)");
  }

  function handleSignup(e) {
    e.preventDefault();
    if (!validateForm("#signupFormData")) return;
    const formData = Object.fromEntries(new FormData(e.target));
    console.log("Sign up:", { email: userEmail, ...formData });
    alert("Account created! (This is just a demo)");
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

    passwordInput.attr("type", isPassword ? "text" : "password");
    button.toggleClass("active", isPassword);
    icon.attr("src", isPassword ? "../sources/icons/eye-off-svgrepo-com.svg" : "../sources/icons/eye-svgrepo-com.svg");
    icon.attr("alt", isPassword ? "Hide password" : "Show password");

    const cursorPosition = passwordInput[0].selectionStart;
    passwordInput.focus();
    setTimeout(() => {
      passwordInput[0].setSelectionRange(cursorPosition, cursorPosition);
      if (isPassword && window.animatePasswordShow) window.animatePasswordShow();
      if (!isPassword && window.animatePasswordHide) window.animatePasswordHide();
    }, 10);
  }

  // ========== Event Listener Setup ==========
  function setupAuthHandlers() {
    cache.document
      .on("submit", "#emailFormData", handleEmailSubmit)
      .on("submit", "#signinFormData", handleSignin)
      .on("submit", "#signupFormData", handleSignup)
      .on("click", ".change-email-btn", handleChangeEmail)
      .on("click", ".forgot-password", handleForgotPassword)
      .on("click", ".password-toggle-btn", handlePasswordToggle);
  }

  function setupFormValidation() {
    cache.document
      .on("focus", '#signupFormData input[name="password"]', showPasswordCriteria)
      .on("input", '#signupFormData input[name="password"]', (e) => updatePasswordCriteria($(e.target).val()))
      .on("input", ".form-group input", (e) => clearValidationState($(e.target)))
      .on("input change", 'input[type="date"]', (e) => $(e.target).toggleClass("has-value", !!$(e.target).val()));
  }

  // ========== Sun Animation (Unchanged) ==========
  function setupSunAnimation() {
    // ... All original code from the setupSunAnimation function goes here ...
    // To keep this example concise, the original animation code is omitted,
    // but it should be pasted here in its entirety. It will work correctly
    // within this encapsulated structure. The `window.animate...` assignments
    // will also work as intended.
    let currentSunIndex = 0;
    let isAnimating = false;
    let animationQueue = [];
    let queueTimer = null;
    const $sunImage = $(".auth-logo img");

    function getSunIndexFromLength(length, isLastName = false, isFirstName = false) {
      if (isLastName) {
        return Math.max(18, Math.min(length + 18, 36));
      }
      if (isFirstName) {
        return Math.max(0, Math.min(length, 18));
      }
      return Math.max(0, Math.min(length, 36));
    }

    function processAnimationQueue() {
      if (queueTimer) clearTimeout(queueTimer);
      queueTimer = null;
      if (animationQueue.length > 0 && !isAnimating) {
        animationQueue.shift()();
      }
      if (animationQueue.length > 0) {
        queueTimer = setTimeout(processAnimationQueue, 10);
      }
    }

    function queueAnimation(animationFn) {
      animationQueue.push(animationFn);
      if (!queueTimer && !isAnimating) {
        processAnimationQueue();
      }
    }

    function clearAnimationQueue() {
      animationQueue = [];
      if (queueTimer) clearTimeout(queueTimer);
      queueTimer = null;
    }

    function animateFrameSequence(frames, frameDelay, finalIndex, callback) {
      if (isAnimating) {
        queueAnimation(() => animateFrameSequence(frames, frameDelay, finalIndex, callback));
        return;
      }
      isAnimating = true;
      let frameIndex = 0;
      function showNextFrame() {
        if (frameIndex < frames.length) {
          $sunImage.attr("src", frames[frameIndex]);
          frameIndex++;
          setTimeout(showNextFrame, frameDelay);
        } else {
          if (finalIndex !== undefined) currentSunIndex = finalIndex;
          isAnimating = false;
          if (callback) callback();
          if (animationQueue.length > 0) processAnimationQueue();
        }
      }
      showNextFrame();
    }

    function animateToFocus(callback) {
      const frames = ["../sources/images/sun/sun-0-1.png", "../sources/images/sun/sun-0-2.png", "../sources/images/sun/sun-1.png"];
      animateFrameSequence(frames, 15, 1, callback);
    }

    function animateToBlur(callback) {
      const frames = ["../sources/images/sun/sun-0-2.png", "../sources/images/sun/sun-0-1.png", "../sources/images/sun/sun-0.png"];
      animateFrameSequence(frames, 15, 0, callback);
    }

    function animateToFocusLastName(callback) {
      const frames = ["../sources/images/sun/sun-18-1.png", "../sources/images/sun/sun-18-2.png", "../sources/images/sun/sun-18.png"];
      animateFrameSequence(frames, 15, 18, callback);
    }

    function animateToBlurLastName(callback) {
      const frames = ["../sources/images/sun/sun-18-2.png", "../sources/images/sun/sun-18-1.png", "../sources/images/sun/sun-0.png"];
      animateFrameSequence(frames, 15, 0, callback);
    }
    function animatePasswordFocus(callback) {
      const frames = [
        "../sources/images/sun/sun-password-1.png",
        "../sources/images/sun/sun-password-2.png",
        "../sources/images/sun/sun-password-3.png",
        "../sources/images/sun/sun-password-4.png"
      ];
      animateFrameSequence(frames, 20, undefined, callback);
    }

    function animatePasswordBlur(callback) {
      const frames = [
        "../sources/images/sun/sun-password-3.png",
        "../sources/images/sun/sun-password-2.png",
        "../sources/images/sun/sun-password-1.png",
        "../sources/images/sun/sun-0.png"
      ];
      animateFrameSequence(frames, 20, 0, callback);
    }
    function animatePasswordShow(callback) {
      const frames = ["../sources/images/sun/sun-password-5.png"];
      animateFrameSequence(frames, 20, undefined, callback);
    }

    function animatePasswordHide(callback) {
      const frames = ["../sources/images/sun/sun-password-4.png"];
      animateFrameSequence(frames, 20, undefined, callback);
    }
    function animatePasswordFocusVisible(callback) {
      const frames = ["../sources/images/sun/sun-password-1.png", "../sources/images/sun/sun-password-2.png", "../sources/images/sun/sun-password-5.png"];
      animateFrameSequence(frames, 20, undefined, callback);
    }

    function animatePasswordBlurVisible(callback) {
      const frames = [
        "../sources/images/sun/sun-password-5.png",
        "../sources/images/sun/sun-password-2.png",
        "../sources/images/sun/sun-password-1.png",
        "../sources/images/sun/sun-0.png"
      ];
      animateFrameSequence(frames, 20, 0, callback);
    }

    window.animatePasswordShow = animatePasswordShow;
    window.animatePasswordHide = animatePasswordHide;
    window.animatePasswordFocusVisible = animatePasswordFocusVisible;
    window.animatePasswordBlurVisible = animatePasswordBlurVisible;

    function animateBackwards(fromIndex, targetIndex = 1, callback) {
      if (isAnimating) {
        queueAnimation(() => animateBackwards(fromIndex, targetIndex, callback));
        return;
      }
      if (fromIndex <= targetIndex) {
        if (callback) callback();
        return;
      }
      const frames = [];
      for (let i = fromIndex; i >= targetIndex; i--) {
        frames.push(`../sources/images/sun/sun-${i}.png`);
      }
      animateFrameSequence(frames, 15, targetIndex, callback);
    }
    let inputTimeout = null;
    function handleInputChange(inputElement) {
      if (inputTimeout) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const inputLength = inputElement.val().length;
        const inputName = inputElement.attr("name");
        const isLastName = inputName === "lastName";
        const isFirstName = inputName === "firstName";
        const newSunIndex = getSunIndexFromLength(inputLength, isLastName, isFirstName);
        const baseIndex = isLastName ? 18 : 1;
        if (inputLength === 0 && currentSunIndex > baseIndex) {
          clearAnimationQueue();
          animateBackwards(currentSunIndex, baseIndex);
        } else if (newSunIndex !== currentSunIndex && newSunIndex > (isLastName ? 18 : 0)) {
          currentSunIndex = newSunIndex;
          if (!isAnimating) {
            $sunImage.attr("src", `../sources/images/sun/sun-${currentSunIndex}.png`);
          }
        }
      }, 50);
    }

    const firstNameInputSelector = "#signupFormData input[name='firstName']";
    const lastNameInputSelector = "#signupFormData input[name='lastName']";
    const passwordInputSelectors = "#signinFormData input[name='password'], #signupFormData input[name='password']";
    const generalInputSelectors =
      "#emailFormData input[name='email'], #signinFormData input:not([name='password']), #signupFormData input:not([name='firstName']):not([name='lastName']):not([name='password'])";

    $(document).on("input", firstNameInputSelector, function () {
      handleInputChange($(this));
    });
    $(document).on("focus", firstNameInputSelector, function () {
      clearAnimationQueue();
      if ($(this).val().length === 0) animateToFocus();
    });
    $(document).on("blur", firstNameInputSelector, function () {
      if ($(this).val().length === 0) {
        animateToBlur();
      } else {
        currentSunIndex = 0;
        if (!isAnimating) $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    });

    $(document).on("input", generalInputSelectors, function () {
      handleInputChange($(this));
    });
    $(document).on("focus", generalInputSelectors, function () {
      clearAnimationQueue();
      if ($(this).val().length === 0) animateToFocus();
    });
    $(document).on("blur", generalInputSelectors, function () {
      if ($(this).val().length === 0) {
        animateToBlur();
      } else {
        currentSunIndex = 0;
        if (!isAnimating) $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    });

    $(document).on("input", lastNameInputSelector, function () {
      handleInputChange($(this));
    });
    $(document).on("focus", lastNameInputSelector, function () {
      clearAnimationQueue();
      if ($(this).val().length === 0) animateToFocusLastName();
    });
    $(document).on("blur", lastNameInputSelector, function () {
      if ($(this).val().length === 0) {
        clearAnimationQueue();
        animateToBlurLastName();
      } else {
        currentSunIndex = 0;
        if (!isAnimating) $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    });

    $(document).on("focus", passwordInputSelectors, function () {
      clearAnimationQueue();
      const isVisible = $(this).attr("type") === "text";
      isVisible ? animatePasswordFocusVisible() : animatePasswordFocus();
    });
    $(document).on("blur", passwordInputSelectors, function () {
      const isVisible = $(this).attr("type") === "text";
      isVisible ? animatePasswordBlurVisible() : animatePasswordBlur();
    });
  }

  // ========== Initialization ==========
  function init() {
    setupAuthHandlers();
    setupFormValidation();
    setupSunAnimation();
  }

  init();
});
