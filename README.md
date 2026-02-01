# 🚀 Neon Tether: Spacebar Edition

**Neon Tether** is a high-speed, physics-based infinite runner built entirely with **Vanilla JavaScript** and **HTML5 Canvas**. 

In a procedurally generated cyberpunk void, gravity is your enemy and momentum is your only friend. Master the art of the swing using a single-button tether mechanic, upgrade your core in the Black Market, and hack the system with the hidden developer console.

---

## 🎮 Game Features

* **Custom Physics Engine:** Features a spring-damper system for realistic rope tension, gravity, drag, and momentum conservation.
* **Procedural Generation:** The world generates infinitely as you travel; no two runs are the same.
* **Persistent Save System:** Uses `localStorage` to save your Credits, High Score, Unlocked Skins, and Equipped items automatically.
* **The Black Market:** A fully functional in-game store to purchase Core Skins, Particle Trails, and Backgrounds.
* **Dynamic Audio:** A synthesizer-based audio system created via the Web Audio API (no external sound files required).
* **Dev Tools:** A hidden administrative backend for debugging and testing.

---

## 🕹️ Controls

| Action | Input | Description |
| :--- | :--- | :--- |
| **Tether / Swing** | `SPACEBAR` (Hold) | Fires a rope to the nearest white target. |
| **Launch / Fly** | `SPACEBAR` (Release) | Releases the rope. Time this to gain speed. |
| **Air Thrusters** | `LEFT` / `RIGHT` Arrows | Fine-tune your trajectory mid-air. |
| **Menu Navigation** | Mouse Click | Interact with the UI and Store. |

> **Mobile Support:** You can also tap and hold the screen to swing on touch devices.

---

## 🛠️ Installation & Setup

This project requires **no dependencies**, build tools, or installation. It runs directly in the browser.

1.  **Download** the source code.
2.  Ensure you have the three core files in the same folder:
    * `index.html`
    * `style.css`
    * `script.js`
3.  **Double-click `index.html`** to open it in your default web browser (Chrome, Firefox, Edge, etc.).

---

## 📂 Project Structure

```text
/Neon-Tether
│
├── index.html      # The game skeleton, UI overlay HTML, and DOM structure.
├── style.css       # Cyberpunk styling, UI animations, and layout.
└── script.js       # The Game Engine (Physics, Game Loop, Save System, Audio).
