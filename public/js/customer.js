/**
 * QuickBite Customer Dashboard JavaScript
 * Connects to database via API
 */

// State variables
let menuItems = [];
let currentCart = [];
let ordersHistory = [];

// API Base URL
const API_BASE = '../api';

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const categoryFilters = document.querySelectorAll('.category-filter');
const menuItemsGrid = document.getElementById('menu-items-grid');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalElement = document.getElementById('cart-total');
const cartCountBadge = document.getElementById('cart-count-badge');
const checkoutButton = document.getElementById('checkout-button');
const ordersListElement = document.getElementById('orders-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    navLinks.forEach(link => {
        link.addEventListener('click', handleViewChange);
    });
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', handleFilterMenu);
    });

    checkoutButton.addEventListener('click', handleCheckout);

    // Fetch initial data
    fetchMenuItems();
    fetchOrders();
});

// --- API Functions ---

async function fetchMenuItems() {
    try {
        const response = await fetch(`${API_BASE}/get_menu.php`);
        const data = await response.json();
        if (data.success) {
            menuItems = data.data;
            renderMenu(menuItems);
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
        menuItemsGrid.innerHTML = '<p class="col-span-full text-center text-red-500 p-8">Error loading menu. Please try again.</p>';
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE}/get_orders.php`);
        const data = await response.json();
        if (data.success) {
            ordersHistory = data.data;
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function placeOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE}/place_order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, message: 'Network error' };
    }
}

// --- View Management ---

function handleViewChange(e) {
    const newView = e.currentTarget.dataset.view;

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Update navigation link styles
    navLinks.forEach(link => {
        link.classList.remove('active', 'bg-blue-600', 'text-white');
        link.classList.add('text-gray-800', 'hover:bg-gray-100');
    });

    // Show the selected section and update active link
    document.getElementById(`${newView}-content`).classList.remove('hidden');
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white');
    e.currentTarget.classList.remove('text-gray-800', 'hover:bg-gray-100');

    // Update Header
    const titleMap = { 'menu': 'Today\'s Menu', 'cart': 'Your Current Order', 'orders': 'My Orders' };
    const subtitleMap = { 'menu': 'Fresh food prepared daily for our customers.', 'cart': 'Review and finalize your items before checkout.', 'orders': 'View your past and pending orders.' };
    document.getElementById('content-title').textContent = titleMap[newView];
    document.getElementById('content-subtitle').textContent = subtitleMap[newView];

    // Render content specific to the view
    if (newView === 'cart') {
        renderCart();
    } else if (newView === 'orders') {
        fetchOrders().then(() => renderOrders());
    } else if (newView === 'menu') {
        const activeFilter = document.querySelector('.category-filter.active');
        if (activeFilter) {
            handleFilterMenu({ currentTarget: activeFilter });
        } else {
            renderMenu(menuItems);
        }
    }
}

// --- Menu Rendering ---

function renderMenu(items) {
    menuItemsGrid.innerHTML = '';
    if (items.length === 0) {
        menuItemsGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 p-8">No items found in this category.</p>';
        return;
    }

    items.forEach(item => {
        // Generate image URL based on item name
        const imageName = item.name.toLowerCase().replace(/\s+/g, '_');
        const imageUrl = `../public/images/${imageName}.jpg`;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition duration-300 hover:shadow-xl';
        itemElement.innerHTML = `
            <div class="h-40 overflow-hidden bg-gray-200">
                <img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover rounded-t-xl transition duration-500 hover:scale-105" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-4xl\\'>🍽️</div>'">
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${item.name}</h3>
                <p class="text-sm text-gray-500 mb-3 flex-grow">${item.description || 'Delicious food item'}</p>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span class="text-xl font-bold text-green-600">₱${parseFloat(item.price).toFixed(2)}</span>
                    <button data-id="${item.id}" class="add-to-cart-btn flex items-center bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition duration-150 shadow-md">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add
                    </button>
                </div>
            </div>
        `;
        menuItemsGrid.appendChild(itemElement);
    });

    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => handleAddToCart(e.currentTarget.dataset.id));
    });
}

function handleFilterMenu(e) {
    const filterText = e.currentTarget.dataset.category || e.currentTarget.textContent.trim();
    
    // Update filter button styles
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-700', 'border');
    });
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-md');
    e.currentTarget.classList.remove('bg-white', 'text-gray-700', 'border');

    let filteredItems = menuItems;
    if (filterText !== 'All Items') {
        filteredItems = menuItems.filter(item => item.category === filterText);
    }
    renderMenu(filteredItems);
}

// --- Cart Functions ---

function handleAddToCart(itemId) {
    const item = menuItems.find(i => i.id === parseInt(itemId));
    if (!item) return;

    const existingItem = currentCart.find(c => c.menu_item_id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentCart.push({
            menu_item_id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1
        });
    }
    
    updateCartBadge();
    
    // Show feedback
    const btn = document.querySelector(`[data-id="${itemId}"]`);
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Added!';
    btn.classList.remove('bg-blue-500');
    btn.classList.add('bg-green-500');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-green-500');
        btn.classList.add('bg-blue-500');
    }, 1000);
}

function updateCartBadge() {
    const count = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = count;
    if (count > 0) {
        cartCountBadge.classList.remove('hidden');
    } else {
        cartCountBadge.classList.add('hidden');
    }
}

function renderCart() {
    cartItemsList.innerHTML = '';
    let total = 0;

    if (currentCart.length === 0) {
        cartItemsList.innerHTML = '<p class="text-center text-gray-500 p-4">Your cart is empty. Start adding some delicious items!</p>';
        cartTotalElement.textContent = '₱0.00';
        updateCartBadge(); 
        checkoutButton.disabled = true;
        return;
    }

    currentCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        cartItem.innerHTML = `
            <div class="flex-1 min-w-0 mr-4">
                <p class="font-medium text-gray-800">${item.name}</p>
                <p class="text-sm text-gray-500">₱${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button data-id="${item.menu_item_id}" data-action="decrease" class="update-cart-btn text-gray-600 hover:text-red-500 p-1 rounded-full bg-white border">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                </button>
                <span class="font-bold text-gray-800 w-8 text-center">${item.quantity}</span>
                <button data-id="${item.menu_item_id}" data-action="increase" class="update-cart-btn text-gray-600 hover:text-green-500 p-1 rounded-full bg-white border">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <button data-id="${item.menu_item_id}" data-action="remove" class="update-cart-btn text-red-500 hover:text-red-700 p-1 rounded-full ml-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        cartItemsList.appendChild(cartItem);
    });

    cartTotalElement.textContent = `₱${total.toFixed(2)}`;
    updateCartBadge();
    checkoutButton.disabled = false;

    document.querySelectorAll('.update-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => handleUpdateCart(e.currentTarget.dataset.id, e.currentTarget.dataset.action));
    });
}

function handleUpdateCart(itemId, action) {
    const id = parseInt(itemId);
    const cartIndex = currentCart.findIndex(item => item.menu_item_id === id);

    if (cartIndex === -1) return;

    if (action === 'increase') {
        currentCart[cartIndex].quantity += 1;
    } else if (action === 'decrease') {
        currentCart[cartIndex].quantity -= 1;
        if (currentCart[cartIndex].quantity <= 0) {
            currentCart.splice(cartIndex, 1); 
        }
    } else if (action === 'remove') {
        currentCart.splice(cartIndex, 1);
    }

    renderCart();
}

async function handleCheckout() {
    if (currentCart.length === 0) return;

    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   
    const orderData = {
        items: currentCart,
        total: total,
        delivery_address: ''
    };

    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Processing...';

    const result = await placeOrder(orderData);

    if (result.success) {
        // Add to local history
        ordersHistory.unshift({
            id: result.order_id,
            date: new Date().toISOString(),
            status: 'pending',
            total: total,
            items: currentCart.map(item => ({ name: item.name, quantity: item.quantity }))
        });

        // Clear cart
        currentCart = [];
        updateCartBadge();

        alert('Order Placed Successfully! Your order is pending confirmation.');

        // Navigate to orders
        document.querySelector('[data-view="orders"]').click();
    } else {
        alert('Error placing order: ' + result.message);
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Place Order';
    }
}

// --- Orders Rendering ---

function renderOrders() {
    ordersListElement.innerHTML = '';
    if (ordersHistory.length === 0) {
        ordersListElement.innerHTML = '<p class="text-center text-gray-500 p-8">You have no previous orders.</p>';
        return;
    }

    ordersHistory.forEach(order => {
        const statusClass = order.status === 'ready' ? 'bg-green-100 text-green-700' :
                             order.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                             'bg-yellow-100 text-yellow-700';

        const itemsList = order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('');

        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500';
        orderElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Order #${order.id}</h3>
                    <p class="text-sm text-gray-500">Ordered on: ${new Date(order.date).toLocaleString()}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusClass} uppercase">
                    ${order.status}
                </span>
            </div>
            
            <div class="flex justify-between items-end border-t border-gray-100 pt-4">
                <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">Items:</p>
                    <ul class="text-sm text-gray-500 list-disc list-inside space-y-0.5">
                        ${itemsList}
                    </ul>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold text-gray-800">Total: ₱${parseFloat(order.total).toFixed(2)}</p>
                </div>
            </div>
        `;
        ordersListElement.appendChild(orderElement);
    });
}
