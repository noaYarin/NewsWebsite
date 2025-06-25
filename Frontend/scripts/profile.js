const currentUser = {
  email: "testuser@horizon.com",
  firstName: "John",
  lastName: "Doe",
  birthdate: "1990-05-15",
  imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
  interests: ["business", "technology", "sports"]
};

let selectedInterests = [];

const validationMap = {
  firstName: (val) => validateName(val, "First name"),
  lastName: (val) => validateName(val, "Last name"),
  birthdate: validateBirthdate,
  imageUrl: validateImageUrl
};

// ========== Page Initialization ==========
function populateForm(user) {
  $("#emailDisplay").text(user.email);
  $("#firstName").val(user.firstName);
  $("#lastName").val(user.lastName);
  $("#birthdate").val(user.birthdate);
  $("#imageUrl").val(user.imageUrl);
  $("#avatarPreview").attr("src", user.imageUrl);

  // Pre-select user's interests
  selectedInterests = [...user.interests];
  selectedInterests.forEach((interest) => {
    $(`.interest-card[data-interest="${interest}"]`).addClass("selected").find(".interest-card-title").addClass("selected");
  });
  updateInterestSubtitle(selectedInterests.length);
}

// ========== Event Handlers ==========
function localHandleInterestSelection(e) {
  const interest = handleInterestSelection(e);
  const card = $(e.currentTarget);

  if (card.hasClass("selected")) {
    selectedInterests.push(interest);
  } else {
    selectedInterests = selectedInterests.filter((i) => i !== interest);
  }
  updateInterestSubtitle(selectedInterests.length);
}

function handleImagePreview() {
  const newUrl = $(this).val();
  if (newUrl && CONFIG.VALIDATION_REGEX.URL.test(newUrl)) {
    $("#avatarPreview").attr("src", newUrl);
  }
}

function handleProfileUpdate(e) {
  e.preventDefault();
  let isValid = true;
  const form = $("#profileForm");

  form.find(".input-error").removeClass("input-error");
  form.find(".error-message").hide();

  form.find("input[name]").each(function () {
    const input = $(this);
    const validator = validationMap[input.attr("name")];
    if (validator) {
      const result = validator(input.val().trim());
      if (!result.valid) {
        isValid = false;
        showError(input, result.message);
      }
    }
  });

  if (selectedInterests.length < 3) {
    $("#interestsError").text("Please select at least 3 interests.").show();
    isValid = false;
  }

  if (isValid) {
    const updatedData = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      birthdate: $("#birthdate").val(),
      imageUrl: $("#imageUrl").val(),
      interests: selectedInterests
    };
    console.log("Updated User Data:", updatedData);
    alert("Profile updated successfully! Check the console for the data.");
  }
}

$(document).ready(function () {
  populateInterestsGrid();
  populateForm(currentUser);

  $(document)
    .on("click", ".interest-card", localHandleInterestSelection)
    .on("input", "#imageUrl", handleImagePreview)
    .on("submit", "#profileForm", handleProfileUpdate)
    .on("input", ".form-group input", function () {
      clearValidationState($(this));
    });

  // Handle broken image links
  $("#avatarPreview").on("error", function () {
    $(this).attr("src", "../sources/images/test.avif"); // Fallback image
  });
});
