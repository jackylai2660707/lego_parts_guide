console.log("Admin JS Loaded v9");

let partsData = [];
let currentEditTarget = null; // { categoryId, subIndex, partIndex }
let modal, closeModal, editForm, deleteBtn;

// Define openEditModal globally
window.openEditModal = (categoryId, subIndex, partIndex) => {
    try {
        console.log('=== openEditModal START ===');
        console.log('1. 參數:', { categoryId, subIndex, partIndex });
        currentEditTarget = { categoryId, subIndex, partIndex };

        console.log('2. partsData:', partsData ? `有資料 (${partsData.length}筆)` : '無資料');
        if (!partsData || partsData.length === 0) {
            alert('系統正在讀取資料，請稍後再試 (Data Loading)');
            return;
        }

        console.log('3. 尋找分類:', categoryId);
        const category = partsData.find(c => c.id === categoryId);
        if (!category) {
            alert('錯誤：找不到分類 ' + categoryId);
            return;
        }
        console.log('3. 找到分類:', category.title);

        const sub = category.subcategories[subIndex];
        if (!sub) {
            alert('錯誤：找不到子分類 index ' + subIndex);
            return;
        }
        console.log('4. 找到子分類:', sub.title);

        console.log('5. 取得 modal 元素...');
        if (!modal) modal = document.getElementById('edit-modal');
        if (!editForm) editForm = document.getElementById('edit-form');
        if (!deleteBtn) deleteBtn = document.getElementById('delete-part-btn');
        console.log('5. modal 元素:', modal ? '找到' : '未找到');
        console.log('5. editForm 元素:', editForm ? '找到' : '未找到');

        if (partIndex >= 0) {
            console.log('6. 編輯模式');
            const part = sub.parts[partIndex];
            document.getElementById('modal-title').textContent = '編輯零件';
            document.getElementById('part-id').value = part.id;
            document.getElementById('part-name').value = part.name;
            document.getElementById('part-visual').value = part.visual || '';
            document.getElementById('part-color').value = part.colorId || 86;
            document.getElementById('part-element').value = part.elementId || '';
            document.getElementById('part-custom-image').value = part.customImage || '';
            deleteBtn.style.display = 'block';
        } else {
            console.log('6. 新增模式');
            document.getElementById('modal-title').textContent = '新增零件';
            editForm.reset();
            document.getElementById('part-color').value = 86;
            deleteBtn.style.display = 'none';
        }

        console.log('7. 強制顯示 modal 並置中');

        // 強制設定所有相關的 CSS 屬性
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '10000';
        modal.style.pointerEvents = 'auto';

        // 關鍵：強制設定 position 和置中
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

        console.log('7. Modal 已顯示!');
        console.log('===openEditModal END ===');
    } catch (e) {
        console.error('!!! Modal Error !!!:', e);
        console.error('Error stack:', e.stack);
        alert('發生錯誤：' + e.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const adminContent = document.getElementById('admin-content');
    const saveAllBtn = document.getElementById('save-all-btn');

    // Initialize Modal Elements
    modal = document.getElementById('edit-modal');
    closeModal = document.querySelector('.close-modal');
    editForm = document.getElementById('edit-form');
    deleteBtn = document.getElementById('delete-part-btn');

    // Update status
    const statusEl = document.createElement('div');
    statusEl.id = 'system-status';
    statusEl.style.position = 'fixed';
    statusEl.style.bottom = '10px';
    statusEl.style.right = '10px';
    statusEl.style.background = '#4CAF50';
    statusEl.style.color = 'white';
    statusEl.style.padding = '5px 10px';
    statusEl.style.borderRadius = '5px';
    statusEl.style.zIndex = '9999';
    statusEl.textContent = '系統就緒 (v9)';
    document.body.appendChild(statusEl);

    // --- Authentication ---
    const token = localStorage.getItem('adminToken');
    if (token) {
        showDashboard();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                showDashboard();
            } else {
                loginError.textContent = '帳號或密碼錯誤';
            }
        } catch (err) {
            loginError.textContent = '登入失敗，請檢查伺服器';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        location.reload();
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        fetchData();
    }

    // --- Password Change ---
    const passwordForm = document.getElementById('password-form');
    const passwordMessage = document.getElementById('password-message');

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        passwordMessage.textContent = '';
        passwordMessage.className = 'message';

        if (newPassword !== confirmPassword) {
            passwordMessage.textContent = '新密碼與確認密碼不符';
            passwordMessage.classList.add('error');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                passwordMessage.textContent = data.message || '密碼已更新';
                passwordMessage.classList.add('success');
                passwordForm.reset();
            } else {
                passwordMessage.textContent = data.error || '更新失敗';
                passwordMessage.classList.add('error');
            }
        } catch (err) {
            passwordMessage.textContent = '連線錯誤，請檢查伺服器';
            passwordMessage.classList.add('error');
        }
    });

    // --- Data Management ---
    async function fetchData() {
        try {
            const res = await fetch('/api/parts');
            partsData = await res.json();
            renderAdminView();
        } catch (err) {
            alert('無法載入資料');
        }
    }

    async function saveData() {
        try {
            const res = await fetch('/api/parts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partsData)
            });
            if (res.ok) {
                alert('儲存成功！');
            } else {
                alert('儲存失敗');
            }
        } catch (err) {
            alert('儲存錯誤');
        }
    }

    saveAllBtn.addEventListener('click', saveData);

    // --- Rendering ---
    function renderAdminView() {
        adminContent.innerHTML = '';

        partsData.forEach((category, catIndex) => {
            const catDiv = document.createElement('div');
            catDiv.className = 'admin-category';
            catDiv.innerHTML = `<h3>${category.title}</h3>`;

            category.subcategories.forEach((sub, subIndex) => {
                const subDiv = document.createElement('div');
                subDiv.className = 'admin-subcategory';
                subDiv.innerHTML = `<h4>${sub.title}</h4>`;

                const list = document.createElement('div');

                sub.parts.forEach((part, partIndex) => {
                    const item = document.createElement('div');
                    item.className = 'admin-part-item';
                    item.innerHTML = `
                        <span><b>${part.id}</b> - ${part.name}</span>
                        <button class="edit-btn" onclick="openEditModal('${category.id}', ${subIndex}, ${partIndex})">編輯</button>
                    `;
                    list.appendChild(item);
                });

                // Add Part Button
                const addBtn = document.createElement('button');
                addBtn.className = 'add-part-btn';
                addBtn.textContent = '+ 新增零件';
                addBtn.onclick = () => openEditModal(category.id, subIndex, -1);
                list.appendChild(addBtn);

                subDiv.appendChild(list);
                catDiv.appendChild(subDiv);
            });

            adminContent.appendChild(catDiv);
        });
    }

    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { categoryId, subIndex, partIndex } = currentEditTarget;
        const category = partsData.find(c => c.id === categoryId);
        const sub = category.subcategories[subIndex];

        const newPart = {
            id: document.getElementById('part-id').value,
            name: document.getElementById('part-name').value,
            visual: document.getElementById('part-visual').value,
            colorId: parseInt(document.getElementById('part-color').value),
            elementId: document.getElementById('part-element').value || undefined,
            customImage: document.getElementById('part-custom-image').value || undefined
        };

        if (partIndex >= 0) {
            sub.parts[partIndex] = newPart;
        } else {
            sub.parts.push(newPart);
        }

        renderAdminView();
        modal.style.display = 'none';
    });

    deleteBtn.addEventListener('click', () => {
        if (!confirm('確定要刪除此零件嗎？')) return;

        const { categoryId, subIndex, partIndex } = currentEditTarget;
        if (partIndex >= 0) {
            const category = partsData.find(c => c.id === categoryId);
            category.subcategories[subIndex].parts.splice(partIndex, 1);
            renderAdminView();
            modal.style.display = 'none';
        }
    });
});
