function setupSunAnimation() {
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

  // Assign functions to the global window object so they can be called from other scripts if needed
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

  // Define selectors for event listeners
  const firstNameInputSelector = "#signupFormData input[name='firstName']";
  const lastNameInputSelector = "#signupFormData input[name='lastName']";
  const passwordInputSelectors = "#signinFormData input[name='password'], #signupFormData input[name='password']";
  const generalInputSelectors =
    "#emailFormData input[name='email'], #signinFormData input:not([name='password']), #signupFormData input:not([name='firstName']):not([name='lastName']):not([name='password'])";

  // Attach all event listeners
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

$(document).ready(function () {
  setupSunAnimation();
});
