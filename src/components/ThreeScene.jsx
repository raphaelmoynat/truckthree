import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function ThreeScene() {
    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(10, 5, 10);

        const canvas = document.getElementById("myThreeJsCanvas");
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const controls = new OrbitControls(camera, canvas);
        controls.update();

        const light = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);



        const loader = new GLTFLoader();

        loader.load(
            '/semi-truck_trailer_low_poly.glb',
            function (gltf) {
                const truck = gltf.scene;
                truck.scale.set(2, 2, 2);

                const box = new THREE.Box3().setFromObject(truck);
                const center = box.getCenter(new THREE.Vector3())
                truck.position.x = -center.x
                truck.position.y = -center.y
                truck.position.z = -center.z

                scene.add(truck);

                controls.target.set(0, 1, 0);
                controls.update();
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% chargé');
            },
            function (error) {
                console.error('Erreur de chargement:', error)
            }
        );

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        function handleResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas id="myThreeJsCanvas" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
}