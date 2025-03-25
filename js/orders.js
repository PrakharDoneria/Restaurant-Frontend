async function fetchOrderStatus() {
    const orderId = document.getElementById("order-id").value.trim();
    const orderDetailsDiv = document.getElementById("order-details");

    // Show loading state
    orderDetailsDiv.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
            <svg class="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Fetching order status...</span>
        </div>
    `;

    if (!orderId) {
        orderDetailsDiv.innerHTML = `
            <div class="text-center text-red-600">
                <p>⚠️ Please enter a valid Order ID</p>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`https://https://restaurant-backend-lime.vercel.app/api/user/status?id=${orderId}`);

        if (!response.ok) {
            throw new Error("Order not found");
        }

        const data = await response.json();

        // Status color mapping
        const statusColors = {
            'Pending': 'text-yellow-600',
            'Preparing': 'text-blue-600',
            'Out for Delivery': 'text-green-600',
            'Delivered': 'text-green-800',
            'Cancelled': 'text-red-600'
        };

        orderDetailsDiv.innerHTML = `
            <div class="space-y-4 text-center">
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-red-500 pb-2">
                    Order Details
                </h2>
                <p class="text-gray-700"><strong>Order ID:</strong> <span class="text-red-600">${data.order_id}</span></p>
                <p class="text-gray-700"><strong>Status:</strong> <span class="font-bold ${statusColors[data.current_status] || 'text-gray-600'}">${data.current_status}</span></p>
                <div class="mt-4 bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-600">
                        📍 Track your order carefully. Contact support if needed.
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching order status:", error);
        orderDetailsDiv.innerHTML = `
            <div class="text-center text-red-600">
                <p>❌ Order not found. Please check your Order ID.</p>
            </div>
        `;
    }
}
