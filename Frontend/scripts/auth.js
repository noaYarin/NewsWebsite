$(document).ready(function () {
  setupAuthHandlers();
  setupSunAnimation();

  const mode = window.location.hash.replace("#", "");
  if (mode === "signup" || mode === "signin") {
    switchForm(mode);
  }
});

function setupAuthHandlers() {
  $(document).on("click", ".form-switch", function () {
    const target = $(this).data("target");
    switchForm(target);
  });

  $(document).on("submit", "#signinFormData", handleSignin);
  $(document).on("submit", "#signupFormData", handleSignup);
}

function setupSunAnimation() {
  let currentSunIndex = 0;
  let isAnimating = false;
  let animationQueue = [];
  let queueTimer = null;
  const $sunImage = $(".auth-logo img");

  function getSunIndexFromLength(length) {
    if (length === 0) return 0; // empty = sun-0
    if (length >= 36) return 36; // 36+ chars = sun-36 (max)
    return length; // 1-35 chars = sun-1 to sun-35
  }

  function processAnimationQueue() {
    if (animationQueue.length > 0 && !isAnimating) {
      const nextAnimation = animationQueue.shift();
      nextAnimation();
    }

    // Continue processing queue if there are more animations
    if (animationQueue.length > 0) {
      queueTimer = setTimeout(processAnimationQueue, 10);
    } else {
      queueTimer = null;
    }
  }

  function queueAnimation(animationFn) {
    animationQueue.push(animationFn);

    // Start processing queue if not already running
    if (!queueTimer && !isAnimating) {
      queueTimer = setTimeout(processAnimationQueue, 10);
    }
  }

  function clearAnimationQueue() {
    animationQueue = [];
    if (queueTimer) {
      clearTimeout(queueTimer);
      queueTimer = null;
    }
  }

  function animateToFocus(callback) {
    if (isAnimating) {
      queueAnimation(() => animateToFocus(callback));
      return;
    }
    isAnimating = true;

    // Animation: 0 → 0-1 → 0-2 → 1
    setTimeout(() => {
      $sunImage.attr("src", "../sources/images/sun/sun-0-1.png");
      setTimeout(() => {
        $sunImage.attr("src", "../sources/images/sun/sun-0-2.png");
        setTimeout(() => {
          currentSunIndex = 1;
          $sunImage.attr("src", "../sources/images/sun/sun-1.png");
          isAnimating = false;
          if (callback) callback();

          // Process next animation in queue
          if (animationQueue.length > 0 && !queueTimer) {
            queueTimer = setTimeout(processAnimationQueue, 10);
          }
        }, 15);
      }, 15);
    }, 15);
  }

  function animateToBlur(callback) {
    if (isAnimating) {
      queueAnimation(() => animateToBlur(callback));
      return;
    }
    isAnimating = true;

    // Animation: current → 0-2 → 0-1 → 0
    setTimeout(() => {
      $sunImage.attr("src", "../sources/images/sun/sun-0-2.png");
      setTimeout(() => {
        $sunImage.attr("src", "../sources/images/sun/sun-0-1.png");
        setTimeout(() => {
          currentSunIndex = 0;
          $sunImage.attr("src", "../sources/images/sun/sun-0.png");
          isAnimating = false;
          if (callback) callback();

          // Process next animation in queue
          if (animationQueue.length > 0 && !queueTimer) {
            queueTimer = setTimeout(processAnimationQueue, 10);
          }
        }, 15);
      }, 15);
    }, 15);
  }

  function animatePasswordFocus(callback) {
    if (isAnimating) {
      queueAnimation(() => animatePasswordFocus(callback));
      return;
    }
    isAnimating = true;

    // Password focus animation: 0 → 1 → 2 → 3 → 4
    setTimeout(() => {
      $sunImage.attr("src", "../sources/images/sun/sun-password-1.png");
      setTimeout(() => {
        $sunImage.attr("src", "../sources/images/sun/sun-password-2.png");
        setTimeout(() => {
          $sunImage.attr("src", "../sources/images/sun/sun-password-3.png");
          setTimeout(() => {
            $sunImage.attr("src", "../sources/images/sun/sun-password-4.png");
            isAnimating = false;
            if (callback) callback();

            // Process next animation in queue
            if (animationQueue.length > 0 && !queueTimer) {
              queueTimer = setTimeout(processAnimationQueue, 10);
            }
          }, 20);
        }, 20);
      }, 20);
    }, 20);
  }

  function animatePasswordBlur(callback) {
    if (isAnimating) {
      queueAnimation(() => animatePasswordBlur(callback));
      return;
    }
    isAnimating = true;

    // Password blur animation: 4 → 3 → 2 → 1 → 0
    setTimeout(() => {
      $sunImage.attr("src", "../sources/images/sun/sun-password-3.png");
      setTimeout(() => {
        $sunImage.attr("src", "../sources/images/sun/sun-password-2.png");
        setTimeout(() => {
          $sunImage.attr("src", "../sources/images/sun/sun-password-1.png");
          setTimeout(() => {
            currentSunIndex = 0;
            $sunImage.attr("src", "../sources/images/sun/sun-0.png");
            isAnimating = false;
            if (callback) callback();

            // Process next animation in queue
            if (animationQueue.length > 0 && !queueTimer) {
              queueTimer = setTimeout(processAnimationQueue, 10);
            }
          }, 20);
        }, 20);
      }, 20);
    }, 20);
  }

  function animateBackwards(fromIndex, callback) {
    if (isAnimating) {
      queueAnimation(() => animateBackwards(fromIndex, callback));
      return;
    }

    if (fromIndex <= 1) {
      if (callback) callback();
      return;
    }

    isAnimating = true;
    let frame = fromIndex;

    function nextFrame() {
      frame--;
      currentSunIndex = frame;
      $sunImage.attr("src", `../sources/images/sun/sun-${frame}.png`);

      if (frame <= 1) {
        isAnimating = false;
        if (callback) callback();

        // Process next animation in queue
        if (animationQueue.length > 0 && !queueTimer) {
          queueTimer = setTimeout(processAnimationQueue, 10);
        }
      } else {
        setTimeout(nextFrame, 15);
      }
    }

    nextFrame();
  }

  // Listen for typing in all input fields except password
  $(document).on("input", "#signinFormData input:not([name='password']), #signupFormData input:not([name='password'])", function () {
    const inputLength = $(this).val().length;
    const newSunIndex = getSunIndexFromLength(inputLength);

    // Check if user cleared everything (from some text to empty)
    if (inputLength === 0 && currentSunIndex > 0) {
      // Clear password animations and animate backwards
      clearAnimationQueue();
      animateBackwards(currentSunIndex);
    } else if (newSunIndex !== currentSunIndex) {
      // Update sun index directly while typing (no animation for responsiveness)
      currentSunIndex = newSunIndex;
      if (!isAnimating) {
        $sunImage.attr("src", `../sources/images/sun/sun-${currentSunIndex}.png`);
      }
    }
  });

  // Handle focus - animate to sun-1 when focusing on non-password inputs
  $(document).on("focus", "#signinFormData input:not([name='password']), #signupFormData input:not([name='password'])", function () {
    clearAnimationQueue(); // Clear password animations

    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToFocus();
    }
  });

  // Handle blur - animate back to sun-0 if empty for non-password inputs
  $(document).on("blur", "#signinFormData input:not([name='password']), #signupFormData input:not([name='password'])", function () {
    const inputLength = $(this).val().length;
    if (inputLength === 0) {
      animateToBlur();
    } else {
      // Direct change without animation for speed
      currentSunIndex = 0;
      if (!isAnimating) {
        $sunImage.attr("src", "../sources/images/sun/sun-0.png");
      }
    }
  });

  // Handle focus on password fields
  $(document).on("focus", "#signinFormData input[name='password'], #signupFormData input[name='password']", function () {
    clearAnimationQueue(); // Clear other animations
    animatePasswordFocus();
  });

  // Handle blur on password fields
  $(document).on("blur", "#signinFormData input[name='password'], #signupFormData input[name='password']", function () {
    animatePasswordBlur();
  });
}

function switchForm(target) {
  $(".auth-form").removeClass("active");

  if (target === "signup") {
    $("#signupForm").addClass("active");
    document.title = "HORIZON / Sign Up";
    $(".signin-title").hide();
    $(".signup-title").show();
  } else {
    $("#signinForm").addClass("active");
    document.title = "HORIZON / Sign In";
    $(".signup-title").hide();
    $(".signin-title").show();
  }

  $(".auth-form form")[0].reset();
  $(".auth-form form")[1].reset();
  $(".auth-logo img").attr("src", "../sources/images/sun/sun-0.png");
}

function handleSignin(e) {
  e.preventDefault();

  const formData = {
    email: $(this).find("input[name='email']").val(),
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign in:", formData);
  alert("Sign in successful! (This is just a demo)");
}

function handleSignup(e) {
  e.preventDefault();

  const formData = {
    name: $(this).find("input[name='name']").val(),
    email: $(this).find("input[name='email']").val(),
    password: $(this).find("input[name='password']").val()
  };

  console.log("Sign up:", formData);
  alert("Account created! (This is just a demo)");
}
