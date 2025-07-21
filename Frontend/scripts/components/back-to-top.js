const BackToTop = {
  init() {
    this.setupScrollHandler();
    this.setupClickHandler();
  },

  setupScrollHandler() {
    const $backToTop = $("#backToTop");
    const $footer = $("#footer");
    if (!$backToTop.length) return;

    $(window).on("scroll", () => {
      const scrollTop = $(window).scrollTop();
      const windowHeight = $(window).height();

      if (scrollTop > CONSTANTS.SCROLL_THRESHOLD) {
        $backToTop.addClass("visible");
      } else {
        $backToTop.removeClass("visible");
      }

      if ($footer.length) {
        const footerTop = $footer.offset().top;
        const buttonBottom = scrollTop + windowHeight - 30;
        const footerOverlap = buttonBottom + 20 - footerTop;

        if (footerOverlap > 0) {
          $backToTop.css({
            bottom: 30 + footerOverlap + "px",
            transition: "bottom var(--transition-fast), opacity var(--transition-fast), visibility var(--transition-fast), transform var(--transition-fast)"
          });
        } else {
          $backToTop.css({
            bottom: "30px",
            transition: "all var(--transition-fast)"
          });
        }
      }
    });
  },

  setupClickHandler() {
    $("#backToTop").on("click", () => {
      $("html, body").scrollTop(0);
    });
  }
};

window.BackToTop = BackToTop;
