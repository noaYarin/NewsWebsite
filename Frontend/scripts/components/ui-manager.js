const UIManager = {
  showPopup(message, colorFlag) {
    if (typeof colorFlag === "boolean") {
      colorFlag = colorFlag ? "success" : "failure";
    } else if (typeof colorFlag !== "string") {
      colorFlag = "failure";
    }

    let $popup = $("#popup");
    if ($popup.length > 0) {
      $popup.remove();
    }

    $popup = $("<div></div>").attr("id", "popup").addClass("popup").addClass(colorFlag).text(message);

    $("body").append($popup);
    $popup[0].offsetHeight;
    $popup.addClass("show");

    setTimeout(() => {
      $popup.removeClass("show");
      setTimeout(() => $popup.remove(), 500);
    }, 2000);
  },

  showDialog(message, isReportDialog = false) {
    return new Promise((resolve) => {
      $("#dialog-popup").remove();

      const $dialog = $("<div></div>").attr("id", "dialog-popup").addClass("dialog-popup");
      const $message = $("<p></p>").addClass("dialog-message").text(message);
      const $actions = $("<div></div>").addClass("dialog-actions");
      const $yesButton = $("<button>Yes</button>").addClass("dialog-yes");
      const $noButton = $("<button>No</button>").addClass("dialog-no");

      const closeDialog = (value) => {
        $(document).off("click.dialog");
        $dialog.removeClass("show");
        setTimeout(() => $dialog.remove(), 400);
        resolve(value);
      };

      $yesButton.on("click", () => {
        if (isReportDialog) {
          ReportDialog.transformToReasonSelection($dialog, $message, $actions, closeDialog);
        } else {
          closeDialog(true);
        }
      });

      $noButton.on("click", () => closeDialog(false));

      $actions.append($yesButton, $noButton);
      $dialog.append($message, $actions);
      $("body").append($dialog);

      setTimeout(() => {
        $dialog.addClass("show");
        setTimeout(() => {
          $(document).on("click.dialog", (event) => {
            if (!$(event.target).closest("#dialog-popup").length) {
              closeDialog(false);
            }
          });
        }, 0);
      }, 10);
    });
  }
};

window.UIManager = UIManager;
