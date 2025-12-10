document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-container');
    const searchInput = document.getElementById('search-input');
    const navContainer = document.getElementById('category-nav');
    const backToTopBtn = document.getElementById('back-to-top');

    let partsData = []; // Will be fetched from API
    let currentCategoryFilter = null; // null means 'All'

    // --- Fetch Data ---
    fetch('/api/parts')
        .then(response => response.json())
        .then(data => {
            partsData = data;
            renderNav();
            renderParts();
        })
        .catch(error => {
            console.error('Error fetching parts data:', error);
            container.innerHTML = '<p style="text-align:center; color:red;">無法載入資料，請確認伺服器已啟動。</p>';
        });

    // --- Back to Top Logic ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Navigation Logic ---
    function renderNav() {
        navContainer.innerHTML = '';

        // 'All' Button
        const allBtn = document.createElement('button');
        allBtn.className = `nav-btn ${currentCategoryFilter === null ? 'active' : ''}`;
        allBtn.textContent = '全部顯示';
        allBtn.onclick = () => {
            currentCategoryFilter = null;
            renderNav();
            renderParts(searchInput.value.toLowerCase());
        };
        navContainer.appendChild(allBtn);

        // Category Buttons
        partsData.forEach(category => {
            const btn = document.createElement('button');
            btn.className = `nav-btn ${currentCategoryFilter === category.id ? 'active' : ''}`;
            // Extract simplified title (remove number prefix)
            const simpleTitle = category.title.split('：')[1] || category.title;
            btn.textContent = simpleTitle.split('(')[0].trim(); // Remove English part for button brevity

            btn.onclick = () => {
                currentCategoryFilter = category.id;
                renderNav();
                renderParts(searchInput.value.toLowerCase());
            };
            navContainer.appendChild(btn);
        });
    }

    // --- Rendering Logic ---
    function renderParts(filterText = '') {
        container.innerHTML = '';

        partsData.forEach((category, catIndex) => {
            // 1. Category Filter Check
            if (currentCategoryFilter && category.id !== currentCategoryFilter) {
                return;
            }

            // 2. Search Text Filter Check
            const categoryMatches = category.title.toLowerCase().includes(filterText) ||
                category.subcategories.some(sub =>
                    sub.title.toLowerCase().includes(filterText) ||
                    sub.parts.some(p => p.name.toLowerCase().includes(filterText) || p.id.includes(filterText))
                );

            if (!categoryMatches && filterText) return;

            const categorySection = document.createElement('section');
            categorySection.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.title;
            categorySection.appendChild(title);

            if (category.description) {
                const desc = document.createElement('p');
                desc.className = 'category-desc';
                desc.textContent = category.description;
                categorySection.appendChild(desc);
            }

            category.subcategories.forEach((sub, subIndex) => {
                // Check if subcategory matches filter
                const subMatches = sub.title.toLowerCase().includes(filterText) ||
                    sub.parts.some(p => p.name.toLowerCase().includes(filterText) || p.id.includes(filterText));

                if (!subMatches && filterText && !category.title.toLowerCase().includes(filterText)) return;

                const subDiv = document.createElement('div');
                subDiv.className = 'subcategory';

                const subTitle = document.createElement('h3');
                subTitle.className = 'subcategory-title';
                subTitle.textContent = sub.title;
                subDiv.appendChild(subTitle);

                if (sub.description) {
                    const subDesc = document.createElement('p');
                    subDesc.style.marginBottom = '1rem';
                    subDesc.textContent = sub.description;
                    subDiv.appendChild(subDesc);
                }

                const grid = document.createElement('div');
                grid.className = 'parts-grid';

                sub.parts.forEach((part, partIndex) => {
                    if (filterText &&
                        !part.name.toLowerCase().includes(filterText) &&
                        !part.id.includes(filterText) &&
                        !sub.title.toLowerCase().includes(filterText) &&
                        !category.title.toLowerCase().includes(filterText)) {
                        return;
                    }

                    const card = document.createElement('div');
                    card.className = 'part-card';

                    // Image URL Strategies
                    const colorId = (part.colorId && part.colorId !== 0) ? part.colorId : 11; // Default to black if 0

                    // Rebrickable Color Mapping (Approximate)
                    let rbColor = 0;
                    if (colorId === 86) rbColor = 71;
                    if (colorId === 85) rbColor = 72;
                    if (colorId === 5) rbColor = 4;
                    if (colorId === 2) rbColor = 2;
                    if (colorId === 3) rbColor = 14;
                    if (colorId === 7) rbColor = 1;

                    const strategies = [
                        // BrickLink Part PNG
                        `https://img.bricklink.com/ItemImage/PN/${colorId}/${part.id}.png`,
                        // BrickLink Part JPG
                        `https://img.bricklink.com/ItemImage/P/${colorId}/${part.id}.jpg`,
                        // BrickLink Set (for motors/hubs often listed as sets)
                        `https://img.bricklink.com/ItemImage/SN/0/${part.id}.png`,
                        `https://img.bricklink.com/ItemImage/S/${part.id}.png`,
                        // Rebrickable LDraw (Good for standard parts)
                        `https://cdn.rebrickable.com/media/parts/ldraw/${rbColor}/${part.id}.png`,
                        // Rebrickable Elements (Try generic)
                        `https://cdn.rebrickable.com/media/parts/elements/${part.id}.jpg`,
                        // Fallback to generic BrickLink (no color)
                        `https://img.bricklink.com/ItemImage/PN/11/${part.id}.png`
                    ];

                    // Add Element ID strategy if available (Priority 1)
                    if (part.elementId) {
                        strategies.unshift(`https://cdn.rebrickable.com/media/parts/elements/${part.elementId}.jpg`);
                    }

                    // Add Custom Image strategy if available (Priority 0 - Highest)
                    if (part.customImage) {
                        strategies.unshift(part.customImage);
                    }

                    // Local SVG placeholder instead of external service
                    const placeholderSvg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">No Image</text></svg>`);
                    strategies.push(placeholderSvg);

                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'part-image-container';

                    const img = document.createElement('img');
                    img.className = 'part-image';
                    img.alt = part.name;

                    // Image Load Logic
                    let currentStrategyIndex = 0;

                    const tryNextImage = () => {
                        currentStrategyIndex++;
                        if (currentStrategyIndex < strategies.length) {
                            img.src = strategies[currentStrategyIndex];
                        } else {
                            // All failed - use local SVG placeholder
                            const placeholderSvg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">No Image</text></svg>`);
                            img.src = placeholderSvg;
                        }
                    };

                    img.onerror = tryNextImage;
                    img.src = strategies[0]; // Start with first strategy

                    imgContainer.appendChild(img);

                    card.innerHTML = `
            <span class="part-id">ID: ${part.id}</span>
            <div class="part-name">${part.name}</div>
            <div class="part-visual">${part.visual}</div>
          `;

                    // Conditionally add Buttons if Admin
                    const adminToken = localStorage.getItem('adminToken');
                    if (adminToken) {
                        const btnContainer = document.createElement('div');
                        btnContainer.style.display = 'flex';
                        btnContainer.style.gap = '0.5rem';
                        btnContainer.style.marginTop = '0.5rem';

                        // Move Button
                        const moveBtn = document.createElement('button');
                        moveBtn.className = 'move-btn';
                        moveBtn.textContent = '移動';
                        moveBtn.style.cssText = "padding: 0.3rem 0.6rem; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 0.8rem;";
                        moveBtn.onclick = () => openMoveModal(part.id);
                        btnContainer.appendChild(moveBtn);

                        // Edit Button
                        const editBtn = document.createElement('button');
                        editBtn.className = 'edit-btn';
                        editBtn.textContent = '編輯';
                        editBtn.style.marginLeft = '0'; // Reset margin
                        editBtn.onclick = () => openEditModal(category.id, subIndex, partIndex);
                        btnContainer.appendChild(editBtn);

                        card.appendChild(btnContainer);
                    }

                    // Prepend image container
                    card.insertBefore(imgContainer, card.firstChild);

                    grid.appendChild(card);
                });

                if (grid.children.length > 0) {
                    subDiv.appendChild(grid);

                    // Add Part Button (if admin)
                    const adminToken = localStorage.getItem('adminToken');
                    if (adminToken) {
                        const addBtn = document.createElement('button');
                        addBtn.className = 'add-part-btn';
                        addBtn.textContent = '+ 新增零件';
                        addBtn.style.marginTop = '1rem';
                        addBtn.onclick = () => openEditModal(category.id, subIndex, -1);
                        subDiv.appendChild(addBtn);
                    }

                    categorySection.appendChild(subDiv);
                } else if (!category.description && categorySection.children.length > 1) {
                    categorySection.appendChild(subDiv);
                }
            });

            if (categorySection.children.length > 2) {
                container.appendChild(categorySection);
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        renderParts(e.target.value.toLowerCase());
    });

    // --- Move Category Logic ---
    const modal = document.getElementById('move-modal');
    const closeBtn = document.querySelector('.close-modal');
    const categorySelect = document.getElementById('new-category');
    const subcategorySelect = document.getElementById('new-subcategory');
    const saveMoveBtn = document.getElementById('save-move-btn');
    let currentMovingPartId = null;

    window.openMoveModal = (partId) => {
        currentMovingPartId = partId;
        const part = findPart(partId);
        if (!part) return;

        document.getElementById('move-part-name').textContent = `正在移動: ${part.name} (${part.id})`;

        // Populate Categories
        categorySelect.innerHTML = '';
        partsData.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.title;
            categorySelect.appendChild(option);
        });

        // Trigger subcategory population
        populateSubcategories();

        modal.style.display = 'block';
    };

    categorySelect.addEventListener('change', populateSubcategories);

    function populateSubcategories() {
        const catId = categorySelect.value;
        const category = partsData.find(c => c.id === catId);
        subcategorySelect.innerHTML = '';

        if (category) {
            category.subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.title;
                option.textContent = sub.title;
                subcategorySelect.appendChild(option);
            });
        }
    }

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    saveMoveBtn.onclick = () => {
        if (!currentMovingPartId) return;

        const newCatId = categorySelect.value;
        const newSubTitle = subcategorySelect.value;

        // 1. Find and Remove Part
        let partObj = null;
        let oldCatId = null;
        let oldSubTitle = null;

        for (const cat of partsData) {
            for (const sub of cat.subcategories) {
                const idx = sub.parts.findIndex(p => p.id === currentMovingPartId);
                if (idx !== -1) {
                    partObj = sub.parts[idx];
                    sub.parts.splice(idx, 1);
                    oldCatId = cat.id;
                    oldSubTitle = sub.title;
                    break;
                }
            }
            if (partObj) break;
        }

        if (partObj) {
            // 2. Add to New Category
            const newCat = partsData.find(c => c.id === newCatId);
            const newSub = newCat.subcategories.find(s => s.title === newSubTitle);

            if (newSub) {
                newSub.parts.push(partObj);

                // 3. Save to Server
                saveData(partsData);

                // 4. Update UI
                renderParts(searchInput.value.toLowerCase());
                modal.style.display = 'none';
                alert(`已將零件移動至: ${newCat.title} > ${newSub.title}`);
            }
        }
    };

    function findPart(id) {
        for (const cat of partsData) {
            for (const sub of cat.subcategories) {
                const part = sub.parts.find(p => p.id === id);
                if (part) return part;
            }
        }
        return null;
    }

    function saveData(newData) {
        const token = localStorage.getItem('adminToken');
        fetch('/api/parts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newData),
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('儲存失敗！權限不足或伺服器錯誤。');
                } else {
                    // Refresh data and UI
                    partsData = newData;
                    renderParts(searchInput.value.toLowerCase());
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('儲存發生錯誤！');
            });
    }

    // --- Edit/Add Part Logic ---
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const deletePartBtn = document.getElementById('delete-part-btn');
    let currentEditTarget = null; // { categoryId, subIndex, partIndex }

    // Close buttons for both modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            modal.style.display = 'none';
            editModal.style.display = 'none';
        };
    });

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
        if (event.target == editModal) editModal.style.display = 'none';
    };

    function openEditModal(categoryId, subIndex, partIndex) {
        currentEditTarget = { categoryId, subIndex, partIndex };
        const category = partsData.find(c => c.id === categoryId);
        const sub = category.subcategories[subIndex];

        if (partIndex >= 0) {
            // Edit Mode
            const part = sub.parts[partIndex];
            document.getElementById('edit-modal-title').textContent = '編輯零件';
            document.getElementById('part-id').value = part.id;
            document.getElementById('part-name').value = part.name;
            document.getElementById('part-visual').value = part.visual || '';
            document.getElementById('part-color').value = part.colorId || 86;
            document.getElementById('part-element').value = part.elementId || '';
            document.getElementById('part-custom-image').value = part.customImage || '';
            deletePartBtn.style.display = 'block';
        } else {
            // Add Mode
            document.getElementById('edit-modal-title').textContent = '新增零件';
            editForm.reset();
            document.getElementById('part-color').value = 86;
            deletePartBtn.style.display = 'none';
        }

        editModal.style.display = 'block';
    }

    editForm.onsubmit = (e) => {
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

        saveData(partsData);
        editModal.style.display = 'none';
    };

    deletePartBtn.onclick = () => {
        if (!confirm('確定要刪除此零件嗎？')) return;

        const { categoryId, subIndex, partIndex } = currentEditTarget;
        if (partIndex >= 0) {
            const category = partsData.find(c => c.id === categoryId);
            category.subcategories[subIndex].parts.splice(partIndex, 1);
            saveData(partsData);
            editModal.style.display = 'none';
        }
    };
});
