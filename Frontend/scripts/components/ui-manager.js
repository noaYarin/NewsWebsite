class UIManager {
  static POPUP_DISPLAY_TIME = 2000;
  static POPUP_FADE_TIME = 500;
  static DIALOG_TRANSITION_TIME = 400;

  // ========== Popup Functions ==========
  static showPopup(message, colorFlag) {
    const popupType = this.normalizeColorFlag(colorFlag);

    $("#popup").remove();
    const $popup = $("<div></div>").attr("id", "popup").addClass("popup").addClass(popupType).text(message);

    this.animatePopupIn($popup);
    this.schedulePopupRemoval($popup);
  }

  static normalizeColorFlag(colorFlag) {
    if (typeof colorFlag === "boolean") {
      return colorFlag ? "success" : "failure";
    }
    if (typeof colorFlag === "string") {
      return colorFlag;
    }
    return "failure";
  }

  static animatePopupIn($popup) {
    $("body").append($popup);
    $popup[0].offsetHeight; // Force reflow to ensure initial state is rendered
    $popup.addClass("show");
  }

  static schedulePopupRemoval($popup) {
    setTimeout(() => {
      $popup.removeClass("show");
      setTimeout(() => $popup.remove(), this.POPUP_FADE_TIME);
    }, this.POPUP_DISPLAY_TIME);
  }

  // ========== Dialog Functions ==========
  static showDialog(message, isReportDialog = false) {
    return new Promise((resolve) => {
      $("#dialog-popup").remove();
      const dialogElements = this.createDialogElements(message);

      const closeDialog = this.createCloseDialogHandler(dialogElements.$dialog, resolve);

      this.setupDialogEventHandlers(dialogElements, closeDialog, isReportDialog);
      this.displayDialog(dialogElements.$dialog);
    });
  }

  static createDialogElements(message) {
    const $dialog = $("<div></div>").attr("id", "dialog-popup").addClass("dialog-popup");
    const $message = $("<p></p>").addClass("dialog-message").text(message);

    const $actions = $("<div></div>").addClass("dialog-actions");
    const $yesButton = $("<button>Yes</button>").addClass("dialog-yes");
    const $noButton = $("<button>No</button>").addClass("dialog-no");

    $actions.append($yesButton, $noButton);
    $dialog.append($message, $actions);

    return {
      $dialog,
      $message,
      $actions,
      $yesButton,
      $noButton
    };
  }

  static createCloseDialogHandler($dialog, resolve) {
    return (value) => {
      $(document).off("click.dialog");
      $dialog.removeClass("show");
      setTimeout(() => $dialog.remove(), this.DIALOG_TRANSITION_TIME);
      resolve(value);
    };
  }

  static setupDialogEventHandlers(elements, closeDialog, isReportDialog) {
    const { $yesButton, $noButton } = elements;

    $yesButton.on("click", () => {
      if (isReportDialog) {
        this.handleReportDialogTransform(elements, closeDialog);
      } else {
        closeDialog(true);
      }
    });

    $noButton.on("click", () => closeDialog(false));
  }

  static handleReportDialogTransform(elements, closeDialog) {
    const { $dialog, $message, $actions } = elements;
    ReportDialog.transformToReasonSelection($dialog, $message, $actions, closeDialog);
  }

  static displayDialog($dialog) {
    $("body").append($dialog);

    setTimeout(() => {
      $dialog.addClass("show");

      setTimeout(() => {
        this.setupOutsideClickHandler($dialog);
      }, 0);
    }, 10);
  }

  static setupOutsideClickHandler($dialog) {
    $(document).on("click.dialog", (event) => {
      if (!$(event.target).closest("#dialog-popup").length) {
        $dialog.find(".dialog-no").click();
      }
    });
  }
}

window.UIManager = UIManager;
