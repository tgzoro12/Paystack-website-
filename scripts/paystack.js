/**
 * PremiumHub - Paystack Payment Integration with Backend Verification
 */

// ============================================
// 🔑 YOUR PAYSTACK PUBLIC KEY
// ============================================
const PAYSTACK_PUBLIC_KEY = 'pk_test_ab6a57e4c8fd4dfc8073528b6ac4e88833001c11';

// 🔗 YOUR BACKEND URL
const BACKEND_URL = 'https://paystack-backend-9g7t.onrender.com';

// Payment amount: ₦16,000 = 1600000 kobo
const AMOUNT = 1600000;

// ============================================
// DOM Elements
// ============================================
const modal = document.getElementById('paymentModal');
const form = document.getElementById('paymentForm');
const closeBtn = document.getElementById('closeModal');

// All subscribe buttons
const subscribeButtons = document.querySelectorAll('#subscribeHero, #subscribePricing, #subscribeCTA');

// ============================================
// Modal Functions
// ============================================
function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('email').focus();
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
}

// ============================================
// Verify Payment with Backend
// ============================================
async function verifyPayment(reference) {
    try {
        const response = await fetch(`${BACKEND_URL}/verify/${reference}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Verification error:', error);
        return { success: false, message: 'Verification failed' };
    }
}

// ============================================
// Paystack Payment
// ============================================
function payWithPaystack(email, name) {
    const reference = 'PH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: AMOUNT,
        currency: 'NGN',
        ref: reference,
        metadata: {
            custom_fields: [
                { display_name: "Customer Name", variable_name: "customer_name", value: name },
                { display_name: "Product", variable_name: "product", value: "Premium Monthly" }
            ]
        },
        
        // Payment successful - now verify with backend
        callback: async function(response) {
            console.log('Payment response:', response);
            
            // Show loading message
            alert('Verifying payment... Please wait.');
            
            // Verify with backend
            const verification = await verifyPayment(response.reference);
            
            if (verification.success) {
                console.log('Payment verified:', verification);
                
                // Store payment info
                localStorage.setItem('premiumhub_subscribed', 'true');
                localStorage.setItem('premiumhub_ref', response.reference);
                localStorage.setItem('premiumhub_email', verification.data.email);
                
                // Close modal
                closeModal();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html?status=success&ref=' + response.reference;
            } else {
                alert('Payment verification failed. Please contact support with reference: ' + response.reference);
            }
        },
        
        // Payment window closed
        onClose: function() {
            alert('Payment cancelled. Please try again when ready.');
        }
    });

    handler.openIframe();
}

// ============================================
// Event Listeners
// ============================================

// Open modal on subscribe click
subscribeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
});

// Close modal
closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (!name || name.length < 2) {
        alert('Please enter your full name.');
        return;
    }
    
    payWithPaystack(email, name);
});

// ============================================
// Console message
// ============================================
console.log('%c🚀 PremiumHub Payment Ready', 'color: #6366f1; font-size: 14px; font-weight: bold;');
console.log('%c🔐 Backend verification enabled', 'color: #10b981;');
