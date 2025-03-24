document.addEventListener("DOMContentLoaded", () => {
    displayOrderSummary();
    document.getElementById("checkout-form").addEventListener("submit", placeOrder);
});

function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const orderSummary = document.getElementById("order-summary");
    const totalPriceElement = document.getElementById("total-price");

    orderSummary.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        orderSummary.innerHTML = "<p>Your cart is empty.</p>";
        totalPriceElement.textContent = "0.00";
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("order-item");
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        orderSummary.appendChild(itemElement);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

async function placeOrder(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const mobile = document.getElementById("mobile").value;
    const address = document.getElementById("address").value;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty. Add some pizzas first!");
        return;
    }

    const orderData = {
        name,
        mobile,
        address,
        pizzas: cart.map(item => ({
            pizza_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/user/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem("cart"); // Clear cart after order
            document.getElementById("order-message").textContent = `Order placed successfully! Order ID: ${data.order_id}`;
        } else {
            document.getElementById("order-message").textContent = "Error placing order. Try again.";
        }
    } catch (error) {
        console.error("Error placing order:", error);
        document.getElementById("order-message").textContent = "Server error. Try again later.";
    }
}
