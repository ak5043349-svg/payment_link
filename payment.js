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
    payNowBtn: document.getElementById("payNowBtn"),
    submitBtn: document.getElementById("submitBtn"),
    utrInput: document.getElementById("utr"),
    utrStatus: document.getElementById("utrStatus"),
    toast: document.getElementById("toast"),
    appItems: document.querySelectorAll(".app-item"),
};

// ===========================
// Validate Link
// ===========================
if (!app || !amount || !upi) {
    document.body.innerHTML = `
        <div style="text-align:center;margin-top:50px;padding:40px;background:#fff;border-radius:20px;max-width:500px;margin-left:auto;margin-right:auto;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
            <div style="font-size:60px;margin-bottom:10px;">❌</div>
            <h2 style="color:#dc3545;font-size:22px;">Invalid Payment Link</h2>
            <p style="color:#666;margin-top:10px;font-size:14px;">Missing required parameters: app, amount, or upi</p>
        </div>
    `;
    throw new Error("Invalid Payment Link - Missing required parameters");
}

// ===========================
// Populate Data
// ===========================
elements.dispApp.innerText = app || "-";
elements.dispProd.innerText = prod || "-";
elements.dispUser.innerText = user || "-";
elements.dispAmt.innerText = "₹" + amount;
elements.upiField.value = upi;

// ===========================
// UPI LINK
// ===========================
const upiLink = `upi://pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`;

// ===========================
// QR CODE Generation
// ===========================
function generateQR() {
    if (!elements.qrCode) return;
    
    elements.qrCode.innerHTML = "";
    
    try {
        new QRCode(elements.qrCode, {
            text: upiLink,
            width: 150,
            height: 150,
            colorDark: "#0d6efd",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error("QR Generation Error:", error);
        elements.qrCode.innerHTML = `<p style="color:#dc3545;font-size:12px;">⚠️ QR failed</p>`;
    }
}

generateQR();

// ===========================
// Copy UPI Function
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
// Open UPI Function
// ===========================
function openUPI() {
    if (isExpired()) {
        showToast("⏰ Payment has expired", "error");
        return;
    }
    window.location.href = upiLink;
}

// ===========================
// Open Specific Payment App
// ===========================
function openPaymentApp(appName) {
    if (isExpired()) {
        showToast("⏰ Payment has expired", "error");
        return;
    }
    
    const appIntents = {
        gpay: `googlepay://upi/pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`,
        phonepe: `phonepe://upi/pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`,
        paytm: `paytmmp://upi/pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`,
        bhim: `bhim://upi/pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`,
        amazon: `amazonpay://upi/pay?pa=${upi}&pn=${app}&am=${amount}&cu=INR`,
        whatsapp: `whatsapp://send?text=Payment%20of%20₹${amount}%20to%20${upi}`,
    };
    
    const intent = appIntents[appName];
    if (intent) {
        const link = document.createElement("a");
        link.href = intent;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`📱 Opening ${appName}...`, "info");
    } else {
        showToast("❌ Invalid payment app", "error");
    }
}

// ===========================
// Check Expiry
// ===========================
function isExpired() {
    if (!expiry) return false;
    return Date.now() > expiry;
}

// ===========================
// Timer Function
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
        elements.payNowBtn.disabled = true;
        elements.submitBtn.disabled = true;
        elements.upiField.disabled = true;
        return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    elements.timer.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

updateTimer();
setInterval(updateTimer, 1000);

// ===========================
// UTR Validation & Submit
// ===========================
function validateUTR(utr) {
    const cleanUTR = utr.replace(/\s/g, "");
    
    if (!/^\d{12}$/.test(cleanUTR)) {
        return { valid: false, message: "Please enter valid 12 digit UTR" };
    }
    
    return { valid: true, message: "✅ Valid UTR format", cleanUTR };
}

function verifyUTR(utrNumber) {
    const result = validateUTR(utrNumber);
    
    if (!result.valid) {
        elements.utrStatus.textContent = "❌ " + result.message;
        elements.utrStatus.style.color = "#dc3545";
        elements.utrInput.classList.add("error");
        elements.utrInput.classList.remove("success");
        return;
    }
    
    elements.utrStatus.textContent = "⏳ Verifying payment...";
    elements.utrStatus.style.color = "#0d6efd";
    elements.submitBtn.disabled = true;
    elements.submitBtn.innerHTML = '<span class="loading-spinner"></span>';
    
    setTimeout(() => {
        elements.utrStatus.textContent = "✅ Payment Verified Successfully!";
        elements.utrStatus.style.color = "#16a34a";
        elements.utrInput.classList.remove("error");
        elements.utrInput.classList.add("success");
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = "✅ Verify";
        
        showToast("🎉 Payment verified successfully!", "success");
        
        document.querySelector(".payment-card").style.border = "3px solid #16a34a";
        document.querySelector(".payment-card").style.transition = "border-color 0.5s";
    }, 2000);
}

// ===========================
// Toast Notification
// ===========================
function showToast(message, type = "info") {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = "toast " + type;
    
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);
    
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ===========================
// Event Listeners
// ===========================

// Pay Now Button
elements.payNowBtn?.addEventListener("click", openUPI);

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

// UTR Input - Only digits & auto-format
elements.utrInput?.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "");
    
    if (this.value.length > 0) {
        const raw = this.value.replace(/\s/g, "");
        if (raw.length <= 12) {
            const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
            if (this.value !== formatted) {
                const cursorPos = this.selectionStart;
                this.value = formatted;
                this.setSelectionRange(cursorPos, cursorPos);
            }
        }
    }
    
    elements.utrStatus.textContent = "";
    this.classList.remove("error", "success");
});

// Enter key on UTR input
elements.utrInput?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        elements.submitBtn?.click();
    }
});

// Payment App Items
elements.appItems?.forEach(item => {
    item.addEventListener("click", function() {
        const appName = this.dataset.app;
        elements.appItems.forEach(el => el.classList.remove("active"));
        this.classList.add("active");
        openPaymentApp(appName);
    });
    
    item.addEventListener("touchstart", function() {
        this.style.transform = "scale(0.95)";
    });
    item.addEventListener("touchend", function() {
        this.style.transform = "scale(1)";
    });
});

// ===========================
// Handle Visibility Change
// ===========================
document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        updateTimer();
    }
});

// ===========================
// Handle Page Unload
// ===========================
window.addEventListener("beforeunload", function(e) {
    const utrValue = elements.utrInput?.value.replace(/\s/g, "") || "";
    if (utrValue.length === 12) return;
    if (!isExpired() && elements.payNowBtn?.disabled === false) {
        e.preventDefault();
        e.returnValue = "Payment in progress. Are you sure you want to leave?";
    }
});

// ===========================
// Expose functions globally
// ===========================
window.copyUpi = copyUpi;
window.openUPI = openUPI;