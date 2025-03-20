import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import './App.css'
import ThreeScene from "./components/ThreeScene.jsx";


function App() {

  return (
    <>
      <div>projet three</div>
        <ThreeScene />
    </>
  )
}

export default App
