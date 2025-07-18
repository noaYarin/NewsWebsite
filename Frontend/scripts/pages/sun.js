/**
 * Initializes the entire sun animation system.
 * This function sets up the state variables (like the current animation frame),
 * defines all the helper functions for queuing and playing animations,
 * and attaches the necessary event listeners to the input fields to trigger the animations.
 */
function setupSunAnimation() {
  let currentSunIndex = 0;
  let isAnimating = false;
  let animationQueue = [];
  let queueTimer = null;
  const $sunImage = $(".auth-logo img");

  /**
   * Calculates the corresponding sun image index based on the length of the input text.
   * Has special logic for the first name and last name fields to map them to different animation ranges.
   * @param {number} length - The character length of the input field's value.
   * @param {boolean} [isLastName=false] - True if the input is the last name field.
   * @param {boolean} [isFirstName=false] - True if the input is the first name field.
   * @returns {number} The calculated index for the sun image (e.g., 0-36).
   */
  function getSunIndexFromLength(length, isLastName = false, isFirstName = false) {
    if (isLastName) {
      // For last name, map input length to the second half of the animation (frames 18-36)
      return Math.max(18, Math.min(length + 18, 36));
    }
    if (isFirstName) {
      // For first name, map input length to the first half of the animation (frames 0-18)
      return Math.max(0, Math.min(length, 18));
    }
    // For all other inputs, map to the full range
    return Math.max(0, Math.min(length, 36));
  }

  /**
   * Processes the queue of pending animations, ensuring they run one after another.
   * This function is called recursively with a short delay to keep checking the queue
   * until it's empty, but it only starts a new animation if one is not already running.
   */
  function processAnimationQueue() {
    if (queueTimer) clearTimeout(queueTimer);
    queueTimer = null;
    if (animationQueue.length > 0 && !isAnimating) {
      // Dequeue and execute the next animation function
      animationQueue.shift()();
    }
    // Continue processing if the queue still has items
    if (animationQueue.length > 0) {
      queueTimer = setTimeout(processAnimationQueue, 10);
    }
  }

  /**
   * Adds an animation function to the queue to be executed later.
   * This is used when an animation is triggered while another one is already playing.
   * @param {function} animationFn - The function that should be queued.
   */
  function queueAnimation(animationFn) {
    animationQueue.push(animationFn);
    // If nothing is animating and the queue isn't being processed, start it.
    if (!queueTimer && !isAnimating) {
      processAnimationQueue();
    }
  }

  /**
   * Clears all pending animations from the queue.
   * This is useful when the user's action (like focusing a new field)
   * should override any previously queued animations.
   */
  function clearAnimationQueue() {
    animationQueue = [];
    if (queueTimer) clearTimeout(queueTimer);
    queueTimer = null;
  }

  /**
   * The core animation engine. It plays a sequence of image frames.
   * It sets an isAnimating flag to prevent conflicts and manages the animation loop.
   * After completing, it processes the next item in the animation queue.
   * @param {string[]} frames - An array of image source paths to be displayed in sequence.
   * @param {number} frameDelay - The delay in milliseconds between each frame.
   * @param {number} [finalIndex] - An optional index to set as the `currentSunIndex` after the animation completes.
   * @param {function} [callback] - An optional function to call after the animation finishes.
   */
  function animateFrameSequence(frames, frameDelay, finalIndex, callback) {
    // If an animation is already running, queue this one instead of starting it.
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
        if (finalIndex !== undefined) currentSunIndex = finalIndex;
        isAnimating = false;
        if (callback) callback();
        // Check the queue for any pending animations
        if (animationQueue.length > 0) processAnimationQueue();
      }
    }
    showNextFrame();
  }

  /** Plays the animation for when a general input field gains focus. */
  function animateToFocus(callback) {
    const frames = ["../sources/images/sun/sun-0-1.png", "../sources/images/sun/sun-0-2.png", "../sources/images/sun/sun-1.png"];
    animateFrameSequence(frames, 15, 1, callback);
  }

  /** Plays the animation for when a general input field loses focus and is empty. */
  function animateToBlur(callback) {
    const frames = ["../sources/images/sun/sun-0-2.png", "../sources/images/sun/sun-0-1.png", "../sources/images/sun/sun-0.png"];
    animateFrameSequence(frames, 15, 0, callback);
  }

  /** Plays the animation for when the 'Last Name' input field gains focus. */
  function animateToFocusLastName(callback) {
    const frames = ["../sources/images/sun/sun-18-1.png", "../sources/images/sun/sun-18-2.png", "../sources/images/sun/sun-18.png"];
    animateFrameSequence(frames, 15, 18, callback);
  }

  /** Plays the animation for when the 'Last Name' input field loses focus and is empty. */
  function animateToBlurLastName(callback) {
    const frames = ["../sources/images/sun/sun-18-2.png", "../sources/images/sun/sun-18-1.png", "../sources/images/sun/sun-0.png"];
    animateFrameSequence(frames, 15, 0, callback);
  }

  /** Plays the animation for when the password field (hidden) gains focus. */
  function animatePasswordFocus(callback) {
    const frames = [
      "../sources/images/sun/sun-password-1.png",
      "../sources/images/sun/sun-password-2.png",
      "../sources/images/sun/sun-password-3.png",
      "../sources/images/sun/sun-password-4.png"
    ];
    animateFrameSequence(frames, 20, undefined, callback);
  }

  /** Plays the animation for when the password field (hidden) loses focus. */
  function animatePasswordBlur(callback) {
    const frames = [
      "../sources/images/sun/sun-password-3.png",
      "../sources/images/sun/sun-password-2.png",
      "../sources/images/sun/sun-password-1.png",
      "../sources/images/sun/sun-0.png"
    ];
    animateFrameSequence(frames, 20, 0, callback);
  }

  /** Plays the animation for when the password is toggled to be visible. */
  function animatePasswordShow(callback) {
    const frames = ["../sources/images/sun/sun-password-5.png"];
    animateFrameSequence(frames, 20, undefined, callback);
  }

  /** Plays the animation for when the password is toggled to be hidden. */
  function animatePasswordHide(callback) {
    const frames = ["../sources/images/sun/sun-password-4.png"];
    animateFrameSequence(frames, 20, undefined, callback);
  }

  /** Plays the animation for when the password field (visible) gains focus. */
  function animatePasswordFocusVisible(callback) {
    const frames = ["../sources/images/sun/sun-password-1.png", "../sources/images/sun/sun-password-2.png", "../sources/images/sun/sun-password-5.png"];
    animateFrameSequence(frames, 20, undefined, callback);
  }

  /** Plays the animation for when the password field (visible) loses focus. */
  function animatePasswordBlurVisible(callback) {
    const frames = [
      "../sources/images/sun/sun-password-5.png",
      "../sources/images/sun/sun-password-2.png",
      "../sources/images/sun/sun-password-1.png",
      "../sources/images/sun/sun-0.png"
    ];
    animateFrameSequence(frames, 20, 0, callback);
  }

  // Assign functions to the global window object so they can be called from auth.js
  window.animatePasswordShow = animatePasswordShow;
  window.animatePasswordHide = animatePasswordHide;
  window.animatePasswordFocusVisible = animatePasswordFocusVisible;
  window.animatePasswordBlurVisible = animatePasswordBlurVisible;

  /**
   * Creates and plays a 'rewind' animation from a given frame back to a target frame.
   * This is used when the user deletes text from an input field.
   * @param {number} fromIndex - The animation frame index to start from.
   * @param {number} [targetIndex=1] - The frame index to animate back to.
   * @param {function} [callback] - An optional function to call after the animation finishes.
   */
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

  /**
   * Handles the 'input' event for text fields with a debounce.
   * It calculates the new sun index based on text length and updates the image directly,
   * but only if no other animation is currently playing.
   * @param {jQuery} inputElement - The jQuery object representing the input field that triggered the event.
   */
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
        // Only update the image directly if no animation is playing to avoid stuttering
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
