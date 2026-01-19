const PAYSTACK_PUBLIC_KEY = 'pk_test_ab6a57e4c8fd4dfc8073528b6ac4e88833001c11';
const BACKEND_URL = 'https://paystack-backend-9g7t.onrender.com';
const AMOUNT = 1600000;

const modal = document.getElementById('paymentModal');
const form = document.getElementById('paymentForm');
const closeBtn = document.getElementById('closeModal');
const subscribeButtons = document.querySelectorAll('#subscribeHero, #subscribePricing, #subscribeCTA');

function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
}

async function verifyPayment(reference) {
    try {
        const response = await fetch(BACKEND_URL + '/verify/' + reference);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Verification error:', error);
        return { success: false };
    }
}

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
                { display_name: "Customer Name", variable_name: "customer_name", value: name }
            ]
        },
        callback: async function(response) {
            alert('Verifying payment...');
            const verification = await verifyPayment(response.reference);
            if (verification.success) {
                localStorage.setItem('premiumhub_subscribed', 'true');
                localStorage.setItem('premiumhub_ref', response.reference);
                closeModal();
                window.location.href = 'dashboard.html?status=success&ref=' + response.reference;
            } else {
                alert('Verification failed. Reference: ' + response.reference);
            }
        },
        onClose: function() {
            alert('Payment cancelled.');
        }
    });

    handler.openIframe();
}

subscribeButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });
});

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email.');
        return;
    }
    if (!name || name.length < 2) {
        alert('Please enter your name.');
        return;
    }
    
    payWithPaystack(email, name);
});

console.log('PremiumHub Ready');
