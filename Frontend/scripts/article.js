const currentUser = {
  email: "testuser@horizon.com",
  firstName: "John",
  lastName: "Doe",
  birthdate: "1990-05-15",
  imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
  interests: ["business", "technology", "sports"],
  blockedUsers: [
    { id: "u001", name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: "u003", name: "Emily White", avatar: "https://randomuser.me/api/portraits/women/65.jpg" }
  ]
};

const isSignedIn = !!currentUser;

const mockComments = [
  {
    author: { name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    text: "This is a really insightful take on the EV market. Thanks for sharing!"
  },
  {
    author: { name: "Mike Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    text: "I had no idea this was happening. It will be interesting to see the long-term effects of this ruling."
  }
];

function isUserBlocked(name, blockedUsers) {
  return blockedUsers.some((blockedUser) => blockedUser.name === name);
}

function formatContent(content) {
  if (!content) return "<p>No content available. Please read the full story on the source website.</p>";
  const cleanedContent = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");
  return cleanedContent
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
}

function formatDate(isoString) {
  if (!isoString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(isoString).toLocaleDateString(undefined, options);
}

$(document).ready(function () {
  const articleJSON = sessionStorage.getItem("currentArticle");
  const article = JSON.parse(articleJSON);

  if (article) {
    document.title = `${article.title || "Article"} | HORIZON`;
    $(".article-source").text(article.source || "Unknown Source");
    $(".article-title").text(article.title || "No Title Provided");
    $(".article-author").text(`By ${article.author || "No Author Provided"}`);
    $(".article-date").text(formatDate(article.published));

    $(".article-tags").hide();

    $(".article-image")
      .attr("src", article.image || "../sources/images/placeholder.png")
      .attr("alt", article.title || "Article image");
    $(".article-content").html(formatContent(article.description));
    $(".read-full-article-btn").attr("href", article.url);
  } else {
    // If no article is in storage, show an error message
    $("#article-main-content").hide();
    $("#article-error-message").show();
  }

  if (isSignedIn) {
    populateComments(mockComments, currentUser.blockedUsers);
  } else {
    populateComments(mockComments, []);
  }

  $("#comments-list").on("click", ".show-comment-btn", function () {
    const button = $(this);
    const authorName = button.data("author-name");
    const authorAvatar = button.data("author-avatar");
    const text = button.data("text");

    const originalCommentHtml = `
      <img src="${authorAvatar}" alt="${authorName}" class="comment-avatar" />
      <div class="comment-body">
        <p class="comment-author">${authorName}</p>
        <p class="comment-text">${text}</p>
      </div>
    `;

    $(this).closest(".comment-item").html(originalCommentHtml);
  });

  if (isSignedIn) {
    $(".article-actions").show();
    $("#comment-form").show();

    $("#comment-form-avatar").attr("src", currentUser.imageUrl);

    $("#bookmark-btn").on("click", function () {
      alert("Article saved to bookmarks! (Functionality to be added)");
    });

    $("#share-btn").on("click", function () {
      alert("Opening share dialog... (Functionality to be added)");
    });

    $("#ai-summarize-btn").on("click", function () {
      alert("Generating AI summary... (Functionality to be added)");
    });

    $("#comment-form").on("submit", function (e) {
      e.preventDefault();
      const commentText = $("#comment-textarea").val().trim();

      if (commentText) {
        const newComment = {
          author: { name: `${currentUser.firstName} ${currentUser.lastName}`, avatar: currentUser.imageUrl },
          text: commentText
        };

        const newCommentHtml = `
          <div class="comment-item">
            <img src="${newComment.author.avatar}" alt="${newComment.author.name}" class="comment-avatar" />
            <div class="comment-body">
              <p class="comment-author">${newComment.author.name}</p>
              <p class="comment-text">${newComment.text}</p>
            </div>
          </div>`;
        $("#comments-list").prepend(newCommentHtml);

        $("#comment-textarea").val("");
      }
    });
  }
});

// Helper functions for comments
function populateComments(comments, blockedUsers) {
  const commentsList = $("#comments-list");
  commentsList.empty();

  comments.forEach((comment) => {
    let commentHtml;

    if (isUserBlocked(comment.author.name, blockedUsers)) {
      commentHtml = `
        <div class="comment-item">
          <div class="blocked-comment-message">
            <span>Comment from a blocked user.</span>
            <button class="show-comment-btn" 
                    data-author-name="${comment.author.name}" 
                    data-author-avatar="${comment.author.avatar}" 
                    data-text="${comment.text}">
              Show Comment
            </button>
          </div>
        </div>
      `;
    } else {
      commentHtml = `
        <div class="comment-item">
          <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar" />
          <div class="comment-body">
            <p class="comment-author">${comment.author.name}</p>
            <p class="comment-text">${comment.text}</p>
          </div>
        </div>
      `;
    }
    commentsList.append(commentHtml);
  });
}
