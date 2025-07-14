const dotnetPort = 7171;
const nodePort = 3000;

const dotnetBaseUrl = `https://localhost:${dotnetPort}/api`;
const nodeBaseUrl = `http://localhost:${nodePort}/api`;

const usersEndpoint = `${dotnetBaseUrl}/Users`;
const newsEndpoint = `${nodeBaseUrl}/News`;
const articlesEndpoint = `${dotnetBaseUrl}/Articles`;
const commentsEndpoint = `${dotnetBaseUrl}/Comments`;

const NEWS_PAGE_SIZE = 100;

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
function getRecentArticles(category, successCallback, errorCallback) {
  ajaxCall("GET", `${articlesEndpoint}/category/${category}`, null, successCallback, errorCallback);
}

function syncArticles(articleList, successCallback, errorCallback) {
  ajaxCall("POST", `${articlesEndpoint}/sync`, JSON.stringify(articleList), successCallback, errorCallback);
}

function getComments(articleId, successCallback, errorCallback) {
  ajaxCall("GET", `${commentsEndpoint}/${articleId}`, null, successCallback, errorCallback);
}

function addComment(commentData, successCallback, errorCallback) {
  ajaxCall("POST", commentsEndpoint, JSON.stringify(commentData), successCallback, errorCallback);
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

function unblockUser(userId, blockedUserId, successCallback, errorCallback) {
  ajaxCall("DELETE", `${usersEndpoint}/${userId}/blocked/${blockedUserId}`, null, successCallback, errorCallback);
}
