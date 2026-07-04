// ===========================
// Auto Session Timeout
// ===========================

const SESSION_TIME = 5 * 60 * 1000; // 5 Minutes

function updateActivity() {
    localStorage.setItem("adminLoginTime", Date.now());
}

["click", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, updateActivity);
});

function checkSession() {

    const isLoggedIn = localStorage.getItem("adminLoggedIn");

    const lastActivity = Number(localStorage.getItem("adminLoginTime"));

    if (isLoggedIn !== "true") {
        window.location.href = "login.html";
        return;
    }

    if (Date.now() - lastActivity > SESSION_TIME) {

        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminLoginTime");
        localStorage.removeItem("adminUsername");

        alert("Session Expired. Please Login Again.");

        window.location.href = "login.html";
    }
}

updateActivity();

checkSession();

setInterval(checkSession, 5000);



function generateLink() {

    const appName = document.getElementById('appName').value;
    const amount = document.getElementById('amount').value;
    const upiId = document.getElementById('upiId').value;
    const productName = document.getElementById('productName').value;
    const userName = document.getElementById('userName').value;

    // Expiry Time (Minutes)
    const timer = parseInt(document.getElementById('timer').value);

    // Expiry Timestamp
    const expiry = Date.now() + (timer * 60 * 1000);

 // Purana link hatakar naya link lagayein
const baseURL = "https://superlative-treacle-446313.netlify.app/payment.html";

    const params = new URLSearchParams({
        app: appName,
        amt: amount,
        upi: upiId,
        prod: productName,
        user: userName,
        expiry: expiry
    });

    const finalLink = `${baseURL}?${params.toString()}`;

    document.getElementById('outputLink').value = finalLink;
}
function copyLink() {

    const copyText = document.getElementById('outputLink');

    navigator.clipboard.writeText(copyText.value);

    alert("✅ Link Copied Successfully");
}