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
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.5,
    specular: '#ffffff', // Specular property
    emissive: '#000000', // Emissive property
    opacity: 1.0, // Opacity property
    clearcoat: 0.0, // Clearcoat property
    clearcoatRoughness: 0.0, // Clearcoat Roughness property
  });
  const [lightProps, setLightProps] = useState({
    color: '#ffffff',
    intensity: 1,
    position: { x: 10, y: 10, z: 10 },
  });
  const [enableBloom, setEnableBloom] = useState(true);
  const [glbModel, setGlbModel] = useState(null);
  const [texture, setTexture] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [environment, setEnvironment] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [exposure, setExposure] = useState(1);
  const [environmentIntensity, setEnvironmentIntensity] = useState(1);
  const [environmentRotation, setEnvironmentRotation] = useState(0);
  const [hdriBlur, setHdriBlur] = useState(0.0);
  const [fbxModelUrl, setFbxModelUrl] = useState(null);
  const [startAnimation, setStartAnimation] = useState(false);

  
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
    if (newStack.length > 10) newStack.shift();
    setUndoStack(newStack);
    setRedoStack([]);
  };

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
  
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url);
      setFbxModelUrl(null); // Clear FBX model if a GLB is uploaded
      saveToUndoStack();
    }
  };
  
  const handleFBXUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFbxModelUrl(url);
      setGlbModel(null); // Clear GLB model if an FBX is uploaded
      saveToUndoStack();
    }
  };
  
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
        <Model materialProps={materialProps} glbModel={glbModel} fbxModelUrl={fbxModelUrl} texture={texture} startAnimation={startAnimation} />
        {environment && (
          <Environment
            background
            map={environment}
            intensity={environmentIntensity}
            blur={hdriBlur}
            rotation={[0, environmentRotation, 0]}
          />
        )}
        {enableBloom && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
        <OrbitControls />
      </Canvas>

      <div className="controls-panel">
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






