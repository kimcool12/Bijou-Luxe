const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    if (searchInput.classList.contains("w-0")) {
      searchInput.classList.remove("w-0", "opacity-0");
      searchInput.classList.add("w-40", "opacity-100", "mr-2"); // expand smoothly
      searchInput.focus();
    } else {
      searchInput.classList.add("w-0", "opacity-0");
      searchInput.classList.remove("w-40", "opacity-100", "mr-2");
    }
  });
}

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}




// Product Fetching and Rendering
const productContainer = document.getElementById('product-container');

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    if (productContainer) productContainer.innerHTML = '<p class="text-red-500">Failed to load products.</p>';
  }
}

function renderProducts(products) {
  if (!productContainer) return;
  productContainer.innerHTML = '';

  if (products.length === 0) {
    productContainer.innerHTML = '<p class="text-gray-500">No products available yet.</p>';
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'inline-block border border-gray-300 rounded-lg p-4 m-4 text-center shadow-md bg-white';
    productCard.innerHTML = `
            <div class="relative w-60 h-70 overflow-hidden rounded-md mb-4 group">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            </div>
            <h5 class="text-lg font-semibold mt-2">${product.name}</h5>
            <p class="text-gray-600">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" class="mt-3 bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-amber-600 transition duration-300">Add to Cart</button>
        `;
    productContainer.appendChild(productCard);
  });
}

// Cart Logic
let cart = JSON.parse(localStorage.getItem('bijou_cart')) || [];
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

function updateCartUI() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      count += item.quantity;

      const itemElement = document.createElement('div');
      itemElement.className = 'flex justify-between items-center border-b pb-2';
      itemElement.innerHTML = `
                <div>
                    <h4 class="font-medium">${item.name}</h4>
                    <p class="text-sm text-gray-500">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-sm">Remove</button>
            `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;

  if (cartCountElement) {
    cartCountElement.textContent = count;
    cartCountElement.classList.toggle('hidden', count === 0);
  }

  localStorage.setItem('bijou_cart', JSON.stringify(cart));
}

window.addToCart = function (id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCartUI();
  // Open cart feedback
  if (cartModal) cartModal.classList.remove('hidden');
};

window.removeFromCart = function (index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  updateCartUI();

  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      cartModal.classList.remove('hidden');
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartModal.classList.add('hidden');
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const email = "olatundeafolayan419@gmail.com";
      const subject = "New Order from Bijou Luxe";
      let body = "Hello,\n\nI would like to place an order for the following items:\n\n";

      let total = 0;
      cart.forEach(item => {
        body += `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}\n`;
        total += item.price * item.quantity;
      });

      body += `\nTotal: $${total.toFixed(2)}\n\nPlease let me know the next steps for payment and shipping.\n\nThank you!`;

      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
});
