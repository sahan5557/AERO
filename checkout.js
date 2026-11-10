document.addEventListener("DOMContentLoaded", () => {
  const currentUser = StoreState.getCurrentUser();
  if (!currentUser) {
    alert("Access Denied: Please log in or register before proceeding to checkout.");
    window.location.href = "index.html#userLoginModal";
    return;
  }

  autoFillCustomerDetails();
  renderCheckoutSummary();
  initCheckoutForm();
});

let appliedDiscount = 0; // percentage

function autoFillCustomerDetails() {
  const currentUser = StoreState.getCurrentUser();
  if (!currentUser) return;

  const nameInput = document.getElementById("custName");
  const emailInput = document.getElementById("custEmail");
  const addressInput = document.getElementById("custAddress");

  if (nameInput && currentUser.name) nameInput.value = currentUser.name;
  if (emailInput && currentUser.email) emailInput.value = currentUser.email;
  if (addressInput && currentUser.address) addressInput.value = currentUser.address;
}

function renderCheckoutSummary() {
  const cart = StoreState.getCart();
  const listContainer = document.getElementById("checkoutItemsList");
  const subtotalEl = document.getElementById("summarySubtotal");
  const taxEl = document.getElementById("summaryTax");
  const shippingEl = document.getElementById("summaryShipping");
  const discountEl = document.getElementById("summaryDiscount");
  const totalEl = document.getElementById("summaryTotal");

  if (!listContainer) return;

  if (cart.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:2rem 0; color:var(--text-muted);">
        <p>Your cart is empty.</p>
        <a href="index.html" class="btn btn-outline btn-sm" style="margin-top:1rem;">Return to Shop</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = "Rs. 0";
    if (taxEl) taxEl.innerText = "Rs. 0";
    if (totalEl) totalEl.innerText = "Rs. 0";
    return;
  }

  let subtotal = 0;
  listContainer.innerHTML = cart.map(item => {
    const qty = item.quantity || item.qty || 1;
    const itemTotal = item.price * qty;
    subtotal += itemTotal;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem; margin-bottom:0.75rem;">
        <div style="display:flex; gap:0.75rem; align-items:center;">
          <img src="${item.image}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover;" alt="${item.name}">
          <div>
            <div style="font-weight:700; font-size:0.9rem;">${item.name}</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">Qty: ${qty} × Rs. ${Number(item.price).toLocaleString()}</div>
          </div>
        </div>
        <div style="font-family:var(--font-mono); font-weight:700;">Rs. ${itemTotal.toLocaleString()}</div>
      </div>
    `;
  }).join('');

  // Shipping logic
  const shippingOption = document.querySelector('input[name="shippingMethod"]:checked')?.value || "standard";
  const shippingCost = shippingOption === "express" ? 4900 : 0;
  
  const tax = subtotal * 0.05;
  const discountAmount = subtotal * (appliedDiscount / 100);
  const grandTotal = subtotal + tax + shippingCost - discountAmount;

  if (subtotalEl) subtotalEl.innerText = `Rs. ${subtotal.toLocaleString()}`;
  if (taxEl) taxEl.innerText = `Rs. ${tax.toLocaleString()}`;
  if (shippingEl) shippingEl.innerText = shippingCost === 0 ? "FREE" : `Rs. ${shippingCost.toLocaleString()}`;
  if (discountEl) discountEl.innerText = `-Rs. ${discountAmount.toLocaleString()}`;
  if (totalEl) totalEl.innerText = `Rs. ${grandTotal.toLocaleString()}`;
}

function applyCoupon() {
  const codeInput = document.getElementById("couponCode");
  const code = codeInput.value.trim().toUpperCase();

  if (code === "AERO10") {
    appliedDiscount = 10;
    showToast("10% Coupon Discount Applied!");
  } else if (code === "VIP20") {
    appliedDiscount = 20;
    showToast("20% VIP Discount Applied!");
  } else {
    showToast("Invalid Coupon Code (Try AERO10)", "danger");
    appliedDiscount = 0;
  }
  renderCheckoutSummary();
}

function initCheckoutForm() {
  document.getElementById("applyCouponBtn")?.addEventListener("click", applyCoupon);

  document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
    radio.addEventListener("change", renderCheckoutSummary);
  });

  const cardNumber = document.getElementById("cardNumber");
  const cardHolder = document.getElementById("cardHolder");
  const cardExp = document.getElementById("cardExp");

  cardNumber?.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = val;
    const visual = document.getElementById("visualCardNumber");
    if (visual) visual.innerText = val || "•••• •••• •••• ••••";
  });

  cardHolder?.addEventListener("input", (e) => {
    const visual = document.getElementById("visualCardHolder");
    if (visual) visual.innerText = e.target.value.toUpperCase() || "YOUR NAME";
  });

  cardExp?.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
    e.target.value = val;
    const visual = document.getElementById("visualCardExp");
    if (visual) visual.innerText = val || "MM/YY";
  });

  const checkoutForm = document.getElementById("checkoutForm");
  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cart = StoreState.getCart();
    if (cart.length === 0) {
      showToast("Cart is empty!", "danger");
      return;
    }

    const orderId = `AERO-${Math.floor(100000 + Math.random() * 900000)}`;
    const name = document.getElementById("custName").value;
    const email = document.getElementById("custEmail").value;
    const address = document.getElementById("custAddress").value;
    const city = document.getElementById("custCity").value;
    const summaryTotalText = document.getElementById("summaryTotal").innerText;

    const orderPayload = {
      orderId,
      customer: name,
      email,
      address: `${address}, ${city}`,
      city,
      items: cart,
      totalAmount: summaryTotalText,
      status: "Processing"
    };

    try {
      const res = await fetch("api/orders.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Order placed successfully!");
      }
    } catch (err) {
      console.warn("Could not reach orders API, saving locally:", err);
    }

    // Always record locally as well for offline fallback
    const orders = StoreState.getOrders();
    orders.unshift({
      ...orderPayload,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    StoreState.saveOrders(orders);

    // Clear shopping cart
    StoreState.saveCart([]);

    document.getElementById("confirmedOrderId").innerText = `#${orderId}`;
    document.getElementById("confirmedName").innerText = name;
    document.getElementById("confirmedTotal").innerText = summaryTotalText;
    
    openModal("orderSuccessModal");
  });
}
