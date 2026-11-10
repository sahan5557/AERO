document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = StoreState.getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied: Only Admins can view this page. Redirecting to store...");
    window.location.href = "index.html";
    return;
  }

  initAdminHeader(currentUser);
  await loadAdminDashboardData();
  initAddProductModal();
});

function initAdminHeader(currentUser) {
  const profileEl = document.getElementById("adminProfileName");
  if (profileEl) profileEl.innerText = currentUser.name || "Admin Manager";

  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    StoreState.setCurrentUser(null);
    window.location.href = "index.html";
  });
}


// Load all dashboard components
async function loadAdminDashboardData() {
  await Promise.all([
    renderAdminStats(),
    renderProductsTable(),
    renderOrdersTable()
  ]);
}

// Admin Analytics Metrics
async function renderAdminStats() {
  try {
    const res = await fetch("api/stats.php");
    if (res.ok) {
      const stats = await res.json();
      if (stats.success) {
        document.getElementById("statProductsCount").innerText = stats.productsCount;
        document.getElementById("statOrdersCount").innerText = stats.ordersCount;
        document.getElementById("statRevenue").innerText = stats.revenueFormatted;
        document.getElementById("statCustomersCount").innerText = stats.customersCount;
        return;
      }
    }
  } catch (err) {
    console.warn("Could not fetch server stats, calculating locally:", err);
  }

  // Fallback local calculations
  const products = StoreState.getProducts();
  const orders = StoreState.getOrders();
  const users = StoreState.getUsers();

  const totalRevenue = orders.reduce((sum, o) => {
    const val = parseFloat(String(o.totalAmount || '').replace(/[^0-9.-]+/g, "")) || 0;
    return sum + val;
  }, 0);

  document.getElementById("statProductsCount").innerText = products.length;
  document.getElementById("statOrdersCount").innerText = orders.length;
  document.getElementById("statRevenue").innerText = `Rs. ${totalRevenue.toLocaleString()}`;
  document.getElementById("statCustomersCount").innerText = users.filter(u => u.role === "customer").length;
}

// Product Management (CRUD via MySQL Backend)
async function renderProductsTable() {
  const tableBody = document.getElementById("adminProductsTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
        Loading drone inventory from database...
      </td>
    </tr>
  `;

  let products = [];
  try {
    const res = await fetch("api/products.php");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        products = json.data;
        StoreState.saveProducts(products);
      }
    }
  } catch (err) {
    console.warn("Using local cache for products:", err);
    products = StoreState.getProducts();
  }

  if (!products || products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">
          No products in database. Click "+ Add New Drone" to create your first listing!
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map(drone => {
    const battery = drone.specs?.battery || drone.battery || '-';
    const camera = drone.specs?.camera || drone.camera || '-';
    const speed = drone.specs?.speed || drone.speed || '';
    const range = drone.specs?.range || drone.flight_range || '';

    return `
      <tr>
        <td>
          <img src="${drone.image}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover;" alt="${drone.name}" onerror="this.src='https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'">
        </td>
        <td style="font-weight:700;">
          ${drone.name}
          ${drone.badge ? `<span style="font-size:0.7rem; background:rgba(0,255,135,0.15); color:var(--accent-green); padding:1px 5px; border-radius:3px; margin-left:5px;">${drone.badge}</span>` : ''}
        </td>
        <td><span class="spec-pill">${drone.category}</span></td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan);">Rs. ${Number(drone.price).toLocaleString()}</td>
        <td>${drone.stock ?? 10} units</td>
        <td>
          <span style="font-size:0.8rem; color:var(--text-muted);">
            🔋 ${battery} | 📷 ${camera}
          </span>
        </td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-secondary btn-sm" onclick="openEditDroneModal('${drone.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteDrone('${drone.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Delete Drone (MySQL DELETE Request)
async function deleteDrone(droneId) {
  if (!confirm("Are you sure you want to delete this Drone product from the database?")) return;

  try {
    const res = await fetch(`api/products.php?id=${encodeURIComponent(droneId)}`, {
      method: "DELETE"
    });
    const result = await res.json();

    if (res.ok && result.success) {
      showToast(result.message || "Drone deleted successfully");
    } else {
      throw new Error(result.message || "Delete failed");
    }
  } catch (err) {
    // If API error, update local cache
    let products = StoreState.getProducts().filter(p => p.id !== droneId);
    StoreState.saveProducts(products);
    showToast(`Deleted from cache: ${err.message}`, "danger");
  }

  // Refresh Table and Metrics
  await renderProductsTable();
  await renderAdminStats();
}

// Add New Drone Form Handling & Edit Form Handling
function initAddProductModal() {
  const form = document.getElementById("addProductForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("newDroneName").value.trim();
    const category = document.getElementById("newDroneCategory").value;
    const price = parseFloat(document.getElementById("newDronePrice").value);
    const stock = parseInt(document.getElementById("newDroneStock").value) || 10;
    const image = document.getElementById("newDroneImage").value.trim();
    const battery = document.getElementById("newDroneBattery").value.trim();
    const camera = document.getElementById("newDroneCamera").value.trim();
    const speed = document.getElementById("newDroneSpeed").value.trim();
    const range = document.getElementById("newDroneRange").value.trim();
    const description = document.getElementById("newDroneDesc").value.trim();

    const newProductPayload = {
      name,
      category,
      price,
      stock,
      badge: "NEW",
      image: image || "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
      description,
      battery,
      camera,
      speed,
      flight_range: range,
      specs: { battery, camera, speed, range }
    };

    try {
      const res = await fetch("api/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || `Added Drone: ${name}`);
      } else {
        throw new Error(data.message || "Failed to create drone listing");
      }
    } catch (err) {
      // Local fallback
      newProductPayload.id = `drone-${Date.now()}`;
      const products = StoreState.getProducts();
      products.unshift(newProductPayload);
      StoreState.saveProducts(products);
      showToast(`Added locally: ${name}`);
    }

    closeModal("addProductModal");
    form.reset();
    await renderProductsTable();
    await renderAdminStats();
  });

  // Edit Drone Form
  const editForm = document.getElementById("editProductForm");
  editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editDroneId").value;
    const name = document.getElementById("editDroneName").value.trim();
    const category = document.getElementById("editDroneCategory").value;
    const price = parseFloat(document.getElementById("editDronePrice").value);
    const stock = parseInt(document.getElementById("editDroneStock").value) || 10;
    const image = document.getElementById("editDroneImage").value.trim();
    const battery = document.getElementById("editDroneBattery").value.trim();
    const camera = document.getElementById("editDroneCamera").value.trim();
    const speed = document.getElementById("editDroneSpeed").value.trim();
    const range = document.getElementById("editDroneRange").value.trim();
    const description = document.getElementById("editDroneDesc").value.trim();

    const updatePayload = {
      action: "update",
      id,
      name,
      category,
      price,
      stock,
      image,
      battery,
      camera,
      speed,
      flight_range: range,
      specs: { battery, camera, speed, range },
      description
    };

    try {
      const res = await fetch("api/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || `Updated Drone: ${name}`);
      } else {
        throw new Error(data.message || "Failed to update drone");
      }
    } catch (err) {
      // Local fallback
      const products = StoreState.getProducts();
      const drone = products.find(p => p.id === id);
      if (drone) {
        Object.assign(drone, updatePayload);
        StoreState.saveProducts(products);
      }
      showToast(`Updated locally: ${name}`);
    }

    closeModal("editProductModal");
    await renderProductsTable();
    await renderAdminStats();
  });
}

// Open Edit Drone Modal & Populate Current Values
function openEditDroneModal(droneId) {
  const products = StoreState.getProducts();
  const drone = products.find(p => p.id === droneId);
  if (!drone) return;

  document.getElementById("editDroneId").value = drone.id;
  document.getElementById("editDroneName").value = drone.name;
  document.getElementById("editDroneCategory").value = drone.category;
  document.getElementById("editDronePrice").value = drone.price;
  document.getElementById("editDroneStock").value = drone.stock ?? 10;
  document.getElementById("editDroneImage").value = drone.image;
  document.getElementById("editDroneBattery").value = drone.specs?.battery || drone.battery || '';
  document.getElementById("editDroneCamera").value = drone.specs?.camera || drone.camera || '';
  document.getElementById("editDroneSpeed").value = drone.specs?.speed || drone.speed || '';
  document.getElementById("editDroneRange").value = drone.specs?.range || drone.flight_range || '';
  document.getElementById("editDroneDesc").value = drone.description;

  openModal("editProductModal");
}

// Orders Management (MySQL Backend)
async function renderOrdersTable() {
  const tableBody = document.getElementById("adminOrdersTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
        Loading orders from database...
      </td>
    </tr>
  `;

  let orders = [];
  try {
    const res = await fetch("api/orders.php");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        orders = json.data;
        StoreState.saveOrders(orders);
      }
    }
  } catch (err) {
    console.warn("Using local cache for orders:", err);
    orders = StoreState.getOrders();
  }

  if (!orders || orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
          No customer orders placed yet.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(o => `
    <tr>
      <td style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">#${o.orderId}</td>
      <td>
        <div style="font-weight:700;">${o.customer}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${o.email} ${o.phone ? `• ${o.phone}` : ''}</div>
        <div style="font-size:0.75rem; color:var(--text-dim);">${o.address || ''}</div>
      </td>
      <td style="font-size:0.85rem;">
        ${o.items && o.items.length > 0 
          ? o.items.map(i => `<span style="display:inline-block; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:3px; margin:2px;">${i.name} <strong>x${i.quantity || i.qty || 1}</strong></span>`).join(' ') 
          : '1x Drone'}
      </td>
      <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan);">${o.totalAmount}</td>
      <td>
        <select onchange="updateOrderStatus('${o.orderId}', this.value)" class="form-control" style="padding:0.3rem 0.6rem; font-size:0.85rem; width:auto; border-radius:4px;">
          <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td style="font-size:0.85rem; color:var(--text-muted);">${o.date || 'Today'}</td>
    </tr>
  `).join('');
}

// Update Order Status in MySQL Database
async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch("api/orders.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_status",
        orderId,
        status
      })
    });
    const result = await res.json();

    if (res.ok && result.success) {
      showToast(`Order #${orderId} set to ${status}`);
    } else {
      throw new Error(result.message || "Failed to update status");
    }
  } catch (err) {
    // Local fallback
    const orders = StoreState.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = status;
      StoreState.saveOrders(orders);
    }
    showToast(`Order #${orderId} status set to ${status}`);
  }
}

// Reset Demo Data
async function resetDefaultData() {
  if (confirm("Reset drone catalog to default demo fleet? Any custom added drones will be reset.")) {
    localStorage.removeItem("aerox_products");
    StoreState.cachedProducts = null;
    await renderProductsTable();
    await renderAdminStats();
    showToast("Catalog reset to factory default products");
  }
}
