document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();
    fetchPizzas();

    document.getElementById("category").addEventListener("change", (e) => {
        filterPizzas(e.target.value);
    });
});

let allPizzas = [];

async function fetchCategories() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/categories");
        const data = await response.json();
        const categoryDropdown = document.getElementById("category");

        data.categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            categoryDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function fetchPizzas() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/user/pizzas");
        const data = await response.json();
        allPizzas = data.pizzas;
        displayPizzas(allPizzas);
    } catch (error) {
        console.error("Error fetching pizzas:", error);
    }
}

function displayPizzas(pizzas) {
    const pizzaList = document.getElementById("pizza-list");
    pizzaList.innerHTML = ""; // Clear previous entries

    pizzas.forEach(pizza => {
        const pizzaItem = document.createElement("div");
        pizzaItem.classList.add("pizza-item");
        pizzaItem.innerHTML = `
            <img src="${pizza.image_url}" alt="${pizza.name}">
            <h2>${pizza.name}</h2>
            <p>Category: ${pizza.category}</p>
            <p>Price: $${pizza.price.toFixed(2)}</p>
            <button onclick="addToCart('${pizza.id}', '${pizza.name}', ${pizza.price})">Add to Cart</button>
        `;
        pizzaList.appendChild(pizzaItem);
    });
}

function filterPizzas(category) {
    if (category === "all") {
        displayPizzas(allPizzas);
    } else {
        const filtered = allPizzas.filter(pizza => pizza.category === category);
        displayPizzas(filtered);
    }
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
    alert(`${name} added to cart!`);
}
