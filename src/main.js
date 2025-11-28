import './style.css';
import { Engine } from './game/Engine.js';
import { AssetManager } from './game/AssetManager.js';
import { UIManager } from './ui/UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const assetManager = new AssetManager();
  const engine = new Engine('game-canvas', assetManager);
  const uiManager = new UIManager(engine, assetManager);

  engine.setUIManager(uiManager);
  engine.startMenuLoop(); // Start background animation immediately
});
