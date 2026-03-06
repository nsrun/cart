(function () {
            // ---------- CART STATE ----------
            let cartItems = [];   // each item: { id, name, price, iconClass, quantity } (quantity always 1 for this demo, but we can collapse duplicates)
            // we collapse duplicates: if same id added again, increase quantity

            // DOM elements
            const cartListEl = document.getElementById('cartList');
            const cartCountEl = document.getElementById('cartCount');
            const cartTotalEl = document.getElementById('cartTotal');
            const clearCartBtn = document.getElementById('clearCartBtn');
            const checkoutBtn = document.getElementById('checkoutDummy');
            const toastEl = document.getElementById('liveToast');
            const toastMsg = document.getElementById('toastMessage');

            // helper: get product data from the product card (nearest .product-item)
            function getProductDataFromButton(btn) {
                const productCard = btn.closest('.product-item');
                if (!productCard) return null;
                const id = productCard.dataset.id;
                const name = productCard.dataset.name;
                const price = parseFloat(productCard.dataset.price);
                // icon: find the icon inside .product-icon i, get class list (like 'fas fa-headphones')
                const iconI = productCard.querySelector('.product-icon i');
                let iconClass = 'fa-bag-shopping'; // fallback
                if (iconI) {
                    // get second class (e.g. 'fa-headphones') – better get all and join?
                    const classList = iconI.classList;
                    // we want something like "fa-headphones", but we can store both? for simplicity we store the whole class string?
                    // we'll store the icon as a string of classes (excluding "fas"/"far" maybe). For safety, we store the last class?
                    // simpler: get the second class name if exists
                    const classes = Array.from(classList);
                    const specificIcon = classes.find(cls => cls.startsWith('fa-') && cls !== 'fas' && cls !== 'fa-regular' && cls !== 'fa-solid' && cls !== 'fa-brands');
                    iconClass = specificIcon || 'fa-box';
                }
                return { id, name, price, icon: iconClass };
            }

            // show toast for 1.5 sec
            function showToast(text) {
                toastMsg.innerText = text;
                toastEl.classList.remove('hidden');
                setTimeout(() => {
                    toastEl.classList.add('hidden');
                }, 1500);
            }

            // Add to cart logic
            function addItemToCart(productId, productName, productPrice, productIcon) {
                // check if item already exists
                const existingIndex = cartItems.findIndex(item => item.id === productId);
                if (existingIndex !== -1) {
                    // increase quantity (just to demonstrate, we treat quantity as separate)
                    cartItems[existingIndex].quantity += 1;
                } else {
                    // push new item with quantity = 1
                    cartItems.push({
                        id: productId,
                        name: productName,
                        price: productPrice,
                        icon: productIcon,
                        quantity: 1
                    });
                }
                renderCart();
                showToast(`➕ ${productName} added`);
            }

            // remove single instance? we only have clear all and add. But for a more robust experience, we implement remove by clicking on item? 
            // but spec only ask "create a add to cart", we keep it simple. However we add a little X to remove items? yes, for better UX, let's allow remove line.
            // but to keep simple, we'll add small remove on each cart item (trash can). That's intuitive.

            function removeCartItem(itemId) {
                cartItems = cartItems.filter(item => item.id !== itemId);
                renderCart();
                showToast(`🗑️ item removed`);
            }

            // clear all items
            function clearCart() {
                if (cartItems.length === 0) {
                    showToast('cart already empty');
                    return;
                }
                cartItems = [];
                renderCart();
                showToast('🧹 cart cleared');
            }

            // render cart list and totals
            function renderCart() {
                // update count
                const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
                cartCountEl.innerText = totalItems;

                // update total price
                const totalPrice = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                cartTotalEl.innerText = `$${totalPrice.toFixed(2)}`;

                // clear list
                cartListEl.innerHTML = '';

                if (cartItems.length === 0) {
                    cartListEl.innerHTML = '<li class="empty-cart-msg"><i class="fa-regular fa-face-smile"></i> Your cart feels lonely — add something!</li>';
                    return;
                }

                // loop through cart items
                cartItems.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'cart-item';
                    li.dataset.id = item.id;

                    // left side with icon and name + quantity
                    const leftDiv = document.createElement('div');
                    leftDiv.className = 'cart-item-left';

                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'cart-item-icon';
                    iconSpan.innerHTML = `<i class="fas ${item.icon}"></i>`;

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'cart-item-name';
                    nameSpan.innerText = item.quantity > 1 ? `${item.name}  x${item.quantity}` : item.name;

                    leftDiv.appendChild(iconSpan);
                    leftDiv.appendChild(nameSpan);

                    // price + remove button
                    const rightDiv = document.createElement('div');
                    rightDiv.style.display = 'flex';
                    rightDiv.style.alignItems = 'center';
                    rightDiv.style.gap = '0.8rem';

                    const priceSpan = document.createElement('span');
                    priceSpan.className = 'cart-item-price';
                    priceSpan.innerText = `$${(item.price * item.quantity).toFixed(2)}`;

                    const removeBtn = document.createElement('button');
                    removeBtn.setAttribute('aria-label', 'remove item');
                    removeBtn.style.background = 'none';
                    removeBtn.style.border = 'none';
                    removeBtn.style.color = '#8faccf';
                    removeBtn.style.cursor = 'pointer';
                    removeBtn.style.fontSize = '1rem';
                    removeBtn.style.padding = '4px 8px';
                    removeBtn.style.borderRadius = '30px';
                    removeBtn.style.transition = 'all 0.1s';
                    removeBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
                    removeBtn.onmouseover = () => { removeBtn.style.color = '#c00040'; };
                    removeBtn.onmouseout = () => { removeBtn.style.color = '#8faccf'; };
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        removeCartItem(item.id);
                    };

                    rightDiv.appendChild(priceSpan);
                    rightDiv.appendChild(removeBtn);

                    li.appendChild(leftDiv);
                    li.appendChild(rightDiv);
                    cartListEl.appendChild(li);
                });
            }

            // ---- EVENT LISTENERS ----
            // 1. all add buttons (inside product-grid)
            document.querySelectorAll('.add-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productCard = btn.closest('.product-item');
                    if (!productCard) return;

                    const id = productCard.dataset.id;
                    const name = productCard.dataset.name;
                    const price = parseFloat(productCard.dataset.price);
                    // extract icon from product-icon i
                    const iconI = productCard.querySelector('.product-icon i');
                    let icon = 'fa-box';  // fallback
                    if (iconI) {
                        const classes = Array.from(iconI.classList);
                        const iconClass = classes.find(cls => cls.startsWith('fa-') && cls !== 'fas' && cls !== 'fa-regular' && cls !== 'fa-solid');
                        icon = iconClass || 'fa-box';
                    }
                    addItemToCart(id, name, price, icon);
                });
            });

            // 2. clear cart button
            clearCartBtn.addEventListener('click', () => {
                clearCart();
            });

            // 3. dummy checkout (just feedback)
            checkoutBtn.addEventListener('click', () => {
                if (cartItems.length === 0) {
                    showToast('cart empty — add items first');
                } else {
                    showToast('✨ checkout demo (no payment)');
                    // optionally reset cart after checkout? not needed, but we could clear as gesture? 
                    // let's keep cart unchanged for demo, but we can add optional clear. Better keep.
                }
            });

            // 4. remove via cart item (already bound dynamically inside renderCart, but removeCartItem exists)

            // initial render (empty)
            renderCart();

            // optional: we could prepopulate with one item to demo, but empty is fine.
            // but we can add a tiny seed for demonstration: uncomment next lines if you want initial cart
            // setTimeout(() => {
            //   addItemToCart('p1', 'Wireless Headphones', 79.99, 'fa-headphones');
            // }, 200);
            // leave empty to see empty state.
        })();