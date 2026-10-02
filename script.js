const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const toast = document.getElementById("toast");
const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const checkoutCart = document.getElementById("checkoutCart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

let cart = [];

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    menuToggle.textContent = navMenu.classList.contains("open") ? "✕" : "☰";
});

document.querySelectorAll("#navMenu a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.textContent = "☰";
    });
});

function parsePrice(price) {
    return Number(String(price).replace(/[^\d]/g, "")) || 0;
}

function formatPrice(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function updateCartBadge() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQuantity;
}

function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = formatPrice(total);
    updateCartBadge();

    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Belum ada item di keranjang.</p>';
        return;
    }

    cartItems.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <span>${item.quantity}x · ${formatPrice(item.price)}</span>
            </div>
            <button type="button" data-name="${item.name}" aria-label="Hapus ${item.name}">−</button>
        </div>
    `).join("");

    cartItems.querySelectorAll("button[data-name]").forEach(button => {
        button.addEventListener("click", () => {
            const itemName = button.dataset.name;
            cart = cart.filter(item => {
                if (item.name === itemName) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        return true;
                    }
                    return false;
                }
                return true;
            });
            renderCart();
        });
    });
}

function addToCart(name, price) {
    const productPrice = parsePrice(price);
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price: productPrice, quantity: 1 });
    }

    renderCart();
    toast.textContent = `${name} ditambahkan ke keranjang.`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 900);
}

cartButton.addEventListener("click", () => {
    cartPanel.classList.toggle("open");
});

closeCart.addEventListener("click", () => {
    cartPanel.classList.remove("open");
});

checkoutCart.addEventListener("click", () => {
    if (!cart.length) {
        toast.textContent = "Keranjang masih kosong.";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 900);
        return;
    }

    const message = cart.map(item => `${item.quantity}x ${item.name} (${formatPrice(item.price)})`).join("\n");
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const url = `https://wa.me/6282211985304?text=${encodeURIComponent(`Halo D'Okeh! Saya mau checkout:\n${message}\n\nTotal: ${formatPrice(total)}`)}`;

    window.open(url, "_blank");
    cartPanel.classList.remove("open");
});

function orderMenu(name, price) {
    addToCart(name, price);
    cartPanel.classList.add("open");
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const top = section.offsetTop - 130;
        if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${current}`
        );
    });
});

document.getElementById("year").textContent = new Date().getFullYear();
renderCart();
