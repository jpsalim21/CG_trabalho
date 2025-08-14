import * as THREE from "three";

class SoundController {
    constructor(camera) {
        if (SoundController.instance) return SoundController.instance;

        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        this.sounds = {};
        this.backgroundPlaying = true;

        this.loadSounds();

        SoundController.instance = this;
    }

    loadSounds() {
        const audioLoader = new THREE.AudioLoader();

        const soundFiles = {
            // Sistema
            background: '../0_assetsT3/sounds/doom.mp3',
            plataformaMovendo: '../0_assetsT3/sounds/plataformaMovendo.wav',
            portaAbrindo: '../0_assetsT3/sounds/doorOpening.wav',

            // Player
            playerInjured: '../0_assetsT3/sounds/playerInjured.wav',
            chaingun: '../0_assetsT3/sounds/chaingunFiring.wav',
            rocketlauncher: '../0_assetsT3/sounds/rocketFiring.wav',
            chave: '../0_assetsT3/sounds/chave.wav',

            // Cacodemon
            cacodemonAttack: '../0_assetsT3/sounds/cacoDemon/cacodemonAttack.wav',
            cacodemonDeath: '../0_assetsT3/sounds/cacoDemon/cacodemonDeath.wav',
            cacodemonInjured: '../0_assetsT3/sounds/cacoDemon/cacodemonInjured.wav',
            cacodemonNearby: '../0_assetsT3/sounds/cacoDemon/cacodemonNearby.wav',
            cacodemonSight: '../0_assetsT3/sounds/cacoDemon/cacodemonSight.wav',

            // Lost Soul
            lostsoulAttack: '../0_assetsT3/sounds/lostSoul/lost_soul_attack.wav',
            lostsoulInjured: '../0_assetsT3/sounds/lostSoul/injured.wav',

            // Pain Elemental
            painAttack: '../0_assetsT3/sounds/painElemental/painAttack.wav',
            painInjured: '../0_assetsT3/sounds/painElemental/injured.wav',
            painSight: '../0_assetsT3/sounds/painElemental/painSight.wav',

            // Soldier
            soldierAttack: '../0_assetsT3/sounds/soldier/soldierAttack.wav',
            soldierInjured: '../0_assetsT3/sounds/soldier/injured.wav',
            soldierSight: '../0_assetsT3/sounds/soldier/soldierSight.wav'
        };

        for (let key in soundFiles) {
            const sound = new THREE.Audio(this.listener);
            audioLoader.load(soundFiles[key], (buffer) => {
                sound.setBuffer(buffer);
                sound.setLoop(key === 'background');
                sound.setVolume(key === 'background' ? 0.3 : 0.7);
                if (key === 'background') sound.play(); // música começa ligada
            });
            this.sounds[key] = sound;
        }
    }

    play(name) {
        const sound = this.sounds[name];
        if(sound.isPlaying){
            sound.stop(); 
        }
        if (sound && !sound.isPlaying) {
            sound.play();
        }
    }

    soundBackground() {
        const bg = this.sounds['background'];
        if (!bg) {
            console.error("Background music not loaded");
            return;
        }
        
        if (this.backgroundPlaying) {
            bg.pause();
            console.log("Música pausada");
        } else {
            bg.play();
            console.log("Música retomada");
        }
        this.backgroundPlaying = !this.backgroundPlaying;
    }
}

export { SoundController };
