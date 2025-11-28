import heic2any from 'heic2any';
import { get, set, del } from 'idb-keyval';

export class AssetManager {
    constructor() {
        this.assets = {
            birdImage: null,
            pipeImage: null,
            backgroundImage: null,
            jumpSound: null,
            gameOverSound: null,
            gameOverMeme: null,
            creatorImage: null
        };
        this.loadFromStorage();
    }

    // Helper to load images
    loadImage(assetKey, data) {
        const img = new Image();
        img.src = data;
        this.assets[assetKey] = img;
    }

    // Helper to load audio
    loadAudio(assetKey, data) {
        const audio = new Audio(data);
        this.assets[assetKey] = audio;
    }

    async loadFromStorage() {
        try {
            const birdData = await get('custom_bird');
            if (birdData) this.loadImage('birdImage', birdData);

            const pipeData = await get('custom_pipe');
            if (pipeData) this.loadImage('pipeImage', pipeData);

            const jumpSoundData = await get('custom_jump');
            if (jumpSoundData) this.loadAudio('jumpSound', jumpSoundData);

            const bgData = await get('custom_bg');
            if (bgData) this.loadImage('backgroundImage', bgData);

            const goSoundData = await get('custom_gameover');
            if (goSoundData) this.loadAudio('gameOverSound', goSoundData);

            const memeData = await get('custom_meme');
            if (memeData) this.loadImage('gameOverMeme', memeData);

            const creatorData = await get('custom_creator');
            if (creatorData) this.loadImage('creatorImage', creatorData);
        } catch (e) {
            console.error("Failed to load assets from IndexedDB", e);
        }
    }

    saveAsset(type, file) {
        return new Promise((resolve, reject) => {
            // Check for HEIC
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                }).then((conversionResult) => {
                    // conversionResult can be a Blob or an array of Blobs
                    const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
                    this._processFile(type, blob, resolve, reject);
                }).catch(e => {
                    console.error("HEIC conversion failed", e);
                    reject(e);
                });
            } else {
                this._processFile(type, file, resolve, reject);
            }
        });
    }

    _processFile(type, file, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            let key;
            let assetKey;
            let isImage = false;

            try {
                switch (type) {
                    case 'bird':
                        key = 'custom_bird';
                        assetKey = 'birdImage';
                        isImage = true;
                        break;
                    case 'pipe':
                        key = 'custom_pipe';
                        assetKey = 'pipeImage';
                        isImage = true;
                        break;
                    case 'jump':
                        key = 'custom_jump';
                        assetKey = 'jumpSound';
                        isImage = false; // It's audio
                        break;
                    case 'bg':
                        key = 'custom_bg';
                        assetKey = 'backgroundImage';
                        isImage = true;
                        break;
                    case 'gameover':
                        key = 'custom_gameover';
                        assetKey = 'gameOverSound';
                        isImage = false; // It's audio
                        break;
                    case 'meme':
                        key = 'custom_meme';
                        assetKey = 'gameOverMeme';
                        isImage = true;
                        break;
                    case 'creator':
                        key = 'custom_creator';
                        assetKey = 'creatorImage';
                        isImage = true;
                        break;
                    default:
                        reject(new Error('Unknown asset type'));
                        return;
                }

                // Save to IndexedDB
                set(key, result)
                    .then(() => {
                        if (isImage) {
                            this.loadImage(assetKey, result);
                        } else {
                            this.loadAudio(assetKey, result);
                        }
                        resolve();
                    })
                    .catch(err => {
                        console.error("IndexedDB save failed", err);
                        reject(err);
                    });

            } catch (err) {
                console.error("Processing failed", err);
                reject(err);
            }
        };
        reader.readAsDataURL(file);
    }

    async deleteAsset(type) {
        let key = `custom_${type}`;
        await del(key);
    }

    async clearAssets() {
        await del('custom_bird');
        await del('custom_pipe');
        await del('custom_jump');
        await del('custom_bg');
        await del('custom_gameover');
        await del('custom_meme');
        await del('custom_creator');

        this.assets.birdImage = null;
        this.assets.pipeImage = null;
        this.assets.backgroundImage = null;
        this.assets.jumpSound = null;
        this.assets.gameOverSound = null;
        this.assets.gameOverMeme = null;
        this.assets.creatorImage = null;
    }
}
