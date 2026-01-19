const PAYSTACK_PUBLIC_KEY = 'pk_test_ab6a57e4c8fd4dfc8073528b6ac4e88833001c11';
const BACKEND_URL = 'https://paystack-backend-9g7t.onrender.com';
const AMOUNT = 1600000;

document.addEventListener('DOMContentLoaded', function() {
    
    const modal = document.getElementById('paymentModal');
    const form = document.getElementById('paymentForm');
    const closeBtn = document.getElementById('closeModal');
    
    // Get all subscribe buttons
    const btn1 = document.getElementById('subscribeHero');
    const btn2 = document.getElementById('subscribePricing');
    const btn3 = document.getElementById('subscribeCTA');

    function openModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Add click events to buttons
    if (btn1) btn1.onclick = openModal;
    if (btn2) btn2.onclick = openModal;
    if (btn3) btn3.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    // Close modal when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };

    // Form submit
    form.onsubmit = function(e) {
        e.preventDefault();
        
        var email = document.getElementById('email').value;
        var name = document.getElementById('name').value;

        var handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: AMOUNT,
            currency: 'NGN',
            ref: 'PH_' + Date.now(),
            metadata: {
                custom_fields: [
                    { display_name: "Name", variable_name: "name", value: name }
                ]
            },
            callback: function(response) {
                alert('Verifying payment...');
                fetch(BACKEND_URL + '/verify/' + response.reference)
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        if (data.success) {
                            localStorage.setItem('premiumhub_subscribed', 'true');
                            window.location.href = 'dashboard.html?status=success';
                        } else {
                            alert('Verification failed. Ref: ' + response.reference);
                        }
                    });
            },
            onClose: function() {
                alert('Payment cancelled');
            }
        });

        handler.openIframe();
    };

    console.log('Script loaded!');
});
