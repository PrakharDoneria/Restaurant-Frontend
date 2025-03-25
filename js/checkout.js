/**
 * PizzaVerse Checkout JavaScript
 * Version: 2.0
 * Last Updated: 2025-03-25 11:57:27 UTC
 * Author: PrakharDoneria
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("Checkout page initialized at: 2025-03-25 11:57:27 UTC");
    
    // Initialize checkout page
    displayCartSummary();
    setupFormValidation();
    prePopulateUserDetails();
    
    // Event listeners
    document.getElementById("checkout-form").addEventListener("submit", placeOrder);
    
    // Show warning if cart is empty
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        showEmptyCartWarning();
    }
});

/**
 * Pre-populate user details if available
 */
function prePopulateUserDetails() {
    // Try to get saved user data from localStorage
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            
            // Populate form fields
            const nameInput = document.getElementById("name");
            const mobileInput = document.getElementById("mobile");
            const addressInput = document.getElementById("address");
            
            if (nameInput && userData.name) nameInput.value = userData.name;
            if (mobileInput && userData.mobile) mobileInput.value = userData.mobile;
            if (addressInput && userData.address) addressInput.value = userData.address;
        } catch (error) {
            console.error("Error parsing saved user data:", error);
        }
    }
}

/**
 * Display cart summary with item details and totals
 */
function displayCartSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartSummaryDiv = document.getElementById("cart-summary");
    const totalAmountSpan = document.getElementById("total-amount");
    
    if (!cartSummaryDiv || !totalAmountSpan) return;
    
    if (cart.length === 0) {
        cartSummaryDiv.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <p class="text-gray-500">Your cart is empty</p>
                <a href="pizzas.html" class="mt-4 inline-block text-red-600 font-medium hover:underline">
                    Browse our menu
                </a>
            </div>
        `;
        
        totalAmountSpan.textContent = "0.00";
        return;
    }

    let totalAmount = 0;
    let cartHTML = "<ul class='space-y-4'>";

    // Generate cart items HTML
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        cartHTML += `
            <li class="flex justify-between items-center px-2 py-3 border-b border-gray-100">
                <div>
                    <strong class="text-gray-800">${item.name}</strong>
                    <p class="text-sm text-gray-600 mt-1">${item.quantity} × $${item.price.toFixed(2)}</p>
                </div>
                <span class="font-medium text-red-600">$${itemTotal.toFixed(2)}</span>
            </li>
        `;
    });

    // Add subtotal, tax, and delivery info
    const taxRate = 0.08; // 8% tax
    const tax = totalAmount * taxRate;
    const deliveryFee = totalAmount >= 30 ? 0 : 3.99; // Free delivery over $30
    const finalTotal = totalAmount + tax + deliveryFee;

    cartHTML += `</ul>
        <div class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between items-center border-t border-gray-100 pt-2">
                <span class="text-gray-600">Subtotal:</span>
                <span>$${totalAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Tax (8%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                <span class="text-gray-600">Delivery:</span>
                <span>${deliveryFee === 0 ? 
                    '<span class="text-green-600">FREE</span>' : 
                    '$' + deliveryFee.toFixed(2)}</span>
            </div>
        </div>
    `;

    // Insert cart items HTML
    cartSummaryDiv.innerHTML = cartHTML;
    
    // Update total
    totalAmountSpan.textContent = finalTotal.toFixed(2);
}

/**
 * Setup form validation for all fields
 */
function setupFormValidation() {
    const nameInput = document.getElementById("name");
    const mobileInput = document.getElementById("mobile");
    const addressInput = document.getElementById("address");
    
    // Add error message elements if they don't exist
    if (nameInput && !document.getElementById("name-error")) {
        const errorSpan = document.createElement("span");
        errorSpan.id = "name-error";
        errorSpan.className = "text-red-500 text-sm hidden mt-1";
        errorSpan.textContent = "Please enter your name";
        nameInput.insertAdjacentElement('afterend', errorSpan);
    }
    
    if (mobileInput && !document.getElementById("mobile-error")) {
        const errorSpan = document.createElement("span");
        errorSpan.id = "mobile-error";
        errorSpan.className = "text-red-500 text-sm hidden mt-1";
        errorSpan.textContent = "Please enter a valid 10-digit mobile number";
        mobileInput.insertAdjacentElement('afterend', errorSpan);
    }
    
    if (addressInput && !document.getElementById("address-error")) {
        const errorSpan = document.createElement("span");
        errorSpan.id = "address-error";
        errorSpan.className = "text-red-500 text-sm hidden mt-1";
        errorSpan.textContent = "Please enter your delivery address";
        addressInput.insertAdjacentElement('afterend', errorSpan);
    }
}

/**
 * Show a warning if the cart is empty
 */
function showEmptyCartWarning() {
    const orderMessage = document.getElementById("order-message");
    if (orderMessage) {
        orderMessage.textContent = "Your cart is empty. Please add some pizzas first!";
        orderMessage.classList.remove("bg-green-100", "text-green-800", "opacity-0");
        orderMessage.classList.add("bg-yellow-100", "text-yellow-800", "opacity-100");
    }
    
    // Disable the place order button
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
}

/**
 * Save user data to localStorage for future use
 */
function saveUserData(name, mobile, address) {
    const userData = {
        name: name,
        mobile: mobile,
        address: address,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem("userData", JSON.stringify(userData));
}

/**
 * Place order with the API
 */
async function placeOrder(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Basic validation
    if (!name || !mobile || !address) {
        // Show validation messages
        if (!name) document.getElementById("name-error").classList.remove("hidden");
        if (!mobile) document.getElementById("mobile-error").classList.remove("hidden");
        if (!address) document.getElementById("address-error").classList.remove("hidden");
        
        showToast("Please fill in all required fields.", "error");
        return;
    }

    // Mobile number validation
    if (!/^\d{10}$/.test(mobile)) {
        document.getElementById("mobile-error").classList.remove("hidden");
        showToast("Please enter a valid 10-digit mobile number.", "error");
        return;
    }

    if (cart.length === 0) {
        showToast("Your cart is empty. Add some pizzas first!", "error");
        return;
    }

    // Save user data for convenience
    saveUserData(name, mobile, address);

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;

        // Reset after timeout even if there's an error
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 10000); // 10 seconds timeout
    }

    const orderData = {
        name: name,
        mobile: mobile,
        address: address,
        payment_method: paymentMethod,
        pizzas: cart.map(item => ({
            pizzaId: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch("https://restaurant-backend-lime.vercel.app/api/user/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            // Success - display order confirmation
            localStorage.removeItem("cart"); // Clear cart after order
            showSuccessModal(data.order_id || "Unknown");
            
            // Log the success
            console.log(`Order placed successfully by ${name} at ${new Date().toISOString()}`);
            
            // Save order to history
            saveOrderToHistory(data.order_id, orderData);
        } else {
            // Error from server
            showToast(data.detail || "Error placing order. Please try again.", "error");
            
            // Enable the button again
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Place Order";
            }
        }
    } catch (error) {
        console.error("Error placing order:", error);
        showToast("Server error. Please try again later.", "error");
        
        // Enable the button again
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Place Order";
        }
    }
}

/**
 * Save the order to history in localStorage
 */
function saveOrderToHistory(orderId, orderData) {
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        name: orderData.name,
        mobile: orderData.mobile,
        address: orderData.address,
        payment_method: orderData.payment_method,
        items: JSON.parse(localStorage.getItem("cart") || "[]"),
        status: "Order Confirmed",
        user: "PrakharDoneria"
    };
    
    orderHistory.unshift(order); // Add to the beginning
    
    // Keep only the last 10 orders
    if (orderHistory.length > 10) {
        orderHistory.pop();
    }
    
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
}

/**
 * Show success modal after order is placed
 */
function showSuccessModal(orderId) {
    const modalContainer = document.getElementById('success-modal-container');
    if (!modalContainer) return;
    
    // Create modal HTML
    modalContainer.innerHTML = `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center transform transition-all duration-300 scale-100 hover:scale-105">
            <div class="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
            
            <p class="text-gray-600 mb-6">
                Your delicious pizza is on its way. 
                <span class="block font-semibold text-green-600 mt-2">
                    Order ID: ${orderId}
                </span>
            </p>
            
            <div class="flex justify-center space-x-4">
                <button 
                    onclick="window.location.href='index.html'" 
                    class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                    <span>Back to Home</span>
                </button>
                
                <button 
                    onclick="document.getElementById('success-modal-container').innerHTML = ''" 
                    class="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                </button>
            </div>
        </div>
    </div>
    `;
}

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 */
function showToast(message, type = 'success') {
    // Check if toast container exists, create it if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    
    // Configure toast based on type
    let bgColor = 'bg-green-500';
    let iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
    
    if (type === 'error') {
        bgColor = 'bg-red-500';
        iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
        iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
    } else if (type === 'info') {
        bgColor = 'bg-blue-500';
        iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
    }
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-3 flex items-center transform translate-x-full`;
    toast.style.transition = 'all 0.3s ease-out';
    
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${iconPath}
        </svg>
        <div class="flex-1">${message}</div>
        <button class="ml-2 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}