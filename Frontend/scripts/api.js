const dotnetPort = 7171;
const nodePort = 3000;

const dotnetBaseUrl = `http://localhost:${dotnetPort}/api`;
const nodeBaseUrl = `http://localhost:${nodePort}/api`;

const usersEndpoint = `${dotnetBaseUrl}/Users`;
const newsEndpoint = `${nodeBaseUrl}/News`;

const NEWS_PAGE_SIZE = 15;

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

/* Node.js API calls */
function searchNews(query, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${newsEndpoint}?query=${encodeURIComponent(query)}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

function getTopHeadlines(category, page = 1, successCallback, errorCallback) {
  ajaxCall("GET", `${newsEndpoint}/top-headlines?category=${encodeURIComponent(category)}&page=${page}&pageSize=${NEWS_PAGE_SIZE}`, null, successCallback, errorCallback);
}

/* DOT.NET API calls */
function checkUserExists(email, successCallback, errorCallback) {
  ajaxCall("GET", `${usersEndpoint}/exists/${encodeURIComponent(email)}`, null, successCallback, errorCallback);
}

function registerUser(user, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/register`, JSON.stringify(user), successCallback, errorCallback);
}

function loginUser(credentials, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/logIn`, JSON.stringify(credentials), successCallback, errorCallback);
}
