// Main JS file for index.html (Menu page)
document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display menu items
    fetchMenu();
    
    // Setup cart in localStorage if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Display cart items count
    updateCartBadge();
});

// Function to fetch menu items from API
async function fetchMenu() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/menu');
        if (!response.ok) {
            throw new Error('Failed to fetch menu');
        }
        
        const menuItems = await response.json();
        displayMenu(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        document.getElementById('menu-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load menu. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display menu items on the page
function displayMenu(menuItems) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';
    
    // Group menu items by category
    const categories = {};
    menuItems.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });
    
    // Create section for each category
    for (const category in categories) {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        
        categorySection.innerHTML = `
            <h2 class="category-title">${category}</h2>
            <div class="pizza-grid"></div>
        `;
        
        const pizzaGrid = categorySection.querySelector('.pizza-grid');
        
        // Add items to category
        categories[category].forEach(pizza => {
            const pizzaCard = document.createElement('div');
            pizzaCard.className = 'pizza-card';
            pizzaCard.innerHTML = `
                <div class="pizza-image">
                    <img src="${pizza.image_url || 'img/default-pizza.jpg'}" alt="${pizza.name}">
                </div>
                <div class="pizza-details">
                    <h3 class="pizza-name">${pizza.name}</h3>
                    <p class="pizza-description">${pizza.description || ''}</p>
                    <div class="pizza-price-action">
                        <span class="pizza-price">$${pizza.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn" data-id="${pizza.id}" data-name="${pizza.name}" data-price="${pizza.price}">Add to Cart</button>
                    </div>
                </div>
            `;
            
            pizzaGrid.appendChild(pizzaCard);
        });
        
        menuContainer.appendChild(categorySection);
    }
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Function to add item to cart
function addToCart(event) {
    const button = event.currentTarget;
    const pizzaId = parseInt(button.getAttribute('data-id'));
    const pizzaName = button.getAttribute('data-name');
    const pizzaPrice = parseFloat(button.getAttribute('data-price'));
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.pizza_id === pizzaId);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            pizza_id: pizzaId,
            pizza_name: pizzaName,
            price: pizzaPrice,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Show confirmation toast
    showToast(`Added ${pizzaName} to cart!`);
}

// Function to update cart item count badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Function to display toast message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}