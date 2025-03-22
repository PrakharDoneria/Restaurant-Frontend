// Track order page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a last order to track
    const lastOrderId = localStorage.getItem('lastOrderId');
    const lastOrderMobile = localStorage.getItem('lastOrderMobile');
    
    if (lastOrderId && lastOrderMobile) {
        // Pre-fill the mobile number
        document.getElementById('track-mobile').value = lastOrderMobile;
        fetchOrders(lastOrderMobile);
    }
    
    // Setup event listener for tracking form
    document.getElementById('track-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const mobileNumber = document.getElementById('track-mobile').value.trim();
        
        if (!mobileNumber) {
            showToast('Please enter your mobile number');
            return;
        }
        
        fetchOrders(mobileNumber);
    });
});

// Function to fetch orders for a mobile number
async function fetchOrders(mobileNumber) {
    try {
        // Show loading state
        const trackBtn = document.getElementById('track-btn');
        const trackResults = document.getElementById('track-results');
        
        trackBtn.disabled = true;
        trackBtn.textContent = 'Searching...';
        trackResults.innerHTML = '<div class="loading">Loading orders...</div>';
        
        // Call API to get orders
        const response = await fetch(`http://127.0.0.1:8000/api/orders?number=${encodeURIComponent(mobileNumber)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        
        // Display orders
        displayOrders(orders);
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('track-results').innerHTML = `
            <div class="error-message">
                <p>Failed to fetch orders. Please try again later.</p>
            </div>
        `;
    } finally {
        // Reset button state
        const trackBtn = document.getElementById('track-btn');
        trackBtn.disabled = false;
        trackBtn.textContent = 'Track Orders';
    }
}

// Function to display orders
function displayOrders(orders) {
    const trackResults = document.getElementById('track-results');
    
    if (orders.length === 0) {
        trackResults.innerHTML = `
            <div class="no-orders">
                <p>No orders found for this mobile number.</p>
                <a href="index.html" class="btn">Order Now</a>
            </div>
        `;
        return;
    }
    
    // Sort orders by ID (newest first, assuming higher ID is newer)
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
        
        // Generate status class based on order status
        let statusClass = 'status-preparing';
        if (order.status === 'Ready') statusClass = 'status-ready';
        else if (order.status === 'Delivered') statusClass = 'status-delivered';
        
        // Create order card
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.order_id}</h3>
                        <p class="order-customer">${order.customer_name}</p>
                    </div>
                    <div class="order-status ${statusClass}">
                        ${order.status}
                    </div>
                </div>
                <div class="order-items">
                    ${orderItemsHTML}
                </div>
                <div class="order-footer">
                    <div class="order-total">
                        Total: $${order.total_price.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    });
    
    trackResults.innerHTML = ordersHTML;
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