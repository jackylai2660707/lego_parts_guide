document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-container');
    const searchInput = document.getElementById('search-input');
    const navContainer = document.getElementById('category-nav');
    const backToTopBtn = document.getElementById('back-to-top');

    let partsData = []; // Will be fetched from API
    let currentCategoryFilter = null; // null means 'All'
    let selectedParts = []; // For batch selection

    // Update batch action bar UI
    function updateBatchUI() {
        const bar = document.getElementById('batch-action-bar');
        const count = document.getElementById('batch-count');
        if (selectedParts.length > 0) {
            bar.classList.add('visible');
            count.textContent = `已選擇 ${selectedParts.length} 個零件`;
        } else {
            bar.classList.remove('visible');
        }
    }

    // Toggle part selection
    function togglePartSelection(partId, checkbox) {
        const idx = selectedParts.indexOf(partId);
        if (idx === -1) {
            selectedParts.push(partId);
            checkbox.closest('.part-card').classList.add('selected');
        } else {
            selectedParts.splice(idx, 1);
            checkbox.closest('.part-card').classList.remove('selected');
        }
        updateBatchUI();
    }

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

            // Add drag-drop reorder for admin
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                btn.draggable = true;
                btn.dataset.catIndex = partsData.indexOf(category);

                btn.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', btn.dataset.catIndex);
                    btn.classList.add('dragging');
                };

                btn.ondragend = () => {
                    btn.classList.remove('dragging');
                };

                btn.ondragover = (e) => {
                    e.preventDefault();
                    btn.classList.add('drag-over');
                };

                btn.ondragleave = () => {
                    btn.classList.remove('drag-over');
                };

                btn.ondrop = (e) => {
                    e.preventDefault();
                    btn.classList.remove('drag-over');
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = parseInt(btn.dataset.catIndex);

                    if (fromIndex !== toIndex) {
                        // Reorder partsData
                        const [movedItem] = partsData.splice(fromIndex, 1);
                        partsData.splice(toIndex, 0, movedItem);

                        // Save and re-render
                        saveData(partsData);
                        renderNav();
                        renderParts(searchInput.value.toLowerCase());
                    }
                };
            }

            navContainer.appendChild(btn);
        });

        // Add "Add Category" button to nav if admin
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            const addCatBtn = document.createElement('button');
            addCatBtn.className = 'nav-btn';
            addCatBtn.textContent = '+ 新增主分類';
            addCatBtn.style.border = '2px dashed #ccc';
            // Wait for functions to be defined or define them before
            // Since functions are hoisted or defined on window, this is fine
            addCatBtn.onclick = () => openCategoryModal('add');
            navContainer.appendChild(addCatBtn);
        }
    }

    // --- Rendering Logic ---
    function renderParts(filterText = '') {
        container.innerHTML = '';
        const adminToken = localStorage.getItem('adminToken');

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

            // Admin: Edit Category Name & Delete Category & Add Subcategory
            if (adminToken) {
                const catMgmtDiv = document.createElement('div');
                catMgmtDiv.style.marginBottom = '1rem';

                const editCatBtn = document.createElement('button');
                editCatBtn.className = 'mgmt-btn';
                editCatBtn.textContent = '編輯分類名稱';
                editCatBtn.onclick = () => editCategoryName(category.id);
                catMgmtDiv.appendChild(editCatBtn);

                const delCatBtn = document.createElement('button');
                delCatBtn.className = 'mgmt-btn';
                delCatBtn.textContent = '刪除分類';
                delCatBtn.style.color = 'red';
                delCatBtn.onclick = () => deleteCategory(category.id);
                catMgmtDiv.appendChild(delCatBtn);

                const addSubBtn = document.createElement('button');
                addSubBtn.className = 'mgmt-btn';
                addSubBtn.textContent = '+ 新增子分類';
                addSubBtn.onclick = () => addSubcategory(category.id);
                catMgmtDiv.appendChild(addSubBtn);

                categorySection.appendChild(catMgmtDiv);
            }

            let hasVisibleContent = false;
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

                // Admin: Edit Subcategory Name & Delete Subcategory
                if (adminToken) {
                    const subMgmtDiv = document.createElement('div');
                    subMgmtDiv.style.marginBottom = '0.5rem';

                    const editSubBtn = document.createElement('button');
                    editSubBtn.className = 'mgmt-btn';
                    editSubBtn.textContent = '編輯名稱';
                    editSubBtn.onclick = () => editSubcategoryName(category.id, subIndex);
                    subMgmtDiv.appendChild(editSubBtn);

                    const delSubBtn = document.createElement('button');
                    delSubBtn.className = 'mgmt-btn';
                    delSubBtn.textContent = '刪除子分類';
                    delSubBtn.style.color = 'red';
                    delSubBtn.onclick = () => deleteSubcategory(category.id, subIndex);
                    subMgmtDiv.appendChild(delSubBtn);

                    subDiv.appendChild(subMgmtDiv);
                }

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
                    if (adminToken) {
                        const btnContainer = document.createElement('div');
                        btnContainer.style.display = 'flex';
                        btnContainer.style.gap = '0.5rem';
                        btnContainer.style.marginTop = '0.5rem';

                        // Move Button
                        const moveBtn = document.createElement('button');
                        moveBtn.className = 'action-btn';
                        moveBtn.textContent = '移動';
                        moveBtn.onclick = () => openMoveModal(part.id);
                        btnContainer.appendChild(moveBtn);

                        // Edit Button
                        const editBtn = document.createElement('button');
                        editBtn.className = 'action-btn';
                        editBtn.textContent = '編輯';
                        editBtn.onclick = () => openEditModal(category.id, subIndex, partIndex);
                        btnContainer.appendChild(editBtn);

                        card.appendChild(btnContainer);
                    }

                    // Add checkbox for batch selection (admin only)
                    if (adminToken) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'part-checkbox';
                        checkbox.checked = selectedParts.includes(part.id);
                        checkbox.onclick = (e) => {
                            e.stopPropagation();
                            togglePartSelection(part.id, checkbox);
                        };
                        card.insertBefore(checkbox, card.firstChild);
                        if (selectedParts.includes(part.id)) {
                            card.classList.add('selected');
                        }
                    }

                    // Prepend image container
                    card.insertBefore(imgContainer, card.querySelector('.part-checkbox') ? card.children[1] : card.firstChild);

                    grid.appendChild(card);
                });


                subDiv.appendChild(grid);

                // Add Part Button (if admin)
                if (adminToken) {
                    const addBtn = document.createElement('button');
                    addBtn.className = 'add-part-btn';
                    addBtn.textContent = '+ 新增零件';
                    addBtn.style.marginTop = '1rem';
                    addBtn.onclick = () => openEditModal(category.id, subIndex, -1);
                    subDiv.appendChild(addBtn);
                }

                // Show subcategory if it has content or user is admin
                if (grid.children.length > 0 || sub.description || adminToken) {
                    categorySection.appendChild(subDiv);
                    hasVisibleContent = true;
                }
            });

            if (hasVisibleContent || adminToken) {
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

        modal.style.display = 'flex';
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
                    renderNav(); // Update navigation bar real-time
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('儲存發生錯誤！');
            });
    }

    // --- Batch Move Logic ---
    let isBatchMode = false;
    const batchMoveBtn = document.getElementById('batch-move-btn');
    const batchClearBtn = document.getElementById('batch-clear-btn');

    batchMoveBtn.onclick = () => {
        if (selectedParts.length === 0) return;
        isBatchMode = true;
        // Show move modal for batch
        document.getElementById('move-part-name').textContent = `正在批量移動 ${selectedParts.length} 個零件`;

        // Populate Categories
        categorySelect.innerHTML = '';
        partsData.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.title;
            categorySelect.appendChild(option);
        });
        populateSubcategories();
        modal.style.display = 'flex';
    };

    batchClearBtn.onclick = () => {
        selectedParts = [];
        updateBatchUI();
        renderParts(searchInput.value.toLowerCase());
    };

    // Extend saveMoveBtn to handle batch
    const originalSaveMove = saveMoveBtn.onclick;
    saveMoveBtn.onclick = () => {
        if (isBatchMode && selectedParts.length > 0) {
            const newCatId = categorySelect.value;
            const newSubTitle = subcategorySelect.value;
            const newCat = partsData.find(c => c.id === newCatId);
            const newSub = newCat?.subcategories.find(s => s.title === newSubTitle);

            if (!newSub) {
                alert('請選擇有效的分類');
                return;
            }

            let movedCount = 0;
            selectedParts.forEach(partId => {
                // Find and remove part
                for (const cat of partsData) {
                    for (const sub of cat.subcategories) {
                        const idx = sub.parts.findIndex(p => p.id === partId);
                        if (idx !== -1) {
                            const partObj = sub.parts.splice(idx, 1)[0];
                            newSub.parts.push(partObj);
                            movedCount++;
                            break;
                        }
                    }
                }
            });

            // Save and update
            saveData(partsData);
            selectedParts = [];
            updateBatchUI();
            isBatchMode = false;
            modal.style.display = 'none';
            alert(`已批量移動 ${movedCount} 個零件至: ${newCat.title} > ${newSub.title}`);
        } else if (currentMovingPartId) {
            // Original single move logic
            const newCatId = categorySelect.value;
            const newSubTitle = subcategorySelect.value;

            let partObj = null;
            for (const cat of partsData) {
                for (const sub of cat.subcategories) {
                    const idx = sub.parts.findIndex(p => p.id === currentMovingPartId);
                    if (idx !== -1) {
                        partObj = sub.parts.splice(idx, 1)[0];
                        break;
                    }
                }
                if (partObj) break;
            }

            if (partObj) {
                const newCat = partsData.find(c => c.id === newCatId);
                const newSub = newCat.subcategories.find(s => s.title === newSubTitle);
                if (newSub) {
                    newSub.parts.push(partObj);
                    saveData(partsData);
                    renderParts(searchInput.value.toLowerCase());
                    modal.style.display = 'none';
                    alert(`已將零件移動至: ${newCat.title} > ${newSub.title}`);
                }
            }
            currentMovingPartId = null;
        }
    };

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

        editModal.style.display = 'flex';
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

    // --- Category Management Functions ---
    // --- Category Management Functions (Updated for Modal) ---
    const catModal = document.getElementById('category-modal');
    const catForm = document.getElementById('category-form');
    const catIdInput = document.getElementById('cat-id');
    const catNameInput = document.getElementById('cat-name');
    const catDescInput = document.getElementById('cat-desc');
    const catOriginalIdInput = document.getElementById('cat-original-id');
    const catModeInput = document.getElementById('cat-mode');

    // Close modal logic handled by general close button code above (shared class .close-modal)
    // But we need to make sure clicks outside close it too:
    window.addEventListener('click', (event) => {
        if (event.target == catModal) {
            catModal.style.display = 'none';
        }
    });

    window.openCategoryModal = (mode, categoryId = null) => {
        catModal.style.display = 'flex';
        catModeInput.value = mode;
        if (mode === 'edit' && categoryId) {
            const cat = partsData.find(c => c.id === categoryId);
            if (!cat) return;
            document.getElementById('category-modal-title').textContent = '編輯主分類';
            catOriginalIdInput.value = categoryId;
            catIdInput.value = cat.id;
            catIdInput.disabled = true; // ID cannot be changed in edit mode usually
            catNameInput.value = cat.title;
            catDescInput.value = cat.description || '';
        } else {
            document.getElementById('category-modal-title').textContent = '新增主分類';
            catForm.reset();
            catIdInput.disabled = false;
            catModeInput.value = 'add';
        }
    }

    catForm.onsubmit = (e) => {
        e.preventDefault();
        const mode = catModeInput.value;
        const id = catIdInput.value.trim();
        const name = catNameInput.value.trim();
        const desc = catDescInput.value.trim();

        if (!id || !name) {
            alert('ID 和名稱為必填！');
            return;
        }

        if (mode === 'add') {
            if (partsData.some(c => c.id === id)) {
                alert('此 ID 已存在！');
                return;
            }
            partsData.push({
                id: id,
                title: name,
                description: desc,
                subcategories: []
            });
        } else {
            // Edit Mode
            const originalId = catOriginalIdInput.value;
            const cat = partsData.find(c => c.id === originalId);
            if (cat) {
                cat.title = name;
                cat.description = desc;
                // If we allowed ID editing, we would check for duplicates again, but currently disabled
            }
        }

        saveData(partsData);
        catModal.style.display = 'none';
    };

    window.editCategoryName = (catId) => {
        openCategoryModal('edit', catId);
    };

    window.deleteCategory = (catId) => {
        if (!confirm('確定要刪除此主分類及其所有內容嗎？此操作無法復原！')) return;
        const idx = partsData.findIndex(c => c.id === catId);
        if (idx !== -1) {
            partsData.splice(idx, 1);
            saveData(partsData);
        }
    };

    window.addSubcategory = (catId) => {
        const cat = partsData.find(c => c.id === catId);
        if (!cat) return;
        const name = prompt('請輸入新子分類名稱:');
        if (name && name.trim() !== '') {
            cat.subcategories.push({
                title: name.trim(),
                description: "",
                parts: []
            });
            saveData(partsData);
        }
    };

    window.editSubcategoryName = (catId, subIndex) => {
        const cat = partsData.find(c => c.id === catId);
        if (!cat || !cat.subcategories[subIndex]) return;
        const newName = prompt('請輸入新的子分類名稱:', cat.subcategories[subIndex].title);
        if (newName && newName.trim() !== '') {
            cat.subcategories[subIndex].title = newName.trim();
            saveData(partsData);
        }
    };

    window.deleteSubcategory = (catId, subIndex) => {
        if (!confirm('確定要刪除此子分類及其所有零件嗎？')) return;
        const cat = partsData.find(c => c.id === catId);
        if (cat && cat.subcategories[subIndex]) {
            cat.subcategories.splice(subIndex, 1);
            saveData(partsData);
        }
    };


});
