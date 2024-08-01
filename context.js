import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { XrInput } from './xrInput.js';
import { VRButton } from './VRButton.js';
import { Reflector } from './Reflector.js';

export class Context {

    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(-7, 10, 15);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // VR
        document.body.appendChild(VRButton.createButton(this.renderer));
        this.renderer.xr.enabled = true;
        this.xrInput = new XrInput(this);

        this.frame = 0;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onResize(), false);

        this.renderer.setAnimationLoop(() => this.onAnimate());

        this.buildScene();
    }

    buildScene() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(10, 10, -10);
        this.scene.add(directionalLight);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ color: "green" })
        );
        ground.rotation.x = - Math.PI / 2;
        ground.position.set(0, -0.001, 0);
        this.scene.add(ground);

        // Mirror
        const mirror = new Reflector(
            new THREE.PlaneGeometry(3, 4),
            {
                color: new THREE.Color(0xa0a0a0),
                textureWidth: window.innerWidth * window.devicePixelRatio * 2,
                textureHeight: window.innerHeight * window.devicePixelRatio * 2
            }
        );
        mirror.position.set(0, 2, -2);
        this.scene.add(mirror);

        // Load and add models to the scene
        const loader = new GLTFLoader();
        loader.load('/models/tree.glb', (gltf) => {
            const treeModel = gltf.scene;
            treeModel.scale.set(0.003, 0.003, 0.003);
            this.ensureMaterials(treeModel);

            for (let i = 0; i < 30; i++) {
                const clone = treeModel.clone();
                let posX, posZ;
                do {
                    posX = (Math.random() - 0.5) * 50;
                    posZ = (Math.random() - 0.5) * 50;
                } while (Math.abs(posX) < 5 && Math.abs(posZ) < 5); // Avoid placing within grid radius

                clone.position.set(posX, 0, posZ);
                this.scene.add(clone);
            }
        });

        loader.load('/models/rocks.glb', (gltf) => {
            const rockModel = gltf.scene;
            rockModel.scale.set(0.3, 0.3, 0.3);
            this.ensureMaterials(rockModel);

            for (let i = 0; i < 40; i++) {
                const clone = rockModel.clone();
                let posX, posZ;
                do {
                    posX = (Math.random() - 0.5) * 50;
                    posZ = (Math.random() - 0.5) * 50;
                } while (Math.abs(posX) < 5 && Math.abs(posZ) < 5); // Avoid placing within grid radius

                clone.position.set(posX, 0, posZ);
                this.scene.add(clone);
            }
        });

        // Add skybox
        const skyboxLoader = new THREE.CubeTextureLoader();
        const texture = skyboxLoader.load([
            '/MountainPath/posx.jpg',
            '/MountainPath/negx.jpg',
            '/MountainPath/posy.jpg',
            '/MountainPath/negy.jpg',
            '/MountainPath/posz.jpg',
            '/MountainPath/negz.jpg',
        ]);
        this.scene.background = texture;

        // Add more models and clone them similarly...
    }

    ensureMaterials(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.needsUpdate = true;
            }
        });
    }

    onAnimate() {
        this.frame++;
        this.elapsedTime = this.clock.elapsedTime;
        this.deltaTime = this.clock.getDelta();
        this.xrInput.onAnimate();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

    onResize() {
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        this.camera.aspect = winWidth / winHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(winWidth, winHeight);
        this.renderer.render(this.scene, this.camera);
    }
}
