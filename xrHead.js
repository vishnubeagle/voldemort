"use strict";

import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Track the location of the player's head using the camera, so that the
 * correct orientation of the hand can be determined.
 */
export class XrHead {
    constructor(context) {
        this.context = context;
        this.position = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.worldUp = new THREE.Vector3();
        this.forward = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.right = new THREE.Vector3();

        this.headModel = new THREE.Group();
        this.context.scene.add(this.headModel);
        this.loadHeadModel();
    }

    /**
     * Load the real head model
     */
    loadHeadModel() {
        const loader = new GLTFLoader();
        loader.load('/models/head.glb', (gltf) => {
            this.realHeadModel = gltf.scene;
            this.realHeadModel.scale.set(1, 1, 1); // Adjust scale as necessary
            this.realHeadModel.rotateY(Math.PI); // Rotate 180 degrees around Y-axis to face the correct direction
            
            // Traverse the model and ensure materials are set correctly
            this.realHeadModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.needsUpdate = true; // Ensure materials are updated
                }
            });

            this.headModel.add(this.realHeadModel);
        }, undefined, (error) => {
            console.error('An error happened while loading the head model', error);
        });
    }

    /**
     * Determine the world coordinates and axis of the player's head
     */
    update() {
        this.context.camera.getWorldPosition(this.position);
        this.context.camera.getWorldQuaternion(this.quaternion);
        this.worldUp.set(0, 1, 0);
        this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
        this.forward.set(0, 0, -1).applyQuaternion(this.quaternion);
        this.right.set(1, 0, 0).applyQuaternion(this.quaternion);

        this.headModel.position.copy(this.position);
        this.headModel.quaternion.copy(this.quaternion);
    }
}
