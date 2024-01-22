let userType;
function checkUserType() {
    // Make an AJAX request to check user type
    $.get('/checkUserType', function (data) {
        if (data.userType === 'customer') {
            userType = 'customer';
            var addToCartButton = $('<button class="btn btn-primary mr-3">Add to Cart</button>');
            $('.mt-4').append(addToCartButton);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    function getItemIdFromUrl() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get('itemId');
    }

    function fetchItemDetails(itemId) {
        fetch(`/getItem/${itemId}`)
            .then(response => response.json())
            .then(item => {
                document.querySelector('.container.my-5 h1').innerText = item.name;
                document.querySelector('.container.my-5 p:nth-of-type(1)').innerHTML = `<strong>Price:</strong> $${item.price}`;
                document.querySelector('.container.my-5 p:nth-of-type(2)').innerHTML = `<strong>Category:</strong> ${item.type}`;
                document.querySelector('.container.my-5 p:nth-of-type(3)').innerHTML = `<strong>Description:</strong> Product Description Lorem ipsum dolor sit amet, consectetur adipiscing elit`;

                if (userType === 'customer') {
                    const addToCartButton = document.querySelector('.container.my-5 .btn.btn-primary');
                    addToCartButton.setAttribute('data-itemId', itemId);
                    addToCartButton.addEventListener('click', addToCartClicked);
                }

                // Update the carousel images
                const carouselItems = document.querySelectorAll('#productCarousel .carousel-item img');
                carouselItems[0].src = item.image;
                carouselItems[1].src = updateImageString(item.image);
            })
            .catch(error => {
                console.error('Error fetching item details:', error);
            });
    }

    function addToCartClicked(event) {
        const itemId = event.target.getAttribute('data-itemId');
        console.log('Add to Cart clicked for itemId:', itemId);
    }

    const itemId = getItemIdFromUrl();
    if (itemId) {
        fetchItemDetails(itemId);
    }

    var currentSlide = 0;
    var slides = document.querySelectorAll('#productCarousel .carousel-inner .carousel-item');
    var totalSlides = slides.length;

    var nextButton = document.querySelector('#productCarousel .carousel-control-next');
    nextButton.addEventListener('click', function () {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    });

    var prevButton = document.querySelector('#productCarousel .carousel-control-prev');
    prevButton.addEventListener('click', function () {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    function updateCarousel() {
        slides.forEach(function (slide) {
            slide.classList.remove('active');
        });
        slides[currentSlide].classList.add('active');
    }
});

function updateImageString(inputString) {
    var parts = inputString.split('-');
    var lastPart = parts.pop();
    var fileExtension = lastPart.split('.').pop();

    var numberPart = parseInt(lastPart.replace('.' + fileExtension, ''));
    numberPart = (numberPart + 1).toString();
    parts.push(numberPart + '.' + fileExtension);

    return parts.join('-');
}

$(document).ready(function () {
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll > 100) {
            $('#navbar').addClass('scrolled');
        } else {
            $('#navbar').removeClass('scrolled');
        }
    });
    checkUserType();
});
