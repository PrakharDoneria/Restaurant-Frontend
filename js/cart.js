/**
 * PizzaVerse Cart Management
 * Version: 2.0
 * Last Updated: 2025-03-25
 * Author: PrakharDoneria
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Cart page initialized");
    displayCart();
    updateCartButtonState();
    setupEventListeners();
});

/**
 * Set up various event listeners for the cart functionality
 */
function setupEventListeners() {
    // Listen for storage events to update cart if changed in another tab
    window.addEventListener('storage', (event) => {
        if (event.key === 'cart') {
            displayCart();
            updateCartButtonState();
        }
    });

    // Add event listener for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Allow Escape key to return to menu
        if (e.key === 'Escape') {
            window.location.href = 'pizzas.html';
        }
    });
}

/**
 * Display all cart items and update total price
 */
function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const proceedCheckoutBtn = document.getElementById("proceed-checkout");
    const emptyCartMessage = document.getElementById("empty-cart-message");

    // Store the empty cart message HTML
    const emptyCartHTML = emptyCartMessage ? emptyCartMessage.outerHTML : '';
    
    // Clear the cart container
    cartContainer.innerHTML = "";
    
    // Re-add the empty cart message
    if (emptyCartHTML) {
        cartContainer.innerHTML = emptyCartHTML;
    }
    
    // Re-get the empty cart message after re-adding it
    const updatedEmptyCartMessage = document.getElementById("empty-cart-message");
    
    let totalPrice = 0;
    let totalItems = 0;

    // Handle empty cart state
    if (cart.length === 0) {
        if (updatedEmptyCartMessage) {
            updatedEmptyCartMessage.classList.remove('hidden');
        }
        if (proceedCheckoutBtn) {
            proceedCheckoutBtn.disabled = true;
        }
        if (totalPriceElement) {
            totalPriceElement.textContent = "0.00";
        }
        
        // Show empty cart animation
        const emptyCartAnimation = document.querySelector('.empty-cart-animation');
        if (emptyCartAnimation) {
            emptyCartAnimation.style.opacity = '0';
            setTimeout(() => {
                emptyCartAnimation.style.opacity = '1';
                emptyCartAnimation.style.transition = 'opacity 0.5s ease-in-out';
            }, 100);
        }
        
        return;
    }

    // Hide empty cart message when cart has items
    if (updatedEmptyCartMessage) {
        updatedEmptyCartMessage.classList.add('hidden');
    }

    // Add subtle delay for animation effect
    cart.forEach((item, index) => {
        setTimeout(() => {
            totalItems += item.quantity;
            const itemElement = createCartItemElement(item, index);
            cartContainer.appendChild(itemElement);
            
            // Re-initialize feather icons for the newly added elements
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
            
            totalPrice += item.price * item.quantity;
            
            // Update total after all items are added
            if (index === cart.length - 1) {
                if (totalPriceElement) {
                    totalPriceElement.textContent = totalPrice.toFixed(2);
                    
                    // Add a subtle animation to the price when it updates
                    totalPriceElement.classList.add('text-highlight');
                    setTimeout(() => {
                        totalPriceElement.classList.remove('text-highlight');
                    }, 700);
                }
                
                // Add summary information
                addCartSummary(totalItems, totalPrice);
            }
        }, index * 100); // Stagger the items appearing
    });
}

/**
 * Creates a cart item element with all necessary functionality
 * @param {Object} item - The cart item object
 * @param {number} index - The index of the item in the cart array
 * @returns {HTMLElement} The created cart item element
 */
function createCartItemElement(item, index) {
    const itemElement = document.createElement("div");
    itemElement.classList.add(
        "cart-item", 
        "flex", 
        "flex-col",
        "sm:flex-row", 
        "justify-between", 
        "items-start",
        "sm:items-center", 
        "p-4", 
        "sm:p-6", 
        "bg-white", 
        "border",
        "border-gray-100",
        "rounded-xl", 
        "shadow-sm"
    );
    
    // Add pizza image if available
    const imageHtml = item.imageUrl ? 
        `<div class="w-20 h-20 rounded-lg overflow-hidden mr-4 mb-4 sm:mb-0 flex-shrink-0 hidden sm:block">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover">
        </div>` : '';
    
    itemElement.innerHTML = `
        <div class="flex items-start sm:items-center flex-1">
            ${imageHtml}
            <div>
                <h2 class="text-lg font-semibold text-gray-800 mb-1">${item.name}</h2>
                <p class="text-gray-600 text-sm">Price: <span class="font-medium text-red-600">$${item.price.toFixed(2)}</span> per item</p>
            </div>
        </div>
        <div class="flex items-center space-x-3 mt-4 sm:mt-0 self-end sm:self-auto">
            <div class="flex items-center border border-gray-200 rounded-lg">
                <button
                    onclick="updateQuantity(${index}, ${Math.max(1, item.quantity - 1)})"
                    class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 focus:outline-none"
                    aria-label="Decrease quantity"
                >
                    <i data-feather="minus" class="w-4 h-4"></i>
                </button>
                <input 
                    type="number" 
                    value="${item.quantity}" 
                    min="1" 
                    class="quantity-input w-12 h-8 text-center border-0"
                    onchange="updateQuantity(${index}, Math.max(1, this.value))"
                    aria-label="Item quantity"
                >
                <button
                    onclick="updateQuantity(${index}, ${item.quantity + 1})"
                    class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 focus:outline-none"
                    aria-label="Increase quantity"
                >
                    <i data-feather="plus" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="text-right min-w-[80px]">
                <div class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <button 
                onclick="removeFromCart(${index})" 
                class="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors focus:outline-none"
                aria-label="Remove item"
            >
                <i data-feather="trash-2" class="w-5 h-5"></i>
            </button>
        </div>
    `;
    
    return itemElement;
}

/**
 * Add cart summary with subtotal, tax, and delivery info
 * @param {number} totalItems - Total number of items in cart
 * @param {number} subtotal - Subtotal price before tax/delivery
 */
function addCartSummary(totalItems, subtotal) {
    const summaryContainer = document.getElementById('cart-summary');
    if (!summaryContainer) return;
    
    // Calculate tax and delivery
    const taxRate = 0.0825; // 8.25% tax rate
    const tax = subtotal * taxRate;
    const deliveryFee = subtotal > 30 ? 0 : 5.99;
    const total = subtotal + tax + deliveryFee;
    
    // Create summary info if it doesn't exist
    if (!document.getElementById('cart-summary-details')) {
        const summaryDetails = document.createElement('div');
        summaryDetails.id = 'cart-summary-details';
        summaryDetails.classList.add('mb-6', 'text-sm', 'text-gray-600');
        
        summaryDetails.innerHTML = `
            <div class="grid grid-cols-2 gap-y-2">
                <span>Items (${totalItems}):</span>
                <span class="text-right">$${subtotal.toFixed(2)}</span>
                
                <span>Estimated Tax:</span>
                <span class="text-right">$${tax.toFixed(2)}</span>
                
                <span>Delivery Fee:</span>
                <span class="text-right">
                    ${deliveryFee === 0 
                        ? '<span class="text-green-600">Free</span>' 
                        : `$${deliveryFee.toFixed(2)}`
                    }
                    ${deliveryFee > 0 
                        ? `<span class="block text-xs text-gray-500">(Free for orders over $30)</span>` 
                        : ''
                    }
                </span>
                
                <span class="font-semibold text-gray-800 pt-2 border-t border-gray-200 mt-2">Total:</span>
                <span class="text-right font-semibold text-gray-800 pt-2 border-t border-gray-200 mt-2">$${total.toFixed(2)}</span>
            </div>
        `;
        
        // Insert before the buttons
        const buttonsContainer = summaryContainer.querySelector('.flex.flex-col') || 
                                summaryContainer.querySelector('.flex');
                                
        if (buttonsContainer) {
            summaryContainer.insertBefore(summaryDetails, buttonsContainer);
        } else {
            summaryContainer.appendChild(summaryDetails);
        }
    }
}

/**
 * Update the quantity of an item in the cart
 * @param {number} index - Index of the item in the cart array
 * @param {number|string} quantity - New quantity (will be parsed to int)
 */
function updateQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const oldQuantity = cart[index].quantity;
    const newQuantity = Math.max(1, parseInt(quantity));
    
    if (oldQuantity !== newQuantity) {
        cart[index].quantity = newQuantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Show a toast notification for the update
        showToast(`Updated quantity to ${newQuantity}`, 'info');
        
        // Animate just the quantity field
        const quantityInputs = document.querySelectorAll('.quantity-input');
        if (quantityInputs[index]) {
            quantityInputs[index].classList.add('bg-red-50');
            setTimeout(() => {
                quantityInputs[index].classList.remove('bg-red-50');
            }, 300);
        }
        
        displayCart();
    }
}

/**
 * Remove an item from the cart
 * @param {number} index - Index of the item in the cart array
 */
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Get the item's name before removing it
    const itemName = cart[index].name;
    
    // Remove with animation
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems[index]) {
        cartItems[index].style.opacity = '0';
        cartItems[index].style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            showToast(`${itemName} removed from cart`, 'warning');
        }, 300);
    } else {
        // Fallback if animation doesn't work
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
        showToast(`${itemName} removed from cart`, 'warning');
    }
}

/**
 * Update the cart button state and cart counter
 */
function updateCartButtonState() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const proceedCheckoutBtn = document.getElementById("proceed-checkout");
    const cartCountElement = document.getElementById("cart-count");
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Add a pulse animation when the count changes
        cartCountElement.classList.add('scale-125');
        setTimeout(() => {
            cartCountElement.classList.remove('scale-125');
        }, 300);
    }

    // Enable/disable proceed to checkout button
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.disabled = cart.length === 0;
        
        // Apply visual indication
        if (cart.length === 0) {
            proceedCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
            proceedCheckoutBtn.classList.remove('hover:-translate-y-1', 'hover:shadow-lg');
        } else {
            proceedCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            proceedCheckoutBtn.classList.add('hover:-translate-y-1', 'hover:shadow-lg');
        }
    }
}

/**
 * Proceed to checkout
 */
function goToCheckout() {
    if (validateCart()) {
        // Add loading state
        const checkoutBtn = document.getElementById("proceed-checkout");
        if (checkoutBtn) {
            checkoutBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...';
            checkoutBtn.disabled = true;
        }
        
        // Save checkout timestamp
        localStorage.setItem('checkout_started', new Date().toISOString());
        
        // Redirect after a short delay for better UX
        setTimeout(() => {
            window.location.href = "checkout.html";
        }, 800);
    }
}

/**
 * Validate cart before checkout
 * @returns {boolean} Whether the cart is valid for checkout
 */
function validateCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        showToast("Your cart is empty", "error");
        return false;
    }
    
    // Check for any invalid items (e.g., zero price)
    const invalidItems = cart.filter(item => item.price <= 0 || item.quantity <= 0);
    if (invalidItems.length > 0) {
        showToast("Some items in your cart are invalid", "error");
        return false;
    }
    
    return true;
}

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    
    // Configure toast based on type
    let bgColor = 'bg-green-500';
    let icon = 'check-circle';
    
    if (type === 'error') {
        bgColor = 'bg-red-500';
        icon = 'alert-circle';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
        icon = 'alert-triangle';
    } else if (type === 'info') {
        bgColor = 'bg-blue-500';
        icon = 'info';
    }
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-3 flex items-center transform translate-x-full`;
    toast.style.transition = 'all 0.3s ease-out';
    
    toast.innerHTML = `
        <i data-feather="${icon}" class="w-5 h-5 mr-2"></i>
        <div class="flex-1">${message}</div>
        <button class="ml-2 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
            <i data-feather="x" class="w-4 h-4"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize feather icons if available
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add keyboard shortcut listener
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + / to show keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        showKeyboardShortcuts();
    }
});

/**
 * Show available keyboard shortcuts
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Esc', description: 'Return to menu' },
        { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
    ];
    
    // Create modal with shortcuts
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Keyboard Shortcuts</h3>
                <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    <i data-feather="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-2">
                ${shortcuts.map(shortcut => `
                    <div class="flex justify-between items-center">
                        <span>${shortcut.description}</span>
                        <kbd class="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-sm">${shortcut.key}</kbd>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize feather icons if available
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function closeModal(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    });
}