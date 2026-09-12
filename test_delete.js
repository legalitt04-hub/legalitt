fetch('https://legalitt-growth.onrender.com/api/v1/chats/6aa529c3f4e069379481f5d2', {
  method: 'DELETE',
  headers: { Authorization: `Bearer test` }
}).then(res => res.json().then(data => console.log(res.status, data)));
