document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://127.0.0.1:8000/api';
    
    // Load menu items on page load
    loadMenuItems();
    
    // Add event listeners
    document.getElementById('add-menu-form').addEventListener('submit', addMenuItem);
    document.getElementById('search-btn').addEventListener('click', searchOrders);
    
    // Function to load menu items
    function loadMenuItems() {
        const menuList = document.getElementById('admin-menu-list');
        menuList.innerHTML = '<div class="loading">Loading menu items...</div>';
        
        fetch(`${API_URL}/menu`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    menuList.innerHTML = '<p>No menu items found.</p>';
                    return;
                }
                
                menuList.innerHTML = '';
                data.forEach(item => {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'admin-menu-item';
                    menuItem.innerHTML = `
                        <div class="menu-item-image">
                            <img src="${item.image_url || 'https://via.placeholder.com/150?text=No+Image'}" alt="${item.name}">
                        </div>
                        <div class="menu-item-details">
                            <h3>${item.name}</h3>
                            <p class="price">$${item.price.toFixed(2)}</p>
                            <p class="category">${item.category}</p>
                            <p class="description">${item.description || 'No description available.'}</p>
                        </div>
                    `;
                    menuList.appendChild(menuItem);
                });
            })
            .catch(error => {
                console.error('Error fetching menu items:', error);
                menuList.innerHTML = '<p class="error">Failed to load menu items. Please try again later.</p>';
            });
    }
    
    // Function to add a new menu item
    function addMenuItem(event) {
        event.preventDefault();
        
        const statusElement = document.getElementById('add-status');
        statusElement.innerHTML = '<p class="info">Adding menu item...</p>';
        
        const formData = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            image_url: document.getElementById('image_url').value
        };
        
        fetch(`${API_URL}/menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            statusElement.innerHTML = `<p class="success">Menu item added successfully! ID: ${data.item_id}</p>`;
            document.getElementById('add-menu-form').reset();
            loadMenuItems();
        })
        .catch(error => {
            console.error('Error adding menu item:', error);
            statusElement.innerHTML = `<p class="error">Failed to add menu item: ${error.detail || 'Unknown error'}</p>`;
        });
    }
    
    // Function to search orders by mobile number
    function searchOrders() {
        const mobileNumber = document.getElementById('search-mobile').value.trim();
        if (!mobileNumber) {
            alert('Please enter a mobile number to search');
            return;
        }
        
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<div class="loading">Searching for orders...</div>';
        
        fetch(`${API_URL}/orders?number=${mobileNumber}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    ordersList.innerHTML = '<p>No orders found for this mobile number.</p>';
                    return;
                }
                
                ordersList.innerHTML = '';
                data.forEach(order => {
                    const orderElement = document.createElement('div');
                    orderElement.className = 'order-item';
                    
                    // Create items list
                    let itemsList = '<ul class="order-items-list">';
                    order.items.forEach(item => {
                        itemsList += `<li>${item.quantity}x ${item.pizza_name}</li>`;
                    });
                    itemsList += '</ul>';
                    
                    orderElement.innerHTML = `
                        <div class="order-header">
                            <h3>Order #${order.order_id}</h3>
                            <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Customer:</strong> ${order.customer_name}</p>
                            <p><strong>Mobile:</strong> ${order.mobile}</p>
                            <p><strong>Items:</strong></p>
                            ${itemsList}
                            <p class="order-total"><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
                        </div>
                    `;
                    ordersList.appendChild(orderElement);
                });
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                ordersList.innerHTML = '<p class="error">Failed to load orders. Please try again later.</p>';
            });
    }
});