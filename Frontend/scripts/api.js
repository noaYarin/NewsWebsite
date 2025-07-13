const dotnetPort = 7171;
const nodePort = 3000;

const dotnetBaseUrl = `https://localhost:${dotnetPort}/api`;
const nodeBaseUrl = `http://localhost:${nodePort}/api`;

const usersEndpoint = `${dotnetBaseUrl}/Users`;
const newsEndpoint = `${nodeBaseUrl}/News`;
const articlesEndpoint = `${dotnetBaseUrl}/Articles`;
const commentsEndpoint = `${dotnetBaseUrl}/Comments`;

const NEWS_PAGE_SIZE = 15;

function ajaxCall(method, api, data, successCB, errorCB) {
  return $.ajax({
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

/* Node.js API calls */
function searchNews(query, page = 1, successCallback, errorCallback) {
  return ajaxCall("GET", `${newsEndpoint}?query=${encodeURIComponent(query)}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

function getTopHeadlines(category, page = 1, successCallback, errorCallback) {
  return ajaxCall("GET", `${newsEndpoint}/top-headlines?category=${encodeURIComponent(category)}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

/* DOT.NET API calls */
function checkUserExists(email, successCallback, errorCallback) {
  return ajaxCall("GET", `${usersEndpoint}/exists/${encodeURIComponent(email)}`, null, successCallback, errorCallback);
}

function registerUser(user, successCallback, errorCallback) {
  return ajaxCall("POST", `${usersEndpoint}/register`, JSON.stringify(user), successCallback, errorCallback);
}

function loginUser(credentials, successCallback, errorCallback) {
  return ajaxCall("POST", `${usersEndpoint}/login`, JSON.stringify(credentials), successCallback, errorCallback);
}

function getProfile(userId, successCallback, errorCallback) {
  return ajaxCall("GET", `${usersEndpoint}/profile/${userId}`, null, successCallback, errorCallback);
}

function updateProfile(userId, data, successCallback, errorCallback) {
  return ajaxCall("PUT", `${usersEndpoint}/profile/${userId}`, JSON.stringify(data), successCallback, errorCallback);
}

function unblockUser(userId, blockedUserId, successCallback, errorCallback) {
  return ajaxCall("DELETE", `${usersEndpoint}/${userId}/blocked/${blockedUserId}`, null, successCallback, errorCallback);
}

function syncArticles(articleList, successCallback, errorCallback) {
  return ajaxCall("POST", `${articlesEndpoint}/sync`, JSON.stringify(articleList), successCallback, errorCallback);
}

function getComments(articleId, successCallback, errorCallback) {
  return ajaxCall("GET", `${commentsEndpoint}/${articleId}`, null, successCallback, errorCallback);
}

function addComment(commentData, successCallback, errorCallback) {
  return ajaxCall("POST", commentsEndpoint, JSON.stringify(commentData), successCallback, errorCallback);
}
