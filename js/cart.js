// Cart page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Setup event listeners
    document.getElementById('checkout-btn').addEventListener('click', placeOrder);
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
});

// Function to load cart items from localStorage
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    // Show/hide elements based on cart status
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        updateCartBadge();
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'block';
    
    // Clear previous items
    cartItemsContainer.innerHTML = '';
    
    // Calculate total
    let totalPrice = 0;
    
    // Add each item to the cart display
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-details">
                <span class="cart-item-name">${item.pizza_name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-index="${index}">+</button>
            </div>
            <div class="cart-item-total">
                $${itemTotal.toFixed(2)}
            </div>
            <button class="remove-item-btn" data-index="${index}">×</button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update total price
    totalElement.textContent = `$${totalPrice.toFixed(2)}`;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', removeCartItem);
    });
    
    // Update cart badge
    updateCartBadge();
}

// Function to increase item quantity
function increaseQuantity(event) {
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    
    loadCartItems();
}

// Function to decrease item quantity
function decreaseQuantity(event) {
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
    } else {
        removeCartItem(event);
        return;
    }
    
    loadCartItems();
}

// Function to remove item from cart
function removeCartItem(event) {
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    loadCartItems();
}

// Function to clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.setItem('cart', JSON.stringify([]));
        loadCartItems();
    }
}

// Function to place order
async function placeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    // Get customer information from form
    const customerName = document.getElementById('customer-name').value.trim();
    const mobileNumber = document.getElementById('mobile-number').value.trim();
    
    // Validate inputs
    if (!customerName) {
        showToast('Please enter your name');
        return;
    }
    
    if (!mobileNumber || !isValidPhoneNumber(mobileNumber)) {
        showToast('Please enter a valid mobile number');
        return;
    }
    
    // Prepare order data
    const orderData = {
        customer_name: customerName,
        mobile: mobileNumber,
        items: cart.map(item => ({
            pizza_id: item.pizza_id,
            quantity: item.quantity
        }))
    };
    
    try {
        // Show loading state
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';
        
        // Send order to API
        const response = await fetch('http://127.0.0.1:8000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to place order');
        }
        
        // Clear cart after successful order
        localStorage.setItem('cart', JSON.stringify([]));
        
        // Store order ID and mobile number for tracking
        localStorage.setItem('lastOrderId', data.order_id);
        localStorage.setItem('lastOrderMobile', mobileNumber);
        
        // Show success message and redirect to tracking page
        showToast('Order placed successfully!');
        setTimeout(() => {
            window.location.href = 'track.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Failed to place order. Please try again.');
    } finally {
        // Reset button state
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Place Order';
    }
}

// Helper function to validate phone number (basic validation)
function isValidPhoneNumber(phone) {
    return phone.length >= 10 && !isNaN(phone.replace(/[\s()-]/g, ''));
}

// Function to update cart item count badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
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