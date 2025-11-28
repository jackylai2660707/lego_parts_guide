const partsData = [
    {
        id: "technic_bricks",
        title: "0. 基礎系：機械磚 (Technic Bricks)",
        description: "結合了傳統積木的凸點與機械系的孔洞，是結構的基礎。",
        subcategories: [
            {
                title: "機械磚 (Technic Bricks)",
                description: "側面有孔洞的積木，用於結合橫向與縱向結構。",
                parts: [
                    { id: "6541", name: "1x1 機械磚", visual: "單孔，常用於轉向結構", colorId: 86 },
                    { id: "3700", name: "1x2 機械磚", visual: "單孔", colorId: 86 },
                    { id: "3701", name: "1x4 機械磚", visual: "3孔", colorId: 86 },
                    { id: "3894", name: "1x6 機械磚", visual: "5孔", colorId: 86 },
                    { id: "3702", name: "1x8 機械磚", visual: "7孔", colorId: 86 },
                    { id: "2730", name: "1x10 機械磚", visual: "9孔", colorId: 86 },
                    { id: "3895", name: "1x12 機械磚", visual: "11孔", colorId: 86 },
                    { id: "32018", name: "1x14 機械磚", visual: "13孔", colorId: 86 },
                    { id: "3703", name: "1x16 機械磚", visual: "15孔", colorId: 86 }
                ]
            }
        ]
    },
    {
        id: "structural",
        title: "1. 結構系：機械樑 (Beams/Liftarms)",
        description: "依據「厚度」與「形狀」區分。引導學生觀察樑的厚度與孔洞排列。",
        subcategories: [
            {
                title: "1.1 厚型直樑 (Thick Beams)",
                description: "特徵：厚度 1M (約 8mm)，孔洞有凹槽，銷釘頭可沉入。通常用於主要骨架。",
                parts: [
                    { id: "43857", name: "2L 厚樑", visual: "極短，像花生殼，只有兩個孔", colorId: 11 },
                    { id: "32523", name: "3L 厚樑", visual: "短條狀，三個孔", colorId: 3 },
                    { id: "32316", name: "5L 厚樑", visual: "中短條狀，常見黃色或黑色", colorId: 3 },
                    { id: "32524", name: "7L 厚樑", visual: "中長條狀", colorId: 86 },
                    { id: "40490", name: "9L 厚樑", visual: "長條狀", colorId: 86 },
                    { id: "32525", name: "11L 厚樑", visual: "長條狀，車身主結構常用", colorId: 86 },
                    { id: "41239", name: "13L 厚樑", visual: "特長條狀，孔數為 13", colorId: 86 },
                    { id: "32278", name: "15L 厚樑", visual: "最長的標準直樑，常用於大型起重臂", colorId: 86 }
                ]
            },
            {
                title: "1.2 薄型直樑 (Thin Beams)",
                description: "特徵：厚度 0.5M，表面平整無凹槽。用於連桿或堆疊調整。",
                parts: [
                    { id: "41677", name: "2L 薄樑", visual: "極小，有兩個小孔", colorId: 11 },
                    { id: "6632", name: "3L 薄樑", visual: "常見，用於轉向拉桿", colorId: 7 },
                    { id: "32449", name: "4L 薄樑", visual: "偶數長度，兩端有軸孔或圓孔", colorId: 86 },
                    { id: "32017", name: "5L 薄樑", visual: "薄型直樑", colorId: 86 },
                    { id: "32063", name: "6L 薄樑", visual: "薄型直樑", colorId: 86 }
                ]
            },
            {
                title: "1.3 異形樑 (Angled Beams)",
                description: "特徵：具有特定角度，用於轉角或支撐。",
                parts: [
                    { id: "32140", name: "L型 2x4", visual: "直角 L 形，一邊 2 孔，一邊 4 孔", colorId: 11 },
                    { id: "32526", name: "L型 3x5", visual: "直角 L 形，最常見的結構加固件", colorId: 86 },
                    { id: "60484", name: "T型 3x3", visual: "T 字形，三個方向各 1 孔", colorId: 11 },
                    { id: "32009", name: "雙彎樑 (Double Bent)", visual: "形狀像閃電或階梯，用於結構錯位", colorId: 11 },
                    { id: "32271", name: "L型 3x7 (4x2)", visual: "較長的 L 型樑", colorId: 11 },
                    { id: "32056", name: "L型 3x3 薄樑", visual: "薄型 L 結構", colorId: 86 }
                ]
            },
            {
                title: "1.4 框架 (Frames)",
                description: "大型結構件，用於快速建構堅固底盤。",
                parts: [
                    { id: "64179", name: "5x7 框架", visual: "矩形框架，中間有孔", colorId: 86 },
                    { id: "64178", name: "5x11 框架", visual: "大型矩形框架", colorId: 86 },
                    { id: "32531", name: "4x6 科技板 (帶孔)", visual: "常用於底盤結構", colorId: 11 }
                ]
            }
        ]
    },
    {
        id: "connectors",
        title: "2. 連接系：銷與連接器 (Pins & Connectors)",
        description: "這是最容易混淆的區域。請學生依據「顏色」與「摩擦力」分類。",
        subcategories: [
            {
                title: "2.1 銷 (Pins) - 核心分類",
                description: "",
                parts: [
                    { id: "2780", name: "黑色銷 (摩擦)", visual: "黑色，表面有微小脊線。功能：卡死", colorId: 11 },
                    { id: "3673", name: "灰色銷 (平滑)", visual: "淺灰色，表面光滑。功能：旋轉", colorId: 86 },
                    { id: "6558", name: "藍色長銷 (3L 摩擦)", visual: "藍色，長度較長（跨 3 孔）", colorId: 7 },
                    { id: "32556", name: "米色長銷 (3L 平滑)", visual: "沙色/米色，長度較長（跨 3 孔），可轉動", colorId: 2 },
                    { id: "43093", name: "軸銷 (Axle Pin) 藍", visual: "一端圓柱一端十字。藍色為有摩擦", colorId: 7 },
                    { id: "3749", name: "軸銷 (Axle Pin) 沙", visual: "一端圓柱一端十字。沙色為平滑", colorId: 2 },
                    { id: "11214", name: "軸銷 3L (紅)", visual: "紅色，2L軸+1L銷", colorId: 5 },
                    { id: "18651", name: "軸銷 3L (藍)", visual: "深藍色，2L軸+1L銷", colorId: 63 }
                ]
            },
            {
                title: "2.2 角度與特殊連接器",
                description: "用於改變角度或連接不同類型的零件。",
                parts: [
                    { id: "32013", name: "#1 (22.5°)", visual: "紅色/灰色，微彎", colorId: 5 },
                    { id: "32034", name: "#2 (180°)", visual: "直線連接器，延長兩根軸", colorId: 11 },
                    { id: "32016", name: "#3 (157.5°)", visual: "大鈍角", colorId: 5 },
                    { id: "32192", name: "#4 (135°)", visual: "45度角，最常用", colorId: 86 },
                    { id: "32015", name: "#5 (112.5°)", visual: "接近直角", colorId: 5 },
                    { id: "32014", name: "#6 (90°)", visual: "直角", colorId: 11 },
                    { id: "32184", name: "垂直軸連接器 (T型)", visual: "軸孔與銷孔垂直", colorId: 86 },
                    { id: "6536", name: "垂直軸連接器 (2孔)", visual: "兩個軸孔互相垂直", colorId: 11 },
                    { id: "42003", name: "3L 垂直連接器", visual: "兩個銷孔，一個軸孔", colorId: 86 },
                    { id: "63869", name: "3L 垂直連接器 (三孔)", visual: "三個銷孔", colorId: 86 },
                    { id: "32291", name: "垂直雙孔連接器", visual: "用於加固", colorId: 86 }
                ]
            }
        ]
    },
    {
        id: "axles",
        title: "3. 動力傳輸系：軸 (Axles)",
        description: "分類邏輯：利用「顏色編碼」快速分辨奇偶數長度。",
        subcategories: [
            {
                title: "軸 (Axles)",
                description: "",
                parts: [
                    { id: "32062", name: "紅色軸 (2L)", visual: "紅色，表面有防滑凹槽。最短的軸", colorId: 5 },
                    { id: "4519", name: "灰色軸 (3L)", visual: "淺灰色 (奇數)", colorId: 86 },
                    { id: "3705", name: "黑色軸 (4L)", visual: "黑色 (偶數)", colorId: 11 },
                    { id: "32073", name: "灰色軸 (5L)", visual: "淺灰色 (奇數)", colorId: 86 },
                    { id: "3706", name: "黑色軸 (6L)", visual: "黑色 (偶數)", colorId: 11 },
                    { id: "44294", name: "灰色軸 (7L)", visual: "淺灰色 (奇數)", colorId: 86 },
                    { id: "3707", name: "黑色軸 (8L)", visual: "黑色 (偶數)", colorId: 11 },
                    { id: "60485", name: "灰色軸 (9L)", visual: "淺灰色 (奇數)", colorId: 86 },
                    { id: "3737", name: "黑色軸 (10L)", visual: "黑色 (偶數)", colorId: 11 },
                    { id: "3708", name: "黑色軸 (12L)", visual: "黑色 (偶數)", colorId: 11 },
                    { id: "87083", name: "止擋軸 (4L)", visual: "一端有圓盤，防止穿過孔洞", colorId: 85 },
                    { id: "24316", name: "止擋軸 (3L)", visual: "紅棕色，一端有圓盤", colorId: 88 }
                ]
            },
            {
                title: "軸套與墊片 (Bushes)",
                description: "用於固定軸的位置。",
                parts: [
                    { id: "3713", name: "全軸套 (Bush)", visual: "紅色/灰色，1M 寬度", colorId: 5 },
                    { id: "4265c", name: "半軸套 (Half Bush)", visual: "黃色/灰色，0.5M 寬度", colorId: 3 }
                ]
            }
        ]
    },
    {
        id: "gears",
        title: "4. 傳動系：齒輪 (Gears)",
        description: "依據「齒數」與「形狀」分類。",
        subcategories: [
            {
                title: "4.1 雙斜面齒輪 (Double Bevel)",
                description: "特徵：齒面呈沙漏狀，可平行或垂直咬合。",
                parts: [
                    { id: "32270", name: "12齒 (12T)", visual: "黑色，最小的錐齒輪", colorId: 11 },
                    { id: "32269", name: "20齒 (20T)", visual: "米色或黑色，中型", colorId: 2 },
                    { id: "46372", name: "28齒 (28T)", visual: "灰色，常配合差速器使用", colorId: 86 },
                    { id: "32498", name: "36齒 (36T)", visual: "黑色，大型", colorId: 11 }
                ]
            },
            {
                title: "4.2 傳統/特殊齒輪",
                description: "",
                parts: [
                    { id: "10928", name: "8齒 (8T)", visual: "深灰色，極小", colorId: 85 },
                    { id: "3647", name: "8齒 (8T) 舊版", visual: "灰色，無摩擦", colorId: 86 },
                    { id: "94925", name: "16齒 (16T) 加強版", visual: "灰色，常用於馬達直接輸出", colorId: 86 },
                    { id: "3648", name: "24齒 (24T)", visual: "深灰色，有三個孔，經典零件", colorId: 85 },
                    { id: "3649", name: "40齒 (40T)", visual: "灰色，最大直徑", colorId: 86 },
                    { id: "32072", name: "球型齒輪 (Knob Wheel)", visual: "黑色，4齒，用於高扭力垂直傳動", colorId: 11 },
                    { id: "62821b", name: "差速器 (Differential)", visual: "灰色方塊狀，內部有小齒輪", colorId: 86, elementId: "4525184" },
                    { id: "4716", name: "蝸桿 (Worm Gear)", visual: "圓柱螺旋狀，用於減速與自鎖", colorId: 11 },
                    { id: "60c01", name: "離合齒輪 (Clutch 24T)", visual: "白色中心，受力過大會打滑保護馬達", colorId: 86 },
                    { id: "18946", name: "齒條 (Rack Gear) 20T", visual: "直線齒輪，用於轉向", colorId: 11 },
                    { id: "18938", name: "轉盤 (Turntable) 60T", visual: "大型轉盤，用於怪手旋轉", colorId: 11 },
                    { id: "99009", name: "小型轉盤 (Turntable)", visual: "小型旋轉結構", colorId: 11 }
                ]
            }
        ]
    },
    {
        id: "functional",
        title: "5. 機械功能件 (Functional Parts)",
        description: "",
        subcategories: [
            {
                title: "5.1 轉向與懸吊",
                description: "",
                parts: [
                    { id: "61903", name: "萬向節 (Universal Joint)", visual: "銀灰色/灰色，允許軸彎折傳動", colorId: 86 },
                    { id: "52731", name: "CV 球頭節", visual: "類似骨頭關節，轉向更平順", colorId: 86 },
                    { id: "76537", name: "避震器 (Shock Absorber)", visual: "依彈簧顏色分軟硬", colorId: 86 },
                    { id: "56908", name: "轉向座 (Wheel Hub)", visual: "安裝輪胎的支架，有球頭孔", colorId: 86 },
                    { id: "92909", name: "轉向座 (Portal Hub)", visual: "大型車輛使用", colorId: 86 },
                    { id: "32294", name: "懸吊臂 (Wishbone)", visual: "Y型懸吊臂", colorId: 86 }
                ]
            },
            {
                title: "5.2 致動器與氣壓",
                description: "",
                parts: [
                    { id: "61927", name: "線性致動器 (小型)", visual: "伸縮桿，模擬液壓缸", colorId: 86 },
                    { id: "40918", name: "線性致動器 (大型)", visual: "大型伸縮桿", colorId: 86, elementId: "6240630" },
                    { id: "19478", name: "氣壓幫浦 (Pump)", visual: "藍色頭，手動打氣", colorId: 11, elementId: "6024090" },
                    { id: "19475", name: "氣壓缸 (Cylinder)", visual: "利用空氣推動伸縮", colorId: 86, elementId: "6152364" },
                    { id: "4694b", name: "氣壓開關 (Switch)", visual: "控制氣流方向", colorId: 86, elementId: "6020180" }
                ]
            }
        ]
    },
    {
        id: "panels",
        title: "6. 面板與整流罩 (Panels)",
        description: "用於覆蓋車體，增加美觀與結構強度。",
        subcategories: [
            {
                title: "面板",
                description: "通常成對出現 (Left/Right)。",
                parts: [
                    { id: "87080", name: "Panel 3x11", visual: "長條形面板", colorId: 11 },
                    { id: "87086", name: "Panel 5x11", visual: "大型面板", colorId: 11 },
                    { id: "64683", name: "Panel 3x7", visual: "中型面板", colorId: 11 },
                    { id: "64391", name: "Panel 3x5", visual: "小型面板", colorId: 11 },
                    { id: "15458", name: "Panel 3x11 彎曲", visual: "帶有弧度的面板", colorId: 11 }
                ]
            }
        ]
    },
    {
        id: "power",
        title: "7. 電子與動力模組 (Power Systems)",
        description: "適用於 SPIKE / Mindstorms / Power Functions",
        subcategories: [
            {
                title: "馬達與主機",
                description: "注意：此處使用零件編號而非套裝編號以確保圖片顯示。",
                parts: [
                    { id: "88013", name: "L 馬達 (Powered Up)", visual: "SPIKE/Robot Inventor 常用", colorId: 85, elementId: "6214085" },
                    { id: "88008", name: "M 馬達 (Powered Up)", visual: "SPIKE/Robot Inventor 常用", colorId: 85, elementId: "6214082" },
                    { id: "53444", name: "SPIKE Prime Hub", visual: "黃色大型主機", colorId: 3, elementId: "6270426" },
                    { id: "61481", name: "顏色感測器 (SPIKE)", visual: "辨識顏色", colorId: 85, elementId: "6275903" },
                    { id: "37312", name: "距離感測器 (SPIKE)", visual: "眼睛造型", colorId: 85, elementId: "6275901" },
                    { id: "8883", name: "PF M 馬達", visual: "Power Functions 中型馬達", colorId: 86, elementId: "4506083" },
                    { id: "88003", name: "PF L 馬達", visual: "Power Functions 大型馬達", colorId: 86, elementId: "6000564" },
                    { id: "8882", name: "PF XL 馬達", visual: "Power Functions 超大扭力馬達", colorId: 86, elementId: "4506081" },
                    { id: "8881", name: "PF 電池盒", visual: "AA 電池盒", colorId: 86, elementId: "4506078" }
                ]
            }
        ]
    }
];
