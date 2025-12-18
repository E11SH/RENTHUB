let currentUserType = 'seeker';
let currentPage = 'home';
let selectedProperty = null;
// This var is for the new payment JS
let currentPaymentMethod = 'card';

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    window.scrollTo(0, 0);
}

// User Type Selection
function selectUserType(type, context) {
    currentUserType = type;
    const buttons = document.querySelectorAll(`#${context} .user-type-btn`);
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.user-type-btn').classList.add('active');
}

// Feature cards animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

// Check Login Status on Load
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        currentUserType = user.type;
        updateAuthUI(user);
    }
}

// Update Auth UI
function updateAuthUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const postBtn = document.getElementById('post-btn');

    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        loginBtn.textContent = `Welcome, ${user.name}`; // Optional: Show name somewhere else if preferred

        if (user.type === 'advertiser') {
            postBtn.style.display = 'inline-block';
        } else {
            postBtn.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        postBtn.style.display = 'none';
        loginBtn.textContent = 'Login';
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.reload(); // Simple way to reset state
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            updateAuthUI(data.user);
            alert(`Login successful!\nWelcome ${data.user.name}`);
            currentUserType = data.user.type;
            showPage('properties');
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

// Modal Functions
function showPostModal() {
    document.getElementById('post-modal').style.display = 'flex';
}

function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
}

// Handle Post Property
async function handlePostProperty() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.type !== 'advertiser') {
        alert('Unauthorized');
        return;
    }

    const property = {
        title: document.getElementById('post-title').value,
        location: document.getElementById('post-location').value,
        price: Number(document.getElementById('post-price').value),
        area: Number(document.getElementById('post-area').value),
        bedrooms: Number(document.getElementById('post-bedrooms').value),
        bathrooms: Number(document.getElementById('post-bathrooms').value),
        type: document.getElementById('post-type').value,
        image: document.getElementById('post-image').value,
        description: document.getElementById('post-description').value,
        owner: user._id
    };

    if (!property.title || !property.price || !property.location) {
        alert('Please fill in required fields');
        return;
    }

    try {
        const response = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(property)
        });

        if (response.ok) {
            alert('Property Posted Successfully!');
            closePostModal();
            fetchProperties(); // Refresh list
        } else {
            alert('Failed to post property');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error posting property');
    }
}

// Handle Registration
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password,
                type: currentUserType // Use the selected type from UI
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            showPage('login');
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
}

// Rent Property
function rentProperty(id, propertyName, monthlyRent) {
    const deposit = monthlyRent * 2;
    const fee = 500; // Fixed fee in EGP
    const total = monthlyRent + deposit + fee;

    selectedProperty = {
        id: id,
        name: propertyName,
        rent: monthlyRent,
        deposit: deposit,
        fee: fee,
        total: total
    };

    // Populate the new summary fields
    document.getElementById('summary-property').textContent = propertyName;
    document.getElementById('summary-rent').textContent = `EGP ${monthlyRent}`;
    document.getElementById('summary-deposit').textContent = `EGP ${deposit}`;
    document.getElementById('summary-fee').textContent = `EGP ${fee}`;
    document.getElementById('summary-total').textContent = `EGP ${total}`;

    // Update the dynamic fields in the payment forms
    document.getElementById('cash-total').textContent = `EGP ${total}`;
    document.querySelector('.submit-btn[onclick="processCardPayment()"]').textContent = `Pay EGP ${total}`;

    showPage('payment');
}

// View Property Details
function viewPropertyDetails(property) {
    document.getElementById('detail-image').src = '/' + property.image;
    document.getElementById('detail-title').textContent = property.title;
    document.getElementById('detail-location').textContent = `📍 ${property.location}`;
    document.getElementById('detail-price').textContent = `EGP ${property.price}/month`;

    document.getElementById('detail-bedrooms').textContent = property.bedrooms;
    document.getElementById('detail-bathrooms').textContent = property.bathrooms;
    document.getElementById('detail-area').textContent = property.area;
    document.getElementById('detail-type').textContent = property.type;

    document.getElementById('detail-description').textContent = property.description;

    // Set Rent Button
    const rentBtn = document.getElementById('detail-rent-btn');
    rentBtn.onclick = () => rentProperty(property._id, property.title, property.price);

    showPage('property-details-page');
}

// Render Properties
function renderProperties(properties) {
    const container = document.querySelector('.properties-grid');
    if (!container) return;

    window.allProperties = properties; // Store for easy access if needed

    container.innerHTML = properties.map((property, index) => `
        <div class="property-card" style="opacity: 1; transform: translateY(0); cursor: pointer;" onclick="window.allProperties.forEach(p => { if(p._id === '${property._id}') viewPropertyDetails(p); })">
            <div class="property-image">
                <img src="/${property.image}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">📍 ${property.location}</div>
                <div class="property-details">
                    <span class="property-detail">🛏️ ${property.bedrooms} Bed</span>
                    <span class="property-detail">🚿 ${property.bathrooms} Bath</span>
                    <span class="property-detail">📐 ${property.area} m²</span>
                </div>
                <div class="property-price">EGP ${property.price}/mon</div>
                <button class="rent-btn" onclick="event.stopPropagation(); rentProperty('${property._id}', '${property.title}', ${property.price})">Rent Now</button>
            </div>
        </div>
    `).join('');
}


/* ========================================
NEW PAYMENT JS (FROM HELLO.HTML)
========================================
*/

// Select Payment Method
function selectPaymentMethod(event, method) {
    currentPaymentMethod = method;

    // Update button states
    document.querySelectorAll('#payment .method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.method-btn').classList.add('active');

    // Show/hide payment forms
    document.querySelectorAll('#payment .payment-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(method + '-payment').classList.add('active');
}

// Card Number Formatting
document.getElementById('card-number').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;

    // Update preview
    document.getElementById('preview-number').textContent =
        formattedValue || '•••• •••• •••• ••••';
});

// Cardholder Name Update
document.getElementById('card-name').addEventListener('input', function (e) {
    document.getElementById('preview-name').textContent =
        e.target.value.toUpperCase() || 'YOUR NAME';
});

// Expiry Date Formatting
document.getElementById('card-expiry').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;

    // Update preview
    document.getElementById('preview-expiry').textContent =
        value || 'MM/YY';
});

// CVV - numbers only
document.getElementById('card-cvv').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Process Card Payment (MODIFIED FOR DYNAMIC DATA)
async function processCardPayment() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Please login to complete booking');
        return;
    }

    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;

    // Validation
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        alert('Please fill in all card details');
        return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) { // Allow 16-19
        alert('Please enter a valid card number');
        return;
    }

    if (cardCvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return;
    }

    const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token not found. Please login again.');
            showPage('login');
            return;
        }

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyId: selectedProperty.id,
                paymentMethod: 'card',
                totalAmount: selectedProperty.total,
                transactionId: transactionId
            })
        });

        // Wait, I need to check handleLogin again. 
        // If the token is not stored, I cannot authenticate!
        // I will temporarily pause this thought to verify handleLogin modification necessity.
        // Re-reading script.js line 87-95:
        // const data = await response.json();
        // if (response.ok) {
        //     localStorage.setItem('currentUser', JSON.stringify(data.user));
        // }
        // The token is in `data.token` but it is NOT stored.
        // Therefore, I MUST modify handleLogin as well.

    } catch (error) {
        console.error(error);
    }
}

// Process Cash Payment
async function processCashPayment() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Please login to complete booking');
        return;
    }

    const name = document.getElementById('cash-name').value;
    const phone = document.getElementById('cash-phone').value;
    const date = document.getElementById('cash-date').value;
    const time = document.getElementById('cash-time').value;

    // Validation
    if (!name || !phone || !date || !time) {
        alert('Please fill in all fields');
        return;
    }

    const transactionId = 'APT' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
        // We'll use the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token not found. Please login again.');
            showPage('login');
            return;
        }

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyId: selectedProperty.id,
                paymentMethod: 'cash',
                totalAmount: selectedProperty.total,
                transactionId: transactionId
            })
        });

        if (response.ok) {
            document.getElementById('success-message').textContent =
                `Your cash payment appointment has been scheduled for ${date} at ${time}.`;
            document.getElementById('transaction-id').textContent =
                'Appointment ID: ' + transactionId;

            document.getElementById('success-modal').classList.add('show');
        } else {
            const data = await response.json();
            alert(data.msg || 'Booking failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during booking');
    }
}

// Close Modal (MODIFIED FOR SPA)
function closeModal() {
    document.getElementById('success-modal').classList.remove('show');
    // Redirect to home page within the SPA
    showPage('home');
}

// Set minimum date for cash payment to today
document.getElementById('cash-date').min = new Date().toISOString().split('T')[0];

/* ========================================
END OF NEW PAYMENT JS
========================================
*/


// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Fetch Properties from API
async function fetchProperties() {
    try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
        renderProperties(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
    }
}

// Render Properties
function renderProperties(properties) {
    const container = document.querySelector('.properties-grid');
    if (!container) return;

    window.allProperties = properties; // Store for easy access

    container.innerHTML = properties.map(property => `
        <div class="property-card" style="opacity: 1; transform: translateY(0); cursor: pointer;" onclick="window.allProperties.forEach(p => { if(p._id === '${property._id}') viewPropertyDetails(p); })">
            <div class="property-image">
                <img src="/${property.image}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">📍 ${property.location}</div>
                <div class="property-details">
                    <span class="property-detail">🛏️ ${property.bedrooms} Bed</span>
                    <span class="property-detail">🚿 ${property.bathrooms} Bath</span>
                    <span class="property-detail">📐 ${property.area} m²</span>
                </div>
                <div class="property-price">EGP ${property.price}/mon</div>
                <p class="property-description" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${property.description}</p>
                <button class="rent-btn" onclick="event.stopPropagation(); rentProperty('${property._id}', '${property.title}', ${property.price})">Rent Now</button>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    fetchProperties();
});
