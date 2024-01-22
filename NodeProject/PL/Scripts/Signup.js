document.getElementById("signupForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const successMessage = document.getElementById('Success');
  successMessage.style.display = 'none';
  document.getElementById('generalError').style.display='none';

  // Execute reCAPTCHA v3 and set the token value to the hidden input field
  grecaptcha.ready(function() {
    grecaptcha.execute('6LfMdSMpAAAAAAsWKd76RbFSl9oJFlGg8TMJVMHL', { action: 'submit' }).then(function(token) {
      document.getElementById('g-recaptcha-response').value = token;

      // Prepare data as JSON
      const data = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        birthdate: document.getElementById('birthdate').value,
        recaptchaResponse: token,
      };

      // Submit the form after reCAPTCHA validation
      fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json()) // Treat response as JSON
      .then(data => {
        if (data.message === 'Signup successful!') {
            successMessage.textContent = data.message;
            successMessage.style.display = 'flex';
        } else {
          // If there's an error, display it under the appropriate input field
          data.errors.forEach(error => {
            const errorMessage = document.getElementById(error.field + 'Error');
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'flex';
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during signup. Please try again.');
      });
    });
  });
});

// Clear error messages when input fields are changed
['username', 'email', 'password', 'birthdate'].forEach(field => {
  document.getElementById(field).addEventListener('input', function() {
    const errorMessage = document.getElementById(field + 'Error');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
  });
});


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
