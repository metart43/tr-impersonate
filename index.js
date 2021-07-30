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
    if (org && org.name && users && users.length) {
      users.forEach(function(user) {
        user.orgName = org.name;
      });
    }
    return users;
  }
  catch(err) {
    console.log('Error loading users', err);
  };
}

(async () => {
  const users = await listUsers();
  console.log('Users', users);
  const usersTable = document.getElementById("users-table");
  // chrome.extension.getBackgroundPage().console.log('foo', usersTable);

  console.log(usersTable);
})().catch(err => {
  console.error(err);
});