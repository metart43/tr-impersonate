/**
 * Returns an object containing array of users and org name
 * @return {Object} {users: Object[], orgName: String}
 */
const listUsers = async () => {
  try {
    const usersResponse = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
    const users = await usersResponse.json();
    const orgResponse = await fetch('http://localhost:3000/api/org/current', {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
    const org = await orgResponse.json();
    return {users, orgName: org.name};
  }
  catch(err) {
    console.log('Error loading users', err);
    return { users: [], orgName: '' };
  };
}

/**
 * Impersonates the current session to the user and reloads the tab
 * @param  {Object} user Object containing {userId: String, orgId: String}
 */
const impersonate = async (event) => {
  const user = event.target.data;
  console.log(user);
  try {
    const impersonateResponse = await fetch('http://localhost:3000/api/user/impersonate', {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(user)
    });
    if (impersonateResponse.status !== 200) {
      throw new Error('Non 200 response status');
    }
    await chrome.tabs.reload();
  }
  catch(err) {
    console.log('Error impersonating user', user, err);
  };
}

const getSavedUsers = async (search) => {
  return new Promise(function(result, reject) {
    try {
      chrome.storage.sync.get('savedUsers', function(ret) {
        result(filterUserArray(ret.savedUsers || [], search));
      });
    }
    catch(err) {
      reject(err);
    }
  });
}

const filterUserArray = (users, search) => {
  if (!search) return users;
  const ret = [];
  users.forEach((user) => {
    if (user && (
       (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        user.orgName && user.orgName.toLowerCase().includes(search.toLowerCase()) ||
        user.email && user.email.toLowerCase().includes(search.toLowerCase()))) {
      ret.push(user);
    }
  });
  return ret;
}

const setSavedUsers = async (savedUsers) => {
  try {
    await chrome.storage.sync.set({'savedUsers': savedUsers});
  }
  catch(err) {
    console.log(err);
  }
}

const removeSavedUser = async (event) => {
  const user = event.target.data;
  const savedUsers = await getSavedUsers();
  const newSavedUsers = savedUsers.filter((element) => {
    return element.userId != user.userId;
  });
  await setSavedUsers(newSavedUsers);
}

(async () => {
  const {users, orgName} = await listUsers();
  const savedUsers = await getSavedUsers();
  console.log('SAVED USERS', savedUsers);
  const tableHeader = document.getElementById("table-header");
  tableHeader.innerText = `User List For ${orgName}`;
  populateSavedUsersTable(savedUsers);
   if (users && users.length) {
    await populateUsersTable(users, orgName);
  }

})().catch(err => {
  console.error(err);
});
const usersTableBody = document.getElementById("users-table").getElementsByTagName('tbody')[0];
const savedUsersTableBody = document.getElementById("saved-users-table").getElementsByTagName('tbody')[0]

const populateUsersTable = async (userArray, orgName) => {
  userArray.map(user => {
    const userName = user.firstName + " " + user.lastName;
    const userRow = document.createElement("tr");
    const userSaveCell = document.createElement("td");
    const saveUserButton = document.createElement("button");
    saveUserButton.data = { userId: user._id, orgId: user.orgId, orgName, name: userName, email: user.email};
    saveUserButton.addEventListener("click", async (event) => {
      await saveUser(event);
      let savedUsers = await getSavedUsers();
      console.log('New saved users', savedUsers);
    });
    saveUserButton.innerText = "Save User";
    userSaveCell.appendChild(saveUserButton);
    userRow.id = user._id;
    userRow.innerHTML = `
      <td>${userName}</td>
      <td>${user.email}</td>
    `;
    userRow.appendChild(userSaveCell);
    usersTableBody.appendChild(userRow);
  })
}

const saveUser = async (event) => {
  const savedUsers = await getSavedUsers();
  savedUsers.push(event.target.data);
  await setSavedUsers(savedUsers);
}

const populateSavedUsersTable = (savedUserArray) => {
  savedUserArray.map(user => {
    const userRow = document.createElement("tr");
    const userCell = document.createElement("td");
    const userCell2 = document.createElement("td");
    
    const impersonateUserButton = document.createElement("button");
    const removeSavedUserButton = document.createElement("button");
    impersonateUserButton.data = { userId: user.userId, orgId: user.orgId };
    removeSavedUserButton.data = { userId: user.userId, orgId: user.orgId };
    impersonateUserButton.addEventListener("click", (event) => {
      impersonate(event);
    });
    removeSavedUserButton.addEventListener("click", (event) => {
      removeSavedUser(event);
    });
    impersonateUserButton.innerText = "Impersonate User";
    removeSavedUserButton.innerText = "Remove User";
    userCell.appendChild(impersonateUserButton);
    userCell2.appendChild(removeSavedUserButton);
    userRow.id = user._id;
    userRow.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.orgName}</td>
    `;
    userRow.appendChild(userCell);
    userRow.appendChild(userCell2);
    savedUsersTableBody.appendChild(userRow);
  })
}

const userListTag = document.getElementById("breadcrum-user-list");
const userSavedListTag = document.getElementById("breadcrum-user-saved-list");
const usersTable = document.getElementById("users-table");
const savedUserTable = document.getElementById("saved-users-table");

userSavedListTag.addEventListener("click", () => {
  usersTable.style.display = "none";
  savedUserTable.style.display = "revert";
});

userListTag.addEventListener("click", () => {
  usersTable.style.display = "revert";
  savedUserTable.style.display = "none";
});