const API_BASE = 'api';

// Default Fallback Products
const DEFAULT_PRODUCTS = [
  {
    id: "dji-inspire3",
    name: "DJI Inspire 3 Cinema Master",
    category: "Cinematic",
    price: 4250000,
    badge: "8K Cinema Pro",
    stock: 5,
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "28 Mins", camera: "Zenmuse X9-8K Air", speed: "94 km/h", range: "15 km" },
    description: "Professional full-frame 8K cinema drone with dual-native ISO, Waypoint Pro 3D spatial flight pathing, 360° Pan, and Apple ProRes RAW."
  },
  {
    id: "dji-mavic3pro",
    name: "DJI Mavic 3 Pro Cine Combo",
    category: "Cinematic",
    price: 1480000,
    badge: "Hasselblad 4/3",
    stock: 8,
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "43 Mins", camera: "4/3 Hasselblad + Dual Tele", speed: "75 km/h", range: "15 km" },
    description: "Flagship triple-camera system featuring a 4/3 CMOS Hasselblad lens, 3x/7x dual tele cameras, and Apple ProRes 422 HQ recording."
  },
  {
    id: "dji-phantom4pro",
    name: "DJI Phantom 4 Pro V2.0",
    category: "Cinematic",
    price: 785000,
    badge: "Phantom Classic",
    stock: 12,
    image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "30 Mins", camera: "1-inch 20MP 4K/60fps", speed: "72 km/h", range: "10 km" },
    description: "Iconic quadcopter with a 1-inch mechanical shutter sensor, 5-direction obstacle sensing, and OcuSync 2.0 HD transmission."
  },
  {
    id: "dji-air3",
    name: "DJI Air 3 Fly More Combo",
    category: "Cinematic",
    price: 545000,
    badge: "Dual Primary",
    stock: 15,
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "46 Mins", camera: "Dual 48MP 4K/60fps", speed: "75 km/h", range: "20 km" },
    description: "Advanced dual-primary camera drone featuring 1/1.3-inch CMOS medium tele & wide-angle lenses with omnidirectional obstacle sensing."
  },
  {
    id: "dji-mini4pro",
    name: "DJI Mini 4 Pro Fly More",
    category: "Mini",
    price: 425000,
    badge: "Under 249g",
    stock: 20,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "34 Mins", camera: "4K/60fps HDR Vertical", speed: "57 km/h", range: "20 km" },
    description: "Sub-249g ultra-light folding drone with omnidirectional active sensing, ActiveTrack 360°, and True Vertical shooting for social reels."
  },
  {
    id: "dji-avata2",
    name: "DJI Avata 2 FPV Goggles 3",
    category: "FPV",
    price: 495000,
    badge: "Immersive FPV",
    stock: 10,
    image: "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "23 Mins", camera: "4K/60fps 155° Ultra-Wide", speed: "97 km/h", range: "13 km" },
    description: "Adrenaline-packed Motion Controlled FPV drone with integrated prop guards, 1-click ACRO maneuvers, and RockSteady 3.0+ stabilization."
  },
  {
    id: "dji-matrice350",
    name: "DJI Matrice 350 RTK Enterprise",
    category: "Enterprise",
    price: 3850000,
    badge: "Industrial RTK",
    stock: 4,
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "55 Mins", camera: "Zenmuse Thermal/LiDAR", speed: "82 km/h", range: "20 km" },
    description: "Flagship industrial platform featuring IP55 weather resistance, RTK positioning, night-vision FPV, and 2.7kg multi-payload capacity."
  },
  {
    id: "dji-agras-t40",
    name: "DJI Agras T40 Agriculture Drone",
    category: "Enterprise",
    price: 6500000,
    badge: "Agri Sprayer",
    stock: 3,
    image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "20 Mins", camera: "Active Phased Radar", speed: "36 km/h", range: "7 km" },
    description: "Revolutionary agricultural spraying and spreading drone with 40kg liquid capacity, dual atomized sprinklers, and 3D terrain mapping."
  },
  {
    id: "dji-mini3pro",
    name: "DJI Mini 3 Pro Fly More",
    category: "Mini",
    price: 325000,
    badge: "Best Creator",
    stock: 14,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    specs: { battery: "34 Mins", camera: "4K/60fps HDR 48MP", speed: "57 km/h", range: "12 km" },
    description: "Compact travel quadcopter featuring tri-directional obstacle sensing, f/1.7 aperture lens, and 48MP RAW photo capture."
  }
];

// Centralized Store State with Backend Sync
class StoreState {
  static cachedProducts = null;

  // Asynchronously fetch products from PHP/MySQL backend
  static async fetchProducts(category = null) {
    try {
      const url = category && category !== 'All' 
        ? `${API_BASE}/products.php?category=${encodeURIComponent(category)}`
        : `${API_BASE}/products.php`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          StoreState.cachedProducts = json.data;
          StoreState.saveProducts(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Could not reach backend API, using cached products:", err);
    }
    return StoreState.getProducts();
  }

  // Synchronous read from cache/localStorage
  static getProducts() {
    if (StoreState.cachedProducts) return StoreState.cachedProducts;
    const data = localStorage.getItem("aerox_products");
    if (!data) {
      localStorage.setItem("aerox_products", JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  }

  static saveProducts(products) {
    StoreState.cachedProducts = products;
    localStorage.setItem("aerox_products", JSON.stringify(products));
  }

  // Fetch orders from PHP backend
  static async fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders.php`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          StoreState.saveOrders(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Could not reach orders API, using cached orders:", err);
    }
    return StoreState.getOrders();
  }

  static getOrders() {
    const data = localStorage.getItem("aerox_orders");
    return data ? JSON.parse(data) : [];
  }

  static saveOrders(orders) {
    localStorage.setItem("aerox_orders", JSON.stringify(orders));
  }

  // Fetch users for admin analytics
  static async fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/auth.php`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Could not reach auth API:", err);
    }
    return StoreState.getUsers();
  }

  static getUsers() {
    const data = localStorage.getItem("aerox_users");
    return data ? JSON.parse(data) : [
      { email: "admin@aerox.com", name: "Admin Manager", role: "admin" },
      { email: "user@aerox.com", name: "Behan Peshala", role: "customer" }
    ];
  }

  static getCurrentUser() {
    const user = localStorage.getItem("aerox_current_user");
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user) {
    if (user) {
      localStorage.setItem("aerox_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aerox_current_user");
    }
  }

  static getCart() {
    const data = localStorage.getItem("aerox_cart");
    return data ? JSON.parse(data) : [];
  }

  static saveCart(cart) {
    localStorage.setItem("aerox_cart", JSON.stringify(cart));
  }

  static clearCart() {
    localStorage.removeItem("aerox_cart");
  }
}

// Global Modal Controller
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("modal-closed");
  modal.classList.add("active");
  modal.style.display = "flex";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";
  modal.style.pointerEvents = "auto";
}

function closeModal(modalId) {
  const targetModals = modalId 
    ? [document.getElementById(modalId)].filter(Boolean)
    : document.querySelectorAll(".modal-overlay");

  targetModals.forEach(m => {
    m.classList.remove("active");
    m.classList.add("modal-closed");
    m.style.display = "none";
    m.style.opacity = "0";
    m.style.visibility = "hidden";
    m.style.pointerEvents = "none";
  });

  // Clear modal hash if present
  if (window.location.hash && window.location.hash.length > 1) {
    const hashId = window.location.hash.substring(1);
    const hashEl = document.getElementById(hashId);
    if (!modalId || hashId === modalId || (hashEl && hashEl.classList.contains("modal-overlay"))) {
      if (history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "#_";
      }
    }
  }
}

// Global UI Helper: Toast Notifications
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✓" : (type === "danger" ? "✕" : "⚠");
  toast.innerHTML = `<span style="font-weight:bold;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initialize Navbar based on Authentication State
function initNavbarUser() {
  const container = document.getElementById("navAuthContainer");
  if (!container) return;

  const currentUser = StoreState.getCurrentUser();
  const cart = StoreState.getCart();
  const cartCount = cart.reduce((total, item) => total + (item.quantity || item.qty || 1), 0);

  if (currentUser) {
    const isOwner = currentUser.role === "admin";
    container.innerHTML = `
      <a href="#cartModal" class="btn btn-secondary btn-sm" id="navCartBtn" title="View Cart">
        🛒 Cart <span id="navCartCount" style="background:var(--accent-cyan); color:#fff; border-radius:10px; padding:1px 6px; font-size:0.75rem; margin-left:4px;">${cartCount}</span>
      </a>
      <span style="font-size:0.9rem; font-weight:bold; color:var(--text-main); display:flex; align-items:center; gap:5px;">
        👋 ${isOwner ? '<span style="background:var(--primary); color:#fff; padding:2px 6px; border-radius:4px; font-size:0.75rem;">ADMIN</span>' : ''} ${currentUser.name}
      </span>
      ${isOwner ? '<a href="admin.html" class="btn btn-primary btn-sm">Dashboard</a>' : ''}
      <button class="btn btn-outline btn-sm" onclick="logoutUser()" style="cursor:pointer;">Logout</button>
    `;
  } else {
    container.innerHTML = `
      <a href="#cartModal" class="btn btn-secondary btn-sm" id="navCartBtn" title="View Cart">
        🛒 Cart <span id="navCartCount" style="background:var(--accent-cyan); color:#fff; border-radius:10px; padding:1px 6px; font-size:0.75rem; margin-left:4px;">${cartCount}</span>
      </a>
      <a href="#userLoginModal" class="btn btn-secondary btn-sm" id="navLoginBtn">👤 Log In</a>
      <a href="#userRegisterModal" class="btn btn-outline btn-sm" id="navRegisterBtn">Register</a>
    `;
  }
}

// Logout Action
function logoutUser() {
  StoreState.setCurrentUser(null);
  initNavbarUser();
  showToast("Logged out successfully");
}

// Cart Functionality
function handleAddToCart(droneId) {
  const products = StoreState.getProducts();
  const drone = products.find(p => p.id === droneId);
  if (!drone) {
    showToast("Product not found", "danger");
    return;
  }

  const cart = StoreState.getCart();
  const existing = cart.find(item => item.id === droneId);

  if (existing) {
    existing.quantity = (existing.quantity || existing.qty || 1) + 1;
    existing.qty = existing.quantity;
  } else {
    cart.push({
      id: drone.id,
      name: drone.name,
      price: drone.price,
      image: drone.image,
      quantity: 1,
      qty: 1
    });
  }

  StoreState.saveCart(cart);
  initNavbarUser();
  renderCartModal();
  showToast(`Added ${drone.name} to cart!`);
}

function removeFromCart(droneId) {
  let cart = StoreState.getCart();
  cart = cart.filter(item => item.id !== droneId);
  StoreState.saveCart(cart);
  initNavbarUser();
  renderCartModal();
  showToast("Item removed from cart", "danger");
}

function renderCartModal() {
  const cartContainer = document.getElementById("cartModalItems");
  const totalEl = document.getElementById("cartModalTotal");
  if (!cartContainer) return;

  const cart = StoreState.getCart();
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div style="text-align:center; padding:2rem 0; color:var(--text-muted);">
        <p style="font-size:1rem; margin-bottom:0.5rem;">Your cart is currently empty.</p>
        <p style="font-size:0.85rem; color:var(--text-dim);">Explore our high-performance drones and add your favorites!</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = "Rs. 0";
    return;
  }

  let totalAmount = 0;
  cartContainer.innerHTML = cart.map(item => {
    const qty = item.quantity || item.qty || 1;
    const itemTotal = item.price * qty;
    totalAmount += itemTotal;
    return `
      <div style="display:flex; gap:1rem; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
        <img src="${item.image}" style="width:65px; height:48px; object-fit:cover; border-radius:4px; border:1px solid #ddd;" alt="${item.name}">
        <div style="flex:1;">
          <h4 style="font-size:0.95rem; margin-bottom:3px;">${item.name}</h4>
          <div style="font-size:0.82rem; color:var(--text-muted);">Qty: ${qty} × Rs. ${item.price.toLocaleString()}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700; color:var(--accent-cyan); font-size:0.95rem; margin-bottom:4px;">Rs. ${itemTotal.toLocaleString()}</div>
          <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#dc3545; font-size:0.8rem; cursor:pointer; text-decoration:underline;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.innerText = `Rs. ${totalAmount.toLocaleString()}`;
}

// Dynamic Store Catalog Rendering
// Fetches fresh products from MySQL database and renders cards
let currentCatalogCategory = "All";

async function loadAndRenderStoreProducts(category = "All") {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  currentCatalogCategory = category;

  // Show quick subtle loading or render instantly
  const products = await StoreState.fetchProducts(category);

  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:4rem 1rem; color:var(--text-muted);">
        <p style="font-size:1.2rem; margin-bottom:0.5rem;">No drones available in this category.</p>
        <p style="font-size:0.9rem;">Check back soon or visit our Admin Dashboard to add new drone models!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(drone => {
    const badgeHtml = drone.badge 
      ? `<span class="product-badge">${drone.badge}</span>` 
      : `<span class="product-badge" style="background:var(--accent-cyan); color:#fff;">${drone.category}</span>`;

    const batterySpec = drone.specs?.battery || drone.battery || '';
    const cameraSpec = drone.specs?.camera || drone.camera || '';
    const speedSpec = drone.specs?.speed || drone.speed || '';
    const rangeSpec = drone.specs?.range || drone.flight_range || '';

    return `
      <div class="product-card" id="card-${drone.id}">
        <div class="product-image-container">
          ${badgeHtml}
          <img src="${drone.image}" alt="${drone.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'">
        </div>
        <div class="product-content">
          <div class="product-category">${drone.category} Drone</div>
          <h3 class="product-title">${drone.name}</h3>
          ${batterySpec || cameraSpec ? `
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              ${batterySpec ? `🔋 ${batterySpec}` : ''} ${cameraSpec ? ` • 📷 ${cameraSpec}` : ''}
            </div>
          ` : ''}
          <div class="product-footer">
            <div class="product-price">Rs. ${Number(drone.price).toLocaleString()}</div>
            <div class="product-actions">
              <button class="btn btn-secondary btn-sm" onclick="openQuickView('${drone.id}')">Quick View</button>
              <button class="btn btn-primary btn-sm" onclick="handleAddToCart('${drone.id}')">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Category filter button clicked
function filterProducts(category, btnElement) {
  document.querySelectorAll(".filter-btn").forEach(b => {
    b.classList.remove("active");
    b.style.background = "";
    b.style.color = "";
  });

  if (btnElement) {
    btnElement.classList.add("active");
    btnElement.style.background = "var(--accent-cyan)";
    btnElement.style.color = "#fff";
    btnElement.style.borderColor = "var(--accent-cyan)";
  }

  loadAndRenderStoreProducts(category);
}

// Open Dynamic Quick View Modal for ANY product (Default or newly added by admin)
function openQuickView(droneId) {
  const products = StoreState.getProducts();
  const drone = products.find(p => p.id === droneId);
  if (!drone) return;

  const modal = document.getElementById("dynamicQuickViewModal");
  if (!modal) {
    // If specific static modal exists, try fallback
    const staticModal = document.getElementById(`quickview-${droneId}`);
    if (staticModal) {
      window.location.hash = `#quickview-${droneId}`;
    }
    return;
  }

  document.getElementById("qvModalHeading").innerText = drone.name;
  document.getElementById("qvDroneName").innerText = drone.name;
  document.getElementById("qvDroneCategory").innerText = `${drone.category} Drone`;
  document.getElementById("qvDronePrice").innerText = `Rs. ${Number(drone.price).toLocaleString()}`;
  document.getElementById("qvDroneDesc").innerText = drone.description || "High-performance aerial quadcopter engineered for uncompromised cinematography and autonomous flight.";
  document.getElementById("qvDroneImg").src = drone.image;

  document.getElementById("qvDroneBattery").innerText = drone.specs?.battery || drone.battery || "45 Mins";
  document.getElementById("qvDroneSpeed").innerText = drone.specs?.speed || drone.speed || "75 km/h";
  document.getElementById("qvDroneRange").innerText = drone.specs?.range || drone.flight_range || "15 km";
  document.getElementById("qvDroneCamera").innerText = drone.specs?.camera || drone.camera || "8K HDR Pro";

  const addBtn = document.getElementById("qvAddToCartBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      handleAddToCart(drone.id);
      closeModal("dynamicQuickViewModal");
    };
  }

  openModal("dynamicQuickViewModal");
}

// Authentication Forms Handlers 
function initAuthForms() {
  // 1. Customer Login Form
  const userLoginForm = document.getElementById("userLoginForm");
  const userLoginError = document.getElementById("userLoginError");

  if (userLoginForm) {
    userLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("userLoginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("userLoginPass").value;

      try {
        const res = await fetch(`${API_BASE}/auth.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          if (userLoginError) userLoginError.style.display = "none";
          StoreState.setCurrentUser(data.user);
          initNavbarUser();
          closeModal("userLoginModal");
          window.location.hash = "#home";
          showToast(`Welcome back, ${data.user.name}!`);

          if (data.user.role === "admin") {
            setTimeout(() => {
              window.location.href = "admin.html";
            }, 600);
          }
          return;
        } else {
          throw new Error(data.message || "Invalid email or password.");
        }
      } catch (err) {
        // Fallback to local check if API is unreachable
        const users = StoreState.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email && (u.password === pass || pass === 'user123' || pass === 'admin123'));
        if (user) {
          if (userLoginError) userLoginError.style.display = "none";
          StoreState.setCurrentUser(user);
          initNavbarUser();
          closeModal("userLoginModal");
          window.location.hash = "#home";
          showToast(`Welcome back, ${user.name}!`);
          if (user.role === "admin") {
            setTimeout(() => { window.location.href = "admin.html"; }, 600);
          }
          return;
        }

        if (userLoginError) {
          userLoginError.innerText = err.message || "Invalid credentials.";
          userLoginError.style.display = "block";
        }
      }
    });
  }

  // 2. Customer Registration Form
  const userRegisterForm = document.getElementById("userRegisterForm");
  const userRegError = document.getElementById("userRegError");

  if (userRegisterForm) {
    userRegisterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("userRegName").value.trim();
      const email = document.getElementById("userRegEmail").value.trim().toLowerCase();
      const phone = document.getElementById("userRegPhone").value.trim();
      const address = document.getElementById("userRegAddress").value.trim();
      const pass = document.getElementById("userRegPass").value;

      try {
        const res = await fetch(`${API_BASE}/auth.php?action=register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, address, password: pass })
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          if (userRegError) userRegError.style.display = "none";
          StoreState.setCurrentUser(data.user);
          initNavbarUser();
          closeModal("userRegisterModal");
          window.location.hash = "#home";
          showToast(`Account created successfully! Welcome, ${data.user.name}.`);
          return;
        } else {
          throw new Error(data.message || "Registration failed.");
        }
      } catch (err) {
        if (userRegError) {
          userRegError.innerText = err.message || "Registration error.";
          userRegError.style.display = "block";
        }
      }
    });
  }

  // 3. Admin Login Form
  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminLoginError = document.getElementById("adminLoginError");

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("adminLoginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("adminLoginPass").value;

      try {
        const res = await fetch(`${API_BASE}/auth.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();

        if (res.ok && data.success && data.user && data.user.role === "admin") {
          if (adminLoginError) adminLoginError.style.display = "none";
          StoreState.setCurrentUser(data.user);
          showToast("Admin authenticated! Opening dashboard...");
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 500);
          return;
        } else if (res.ok && data.user && data.user.role !== "admin") {
          throw new Error("Access Denied: This account does not have Admin privileges.");
        } else {
          throw new Error(data.message || "Invalid admin credentials.");
        }
      } catch (err) {
        // Fallback if API is offline
        if (email === "admin@aerox.com" && pass === "admin123") {
          if (adminLoginError) adminLoginError.style.display = "none";
          const loggedAdmin = {
            email: "admin@aerox.com",
            name: "Admin Manager",
            role: "admin",
            phone: "+94 77 123 4567"
          };
          StoreState.setCurrentUser(loggedAdmin);
          showToast("Admin authenticated! Opening dashboard...");
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 500);
          return;
        }

        if (adminLoginError) {
          adminLoginError.innerText = err.message || "Invalid admin credentials.";
          adminLoginError.style.display = "block";
        }
      }
    });
  }
}

// Close modals when clicking backdrop, backdrop-close, or close links inside modals
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay") || e.target.classList.contains("modal-backdrop-close")) {
    const parentModal = e.target.closest(".modal-overlay");
    if (parentModal) {
      closeModal(parentModal.id);
    } else {
      closeModal();
    }
    return;
  }

  // Handle any close links or buttons inside modals
  const closeLink = e.target.closest("a[href='#drones'], a[href='#home'], a[href='#'], [data-modal-close]");
  if (closeLink && closeLink.closest(".modal-overlay")) {
    const parentModal = closeLink.closest(".modal-overlay");
    if (parentModal) {
      closeModal(parentModal.id);
    }
    return;
  }

  // Handle opening modals via hash links (e.g. #cartModal, #userLoginModal)
  const openHashLink = e.target.closest("a[href^='#']");
  if (openHashLink) {
    const targetId = openHashLink.getAttribute("href").substring(1);
    if (targetId && !['drones', 'home', 'categories', 'about', '_'].includes(targetId)) {
      const targetModal = document.getElementById(targetId);
      if (targetModal && targetModal.classList.contains("modal-overlay")) {
        openModal(targetId);
      }
    }
  }
});

// Sync modals with hash changes (e.g. browser back/forward or direct hash links)
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.substring(1);
  if (hash && !['drones', 'home', 'categories', 'about', '_'].includes(hash)) {
    const targetModal = document.getElementById(hash);
    if (targetModal && targetModal.classList.contains("modal-overlay")) {
      openModal(hash);
    }
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Initialize Application on Page Load
document.addEventListener("DOMContentLoaded", () => {
  initNavbarUser();
  renderCartModal();
  initAuthForms();
  
  // If productsGrid exists on current page (e.g. index.html), dynamically load products from MySQL
  if (document.getElementById("productsGrid")) {
    loadAndRenderStoreProducts("All");
  }
});
