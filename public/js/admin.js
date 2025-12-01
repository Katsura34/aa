/**
 * QuickBite Admin Dashboard JavaScript
 * Connects to database via API
 */

// State variables
let menuItems = [];
let orders = [];
let users = [];
let currentTab = 'PENDING';

// DOM Elements
const adminInterface = document.getElementById('admin-interface');
const ordersReportBody = document.getElementById('orders-report-body');
const totalRevenueElement = document.getElementById('total-revenue');
const totalOrdersElement = document.getElementById('total-orders');
const topItemElement = document.getElementById('top-item');
const reportDateInput = document.getElementById('report-date');
const generateReportBtn = document.getElementById('generate-report-btn');
const noReportDataMsg = document.getElementById('no-report-data');
const ordersList = document.getElementById('orders-list');
const pendingTabButton = document.getElementById('pending-tab');
const completedTabButton = document.getElementById('completed-tab');
const noOrdersMessage = document.getElementById('no-orders-message');
const menuList = document.getElementById('menu-list');
const usersList = document.getElementById('users-list');
const noUsersMessage = document.getElementById('no-users-message');

// API Base URL
const API_BASE = '../api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleViewChangeAdmin);
    });

    // Setup report generation
    generateReportBtn.addEventListener('click', () => {
        fetchSalesReport(reportDateInput.value);
    });

    // Initial data fetch
    fetchMenuItems();
    fetchSalesReport(reportDateInput.value);
    fetchOrders();
    fetchUsers();
});

// --- API Functions ---

async function fetchMenuItems() {
    try {
        const response = await fetch(`${API_BASE}/get_menu.php`);
        const data = await response.json();
        if (data.success) {
            menuItems = data.data;
            renderMenu();
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE}/get_admin_orders.php`);
        const data = await response.json();
        if (data.success) {
            orders = data.data;
            renderOrders();
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function fetchSalesReport(date) {
    try {
        const response = await fetch(`${API_BASE}/get_sales_report.php?date=${date}`);
        const data = await response.json();
        if (data.success) {
            renderSalesReport(data);
        }
    } catch (error) {
        console.error('Error fetching sales report:', error);
    }
}

async function addMenuItem(itemData) {
    try {
        const response = await fetch(`${API_BASE}/add_menu_item.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Menu item added successfully!');
            fetchMenuItems();
            closeAddModal();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
    }
}

async function updateMenuItem(id, itemData) {
    try {
        const response = await fetch(`${API_BASE}/update_menu_item.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...itemData })
        });
        const data = await response.json();
        if (data.success) {
            alert('Menu item updated successfully!');
            fetchMenuItems();
            closeEditModal();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
    }
}

async function deleteMenuItem(id) {
    try {
        const response = await fetch(`${API_BASE}/delete_menu_item.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert('Menu item deleted successfully!');
            fetchMenuItems();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/update_order_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status })
        });
        const data = await response.json();
        if (data.success) {
            fetchOrders();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// --- User Management API Functions ---

async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE}/get_users.php`);
        const data = await response.json();
        if (data.success) {
            users = data.data;
            renderUsers();
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function addUserToDb(userData) {
    try {
        const response = await fetch(`${API_BASE}/add_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (data.success) {
            alert('User added successfully!');
            fetchUsers();
            closeAddUserModal();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

async function updateUserInDb(id, userData) {
    try {
        const response = await fetch(`${API_BASE}/update_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...userData })
        });
        const data = await response.json();
        if (data.success) {
            alert('User updated successfully!');
            fetchUsers();
            closeEditUserModal();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function deleteUserFromDb(id) {
    try {
        const response = await fetch(`${API_BASE}/delete_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            alert('User deleted successfully!');
            fetchUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// --- View Management ---

function handleViewChangeAdmin(e) {
    const newView = e.currentTarget.dataset.view;

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Update navigation link styles
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-blue-600', 'text-white');
        link.classList.add('text-gray-800', 'hover:bg-gray-100');
    });

    // Show the selected section and update active link
    document.getElementById(`${newView}-content`).classList.remove('hidden');
    e.currentTarget.classList.add('active', 'bg-blue-600', 'text-white');
    e.currentTarget.classList.remove('text-gray-800', 'hover:bg-gray-100');

    // Update Header
    const titleMap = { 
        'orders': 'Order Management', 
        'menu-management': 'Menu & Inventory', 
        'sales-report': 'Sales Report',
        'manage-users': 'Manage Users'
    };
    const subtitleMap = { 
        'orders': 'Manage incoming and completed orders.', 
        'menu-management': 'Manage food items, prices, and stock levels.', 
        'sales-report': 'Overview of daily sales, revenue, and top-performing items.',
        'manage-users': 'Add, edit, and manage user accounts.'
    };
    document.getElementById('content-title-admin').textContent = titleMap[newView];
    document.getElementById('content-subtitle-admin').textContent = subtitleMap[newView];

    // Render content specific to the view
    if (newView === 'sales-report') {
        fetchSalesReport(reportDateInput.value);
    } else if (newView === 'orders') {
        fetchOrders();
    } else if (newView === 'menu-management') {
        fetchMenuItems();
    } else if (newView === 'manage-users') {
        fetchUsers();
    }
}

// --- Sales Report Rendering ---

function renderSalesReport(data) {
    ordersReportBody.innerHTML = '';
    noReportDataMsg.classList.add('hidden');

    if (data.report) {
        totalRevenueElement.textContent = `₱${data.report.total_revenue.toFixed(2)}`;
        totalOrdersElement.textContent = data.report.total_orders;
        topItemElement.textContent = data.report.top_item || 'N/A';
    } else {
        totalRevenueElement.textContent = '₱0.00';
        totalOrdersElement.textContent = '0';
        topItemElement.textContent = 'N/A';
    }

    if (data.orders && data.orders.length > 0) {
        data.orders.forEach(order => {
            const statusClass = order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                 order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                                 'bg-yellow-100 text-yellow-700';

            const itemsText = order.items.map(item => `${item.name} x ${item.quantity}`).join(', ');

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition duration-100';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer_name}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title="${itemsText}">${itemsText}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800">₱${order.total_amount.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass} capitalize">
                        ${order.status}
                    </span>
                </td>
            `;
            ordersReportBody.appendChild(row);
        });
    } else {
        noReportDataMsg.classList.remove('hidden');
    }
}

// --- Order Management ---

function createOrderCard(order) {
    const isPending = order.status === 'PENDING';
    const statusColor = isPending ? 'text-red-500' : 'text-green-500';
    const statusBg = isPending ? 'bg-red-100' : 'bg-green-100';

    return `
        <div class="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg border-t-4 border-gray-100 transition duration-300 hover:shadow-xl hover:border-t-blue-500">
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-xl font-bold text-gray-700">Order #${order.id.slice(-4)}</h2>
                <span class="text-sm font-semibold px-3 py-1 rounded-full ${statusBg} ${statusColor} uppercase">
                    ${order.status}
                </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-600">
                <p>
                    <span class="font-medium text-gray-800">Customer:</span> ${order.student}
                </p>
                
                <div class="sm:col-span-2">
                    <span class="font-medium text-gray-800">Items:</span> ${order.items}
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end sm:items-center">
                <div class="mb-4 sm:mb-0">
                    <span class="text-lg font-medium text-gray-700">Total:</span>
                    <span class="text-3xl font-extrabold text-gray-800 ml-2">₱${order.amount.toFixed(2)}</span>
                </div>
            
                ${isPending ? `
                    <button onclick="markAsCompleted('${order.id}')" class="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 active:scale-95">
                        Mark as Completed
                    </button>
                ` : `
                    <p class="text-sm text-gray-500">Order successfully fulfilled.</p>
                `}
            </div>
        </div>
    `;
}

function renderOrders() {
    ordersList.innerHTML = '';
    const filteredOrders = orders.filter(order => order.status === currentTab);

    if (filteredOrders.length === 0) {
        noOrdersMessage.classList.remove('hidden');
    } else {
        noOrdersMessage.classList.add('hidden');
        filteredOrders.forEach(order => {
            ordersList.innerHTML += createOrderCard(order);
        });
    }
}

window.setActiveTab = function(status) {
    currentTab = status;

    pendingTabButton.classList.remove('active');
    completedTabButton.classList.remove('active');

    if (status === 'PENDING') {
        pendingTabButton.classList.add('active');
        pendingTabButton.classList.remove('hover:bg-gray-50');
        completedTabButton.classList.add('bg-white', 'hover:bg-gray-50');
    } else {
        completedTabButton.classList.add('active');
        completedTabButton.classList.remove('hover:bg-gray-50');
        pendingTabButton.classList.add('bg-white', 'hover:bg-gray-50');
    }

    renderOrders();
}

window.markAsCompleted = function(orderId) {
    updateOrderStatus(orderId, 'delivered');
}

// --- Menu Management ---

function renderMenu() {
    menuList.innerHTML = '';
   
    menuItems.forEach(item => {
        const formattedPrice = item.price ? parseFloat(item.price).toFixed(2) : '0.00';
        const description = item.description || 'No description available.';

        menuList.innerHTML += `
            <div class="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 transition duration-300 hover:shadow-xl">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                    <span class="text-lg font-extrabold text-blue-600">₱${formattedPrice}</span>
                </div>
                <p class="text-gray-600 mb-2">${description}</p>
                <p class="text-sm text-gray-500 mb-4">Category: ${item.category || 'Uncategorized'}</p>
                <div class="flex space-x-3">
                    <button onclick="editItem(${item.id})" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 active:scale-95">Edit</button>
                    <button onclick="deleteItem(${item.id})" class="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 active:scale-95">Delete</button>
                </div>
            </div>
        `;
    });
}

// Modal functions
window.openAddModal = function() { 
    document.getElementById('add-modal').classList.remove('hidden'); 
}

window.closeAddModal = function() { 
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-desc').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('add-modal').classList.add('hidden'); 
}

window.openEditModal = function() {
    document.getElementById('edit-modal').classList.remove('hidden');
}

window.closeEditModal = function() {
    document.getElementById('edit-item-id').value = '';
    document.getElementById('edit-item-name').value = '';
    document.getElementById('edit-item-price').value = '';
    document.getElementById('edit-item-desc').value = '';
    document.getElementById('edit-item-category').value = '';
    document.getElementById('edit-modal').classList.add('hidden');
}

// CRUD functions
window.addItem = function() {
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const description = document.getElementById('item-desc').value;
    const category = document.getElementById('item-category').value;

    if (!name || isNaN(price) || price < 0) {
        alert("Item Name and valid Price are required!");
        return;
    }

    addMenuItem({ name, price, description, category });
}

window.editItem = function(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-price').value = item.price;
    document.getElementById('edit-item-desc').value = item.description || '';
    document.getElementById('edit-item-category').value = item.category || '';
    
    openEditModal();
}

window.updateItem = function() {
    const id = parseInt(document.getElementById('edit-item-id').value);
    const name = document.getElementById('edit-item-name').value;
    const price = parseFloat(document.getElementById('edit-item-price').value);
    const description = document.getElementById('edit-item-desc').value;
    const category = document.getElementById('edit-item-category').value;

    if (!name || isNaN(price) || price < 0) {
        alert("Item Name and valid Price are required!");
        return;
    }

    updateMenuItem(id, { name, price, description, category });
}

window.deleteItem = function(id) {
    if (confirm("Are you sure you want to delete this menu item?")) {
        deleteMenuItem(id);
    }
}

// --- User Management Rendering and Functions ---

function renderUsers() {
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        noUsersMessage.classList.remove('hidden');
    } else {
        noUsersMessage.classList.add('hidden');
        users.forEach(user => {
            const roleClass = user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
            const createdDate = new Date(user.created_at).toLocaleDateString();
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition duration-100';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass} capitalize">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="editUser(${user.id})" class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Edit</button>
                    <button onclick="deleteUser(${user.id})" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Delete</button>
                </td>
            `;
            usersList.appendChild(row);
        });
    }
}

// User Modal Functions
window.openAddUserModal = function() {
    document.getElementById('add-user-modal').classList.remove('hidden');
}

window.closeAddUserModal = function() {
    document.getElementById('user-username').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = 'customer';
    document.getElementById('add-user-modal').classList.add('hidden');
}

window.openEditUserModal = function() {
    document.getElementById('edit-user-modal').classList.remove('hidden');
}

window.closeEditUserModal = function() {
    document.getElementById('edit-user-id').value = '';
    document.getElementById('edit-user-username').value = '';
    document.getElementById('edit-user-email').value = '';
    document.getElementById('edit-user-password').value = '';
    document.getElementById('edit-user-role').value = 'customer';
    document.getElementById('edit-user-modal').classList.add('hidden');
}

// User CRUD Functions
window.addUser = function() {
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    if (!username || !email || !password) {
        alert("Username, email, and password are required!");
        return;
    }

    addUserToDb({ username, email, password, role });
}

window.editUser = function(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-username').value = user.username;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-password').value = '';
    document.getElementById('edit-user-role').value = user.role;
    
    openEditUserModal();
}

window.updateUser = function() {
    const id = parseInt(document.getElementById('edit-user-id').value);
    const username = document.getElementById('edit-user-username').value;
    const email = document.getElementById('edit-user-email').value;
    const password = document.getElementById('edit-user-password').value;
    const role = document.getElementById('edit-user-role').value;

    if (!username || !email) {
        alert("Username and email are required!");
        return;
    }

    const userData = { username, email, role };
    if (password) {
        userData.password = password;
    }

    updateUserInDb(id, userData);
}

window.deleteUser = function(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        deleteUserFromDb(id);
    }
}
