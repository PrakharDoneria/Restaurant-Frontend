document.addEventListener("DOMContentLoaded", () => {
    fetchPizzas();
    updateCartCount();

    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", debounce((e) => {
            filterPizzas(e.target.value);
        }, 300));
    }
});

// Utility function for debouncing input events
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

let allPizzas = [];

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
        
        // Add visual feedback when count changes
        if (totalQuantity > 0) {
            cartCountElement.classList.add('scale-110');
            setTimeout(() => {
                cartCountElement.classList.remove('scale-110');
            }, 300);
        }
    }

    return totalQuantity;
}

async function fetchPizzas() {
    try {
        const response = await fetch("https://restaurant-backend-lime.vercel.app/api/user/pizzas");
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
            <div class="col-span-full text-center p-8">
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <i data-feather="alert-circle" class="text-red-500 mr-3"></i>
                        <p class="text-red-700">Unable to load pizzas. Please try again later.</p>
                    </div>
                    <button onclick="fetchPizzas()" class="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        `;
        // Initialize feather icons for the error message
        feather.replace();
    }
}

function displayPizzas(pizzas) {
    const pizzaList = document.getElementById("pizza-list");
    pizzaList.innerHTML = ""; // Clear previous entries

    if (!pizzas || pizzas.length === 0) {
        pizzaList.innerHTML = `
            <div class="col-span-full text-center p-8">
                <div class="flex flex-col items-center justify-center">
                    <img src="assets/empty-plate.svg" alt="No pizzas found" class="w-32 h-32 mb-4 opacity-60">
                    <p class="text-gray-600 text-lg">No pizzas found matching your search.</p>
                    ${
                        allPizzas.length > 0 
                        ? `<button onclick="displayPizzas(allPizzas)" class="mt-4 text-red-600 hover:text-red-800 font-medium">View All Pizzas</button>` 
                        : ''
                    }
                </div>
            </div>
        `;
        return;
    }

    // Create a placeholder for 'category_id' to 'category name' mapping
    // In a real app, you would fetch this from your API
    const categoryMap = {
        1: "Vegetarian",
        2: "Non-Vegetarian",
        3: "Specialty",
        4: "Vegan"
    };

    pizzas.forEach(pizza => {
        const categoryName = categoryMap[pizza.category_id] || `Category ${pizza.category_id}`;
        
        const pizzaItem = document.createElement("div");
        pizzaItem.classList.add(
            "pizza-item", 
            "bg-white", 
            "rounded-2xl", 
            "overflow-hidden", 
            "shadow-lg"
        );
        
        pizzaItem.innerHTML = `
            <div class="pizza-image-container">
                <img src="${pizza.image_url}" alt="${pizza.name}" class="pizza-image w-full h-64 object-cover">
            </div>
            <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                    <h2 class="text-xl font-bold text-gray-800">${pizza.name}</h2>
                    <span class="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">$${pizza.price.toFixed(2)}</span>
                </div>
                <p class="text-sm text-gray-500 mb-4">
                    <span class="inline-flex items-center">
                        <i data-feather="tag" class="w-3 h-3 mr-1"></i> 
                        ${categoryName}
                    </span>
                </p>
                <div class="flex mt-4">
                    <button 
                        onclick="addToCart('${pizza._id}', '${pizza.name}', ${pizza.price}, '${pizza.image_url}')" 
                        class="flex-1 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                        <i data-feather="shopping-cart" class="w-4 h-4 mr-2"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        pizzaList.appendChild(pizzaItem);
    });
    
    // Re-initialize feather icons for the newly added elements
    feather.replace();
}

function filterPizzas(query) {
    if (!query.trim()) {
        displayPizzas(allPizzas);
        return;
    }

    const filtered = allPizzas.filter(pizza => 
        pizza.name.toLowerCase().includes(query.toLowerCase())
    );
    
    displayPizzas(filtered);
}

function addToCart(id, name, price, imageUrl = '') {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1, imageUrl });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    updateCartCount();
    
    // Create toast notification with animation
    showToast(`${name} added to cart!`);
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
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
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-3 flex items-center toast-enter`;
    toast.innerHTML = `
        <i data-feather="${icon}" class="w-5 h-5 mr-2"></i>
        <div class="flex-1">${message}</div>
        <button class="ml-2 text-white" onclick="this.parentElement.remove()">
            <i data-feather="x" class="w-4 h-4"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    feather.replace();
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}