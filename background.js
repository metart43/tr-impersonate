const SAVED_USERS = "savedUsers";

const demoUsersArray = [
  {
    "id": 1,
    "_id": "532c5e07f348e80c19000008",
    "firstName": "Dheeraj",
    "lastName": "Manjunath",
    "email": "artem@triblio.com",
    "newUserOrPasswordResetRequested": false,
    "accessToken": "3c51dd916d946be4f2f8fde5dbf0b0c7130370fa",
    "passwordHash": "$2a$12$LsDLmdxgqAVJzmKc/1NFz.uxcqTirTluVJyEKmhTvj1xr7XLxFsJW",
    "isStaff": true,
    "isFinance": null,
    "isOrgAdmin": true,
    "enableSSO": null,
    "ssoType": null,
    "acceptWeeklyEmails": true,
    "calendarAssignmentEmails": false,
    "demoMode": false,
    "twitterData": {
      "errors": [
        {
          "code": 215,
          "message": "Bad Authentication data."
        }
      ]
    },
    "waterfallData": null,
    "twitterId": 50393960,
    "orgId": "52af35240f8078af1900000b",
    "socialAccountPermissions": null,
    "inspirationBoards": null,
    "screenName": "Artem Metelskyi",
    "createdAt": "2016-08-23T18:23:42.092Z",
    "updatedAt": "2020-09-24T19:57:36.099Z",
    "deletedAt": null,
    "isStaffAdmin": true
  },
  {
    "id": 2,
    "_id": "607718b30198165d755ab52b",
    "firstName": "Sales",
    "lastName": "User",
    "email": "email@example.com",
    "newUserOrPasswordResetRequested": true,
    "accessToken": "e35631d620ea28884598b1dbd89a3f00997c1a64",
    "passwordHash": null,
    "isStaff": null,
    "isFinance": null,
    "isOrgAdmin": null,
    "enableSSO": null,
    "ssoType": null,
    "acceptWeeklyEmails": null,
    "calendarAssignmentEmails": true,
    "demoMode": null,
    "twitterData": null,
    "waterfallData": null,
    "twitterId": null,
    "orgId": "52af35240f8078af1900000b",
    "socialAccountPermissions": [],
    "inspirationBoards": null,
    "screenName": "",
    "createdAt": "2021-04-14T16:30:43.738Z",
    "updatedAt": "2021-04-14T16:30:43.738Z",
    "deletedAt": null,
    "isStaffAdmin": false
  }
];

// chrome.runtime.onInstalled.addListener(() => {
//   let savedUsersArray = [];
//   chrome.storage.sync.get([SAVED_USERS], function(result) {
//     console.log('Value currently is ' + result[SAVED_USERS], result);
//     if (result && result.length) savedUsersArray = result[SAVED_USERS]
//   });
//   chrome.storage.sync.set({ SAVED_USERS: savedUsersArray }, function() {
//     console.log('Value is set to ' + savedUsersArray);
//   });
// });
