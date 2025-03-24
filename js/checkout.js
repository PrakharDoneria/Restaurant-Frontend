document.addEventListener("DOMContentLoaded", function () {
    displayCartSummary();
    document.getElementById("checkout-form").addEventListener("submit", placeOrder);
});

function displayCartSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartSummaryDiv = document.getElementById("cart-summary");
    const totalAmountSpan = document.getElementById("total-amount");

    if (cart.length === 0) {
        cartSummaryDiv.innerHTML = "<p>Your cart is empty.</p>";
        totalAmountSpan.textContent = "$0.00";
        return;
    }

    let totalAmount = 0;
    let cartHTML = "<ul>";

    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
        cartHTML += `
            <li>
                <strong>${item.name}</strong> - ${item.quantity} x $${item.price.toFixed(2)}
                = $${(item.price * item.quantity).toFixed(2)}
            </li>
        `;
    });

    cartHTML += "</ul>";
    cartSummaryDiv.innerHTML = cartHTML;
    totalAmountSpan.textContent = `$${totalAmount.toFixed(2)}`;
}

async function placeOrder(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !mobile || !address) {
        alert("Please fill in all fields.");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty. Add some pizzas first!");
        return;
    }

    const orderData = {
        name: name,
        mobile: mobile,
        address: address,
        pizzas: cart.map(item => ({
            pizzaId: item.id,  // 🔥 Ensure this matches backend's expected key
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/user/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData) // ✅ Correctly send order details in the body
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem("cart"); // Clear cart after order
            document.getElementById("order-message").textContent = `✅ Order placed successfully! Order ID: ${data.order_id}`;
            document.getElementById("cart-summary").innerHTML = "<p>Your cart is empty.</p>";
            document.getElementById("total-amount").textContent = "$0.00";
        } else {
            document.getElementById("order-message").textContent = data.detail ? JSON.stringify(data.detail) : "❌ Error placing order.";
        }
    } catch (error) {
        console.error("Error placing order:", error);
        document.getElementById("order-message").textContent = "❌ Server error. Try again later.";
    }
}
