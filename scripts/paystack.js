/**
 * PremiumHub - Paystack Payment Integration
 * 
 * ⚠️ IMPORTANT: Replace the PUBLIC_KEY below with your actual Paystack key
 * - Test key: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
 * - Live key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx
 */

// ============================================
// 🔑 REPLACE THIS KEY WITH YOUR PAYSTACK KEY
// ============================================
const PAYSTACK_PUBLIC_KEY = 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY';

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
// Paystack Payment
// ============================================
function payWithPaystack(email, name) {
    // Generate unique reference
    const reference = 'PH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Check if key is replaced
    if (PAYSTACK_PUBLIC_KEY === 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY') {
        alert('⚠️ Please replace PAYSTACK_PUBLIC_KEY in scripts/paystack.js with your actual Paystack public key!');
        return;
    }

    // Initialize Paystack
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
        
        // Payment successful
        callback: function(response) {
            console.log('Payment successful:', response);
            
            // Store payment info
            localStorage.setItem('premiumhub_subscribed', 'true');
            localStorage.setItem('premiumhub_ref', response.reference);
            
            // Close modal
            closeModal();
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html?status=success&ref=' + response.reference;
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
    
    // Validate
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (!name || name.length < 2) {
        alert('Please enter your full name.');
        return;
    }
    
    // Start payment
    payWithPaystack(email, name);
});

// ============================================
// Console message
// ============================================
console.log('%c🚀 PremiumHub Payment Ready', 'color: #6366f1; font-size: 14px; font-weight: bold;');
console.log('%c💡 Remember to replace PAYSTACK_PUBLIC_KEY!', 'color: #f59e0b;');
