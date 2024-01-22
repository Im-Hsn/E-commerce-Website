let cart = {};

function getCartItems() {
    fetch('/getCartItems')
        .then(response => response.json())
        .then(cartItems => {
            cart = cartItems; // Update global cartItems variable
            displayCartItems(cartItems);
            displayOrderSummary(cartItems);
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
        });
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

function displayCartItems(cartItems) {
    const cartItemsDiv = document.getElementById('cartItems');

    // Clear previous content
    cartItemsDiv.innerHTML = '';

    Object.values(cartItems).forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item', 'row', 'align-items-center', 'mb-3');

        const itemImageCol = document.createElement('div');
        itemImageCol.classList.add('col-md-3');

        const itemImage = document.createElement('img');
        itemImage.src = item.image; // Set the image source
        itemImage.alt = 'Item Image';
        itemImage.classList.add('img-fluid');

        itemImageCol.appendChild(itemImage);
        cartItem.appendChild(itemImageCol);

        const itemDetailsCol = document.createElement('div');
        itemDetailsCol.classList.add('col-md-6');

        const itemTitle = document.createElement('h5');
        itemTitle.textContent = item.name; // Set the item title

        const itemPrice = document.createElement('p');
        itemPrice.textContent = `Price: $${item.price}`; // Set the item price

        // Quantity controls
        const quantityControls = document.createElement('div');
        quantityControls.classList.add('input-group');

        const decreaseBtn = document.createElement('button');
        decreaseBtn.classList.add('btn', 'btn-outline-secondary');
        decreaseBtn.textContent = '-';
        decreaseBtn.addEventListener('click', () => {
            // Decrease quantity
            if (cartItems[item.iditem].quantity > 1) {
                cartItems[item.iditem].quantity--;
                updateCartItems(cartItems);
                displayCartItems(cartItems); // Refresh cart after update
            }
        });

        const quantityInput = document.createElement('input');
        quantityInput.type = 'text';
        quantityInput.classList.add('form-control', 'text-center');
        quantityInput.value = item.quantity;

        const increaseBtn = document.createElement('button');
        increaseBtn.classList.add('btn', 'btn-outline-secondary');
        increaseBtn.textContent = '+';
        increaseBtn.addEventListener('click', () => {
            // Increase quantity
            cartItems[item.iditem].quantity++;
            updateCartItems(cartItems);
            displayCartItems(cartItems); // Refresh cart after update
        });

        quantityControls.appendChild(decreaseBtn);
        quantityControls.appendChild(quantityInput);
        quantityControls.appendChild(increaseBtn);

        itemDetailsCol.appendChild(itemTitle);
        itemDetailsCol.appendChild(itemPrice);
        itemDetailsCol.appendChild(quantityControls);
        cartItem.appendChild(itemDetailsCol);

        const removeBtnCol = document.createElement('div');
        removeBtnCol.classList.add('col-md-3', 'text-right');

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('btn', 'btn-danger', 'btn-sm');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            // Remove item
            delete cartItems[item.iditem];
            updateCartItems(cartItems);
            displayCartItems(cartItems); // Refresh cart after update
        });

        removeBtnCol.appendChild(removeBtn);
        cartItem.appendChild(removeBtnCol);

        cartItemsDiv.appendChild(cartItem); // Append the created cart item to the cartItemsDiv
    });
}
function updateCartItems(cartItems) {
    fetch('/storeCartInSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartItems: cartItems })
    })
        .then(response => {
            if (response.ok) {
                console.log('Cart items updated successfully.');
                displayCartItems(cartItems); // Refresh cart items display
                displayOrderSummary(cartItems); // Update order summary after cart update
            } else {
                throw new Error('Failed to update cart items.');
            }
        })
        .catch(error => {
            console.error('Error updating cart items:', error);
        });
}

function displayOrderSummary(cartItems) {
    const subtotalElement = document.querySelector('#subtotal');
    const taxElement = document.querySelector('#tax');
    const totalElement = document.querySelector('#total');

    let subtotal = 0;
    Object.values(cartItems).forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    getCartItems();

    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.addEventListener('click', placeOrder);
});

function placeOrder() {
    const emptyCartMessage = document.getElementById('GeneralError');
    emptyCartMessage.style.display = 'none';

    if (Object.keys(cart).length === 0) {
        emptyCartMessage.textContent = 'Your cart is empty!';
        emptyCartMessage.style.display = 'flex';
    }
    else {

        const successMessage = document.getElementById('success');
        successMessage.style.display = 'none';
        fetch('/checkout')
            .then(response => {
                if (response.ok) {
                    // Empty the cart and update the display
                    const cartItemsDiv = document.getElementById('cartItems');
                    cartItemsDiv.innerHTML = ''; // Clear the cart display

                    const subtotalElement = document.querySelector('#subtotal');
                    const taxElement = document.querySelector('#tax');
                    const totalElement = document.querySelector('#total');

                    subtotalElement.textContent = '$0.00'; // Update subtotal
                    taxElement.textContent = '$0.00'; // Update tax
                    totalElement.textContent = '$0.00'; // Update total

                    successMessage.textContent = 'Order placed successfully!';
                    successMessage.style.display = 'flex';

                    fetch('/emptyCartSession')
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to empty cart session.');
                            }
                        })
                        .catch(error => {
                            console.error('Error emptying cart session:', error);
                        });
                } else {
                    throw new Error('Failed to place order.');
                }
            })
            .catch(error => {
                console.error('Error placing order:', error);
            });
    }
}
