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

        partsData.forEach(category => {
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

            category.subcategories.forEach(sub => {
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

                sub.parts.forEach(part => {
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

                    // Prepend image container
                    card.insertBefore(imgContainer, card.firstChild);

                    grid.appendChild(card);
                });

                if (grid.children.length > 0) {
                    subDiv.appendChild(grid);
                    categorySection.appendChild(subDiv);
                }
            });

            if (categorySection.children.length > 2) {
                container.appendChild(categorySection);
            } else if (!category.description && categorySection.children.length > 1) {
                container.appendChild(categorySection);
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        renderParts(e.target.value.toLowerCase());
    });
});
