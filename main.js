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

    const finalLink = `${baseUrl}?${params.toString()}`;

    document.getElementById('outputLink').value = finalLink;
}
function copyLink() {

    const copyText = document.getElementById('outputLink');

    navigator.clipboard.writeText(copyText.value);

    alert("✅ Link Copied Successfully");
}