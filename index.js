const usersTableBody = document.getElementById("users-table").getElementsByTagName('tbody')[0];
const savedUsersTableBody = document.getElementById("saved-users-table").getElementsByTagName('tbody')[0];
const userListTag = document.getElementById("breadcrum-user-list");
const userSavedListTag = document.getElementById("breadcrum-user-saved-list");
const usersTable = document.getElementById("users-table");
const savedUserTable = document.getElementById("saved-users-table");
const searchBox = document.getElementById('search');

let currentTable = 'SavedUsers';

/**
 * Returns an object containing array of users and org name
 * @return {Object} {users: Object[], orgName: String}
 */
const listUsers = async (search) => {
  try {
    const usersResponse = await fetch('https://app.triblio.com/api/users', {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
    const users = await usersResponse.json();
    const orgResponse = await fetch('https://app.triblio.com/api/org/current', {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
    const org = await orgResponse.json();
    return {users: filterUserArray(users || [], search), orgName: org.name};
  }
  catch(err) {
    console.log('Error loading users', err);
    return { users: [], orgName: '' };
  }
};

/**
 * Impersonates the current session to the user and reloads the tab
 * @param  {Object} user Object containing {userId: String, orgId: String}
 */
const impersonate = async (event) => {
  const user = event.target.data;
  try {
    const impersonateResponse = await fetch('https://app.triblio.com/api/user/impersonate', {
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
  }
};

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
};

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
};

const setSavedUsers = async (savedUsers) => {
  try {
    await chrome.storage.sync.set({'savedUsers': savedUsers});
  }
  catch(err) {
    console.log(err);
  }
};

const removeSavedUser = async (event) => {
  const user = event.target.data;
  const savedUsers = await getSavedUsers();
  const newSavedUsers = savedUsers.filter((element) => {
    return element.userId != user.userId;
  });
  await setSavedUsers(newSavedUsers);
}

(async () => {
  const savedUsers = await getSavedUsers();
  populateSavedUsersTable(savedUsers);
})().catch(err => {
  console.error(err);
});

const populateUsersTable = async (userArray, orgName) => {
  while (usersTableBody.firstChild) {
    usersTableBody.removeChild(usersTableBody.firstChild);
  }
  userArray.map(user => {
    const userName = user.firstName + " " + user.lastName;
    const userRow = document.createElement("tr");
    const userSaveCell = document.createElement("td");
    const saveUserButton = document.createElement("button");
    saveUserButton.data = { userId: user._id, orgId: user.orgId, orgName, name: userName, email: user.email, isAdmin: !!(user.isOrgAdmin)};
    saveUserButton.addEventListener("click", async (event) => {
      await saveUser(event);
      let savedUsers = await getSavedUsers();
    });
    saveUserButton.innerText = "Save";
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
  let shouldAddUser = true;
  savedUsers.forEach(function(user) {
    if (user.userId === event.target.data.userId) shouldAddUser = false;
  });
  if (shouldAddUser) {
    savedUsers.push(event.target.data);
    await setSavedUsers(savedUsers);
  }
  else console.log('user already saved');
}

const populateSavedUsersTable = (savedUserArray) => {
  while (savedUsersTableBody.firstChild) {
    savedUsersTableBody.removeChild(savedUsersTableBody.firstChild);
  }
  savedUserArray.map(user => {
    const userRow = document.createElement("tr");
    const userCell = document.createElement("td");
    const userCell2 = document.createElement("td");
    
    const impersonateUserButton = document.createElement("button");
    const removeSavedUserButton = document.createElement("button");
    impersonateUserButton.data = { userId: user.userId, orgId: user.orgId };
    removeSavedUserButton.data = { userId: user.userId, orgId: user.orgId };
    impersonateUserButton.addEventListener("click", async (event) => {
      await impersonate(event);
      window.close();
    });
    removeSavedUserButton.addEventListener("click", async (event) => {
      await removeSavedUser(event);
      const savedUsers = await getSavedUsers();
      populateSavedUsersTable(savedUsers);
    });
    impersonateUserButton.innerText = "Impersonate";
    removeSavedUserButton.innerText = "Remove";
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

searchBox.addEventListener('input', async (event) => {
  if (currentTable === 'UserList') {
    const {users, orgName} = await listUsers(searchBox.value);
    const tableHeader = document.getElementById("table-header");
    tableHeader.innerText = `User List For ${orgName}`;
    await populateUsersTable(users, orgName);
  }
  else {
    const savedUsers = await getSavedUsers(searchBox.value);
    populateSavedUsersTable(savedUsers);
  }
});

userSavedListTag.addEventListener("click", async () => {
  const savedUsers = await getSavedUsers();
  populateSavedUsersTable(savedUsers);
  searchBox.value = '';
  currentTable = 'SavedUsers';
  usersTable.style.display = "none";
  savedUserTable.style.display = "revert";
  userSavedListTag.style.color = "black"
  userSavedListTag.style.fontWeight = "bold";
  userListTag.style.color = "gray"
  userListTag.style.fontWeight = "revert";
});

userListTag.addEventListener("click", async () => {
  const {users, orgName} = await listUsers();
  const tableHeader = document.getElementById("table-header");
  tableHeader.innerText = `User List For ${orgName}`;
  await populateUsersTable(users, orgName);
  searchBox.value = ''
  currentTable = 'UserList';
  usersTable.style.display = "revert";
  savedUserTable.style.display = "none";
  userListTag.style.color = "black"
  userListTag.style.fontWeight = "bold";
  userSavedListTag.style.color = "gray"
  userSavedListTag.style.fontWeight = "revert";
});