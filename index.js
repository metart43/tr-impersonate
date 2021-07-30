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
  };
}

/**
 * Impersonates the current session to the user and reloads the tab
 * @param  {Object} user Object containing {userId: String, orgId: String}
 */
const impersonate = async (user) => {
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

const getSavedUsers = async () => {
  return new Promise(function(result, reject) {
    try {
      chrome.storage.sync.get('savedUsers', function(ret) {
        result(ret.savedUsers || []);
      });
    }
    catch(err) {
      reject(err);
    }
  });
}

const setSavedUsers = async (savedUsers) => {
  try {
    await chrome.storage.sync.set({'savedUsers': savedUsers});
  }
  catch(err) {
    console.log(err);
  }
}

const removeSavedUser = async (user) => {
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
  const usersTable = document.getElementById("users-table");
   if (users && users.length) {
    await populateUsersTable(users);
  }

})().catch(err => {
  console.error(err);
});
const usersTableBody = document.getElementById("users-table").getElementsByTagName('tbody')[0];

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
    userSaveCell.appendChild(saveUserButton)
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




