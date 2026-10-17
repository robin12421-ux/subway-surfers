# Track 05 — The Video Line

An original, scroll-controlled 3D train journey exploring five topics about YouTube. Built with HTML, CSS, JavaScript, Three.js, GSAP, and Vite. It is a creative concept and is not affiliated with YouTube or Subway Surfers.

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- npm
- A modern browser with WebGL enabled for the full 3D scene

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`). To test the production build locally:

```bash
npm run build
npm run preview
```

## Deploy to Render

1. Create a GitHub repository and upload the contents of this folder. `index.html`, `package.json`, `render.yaml`, `README.md`, and `src/` should be at the repository root (not nested inside another folder).
2. In Render, choose **New + → Blueprint** and connect the repository. Render reads `render.yaml` and creates a Static Site.
3. Confirm the build command is `npm install && npm run build` and the publish directory is `dist`.
4. Deploy. No environment variables, backend, or database are required.

You can also create a **Static Site** manually with the same build command and publish directory.

## Change the YouTube copy

Edit `src/content.js`. The `stops` array contains five objects, one per door. Update each stop's `title`, `description`, and `facts` (three facts per stop). The UI is generated from that data, so you don't need to edit the HTML template for ordinary copy changes.

## Interaction notes

- Scrolling drives the train/camera progress and reverses naturally when scrolling upward.
- The five door stops and content panels are generated from `src/content.js`.
- The replay button returns to the top.
- Reduced-motion preferences are respected, mobile rendering uses a lower pixel ratio, and a WebGL fallback message is included.
- The train and tunnel are made from procedural Three.js geometry; no third-party game assets are used.

## Files

- `src/main.js` — scene setup, scroll progress, camera and UI behavior
- `src/train.js` — procedural train, doors, rails and tunnel
- `src/content.js` — editable five-stop copy
- `src/style.css` — visual design and responsive rules
