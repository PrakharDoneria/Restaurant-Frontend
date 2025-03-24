document.addEventListener("DOMContentLoaded", () => {
    displayCart();
});

function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    cartContainer.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalPriceElement.textContent = "0.00";
        return;
    }

    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <h2>${item.name}</h2>
            <p>Price: $${item.price.toFixed(2)}</p>
            <label>Quantity:</label>
            <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartContainer.appendChild(itemElement);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

function updateQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function goToCheckout() {
    window.location.href = "checkout.html";
}
