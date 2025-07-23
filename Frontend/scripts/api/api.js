const dotnetBaseUrl = `https://localhost:${CONSTANTS.API.DOTNET_PORT}/api`;
const nodeBaseUrl = `http://localhost:${CONSTANTS.API.NODE_PORT}/api`;

const usersEndpoint = `${dotnetBaseUrl}/Users`;
const newsEndpoint = `${nodeBaseUrl}/News`;
const articlesEndpoint = `${dotnetBaseUrl}/Articles`;
const commentsEndpoint = `${dotnetBaseUrl}/Comments`;
const reportsEndpoint = `${dotnetBaseUrl}/Reports`;
const bookmarksEndpoint = `${dotnetBaseUrl}/Bookmarks`;
const friendsEndpoint = `${dotnetBaseUrl}/Friends`;
const notificationsEndpoint = `${dotnetBaseUrl}/Notifications`;
const statisticsEndpoint = `${dotnetBaseUrl}/Statistics`;

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

// --- Node.js Calls ---
function getTopHeadlines(category, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${nodeBaseUrl}/News/top-headlines?category=${category}&page=${page}&pageSize=${CONSTANTS.NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

function searchNews(query, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${nodeBaseUrl}/News?query=${encodeURIComponent(query)}&page=${page}&pageSize=${CONSTANTS.NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

// --- .NET Calls ---
// --- Article Management Functions ---
function getArticleById(id, successCallback, errorCallback) {
  ajaxCall("GET", `${articlesEndpoint}/${id}`, null, successCallback, errorCallback);
}

function searchDatabaseArticles(term, page, pageSize, successCallback, errorCallback) {
  const url = `${articlesEndpoint}/search?term=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`;
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

function getSummarizedArticle(text, successCallback, errorCallback) {
  const url = `${articlesEndpoint}/summarize`;
  ajaxCall("POST", url, JSON.stringify({ ArticleUrl: text }), successCallback, errorCallback);
}

function syncArticles(articleList, successCallback, errorCallback) {
  ajaxCall("POST", `${articlesEndpoint}/sync`, JSON.stringify(articleList), successCallback, errorCallback);
}

// --- Comment Management Functions ---
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

// --- Report Management Functions ---
function reportComment(reportData, successCallback, errorCallback) {
  ajaxCall("POST", reportsEndpoint, JSON.stringify(reportData), successCallback, errorCallback);
}

function reportArticle(reportData, successCallback, errorCallback) {
  ajaxCall("POST", reportsEndpoint, JSON.stringify(reportData), successCallback, errorCallback);
}

// --- Bookmark Management Functions ---
function toggleBookmark(data, successCallback, errorCallback) {
  ajaxCall("POST", `${bookmarksEndpoint}/toggle`, JSON.stringify(data), successCallback, errorCallback);
}

function getUserBookmarks(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${bookmarksEndpoint}/${userId}`, null, successCallback, errorCallback);
}

function searchBookmarks(userId, term, page, pageSize, successCallback, errorCallback) {
  const url = `${bookmarksEndpoint}/${userId}/search?term=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`;
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

function searchUsers(searchTerm, successCallback, errorCallback) {
  const url = `${usersEndpoint}?searchTerm=${encodeURIComponent(searchTerm)}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function searchUsersPaginated(searchTerm, page = 1, pageSize = 10, successCallback, errorCallback) {
  const url = `${usersEndpoint}/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

// --- Friendship Functions ---
function sendFriendRequest(data, successCallback, errorCallback) {
  ajaxCall("POST", `${friendsEndpoint}/request`, JSON.stringify(data), successCallback, errorCallback);
}

function respondToFriendRequest(data, successCallback, errorCallback) {
  ajaxCall("PUT", `${friendsEndpoint}/respond`, JSON.stringify(data), successCallback, errorCallback);
}

function cancelFriendRequest(data, successCallback, errorCallback) {
  ajaxCall("DELETE", `${friendsEndpoint}/cancel`, JSON.stringify(data), successCallback, errorCallback);
}

function removeFriend(data, successCallback, errorCallback) {
  ajaxCall("DELETE", `${friendsEndpoint}/remove`, JSON.stringify(data), successCallback, errorCallback);
}

function getFriends(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${friendsEndpoint}/${userId}`, null, successCallback, errorCallback);
}

function getPendingFriendRequests(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${friendsEndpoint}/pending/${userId}`, null, successCallback, errorCallback);
}

function getOutgoingFriendRequests(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${friendsEndpoint}/outgoing/${userId}`, null, successCallback, errorCallback);
}

// --- Notification Functions ---
function shareArticle(data, successCallback, errorCallback) {
  ajaxCall("POST", `${notificationsEndpoint}/share-article`, JSON.stringify(data), successCallback, errorCallback);
}

function getNotifications(userId, page, pageSize, successCallback, errorCallback) {
  const url = `${notificationsEndpoint}/${userId}?page=${page}&pageSize=${pageSize}`;
  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getRecentNotifications(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${notificationsEndpoint}/recent/${userId}`, null, successCallback, errorCallback);
}

function getUnreadNotificationCount(userId, successCallback, errorCallback) {
  ajaxCall("GET", `${notificationsEndpoint}/unread-count/${userId}`, null, successCallback, errorCallback);
}

function markNotificationAsRead(notificationId, userId, successCallback, errorCallback) {
  ajaxCall("PUT", `${notificationsEndpoint}/${notificationId}/read/${userId}`, null, successCallback, errorCallback);
}

function markAllNotificationsAsRead(userId, successCallback, errorCallback) {
  ajaxCall("PUT", `${notificationsEndpoint}/read-all/${userId}`, null, successCallback, errorCallback);
}

// --- Statistics API Calls ---
function getGeneralStatistics(successCallback, errorCallback) {
  ajaxCall("GET", `${statisticsEndpoint}/general`, null, successCallback, errorCallback);
}

function getDailyStatistics(startDate = null, endDate = null, successCallback, errorCallback) {
  let url = `${statisticsEndpoint}/daily`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getDailyLogins(startDate = null, endDate = null, successCallback, errorCallback) {
  let url = `${statisticsEndpoint}/daily/logins`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getDailyArticlePulls(startDate = null, endDate = null, successCallback, errorCallback) {
  let url = `${statisticsEndpoint}/daily/article-pulls`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  ajaxCall("GET", url, null, successCallback, errorCallback);
}

function getDailyArticleInserts(startDate = null, endDate = null, successCallback, errorCallback) {
  let url = `${statisticsEndpoint}/daily/article-inserts`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  ajaxCall("GET", url, null, successCallback, errorCallback);
}
