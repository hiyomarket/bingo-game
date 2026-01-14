# 網站設計風格腦力激盪

<response>
<probability>0.08</probability>
<text>
<idea>
  **Design Movement**: **Neo-Brutalism (新粗獷主義)**
  **Core Principles**:
  1. **Raw & Honest**: 展示結構，不隱藏邊框和線條，強調功能性。
  2. **High Contrast**: 使用極高對比的色彩，確保在任何光線下都清晰可見（適合遊戲場景）。
  3. **Bold Typography**: 使用粗體、大字號的無襯線字體，強調數字和狀態。
  4. **Playful Geometry**: 使用簡單的幾何圖形（圓形、方形）作為主要視覺元素，帶有厚重的黑色邊框。

  **Color Philosophy**:
  - **Intent**: 營造一種充滿活力、直接且帶有復古遊戲機風格的氛圍。
  - **Palette**:
    - Background: #FFFAF0 (Floral White) - 溫暖的米白色，避免純白的刺眼。
    - Primary: #FF6B6B (Pastel Red) - 用於選中或強調的狀態。
    - Secondary: #4ECDC4 (Medium Turquoise) - 用於一般狀態或次要元素。
    - Text/Borders: #2D3436 (Dracula Orchid) - 近乎黑色的深灰色，用於文字和粗邊框。
    - Accent: #FFE66D (Maize Crayola) - 用於高亮或提示。

  **Layout Paradigm**:
  - **Modular Grid**: 嚴格的網格佈局，每個數字都是一個獨立的模組，帶有厚重的邊框。
  - **Asymmetric Balance**: 標題和控制區域可以採用非對稱佈局，打破單調。

  **Signature Elements**:
  - **Thick Borders**: 所有按鈕、卡片和數字格都有 2px-4px 的黑色實線邊框。
  - **Drop Shadows**: 硬邊陰影（無模糊），通常向右下偏移 4px，增加立體感。
  - **Marquee Text**: 滾動文字效果用於顯示當前狀態或公告。

  **Interaction Philosophy**:
  - **Tactile Feedback**: 點擊時元素會有明顯的位移（例如按下按鈕的效果），配合聲音（如果可能）。
  - **Instant Response**: 狀態改變時顏色瞬間切換，不使用過度平滑的過渡，強調即時性。

  **Animation**:
  - **Snappy Transitions**: 動畫時間短（<0.2s），使用 `steps()` 或極快的 `ease-out`。
  - **Bouncing**: 數字選中時會有輕微的彈跳效果。

  **Typography System**:
  - **Headings**: `Space Grotesk` 或 `Archivo Black` - 幾何感強，粗獷。
  - **Body/Numbers**: `JetBrains Mono` 或 `Roboto Mono` - 等寬字體，適合數字顯示，清晰易讀。
</idea>
</text>
</response>

<response>
<probability>0.05</probability>
<text>
<idea>
  **Design Movement**: **Glassmorphism (毛玻璃擬態)**
  **Core Principles**:
  1. **Translucency**: 使用背景模糊和半透明層次，創造深度感。
  2. **Vivid Backgrounds**: 背景使用流動的漸變色，透過毛玻璃層透出。
  3. **Light Borders**: 使用細微的白色半透明邊框來定義邊界。
  4. **Floating Elements**: 元素看起來像是漂浮在空間中。

  **Color Philosophy**:
  - **Intent**: 營造現代、輕盈且科技感的氛圍，適合線上數位體驗。
  - **Palette**:
    - Background: Deep Blue/Purple Gradient (#4facfe to #00f2fe) - 深邃且充滿活力的漸變。
    - Glass Surface: rgba(255, 255, 255, 0.1) - 半透明白色。
    - Text: #FFFFFF (White) - 純白文字，確保在深色背景上的可讀性。
    - Active State: rgba(255, 255, 255, 0.3) with Glow - 發光效果。

  **Layout Paradigm**:
  - **Centralized Floating Card**: 主要賓果盤作為一個巨大的懸浮玻璃卡片居中。
  - **Layered Depth**: 透過 Z 軸的層次來區分重要性，被選中的數字會「浮」得更高。

  **Signature Elements**:
  - **Frosted Glass**: 背景模糊 (`backdrop-filter: blur(10px)`)。
  - **Soft Glows**: 元素周圍有柔和的光暈。
  - **Gradient Text**: 標題使用漸變色填充。

  **Interaction Philosophy**:
  - **Smooth Flow**: 交互流暢，像是在水中移動。
  - **Hover Glow**: 滑鼠懸停時元素會發光。

  **Animation**:
  - **Fluid Motion**: 使用長時長（0.5s+）的 `ease-in-out` 動畫。
  - **Parallax**: 背景和前景元素有視差效果。

  **Typography System**:
  - **Headings**: `Inter` 或 `SF Pro Display` - 乾淨、現代的無襯線字體，細字重。
  - **Body/Numbers**: `Inter` - 保持一致性，使用不同字重區分層次。
</idea>
</text>
</response>

<response>
<probability>0.07</probability>
<text>
<idea>
  **Design Movement**: **Cyberpunk / Futuristic UI (賽博龐克/未來介面)**
  **Core Principles**:
  1. **High Tech**: 模仿科幻電影中的抬頭顯示器 (HUD)。
  2. **Neon Colors**: 使用高飽和度的霓虹色（青色、洋紅色、黃色）在深色背景上。
  3. **Grid Lines**: 背景和裝飾使用細線網格。
  4. **Glitch Effects**: 偶爾的故障藝術效果增加科技感。

  **Color Philosophy**:
  - **Intent**: 營造高科技、緊張刺激的遊戲氛圍。
  - **Palette**:
    - Background: #050505 (Almost Black) - 深邃的黑色。
    - Primary: #00FF9F (Neon Green) - 用於選中狀態。
    - Secondary: #00B8FF (Neon Blue) - 用於邊框和裝飾。
    - Accent: #FF0055 (Neon Red) - 用於警告或特殊標記。
    - Text: #E0E0E0 (Light Gray) - 主要文字。

  **Layout Paradigm**:
  - **HUD Layout**: 邊緣有裝飾性的數據和線條，主要內容在中央。
  - **Scanlines**: 屏幕上有微弱的掃描線紋理。

  **Signature Elements**:
  - **Glowing Borders**: 邊框帶有發光效果 (`box-shadow`).
  - **Corner Accents**: 容器四角有特殊的括號裝飾。
  - **Monospace Text**: 大量使用等寬字體。

  **Interaction Philosophy**:
  - **Digital Precision**: 點擊反饋銳利、精確。
  - **Sound Effects**: 配合機械或電子音效（如果支援）。

  **Animation**:
  - **Glitch**: 狀態改變時有輕微的故障閃爍。
  - **Typing Effect**: 文字顯示時有打字機效果。

  **Typography System**:
  - **Headings**: `Orbitron` 或 `Rajdhani` - 帶有科技感的字體。
  - **Body/Numbers**: `Share Tech Mono` 或 `Fira Code` - 典型的終端機字體。
</idea>
</text>
</response>
