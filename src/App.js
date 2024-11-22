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



// //base code


// import { Canvas, useThree } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import JSZip from 'jszip';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { TextureLoader } from 'three';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import './App.css';

// function Environment({ environment }) {
//   const { scene } = useThree();

//   useEffect(() => {
//     if (environment) {
//       scene.environment = environment;
//       scene.background = environment;
//     }
//     return () => {
//       scene.environment = null;
//       scene.background = null;
//     };
//   }, [environment, scene]);

//   return null;
// }

// function Model({ materialProps, glbModel,gltfScene, texture }) {
//   const { scene: defaultScene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load unconditionally
//   const modelScene = gltfScene || defaultScene; // Determine scene based on gltfScene availability


//   useEffect(() => {
//     modelScene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: materialProps.color,
//           roughness: materialProps.roughness,
//           metalness: materialProps.metalness,
//         });
//         if (texture) child.material.map = texture;
//       }
//     });
//   }, [materialProps, modelScene, texture]);

//   return <primitive object={modelScene} />;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
//   const [lightProps, setLightProps] = useState({ color: '#ffffff', intensity: 1, position: { x: 10, y: 10, z: 10 } });
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [glbModel, setGlbModel] = useState(null);
//   const [gltfScene, setGltfScene] = useState(null);
//   const [glbUrl, setGlbUrl] = useState(null); // For GLB uploads
//   const [texture, setTexture] = useState(null);
//   const [undoStack, setUndoStack] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [environment, setEnvironment] = useState(null);

//   const saveToUndoStack = () => {
//     const newStack = [...undoStack, { glbModel, texture, materialProps }];
//     if (newStack.length > 10) newStack.shift();
//     setUndoStack(newStack);
//     setRedoStack([]);
//   };

//   const undo = () => {
//     if (undoStack.length) {
//       const previousState = undoStack.pop();
//       setRedoStack([...redoStack, { glbModel, texture, materialProps }]);
//       setGlbModel(previousState.glbModel);
//       setTexture(previousState.texture);
//       setMaterialProps(previousState.materialProps);
//     }
//   };

//   const redo = () => {
//     if (redoStack.length) {
//       const nextState = redoStack.pop();
//       setUndoStack([...undoStack, { glbModel, texture, materialProps }]);
//       setGlbModel(nextState.glbModel);
//       setTexture(nextState.texture);
//       setMaterialProps(nextState.materialProps);
//     }
//   };

//   const handleGLBUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setGlbModel(url);
//       saveToUndoStack();
//     }
//   };

// // Update handleGLTFUpload
// const handlegltfupload = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     const url = URL.createObjectURL(file);
//     const loader = new GLTFLoader();

//     loader.load(
//       url,
//       (gltf) => {
//         gltf.scene.traverse((child) => {
//           if (child.isMesh && child.material) {
//             child.material = new THREE.MeshStandardMaterial({
//               color: '#ffffff', 
//               roughness: 0.5,
//               metalness: 0.5,
//             });
//           }
//         });

//         setGltfScene(gltf.scene);
//         saveToUndoStack();
//         URL.revokeObjectURL(url);
//       },
//       undefined,
//       (error) => {
//         console.error('Error loading GLTF model:', error);
//       }
//     );
//   }
// };





  
//   // Handle ZIP file upload containing GLTF and textures
//   const handleZIPUpload = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         const zip = await JSZip.loadAsync(file);
//         let gltfBlob = null;
//         const textureBlobs = {};
  
//         // Extract files from ZIP (scene.gltf and textures)
//         await Promise.all(
//           Object.keys(zip.files).map(async (relativePath) => {
//             const zipEntry = zip.files[relativePath];
//             if (relativePath.endsWith('scene.gltf')) {
//               gltfBlob = await zipEntry.async('blob');
//             } else if (/\.(jpg|jpeg|png)$/i.test(relativePath)) {
//               textureBlobs[relativePath] = await zipEntry.async('blob');
//             }
//           })
//         );
  
//         if (!gltfBlob) {
//           console.error('No GLTF file found in the ZIP.');
//           return;
//         }
  
//         // Convert each texture blob into a URL for GLTFLoader
//         const textureURLs = {};
//         Object.keys(textureBlobs).forEach((path) => {
//           textureURLs[path] = URL.createObjectURL(textureBlobs[path]);
//         });
  
//         // Setup the LoadingManager with URL modifier for GLTFLoader
//         const manager = new THREE.LoadingManager();
//         manager.setURLModifier((url) => {
//           // Check for texture URL in the mapped paths
//           return textureURLs[url] || textureURLs[`textures/${url}`] || url;
//         });
  
//         // Initialize GLTFLoader with the custom manager
//         const gltfLoader = new GLTFLoader(manager);
//         const gltfUrl = URL.createObjectURL(gltfBlob);
  
//         // Load the GLTF scene
//         gltfLoader.load(
//           gltfUrl,
//           (gltf) => {
//             setGltfScene(gltf.scene);
//             saveToUndoStack();
//             URL.revokeObjectURL(gltfUrl);
//             Object.values(textureURLs).forEach(URL.revokeObjectURL);
//           },
//           undefined,
//           (error) => {
//             console.error('Error loading GLTF from ZIP:', error);
//             // If loading fails due to missing textures, try loading the model without them
//             gltfLoader.load(gltfUrl, (gltf) => {
//               setGltfScene(gltf.scene);
//               saveToUndoStack();
//               URL.revokeObjectURL(gltfUrl);
//             });
//           }
//         );
//       } catch (error) {
//         console.error('Error processing ZIP file:', error);
//       }
//     }
//   };

//   const handleHdriUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       new RGBELoader().load(URL.createObjectURL(file), (texture) => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         setEnvironment(texture);
//         saveToUndoStack();
//       });
//     }
//   };

//   return (
//     <div className="app-container">
//       <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
//         <ambientLight intensity={0.2} />
//         <directionalLight
//           color={new THREE.Color(lightProps.color)}
//           intensity={lightProps.intensity}
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
//         />
//         <Model materialProps={materialProps} glbModel={glbModel} texture={texture} />
//         <EffectComposer>
//           {enableBloom && <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />}
//         </EffectComposer>
//         <OrbitControls />
//       </Canvas>

//       <div className="controls-panel">
//         <h3>Material Settings</h3>
//         <label>Color:</label>
//         <input
//           type="color"
//           value={materialProps.color}
//           onChange={(e) => setMaterialProps({ ...materialProps, color: e.target.value })}
//         />
//         <label>Roughness:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.roughness}
//           onChange={(e) => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
//         />
//         <label>Metalness:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.metalness}
//           onChange={(e) => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
//         />

//         <h3>Lighting Controls</h3>
//         <label>Light Color:</label>
//         <input
//           type="color"
//           value={lightProps.color}
//           onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })}
//         />
//         <label>Intensity:</label>
//         <input
//           type="range"
//           min="0"
//           max="5"
//           step="0.1"
//           value={lightProps.intensity}
//           onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })}
//         />

//         <h3>Upload Model</h3>
//         <label>GLB:</label>
//         <input type="file" accept=".glb" onChange={handleGLBUpload} />
//         <h3>Upload GLTF</h3>
//         <label>GLTF:</label>
//         <input type="file" accept=".gltf" onChange={handlegltfupload}/>
//         <label>ZIP (GLTF/Textures):</label>
//         <input type="file" accept=".zip" onChange={handleZIPUpload} />

//         <h3>Upload HDRI Environment</h3>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />

//         <div className="undo-redo-controls">
//           <button onClick={undo} disabled={!undoStack.length}>Undo</button>
//           <button onClick={redo} disabled={!redoStack.length}>Redo</button>
//         </div>
//       </div>  
//     </div>
//   );
// }


// import { Canvas, useThree } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import JSZip from 'jszip';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import './App.css';

// function Environment({ environment }) {
//   const { scene } = useThree();

//   useEffect(() => {
//     if (environment) {
//       scene.environment = environment;
//       scene.background = environment;
//     }
//     return () => {
//       scene.environment = null;
//       scene.background = null;
//     };
//   }, [environment, scene]);

//   return null;
// }

// function Model({ materialProps, modelScene, texture }) {
//   useEffect(() => {
//     if (modelScene) {
//       modelScene.traverse((child) => {
//         if (child.isMesh) {
//           child.material = new THREE.MeshStandardMaterial({
//             color: materialProps.color,
//             roughness: materialProps.roughness,
//             metalness: materialProps.metalness,
//           });
//           if (texture) child.material.map = texture;
//         }
//       });
//     }
//   }, [materialProps, modelScene, texture]);

//   return modelScene ? <primitive object={modelScene} /> : null;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
//   const [lightProps, setLightProps] = useState({ color: '#ffffff', intensity: 1, position: { x: 10, y: 10, z: 10 } });
//   const [glbModel, setGlbModel] = useState(null);
//   const [gltfModel, setGltfModel] = useState(null);
//   const [texture, setTexture] = useState(null);
//   const [environment, setEnvironment] = useState(null);

//   // GLB Handler
//   const handleGLBUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       new GLTFLoader().load(url, (gltf) => {
//         setGlbModel(gltf.scene);
//       });
//     }
//   };

//   // GLTF Handler without Textures
//   // GLTF Handler without Textures
// const handleGLTFUpload = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     const url = URL.createObjectURL(file);

//     // Log the blob URL for verification
//     console.log("Blob URL for GLTF file:", url);

//     // Create a LoadingManager to skip texture loading
//     const manager = new THREE.LoadingManager();
//     manager.setURLModifier((url) => null); // Block texture URLs

//     const loader = new GLTFLoader(manager);
    
//     loader.load(
//       url,
//       (gltf) => {
//         // Model successfully loaded
//         setGltfModel(gltf.scene);
//         console.log("GLTF model loaded successfully.");
        
//         // Release the blob URL after loading
//         URL.revokeObjectURL(url);
//       },
//       undefined,
//       (error) => {
//         console.error("Error loading GLTF model:", error);
//       }
//     );
//   }
// };

//   // ZIP Handler for GLTF and Textures
//   const handleZIPUpload = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         const zip = await JSZip.loadAsync(file);
//         let gltfBlob = null;

//         // Extract GLTF from ZIP without loading textures
//         await Promise.all(
//           Object.keys(zip.files).map(async (relativePath) => {
//             const zipEntry = zip.files[relativePath];
//             if (relativePath.endsWith('scene.gltf')) {
//               gltfBlob = await zipEntry.async('blob');
//             }
//           })
//         );

//         if (gltfBlob) {
//           const gltfUrl = URL.createObjectURL(gltfBlob);

//           // Setup LoadingManager to block textures
//           const manager = new THREE.LoadingManager();
//           manager.setURLModifier((url) => null);

//           const loader = new GLTFLoader(manager);
//           loader.load(gltfUrl, (gltf) => {
//             setGltfModel(gltf.scene);
//             URL.revokeObjectURL(gltfUrl);
//           });
//         }
//       } catch (error) {
//         console.error('Error processing ZIP file:', error);
//       }
//     }
//   };

//   const handleHdriUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       new RGBELoader().load(URL.createObjectURL(file), (texture) => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         setEnvironment(texture);
//       });
//     }
//   };

//   return (
//     <div className="app-container">
//       <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
//         <ambientLight intensity={0.2} />
//         <directionalLight
//           color={new THREE.Color(lightProps.color)}
//           intensity={lightProps.intensity}
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
//         />
//         <Model materialProps={materialProps} modelScene={glbModel || gltfModel} texture={texture} />
//         <OrbitControls />
//       </Canvas>

//       <div className="controls-panel">
//         <h3>Material Settings</h3>
//         <label>Color:</label>
//         <input
//           type="color"
//           value={materialProps.color}
//           onChange={(e) => setMaterialProps({ ...materialProps, color: e.target.value })}
//         />
//         <label>Roughness:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.roughness}
//           onChange={(e) => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
//         />
//         <label>Metalness:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.metalness}
//           onChange={(e) => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
//         />

//         <h3>Lighting Controls</h3>
//         <label>Light Color:</label>
//         <input
//           type="color"
//           value={lightProps.color}
//           onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })}
//         />
//         <label>Intensity:</label>
//         <input
//           type="range"
//           min="0"
//           max="5"
//           step="0.1"
//           value={lightProps.intensity}
//           onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })}
//         />

//         <h3>Upload Models</h3>
//         <label>GLB:</label>
//         <input type="file" accept=".glb" onChange={handleGLBUpload} />
//         <label>GLTF:</label>
//         <input type="file" accept=".gltf" onChange={handleGLTFUpload} />
//         <label>ZIP (GLTF/Textures):</label>
//         <input type="file" accept=".zip" onChange={handleZIPUpload} />

//         <h3>Upload HDRI Environment</h3>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />
//       </div>
//     </div>
//   );
// }



// // App.js
// import React, { useRef, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import { useLoader } from "@react-three/fiber";
// import * as THREE from "three";
// import { GLTFLoader } from "three-stdlib";
// import create from "zustand";
// import './App.css';


// // Set up zustand store for managing undo/redo stack
// const useStore = create((set) => ({
//     actions: [],
//     redoStack: [],
//     addAction: (action) =>
//         set((state) => ({ actions: [...state.actions, action], redoStack: [] })),
//     undo: () =>
//         set((state) => {
//             if (state.actions.length > 0) {
//                 const lastAction = state.actions[state.actions.length - 1];
//                 return {
//                     actions: state.actions.slice(0, -1),
//                     redoStack: [lastAction, ...state.redoStack],
//                 };
//             }
//             return state;
//         }),
//     redo: () =>
//         set((state) => {
//             if (state.redoStack.length > 0) {
//                 const redoAction = state.redoStack[0];
//                 return {
//                     actions: [...state.actions, redoAction],
//                     redoStack: state.redoStack.slice(1),
//                 };
//             }
//             return state;
//         }),
// }));

// // Custom component to handle material properties and upload
// const Model = ({ url, position, onMaterialChange }) => {
//     const gltf = useLoader(GLTFLoader, url);
//     const modelRef = useRef();

//     // Save original material state for undo/redo
//     const [materialProps, setMaterialProps] = useState({
//         color: "white",
//         roughness: 0.5,
//         metalness: 0.5,
//     });

//     // Update material properties
//     const handleMaterialChange = (property, value) => {
//         onMaterialChange(property, value);
//         setMaterialProps((prevProps) => ({ ...prevProps, [property]: value }));
//     };

//     return (
//         <primitive
//             object={gltf.scene}
//             position={position}
//             ref={modelRef}
//             onClick={(e) => e.stopPropagation()}
//             dispose={null}
//             {...materialProps}
//         />
//     );
// };

// // Main scene component
// const Scene = () => {
//     const [modelUrl, setModelUrl] = useState(null);
//     const [color, setColor] = useState("#ffffff");
//     const [roughness, setRoughness] = useState(0.5);
//     const [metalness, setMetalness] = useState(0.5);

//     const store = useStore();

//     const handleUpload = (e) => {
//         const file = e.target.files[0];
//         const url = URL.createObjectURL(file);
//         setModelUrl(url);
//     };

//     const handleMaterialChange = (property, value) => {
//         store.addAction({ property, value });
//         if (property === "color") setColor(value);
//         if (property === "roughness") setRoughness(value);
//         if (property === "metalness") setMetalness(value);
//     };

//     return (
//         <>
//             <input type="file" onChange={handleUpload} accept=".gltf,.glb" />
//             <Canvas style={{ height: "100vh" }}>
//                 <ambientLight intensity={0.3} />
//                 <directionalLight position={[10, 10, 5]} intensity={1} />
//                 <OrbitControls />
//                 {modelUrl && (
//                     <Model
//                         url={modelUrl}
//                         position={[0, 0, 0]}
//                         onMaterialChange={handleMaterialChange}
//                     />
//                 )}
//             </Canvas>
//             <div>
//                 <label>
//                     Color:
//                     <input
//                         type="color"
//                         value={color}
//                         onChange={(e) => handleMaterialChange("color", e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     Roughness:
//                     <input
//                         type="range"
//                         min="0"
//                         max="1"
//                         step="0.1"
//                         value={roughness}
//                         onChange={(e) => handleMaterialChange("roughness", parseFloat(e.target.value))}
//                     />
//                 </label>
//                 <label>
//                     Metalness:
//                     <input
//                         type="range"
//                         min="0"
//                         max="1"
//                         step="0.1"
//                         value={metalness}
//                         onChange={(e) => handleMaterialChange("metalness", parseFloat(e.target.value))}
//                     />
//                 </label>
//                 <button onClick={() => store.undo()}>Undo</button>
//                 <button onClick={() => store.redo()}>Redo</button>
//             </div>
//         </>
//     );
// };

// export default Scene;










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
  // Process GLB model
  useEffect(() => {
    if (glbModel && gltfData) {
      const { scene, animations } = gltfData;

      // Remove textures from the model
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.map = null; // Remove the texture
              mat.needsUpdate = true; // Trigger material update
            });
          } else {
            child.material.map = texture; // Remove the texture
            child.material.needsUpdate = true; // Trigger material update
          }
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
  }, [glbModel, materialProps,texture,gltfData]);

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





// import { Canvas, useThree } from '@react-three/fiber';
// import { useState, useEffect, useRef } from 'react';
// import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
// import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import * as THREE from 'three';
// import { useSpring, animated } from '@react-spring/three';
// import './App.css';

// function Model({ modelData, isSelected, onClick }) {
//   const { scene: defaultScene } = useGLTF(modelData.glbModel || '/scene.gltf');
//   const modelRef = useRef();

//   // Apply material properties to model
//   useEffect(() => {
//     defaultScene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: modelData.materialProps.color,
//           roughness: modelData.materialProps.roughness,
//           metalness: modelData.materialProps.metalness,
//           specular: new THREE.Color(modelData.materialProps.specular),
//           emissive: new THREE.Color(modelData.materialProps.emissive),
//           opacity: modelData.materialProps.opacity,
//           transparent: modelData.materialProps.opacity < 1,
//           clearcoat: modelData.materialProps.clearcoat,
//           clearcoatRoughness: modelData.materialProps.clearcoatRoughness,
//         });
//         if (modelData.texture) child.material.map = modelData.texture;
//       }
//     });
//   }, [modelData]);

//   return (
//     <animated.primitive
//       object={defaultScene}
//       ref={modelRef}
//       position={modelData.position}
//       onClick={onClick}
//       scale={isSelected ? 1.2 : 1}
//     />
//   );
// }

// export default function App() {
//   const [models, setModels] = useState([]);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [environment, setEnvironment] = useState(null);
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [exposure, setExposure] = useState(1);
//   const [environmentIntensity, setEnvironmentIntensity] = useState(1);
//   const [hdriBlur, setHdriBlur] = useState(0.0);
//   const [environmentRotation, setEnvironmentRotation] = useState(0);

//   // Handlers to set individual model material properties
//   const updateSelectedModelProps = (newProps) => {
//     if (selectedModel !== null) {
//       setModels((prevModels) =>
//         prevModels.map((model, index) =>
//           index === selectedModel ? { ...model, materialProps: { ...model.materialProps, ...newProps } } : model
//         )
//       );
//     }
//   };

//   const handleGLBUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       const newModel = {
//         glbModel: url,
//         position: [Math.random() * 2 - 1, 0, Math.random() * 2 - 1],
//         materialProps: {
//           color: '#ffffff',
//           roughness: 0.5,
//           metalness: 0.5,
//           specular: '#ffffff',
//           emissive: '#000000',
//           opacity: 1.0,
//           clearcoat: 0.0,
//           clearcoatRoughness: 0.0,
//         },
//         texture: null,
//       };
//       setModels((prevModels) => [...prevModels, newModel]);
//     }
//   };

//   const handleTextureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && selectedModel !== null) {
//       const url = URL.createObjectURL(file);
//       const loader = new THREE.TextureLoader();
//       loader.load(url, (loadedTexture) => {
//         setModels((prevModels) =>
//           prevModels.map((model, index) =>
//             index === selectedModel ? { ...model, texture: loadedTexture } : model
//           )
//         );
//       });
//     }
//   };

//   const handleHdriUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       new RGBELoader().load(URL.createObjectURL(file), (texture) => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         setEnvironment(texture);
//       });
//     }
//   };

//   return (
//     <div className="app-container">
//       <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}>
//         <ambientLight intensity={0.2} />
//         <directionalLight color={'#ffffff'} intensity={1} position={[10, 10, 10]} />
//         {models.map((modelData, index) => (
//           <Model
//             key={index}
//             modelData={modelData}
//             isSelected={index === selectedModel}
//             onClick={() => setSelectedModel(index)}
//           />
//         ))}
//         {environment && (
//           <Environment
//             background
//             map={environment}
//             intensity={environmentIntensity}
//             blur={hdriBlur}
//             rotation={[0, environmentRotation, 0]}
//           />
//         )}
//         {enableBloom && (
//           <EffectComposer>
//             <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />
//             <Vignette eskil={false} offset={0.1} darkness={1.1} />
//           </EffectComposer>
//         )}
//         <OrbitControls />
//       </Canvas>

//       <div className="controls-panel">
//         <h3>Material Settings</h3>
//         {selectedModel !== null && (
//           <>
//             <label>
//               Color:
//               <input
//                 type="color"
//                 value={models[selectedModel].materialProps.color}
//                 onChange={(e) => updateSelectedModelProps({ color: e.target.value })}
//               />
//             </label>
//             <label>
//               Roughness:
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.01"
//                 value={models[selectedModel].materialProps.roughness}
//                 onChange={(e) => updateSelectedModelProps({ roughness: parseFloat(e.target.value) })}
//               />
//             </label>
//             <label>
//               Metalness:
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.01"
//                 value={models[selectedModel].materialProps.metalness}
//                 onChange={(e) => updateSelectedModelProps({ metalness: parseFloat(e.target.value) })}
//               />
//             </label>
//             {/* Additional material properties here */}
//           </>
//         )}
//         <h3>Upload Model</h3>
//         <label>GLB:</label>
//         <input type="file" accept=".glb" onChange={handleGLBUpload} />
//         {selectedModel !== null && (
//           <>
//             <h3>Upload Texture for Selected Model</h3>
//             <label>Texture:</label>
//             <input type="file" accept="image/*" onChange={handleTextureUpload} />
//           </>
//         )}
//         <h3>Upload HDRI Environment</h3>
//         <label>HDRI:</label>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />
//       </div>
//     </div>
//   );
// }
