// Admin page for order management
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as admin (in a real app, this would use proper auth)
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        // Redirect to login or show login form
        showLoginForm();
    } else {
        // Load admin panel
        loadOrderManagement();
    }
});

// Function to display login form
function showLoginForm() {
    const orderContainer = document.getElementById('order-management');
    
    orderContainer.innerHTML = `
        <div class="admin-login">
            <h2>Admin Login</h2>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
            <p class="login-message">Note: For demo purposes, use "admin" as both username and password.</p>
        </div>
    `;
    
    // Setup login form submission
    document.getElementById('admin-login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication for demo purposes
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('isAdmin', 'true');
            loadOrderManagement();
        } else {
            showToast('Invalid credentials');
        }
    });
}

// Function to load order management interface
function loadOrderManagement() {
    const orderContainer = document.getElementById('order-management');
    
    orderContainer.innerHTML = `
        <div class="admin-header">
            <h2>Order Management</h2>
            <button id="logout-btn" class="btn-outline">Logout</button>
        </div>
        
        <div class="admin-tabs">
            <button class="tab-btn active" data-tab="orders">Orders</button>
            <button class="tab-btn" data-tab="menu">Menu Management</button>
        </div>
        
        <div class="tab-content" id="orders-tab">
            <div class="order-filters">
                <button class="filter-btn active" data-status="all">All Orders</button>
                <button class="filter-btn" data-status="Preparing">Preparing</button>
                <button class="filter-btn" data-status="Ready">Ready</button>
                <button class="filter-btn" data-status="Delivered">Delivered</button>
            </div>
            
            <div id="order-list" class="order-list">
                <div class="loading">Loading orders...</div>
            </div>
        </div>
        
        <div class="tab-content hidden" id="menu-tab">
            <button id="add-menu-btn" class="btn">Add New Menu Item</button>
            <div id="menu-list" class="menu-list">
                <div class="loading">Loading menu...</div>
            </div>
            
            <div id="add-menu-form" class="add-menu-form hidden">
                <h3>Add New Menu Item</h3>
                <form id="menu-form">
                    <div class="form-group">
                        <label for="pizza-name">Pizza Name</label>
                        <input type="text" id="pizza-name" required>
                    </div>
                    <div class="form-group">
                        <label for="pizza-price">Price ($)</label>
                        <input type="number" id="pizza-price" min="0.01" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="pizza-category">Category</label>
                        <select id="pizza-category" required>
                            <option value="">Select Category</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Specialty">Specialty</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="pizza-description">Description</label>
                        <textarea id="pizza-description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="pizza-image">Image URL</label>
                        <input type="text" id="pizza-image">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancel-menu-btn" class="btn-outline">Cancel</button>
                        <button type="submit" class="btn">Add Pizza</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Setup event listeners
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('isAdmin');
        showLoginForm();
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
            
            // Load data for the tab
            if (tabId === 'orders') {
                fetchAllOrders();
            } else if (tabId === 'menu') {
                fetchMenuItems();
            }
        });
    });
    
    // Order filters
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const status = this.getAttribute('data-status');
            filterOrders(status);
        });
    });
    
    // Menu form toggling
    document.getElementById('add-menu-btn').addEventListener('click', function() {
        document.getElementById('add-menu-form').classList.remove('hidden');
    });
    
    document.getElementById('cancel-menu-btn').addEventListener('click', function() {
        document.getElementById('add-menu-form').classList.add('hidden');
        document.getElementById('menu-form').reset();
    });
    
    // Menu form submission
    document.getElementById('menu-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addMenuItem();
    });
    
    // Load orders by default
    fetchAllOrders();
}

// Function to fetch all orders
async function fetchAllOrders() {
    try {
        // For a real application, this would need to fetch all orders
        // This is a simplified version that would actually need an admin endpoint
        const response = await fetch('http://127.0.0.1:8000/api/orders?admin=true');
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        
        // Store orders globally to use with filters
        window.allOrders = orders;
        
        // Display all orders
        displayOrders(orders);
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('order-list').innerHTML = `
            <div class="error-message">
                <p>Failed to fetch orders. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display orders
function displayOrders(orders) {
    const orderList = document.getElementById('order-list');
    
    if (!orders || orders.length === 0) {
        orderList.innerHTML = `
            <div class="no-orders">
                <p>No orders found.</p>
            </div>
        `;
        return;
    }
    
    // Sort orders by ID (newest first)
    orders.sort((a, b) => b.order_id - a.order_id);
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        // Generate HTML for order items
        let orderItemsHTML = '';
        order.items.forEach(item => {
            orderItemsHTML += `
                <div class="order-item">
                    <span class="item-name">${item.pizza_name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
            `;
        });
        
        // Generate status buttons based on current status
        let statusButtonsHTML = '';
        if (order.status === 'Preparing') {
            statusButtonsHTML = `
                <button class="status-btn ready-btn" data-order-id="${order.order_id}">Mark Ready</button>
            `;
        } else if (order.status === 'Ready') {
            statusButtonsHTML = `
                <button class="status-btn delivered-btn" data-order-id="${order.order_id}">Mark Delivered</button>
            `;
        }
        
        // Create order card
        ordersHTML += `
            <div class="order-card" data-status="${order.status}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.order_id}</h3>
                        <p class="order-customer">${order.customer_name} (${order.mobile})</p>
                    </div>
                    <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
                </div>
                <div class="order-items">
                    ${orderItemsHTML}
                </div>
                <div class="order-footer">
                    <div class="order-total">Total: $${order.total_price.toFixed(2)}</div>
                    <div class="order-actions">
                        ${statusButtonsHTML}
                    </div>
                </div>
            </div>
        `;
    });
    
    orderList.innerHTML = ordersHTML;
    
    // Add event listeners to status buttons
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', updateOrderStatus);
    });
}

// Function to update order status
async function updateOrderStatus(event) {
    const button = event.currentTarget;
    const orderId = button.getAttribute('data-order-id');
    let newStatus = 'Preparing';
    
    if (button.classList.contains('ready-btn')) {
        newStatus = 'Ready';
    } else if (button.classList.contains('delivered-btn')) {
        newStatus = 'Delivered';
    }
    
    try {
        // Show loading state
        button.disabled = true;
        button.textContent = 'Updating...';
        
        // In a real application, this would be an API call
        // For this demo, we'll simulate an update
        setTimeout(() => {
            // Update the order in our local data
            const order = window.allOrders.find(o => o.order_id == orderId);
            if (order) {
                order.status = newStatus;
                
                // Re-apply the current filter
                const activeFilter = document.querySelector('.filter-btn.active');
                const status = activeFilter.getAttribute('data-status');
                filterOrders(status);
                
                showToast(`Order #${orderId} marked as ${newStatus}`);
            }
        }, 500);
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Failed to update order status');
        button.disabled = false;
        button.textContent = button.classList.contains('ready-btn') ? 'Mark Ready' : 'Mark Delivered';
    }
}

// Function to filter orders by status
function filterOrders(status) {
    if (!window.allOrders) return;
    
    let filteredOrders = window.allOrders;
    
    if (status !== 'all') {
        filteredOrders = window.allOrders.filter(order => order.status === status);
    }
    
    displayOrders(filteredOrders);
}

// Function to fetch menu items
async function fetchMenuItems() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/menu');
        
        if (!response.ok) {
            throw new Error('Failed to fetch menu');
        }
        
        const menuItems = await response.json();
        displayMenuItems(menuItems);
        
    } catch (error) {
        console.error('Error fetching menu:', error);
        document.getElementById('menu-list').innerHTML = `
            <div class="error-message">
                <p>Failed to fetch menu. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display menu items
function displayMenuItems(menuItems) {
    const menuList = document.getElementById('menu-list');
    
    if (!menuItems || menuItems.length === 0) {
        menuList.innerHTML = `
            <div class="no-menu">
                <p>No menu items found.</p>
            </div>
        `;
        return;
    }
    
    // Sort menu items by ID
    menuItems.sort((a, b) => a.id - b.id);
    
    let menuHTML = '<div class="menu-grid">';
    
    menuItems.forEach(item => {
        menuHTML += `
            <div class="menu-card">
                <div class="menu-image">
                    <img src="${item.image_url || 'img/default-pizza.jpg'}" alt="${item.name}">
                </div>
                <div class="menu-details">
                    <h3>${item.name}</h3>
                    <p class="menu-category">${item.category}</p>
                    <p class="menu-description">${item.description || 'No description available.'}</p>
                    <p class="menu-price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    menuHTML += '</div>';
    menuList.innerHTML = menuHTML;
}

// Function to add a new menu item
async function addMenuItem() {
    const nameInput = document.getElementById('pizza-name');
    const priceInput = document.getElementById('pizza-price');
    const categoryInput = document.getElementById('pizza-category');
    const descriptionInput = document.getElementById('pizza-description');
    const imageInput = document.getElementById('pizza-image');
    
    const menuData = {
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value),
        category: categoryInput.value,
        description: descriptionInput.value.trim(),
        image_url: imageInput.value.trim() || null
    };
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('#menu-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        // Call API to add menu item
        const response = await fetch('http://127.0.0.1:8000/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(menuData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to add menu item');
        }
        
        // Reset form and hide it
        document.getElementById('menu-form').reset();
        document.getElementById('add-menu-form').classList.add('hidden');
        
        // Refresh menu list
        fetchMenuItems();
        
        // Show success message
        showToast('Menu item added successfully!');
        
    } catch (error) {
        console.error('Error adding menu item:', error);
        showToast('Failed to add menu item. ' + error.message);
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#menu-form button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Pizza';
    }
}

// Function to display toast message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}