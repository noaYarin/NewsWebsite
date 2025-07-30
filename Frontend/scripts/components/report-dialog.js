class ReportDialog {
  static REPORT_REASONS = [
    { value: "Spam", text: "Spam or Misleading" },
    { value: "HateSpeech", text: "Hate Speech" },
    { value: "Harassment", text: "Harassment" },
    { value: "ViolentSpeech", text: "Violent Speech" },
    { value: "Misinformation", text: "Misinformation" },
    { value: "Other", text: "Other" }
  ];

  // === Report: Part 1 - Transform dialog to reason selection ===
  static transformToReasonSelection($dialog, $message, $actions, closeDialog) {
    $dialog.addClass("report-dialog");
    $message.text("Please select a reason for your report");

    const $reportControls = this.createReasonSelectionControls(closeDialog, $dialog, $message);

    $actions.fadeOut(200, () => {
      $actions.remove();
      $dialog.append($reportControls);
      $reportControls.hide().fadeIn(200);
      $dialog.addClass("expanded");

      this.setupOutsideClickHandler(closeDialog);
    });
  }

  static setupOutsideClickHandler(closeDialog) {
    $(document).off("click.dialog");
    $(document).on("click.dialog", (event) => {
      if (!$(event.target).closest("#dialog-popup").length) {
        closeDialog(false);
      }
    });
  }

  // === Report: Part 2 - Create reason selection dropdown ===
  static createReasonSelectionControls(closeDialog, $dialog, $message) {
    const $reportControls = $("<div></div>").addClass("report-dialog-controls");
    const $continueButton = $("<button>Continue</button>").addClass("report-dialog-continue-btn").prop("disabled", true);
    const $customDropdown = this.createCustomDropdown();

    let selectedValue = null;
    this.setupDropdownEvents($customDropdown, $continueButton, (value, text) => {
      selectedValue = value;

      $continueButton.off("click").on("click", () => {
        if (selectedValue) {
          this.cleanupDropdownEvents();
          this.transformToReportForm($dialog, $message, $reportControls, closeDialog, selectedValue, text);
        }
      });
    });

    $reportControls.append($customDropdown, $continueButton);
    return $reportControls;
  }

  static createCustomDropdown() {
    const $customDropdown = $("<div></div>").addClass("custom-dropdown");
    const $dropdownButton = $("<button></button>").addClass("dropdown-button");
    const $selectedText = $("<span></span>").addClass("selected-text").text("Select a reason...");
    const $dropdownArrow = $(`
      <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `);

    const $dropdownOptions = this.createDropdownOptions();

    $dropdownButton.append($selectedText, $dropdownArrow);
    $customDropdown.append($dropdownButton, $dropdownOptions);

    return $customDropdown;
  }

  static createDropdownOptions() {
    const $dropdownOptions = $("<div></div>").addClass("dropdown-options");

    this.REPORT_REASONS.forEach((reason) => {
      const $option = $("<div></div>").addClass("dropdown-option").attr("data-value", reason.value).text(reason.text);
      $dropdownOptions.append($option);
    });

    return $dropdownOptions;
  }

  static setupDropdownEvents($customDropdown, $continueButton, onSelectionChange) {
    const $dropdownButton = $customDropdown.find(".dropdown-button");
    const $dropdownOptions = $customDropdown.find(".dropdown-options");
    const $selectedText = $customDropdown.find(".selected-text");

    $dropdownButton.on("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      $dropdownButton.toggleClass("active");
      $dropdownOptions.toggleClass("show");
    });

    $dropdownOptions.on("click", ".dropdown-option", (e) => {
      e.stopPropagation();

      const $selectedOption = $(e.currentTarget);
      const selectedValue = $selectedOption.attr("data-value");
      const selectedText = $selectedOption.text();

      // Update UI state
      $dropdownOptions.find(".dropdown-option").removeClass("selected");
      $selectedOption.addClass("selected");
      $selectedText.text(selectedText);
      $dropdownButton.addClass("selected");
      $continueButton.prop("disabled", false).addClass("enabled");

      // Close dropdown
      $dropdownButton.removeClass("active");
      $dropdownOptions.removeClass("show");

      // Notify parent of selection
      onSelectionChange(selectedValue, selectedText);
    });

    // Close dropdown when clicking outside
    $(document).on("click.dropdown", (e) => {
      if (!$customDropdown.is(e.target) && $customDropdown.has(e.target).length === 0) {
        $dropdownButton.removeClass("active");
        $dropdownOptions.removeClass("show");
      }
    });
  }

  // === Report: Part 3 - Enter more details about the report ===
  static transformToReportForm($dialog, $message, $reportControls, closeDialog, reasonCategory, reasonText) {
    $message.text(`Please provide more details for ${reasonText.toLowerCase()}`);
    const $inputContainer = this.createReportFormControls(closeDialog, reasonCategory);

    $reportControls.fadeOut(200, () => {
      $reportControls.remove();
      $dialog.append($inputContainer);
      $inputContainer.hide().fadeIn(200).addClass("show");
      $inputContainer.find(".dialog-textarea").focus();
    });
  }

  static createReportFormControls(closeDialog, reasonCategory) {
    const $inputContainer = $("<div></div>").addClass("dialog-input-container");
    const $textarea = $("<textarea></textarea>").addClass("dialog-textarea").attr("placeholder", "Enter your report here...").attr("maxlength", "200");
    const $sendButton = $("<button></button>").addClass("dialog-send").html('<img src="../sources/icons/send-alt-1-svgrepo-com.svg" alt="Send" />');

    $sendButton.on("click", () => {
      this.handleReportSubmission($textarea, closeDialog, reasonCategory);
    });

    $textarea.on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleReportSubmission($textarea, closeDialog, reasonCategory);
      }
    });

    $inputContainer.append($textarea, $sendButton);
    return $inputContainer;
  }

  static handleReportSubmission($textarea, closeDialog, reasonCategory) {
    const reportText = $textarea.val().trim();

    if (!reportText) {
      Utils.showInputError($textarea);
      return;
    }

    closeDialog({
      reported: true,
      reason: reportText,
      reasonCategory: reasonCategory
    });
  }

  // Prevents memory leaks by removing dropdown event listeners, just leave this in as is.
  static cleanupDropdownEvents() {
    $(document).off("click.dropdown");
  }
}

window.ReportDialog = ReportDialog;
