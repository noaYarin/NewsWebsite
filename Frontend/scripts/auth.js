const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  TOTAL_REQUIREMENTS: 3
};

const VALIDATION_REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  NAME: /^[a-zA-Z\s'-]{2,30}$/,
  PASSWORD_LETTER_AND_NUMBER: /^(?=.*[a-zA-Z])(?=.*\d)/,
  PASSWORD_LETTER_AND_SPECIAL: /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
  PASSWORD_UPPERCASE_LOWERCASE: /^(?=.*[a-z])(?=.*[A-Z])/
};

const AGE_LIMITS = {
  MIN_AGE: 18,
  MAX_AGE: 120
};

$(document).ready(function () {
  setupAuthHandlers();
  setupSunAnimation();
  setupFormValidation();
});

function setupAuthHandlers() {
  $(document).on("submit", "#emailFormData", handleEmailSubmit);
  $(document).on("submit", "#signinFormData", handleSignin);
  $(document).on("submit", "#signupFormData", handleSignup);
  $(document).on("click", ".change-email-btn", handleChangeEmail);
  $(document).on("click", ".forgot-password", handleForgotPassword);
}

// ========== Form Validation Setup ==========
function setupFormValidation() {
  $(document).on("focus", '#signupFormData input[name="password"]', function () {
    showPasswordCriteria();
  });

  $(document).on("input", '#signupFormData input[name="password"]', function () {
    updatePasswordCriteria($(this).val());
  });

  $(document).on("input", ".form-group input", function () {
    clearValidationState($(this));
  });

  // I kid you not, I tried 50 other things to get this to work, this is the only thing that is remotely reliable.
  $(document).on("input change", 'input[type="date"]', function () {
    if ($(this).val()) {
      $(this).addClass("has-value");
    } else {
      $(this).removeClass("has-value");
    }
  });
}

// ========== Validation Functions ==========
function validateEmail(email) {
  if (!email) {
    return { valid: false, message: "Email is required" };
  } else if (!VALIDATION_REGEX.EMAIL.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  return { valid: true };
}

function validateName(name, fieldName) {
  if (!name) {
    return { valid: false, message: `${fieldName} is required` };
  } else if (!VALIDATION_REGEX.NAME.test(name)) {
    return { valid: false, message: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes (2-30 characters)` };
  }
  return { valid: true };
}

function validateBirthdate(birthdate) {
  if (!birthdate) {
    return { valid: false, message: "Birthdate is required" };
  }

  const today = new Date();
  const selectedDate = new Date(birthdate);
  let age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
    age--;
  }

  if (selectedDate > today) {
    return { valid: false, message: "Birthdate cannot be in the future" };
  } else if (age < AGE_LIMITS.MIN_AGE) {
    return { valid: false, message: `You must be at least ${AGE_LIMITS.MIN_AGE} years old to create an account` };
  } else if (age > AGE_LIMITS.MAX_AGE) {
    return { valid: false, message: "Please enter a valid birthdate" };
  }
  return { valid: true };
}

function validatePassword(password) {
  const hasLetterAndNumber = VALIDATION_REGEX.PASSWORD_LETTER_AND_NUMBER.test(password) || VALIDATION_REGEX.PASSWORD_LETTER_AND_SPECIAL.test(password);

  if (!password) {
    return { valid: false, message: "Password is required" };
  } else if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long` };
  } else if (!hasLetterAndNumber) {
    return { valid: false, message: "Password must contain letters with at least one number or special character" };
  }
  return { valid: true };
}

function showPasswordCriteria() {
  $(".password-criteria").addClass("show");
  updateFooterPosition();
}

function resetPasswordCriteria() {
  $(".password-criteria").removeClass("show");
  $(".password-progress-fill").removeClass("weak medium strong");
  $(".password-progress-text").removeClass("weak medium strong").text(`0 of ${PASSWORD_REQUIREMENTS.TOTAL_REQUIREMENTS} requirements met`);
}

function updatePasswordCriteria(password) {
  const lengthReq = $('.password-requirement[data-requirement="length"]');
  const alphanumericReq = $('.password-requirement[data-requirement="alphanumeric"]');
  const caseReq = $('.password-requirement[data-requirement="case"]');

  let validCount = 0;

  if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    lengthReq.removeClass("invalid").addClass("valid");
    validCount++;
  } else {
    lengthReq.removeClass("valid").addClass("invalid");
  }

  const hasLetterAndNumber = VALIDATION_REGEX.PASSWORD_LETTER_AND_NUMBER.test(password) || VALIDATION_REGEX.PASSWORD_LETTER_AND_SPECIAL.test(password);
  if (hasLetterAndNumber) {
    alphanumericReq.removeClass("invalid").addClass("valid");
    validCount++;
  } else {
    alphanumericReq.removeClass("valid").addClass("invalid");
  }

  if (VALIDATION_REGEX.PASSWORD_UPPERCASE_LOWERCASE.test(password)) {
    caseReq.removeClass("invalid").addClass("valid");
    validCount++;
  } else {
    caseReq.removeClass("valid").addClass("invalid");
  }

  updatePasswordProgress(validCount);
}

function updatePasswordProgress(validCount) {
  const progressFill = $(".password-progress-fill");
  const progressText = $(".password-progress-text");

  progressFill.removeClass("weak medium strong");
  progressText.removeClass("weak medium strong");

  if (validCount === 0) {
    progressText.text(`0 of ${PASSWORD_REQUIREMENTS.TOTAL_REQUIREMENTS} requirements met`);
  } else if (validCount === 1) {
    progressFill.addClass("weak");
    progressText.addClass("weak").text(`1 of ${PASSWORD_REQUIREMENTS.TOTAL_REQUIREMENTS} requirements met - Weak`);
  } else if (validCount === 2) {
    progressFill.addClass("medium");
    progressText.addClass("medium").text(`2 of ${PASSWORD_REQUIREMENTS.TOTAL_REQUIREMENTS} requirements met - Medium`);
  } else if (validCount === PASSWORD_REQUIREMENTS.TOTAL_REQUIREMENTS) {
    progressFill.addClass("strong");
    progressText.addClass("strong").text("All requirements met - Strong");
  }
}

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.find(".error-message");

  input.addClass("input-error");
  errorMessage.text(message).show();
}

function clearValidationState(input) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.find(".error-message");

  input.removeClass("input-error");
  errorMessage.hide();
}

function validateForm(formId) {
  let isValid = true;
  const form = $(formId);
  updateFooterPosition();

  form.find(".input-error").removeClass("input-error");
  form.find(".error-message").hide();

  form.find("input").each(function () {
    const input = $(this);
    const inputName = input.attr("name");
    const value = input.val().trim();
    let validation = { valid: true };

    switch (inputName) {
      case "email":
        validation = validateEmail(value);
        break;
      case "firstName":
        validation = validateName(value, "First name");
        break;
      case "lastName":
        validation = validateName(value, "Last name");
        break;
      case "birthdate":
        validation = validateBirthdate(value);
        break;
      case "password":
        validation = validatePassword(value);
        break;
    }

    if (!validation.valid) {
      showError(input, validation.message);
      isValid = false;
    }
  });

  if (!isValid) {
    const firstError = form.find(".input-error").first();
    if (firstError.length) {
      firstError.focus();
    }
  }

  return isValid;
}

let userEmail = "";

function handleEmailSubmit(e) {
  e.preventDefault();

  if (!validateForm("#emailFormData")) {
    return;
  }

  const email = $(this).find("input[name='email']").val().trim();
  userEmail = email;

  checkUserExists(email);
}

// TODO: Replace this with your actual API call to check if the user exists
function checkUserExists(email) {
  console.log("Checking if user exists:", email);

  // Simulate loading state
  $(".auth-button").text("Checking...").prop("disabled", true);

  setTimeout(() => {
    // Reset button
    $(".auth-button").text("Continue").prop("disabled", false);

    // Simulate response - replace this logic with your actual API response
    const userExists = Math.random() > 0.5; // Random for demo

    if (userExists) {
      showSigninForm(email);
    } else {
      showSignupForm(email);
    }
  }, 1000);
}

function showSigninForm(email) {
  $(".auth-title").text("Welcome back!");
  $(".email-text").text(email);

  $(".auth-form").removeClass("active");
  $("#signinForm").addClass("active");

  document.title = "HORIZON / Sign In";

  setTimeout(() => {
    $("#signinForm input[name='password']").focus();
  }, 100);
}

function showSignupForm(email) {
  $(".auth-title").text("Create Your Account");
  $(".email-text").text(email);

  $(".auth-form").removeClass("active");
  $("#signupForm").addClass("active");

  document.title = "HORIZON / Sign Up";

  setTimeout(() => {
    $("#signupForm input[name='firstName']").focus();
  }, 100);
}

function handleChangeEmail() {
  $(".auth-title").text("Welcome to Horizon");
  $(".auth-form").removeClass("active");
  $("#emailForm").addClass("active");

  $("#emailForm input[name='email']").val("").focus();

  document.title = "HORIZON / Sign In";

  resetPasswordCriteria();

  // Reset sun animation
  $(".auth-logo img").attr("src", "../sources/images/sun/sun-0.png");
}

function handleSignin(e) {
  e.preventDefault();

  if (!validateForm("#signinFormData")) {
    return;
  }

  const formData = {
    email: userEmail,
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign in:", formData);
  alert("Sign in successful! (This is just a demo)");
}

// TODO: Replace this with your actual API call to handle signup
function handleSignup(e) {
  e.preventDefault();

  if (!validateForm("#signupFormData")) {
    return;
  }

  const formData = {
    email: userEmail,
    firstName: $(this).find("input[name='firstName']").val(),
    lastName: $(this).find("input[name='lastName']").val(),
    birthdate: $(this).find("input[name='birthdate']").val(),
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign up:", formData);
  alert("Account created! (This is just a demo)");
}

// TODO: Replace this with your actual API call to handle forgot password
function handleForgotPassword(e) {
  e.preventDefault();
  alert(`Password reset link will be sent to: ${userEmail}`);
}

// ========== Sun Animation Setup ==========
function setupSunAnimation() {
  let currentSunIndex = 0;
  let isAnimating = false;
  let animationQueue = [];
  let queueTimer = null;
  const $sunImage = $(".auth-logo img");

  function getSunIndexFromLength(length, isLastName = false, isFirstName = false) {
    if (isLastName) {
      // For last name: map [0, 18] to [18, 36]
      return Math.max(18, Math.min(length + 18, 36));
    }
    if (isFirstName) {
      // For first name: map [0, 18] to [0, 18]
      return Math.max(0, Math.min(length, 18));
    }
    // For other fields: map [0, 36] to [0, 36]
    return Math.max(0, Math.min(length, 36));
  }

  function processAnimationQueue() {
    if (queueTimer) {
      clearTimeout(queueTimer);
      queueTimer = null;
    }

    if (animationQueue.length > 0 && !isAnimating) {
      const nextAnimation = animationQueue.shift();
      nextAnimation();
    }

    // Continue processing if queue has items
    if (animationQueue.length > 0) {
      queueTimer = setTimeout(processAnimationQueue, 10);
    }
  }

  function queueAnimation(animationFn) {
    animationQueue.push(animationFn);

    // Start processing if not already running
    if (!queueTimer && !isAnimating) {
      processAnimationQueue();
    }
  }

  function clearAnimationQueue() {
    animationQueue = [];
    if (queueTimer) {
      clearTimeout(queueTimer);
      queueTimer = null;
    }
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
        // Animation complete
        if (finalIndex !== undefined) {
          currentSunIndex = finalIndex;
        }
        isAnimating = false;

        if (callback) callback();

        // Process any queued animations
        if (animationQueue.length > 0) {
          processAnimationQueue();
        }
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

  function animateBackwards(fromIndex, targetIndex = 1, callback) {
    if (isAnimating) {
      queueAnimation(() => animateBackwards(fromIndex, targetIndex, callback));
      return;
    }

    if (fromIndex <= targetIndex) {
      if (callback) callback();
      return;
    }

    // Build frames array for backward animation
    const frames = [];
    for (let i = fromIndex; i >= targetIndex; i--) {
      frames.push(`../sources/images/sun/sun-${i}.png`);
    }

    animateFrameSequence(frames, 15, targetIndex, callback);
  }

  // Enhanced input handler with last name and first name detection
  let inputTimeout = null;
  function handleInputChange(inputElement) {
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }

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
  // Define input selectors for different behaviors
  const firstNameInputSelector = "#signupFormData input[name='firstName']";
  const lastNameInputSelector = "#signupFormData input[name='lastName']";
  const passwordInputSelectors = ["#signinFormData input[name='password']", "#signupFormData input[name='password']"].join(", ");

  // All other inputs (email, birthdate, etc.) - exclude password, firstName, and lastName
  const generalInputSelectors = [
    "#emailFormData input[name='email']",
    "#signinFormData input:not([name='password'])",
    "#signupFormData input:not([name='firstName']):not([name='lastName']):not([name='password'])"
  ].join(", ");

  // First name input events (limited to 18)
  $(document).on("input", firstNameInputSelector, function () {
    handleInputChange($(this));
  });

  $(document).on("focus", firstNameInputSelector, function () {
    clearAnimationQueue();
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToFocus();
    }
  });

  $(document).on("blur", firstNameInputSelector, function () {
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToBlur();
    } else {
      currentSunIndex = 0;
      if (!isAnimating) {
        $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    }
  });

  // General input events (email, birthdate, etc. - unlimited up to 36)
  $(document).on("input", generalInputSelectors, function () {
    handleInputChange($(this));
  });

  $(document).on("focus", generalInputSelectors, function () {
    clearAnimationQueue();
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToFocus();
    }
  });

  $(document).on("blur", generalInputSelectors, function () {
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToBlur();
    } else {
      currentSunIndex = 0;
      if (!isAnimating) {
        $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    }
  });

  // Last name input events (modified behavior)
  $(document).on("input", lastNameInputSelector, function () {
    handleInputChange($(this));
  });

  $(document).on("focus", lastNameInputSelector, function () {
    clearAnimationQueue();
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToFocusLastName();
    }
  });

  $(document).on("blur", lastNameInputSelector, function () {
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      clearAnimationQueue(); // Prevents animation conflicts
      animateToBlurLastName();
    } else {
      currentSunIndex = 0;
      if (!isAnimating) {
        $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    }
  });

  // Password field events (unchanged)
  $(document).on("focus", passwordInputSelectors, function () {
    clearAnimationQueue();
    animatePasswordFocus();
  });

  $(document).on("blur", passwordInputSelectors, function () {
    animatePasswordBlur();
  });
}
