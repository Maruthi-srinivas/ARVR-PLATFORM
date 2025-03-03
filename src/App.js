// // import logo from './logo.svg';
// // import './App.css';

// // function App() {
// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <img src={logo} className="App-logo" alt="logo" />
// //         <p>
// //           Edit <code>src/App.js</code> and save to reload.
// //         </p>
// //         <a
// //           className="App-link"
// //           href="https://reactjs.org"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           Learn React
// //         </a>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;



import { Canvas, useThree,useFrame } from '@react-three/fiber';  // Import core R3F components
import { useState, useEffect,useRef } from 'react';  // Import React hooks for state, effects, and refs
import { OrbitControls,Environment} from '@react-three/drei'; // Import useful Drei helpers for environment and camera controls
import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing'; // Postprocessing effects for enhanced visuals
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'; // Loader for HDR environment textures
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'; // Loader for FBX model files
import * as THREE from 'three';      // Core Three.js library for 3D objects and utilities
import { useSpring, animated } from '@react-spring/three';  // Animation library for smooth transitions
import './App.css';    // Import custom styles
import { useGLTF } from '@react-three/drei'; // Helper for loading GLTF/GLB models

// Component for rendering and handling the 3D model
function Model({ materialProps, glbModel, fbxModelUrl,texture, startAnimation }) {
  const [modelScene, setModelScene] = useState(null); // Store the current model scene
  const [mixer, setMixer] = useState(null); // Store the animation mixer for models
  const modelRef = useRef();  // Ref to the model for further manipulations


  // Always call useGLTF, but pass a dummy URL if glbModel is not provided
  const gltfData = useGLTF(glbModel || "/scene.gltf", true);

  // Animation properties for spring rotation
  const props = useSpring({
    rotation: startAnimation ? [Math.PI, Math.PI, Math.PI] : [0, 0, 0],
    config: { duration: 5000 },
    reset: true,
  });
  // Effect to clear the GLB model when none is provided
  useEffect(() => {
    if (!glbModel) {
      setModelScene(null); // Clear the model when GLB is null
    }
  }, [glbModel]);

  // Clear the scene when the FBX model changes to null
  useEffect(() => {
    if (!fbxModelUrl) {
      setModelScene(null); // Clear the model when FBX is null
    }
  }, [fbxModelUrl]);
  
  // Effect to handle GLB model loading and material assignment
  useEffect(() => {
    if (glbModel && gltfData) {
      const { scene, animations } = gltfData; // Extract scene and animations
  
       // Traverse scene to apply material properties and textures
      scene.traverse((child) => {
        if (child.isMesh) {
          // Preserve existing texture if no user texture is provided
          if (!texture) {
            if (child.material.map) {
              child.material.map.needsUpdate = true;
            }
          } else {
            // Apply user-provided texture
            child.material.map = texture;
            child.material.map.needsUpdate = true;
          }
  
          // Update other material properties
          child.material.color = new THREE.Color(materialProps.color);
          child.material.roughness = materialProps.roughness;
          child.material.metalness = materialProps.metalness;
          child.material.emissive = new THREE.Color(materialProps.emissive);
          child.material.opacity = materialProps.opacity;
          child.material.transparent = materialProps.opacity < 1;
          child.material.clearcoat = materialProps.clearcoat;
          child.material.clearcoatRoughness = materialProps.clearcoatRoughness;
          child.material.needsUpdate = true;
        }
      });
  
      setModelScene(scene);   // Update model scene
  
      if (animations.length > 0) {
        const animationMixer = new THREE.AnimationMixer(scene);  // Create animation mixer
        animations.forEach((clip) => {
          const action = animationMixer.clipAction(clip); // Play all animations
          action.play();
        });
        setMixer(animationMixer);
      }
    }
  }, [glbModel, materialProps, texture, gltfData]);

  // Effect to handle FBX model loading and material assignment
  useEffect(() => {
    if (fbxModelUrl) {
      const loader = new FBXLoader();   //loads the fbx loader
      loader.load(
        fbxModelUrl,
        (model) => {
          console.log("FBX Model Loaded:", model);

          // Apply materials and textures
          model.traverse((child) => {
            if (child.isMesh) {
              // Preserve existing texture if no user texture is provided
              if (!texture) {
                if (child.material.map) {
                  child.material.map.needsUpdate = true;
                }
              } else {
                // Apply user-provided texture
                child.material.map = texture;
                child.material.map.needsUpdate = true;
              }

              // Update other material properties
              child.material.color = new THREE.Color(materialProps.color);
              child.material.roughness = materialProps.roughness;
              child.material.metalness = materialProps.metalness;
              child.material.emissive = new THREE.Color(materialProps.emissive);
              child.material.opacity = materialProps.opacity;
              child.material.transparent = materialProps.opacity < 1;
              child.material.clearcoat = materialProps.clearcoat;
              child.material.clearcoatRoughness = materialProps.clearcoatRoughness;
              child.material.needsUpdate = true;
            }
          });

          setModelScene(model);

          // Initialize animation mixer if animations exist
          if (model.animations && model.animations.length > 0) {
            console.log("FBX Animations Found:", model.animations);
            const animationMixer = new THREE.AnimationMixer(model); // Create animation mixer
            model.animations.forEach((clip) => {
              const action = animationMixer.clipAction(clip); // Play all animations
              action.play();
            });
            setMixer(animationMixer);
          } else {
            console.warn("No animations found in FBX model.");
          }
        },
        undefined,
        (error) => console.error("Error loading FBX:", error)
      );
    }
  }, [fbxModelUrl, materialProps, texture]);

  // Update animations
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
  });

  return modelScene ? (
    <animated.primitive object={modelScene} ref={modelRef} {...props} />
  ) : null;
}



export default function App() {
    // State to manage material properties
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff', // Base color of the material
    roughness: 0.5, // Controls surface roughness (0: smooth, 1: rough)
    metalness: 0.5,  // Controls how metallic the material looks
    specular: '#ffffff', // Specular property
    emissive: '#000000', // Emissive property
    opacity: 1.0, // Opacity property
    clearcoat: 0.0, // Clearcoat property
    clearcoatRoughness: 0.0, // Clearcoat Roughness property
  });
  // State to manage light properties
  const [lightProps, setLightProps] = useState({
    color: '#ffffff', // Light color
    intensity: 1, // Brightness of the light
    position: { x: 10, y: 10, z: 10 },  // Position of the light in 3D space
  });
  // State to toggle bloom post-processing effect
  const [enableBloom, setEnableBloom] = useState(true);
   // State to store the URL of the uploaded GLB model
  const [glbModel, setGlbModel] = useState(null);

  // State to store the uploaded texture
  const [texture, setTexture] = useState(null);

  // State to manage the undo stack for changes
  const [undoStack, setUndoStack] = useState([]);

  // State to manage the redo stack for undone changes
  const [redoStack, setRedoStack] = useState([]);

  // State for environment settings
  const [environment, setEnvironment] = useState(null);
  const [exposure, setExposure] = useState(1); // Controls scene exposure
  const [environmentIntensity, setEnvironmentIntensity] = useState(1); // Intensity of the environment map
  const [environmentRotation, setEnvironmentRotation] = useState(0); // Rotation of the environment map
  const [hdriBlur, setHdriBlur] = useState(0.0); // Blur effect for the HDRI environment

  // State to store the URL of the uploaded FBX model
  const [fbxModelUrl, setFbxModelUrl] = useState(null);

  // State to toggle animation playback
  const [startAnimation, setStartAnimation] = useState(false);

    // Function to save the current state to the undo stack
  const saveToUndoStack = () => {
    const currentState = {
      materialProps,
      lightProps,
      environmentIntensity,
      hdriBlur,
      exposure,
      environmentRotation,
      glbModel,
      texture,
      enableBloom,
    };
    const newStack = [...undoStack, currentState];
    if (newStack.length > 10) newStack.shift();  // Limit undo stack size to 10
    setUndoStack(newStack);
    setRedoStack([]);  // Clear redo stack on new changes
  }; 
// Function to undo the last change
  const undo = () => {
    if (undoStack.length) {
      const previousState = undoStack.pop();
      setRedoStack([
        ...redoStack,
        {
          materialProps,
          lightProps,
          environmentIntensity,
          hdriBlur,
          exposure,
          environmentRotation,
          glbModel,
          texture,
          enableBloom,
          fbxModelUrl, // Add FBX model state to redo stack
        },
      ]);
  
      // Restore previous state
      setMaterialProps(previousState.materialProps);
      setLightProps(previousState.lightProps);
      setEnvironmentIntensity(previousState.environmentIntensity);
      setHdriBlur(previousState.hdriBlur);
      setExposure(previousState.exposure);
      setEnvironmentRotation(previousState.environmentRotation);
      setGlbModel(previousState.glbModel); // Properly revert GLB model
      setFbxModelUrl(previousState.fbxModelUrl); // Properly revert FBX model
      setTexture(previousState.texture);
      setEnableBloom(previousState.enableBloom);
    }
  };
  
// Function to redo the last undone change
  const redo = () => {
    if (redoStack.length) {
      const nextState = redoStack.pop();
      setUndoStack([
        ...undoStack,
        {
          materialProps,
          lightProps,
          environmentIntensity,
          hdriBlur,
          exposure,
          environmentRotation,
          glbModel,
          texture,
          enableBloom,
          fbxModelUrl, // Add FBX model state to undo stack
        },
      ]);
  
      // Restore the next state
      setMaterialProps(nextState.materialProps);
      setLightProps(nextState.lightProps);
      setEnvironmentIntensity(nextState.environmentIntensity);
      setHdriBlur(nextState.hdriBlur);
      setExposure(nextState.exposure);
      setEnvironmentRotation(nextState.environmentRotation);
      setGlbModel(nextState.glbModel); // Properly restore GLB model
      setFbxModelUrl(nextState.fbxModelUrl); // Properly restore FBX model
      setTexture(nextState.texture);
      setEnableBloom(nextState.enableBloom);
    }
  };
  
  // Handlers that update state and save to undo stack
  const handleMaterialChange = (newProps) => {
    setMaterialProps((prevProps) => {
      const updatedProps = { ...prevProps, ...newProps };
      saveToUndoStack();
      return updatedProps;
    });
  };
  
 // Handler to update light properties and save state
  const handleLightChange = (newProps) => {
    setLightProps((prevProps) => {
      const updatedProps = { ...prevProps, ...newProps };
      saveToUndoStack();
      return updatedProps;
    });
  };
  // Handler to update HDRI environment properties and save state
  const handleHDRIChange = (newState) => {
    setEnvironmentIntensity(newState.intensity || environmentIntensity);
    setHdriBlur(newState.blur || hdriBlur);
    setExposure(newState.exposure || exposure);
    setEnvironmentRotation(newState.rotation || environmentRotation);
    saveToUndoStack();
  };
   // Handler to upload and set a GLB model
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url); // Set the GLB model URL
      setFbxModelUrl(null); // Clear FBX model if a GLB is uploaded
      saveToUndoStack();
    }
  };
   // Handler to upload and set an FBX model
  const handleFBXUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFbxModelUrl(url); // Set the FBX model URL
      setGlbModel(null); // Clear GLB model if an FBX is uploaded
      saveToUndoStack();
    }
  };
  
  // Handler to upload and set a texture
  const handleTextureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const loader = new THREE.TextureLoader();
      loader.load(url, (loadedTexture) => {
        setTexture(loadedTexture);  // Set the loaded texture
        saveToUndoStack();
      });
    }
  };
    // Handler to upload and set an HDRI environment
  const handleHdriUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      new RGBELoader().load(URL.createObjectURL(file), (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; // Set HDRI mapping
        setEnvironment(texture); // Set HDR texture for environment
        saveToUndoStack();
      });
    }
  };


  return (
    <div className="app-container">
    {/* 3D Canvas with scene settings */}
      <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}>
        {/* Ambient light for general illumination */}
        <ambientLight intensity={0.2} />
          {/* Directional light based on user-specified properties */}
        <directionalLight
          color={new THREE.Color(lightProps.color)}
          intensity={lightProps.intensity}
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
        />
            {/* 3D model rendering with material, model, and animation props */}
        <Model materialProps={materialProps} glbModel={glbModel} fbxModelUrl={fbxModelUrl} texture={texture} startAnimation={startAnimation} />
            {/* HDRI environment if an environment texture is loaded */}
        {environment && (
          <Environment
            background // Set HDRI as the background
            map={environment} // HDRI texture
            intensity={environmentIntensity} // Environment light intensity
            blur={hdriBlur} // Blur level for HDRI
            rotation={[0, environmentRotation, 0]} // Rotation of the environment
          />
        )}
        {/* Post-processing effects if bloom is enabled */}
        {enableBloom && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
        {/* Controls for interacting with the 3D scene */}
        <OrbitControls />
      </Canvas>
          {/* User controls panel */}
      <div className="controls-panel">
          {/* Material property controls */}
  <h3>Material Settings</h3>
    {/* Input controls for material color */}
  <label>
    Color:
    <input
      type="color"
      value={materialProps.color}
      onChange={(e) => handleMaterialChange({ color: e.target.value })}
    />
  </label>
        {/* Input controls for material roughness */}
  <label>
    Roughness:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={materialProps.roughness}
      onChange={(e) => handleMaterialChange({ roughness: parseFloat(e.target.value) })}
    />
  </label>
        {/* Input controls for material metalness */}
  <label>
    Metalness:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={materialProps.metalness}
      onChange={(e) => handleMaterialChange({ metalness: parseFloat(e.target.value) })}
    />
  </label>
        {/* Input controls for material specular color */}
  <label>
    Specular:
    <input
      type="color"
      value={materialProps.specular}
      onChange={(e) => handleMaterialChange({ specular: e.target.value })}
    />
  </label>
        {/* Input controls for emissive color */}
  <label>
    Emissive:
    <input
      type="color"
      value={materialProps.emissive}
      onChange={(e) => handleMaterialChange({ emissive: e.target.value })}
    />
  </label>
        {/* Input controls for material opacity */}
  <label>
    Opacity:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={materialProps.opacity}
      onChange={(e) => handleMaterialChange({ opacity: parseFloat(e.target.value) })}
    />
  </label>
        {/* Input controls for clearcoat value */}
  <label>
    Clearcoat:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={materialProps.clearcoat}
      onChange={(e) => handleMaterialChange({ clearcoat: parseFloat(e.target.value) })}
    />
  </label>
        {/* Input controls for clearcoat roughness */}
  <label>
    Clearcoat Roughness:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={materialProps.clearcoatRoughness}
      onChange={(e) => handleMaterialChange({ clearcoatRoughness: parseFloat(e.target.value) })}
    />
  </label>

  <h3>Lighting Settings</h3>
           {/* Lighting settings controls */}
  <label>
    Light Color:
    <input
      type="color"
      value={lightProps.color}
      onChange={(e) => handleLightChange({ color: e.target.value })}
    />
  </label>
         {/* Light intensity control */}
  <label>
    Intensity:
    <input
      type="range"
      min="0"
      max="10"
      step="0.1"
      value={lightProps.intensity}
      onChange={(e) => handleLightChange({ intensity: parseFloat(e.target.value) })}
    />
  </label>
{/* Controls for light position (X, Y, Z) */}
        <label>
          Position X:
          <input
            type="range"
            min='0'
            max='10'
            step='0.1'
            value={lightProps.position.x}
            onChange={(e) => handleLightChange({ position: { ...lightProps.position, x: parseFloat(e.target.value) } })}
          />
        </label>
        <label>
          Position Y:
          <input
            type="range"
            min='0'
            max='10'
            step='0.1'
            value={lightProps.position.y}
            onChange={(e) => handleLightChange({ position: { ...lightProps.position, y: parseFloat(e.target.value) } })}
          />
        </label>
        <label>
          Position Z:
          <input
            type="range"
            min='0'
            max='10'
            step='0.1'
            value={lightProps.position.z}
            onChange={(e) => handleLightChange({ position: { ...lightProps.position, z: parseFloat(e.target.value) } })}
          />
        </label>
              {/* HDRI environment settings */}
  <h3> HDRI Environment Settings</h3>
  <label>
    Environment Intensity:
    <input
      type="range"
      min="0"
      max="5"
      step="0.1"
      value={environmentIntensity}
      onChange={(e) => {
        setEnvironmentIntensity(parseFloat(e.target.value));
        saveToUndoStack();
      }}
    />
  </label>
  <label>
    Exposure:
    <input
      type="range"
      min="0"
      max="5"
      step="0.1"
      value={exposure}
      onChange={(e) => {
        setExposure(parseFloat(e.target.value));
        saveToUndoStack();
      }}
    />
  </label>
  <label>
    HDRI Blur:
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={hdriBlur}
      onChange={(e) => {
        setHdriBlur(parseFloat(e.target.value));
        saveToUndoStack();
      }}
    />
  </label>
  <label>
    Environment Rotation:
    <input
      type="range"
      min="0"
      max={2 * Math.PI}
      step="0.1"
      value={environmentRotation}
      onChange={(e) => {
        setEnvironmentRotation(parseFloat(e.target.value));
        saveToUndoStack();
      }}
    />
  </label>
         {/* File upload controls for models and textures */}
        <h3>Upload Model</h3>
        <label>GLB:</label>
        <input type="file" accept=".glb" onChange={handleGLBUpload} />
        <label>FBX:</label>
        <input type="file" accept=".fbx" onChange={handleFBXUpload} />
        <h3>Upload Texture</h3>
        <label>Texture:</label>
        <input type="file" accept="image/*" onChange={handleTextureUpload} />
        <h3>Upload HDRI Environment</h3>
        <label>HDRI:</label>
        <input type="file" accept=".hdr" onChange={handleHdriUpload} />
        <div className="undo-redo-controls">
          <button onClick={undo} disabled={!undoStack.length}>Undo</button>
          <button onClick={redo} disabled={!redoStack.length}>Redo</button>
          
        </div>
      </div>  
    </div>
  );
}
