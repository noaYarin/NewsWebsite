const apiBaseUrl = "https://localhost:7171/api";
const usersEndpoint = `${apiBaseUrl}/Users`;

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

function checkUserExists(email, successCallback, errorCallback) {
  ajaxCall("GET", `${usersEndpoint}/exists/${encodeURIComponent(email)}`, null, successCallback, errorCallback);
}

function registerUser(user, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/register`, JSON.stringify(user), successCallback, errorCallback);
}

function loginUser(credentials, successCallback, errorCallback) {
  ajaxCall("POST", `${usersEndpoint}/logIn`, JSON.stringify(credentials), successCallback, errorCallback);
}
