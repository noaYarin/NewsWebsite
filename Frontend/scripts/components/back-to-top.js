class BackToTop {
  static lastScrollTop = 0;
  static isVisible = false;

  static init() {
    this.$backToTop = $("#backToTop");
    this.$footer = $("#footer");
    this.$window = $(window);
    this.$htmlBody = $("html, body");

    if (!this.$backToTop.length) {
      return;
    }

    this.$window.on(
      "scroll",
      Utils.throttleAnimationFrame(() => this.handleScroll())
    );
    this.setupClickHandler();
  }

  static handleScroll() {
    const scrollTop = this.$window.scrollTop();
    const windowHeight = this.$window.height();

    this.updateVisibility(scrollTop);
    if (this.$footer.length) {
      this.updatePositionForFooter(scrollTop, windowHeight);
    }

    this.lastScrollTop = scrollTop;
  }

  static updateVisibility(scrollTop) {
    const shouldBeVisible = scrollTop > CONSTANTS.SCROLL_THRESHOLD;

    if (shouldBeVisible !== this.isVisible) {
      this.isVisible = shouldBeVisible;
      this.$backToTop.toggleClass("visible", shouldBeVisible);
    }
  }

  static updatePositionForFooter(scrollTop, windowHeight) {
    const footerTop = this.$footer.offset().top;
    const buttonBottom = scrollTop + windowHeight - 30;
    const footerOverlap = buttonBottom + 20 - footerTop;

    if (footerOverlap > 0) {
      const newBottom = 30 + footerOverlap;
      this.setButtonPosition(newBottom);
    } else {
      this.setButtonPosition(30);
    }
  }

  static setButtonPosition(bottom) {
    this.$backToTop.css({
      bottom: `${bottom}px`,
      transition: "all var(--transition-fast)"
    });
  }

  static setupClickHandler() {
    this.$backToTop.on("click", (e) => {
      e.preventDefault();
      this.scrollToTop();
    });
  }

  static scrollToTop() {
    this.$backToTop.removeClass("visible");
    this.$htmlBody.animate({ scrollTop: 0 }, { duration: 10, easing: "swing" });
  }

  static destroy() {
    if (this.$window) this.$window.off("scroll");
    if (this.$backToTop) this.$backToTop.off("click");
  }
}

window.BackToTop = BackToTop;
