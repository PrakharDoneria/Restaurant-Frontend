document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    updateCartButtonState();
});

function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const proceedCheckoutBtn = document.getElementById("proceed-checkout");
    const emptyCartMessage = document.getElementById("empty-cart-message");

    cartContainer.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        proceedCheckoutBtn.disabled = true;
        totalPriceElement.textContent = "0.00";
        return;
    }

    emptyCartMessage.classList.add('hidden');

    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add(
            "cart-item", 
            "flex", 
            "justify-between", 
            "items-center", 
            "p-4", 
            "bg-gray-100", 
            "rounded-lg", 
            "shadow-sm"
        );
        itemElement.innerHTML = `
            <div class="flex-grow">
                <h2 class="text-lg font-semibold text-blue-800">${item.name}</h2>
                <p class="text-gray-600">Price: $${item.price.toFixed(2)}</p>
            </div>
            <div class="flex items-center space-x-4">
                <label class="text-gray-700">Qty:</label>
                <input 
                    type="number" 
                    value="${item.quantity}" 
                    min="1" 
                    class="quantity-input w-20 text-center"
                    onchange="updateQuantity(${index}, this.value)"
                >
                <button 
                    onclick="removeFromCart(${index})" 
                    class="remove-btn bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition"
                >
                    Remove
                </button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
    updateCartButtonState();
}

function updateQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantity = Math.max(1, parseInt(quantity));
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function updateCartButtonState() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const proceedCheckoutBtn = document.getElementById("proceed-checkout");
    const cartCountElement = document.getElementById("cart-count");

    // Update cart count
    cartCountElement.textContent = cart.length;

    // Enable/disable proceed to checkout button
    proceedCheckoutBtn.disabled = cart.length === 0;
}

function goToCheckout() {
    window.location.href = "checkout.html";
}