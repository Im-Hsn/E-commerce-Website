const cartItems = {};

fetch('/items')
    .then(response => response.json())
    .then(items => renderItems(items))
    .catch(error => console.error('Error:', error));
function renderItems(items) {
    const itemCards = document.getElementById('itemCards');

    items.forEach(item => {
        const card = createCard(item);
        itemCards.appendChild(card);
    });
    initializeFiltering();
}
fetchUserType();
function fetchUserType() {
    // Make an AJAX request to check user type
    $.get('/checkUserType', function (data) {
        if (data.userType === 'customer') {
            // Create a logout button
            var logoutButton = $('<li class="nav-item"><a id="logoutLink" class="nav-link btn-danger" href="#">Logout</a></li>');

            // Append the logout button to the navbar
            $('.navbar-nav').append(logoutButton);
            $('#logoutLink').on('click', function (e) {
                e.preventDefault();
                $.get('/logout', function () {
                    window.location.reload();
                });
            });
        }
    });
}

function createCard(item) {
    const card = document.createElement('div');
    card.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'mb-4');
    card.innerHTML = `
        <div class="card" data-type="${item.type}" data-item-id="${item.iditem}">
            <img src="${item.image}" class="card-img-top" alt="${item.name}">
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">$${item.price}</p>
                <div class="input-group mb-3">
                    <button class="btn btn-outline-secondary button-addon1" type="button">-</button>
                    <input type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" value="1">
                    <button class="btn btn-outline-secondary button-addon2" type="button">+</button>
                </div>
                <a class="btn btn-primary addToCart">Add to Cart</a>
            </div>
        </div>
    `;
    return card;
}

function initializeFiltering() {
    const filterSelect = document.getElementById('filterSelect');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    filterSelect.addEventListener('change', filterItems);
    searchBtn.addEventListener('click', searchItems);

    function filterItems() {
        const selectedType = filterSelect.value.toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const itemType = card.dataset.type.toLowerCase();

            if (selectedType === 'all' || selectedType === itemType) {
                card.parentNode.style.display = 'block';
            } else {
                card.parentNode.style.display = 'none';
            }
        });
    }

    function searchItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const itemName = card.querySelector('.card-title').textContent.toLowerCase();

            if (itemName.includes(searchTerm)) {
                card.parentNode.style.display = 'block';
            } else {
                card.parentNode.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const itemCards = document.getElementById('itemCards');

    itemCards.addEventListener('click', handleItemClick);

    function handleItemClick(event) {
        const target = event.target;

        if (target.matches('.addToCart')) {
            addToCart(target);
        } else if (target.matches('.button-addon2')) {
            incrementQuantity(target);
        } else if (target.matches('.button-addon1')) {
            decrementQuantity(target);
        }
    }

    function addToCart(target) {
        const card = target.closest('.card');
        const itemId = card.dataset.itemId;
        const itemName = card.querySelector('.card-title').textContent;
        const itemPrice = parseFloat(card.querySelector('.card-text').textContent.replace('$', ''));
        const itemQuantity = parseInt(card.querySelector('.form-control').value, 10);
        const itemImage = card.querySelector('.card-img-top').src;

        if (!cartItems[itemId]) {
            cartItems[itemId] = {
                iditem: itemId,
                name: itemName,
                price: itemPrice,
                quantity: itemQuantity,
                image: itemImage
            };
            updateCartCount(); // Update the cart count when a new item is added
        } else {
            cartItems[itemId].quantity += itemQuantity;
        }
        updateCartUI();
        console.log(`Added ${itemQuantity} ${itemName} to the cart.`);
        animateCartIcon();
    }

    function incrementQuantity(target) {
        const input = target.previousElementSibling;
        input.value = parseInt(input.value, 10) + 1;
    }

    function decrementQuantity(target) {
        const input = target.nextElementSibling;
        if (parseInt(input.value, 10) > 1) {
            input.value = parseInt(input.value, 10) - 1;
        }
    }
});

function animateCartIcon() {
    $('.cart-icon').css({ transition: 'transform 0.5s' });
    $('.cart-icon').css({ transform: 'scale(1.5)' });
    setTimeout(function () {
        $('.cart-icon').css({ transform: 'scale(1)' });
    }, 500);
}

function updateCartCount() {
    var count = Object.keys(cartItems).length;
    $('.cart-badge').text(count);
}

$(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll > 100) {
        $('#navbar').addClass('scrolled');
    } else {
        $('#navbar').removeClass('scrolled');
    }
});

let sidebarOpen = false;
$('#cartContainer').on('click', function () {
    if (sidebarOpen) {
        $('#cartSidebar').css('left', '-300px');
    } else {
        $('#cartSidebar').css('left', '0');
    }
    sidebarOpen = !sidebarOpen;
});

$('#closeCartBtn').on('click', function () {
    $('#cartSidebar').css('left', '-300px');
    sidebarOpen = false;
});


function updateCartUI() {
    const cartItemsSection = document.getElementById('cartItemsSection');
    cartItemsSection.innerHTML = '';

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.style.display = Object.keys(cartItems).length > 0 ? 'block' : 'none';

    for (const itemId in cartItems) {
        const cartItem = cartItems[itemId];

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border-bottom', 'mb-2', 'pb-2');

        // Item Image (if available)
        if (cartItem.image) {
            const itemImage = document.createElement('img');
            itemImage.src = cartItem.image;
            itemImage.alt = cartItem.name;
            itemImage.classList.add('img-thumbnail', 'mr-3');
            itemImage.style.maxWidth = '70px';
            cartItemDiv.appendChild(itemImage);
        }

        // Item Name
        const itemName = document.createElement('span');
        itemName.textContent = cartItem.name;
        itemName.classList.add('mr-3', 'card-name');
        cartItemDiv.appendChild(itemName);


        // Item Price
        const itemPrice = document.createElement('span');
        itemPrice.textContent = `$${cartItem.price.toFixed(2)}`;
        itemPrice.classList.add('mr-3');
        cartItemDiv.appendChild(itemPrice);

        // Item Quantity with control buttons
        const itemQtyGroup = document.createElement('div');
        itemQtyGroup.classList.add('d-flex', 'align-items-center');

        const decrementButton = document.createElement('button');
        decrementButton.textContent = '-';
        decrementButton.classList.add('btn', 'btn-outline-danger', 'mr-2');
        decrementButton.addEventListener('click', () => updateCartItemQuantity(itemId, -1)); // Decrease quantity

        const quantity = document.createElement('span');
        quantity.textContent = cartItem.quantity;
        quantity.classList.add('mr-2', 'font-weight-bold');

        const incrementButton = document.createElement('button');
        incrementButton.textContent = '+';
        incrementButton.classList.add('btn', 'btn-outline-success');
        incrementButton.addEventListener('click', () => updateCartItemQuantity(itemId, 1)); // Increase quantity

        itemQtyGroup.appendChild(decrementButton);
        itemQtyGroup.appendChild(quantity);
        itemQtyGroup.appendChild(incrementButton);

        cartItemDiv.appendChild(itemQtyGroup);

        cartItemsSection.appendChild(cartItemDiv);
    }
}
function updateCartItemQuantity(itemId, change) {
    if (cartItems[itemId]) {
        cartItems[itemId].quantity += change;

        if (cartItems[itemId].quantity < 1) {
            delete cartItems[itemId];
        }

        updateCartCount();
        updateCartUI();
    }
}

function handleCheckout() {
    const errorMessage = document.getElementById('GeneralError');
    const checkoutErrorModal = new bootstrap.Modal(document.getElementById('checkoutErrorModal'));

    fetch('/checkUserType')
        .then(response => response.json())
        .then(data => {
            errorMessage.style.display = 'none';
            if (data.userType === 'customer') {
                storeCartInSession(); // Function to store cart items in session
                window.location.href = '/checkout.html';
            } else {
                errorMessage.textContent = "You must be logged in to checkout!";
                errorMessage.style.display = 'flex';
                checkoutErrorModal.show();
                // Handle login for checkout
                document.getElementById('loginFormCheckout').addEventListener('submit', function (event) {
                    event.preventDefault();
                    const username = document.getElementById('usernameCheckout').value;
                    const password = document.getElementById('passwordCheckout').value;

                    const successMessage = document.getElementById('success');
                    const errorMessage2 = document.getElementById('GeneralError2');

                    successMessage.style.display = 'none';
                    errorMessage2.style.display = 'none';

                    fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username: username, password: password, loginType: "customer" }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.info === 'Sign in successful!') {
                                successMessage.textContent = data.info;
                                successMessage.style.display = 'flex';
                                errorMessage2.style.display = 'none';
                                setTimeout(function () {
                                    storeCartInSession(); // Function to store cart items in session
                                    window.location.href = '/checkout.html';
                                }, 1000);
                            } else {
                                errorMessage2.textContent = data.info;
                                errorMessage2.style.display = 'flex';
                                successMessage.style.display = 'none';
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                });
            }
        })
        .catch(error => {
            console.error('Error checking user type:', error);
        });
}

// Event listener for checkout button
document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);

function storeCartInSession() {
    fetch('/storeCartInSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
    })
        .then(response => {
            if (!response.ok)
                console.error('Failed to store cart items in session.');
        })
        .catch(error => {
            console.error('Error storing cart items in session:', error);
        });
}