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
        const response = await fetch("https://https://restaurant-backend-lime.vercel.app/api/user/pizzas");
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
        pizzaItem.classList.add("pizza-item", "rounded-lg", "overflow-hidden");
        pizzaItem.innerHTML = `
            <img src="${pizza.image_url}" alt="${pizza.name}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h2 class="text-xl font-bold mb-2">${pizza.name}</h2>
                <p class="text-gray-600 mb-1">Category ID: ${pizza.category_id}</p>
                <p class="text-red-600 font-bold mb-4">Price: $${pizza.price.toFixed(2)}</p>
                <button 
                    onclick="addToCart('${pizza._id}', '${pizza.name}', ${pizza.price})" 
                    class="w-full py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                    Add to Cart
                </button>
            </div>
        `;
        pizzaList.appendChild(pizzaItem);
    });
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
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    toast.textContent = `${name} added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
