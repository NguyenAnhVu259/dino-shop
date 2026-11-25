const ADMIN_ACCOUNTS = ["admin", "shopdino"];

const ICON_PRIMO = `src="images/primogem.jpg" class="w-5 h-5 object-contain rounded-full mix-blend-lighten shrink-0"`;
const ICON_PINK = `src="images/pink-fate.jpg" class="w-5 h-5 object-contain rounded-full mix-blend-lighten shrink-0"`;
const ICON_BLUE = `src="images/blue-fate.jpg" class="w-5 h-5 object-contain rounded-full mix-blend-lighten shrink-0"`;

const BANK_CONFIG = {
  bankId: "ICB",
  bankName: "VietinBank",
  accountNo: "101882763366",
  accountName: "NGUYEN ANH VU"
};

const defaultProducts = [
  { id: "p1", code: "1", name: "Acc Reroll 100 Roll #01", price: 150000, primogems: "~16.000", pink: 20, blue: 40 },
  { id: "p2", code: "2", name: "Acc Reroll 100 Roll #02", price: 150000, primogems: "~16.000", pink: 20, blue: 40 },
  { id: "p3", code: "3", name: "Acc Reroll 100 Roll #03", price: 150000, primogems: "~16.000", pink: 20, blue: 40 }
];

let products = JSON.parse(localStorage.getItem("dino_100roll_products")) || defaultProducts;
let balance = Number(localStorage.getItem("dino_balance")) || 0;
let orders = JSON.parse(localStorage.getItem("dino_orders")) || [];
let users = JSON.parse(localStorage.getItem("dino_users")) || [];
let currentUser = localStorage.getItem("dino_current_user") || "";
let rememberedUser = localStorage.getItem("dino_remembered_user") || "";
let editingProductId = null;

function isAdminUser() {
  return ADMIN_ACCOUNTS.includes((currentUser || "").trim().toLowerCase());
}

function getUserRoleLabel() {
  if (!currentUser) return "Khách";
  return isAdminUser() ? "Admin" : "Khách hàng";
}

function formatMoney(num) {
  return Number(num).toLocaleString("vi-VN") + "đ";
}

function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

function renderAuthArea() {
  const authArea = document.getElementById("auth-area");
  const roleBadge = isAdminUser()
    ? `<span class="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded ml-1">ADMIN</span>`
    : `<span class="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">KHÁCH</span>`;

  if (currentUser) {
    const initial = currentUser.slice(0, 2).toUpperCase();
    authArea.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-full border border-slate-700">
        <div class="w-7 h-7 rounded-full ${isAdminUser() ? "bg-amber-400" : "bg-lime-500"} text-slate-950 font-bold text-xs flex items-center justify-center">${initial}</div>
        <div class="text-xs leading-tight">
          <div class="flex items-center">
            <p class="font-semibold text-white max-w-[90px] truncate">${currentUser}</p>
            ${roleBadge}
          </div>
          <p id="user-balance" class="text-lime-400 font-bold">${formatMoney(balance)}</p>
        </div>
      </div>
      <button onclick="handleLogout()" title="Đăng xuất"
        class="bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 px-2.5 py-2 rounded-xl text-xs transition cursor-pointer">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;
  } else {
    authArea.innerHTML = `
      <div class="hidden sm:flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
        <span class="text-slate-400">Ví:</span>
        <span id="user-balance" class="text-lime-400 font-bold">${formatMoney(balance)}</span>
      </div>
      <button onclick="openAuthModal('login')"
        class="bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-lime-500/40 transition cursor-pointer">
        <i class="fa-solid fa-right-to-bracket mr-1"></i> Đăng Nhập
      </button>
    `;
  }

  const hintEl = document.getElementById("role-hint");
  if (hintEl) {
    hintEl.innerHTML = isAdminUser()
      ? `<i class="fa-solid fa-shield-halved text-amber-400 mr-1"></i> Admin (${currentUser})`
      : `<i class="fa-solid fa-user text-sky-400 mr-1"></i> ${getUserRoleLabel()}`;
  }

  const addBtn = document.getElementById("admin-add-btn");
  if (addBtn) {
    addBtn.classList.toggle("hidden", !isAdminUser());
  }
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">Chưa có sản phẩm nào.</p>`;
    return;
  }

  const adminMode = isAdminUser();
  grid.innerHTML = products.map(item => `
    <div class="bg-[#151f28] border border-slate-700 hover:border-lime-400/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
      <div class="space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold bg-lime-500/20 text-lime-400 px-2 py-0.5 rounded">Mã số: ${item.code}</span>
        </div>

        <h4 class="font-extrabold text-base text-white">${item.name}</h4>

        <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-xs font-extrabold">
          <div class="flex items-center gap-2 text-amber-300">
            <img ${ICON_PRIMO} alt="Nguyên thạch" />
            <span>${item.primogems}</span>
          </div>
          <div class="flex items-center gap-2 text-pink-300">
            <img ${ICON_PINK} alt="Roll hồng" />
            <span>${item.pink}</span>
          </div>
          <div class="flex items-center gap-2 text-sky-300">
            <img ${ICON_BLUE} alt="Roll xanh" />
            <span>${item.blue}</span>
          </div>
        </div>

        <p class="text-rose-500 font-black text-lg pt-0.5">${formatNumber(item.price)} đ</p>
      </div>

      <div class="space-y-1.5">
        <button onclick="buyProduct('${item.id}')"
          class="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer">
          Mua Ngay
        </button>

        ${adminMode ? `
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="openProductForm('${item.id}')"
              class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs py-1.5 rounded-lg transition cursor-pointer">
              <i class="fa-solid fa-pen mr-1"></i> Sửa
            </button>
            <button onclick="deleteProduct('${item.id}')"
              class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs py-1.5 rounded-lg transition cursor-pointer">
              <i class="fa-solid fa-trash mr-1"></i> Xóa
            </button>
          </div>
        ` : ""}
      </div>
    </div>
  `).join("");
}

function updateUI() {
  renderAuthArea();
  renderProducts();
  document.getElementById("outer-acc-count").innerText = products.length;
  document.getElementById("order-count").innerText = orders.length;
  localStorage.setItem("dino_100roll_products", JSON.stringify(products));
  localStorage.setItem("dino_balance", balance);
  localStorage.setItem("dino_orders", JSON.stringify(orders));
  localStorage.setItem("dino_users", JSON.stringify(users));
  localStorage.setItem("dino_current_user", currentUser);
  if (rememberedUser) {
    localStorage.setItem("dino_remembered_user", rememberedUser);
  } else {
    localStorage.removeItem("dino_remembered_user");
  }
}

function openRoll100Modal() {
  renderProducts();
  openModal("roll100-modal");
}

function openProductForm(prodId = null) {
  if (!isAdminUser()) return;
  editingProductId = prodId;

  if (prodId) {
    const item = products.find(p => p.id === prodId);
    if (!item) return;
    document.getElementById("product-form-title").innerText = "Sửa Sản Phẩm";
    document.getElementById("prod-code").value = item.code;
    document.getElementById("prod-name").value = item.name;
    document.getElementById("prod-price").value = item.price;
    document.getElementById("prod-primo").value = item.primogems;
    document.getElementById("prod-pink").value = item.pink;
    document.getElementById("prod-blue").value = item.blue;
  } else {
    document.getElementById("product-form-title").innerText = "Thêm Sản Phẩm";
    document.getElementById("prod-code").value = String(products.length + 1);
    document.getElementById("prod-name").value = "";
    document.getElementById("prod-price").value = 150000;
    document.getElementById("prod-primo").value = "~16.000";
    document.getElementById("prod-pink").value = 20;
    document.getElementById("prod-blue").value = 40;
  }

  openModal("product-form-modal");
}

function handleSaveProduct(e) {
  e.preventDefault();
  if (!isAdminUser()) return;

  const code = document.getElementById("prod-code").value.trim();
  const name = document.getElementById("prod-name").value.trim();
  const price = Number(document.getElementById("prod-price").value);
  const primogems = document.getElementById("prod-primo").value.trim();
  const pink = Math.max(0, Math.floor(Number(document.getElementById("prod-pink").value)));
  const blue = Math.max(0, Math.floor(Number(document.getElementById("prod-blue").value)));

  if (!code || !name || !primogems) return;

  if (editingProductId) {
    const item = products.find(p => p.id === editingProductId);
    if (item) {
      item.code = code;
      item.name = name;
      item.price = price;
      item.primogems = primogems;
      item.pink = pink;
      item.blue = blue;
    }
  } else {
    products.push({
      id: "p_" + Date.now(),
      code,
      name,
      price,
      primogems,
      pink,
      blue
    });
  }

  closeModal("product-form-modal");
  updateUI();
}

function deleteProduct(prodId) {
  if (!isAdminUser()) return;
  if (!confirm("Xóa sản phẩm này?")) return;
  products = products.filter(p => p.id !== prodId);
  updateUI();
}

function buyProduct(prodId) {
  const index = products.findIndex(p => p.id === prodId);
  if (index === -1) return;

  const item = products[index];
  if (balance < item.price) {
    alert("Số dư ví không đủ! Hãy bấm 'Nạp Tiền'.");
    return;
  }

  balance -= item.price;
  products.splice(index, 1);

  orders.unshift({
    id: "#" + item.code,
    customer: currentUser || "Khách",
    role: getUserRoleLabel(),
    productName: item.name,
    price: formatMoney(item.price),
    accInfo: `Mã số acc: ${item.code} | ${item.primogems} NT • ${item.pink} Hồng • ${item.blue} Xanh`,
    time: new Date().toLocaleString("vi-VN")
  });

  updateUI();
  alert("Mua thành công Mã số acc: " + item.code);
}

function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  el.classList.add("flex");
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  icon.classList.toggle("fa-eye", !isHidden);
  icon.classList.toggle("fa-eye-slash", isHidden);
}

function openAuthModal(tab = "login") {
  document.getElementById("auth-error").classList.add("hidden");
  document.getElementById("reg-error").classList.add("hidden");

  const passInput = document.getElementById("login-password");
  const eyeIcon = document.getElementById("eye-login");
  passInput.type = "password";
  eyeIcon.classList.add("fa-eye");
  eyeIcon.classList.remove("fa-eye-slash");

  const userInput = document.getElementById("login-username");
  const checkRemember = document.getElementById("remember-account");
  if (rememberedUser) {
    userInput.value = rememberedUser;
    checkRemember.checked = true;
  } else {
    userInput.value = "";
    checkRemember.checked = false;
  }

  switchAuthTab(tab);
  openModal("auth-modal");
}

function switchAuthTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("auth-modal-title").innerText = isLogin ? "Đăng Nhập" : "Đăng Ký";
  document.getElementById("login-form").classList.toggle("hidden", !isLogin);
  document.getElementById("register-form").classList.toggle("hidden", isLogin);

  document.getElementById("tab-login").className = isLogin
    ? "py-2 rounded-lg bg-lime-500 text-slate-950 transition cursor-pointer"
    : "py-2 rounded-lg text-slate-400 hover:text-white transition cursor-pointer";

  document.getElementById("tab-register").className = !isLogin
    ? "py-2 rounded-lg bg-lime-500 text-slate-950 transition cursor-pointer"
    : "py-2 rounded-lg text-slate-400 hover:text-white transition cursor-pointer";
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const remember = document.getElementById("remember-account").checked;
  const errEl = document.getElementById("auth-error");

  const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!found) {
    errEl.innerText = "Sai tên đăng nhập hoặc mật khẩu.";
    errEl.classList.remove("hidden");
    return;
  }

  currentUser = found.username;
  rememberedUser = remember ? found.username : "";
  errEl.classList.add("hidden");
  document.getElementById("login-form").reset();
  updateUI();
  closeModal("auth-modal");
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;
  const errEl = document.getElementById("reg-error");

  if (password !== confirm) {
    errEl.innerText = "Mật khẩu nhập lại không khớp.";
    errEl.classList.remove("hidden");
    return;
  }

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    errEl.innerText = "Tên đăng nhập đã tồn tại.";
    errEl.classList.remove("hidden");
    return;
  }

  users.push({ username, password });
  currentUser = username;
  rememberedUser = username;
  errEl.classList.add("hidden");
  document.getElementById("register-form").reset();
  updateUI();
  closeModal("auth-modal");
}

function handleLogout() {
  currentUser = "";
  updateUI();
}

let depositLogs = JSON.parse(localStorage.getItem("dino_deposit_logs")) || [];
let currentDepositCode = "";

function generateDepositCode() {
  return String(Math.floor(10000 + Math.random() * 89999));
}

function getDepositMemo() {
  const userTag = (currentUser || "KHACH")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);
  return `DINO ${userTag} ${currentDepositCode}`;
}

function updateQrPreview() {
  const amount = Math.max(0, Number(document.getElementById("deposit-amount-input").value) || 0);
  const memo = getDepositMemo();
  document.getElementById("bank-display-name").innerText = BANK_CONFIG.bankName;
  document.getElementById("bank-owner-name").innerText = BANK_CONFIG.accountName;
  document.getElementById("bank-account-number").innerText = BANK_CONFIG.accountNo;
  document.getElementById("bank-memo-text").value = memo;

  const qrImg = document.getElementById("vietqr-image");
  const baseUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png`;
  const params = new URLSearchParams({
    addInfo: memo,
    accountName: BANK_CONFIG.accountName
  });
  if (amount > 0) {
    params.set("amount", String(Math.floor(amount)));
  }
  qrImg.src = `${baseUrl}?${params.toString()}`;
}

function selectDepositPreset(amount) {
  document.getElementById("deposit-amount-input").value = amount;
  updateQrPreview();
}

function onDepositAmountChange() {
  updateQrPreview();
}

function copyText(elementId) {
  const text = document.getElementById(elementId).innerText.trim();
  navigator.clipboard?.writeText(text);
  alert("Đã sao chép: " + text);
}

function copyMemo() {
  const memo = document.getElementById("bank-memo-text").value.trim();
  navigator.clipboard?.writeText(memo);
  alert("Đã sao chép nội dung chuyển khoản: " + memo);
}

function confirmTestDeposit() {
  const amount = Math.floor(Number(document.getElementById("deposit-amount-input").value) || 0);
  if (amount <= 0) {
    alert("Vui lòng nhập hoặc chọn số tiền muốn nạp trước!");
    return;
  }

  const memo = document.getElementById("bank-memo-text").value.trim();
  balance += amount;

  depositLogs.unshift({
    code: currentDepositCode,
    user: currentUser || "Khách",
    role: getUserRoleLabel(),
    memo,
    amount: formatMoney(amount),
    time: new Date().toLocaleString("vi-VN")
  });
  localStorage.setItem("dino_deposit_logs", JSON.stringify(depositLogs));

  updateUI();
  alert(`Đã cộng +${formatMoney(amount)} cho nick "${currentUser || "Khách"}"!\nMã giao dịch: ${memo}`);
  closeModal("deposit-modal");
}

function openDepositModal() {
  currentDepositCode = generateDepositCode();
  document.getElementById("deposit-amount-input").value = "";
  updateQrPreview();
  openModal("deposit-modal");
}

function openHistoryModal() {
  const listEl = document.getElementById("history-list");
  if (orders.length === 0) {
    listEl.innerHTML = `<p class="text-center text-slate-400 py-8">Chưa có đơn mua nào.</p>`;
  } else {
    listEl.innerHTML = orders.map(o => `
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div class="flex justify-between items-center">
          <span class="font-bold text-lime-400">${o.id} - ${o.productName}</span>
          <span class="text-xs text-amber-400 font-bold">${o.price}</span>
        </div>
        <p class="text-xs text-amber-300 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">${o.accInfo}</p>
        <p class="text-[11px] text-slate-500">${o.customer} (${o.role}) • ${o.time}</p>
      </div>
    `).join("");
  }
  openModal("history-modal");
}

function clearHistory() {
  orders = [];
  updateUI();
  openHistoryModal();
}

updateUI();