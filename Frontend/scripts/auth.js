$(document).ready(function () {
  setupAuthHandlers();
  setupSunAnimation();
});

function setupAuthHandlers() {
  $(document).on("submit", "#emailFormData", handleEmailSubmit);
  $(document).on("submit", "#signinFormData", handleSignin);
  $(document).on("submit", "#signupFormData", handleSignup);
  $(document).on("click", ".change-email-btn", handleChangeEmail);
  $(document).on("click", ".forgot-password", handleForgotPassword);
}

let userEmail = "";

function handleEmailSubmit(e) {
  e.preventDefault();

  const email = $(this).find("input[name='email']").val().trim();

  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }

  userEmail = email;

  // TODO: Replace this with actual API call to check if user exists
  checkUserExists(email);
}

function checkUserExists(email) {
  // Simulate API call with setTimeout
  // TODO: Replace with actual backend API call

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

  // Reset sun animation
  $(".auth-logo img").attr("src", "../sources/images/sun/sun-0.png");
}

function handleSignin(e) {
  e.preventDefault();

  const formData = {
    email: userEmail,
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign in:", formData);

  // TODO: Replace with actual authentication
  alert("Sign in successful! (This is just a demo)");
}

function handleSignup(e) {
  e.preventDefault();

  const formData = {
    email: userEmail,
    firstName: $(this).find("input[name='firstName']").val(),
    lastName: $(this).find("input[name='lastName']").val(),
    birthdate: $(this).find("input[name='birthdate']").val(),
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign up:", formData);

  // TODO: Replace with actual user creation
  alert("Account created! (This is just a demo)");
}

function handleForgotPassword(e) {
  e.preventDefault();

  // TODO: Implement forgot password functionality
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
