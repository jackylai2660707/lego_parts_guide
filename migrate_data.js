const fs = require('fs');
const path = require('path');

// 1. Load original data/parts.json ONLY
const rawData = fs.readFileSync(path.join(__dirname, 'data', 'parts.json'), 'utf8');
const originalData = JSON.parse(rawData);

// 2. Define New Simplified Categories (4 Main + Others)
const newCategories = [
    {
        id: "structure",
        title: "1. 結構與連接 (Structure & Connection)",
        subcategories: []
    },
    {
        id: "transmission",
        title: "2. 機械傳動 (Mechanical Transmission)",
        subcategories: []
    },
    {
        id: "electronics",
        title: "3. 電子動力 (Electronics & Power)",
        subcategories: []
    },
    {
        id: "others",
        title: "4. 其他 (Others)",
        subcategories: []
    }
];

// Helper to find or create subcategory
function getSubcategory(catId, subTitle) {
    const cat = newCategories.find(c => c.id === catId);
    if (!cat) return null; // Should not happen if logic is correct

    let sub = cat.subcategories.find(s => s.title === subTitle);
    if (!sub) {
        sub = { title: subTitle, parts: [] };
        cat.subcategories.push(sub);
    }
    return sub;
}

// 3. Translation Dictionary & Logic
const translationMap = [
    // --- Core Categories ---
    { k: 'Technic, Liftarm, Modified', v: '異形樑' },
    { k: 'Technic, Liftarm Thick', v: '厚樑' },
    { k: 'Technic, Liftarm Thin', v: '薄樑' },
    { k: 'Technic, Liftarm', v: '樑' },
    { k: 'Technic, Brick', v: '機械磚' },
    { k: 'Technic, Pin Connector', v: '銷連接器' },
    { k: 'Technic, Axle Connector', v: '軸連接器' },
    { k: 'Technic, Axle', v: '軸' },
    { k: 'Technic, Pin', v: '銷' },
    { k: 'Technic, Gear', v: '齒輪' },
    { k: 'Technic, Panel', v: '面板' },
    { k: 'Technic, Steering', v: '轉向' },
    { k: 'Technic, Shock Absorber', v: '避震器' },

    // --- Specific Parts ---
    { k: 'Double Bevel', v: '雙斜面' },
    { k: 'Bevel', v: '斜面' },
    { k: 'Clutch', v: '離合' },
    { k: 'Differential', v: '差速器' },
    { k: 'Universal Joint', v: '萬向節' },
    { k: 'Linear Actuator', v: '推桿' },
    { k: 'Turntable', v: '轉盤' },
    { k: 'Driving Ring', v: '驅動環' },
    { k: 'Changeover Catch', v: '切換卡扣' },
    { k: 'Transmission Changeover', v: '變速切換' },
    { k: 'CV Joint', v: '萬向接頭' },
    { k: 'Ball Joint', v: '球頭' },

    // --- Wheels & Tires ---
    { k: 'Wheel', v: '輪框' },
    { k: 'Tire', v: '輪胎' },
    { k: 'Tread', v: '胎紋' },
    { k: 'Hub Cap', v: '輪蓋' },

    // --- Electronics ---
    { k: 'Electric Sensor', v: '感測器' },
    { k: 'Electric Motor', v: '馬達' },
    { k: 'Battery Box', v: '電池盒' },
    { k: 'Battery', v: '電池' },
    { k: 'Hub', v: '主機' },
    { k: 'Light', v: '燈' },
    { k: 'Cable', v: '線' },

    // --- Adjectives & Descriptors ---
    { k: 'Perpendicular', v: '垂直' },
    { k: 'Angled', v: '角度' },
    { k: 'Straight', v: '直' },
    { k: 'Curved', v: '彎曲' },
    { k: 'Bent', v: '彎折' },
    { k: 'Round', v: '圓形' },
    { k: 'Square', v: '方形' },
    { k: 'Rectangular', v: '長方形' },
    { k: 'Flat', v: '平' },
    { k: 'Smooth', v: '平滑' },
    { k: 'Friction Ridges', v: '摩擦脊' },
    { k: 'with Friction', v: '有摩擦' },
    { k: 'without Friction', v: '無摩擦' },
    { k: 'with Axle Hole', v: '帶軸孔' },
    { k: 'with Pin Hole', v: '帶銷孔' },
    { k: 'with Stud', v: '帶顆粒' },
    { k: 'with Hole', v: '帶孔' },
    { k: 'Axle Hole', v: '軸孔' },
    { k: 'Pin Hole', v: '銷孔' },
    { k: 'with Stop', v: '帶止擋' },
    { k: 'Center Stop', v: '中心止擋' },
    { k: 'Stop', v: '止擋' },
    { k: 'Center', v: '中心' },
    { k: 'Tow Ball', v: '拖車球' },
    { k: 'Tow', v: '拖車' },
    { k: 'Narrow', v: '窄' },
    { k: 'Housing', v: '外殼' },
    { k: 'Portal Axle', v: '門式軸' },
    { k: 'Bionicle', v: '生化' },
    { k: 'Eye', v: '眼' },
    { k: 'with', v: '帶' },
    { k: 'and', v: '與' },
    { k: 'Long', v: '長' },
    { k: 'Short', v: '短' },
    { k: 'Large', v: '大' },
    { k: 'Medium', v: '中' },
    { k: 'Small', v: '小' },
    { k: 'Tooth', v: '齒' },
    { k: 'Teeth', v: '齒' },
    { k: 'Side A', v: 'A面' },
    { k: 'Side B', v: 'B面' },
    { k: 'Left', v: '左' },
    { k: 'Right', v: '右' },
    { k: 'Axle', v: '軸' },
    { k: 'Pin', v: '銷' },

    // --- Misc ---
    { k: 'Plate', v: '平板' },
    { k: 'Tile', v: '光面磚' },
    { k: 'Brick', v: '磚' },
    { k: 'Cone', v: '圓錐' },
    { k: 'Cylinder', v: '圓柱' },
    { k: 'Slope', v: '斜坡磚' },
    { k: 'Wedge', v: '楔形' },
    { k: 'Decoration', v: '裝飾' },
    { k: 'Rubber', v: '橡膠' },
    { k: 'Band', v: '環' },
    { k: 'Belt', v: '皮帶' },
    { k: 'Pulley', v: '滑輪' },
    { k: 'String', v: '線' },
    { k: 'Hook', v: '鉤' },
    { k: 'Engine', v: '引擎' },
    { k: 'Piston', v: '活塞' },
    { k: 'Crankshaft', v: '曲軸' },
    { k: 'Fairing', v: '整流罩' },
    { k: 'Spoiler', v: '擾流板' },
    { k: 'Wing', v: '機翼' }
];

function translateName(name) {
    // 1. Remove Colors (Case Insensitive)
    let cleanName = name.replace(/Black |Blue |Red |Yellow |Green |White |Light Bluish Gray |Dark Bluish Gray |Tan |Medium Azure |Magenta |Orange |Dark Brown |Trans-Red |Trans-Light Blue |Reddish Brown |Flat Silver |Pearl Gold |Metallic Silver /gi, '').trim();

    // 2. Apply Dictionary
    translationMap.forEach(item => {
        // Use word boundary for short words to avoid partial matches (e.g. "in" inside "pin")
        // But for multi-word terms, simple replace is often safer.
        // We'll use a mix: if key is short (<4 chars), use boundary.
        let regex;
        if (item.k.length < 4) {
            regex = new RegExp(`\\b${item.k}\\b`, 'gi');
        } else {
            // Escape special chars in key
            const escapedKey = item.k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escapedKey, 'gi');
        }
        cleanName = cleanName.replace(regex, item.v);
    });

    // 3. Cleanup
    cleanName = cleanName.replace(/  +/g, ' '); // Double spaces
    cleanName = cleanName.replace(/ ,/g, ','); // Space before comma
    cleanName = cleanName.replace(/^, /, ''); // Leading comma
    cleanName = cleanName.trim();

    return cleanName;
}


// 4. Process Data
const processedIds = new Set();

originalData.forEach(origCat => {
    if (!origCat.subcategories) return;
    origCat.subcategories.forEach(origSub => {
        if (!origSub.parts) return;
        origSub.parts.forEach(p => {
            if (processedIds.has(p.id)) return;
            processedIds.add(p.id);

            const name = p.name;
            const lowerName = name.toLowerCase();
            const lowerCat = (p.category || "").toLowerCase();

            // --- Classification Logic (Simplified) ---
            let catId = 'others';
            let subTitle = '其他 (Misc)';

            // 1. Structure & Connection
            if (lowerCat.includes('liftarm') || lowerName.includes('liftarm') || lowerName.includes('beam')) {
                catId = 'structure';
                subTitle = '機械樑 (Beams)';
            } else if (lowerCat.includes('frame') || lowerName.includes('frame')) {
                catId = 'structure';
                subTitle = '框架 (Frames)';
            } else if (lowerCat.includes('panel') || lowerName.includes('panel') || lowerName.includes('fairing') || lowerName.includes('wing')) {
                catId = 'structure';
                subTitle = '面板與整流罩 (Panels)';
            } else if (lowerCat.includes('connector') || lowerName.includes('connector')) {
                catId = 'structure';
                subTitle = '連接器 (Connectors)';
            } else if (lowerCat.includes('pin') || lowerName.includes('pin')) {
                catId = 'structure';
                subTitle = '銷 (Pins)';
            } else if (lowerCat.includes('axle') && !lowerName.includes('wheel')) { // Exclude axles that are part of wheel assemblies if any
                catId = 'structure';
                subTitle = '軸 (Axles)';
            }

            // 2. Mechanical Transmission
            else if (lowerCat.includes('gear') || lowerName.includes('gear') || lowerName.includes('clutch') || lowerName.includes('differential')) {
                catId = 'transmission';
                subTitle = '齒輪 (Gears)';
            } else if (lowerCat.includes('wheel') || lowerName.includes('wheel') || lowerName.includes('tire') || lowerName.includes('tyre') || lowerName.includes('rim')) {
                catId = 'transmission';
                subTitle = '車輪與輪胎 (Wheels & Tires)';
            } else if (lowerName.includes('steering') || lowerName.includes('suspension') || lowerName.includes('shock') || lowerName.includes('turntable') || lowerName.includes('driving ring')) {
                catId = 'transmission';
                subTitle = '轉向與懸吊 (Steering & Suspension)';
            } else if (lowerName.includes('piston') || lowerName.includes('engine') || lowerName.includes('cylinder') || lowerName.includes('crankshaft')) {
                catId = 'transmission';
                subTitle = '引擎部件 (Engine Parts)';
            }

            // 3. Electronics & Power
            else if (lowerCat.includes('motor') || lowerName.includes('motor') ||
                lowerName.includes('sensor') || lowerName.includes('hub') ||
                lowerName.includes('battery') || lowerName.includes('electric') ||
                lowerName.includes('mindstorms') || lowerName.includes('spike') || lowerName.includes('light') || lowerName.includes('cable')) {
                catId = 'electronics';
                subTitle = '電子模組 (Electronics)';
            }

            // 4. Others
            else if (lowerCat.includes('brick') || lowerName.includes('brick')) {
                catId = 'others';
                subTitle = '機械磚 (Technic Bricks)';
            } else if (lowerName.includes('plate') || lowerName.includes('tile')) {
                catId = 'others';
                subTitle = '平板與光面磚 (Plates & Tiles)';
            } else if (lowerName.includes('decoration') || lowerName.includes('sticker')) {
                catId = 'others';
                subTitle = '裝飾 (Decoration)';
            }

            // --- Translation ---
            const translatedName = translateName(name);

            // Add to Category
            const sub = getSubcategory(catId, subTitle);
            if (sub) {
                sub.parts.push({
                    id: p.id,
                    name: translatedName,
                    visual: translatedName, // Use translated name for visual
                    colorId: p.colorId,
                    elementId: p.elementId
                });
            }
        });
    });
});

// 5. Output
const output = `const partsData = ${JSON.stringify(newCategories, null, 4)};

if (typeof module !== 'undefined') module.exports = partsData;
`;

fs.writeFileSync('parts_data.js', output);
console.log('Migration complete. parts_data.js updated.');
