/**
 * PizzaVerse Pizzas Page JavaScript
 * Version: 2.1
 * Last Updated: 2025-03-25 11:46:52
 * Author: PrakharDoneria
 */

// Global variables
let allPizzas = [];
let allCategories = [];
let currentFilter = {
    category: 'all',
    searchTerm: '',
    sortBy: 'default'
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("PizzaVerse Pizzas page initialized at: 2025-03-25 11:46:52");
    initializeUI();
    fetchCategories()
        .then(() => fetchPizzas())
        .catch(error => {
            console.error("Error during initialization:", error);
            showToast("Error initializing page. Please refresh.", "error");
        });

    // Setup event listeners
    setupEventListeners();
});

/**
 * Set up all event listeners for the page
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", debounce((e) => {
            currentFilter.searchTerm = e.target.value;
            filterAndSortPizzas();
        }, 300));
    }

    // Sort dropdown
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentFilter.sortBy = sortSelect.value;
            filterAndSortPizzas();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clear-filters");
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            resetFilters();
        });
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('py-2', 'shadow-lg');
                header.classList.remove('py-3', 'shadow-md');
            } else {
                header.classList.add('py-3', 'shadow-md');
                header.classList.remove('py-2', 'shadow-lg');
            }
            
            // Show/hide scroll to top button
            if (scrollToTopBtn) {
                if (window.scrollY > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            }
        });
    }
    
    // Scroll to top functionality
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Update cart count
    updateCartCount();
}

/**
 * Utility function for debouncing input events
 */
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Update the cart count in the header
 */
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

/**
 * Fetch categories from the API
 */
async function fetchCategories() {
    try {
        const response = await fetch("https://restaurant-backend-lime.vercel.app/api/admin/categories");
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.categories) {
            throw new Error("No categories found");
        }
        
        allCategories = data.categories;
        renderCategoryFilters();
        
        return allCategories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        // If we can't fetch categories, use default categories
        allCategories = [
            { id: "1", name: "Vegetarian", description: "Delicious veggie pizzas" },
            { id: "2", name: "Non-Vegetarian", description: "Pizzas with meat toppings" },
            { id: "3", name: "Specialty", description: "Our chef's special creations" },
            { id: "4", name: "Vegan", description: "100% plant-based pizzas" }
        ];
        renderCategoryFilters();
        
        return allCategories;
    }
}

/**
 * Render category filter pills
 */
function renderCategoryFilters() {
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (!categoryFiltersContainer) return;
    
    // Clear loading skeleton elements (except the "All" button)
    Array.from(categoryFiltersContainer.children).forEach(child => {
        if (child.classList.contains('skeleton') || (child.classList.contains('category-pill') && child.dataset.category !== 'all')) {
            categoryFiltersContainer.removeChild(child);
        }
    });
    
    // Add category pills
    allCategories.forEach(category => {
        const categoryPill = document.createElement('button');
        categoryPill.classList.add(
            'category-pill',
            'px-4',
            'py-2',
            'rounded-full',
            'bg-gray-200',
            'text-gray-700',
            'shadow-md',
            'hover:shadow-lg',
            'transition'
        );
        categoryPill.dataset.category = category.id;
        categoryPill.textContent = category.name;
        
        // Add click event
        categoryPill.addEventListener('click', () => {
            // Update active state visually
            document.querySelectorAll('.category-pill').forEach(pill => {
                pill.classList.remove('active', 'bg-red-600', 'text-white');
                pill.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            categoryPill.classList.add('active', 'bg-red-600', 'text-white');
            categoryPill.classList.remove('bg-gray-200', 'text-gray-700');
            
            // Apply filter
            currentFilter.category = category.id;
            filterAndSortPizzas();
            
            // Add pulse animation
            categoryPill.classList.add('animate-pulse');
            setTimeout(() => {
                categoryPill.classList.remove('animate-pulse');
            }, 1000);
        });
        
        categoryFiltersContainer.appendChild(categoryPill);
    });
    
    // Ensure "All" button is properly styled
    const allButton = document.querySelector('.category-pill[data-category="all"]');
    if (allButton) {
        allButton.addEventListener('click', () => {
            // Update active state visually
            document.querySelectorAll('.category-pill').forEach(pill => {
                pill.classList.remove('active', 'bg-red-600', 'text-white');
                pill.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            allButton.classList.add('active', 'bg-red-600', 'text-white');
            allButton.classList.remove('bg-gray-200', 'text-gray-700');
            
            // Apply filter
            currentFilter.category = 'all';
            filterAndSortPizzas();
        });
    }
}

/**
 * Fetch pizzas from the API
 */
async function fetchPizzas() {
    try {
        // Keep the loading skeletons visible
        const pizzaList = document.getElementById("pizza-list");
        if (!pizzaList) return;
        
        const response = await fetch("https://restaurant-backend-lime.vercel.app/api/user/pizzas");
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data.pizzas || data.pizzas.length === 0) {
            throw new Error("No pizzas found");
        }

        allPizzas = data.pizzas;
        filterAndSortPizzas();
        
        return allPizzas;
    } catch (error) {
        console.error("Error fetching pizzas:", error);
        const pizzaList = document.getElementById("pizza-list");
        if (pizzaList) {
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
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
        
        // Hide no results message
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.classList.add('hidden');
        }
        
        throw error;
    }
}

/**
 * Apply filtering and sorting to pizzas and update display
 */
function filterAndSortPizzas() {
    // Filter by category
    let filteredPizzas = allPizzas;
    
    if (currentFilter.category !== 'all') {
        filteredPizzas = filteredPizzas.filter(pizza => 
            pizza.category_id.toString() === currentFilter.category
        );
    }
    
    // Filter by search term
    if (currentFilter.searchTerm.trim()) {
        const searchTerm = currentFilter.searchTerm.toLowerCase().trim();
        filteredPizzas = filteredPizzas.filter(pizza => 
            pizza.name.toLowerCase().includes(searchTerm) ||
            getCategoryName(pizza.category_id).toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort pizzas
    filteredPizzas = sortPizzas(filteredPizzas, currentFilter.sortBy);
    
    // Update results count
    updateResultsCount(filteredPizzas.length);
    
    // Display pizzas or no results message
    if (filteredPizzas.length === 0) {
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
        displayPizzas(filteredPizzas);
    }
}

/**
 * Sort pizzas based on the selected sort option
 */
function sortPizzas(pizzas, sortOption) {
    const pizzasCopy = [...pizzas]; // Make a copy to avoid mutating the original
    
    switch (sortOption) {
        case 'price-low':
            return pizzasCopy.sort((a, b) => a.price - b.price);
        case 'price-high':
            return pizzasCopy.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return pizzasCopy.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return pizzasCopy.sort((a, b) => b.name.localeCompare(a.name));
        default:
            // Default sorting (could be by featured or popularity)
            return pizzasCopy;
    }
}

/**
 * Update the results count text
 */
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;
    
    let text = '';
    if (count === 0) {
        text = 'No pizzas found';
    } else if (count === 1) {
        text = 'Showing 1 pizza';
    } else if (count === allPizzas.length) {
        text = `Showing all ${count} pizzas`;
    } else {
        text = `Showing ${count} of ${allPizzas.length} pizzas`;
    }
    
    // Add filter information
    if (currentFilter.category !== 'all') {
        const categoryName = getCategoryNameById(currentFilter.category);
        text += ` in "${categoryName}"`;
    }
    
    if (currentFilter.searchTerm) {
        text += ` matching "${currentFilter.searchTerm}"`;
    }
    
    resultsCount.textContent = text;
}

/**
 * Show the no results message
 */
function showNoResultsMessage() {
    const noResults = document.getElementById('no-results');
    const pizzaList = document.getElementById('pizza-list');
    
    if (noResults) {
        noResults.classList.remove('hidden');
    }
    
    if (pizzaList) {
        pizzaList.innerHTML = ''; // Clear the pizza list
    }
}

/**
 * Hide the no results message
 */
function hideNoResultsMessage() {
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.classList.add('hidden');
    }
}

/**
 * Reset all filters and show all pizzas
 */
function resetFilters() {
    // Reset filter state
    currentFilter = {
        category: 'all',
        searchTerm: '',
        sortBy: 'default'
    };
    
    // Reset search input
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset sort dropdown
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    // Reset category buttons
    document.querySelectorAll('.category-pill').forEach(button => {
        button.classList.remove('active', 'bg-red-600', 'text-white');
        button.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const allButton = document.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active', 'bg-red-600', 'text-white');
        allButton.classList.remove('bg-gray-200', 'text-gray-700');
    }
    
    // Show all pizzas
    filterAndSortPizzas();
    
    // Show toast
    showToast('Filters cleared', 'info');
}

/**
 * Get the name of a category by its ID from the allCategories array
 * @param {string} id - Category ID
 * @returns {string} - Category name
 */
function getCategoryNameById(id) {
    const category = allCategories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown';
}

/**
 * Maps internal category_id to display names (used for legacy IDs)
 * @param {number|string} categoryId - The category ID
 * @returns {string} - The display name for the category
 */
function getCategoryName(categoryId) {
    // First try to map from our fetched categories
    const category = allCategories.find(cat => cat.id.toString() === categoryId.toString());
    if (category) {
        return category.name;
    }
    
    // Fallback to hardcoded map
    const categories = {
        1: 'Vegetarian',
        2: 'Non-Vegetarian',
        3: 'Specialty',
        4: 'Vegan'
    };
    
    return categories[categoryId] || 'Unknown';
}

/**
 * Display pizzas in the UI
 * @param {Array} pizzas - Array of pizza objects to display
 */
function displayPizzas(pizzas) {
    const pizzaList = document.getElementById("pizza-list");
    if (!pizzaList) return;
    
    pizzaList.innerHTML = ""; // Clear previous entries

    if (!pizzas || pizzas.length === 0) {
        showNoResultsMessage();
        return;
    }

    // Add pizzas with staggered animation
    pizzas.forEach((pizza, index) => {
        setTimeout(() => {
            const categoryName = getCategoryName(pizza.category_id);
            
            const pizzaItem = document.createElement("div");
            pizzaItem.classList.add(
                "pizza-item", 
                "bg-white", 
                "rounded-2xl", 
                "overflow-hidden", 
                "shadow-lg",
                "opacity-0", // Start with opacity 0 for animation
                "transform",
                "translate-y-4" // Start slightly below final position
            );
            
            // Determine if this pizza is "new" (for demonstration)
            const isNew = Math.random() > 0.7; // 30% chance of being "new"
            
            // Create a dynamic badge based on category
            let categoryBadgeColor = 'bg-gray-100 text-gray-800';
            if (pizza.category_id == 1) { // Vegetarian
                categoryBadgeColor = 'bg-green-100 text-green-800';
            } else if (pizza.category_id == 2) { // Non-Vegetarian
                categoryBadgeColor = 'bg-red-100 text-red-800';
            } else if (pizza.category_id == 3) { // Specialty
                categoryBadgeColor = 'bg-purple-100 text-purple-800';
            } else if (pizza.category_id == 4) { // Vegan
                categoryBadgeColor = 'bg-emerald-100 text-emerald-800';
            }
            
            pizzaItem.innerHTML = `
                <div class="pizza-image-container relative">
                    <img src="${pizza.image_url}" alt="${pizza.name}" 
                        class="pizza-image w-full h-64 object-cover" 
                        onerror="this.src='assets/pizza-placeholder.jpg';this.onerror='';">
                    
                    ${isNew ? `
                    <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs shadow-md transform rotate-3">
                        New
                    </div>
                    ` : ''}
                    
                    <div class="category-badge ${categoryBadgeColor}">
                        ${categoryName}
                    </div>
                </div>
                <div class="p-5">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-xl font-bold text-gray-800">${pizza.name}</h2>
                        <span class="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">$${pizza.price.toFixed(2)}</span>
                    </div>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-2">
                        ${pizza.description || 'A delicious pizza made with the finest ingredients.'}
                    </p>
                    <div class="flex mt-4">
                        <button 
                            onclick="addToCart('${pizza._id}', '${pizza.name}', ${pizza.price}, '${pizza.image_url}')" 
                            class="flex-1 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
                            aria-label="Add ${pizza.name} to cart"
                        >
                            <i data-feather="shopping-cart" class="w-4 h-4 mr-2"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
            
            pizzaList.appendChild(pizzaItem);
            
            // Animate the pizza card appearing
            setTimeout(() => {
                pizzaItem.classList.remove("opacity-0", "translate-y-4");
                pizzaItem.classList.add("transition-all", "duration-500", "ease-out");
            }, 50);
            
            // Re-initialize feather icons for the newly added elements
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, index * 100); // Stagger each pizza by 100ms
    });
}

/**
 * Add a pizza to the cart
 * @param {string} id - Pizza ID
 * @param {string} name - Pizza name
 * @param {number} price - Pizza price
 * @param {string} imageUrl - Pizza image URL
 */
function addToCart(id, name, price, imageUrl = '') {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === id);

    // Add animation to the cart icon
    const cartIcon = document.querySelector('.nav-link [data-feather="shopping-cart"]');
    if (cartIcon) {
        cartIcon.classList.add('text-red-500');
        setTimeout(() => {
            cartIcon.classList.remove('text-red-500');
        }, 500);
    }

    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Added another ${name} to cart!`, 'success');
    } else {
        cart.push({ 
            id, 
            name, 
            price, 
            quantity: 1, 
            imageUrl,
            addedAt: new Date().toISOString(),
            addedBy: 'PrakharDoneria'  // Current user
        });
        showToast(`${name} added to cart!`, 'success');
    }

    // Save to local storage
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
}

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const newToastContainer = document.createElement('div');
        newToastContainer.id = 'toast-container';
        newToastContainer.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(newToastContainer);
        toastContainer = newToastContainer;
    }
    
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
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-3 flex items-center transform translate-x-full`;
    toast.style.transition = 'all 0.3s ease-out';
    
    toast.innerHTML = `
        <i data-feather="${icon}" class="w-5 h-5 mr-2"></i>
        <div class="flex-1">${message}</div>
        <button class="ml-2 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
            <i data-feather="x" class="w-4 h-4"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize feather icons if available
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add event listener for custom events
window.addEventListener('storage', (event) => {
    if (event.key === 'cart') {
        updateCartCount();
    }
});

// Log user activity (for demonstration purposes)
console.log(`Session started by PrakharDoneria at 2025-03-25 11:46:52 UTC`);