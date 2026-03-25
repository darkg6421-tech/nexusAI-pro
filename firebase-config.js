 // Firebase Configuration
// Replace with your Firebase project config from console.firebase.google.com
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Analytics tracking
function trackPageView(page) {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'page_path': page
        });
    }
    
    // Store in Firestore
    db.collection('analytics').add({
        page: page,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous'
    });
}

// Auth state listener
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('user-name').innerText = user.displayName || user.email;
        document.getElementById('auth-btn').style.display = 'none';
        
        // Update user count
        db.collection('users').doc(user.uid).set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            email: user.email
        }, { merge: true });
    } else {
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('auth-btn').style.display = 'block';
    }
});

function handleAuth() {
    window.location.href = 'login.html';
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Razorpay Payment Integration
function initPayment(amount, productName) {
    const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: amount * 100,
        currency: "INR",
        name: "NEXUS Platform",
        description: `Purchase: ${productName}`,
        handler: function(response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            
            // Save order to Firestore
            db.collection('orders').add({
                userId: auth.currentUser?.uid,
                product: productName,
                amount: amount,
                paymentId: response.razorpay_payment_id,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update sales count
            updateSalesCount(amount);
        }
    };
    
    const razorpay = new Razorpay(options);
    razorpay.open();
}

function updateSalesCount(amount) {
    const salesElement = document.getElementById('sales');
    if (salesElement) {
        let currentSales = parseInt(salesElement.innerText) || 0;
        currentSales += amount;
        salesElement.innerText = currentSales;
    }
}

// Visitor Counter
function updateVisitorCount() {
    const visitorRef = db.collection('stats').doc('visitors');
    visitorRef.get().then((doc) => {
        if (doc.exists) {
            let count = doc.data().count || 0;
            count++;
            visitorRef.update({ count: count });
            document.getElementById('visitors').innerText = count;
        } else {
            visitorRef.set({ count: 1 });
            document.getElementById('visitors').innerText = 1;
        }
    });
}

updateVisitorCount();
