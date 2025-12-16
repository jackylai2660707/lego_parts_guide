document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.getElementById('score');
    const roundEl = document.getElementById('round');
    const progressBar = document.getElementById('progress-bar');
    const partImageContainer = document.getElementById('part-image-container');
    const partNameEl = document.getElementById('part-name');
    const partIdEl = document.getElementById('part-id-display');
    const optionsGrid = document.getElementById('options-grid');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreEl = document.getElementById('final-score');
    const finalMessageEl = document.getElementById('final-message');
    const starsEl = document.getElementById('stars');
    const restartBtn = document.getElementById('restart-btn');
    const floatingShapes = document.getElementById('floating-shapes');
    const confettiContainer = document.getElementById('confetti-container');

    let partsData = [];
    let allParts = [];
    let currentPart = null;
    let score = 0;
    let round = 1;
    const TOTAL_ROUNDS = 10;
    let canAnswer = true;

    // Create floating SVG shapes
    function createFloatingShapes() {
        floatingShapes.innerHTML = '';
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'];
        const shapes = ['circle', 'rect', 'polygon'];

        for (let i = 0; i < 15; i++) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '60');
            svg.setAttribute('height', '60');
            svg.setAttribute('viewBox', '0 0 60 60');

            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            let element;
            if (shape === 'circle') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', '30');
                element.setAttribute('cy', '30');
                element.setAttribute('r', '25');
            } else if (shape === 'rect') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', '5');
                element.setAttribute('y', '5');
                element.setAttribute('width', '50');
                element.setAttribute('height', '50');
                element.setAttribute('rx', '8');
            } else {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '30,5 55,50 5,50');
            }

            element.setAttribute('fill', color);
            svg.appendChild(element);

            svg.style.left = `${Math.random() * 100}%`;
            svg.style.top = `${Math.random() * 100}%`;
            svg.style.animationDelay = `${Math.random() * 5}s`;
            svg.style.animationDuration = `${5 + Math.random() * 5}s`;

            floatingShapes.appendChild(svg);
        }
    }

    // Confetti explosion
    function createConfetti() {
        confettiContainer.innerHTML = '';
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#00d2d3', '#5f27cd'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 3000);
    }

    // Fetch Data
    fetch('/api/parts')
        .then(res => res.json())
        .then(data => {
            partsData = data;
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
            createFloatingShapes();
            startGame();
        })
        .catch(err => {
            console.error(err);
            partNameEl.textContent = "無法載入遊戲資料 😢";
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

        // Render Part with animation
        const partDisplay = document.querySelector('.part-display');
        partDisplay.style.animation = 'none';
        partDisplay.offsetHeight; // Trigger reflow
        partDisplay.style.animation = 'bounceIn 0.5s ease';

        partNameEl.textContent = currentPart.name;
        partIdEl.textContent = `ID: ${currentPart.id}`;
        renderImage(currentPart);

        // Render Options (Categories)
        renderOptions();
    }

    function renderImage(part) {
        partImageContainer.innerHTML = '';
        const img = document.createElement('img');

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

        const placeholderSvg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">No Image</text></svg>`);
        strategies.push(placeholderSvg);

        let currentStrategyIndex = 0;
        const tryNextImage = () => {
            currentStrategyIndex++;
            if (currentStrategyIndex < strategies.length) {
                img.src = strategies[currentStrategyIndex];
            } else {
                img.src = placeholderSvg;
            }
        };

        img.onerror = tryNextImage;
        img.src = strategies[0];
        partImageContainer.appendChild(img);
    }

    function renderOptions() {
        optionsGrid.innerHTML = '';
        partsData.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';

            let simpleTitle = cat.title;
            if (simpleTitle.includes('：')) {
                simpleTitle = simpleTitle.split('：')[1];
            }
            simpleTitle = simpleTitle.split('(')[0].trim();

            btn.textContent = simpleTitle;
            btn.dataset.id = cat.id;

            // Stagger animation
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                btn.style.transition = 'all 0.3s ease';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, index * 100);

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
            feedbackEl.innerHTML = '🎉 答對了！太棒了！';
            feedbackEl.classList.add('correct');
            createConfetti();
        } else {
            btn.classList.add('wrong');
            feedbackEl.innerHTML = `😅 答錯了！正確分類是：<strong>${currentPart.categoryTitle}</strong>`;
            feedbackEl.classList.add('wrong');

            // Highlight correct answer
            const correctBtn = Array.from(optionsGrid.children).find(b => b.dataset.id === currentPart.categoryId);
            if (correctBtn) correctBtn.classList.add('correct');
        }

        updateStats();
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
        progressBar.style.width = `${(round / TOTAL_ROUNDS) * 100}%`;
    }

    function endGame() {
        createConfetti();
        finalScoreEl.textContent = score;

        // Generate stars based on score
        const starCount = Math.ceil(score / 20);
        starsEl.textContent = '⭐'.repeat(starCount);

        if (score === 100) {
            finalMessageEl.innerHTML = "🏆 太厲害了！你是零件大師！🏆";
        } else if (score >= 80) {
            finalMessageEl.innerHTML = "👏 很棒！你對零件非常熟悉！";
        } else if (score >= 60) {
            finalMessageEl.innerHTML = "💪 不錯喔！繼續加油！";
        } else if (score >= 40) {
            finalMessageEl.innerHTML = "📚 再多練習一下吧！";
        } else {
            finalMessageEl.innerHTML = "🌱 加油！多玩幾次就會進步的！";
        }

        gameOverModal.style.display = 'block';
    }

    restartBtn.addEventListener('click', startGame);
});
