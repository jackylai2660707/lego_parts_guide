const fs = require('fs');
const path = require('path');

// 1. Load original data/parts.json ONLY
const rawData = fs.readFileSync(path.join(__dirname, 'data', 'parts_source.json'), 'utf8');
const originalData = JSON.parse(rawData);

// 2. Define New Categories (8 Categories as requested)
const newCategories = [
    {
        id: "beams",
        title: "1. 結構系：機械樑 (Beams/Liftarms)",
        subcategories: [
            { title: "厚樑 (Straight Beams - Thick < 7L)", parts: [] },
            { title: "厚樑 (Straight Beams - Thick >= 7L)", parts: [] },
            { title: "薄樑 (Straight Beams - Thin)", parts: [] },
            { title: "轉角樑 (Angled Beams)", parts: [] },
            { title: "框架 (Frames)", parts: [] }
        ]
    },
    {
        id: "connectors",
        title: "2. 連接系：銷與連接器 (Pins & Connectors)",
        subcategories: [
            { title: "摩擦銷 (Friction Pins)", parts: [] },
            { title: "平滑銷 (Smooth Pins)", parts: [] },
            { title: "軸銷 (Axle Pins)", parts: [] },
            { title: "轉角連接器 (Angle Connectors)", parts: [] },
            { title: "垂直連接器 (Perpendicular Connectors)", parts: [] },
            { title: "其他連接器 (Other Connectors)", parts: [] }
        ]
    },
    {
        id: "axles",
        title: "3. 動力傳輸系：軸 (Axles)",
        subcategories: [
            { title: "偶數軸 (Even Axles)", parts: [] },
            { title: "奇數軸 (Odd Axles)", parts: [] },
            { title: "止擋軸 (Stop Axles)", parts: [] },
            { title: "軸套 (Bushes)", parts: [] }
        ]
    },
    {
        id: "gears",
        title: "4. 傳動系：齒輪 (Gears)",
        subcategories: [
            { title: "直齒輪 (Spur Gears)", parts: [] },
            { title: "斜面齒輪 (Bevel Gears)", parts: [] },
            { title: "特殊齒輪 (Special Gears)", parts: [] }
        ]
    },
    {
        id: "wheels",
        title: "5. 車輪與輪胎 (Wheels & Tires)",
        subcategories: [
            { title: "輪框 (Wheels)", parts: [] },
            { title: "輪胎 (Tires)", parts: [] },
            { title: "履帶與其他 (Tracks & Others)", parts: [] }
        ]
    },
    {
        id: "panels",
        title: "6. 面板與整流罩 (Panels)",
        subcategories: [
            { title: "面板 (Panels)", parts: [] }
        ]
    },
    {
        id: "power",
        title: "7. 電子與動力模組 (Power Systems)",
        subcategories: [
            { title: "馬達 (Motors)", parts: [] },
            { title: "主機與感測 (Hubs & Sensors)", parts: [] }
        ]
    },
    {
        id: "others",
        title: "8. 其他 (Others)",
        subcategories: [
            { title: "機械磚 (Technic Bricks)", parts: [] },
            { title: "橡筋與皮帶 (Rubber Bands & Belts)", parts: [] },
            { title: "功能部件 (Functional Parts)", parts: [] },
            { title: "其他 (Misc)", parts: [] }
        ]
    }
];

// Helper to add part to subcategory
function addToCategory(catId, subTitle, part, newName) {
    const cat = newCategories.find(c => c.id === catId);
    if (!cat) return;

    let sub = cat.subcategories.find(s => s.title === subTitle);
    if (!sub) {
        sub = cat.subcategories.find(s => s.title.includes('Other') || s.title.includes('Misc'));
        if (!sub) sub = cat.subcategories[cat.subcategories.length - 1];
    }

    sub.parts.push({
        id: part.id,
        name: newName,
        visual: newName,
        colorId: part.colorId,
        elementId: part.elementId
    });
}

// 3. Translation Dictionary
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
    let cleanName = name.replace(/Black |Blue |Red |Yellow |Green |White |Light Bluish Gray |Dark Bluish Gray |Tan |Medium Azure |Magenta |Orange |Dark Brown |Trans-Red |Trans-Light Blue |Reddish Brown |Flat Silver |Pearl Gold |Metallic Silver /gi, '').trim();

    translationMap.forEach(item => {
        let regex;
        if (item.k.length < 4) {
            regex = new RegExp(`\\b${item.k}\\b`, 'gi');
        } else {
            const escapedKey = item.k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escapedKey, 'gi');
        }
        cleanName = cleanName.replace(regex, item.v);
    });

    cleanName = cleanName.replace(/  +/g, ' ');
    cleanName = cleanName.replace(/ ,/g, ',');
    cleanName = cleanName.replace(/^, /, '');
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

            // --- Classification Logic ---
            let catId = 'others';
            let subTitle = '其他 (Misc)';

            // 1. Power (Priority High - Catch Electronics first)
            if (lowerCat.includes('motor') || lowerName.includes('motor')) {
                catId = 'power';
                subTitle = '馬達 (Motors)';
            }
            else if (lowerName.includes('sensor') || lowerName.includes('battery') ||
                (lowerName.includes('hub') && !lowerName.includes('cap') && !lowerName.includes('wheel')) ||
                lowerName.includes('mindstorms') || lowerName.includes('spike') || lowerName.includes('electric')) {
                catId = 'power';
                subTitle = '主機與感測 (Hubs & Sensors)';
            }

            // 2. Wheels & Tires
            else if (lowerCat.includes('wheel') || lowerName.includes('wheel') ||
                /\brim\b/.test(lowerName) ||
                lowerCat.includes('tire') || /\btire\b/.test(lowerName) || /\btyre\b/.test(lowerName) ||
                /\btread\b/.test(lowerName) || lowerName.includes('track')) {
                catId = 'wheels';
                if (/\btire\b/.test(lowerName) || /\btyre\b/.test(lowerName)) {
                    subTitle = '輪胎 (Tires)';
                } else if (/\btread\b/.test(lowerName) || lowerName.includes('track')) {
                    subTitle = '履帶與其他 (Tracks & Others)';
                } else {
                    subTitle = '輪框 (Wheels)';
                }
            }

            // 3. Rubber Bands & Belts
            else if (lowerName.includes('rubber') || lowerName.includes('band') || lowerName.includes('belt')) {
                catId = 'others';
                subTitle = '橡筋與皮帶 (Rubber Bands & Belts)';
            }

            // 4. Technic Bricks
            else if (lowerCat.includes('brick') || lowerName.includes('brick')) {
                catId = 'others';
                subTitle = '機械磚 (Technic Bricks)';
            }

            // 5. Beams
            else if (lowerCat.includes('liftarm') || lowerName.includes('liftarm') || lowerName.includes('beam')) {
                catId = 'beams';
                let length = 0;
                const lenMatch = name.match(/(\d+)/);
                if (lenMatch) length = parseInt(lenMatch[1]);

                // Priority: Frames > Angled > Thin > Thick
                if (lowerName.includes('frame')) {
                    subTitle = '框架 (Frames)';
                } else if (lowerName.includes('bent') || lowerName.includes('modified') || lowerName.includes('angle') || lowerName.includes('l-shape') || lowerName.includes('t-shape')) {
                    subTitle = '轉角樑 (Angled Beams)';
                } else if (lowerName.includes('thin')) {
                    subTitle = '薄樑 (Straight Beams - Thin)';
                } else {
                    // Default to Thick if not specified as thin/angled
                    if (length < 7) subTitle = '厚樑 (Straight Beams - Thick < 7L)';
                    else subTitle = '厚樑 (Straight Beams - Thick >= 7L)';
                }
            }

            // 6. Pins & Connectors
            else if (lowerName.includes('pin') && !lowerName.includes('connector')) {
                catId = 'connectors';
                if (lowerName.includes('friction') && !lowerName.includes('without')) {
                    subTitle = '摩擦銷 (Friction Pins)';
                } else if (lowerName.includes('axle')) {
                    subTitle = '軸銷 (Axle Pins)';
                } else {
                    subTitle = '平滑銷 (Smooth Pins)';
                }
            }
            else if (lowerName.includes('connector')) {
                catId = 'connectors';
                if (lowerName.includes('angle') || lowerName.includes('degree')) {
                    subTitle = '轉角連接器 (Angle Connectors)';
                } else if (lowerName.includes('perpendicular')) {
                    subTitle = '垂直連接器 (Perpendicular Connectors)';
                } else {
                    subTitle = '其他連接器 (Other Connectors)';
                }
            }

            // 7. Axles
            else if (lowerCat.includes('axle') || (lowerName.includes('axle') && !lowerName.includes('wheel') && !lowerName.includes('pin'))) {
                catId = 'axles';
                let length = 0;
                const lenMatch = name.match(/(\d+)/);
                if (lenMatch) length = parseInt(lenMatch[1]);

                if (lowerName.includes('stop')) {
                    subTitle = '止擋軸 (Stop Axles)';
                } else if (length % 2 !== 0) {
                    subTitle = '奇數軸 (Odd Axles)';
                } else {
                    subTitle = '偶數軸 (Even Axles)';
                }

                if (lowerName.includes('bush')) {
                    subTitle = '軸套 (Bushes)';
                }
            }

            // 8. Gears
            else if (lowerCat.includes('gear') || lowerName.includes('gear')) {
                catId = 'gears';
                if (lowerName.includes('bevel')) {
                    subTitle = '斜面齒輪 (Bevel Gears)';
                } else if (lowerName.includes('rack') || lowerName.includes('worm') || lowerName.includes('clutch') || lowerName.includes('differential')) {
                    subTitle = '特殊齒輪 (Special Gears)';
                } else {
                    subTitle = '直齒輪 (Spur Gears)';
                }
            }

            // 9. Panels
            else if (lowerCat.includes('panel') || lowerName.includes('panel')) {
                catId = 'panels';
                subTitle = '面板 (Panels)';
            }

            // 10. Others (Functional & Misc)
            else {
                catId = 'others';
                if (lowerName.includes('shock') || lowerName.includes('universal joint') || lowerName.includes('turntable') || lowerName.includes('steering')) {
                    subTitle = '功能部件 (Functional Parts)';
                } else {
                    subTitle = '其他 (Misc)';
                }
            }

            // --- Naming ---
            const translatedName = translateName(name);

            addToCategory(catId, subTitle, p, translatedName);
        });
    });
});

// 5. Output
const outputPath = path.join(__dirname, 'data', 'parts.json');
fs.writeFileSync(outputPath, JSON.stringify(newCategories, null, 4));
console.log('Migration complete. data/parts.json updated with refined grouping.');
