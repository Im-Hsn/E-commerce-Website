
document.addEventListener('DOMContentLoaded', function () {
    fetch('/checkUserType', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.userType !== 'admin') {
                window.location.href = '/home.html';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

fetchUserType();
function fetchUserType() {
    // Make an AJAX request to check user type
    $.get('/checkUserType', function (data) {
        if (data.userType === 'admin') {
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

function fetchAndRenderItems() {
    fetch('/items')
        .then(response => response.json())
        .then(items => {
            const itemCards = document.getElementById('itemCards');
            let filteredItems = items;

            const createItemCards = (items) => {
                itemCards.innerHTML = '';

                items.forEach(item => {
                    const card = document.createElement('div');
                    card.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'mb-4');
                    card.innerHTML = `
                        <div class="card" data-type="${item.type}" data-id="${item.iditem}">
                            <img src="${item.image}" class="card-img-top" alt="${item.name}">
                            <div class="card-body">
                                <h5 class="card-title">${item.name}</h5>
                                <p class="card-text">$${item.price}</p>
                                <button class="btn btn-primary editItemBtn" data-id="${item.iditem}">Edit</button>
                                <button class="btn btn-danger deleteItemBtn" data-id="${item.iditem}">Delete</button>
                            </div>
                        </div>
                    `;
                    itemCards.appendChild(card);
                });

                attachEventListeners();
            };

            const attachEventListeners = () => {

                document.querySelectorAll('#itemCards .card .card-img-top').forEach(img => {
                    img.addEventListener('click', (event) => {
                        const itemId = event.currentTarget.parentElement.dataset.id;
                        window.location.href = `view.html?itemId=${itemId}`;
                        event.stopPropagation();
                    });
                });

                document.querySelectorAll('.deleteItemBtn').forEach(btn => {
                    btn.addEventListener('click', (event) => {
                        const itemId = event.target.dataset.id;
                        const itemName = event.target.parentElement.querySelector('.card-title').innerText;

                        document.querySelector('#confirmationModal .modal-body').textContent = `Are you sure you want to delete "${itemName}"?`;

                        $('#confirmationModal').modal('show');

                        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
                            deleteItem(itemId);
                            $('#confirmationModal').modal('hide');
                        });
                    });
                });

                document.querySelectorAll('.editItemBtn').forEach(btn => {
                    btn.addEventListener('click', (event) => {
                        const itemId = event.target.dataset.id;
                        openEditPopup(itemId);
                        console.log(`Edit item with ID: ${itemId}`);
                    });
                });
            };

            createItemCards(items);

            const filterSelect = document.getElementById('filterSelect');
            const searchInput = document.getElementById('searchInput');
            const searchBtn = document.getElementById('searchBtn');

            // Function to filter items by type
            filterSelect.addEventListener('change', () => {
                const selectedType = filterSelect.value;

                if (selectedType === 'all') {
                    createItemCards(filteredItems);
                } else {
                    const filtered = filteredItems.filter(item => item.type === selectedType);
                    createItemCards(filtered);
                }
            });

            // Function to search items by name
            const searchItems = () => {
                const searchTerm = searchInput.value.toLowerCase();

                const filtered = filteredItems.filter(item =>
                    item.name.toLowerCase().includes(searchTerm)
                );
                createItemCards(filtered);
            };

            searchBtn.addEventListener('click', searchItems);
        })
        .catch(error => console.error('Error:', error));
}

fetchAndRenderItems();

document.getElementById('addItemForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemType = document.getElementById('itemType').value;
    const itemImage = document.getElementById('itemImage').files[0];

    const errorDisplay = document.getElementById('GeneralError');
    const successDisplay = document.getElementById('success');

    if (itemName.trim() === '' || itemPrice.trim() === '' || itemType.trim() === '' || !itemImage) {
        errorDisplay.textContent = 'Please fill in all fields.';
        successDisplay.style.display = 'none';
        errorDisplay.style.display = 'flex';
    } else {
        // AJAX request to add item
        const formData = new FormData();
        formData.append('Name', itemName);
        formData.append('Price', itemPrice);
        formData.append('Type', itemType);
        formData.append('Image', "/items/" + itemImage.name);

        fetch('/addItem', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.ok) {
                    fetchAndRenderItems();
                    successDisplay.textContent = 'Item added successfully!';
                    successDisplay.style.display = 'flex';
                    errorDisplay.style.display = 'none';
                    setTimeout(() => {
                        $('#addNewItem').collapse('hide');
                        successDisplay.style.display = 'none';
                    }, 1500);
                }
            })
            .catch(error => console.error('Error adding item:', error));
    }
});
document.getElementById('cancelAddItem').addEventListener('click', function () {
    const errorDisplay = document.getElementById('GeneralError');
    const successDisplay = document.getElementById('success');

    successDisplay.style.display = 'none';
    errorDisplay.style.display = 'none';
    $('#addNewItem').collapse('hide');
});



const deleteItem = (itemId) => {
    fetch(`/deleteItem/${itemId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                fetchAndRenderItems();
            } else {
                throw new Error('Unable to delete item.');
            }
        })
        .catch(error => console.error('Error deleting item:', error));
};

const openEditPopup = (itemId) => {
    const showModal = () => {
        fetch(`/getItem/${itemId}`)
            .then(response => response.json())
            .then(item => {
                document.getElementById('editItemName').value = item.name;
                document.getElementById('editItemPrice').value = item.price;
                document.getElementById('editItemType').value = item.type;

                $('#editModal').modal('show');

                const editedNameField = document.getElementById('editItemName');
                const editedPriceField = document.getElementById('editItemPrice');
                const editedTypeField = document.getElementById('editItemType');

                const saveChangesHandler = () => {
                    const editedName = editedNameField.value;
                    const editedPrice = editedPriceField.value;
                    const editedType = editedTypeField.value;

                    // AJAX request to update item details
                    const formData = new FormData();
                    formData.append('Name', editedName);
                    formData.append('Price', editedPrice);
                    formData.append('Type', editedType);

                    fetch(`/updateItem/${itemId}`, {
                        method: 'PUT',
                        body: formData,
                    })
                        .then(response => {
                            if (response.ok) {
                                fetchAndRenderItems();

                                $('#editModal').modal('hide');
                            }
                        })
                        .catch(error => console.error('Error updating item:', error));
                };

                const cancelEditHandler = () => {
                    $('#editModal').modal('hide');
                };

                document.getElementById('saveChangesBtn').addEventListener('click', saveChangesHandler);
                document.getElementById('cancelEditBtn').addEventListener('click', cancelEditHandler);

                // Remove event listeners when the modal is hidden
                $('#editModal').on('hidden.bs.modal', () => {
                    document.getElementById('saveChangesBtn').removeEventListener('click', saveChangesHandler);
                    document.getElementById('cancelEditBtn').removeEventListener('click', cancelEditHandler);
                });
            })
            .catch(error => console.error('Error fetching item details:', error));
    };

    showModal();
};


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
