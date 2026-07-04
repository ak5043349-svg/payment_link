// ===========================
// Read URL Parameters
// ===========================
const urlParams = new URLSearchParams(window.location.search);

const app = urlParams.get("app");
const prod = urlParams.get("prod");
const user = urlParams.get("user");
const amount = urlParams.get("amt");
const upi = urlParams.get("upi");
const expiry = parseInt(urlParams.get("expiry") || "0");

// ===========================
// DOM References
// ===========================
const elements = {
    dispApp: document.getElementById("dispApp"),
    dispProd: document.getElementById("dispProd"),
    dispUser: document.getElementById("dispUser"),
    dispAmt: document.getElementById("dispAmt"),
    upiField: document.getElementById("upiField"),
    qrCode: document.getElementById("qrCode"),
    timer: document.getElementById("timer"),
    utrInput: document.getElementById("utr"),
    utrStatus: document.getElementById("utrStatus"),
    toast: document.getElementById("toast"),
    appItems: document.querySelectorAll(".app-item"),
    submitBtn: document.getElementById("submitBtn"),
};

// ===========================
// Validate & Populate
// ===========================
if (app) elements.dispApp.innerText = app;
if (prod) elements.dispProd.innerText = prod;
if (user) elements.dispUser.innerText = user;
if (amount) elements.dispAmt.innerText = "₹" + amount;
if (upi) elements.upiField.value = upi;

// ===========================
// UPI Link
// ===========================
const upiLink = `upi://pay?pa=${upi || elements.upiField.value}&pn=${app || "User"}&am=${amount || 99}&cu=INR`;

// ===========================
// Generate QR Code
// ===========================
function generateQR() {
    if (!elements.qrCode) return;
    elements.qrCode.innerHTML = "";
    try {
        new QRCode(elements.qrCode, {
            text: upiLink,
            width: 140,
            height: 140,
            colorDark: "#1a73e8",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        elements.qrCode.innerHTML = `<p style="color:#dc3545;font-size:11px;">⚠️ QR failed</p>`;
    }
}
generateQR();

// ===========================
// Copy UPI
// ===========================
function copyUpi() {
    const upiId = elements.upiField.value;
    if (!upiId) {
        showToast("❌ No UPI ID to copy", "error");
        return;
    }
    navigator.clipboard.writeText(upiId).then(() => {
        showToast("✅ UPI Copied Successfully", "success");
    }).catch(() => {
        elements.upiField.select();
        document.execCommand("copy");
        showToast("✅ UPI Copied Successfully", "success");
    });
}

// ===========================
// Open UPI
// ===========================
function openUPI() {
    if (isExpired()) {
        showToast("⏰ Payment has expired", "error");
        return;
    }
    window.location.href = upiLink;
}

// ===========================
// Open Payment App - With Play Store Redirect
// ===========================
function openPaymentApp(appName) {
    if (isExpired()) {
        showToast("⏰ Payment has expired", "error");
        return;
    }
    
    const currentUpi = elements.upiField.value;
    const currentAmount = elements.dispAmt.innerText.replace("₹", "");
    
    // App Configurations
    const appConfig = {
        gpay: {
            name: "Google Pay",
            intent: `googlepay://upi/pay?pa=${currentUpi}&pn=${app || "User"}&am=${currentAmount}&cu=INR`,
            playStore: "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user"
        },
        phonepe: {
            name: "PhonePe",
            intent: `phonepe://upi/pay?pa=${currentUpi}&pn=${app || "User"}&am=${currentAmount}&cu=INR`,
            playStore: "https://play.google.com/store/apps/details?id=com.phonepe.app"
        },
        paytm: {
            name: "Paytm",
            intent: `paytmmp://upi/pay?pa=${currentUpi}&pn=${app || "User"}&am=${currentAmount}&cu=INR`,
            playStore: "https://play.google.com/store/apps/details?id=net.one97.paytm"
        }
    };
    
    const config = appConfig[appName];
    if (!config) {
        showToast("❌ Invalid payment app", "error");
        return;
    }
    
    // Try to open app
    showToast(`📱 Opening ${config.name}...`, "info");
    
    // Create link to open app
    const link = document.createElement('a');
    link.href = config.intent;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Check if app opened after 2.5 seconds
    setTimeout(() => {
        // If page is still visible, app didn't open
        if (!document.hidden) {
            // Ask user if they want to download
            const goToStore = confirm(
                `❌ ${config.name} app not found!\n\n` +
                `Click OK to download from Play Store.\n` +
                `Click Cancel to pay manually using UPI ID.`
            );
            
            if (goToStore) {
                showToast(`⬇️ Opening Play Store...`, "info");
                setTimeout(() => {
                    window.location.href = config.playStore;
                }, 500);
            } else {
                // Copy UPI ID for manual payment
                copyUpi();
                showToast(`💡 Pay manually using UPI: ${currentUpi}`, "info");
            }
        }
    }, 2500);
}

// ===========================
// Check Expiry
// ===========================
function isExpired() {
    if (!expiry) return false;
    return Date.now() > expiry;
}

// ===========================
// Timer
// ===========================
function updateTimer() {
    if (!expiry) {
        elements.timer.innerText = "∞";
        return;
    }
    const remaining = expiry - Date.now();
    if (remaining <= 0) {
        elements.timer.innerText = "Expired";
        elements.timer.classList.add("expired");
        return;
    }
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    elements.timer.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
updateTimer();
setInterval(updateTimer, 1000);

// ===========================
// Validate UTR
// ===========================
function verifyUTR(utrNumber) {
    const cleanUTR = utrNumber.replace(/\s/g, "");
    if (!/^\d{12}$/.test(cleanUTR)) {
        elements.utrStatus.textContent = "❌ Invalid UTR! Must be 12 digits";
        elements.utrStatus.style.color = "#dc3545";
        elements.utrInput.classList.add("error");
        return;
    }
    elements.utrStatus.textContent = "⏳ Verifying payment...";
    elements.utrStatus.style.color = "#1a73e8";
    elements.submitBtn.disabled = true;
    elements.submitBtn.innerHTML = '<span class="loading-spinner"></span>';
    setTimeout(() => {
        elements.utrStatus.textContent = "✅ Payment Verified Successfully!";
        elements.utrStatus.style.color = "#28a745";
        elements.utrInput.classList.remove("error");
        elements.utrInput.classList.add("success");
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = "Verify Payment";
        showToast("🎉 Payment verified successfully!", "success");
    }, 2000);
}

// ===========================
// Toast
// ===========================
function showToast(message, type = "info") {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = "toast " + type;
    setTimeout(() => toast.classList.add("show"), 10);
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ===========================
// Event Listeners
// ===========================

// Payment Apps
elements.appItems?.forEach(btn => {
    btn.addEventListener("click", function() {
        const appName = this.dataset.app;
        elements.appItems.forEach(b => b.style.borderColor = "#eef4ff");
        this.style.borderColor = "#1a73e8";
        openPaymentApp(appName);
    });
});

// Submit UTR
elements.submitBtn?.addEventListener("click", function() {
    const utr = elements.utrInput.value.trim();
    if (!utr) {
        showToast("❌ Please enter your UTR number", "error");
        elements.utrInput.classList.add("error");
        return;
    }
    verifyUTR(utr);
});

// UTR Input
elements.utrInput?.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "");
    elements.utrStatus.textContent = "";
    this.classList.remove("error", "success");
});

// Enter key
elements.utrInput?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") elements.submitBtn?.click();
});

// ===========================
// Expose globally
// ===========================
window.copyUpi = copyUpi;
window.openUPI = openUPI;
window.openPaymentApp = openPaymentApp;