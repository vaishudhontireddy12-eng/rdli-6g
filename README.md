# Revisiting Data Recovery Loops in 6G Networks — Interactive Presentation

Interactive 3D technical seminar presentation featuring a futuristic light-blue/white wireless backdrop, standalone **404 ERROR** team introduction, an animated 3D research-paper cover page with PDF authors, a curved 9-topic 3D carousel, and vertically scrollable fullscreen slides with original paper diagrams and tables.

> **No API keys, environment variables, or external backend services are required** to run this presentation locally.

---

## Quick Start in VS Code

### 1. Install Prerequisites
- **Node.js (v20.19+ or v22+ LTS recommended):** [https://nodejs.org](https://nodejs.org)
- **Visual Studio Code:** [https://code.visualstudio.com](https://code.visualstudio.com)

### 2. Extract & Open the Project
1. Right-click **`6g-seminar-presentation.zip`** and extract (`Extract All...` on Windows / double-click on macOS).
2. Open **VS Code**.
3. Click **File → Open Folder...** and select the extracted **`6g-seminar-presentation`** folder (the folder containing `package.json`, `src/`, and `public/`).

### 3. Install Dependencies & Start Locally
1. In VS Code, open the integrated terminal: **Terminal → New Terminal** (or press `` Ctrl + ` `` on Windows/Linux, `` Cmd + ` `` on macOS).
2. Install packages:
   ```bash
   npm install
   ```
3. Start the local presentation server:
   ```bash
   npm run dev
   ```
4. Hold **Ctrl** (or **Cmd** on macOS) and click the link shown in the terminal, or open your browser to:
   ```
   http://localhost:3000
   ```

*(If port `3000` is already in use by another app, run `npx vite --port 3005` instead and open `http://localhost:3005`.)*

---

## Presentation Controls

| Screen | Controls |
| --- | --- |
| **Screen 1 · Team 404 ERROR** | Swipe right, press `ArrowRight` / `Enter` / `Space`, or click **Seminar Cover** |
| **Screen 2 · Research Paper Cover** | Hover/tilt the 3D paper; swipe right, press `ArrowRight` / `Enter`, or click **Explore Topics** |
| **Screen 3 · 9-Topic 3D Carousel** | Drag, swipe, scroll wheel, click pagination dots, or press `ArrowLeft` / `ArrowRight`; click the center card or **Open** to expand |
| **Fullscreen Topic Slides** | Scroll vertically for full derivations & figures; use `01 / 09` stepper, `ArrowLeft` / `ArrowRight`, or click **Back** / swipe left to return |
| **Laptop Fullscreen Mode** | Click **Present** (top-right) or press **`F`** anywhere |

---

## Other Useful Scripts

```bash
# Type-check TypeScript
npm run lint

# Build production static files into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```text
6g-seminar-presentation/
├── public/
│   └── assets/
│       ├── aistudio/        # Team 404 ERROR banner & uploaded research PDF
│       └── figures/         # Original research paper Figures 1–6 & Table I
├── src/
│   ├── components/          # 3D backdrop, ThreeDPaper, 3D carousel, cover & fullscreen views
│   ├── data/                # Technical seminar metadata
│   ├── slides/              # Cover canvas texture & all 9 detailed topic slide components
│   ├── types/               # TypeScript definitions
│   ├── App.tsx              # Presentation navigation state & transitions
│   └── index.css            # Tailwind CSS & slide reveal / scrollbar styling
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
