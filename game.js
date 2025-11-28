document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.getElementById('score');
    const roundEl = document.getElementById('round');
    const partImageContainer = document.getElementById('part-image-container');
    const partNameEl = document.getElementById('part-name');
    const partIdEl = document.getElementById('part-id-display');
    const optionsGrid = document.getElementById('options-grid');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreEl = document.getElementById('final-score');
    const finalMessageEl = document.getElementById('final-message');
    const restartBtn = document.getElementById('restart-btn');

    let partsData = [];
    let allParts = [];
    let currentPart = null;
    let score = 0;
    let round = 1;
    const TOTAL_ROUNDS = 10;
    let canAnswer = true;

    // Fetch Data
    fetch('/api/parts')
        .then(res => res.json())
        .then(data => {
            partsData = data;
            // Flatten parts for easy random selection
            partsData.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.parts.forEach(part => {
                        let categoryTitle = cat.title;
                        if (categoryTitle.includes('：')) {
                            categoryTitle = categoryTitle.split('：')[1];
                        }
                        categoryTitle = categoryTitle.split('(')[0].trim();

                        allParts.push({
                            ...part,
                            categoryId: cat.id,
                            categoryTitle: categoryTitle
                        });
                    });
                });
            });
            startGame();
        })
        .catch(err => {
            console.error(err);
            partNameEl.textContent = "無法載入遊戲資料";
        });

    function startGame() {
        score = 0;
        round = 1;
        updateStats();
        gameOverModal.style.display = 'none';
        loadRound();
    }

    function loadRound() {
        if (round > TOTAL_ROUNDS) {
            endGame();
            return;
        }

        canAnswer = true;
        nextBtn.style.display = 'none';
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback-msg';
        updateStats();

        // Select random part
        currentPart = allParts[Math.floor(Math.random() * allParts.length)];

        // Render Part
        partNameEl.textContent = currentPart.name;
        partIdEl.textContent = `ID: ${currentPart.id}`;
        renderImage(currentPart);

        // Render Options (Categories)
        renderOptions();
    }

    function renderImage(part) {
        partImageContainer.innerHTML = '';
        const img = document.createElement('img');

        // Image Logic (Copied from script.js logic)
        const colorId = (part.colorId && part.colorId !== 0) ? part.colorId : 11;
        let rbColor = 0;
        if (colorId === 86) rbColor = 71;
        if (colorId === 85) rbColor = 72;
        if (colorId === 5) rbColor = 4;
        if (colorId === 2) rbColor = 2;
        if (colorId === 3) rbColor = 14;
        if (colorId === 7) rbColor = 1;

        const strategies = [
            `https://img.bricklink.com/ItemImage/PN/${colorId}/${part.id}.png`,
            `https://img.bricklink.com/ItemImage/P/${colorId}/${part.id}.jpg`,
            `https://img.bricklink.com/ItemImage/SN/0/${part.id}.png`,
            `https://img.bricklink.com/ItemImage/S/${part.id}.png`,
            `https://cdn.rebrickable.com/media/parts/ldraw/${rbColor}/${part.id}.png`,
            `https://cdn.rebrickable.com/media/parts/elements/${part.id}.jpg`,
            `https://img.bricklink.com/ItemImage/PN/11/${part.id}.png`
        ];

        if (part.elementId) strategies.unshift(`https://cdn.rebrickable.com/media/parts/elements/${part.elementId}.jpg`);
        if (part.customImage) strategies.unshift(part.customImage);

        // Local SVG placeholder instead of external service
        const placeholderSvg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">No Image</text></svg>`);
        strategies.push(placeholderSvg);

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
        img.src = strategies[0];
        partImageContainer.appendChild(img);
    }

    function renderOptions() {
        optionsGrid.innerHTML = '';
        partsData.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';

            let simpleTitle = cat.title;
            if (simpleTitle.includes('：')) {
                simpleTitle = simpleTitle.split('：')[1];
            }
            simpleTitle = simpleTitle.split('(')[0].trim();

            btn.textContent = simpleTitle;
            btn.dataset.id = cat.id;

            btn.onclick = () => checkAnswer(cat.id, btn);
            optionsGrid.appendChild(btn);
        });
    }

    function checkAnswer(selectedId, btn) {
        if (!canAnswer) return;
        canAnswer = false;

        const isCorrect = selectedId === currentPart.categoryId;

        if (isCorrect) {
            score += 10;
            btn.classList.add('correct');
            feedbackEl.textContent = '答對了！';
            feedbackEl.classList.add('correct');
        } else {
            btn.classList.add('wrong');
            feedbackEl.textContent = `答錯了！正確分類是：${currentPart.categoryTitle}`;
            feedbackEl.classList.add('wrong');

            // Highlight correct answer
            const correctBtn = Array.from(optionsGrid.children).find(b => b.dataset.id === currentPart.categoryId);
            if (correctBtn) correctBtn.classList.add('correct');
        }

        nextBtn.style.display = 'block';
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    nextBtn.addEventListener('click', () => {
        round++;
        loadRound();
    });

    function updateStats() {
        scoreEl.textContent = score;
        roundEl.textContent = round;
    }

    function endGame() {
        finalScoreEl.textContent = score;
        if (score === 100) finalMessageEl.textContent = "太厲害了！你是零件大師！🏆";
        else if (score >= 80) finalMessageEl.textContent = "很棒！你對零件非常熟悉！👏";
        else if (score >= 60) finalMessageEl.textContent = "不錯喔！繼續加油！💪";
        else finalMessageEl.textContent = "再多練習一下吧！📚";

        gameOverModal.style.display = 'block';
    }

    restartBtn.addEventListener('click', startGame);
});
