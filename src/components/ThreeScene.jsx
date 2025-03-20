import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function ThreeScene() {
    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("white")

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-55, 15, 25);

        const canvas = document.getElementById("myThreeJsCanvas");
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const controls = new OrbitControls(camera, canvas)

        scene.add(new THREE.AmbientLight(0xffffff, 0.7))

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7)
        scene.add(directionalLight)

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(60, 60),
            new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
        );
        floor.rotation.x = Math.PI / 2;
        floor.position.y = 0
        scene.add(floor)

        const carton = new THREE.Mesh(
            new THREE.BoxGeometry(6, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        carton.position.set(-8, 1, 8);
        carton.userData.name = "carton"
        scene.add(carton)

        const secondCarton = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2),
            new THREE.MeshStandardMaterial({ color: "red" })
        );
        secondCarton.position.set(-10, 0, 12);
        secondCarton.userData.name = "secondCarton"
        scene.add(secondCarton)

        const loader = new GLTFLoader();
        loader.load(
            '/semi-truck_trailer_low_poly.glb',
            function (gltf) {
                const truck = gltf.scene;
                truck.scale.set(2, 2, 2);

                const box = new THREE.Box3().setFromObject(truck);

                const center = box.getCenter(new THREE.Vector3());
                truck.position.x = -center.x
                truck.position.y = 0
                truck.position.z = -center.z
                scene.add(truck);
            },
            null,
            error => console.error(error)
        );

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let selectedObject = null;
        let movementPlane = new THREE.Plane()
        let offset = new THREE.Vector3()

        function onMouseDown(event) {
            if (!event.shiftKey) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            controls.enabled = false

            scene.traverse((object) => {
                if (object.userData.name === "carton") {
                    selectedObject = object;
                }
            });

            if (selectedObject) {
                movementPlane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(movementPlane.normal),
                    selectedObject.position
                );

                raycaster.setFromCamera(mouse, camera)

                const intersection = new THREE.Vector3()
                raycaster.ray.intersectPlane(movementPlane, intersection)
                offset.copy(selectedObject.position).sub(intersection)

                onMouseMove(event)
            }
        }

        function onMouseMove(event) {
            if (selectedObject) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

                raycaster.setFromCamera(mouse, camera);
                const intersection = new THREE.Vector3()
                raycaster.ray.intersectPlane(movementPlane, intersection)

                selectedObject.position.copy(intersection.add(offset))
            }
        }

        function onMouseUp() {
            if (selectedObject) {
                controls.enabled = true
                selectedObject = null
            }
        }

        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        function animate() {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate();


        return () => {
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        };
    }, []);


    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas id="myThreeJsCanvas" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
}