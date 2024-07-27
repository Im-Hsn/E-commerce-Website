$(document).ready(function () {
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll > 100) {
            $('#navbar').addClass('scrolled');
        } else {
            $('#navbar').removeClass('scrolled');
        }
    });
});

document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    fetch('/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, email: email, message: message }),
    })
        .then(response => response.json())
        .then(data => {
            const successMessage = document.getElementById('success');
            const errorMessage = document.getElementById('GeneralError');

            if (data.info === 'Message sent successfully!') {
                successMessage.textContent = data.info;
                successMessage.style.display = 'flex';
                errorMessage.style.display = 'none';
                document.getElementById('contactForm').reset();
            } else {
                errorMessage.textContent = data.info;
                errorMessage.style.display = 'flex';
                successMessage.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
