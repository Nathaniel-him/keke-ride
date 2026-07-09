// Get all elements
const pickupInput = document.getElementById('pickup');
const destinationInput = document.getElementById('destination');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const passengerInput = document.getElementById('passengers');
const minusBtn = document.getElementById('minusBtn');
const plusBtn = document.getElementById('plusBtn');
const priceAmount = document.getElementById('priceAmount');
const bookBtn = document.getElementById('bookBtn');
const confirmModal = document.getElementById('confirmModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const notification = document.getElementById('notification');
const pickupDropdown = document.getElementById('pickupDropdown');
const destinationDropdown = document.getElementById('destinationDropdown');
const ridesContainer = document.getElementById('ridesContainer');
const ridesList = document.getElementById('ridesList');

// Ride prices based on type
const ridePrices = {
    'Standard': 200,
    'Express': 800,
};

// Initialize the app
function init() {
    setupEventListeners();
    setMinDate();
    loadRideHistory();
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Pickup location
    pickupInput.addEventListener('focus', () => {
        pickupDropdown.classList.add('active');
    });

    pickupInput.addEventListener('input', (e) => {
        filterDropdown(pickupDropdown, e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            pickupDropdown.classList.remove('active');
            destinationDropdown.classList.remove('active');
        }
    });

    // Destination location
    destinationInput.addEventListener('focus', () => {
        destinationDropdown.classList.add('active');
    });

    destinationInput.addEventListener('input', (e) => {
        filterDropdown(destinationDropdown, e.target.value);
    });

    // Location options click
    document.querySelectorAll('.location-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const location = e.target.getAttribute('data-location');
            const isPickup = e.target.closest('#pickupDropdown');
            
            if (isPickup) {
                pickupInput.value = location;
                pickupDropdown.classList.remove('active');
            } else {
                destinationInput.value = location;
                destinationDropdown.classList.remove('active');
            }
            
            updatePrice();
        });
    });

    // Passenger buttons
    minusBtn.addEventListener('click', () => {
        const current = parseInt(passengerInput.value);
        if (current > 1) {
            passengerInput.value = current - 1;
            updatePrice();
        }
    });

    plusBtn.addEventListener('click', () => {
        const current = parseInt(passengerInput.value);
        if (current < 4) {
            passengerInput.value = current + 1;
            updatePrice();
        }
    });

    // Ride type changes
    document.querySelectorAll('input[name="rideType"]').forEach(radio => {
        radio.addEventListener('change', updatePrice);
    });

    // Book button
    bookBtn.addEventListener('click', handleBookClick);

    // Modal buttons
    closeModal.addEventListener('click', closeConfirmModal);
    cancelBtn.addEventListener('click', closeConfirmModal);
    confirmBtn.addEventListener('click', confirmBooking);

    // Date and time changes
    dateInput.addEventListener('change', updatePrice);
    timeInput.addEventListener('change', updatePrice);
}

// Filter dropdown options
function filterDropdown(dropdown, searchValue) {
    const options = dropdown.querySelectorAll('.location-option');
    const searchTerm = searchValue.toLowerCase();

    options.forEach(option => {
        const text = option.getAttribute('data-location').toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
}

// Get selected ride type
function getSelectedRideType() {
    const selected = document.querySelector('input[name="rideType"]:checked');
    return selected.value;
}

// Update price based on selections
function updatePrice() {
    const rideType = getSelectedRideType();
    const basePrice = ridePrices[rideType];
    const passengers = parseInt(passengerInput.value);
    
    // Calculate total price (base price per passenger)
    const totalPrice = basePrice * passengers;
    
    priceAmount.textContent = '₦' + totalPrice.toLocaleString();
}

// Validate booking inputs
function validateBooking() {
    if (!pickupInput.value.trim()) {
        showNotification('Please select a pickup location', 'error');
        return false;
    }

    if (!destinationInput.value.trim()) {
        showNotification('Please select a destination', 'error');
        return false;
    }

    if (pickupInput.value === destinationInput.value) {
        showNotification('Pickup and destination must be different', 'error');
        return false;
    }

    if (!dateInput.value) {
        showNotification('Please select a date', 'error');
        return false;
    }

    if (!timeInput.value) {
        showNotification('Please select a time', 'error');
        return false;
    }

    return true;
}

// Handle book button click
function handleBookClick() {
    if (!validateBooking()) return;

    populateModal();
    confirmModal.classList.add('active');
}

// Populate modal with booking details
function populateModal() {
    const rideType = getSelectedRideType();
    const passengers = passengerInput.value;
    const basePrice = ridePrices[rideType];
    const totalPrice = basePrice * passengers;
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    
    // Format date
    const dateObj = new Date(dateValue + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    document.getElementById('modalPickup').textContent = pickupInput.value;
    document.getElementById('modalDestination').textContent = destinationInput.value;
    document.getElementById('modalDateTime').textContent = `${formattedDate} at ${timeValue}`;
    document.getElementById('modalPassengers').textContent = passengers + (passengers > 1 ? ' people' : ' person');
    document.getElementById('modalRideType').textContent = rideType;
    document.getElementById('modalFare').textContent = '₦' + totalPrice.toLocaleString();
}

// Close confirmation modal
function closeConfirmModal() {
    confirmModal.classList.remove('active');
}

// Confirm booking
function confirmBooking() {
    const rideType = getSelectedRideType();
    const passengers = passengerInput.value;
    const basePrice = ridePrices[rideType];
    const totalPrice = basePrice * passengers;
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;

    // Create ride object
    const ride = {
        id: Date.now(),
        from: pickupInput.value,
        to: destinationInput.value,
        date: dateValue,
        time: timeValue,
        passengers: passengers,
        type: rideType,
        price: totalPrice,
        status: 'confirmed',
        bookedAt: new Date()
    };

    // Save to localStorage
    let rides = JSON.parse(localStorage.getItem('babockKekeRides')) || [];
    rides.unshift(ride);
    localStorage.setItem('babockKekeRides', JSON.stringify(rides));

    // Close modal
    closeConfirmModal();

    // Show success notification
    showNotification('Ride booked successfully! Your driver will arrive shortly.', 'success');

    // Reset form
    resetForm();

    // Update UI
    displayActiveRides();
    loadRideHistory();
}

// Reset form
function resetForm() {
    pickupInput.value = '';
    destinationInput.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
    timeInput.value = '';
    passengerInput.value = '1';
    document.getElementById('standard').checked = true;
    updatePrice();
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Display active rides
function displayActiveRides() {
    const rides = JSON.parse(localStorage.getItem('babockKekeRides')) || [];
    const activeRides = rides.filter(ride => {
        const rideDateTime = new Date(ride.date + 'T' + ride.time);
        return rideDateTime > new Date();
    });

    if (activeRides.length === 0) {
        ridesContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🚗</span>
                <p>No active rides. Book one to get started!</p>
            </div>
        `;
    } else {
        ridesContainer.innerHTML = activeRides.map(ride => `
            <div class="ride-item">
                <div class="ride-info">
                    <div class="ride-route">
                        <span class="from-to">${ride.from} → ${ride.to}</span>
                        <span class="ride-time">${formatDateTime(ride.date, ride.time)}</span>
                    </div>
                    <span class="ride-price">₦${ride.price.toLocaleString()}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="ride-status pending">Upcoming</span>
                    <button class="cancel-btn" style="background: #ff6b6b; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;" onclick="cancelRide(${ride.id})">Cancel</button>
                </div>
            </div>
        `).join('');
    }
}

// Load ride history
function loadRideHistory() {
    const rides = JSON.parse(localStorage.getItem('babockKekeRides')) || [];
    const completedRides = rides.filter(ride => {
        const rideDateTime = new Date(ride.date + 'T' + ride.time);
        return rideDateTime <= new Date();
    }).slice(0, 5); // Show last 5 completed rides

    if (completedRides.length === 0) {
        ridesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <p>No completed rides yet</p>
            </div>
        `;
    } else {
        ridesList.innerHTML = completedRides.map(ride => `
            <div class="ride-item">
                <div class="ride-info">
                    <div class="ride-route">
                        <span class="from-to">${ride.from} → ${ride.to}</span>
                        <span class="ride-time">${formatDateTime(ride.date, ride.time)}</span>
                    </div>
                    <span class="ride-price">₦${ride.price.toLocaleString()}</span>
                </div>
                <span class="ride-status completed">Completed</span>
            </div>
        `).join('');
    }

    displayActiveRides();
}

// Cancel a ride
function cancelRide(rideId) {
    if (confirm('Are you sure you want to cancel this ride?')) {
        let rides = JSON.parse(localStorage.getItem('babockKekeRides')) || [];
        rides = rides.filter(ride => ride.id !== rideId);
        localStorage.setItem('babockKekeRides', JSON.stringify(rides));

        showNotification('Ride cancelled successfully', 'success');
        displayActiveRides();
    }
}

// Format date and time
function formatDateTime(dateStr, timeStr) {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateLabel = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    if (dateObj.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
        dateLabel = 'Tomorrow';
    }

    return `${dateLabel}, ${timeStr}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);