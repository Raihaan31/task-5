// ---- State & Helpers ----
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const productListDiv = document.getElementById('product-list');
const productDetailDiv = document.getElementById('product-detail');
const cartModalDiv = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');

function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ---- Product Listing ----
async function fetchAndDisplayProducts() {
  productListDiv.innerHTML = 'Loading products...';
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    const products = await res.json();
    productListDiv.innerHTML = '';
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${prod.image}" alt="${prod.title}" />
        <div class="product-title">${prod.title}</div>
        <div class="product-price">$${prod.price}</div>
        <button class="add-cart-btn">Add to Cart</button>
      `;
      // Show detail on card click (except Add to Cart)
      card.addEventListener('click', e => {
        if (!e.target.classList.contains('add-cart-btn')) showProductDetail(prod.id);
      });
      // Add to cart
      card.querySelector('.add-cart-btn').addEventListener('click', e => {
        e.stopPropagation();
        addToCart(prod);
      });
      productListDiv.appendChild(card);
    });
  } catch {
    productListDiv.innerHTML = "Failed to load products.";
  }
}

// ---- Product Detail Modal ----
async function showProductDetail(id) {
  productDetailDiv.innerHTML = '<div class="modal-content">Loading...</div>';
  productDetailDiv.style.display = 'flex';
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const prod = await res.json();
    productDetailDiv.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <h2>${prod.title}</h2>
        <img src="${prod.image}" alt="${prod.title}" style="max-width:150px;"/>
        <p style="margin:1em 0;">${prod.description}</p>
        <p style="color:#008060;font-weight:bold;">$${prod.price}</p>
        <button class="add-cart-btn">Add to Cart</button>
      </div>
    `;
    productDetailDiv.querySelector('.modal-close').onclick = () => productDetailDiv.style.display = 'none';
    productDetailDiv.querySelector('.add-cart-btn').onclick = () => {
      addToCart(prod);
      productDetailDiv.style.display = 'none';
    };
  } catch {
    productDetailDiv.innerHTML = '<div class="modal-content">Failed to load product.</div>';
  }
}
productDetailDiv.onclick = e => { if (e.target === productDetailDiv) productDetailDiv.style.display = 'none'; };

// ---- Cart ----
function addToCart(product) {
  const idx = cart.findIndex(item => item.id === product.id);
  if (idx !== -1) cart[idx].qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  updateCartCount();
  showCart();
}

function showCart() {
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartModalDiv.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <h2>Your Cart</h2>
      <ul class="cart-list">
        ${cart.length === 0 ? '<li>Your cart is empty.</li>' : cart.map(item => `
          <li class="cart-item">
            <img src="${item.image}" alt="${item.title}" />
            <span class="cart-item-title">${item.title} x${item.qty}</span>
            <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
          </li>`).join('')}
      </ul>
      <div class="cart-total">Total: $${total.toFixed(2)}</div>
    </div>
  `;
  cartModalDiv.style.display = 'flex';
  cartModalDiv.querySelector('.modal-close').onclick = () => cartModalDiv.style.display = 'none';
  cartModalDiv.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = (e) => {
      const id = +btn.getAttribute('data-id');
      cart = cart.filter(item => item.id !== id);
      updateCartCount();
      showCart();
    };
  });
}
cartModalDiv.onclick = e => { if (e.target === cartModalDiv) cartModalDiv.style.display = 'none'; };
cartBtn.onclick = showCart;

// ---- Init ----
fetchAndDisplayProducts();
updateCartCount();