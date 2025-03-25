document.addEventListener("DOMContentLoaded", () => {
    fetchPizzas();
    updateCartCount();

    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            filterPizzas(e.target.value);
        });
    }
});

let allPizzas = [];

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
    }

    return totalQuantity;
}

async function fetchPizzas() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/user/pizzas");
        const data = await response.json();

        if (!data.pizzas || data.pizzas.length === 0) {
            throw new Error("No pizzas found");
        }

        allPizzas = data.pizzas;
        displayPizzas(allPizzas);
    } catch (error) {
        console.error("Error fetching pizzas:", error);
        const pizzaList = document.getElementById("pizza-list");
        pizzaList.innerHTML = `
            <div class="col-span-full text-center text-red-600">
                <p>Unable to load pizzas. Please try again later.</p>
                <button onclick="fetchPizzas()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Retry
                </button>
            </div>
        `;
    }
}

function displayPizzas(pizzas) {
    const pizzaList = document.getElementById("pizza-list");
    pizzaList.innerHTML = ""; // Clear previous entries

    if (!pizzas || pizzas.length === 0) {
        pizzaList.innerHTML = `
            <div class="col-span-full text-center text-gray-600">
                <p>No pizzas found.</p>
            </div>
        `;
        return;
    }

    pizzas.forEach(pizza => {
        const pizzaItem = document.createElement("div");
        pizzaItem.classList.add(
            "pizza-item", 
            "bg-white", 
            "rounded-lg", 
            "overflow-hidden", 
            "transform", 
            "transition", 
            "duration-300", 
            "hover:scale-105", 
            "shadow-lg", 
            "hover:shadow-2xl"
        );
        pizzaItem.innerHTML = `
            <div class="relative">
                <img 
                    src="${pizza.image_url}" 
                    alt="${pizza.name}" 
                    class="w-full h-64 object-cover transition duration-300 transform hover:scale-110"
                >
                <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    New
                </div>
            </div>
            <div class="p-4">
                <h2 class="text-xl font-bold mb-2 text-blue-800">${pizza.name}</h2>
                <p class="text-gray-600 mb-1 truncate">Category: ${getCategoryName(pizza.category_id)}</p>
                <p class="text-red-600 font-bold mb-4">Price: $${pizza.price.toFixed(2)}</p>
                <button 
                    onclick="addToCart('${pizza._id}', '${pizza.name}', ${pizza.price})" 
                    class="w-full py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transition transform hover:scale-105"
                >
                    Add to Cart
                </button>
            </div>
        `;
        pizzaList.appendChild(pizzaItem);
    });
}

function getCategoryName(categoryId) {
    // Placeholder function - replace with actual category mapping
    const categories = {
        1: 'Classic',
        2: 'Vegetarian',
        3: 'Premium',
        4: 'Specialty'
    };
    return categories[categoryId] || 'Unknown';
}

function filterPizzas(query) {
    if (!query.trim()) {
        displayPizzas(allPizzas);
        return;
    }

    const filtered = allPizzas.filter(pizza => 
        pizza.name.toLowerCase().includes(query.toLowerCase()) ||
        getCategoryName(pizza.category_id).toLowerCase().includes(query.toLowerCase())
    );
    
    displayPizzas(filtered);
}

function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    updateCartCount();
    
    showToast(`${name} added to cart!`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fadeOut');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}