const dotnetPort = 7171;
const nodePort = 3000;

const dotnetBaseUrl = `https://localhost:${dotnetPort}/api`;
const nodeBaseUrl = `http://localhost:${nodePort}/api`;

const usersEndpoint = `${dotnetBaseUrl}/Users`;
const newsEndpoint = `${nodeBaseUrl}/News`;
const articlesEndpoint = `${dotnetBaseUrl}/Articles`;
const commentsEndpoint = `${dotnetBaseUrl}/Comments`;
const reportsEndpoint = `${dotnetBaseUrl}/Reports`;
const bookmarksEndpoint = `${dotnetBaseUrl}/Bookmarks`;

const NEWS_PAGE_SIZE = 10;

function ajaxCall(method, api, data, successCB, errorCB) {
  $.ajax({
    type: method,
    url: api,
    data: data,
    cache: false,
    contentType: "application/json",
    dataType: "json",
    success: successCB,
    error: errorCB
  });
}

/* --- Node.js Calls --- */
function getTopHeadlines(category, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${nodeBaseUrl}/News/top-headlines?category=${category}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

function searchNews(query, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${nodeBaseUrl}/News?query=${encodeURIComponent(query)}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

/* --- .NET Calls --- */
function getArticleById(id, successCallback, errorCallback) {
  ajaxCall("GET", `${articlesEndpoint}/${id}`, null, successCallback, errorCallback);
}

function searchDatabaseArticles(term, successCallback, errorCallback) {
  const url = `${articlesEndpoint}/search?term=${encodeURIComponent(term)}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getRecentArticles(category, count, successCallback, errorCallback) {
  const url = `${articlesEndpoint}/category/${category}?count=${count}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getArticlesByCategoryPaged(category, page, pageSize, successCallback, errorCallback) {
  const url = `${articlesEndpoint}/category/${category}/paged?page=${page}&pageSize=${pageSize}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function syncArticles(articleList, successCallback, errorCallback) {
  ajaxCall("POST", `${articlesEndpoint}/sync`, JSON.stringify(articleList), successCallback, errorCallback);
}

function getComments(articleId, userId, successCallback, errorCallback) {
  const url = userId ? `${commentsEndpoint}/${articleId}?userId=${userId}` : `${commentsEndpoint}/${articleId}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function addComment(commentData, successCallback, errorCallback) {
  ajaxCall("POST", commentsEndpoint, JSON.stringify(commentData), successCallback, errorCallback);
}

function updateComment(commentId, commentData, successCallback, errorCallback) {
  ajaxCall("PUT", `${commentsEndpoint}/${commentId}`, JSON.stringify(commentData), successCallback, errorCallback);
}

function deleteComment(commentId, requestingUserId, successCallback, errorCallback) {
  ajaxCall("DELETE", `${commentsEndpoint}/${commentId}/${requestingUserId}`, null, successCallback, errorCallback);
}

function toggleLikeComment(commentId, userId, successCallback, errorCallback) {
  ajaxCall("POST", `${commentsEndpoint}/${commentId}/like/${userId}`, null, successCallback, errorCallback);
}

function reportComment(reportData, successCallback, errorCallback) {
  ajaxCall("POST", reportsEndpoint, JSON.stringify(reportData), successCallback, errorCallback);
}

function reportArticle(reportData, successCallback, errorCallback) {
  ajaxCall("POST", reportsEndpoint, JSON.stringify(reportData), successCallback, errorCallback);
}

function toggleBookmark(data, successCallback, errorCallback) {
  ajaxCall("POST", `${bookmarksEndpoint}/toggle`, JSON.stringify(data), successCallback, errorCallback);
}

function getUserBookmarks(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${bookmarksEndpoint}/${userId}`, null, successCallback, errorCallback);
}

function searchBookmarks(userId, term, successCallback, errorCallback) {
  const url = `${bookmarksEndpoint}/${userId}/search?term=${encodeURIComponent(term)}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function isArticleBookmarked(userId, articleId, successCallback, errorCallback) {
  const url = `${bookmarksEndpoint}/status?userId=${userId}&articleId=${articleId}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

// --- User Management Functions ---
function checkUserExists(email, successCallback, errorCallback) {
  ajaxCall("GET", `${usersEndpoint}/exists/${encodeURIComponent(email)}`, null, successCallback, errorCallback);
}

function registerUser(user, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/register`, JSON.stringify(user), successCallback, errorCallback);
}

function loginUser(credentials, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/login`, JSON.stringify(credentials), successCallback, errorCallback);
}

function getProfile(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${usersEndpoint}/profile/${userId}`, null, successCallback, errorCallback);
}

function updateProfile(userId, data, successCallback, errorCallback) {
  ajaxCall("PUT", `${usersEndpoint}/profile/${userId}`, JSON.stringify(data), successCallback, errorCallback);
}

function toggleBlockUser(userId, userToBlockId, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/${userId}/toggle-block/${userToBlockId}`, null, successCallback, errorCallback);
}

function toggleUserStatus(userId, attributeName, successCallback, errorCallback) {
  const data = { attribute: attributeName };
  ajaxCall("PUT", `${usersEndpoint}/${userId}/toggle-status`, JSON.stringify(data), successCallback, errorCallback);
}
