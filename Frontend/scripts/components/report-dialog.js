const ReportDialog = {
  transformToReasonSelection($dialog, $message, $actions, closeDialog) {
    $dialog.addClass("report-dialog");
    $message.text("Please select a reason for your report");

    const reasons = [
      { value: "Spam", text: "Spam or Misleading" },
      { value: "HateSpeech", text: "Hate Speech" },
      { value: "Harassment", text: "Harassment" },
      { value: "ViolentSpeech", text: "Violent Speech" },
      { value: "Misinformation", text: "Misinformation" },
      { value: "Other", text: "Other" }
    ];
    const $reportControls = $("<div></div>").addClass("report-dialog-controls");

    const $customDropdown = $("<div></div>").addClass("custom-dropdown");
    const $dropdownButton = $("<button></button>").addClass("dropdown-button");
    const $selectedText = $("<span></span>").addClass("selected-text").text("Select a reason...");
    const $dropdownArrow = $(`<svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`);

    const $dropdownOptions = $("<div></div>").addClass("dropdown-options");

    reasons.forEach((reason) => {
      const $option = $("<div></div>").addClass("dropdown-option").attr("data-value", reason.value).text(reason.text);
      $dropdownOptions.append($option);
    });

    $dropdownButton.append($selectedText, $dropdownArrow);
    $customDropdown.append($dropdownButton, $dropdownOptions);

    const $continueButton = $("<button>Continue</button>").addClass("report-dialog-continue-btn").prop("disabled", true);

    let selectedValue = null;

    $dropdownButton.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $dropdownButton.toggleClass("active");
      $dropdownOptions.toggleClass("show");
    });

    $dropdownOptions.on("click", ".dropdown-option", function (e) {
      e.stopPropagation();
      $dropdownOptions.find(".dropdown-option").removeClass("selected");
      $(this).addClass("selected");
      selectedValue = $(this).attr("data-value");
      $selectedText.text($(this).text());
      $dropdownButton.addClass("selected");
      $continueButton.prop("disabled", false).addClass("enabled");
      $dropdownButton.removeClass("active");
      $dropdownOptions.removeClass("show");
    });

    $(document).on("click.dropdown", function (e) {
      if (!$customDropdown.is(e.target) && $customDropdown.has(e.target).length === 0) {
        $dropdownButton.removeClass("active");
        $dropdownOptions.removeClass("show");
      }
    });

    $continueButton.on("click", function () {
      if (selectedValue) {
        $(document).off("click.dropdown");
        const selectedText = $selectedText.text();
        ReportDialog.transformToReportForm($dialog, $message, $reportControls, closeDialog, selectedValue, selectedText);
      }
    });

    $dropdownButton.on("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        $dropdownButton.click();
      }
    });

    $reportControls.append($customDropdown, $continueButton);

    $actions.fadeOut(200, function () {
      $(this).remove();
      $dialog.append($reportControls);
      $reportControls.hide().fadeIn(200);
      $dialog.addClass("expanded");
    });
  },

  transformToReportForm($dialog, $message, $reportControls, closeDialog, reasonCategory, reasonText) {
    $message.text(`Please provide more details for ${reasonText.toLowerCase()}`);

    const $inputContainer = $("<div></div>").addClass("dialog-input-container");
    const $textarea = $("<textarea></textarea>").addClass("dialog-textarea").attr("placeholder", "Enter your report here...").attr("max-length", "200");
    const $sendButton = $("<button><img src='../sources/icons/send-alt-1-svgrepo-com.svg' alt='Send' /></button>").addClass("dialog-send");

    $sendButton.on("click", () => {
      const reportText = $textarea.val().trim();
      if (reportText === "") {
        $textarea.focus();
        $textarea.addClass("error");
        setTimeout(() => $textarea.removeClass("error"), 2000);
        return;
      }
      closeDialog({ reported: true, reason: reportText, reasonCategory: reasonCategory });
    });

    $inputContainer.append($textarea, $sendButton);

    $reportControls.fadeOut(200, function () {
      $(this).remove();
      $dialog.append($inputContainer);
      $inputContainer.hide().fadeIn(200).addClass("show");
      $textarea.focus();
    });
  }
};

window.UIManager = UIManager;
window.ReportDialog = ReportDialog;
