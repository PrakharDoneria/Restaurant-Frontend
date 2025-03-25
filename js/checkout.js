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
            pizzaId: item.id,
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
            showSuccessModal(data.order_id);
        } else {
            document.getElementById("order-message").textContent = data.detail ? JSON.stringify(data.detail) : "❌ Error placing order.";
        }
    } catch (error) {
        console.error("Error placing order:", error);
        document.getElementById("order-message").textContent = "❌ Server error. Try again later.";
    }
}

function showSuccessModal(orderId) {
    const modalContainer = document.getElementById('success-modal-container');
    
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