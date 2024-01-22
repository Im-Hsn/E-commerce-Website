$(document).ready(function() {
  var userCookie = $.cookie('user');
  if (userCookie) {
      var user = JSON.parse(userCookie);
      if (user) {
          $('#username').val(user.username);
          $('#password').val(user.password);
      }
  }
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Get loginType from URL
    const urlParams = new URLSearchParams(window.location.search);
    const loginType = urlParams.get('loginType');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password, loginType: loginType }),
    })
        .then(response => response.json())
        .then(data => {
            const successMessage = document.getElementById('success');
            const errorMessage = document.getElementById('GeneralError');

            if (data.info === 'Sign in successful!') {
                document.cookie = `user=${JSON.stringify({ username: username, password: password })};max-age=900000;path=/`;   // 250 hours
                successMessage.textContent = data.info;
                successMessage.style.display = 'flex';
                errorMessage.style.display = 'none';
                setTimeout(function () {
                    window.location.href = '/home.html';
                }, 2000);
            } else if (data.info === 'Welcome admin!') {
                document.cookie = `user=${JSON.stringify({ username: username, password: password })};max-age=900000;path=/`;
                successMessage.textContent = data.info;
                successMessage.style.display = 'flex';
                errorMessage.style.display = 'none';
                setTimeout(function () {
                    window.location.href = '/adminHome.html';
                }, 2000);
            }
            else {
                errorMessage.textContent = data.info;
                errorMessage.style.display = 'flex';
                successMessage.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
