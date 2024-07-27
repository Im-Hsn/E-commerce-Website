document.getElementById('signin').addEventListener('click', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/infoPost/signin', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
        .then(data => {
            document.getElementById("result").innerHTML = data.info;
            if (data.info === 'Sign in successful!') {
                setTimeout(function () {
                    window.location.href = '/home.html';
                }, 2000);
            }
        });
});

document.getElementById('signup').addEventListener('click', function () {
    window.location.href = '/signup.html';
});