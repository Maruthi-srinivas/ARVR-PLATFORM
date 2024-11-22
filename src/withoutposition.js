import { Canvas, useThree,useFrame } from '@react-three/fiber';
import { useState, useEffect,useRef } from 'react';
import { OrbitControls,Environment} from '@react-three/drei';
import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';  // <-- Import animation helpers
import './App.css';
import { useGLTF } from '@react-three/drei'; // Ensure this import is correct



function Model({ materialProps, glbModel, fbxModelUrl, texture, startAnimation }) {
  const [modelScene, setModelScene] = useState(null);
  const [mixer, setMixer] = useState(null);
  const modelRef = useRef();

  // Always call useGLTF, but pass a dummy URL if glbModel is not provided
  const gltfData = useGLTF(glbModel || "/scene.gltf", true);

  // Animation properties for spring rotation
  const props = useSpring({
    rotation: startAnimation ? [Math.PI, Math.PI, Math.PI] : [0, 0, 0],
    config: { duration: 5000 },
    reset: true,
  });

  // Process GLB model
  useEffect(() => {
    if (glbModel && gltfData) {
      const { scene, animations } = gltfData;
  
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Apply material properties from state
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.color = new THREE.Color(materialProps.color);
              mat.roughness = materialProps.roughness;
              mat.metalness = materialProps.metalness;
              mat.emissive = new THREE.Color(materialProps.emissive);
              mat.opacity = materialProps.opacity;
              mat.transparent = materialProps.opacity < 1;
              mat.needsUpdate = true;
            });
          } else {
            child.material.color = new THREE.Color(materialProps.color);
            child.material.roughness = materialProps.roughness;
            child.material.metalness = materialProps.metalness;
            child.material.emissive = new THREE.Color(materialProps.emissive);
            child.material.opacity = materialProps.opacity;
            child.material.transparent = materialProps.opacity < 1;
            child.material.needsUpdate = true;
          }
        }
      });
  
      setModelScene(scene);
  
      if (animations.length > 0) {
        const animationMixer = new THREE.AnimationMixer(scene);
        animations.forEach((clip) => {
          const action = animationMixer.clipAction(clip);
          action.play();
        });
        setMixer(animationMixer);
      }
    }
  }, [glbModel, gltfData, materialProps]);
  

  // Process FBX model
  useEffect(() => {
    if (fbxModelUrl) {
      const loader = new FBXLoader();
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
            const animationMixer = new THREE.AnimationMixer(model);
            model.animations.forEach((clip) => {
              const action = animationMixer.clipAction(clip);
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
    <animated.primitive object={modelScene} ref={modelRef} position={modelScene.position}
    rotation={modelScene.rotation}
    scale={modelScene.scale} {...props} />
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
  const [hdrTexture, setHdrTexture] = useState(null); // State to hold HDRI texture
  const [exposure, setExposure] = useState(1);
  const [environmentIntensity, setEnvironmentIntensity] = useState(1);
  const [environmentRotation, setEnvironmentRotation] = useState(0);
  const [hdriBlur, setHdriBlur] = useState(0.0);
  const [fbxModelUrl, setFbxModelUrl] = useState(null);
  const [startAnimation, setStartAnimation] = useState(false);
  const [models, setModels] = useState([]);

  
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
      setRedoStack([...redoStack, {
        materialProps,
        lightProps,
        environmentIntensity,
        hdriBlur,
        exposure,
        environmentRotation,
        glbModel,
        texture,
        enableBloom,
      }]);
      setMaterialProps(previousState.materialProps);
      setLightProps(previousState.lightProps);
      setEnvironmentIntensity(previousState.environmentIntensity);
      setHdriBlur(previousState.hdriBlur);
      setExposure(previousState.exposure);
      setEnvironmentRotation(previousState.environmentRotation);
      setGlbModel(previousState.glbModel);
      setTexture(previousState.texture);
      setEnableBloom(previousState.enableBloom);
    }
  };

  const redo = () => {
    if (redoStack.length) {
      const nextState = redoStack.pop();
      setUndoStack([...undoStack, {
        materialProps,
        lightProps,
        environmentIntensity,
        hdriBlur,
        exposure,
        environmentRotation,
        glbModel,
        texture,
        enableBloom,
      }]);
      setMaterialProps(nextState.materialProps);
      setLightProps(nextState.lightProps);
      setEnvironmentIntensity(nextState.environmentIntensity);
      setHdriBlur(nextState.hdriBlur);
      setExposure(nextState.exposure);
      setEnvironmentRotation(nextState.environmentRotation);
      setGlbModel(nextState.glbModel);
      setTexture(nextState.texture);
      setEnableBloom(nextState.enableBloom);
    }
  };
  // Handlers that update state and save to undo stack
  const handleMaterialChange = (newProps) => {
    setMaterialProps((prevProps) => ({ ...prevProps, ...newProps }));
    saveToUndoStack();
  };

  const handleLightChange = (newProps) => {
    setLightProps((prevProps) => ({ ...prevProps, ...newProps }));
    saveToUndoStack();
  };



  // Function to add a new model to the scene
  const addModel = (file, type) => {
    const url = URL.createObjectURL(file);
    
    const newModel = {
      type,  // "glb" or "fbx"
      url,
      materialProps: {
        color: "#ffffff",
        roughness: 0.5,
        metalness: 0.5,
        emissive: "#000000",
        opacity: 1.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
      },
      texture: null,
      startAnimation: false,
      position: [0, 0, 0],  // Default position
      rotation: [0, 0, 0],  // Default rotation
      scale: [1, 1, 1],     // Default scale
    };

    setModels((prevModels) => [...prevModels, newModel]);
    saveToUndoStack();
  };

  // Handle GLB file upload
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) addModel(file, "glb");
  };

  // Handle FBX file upload
  const handleFBXUpload = (e) => {
    const file = e.target.files[0];
    if (file) addModel(file, "fbx");
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
        {models.map((model, index) => (
          <Model
            key={index}
            materialProps={model.materialProps}
            glbModel={model.type === "glb" ? model.url : null}
            fbxModelUrl={model.type === "fbx" ? model.url : null}
            texture={model.texture}
            startAnimation={model.startAnimation}
          />
        ))}
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
            type="number"
            value={lightProps.position.x}
            onChange={(e) => handleLightChange({ position: { ...lightProps.position, x: parseFloat(e.target.value) } })}
          />
        </label>
        <label>
          Position Y:
          <input
            type="number"
            value={lightProps.position.y}
            onChange={(e) => handleLightChange({ position: { ...lightProps.position, y: parseFloat(e.target.value) } })}
          />
        </label>
        <label>
          Position Z:
          <input
            type="number"
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
          <button onClick={() => setStartAnimation(!startAnimation)}>Toggle Animation</button>
        </div>
      </div>  
    </div>
  );
}
