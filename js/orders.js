async function fetchOrderStatus() {
    const orderId = document.getElementById("order-id").value.trim();
    const orderDetailsDiv = document.getElementById("order-details");

    if (!orderId) {
        alert("Please enter an order ID.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/orders");
        const data = await response.json();

        const order = data.orders.find(order => order.order_id === orderId);

        if (order) {
            orderDetailsDiv.innerHTML = `
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${order.order_id}</p>
                <p><strong>Customer:</strong> ${order.name}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Total Price:</strong> $${order.total_price.toFixed(2)}</p>
            `;
        } else {
            orderDetailsDiv.innerHTML = "<p>Order not found. Please check your Order ID.</p>";
        }
    } catch (error) {
        console.error("Error fetching order status:", error);
        orderDetailsDiv.innerHTML = "<p>Failed to fetch order status. Try again later.</p>";
    }
}
