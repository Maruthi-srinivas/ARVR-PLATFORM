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












// Import necessary packages and modules
import { Canvas, useThree,useFrame } from '@react-three/fiber'; // Core 3D rendering components for React
import { useState, useEffect,useRef } from 'react'; // React hooks for state and lifecycle management
import { OrbitControls,Environment} from '@react-three/drei';  // Predefined 3D utilities
import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing'; // Post-processing effects
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';  // Loader for HDR textures
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'; // Loader for FBX models
import * as THREE from 'three'; // Core library for 3D rendering
import { useSpring, animated } from '@react-spring/three';  // <-- Import animation helpers  // Animation helpers for Three.js
import './App.css';  // Custom styles for the application
import { useGLTF } from '@react-three/drei'; // Hook to load GLTF/GLB models

// Component to handle and display 3D models
function Model({ materialProps, glbModel, fbxModelUrl, texture, startAnimation }) {
  const [modelScene, setModelScene] = useState(null); // State to store the model's scene
  const [mixer, setMixer] = useState(null);  // State to manage animations
  const modelRef = useRef();  // Reference to the model for manipulation

  // Always call useGLTF, but pass a dummy URL if glbModel is not provided
  const gltfData = useGLTF(glbModel || "/scene.gltf", true);

  // Animation properties for spring rotation
  const props = useSpring({
    rotation: startAnimation ? [Math.PI, Math.PI, Math.PI] : [0, 0, 0],
    config: { duration: 5000 },
    reset: true,
  });
    // Effect to clear the scene if no GLB model is provided
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
 
  // Effect to process GLB models when they change
  useEffect(() => {
    if (glbModel && gltfData) {
      const { scene, animations } = gltfData; // Extract scene and animations from model data

      // Traverse through model and update material properties

      // Remove textures from the model
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
           // Check if material is an array
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.map = null; // Remove the texture
              mat.needsUpdate = true; // Trigger material update
            });
          } else {
            child.material.map = texture; // Apply custom texture if provided
            child.material.needsUpdate = true; // Mark material for update
          }
          // Update material properties from input
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

      setModelScene(scene);  // Save the processed scene
      // Setup animation mixer if animations exist
      if (animations.length > 0) {
        const animationMixer = new THREE.AnimationMixer(scene);
        animations.forEach((clip) => {
          const action = animationMixer.clipAction(clip);  // Link animation clips to the mixer
          action.play();  // Start playing animations
        });
        setMixer(animationMixer);  // Save the mixer instance
      }
    }
  }, [glbModel, materialProps,texture,gltfData]);

  // Effect to process FBX models when they change
  useEffect(() => {
    if (fbxModelUrl) {
      const loader = new FBXLoader();  // Create a new FBX loader
      loader.load(
        fbxModelUrl,  // URL of the FBX file
        (model) => {
          console.log("FBX Model Loaded:", model); // Log successful load

         // Traverse and apply materials/textures
          model.traverse((child) => {
            if (child.isMesh) {
              // Preserve existing texture if no user texture is provided
              if (!texture) {
                if (child.material.map) {
                  child.material.map.needsUpdate = true; // Ensure existing texture updates
                }
              } else {
                // Apply user-provided texture
                child.material.map = texture;  // Apply custom texture
                child.material.map.needsUpdate = true;
              }

              // Update other material properties
              child.material.color = new THREE.Color(materialProps.color);  //color properties
              child.material.roughness = materialProps.roughness;    //Roughness properties
              child.material.metalness = materialProps.metalness;     //Metalness properties
              child.material.emissive = new THREE.Color(materialProps.emissive);  //Emissive properties
              child.material.opacity = materialProps.opacity;           //opacity properties
              child.material.transparent = materialProps.opacity < 1; 
              child.material.clearcoat = materialProps.clearcoat;
              child.material.clearcoatRoughness = materialProps.clearcoatRoughness;
              child.material.needsUpdate = true;
            }
          });

          setModelScene(model);  // Save the processed scene

          // Initialize animation mixer if animations exist
          if (model.animations && model.animations.length > 0) {
            console.log("FBX Animations Found:", model.animations);
            const animationMixer = new THREE.AnimationMixer(model);
            model.animations.forEach((clip) => {
              const action = animationMixer.clipAction(clip);  // Link animation clips to the mixer
              action.play(); // Start playing animations
            });
            setMixer(animationMixer); // Save the mixer instance
          } else {
            console.warn("No animations found in FBX model.");
          }
        },
        undefined,
        (error) => console.error("Error loading FBX:", error)  // Log load errors
      );
    }
  }, [fbxModelUrl, materialProps, texture]);

  // Update animations
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
  });
  // Render the model scene with animations
  return modelScene ? (
    <animated.primitive object={modelScene} ref={modelRef} {...props} />
  ) : null;
}



export default function App() {
  // State to hold material properties for the model
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff', // Base color of the material
    roughness: 0.5, // Roughness level of the material
    metalness: 0.5, // Metalness of the material
    specular: '#ffffff', // Specular (reflection)property
    emissive: '#000000', // Emissive (glowing) property
    opacity: 1.0, // Opacity (transparency)property
    clearcoat: 0.0, // Clearcoat (polished surface) property
    clearcoatRoughness: 0.0, // Clearcoat Roughness property
  });
   // State to manage lighting properties
  const [lightProps, setLightProps] = useState({
    color: '#ffffff', // Color of the light
    intensity: 1, // Intensity of the light
    position: { x: 10, y: 10, z: 10 }, // Position of the light in 3D space
  });
  // State to toggle postprocessing bloom effect
  const [enableBloom, setEnableBloom] = useState(true);
   // State to manage uploaded GLB model
  const [glbModel, setGlbModel] = useState(null);
  // State to manage uploaded texture for the model
  const [texture, setTexture] = useState(null);
  // State to manage the undostack
  const [undoStack, setUndoStack] = useState([]);
  // State to manage environment HDRI texture
  const [environment, setEnvironment] = useState(null);
  // State to manage the redostack
  const [redoStack, setRedoStack] = useState([]);
  // State to control various environment settings
  const [exposure, setExposure] = useState(1); // Tone mapping exposure
  const [environmentIntensity, setEnvironmentIntensity] = useState(1);  // Environment light intensity
  const [environmentRotation, setEnvironmentRotation] = useState(0); // Rotation of the HDRI environment
  const [hdriBlur, setHdriBlur] = useState(0.0); // Blur effect on HDRI background
  // State to manage uploaded GLB model
  const [fbxModelUrl, setFbxModelUrl] = useState(null);
  // State to manage Animation
  const [startAnimation, setStartAnimation] = useState(false);

  // Functionality to save which properties into undostack
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
    if (newStack.length > 10) newStack.shift();  //dynamically changes the stack length
    setUndoStack(newStack);
    setRedoStack([]);
  };
// Undo operation functionality
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
  
// Redo functionality
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
  // Material Properties Handler
  const handleMaterialChange = (newProps) => {
    setMaterialProps((prevProps) => {
      const updatedProps = { ...prevProps, ...newProps };
      saveToUndoStack();
      return updatedProps;
    });
  };
  
  // Light properties Hnadler
  const handleLightChange = (newProps) => {
    setLightProps((prevProps) => {
      const updatedProps = { ...prevProps, ...newProps };
      saveToUndoStack();
      return updatedProps;
    });
  };
  const handleHDRIChange = (newState) => {
    setEnvironmentIntensity(newState.intensity || environmentIntensity);
    setHdriBlur(newState.blur || hdriBlur);
    setExposure(newState.exposure || exposure);
    setEnvironmentRotation(newState.rotation || environmentRotation);
    saveToUndoStack();
  };
  // Function to handle uploading GLB model files
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url);
      setFbxModelUrl(null); // Clear FBX model if a GLB is uploaded
      saveToUndoStack();
    }
  };
  // Function to handle uploading FBX model files
  const handleFBXUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFbxModelUrl(url);
      setGlbModel(null); // Clear GLB model if an FBX is uploaded
      saveToUndoStack();
    }
  };
  // Function to handle uploading Textures files
  const handleTextureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const loader = new THREE.TextureLoader();
      loader.load(url, (loadedTexture) => {
        setTexture(loadedTexture);
        saveToUndoStack();
      });
    }
  };
  // Function to handle uploading HDRI files
  const handleHdriUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      new RGBELoader().load(URL.createObjectURL(file), (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        setEnvironment(texture); // Set HDR texture for environment
        saveToUndoStack();
      });
    }
  };


  return (
    <div className="app-container">
      <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}>
        <ambientLight intensity={0.2} />
        <directionalLight
          color={new THREE.Color(lightProps.color)}
          intensity={lightProps.intensity}
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
        />
            {/* Render the uploaded model if available */}
        <Model materialProps={materialProps} glbModel={glbModel} fbxModelUrl={fbxModelUrl} texture={texture} startAnimation={startAnimation} />
        {/* Environment map (HDRI) */}
          {environment && (
          <Environment
            background
            map={environment}
            intensity={environmentIntensity}
            blur={hdriBlur}
            rotation={[0, environmentRotation, 0]}
          />
        )}
        {/* Postprocessing effects */}
        {enableBloom && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
        {/* Orbit controls for camera manipulation */}
        <OrbitControls />
      </Canvas>
      {/* Panel for UI controls */}
      <div className="controls-panel">
        {/* Material Properties controls */}
  <h3>Material Settings</h3>        
  <label>
    Color:
    <input
      type="color"
      value={materialProps.color}
      onChange={(e) => handleMaterialChange({ color: e.target.value })}
    />
  </label>
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
  <label>
    Specular:
    <input
      type="color"
      value={materialProps.specular}
      onChange={(e) => handleMaterialChange({ specular: e.target.value })}
    />
  </label>
  <label>
    Emissive:
    <input
      type="color"
      value={materialProps.emissive}
      onChange={(e) => handleMaterialChange({ emissive: e.target.value })}
    />
  </label>
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
  <label>
    Light Color:
    <input
      type="color"
      value={lightProps.color}
      onChange={(e) => handleLightChange({ color: e.target.value })}
    />
  </label>
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
              {/* HDRI Environment properties calling controls */}
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
        {/* All types of file uploading controls */}
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






