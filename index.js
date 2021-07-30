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

(async () => {
  const {users, orgName} = await listUsers();
  console.log('Users', users);
  console.log('Org Name', orgName);
  const usersTable = document.getElementById("users-table");
   if (users && users.length) {
    populateUsersTable(users);
  }

  console.log(usersTable);
})().catch(err => {
  console.error(err);
});
const usersTableBody = document.getElementById("users-table").getElementsByTagName('tbody')[0];

const populateUsersTable = (userArray) => {
  userArray.map(user => {
    const userName = user.firstName + " " + user.lastName;
    const userRow = document.createElement("tr");
    userRow.id = user._id;
    userRow.innerHTML = `
      <td>${userName}</td>
      <td>${user.email}</td>
      <td>
        <button class="">
          Save User
        </button>
      </td>
    `;
    usersTableBody.appendChild(userRow);
  })
}






