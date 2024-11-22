        {/* <PostProcessingEffects 
          enableBloom={enableBloom} 
          enableDepthOfField={enableDepthOfField} 
          enableHueSaturation={enableHueSaturation} 
        />

        <OrbitControls />
      </Canvas> */}


/*function Model({ materialProps, customShader, glbModel, texture }) {
  const { scene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load the GLB model, with fallback
  const meshRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (texture) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        } else {
          child.material = materialProps.useCustomShader
            ? new THREE.ShaderMaterial({
                vertexShader: customShader.vertexShader,
                fragmentShader: customShader.fragmentShader,
                uniforms: {
                  color: { value: new THREE.Color(materialProps.color) },
                },
              })
            : new THREE.MeshStandardMaterial({
                color: materialProps.color,
                roughness: materialProps.roughness,
                metalness: materialProps.metalness,
              });
        }
      }
    });
  }, [materialProps, customShader, scene, texture]);
  return (
    <mesh ref={meshRef}>
      <primitive object={scene} />
    </mesh>
  );
}*/


// function Model({ materialProps, customShader, glbModel, texture }) {
//   const { scene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load the GLB model, with fallback
//   const meshRef = useRef();

//   useEffect(() => {
//     // Traverse through all the child meshes of the GLB model
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         if (texture) {
//           // If texture is uploaded, apply it
//           child.material.map = texture;
//           child.material.needsUpdate = true;
//         } else {
//           // Apply either the custom shader material or the MeshStandardMaterial
//           child.material = materialProps.useCustomShader
//             ? new THREE.ShaderMaterial({
//                 vertexShader: customShader.vertexShader,
//                 fragmentShader: customShader.fragmentShader,
//                 uniforms: {
//                   color: { value: new THREE.Color(materialProps.color) },
//                 },
//               })
//             : new THREE.MeshStandardMaterial({
//                 color: materialProps.color,
//                 roughness: materialProps.roughness,
//                 metalness: materialProps.metalness,
//               });
//         }
//       }
//     });
//   }, [materialProps, customShader, scene, texture]);

//   return (
//     <mesh ref={meshRef}>
//       <primitive object={scene} />
//     </mesh>
//   );
// }


///////////////////////////////////////////////////////////


// import { Canvas,useThree } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// import JSZip from 'jszip';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { TextureLoader } from 'three';
// import { EffectComposer, Bloom,ChromaticAberration, Vignette, DepthOfField, Noise } from '@react-three/postprocessing';
// import './App.css';

// const customShader = {
//   vertexShader: `
//     varying vec3 vNormal;
//     void main() {
//       vNormal = normalize(normalMatrix * normal);
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     varying vec3 vNormal;
//     void main() {
//       float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
//       gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
//     }
//   `,
// };

// function Environment({ environment }) {
//   const { scene } = useThree();

//   useEffect(() => {
//     if (environment) {
//       scene.environment = environment;
//       scene.background = environment;  // Set HDRI as the background
//     }
//     return () => {
//       scene.environment = null;
//       scene.background = null;
//     };
//   }, [environment, scene]);

//   return null;
// }

// function Model({ materialProps, glbModel, texture }) {
//   const { scene } = useGLTF(glbModel || '/old_wall_clock.glb');
  
//   useEffect(() => {
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: materialProps.color,
//           roughness: materialProps.roughness,
//           metalness: materialProps.metalness,
//         });
//         if (texture) child.material.map = texture;
//       }
//     });
//   }, [materialProps, scene, texture]);

//   return <primitive object={scene} />;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
//   const [lightProps, setLightProps] = useState({ color: '#ffffff', intensity: 1, position: { x: 10, y: 10, z: 10 } });
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [glbModel, setGlbModel] = useState(null);
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
  
//   // const handleFileUpload = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     const url = URL.createObjectURL(file);
//   //     setGlbModel(url);
//   //     saveToUndoStack();
//   //   }
//   // };
//   const handleGLTFUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       new GLTFLoader().load(url, (gltf) => {
//         setGlbModel(gltf.scene);
//         saveToUndoStack();
//       });
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
//   const handleFBXUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
  
//       reader.onload = (event) => {
//         const fbxLoader = new FBXLoader();
//         const arrayBuffer = event.target.result;
  
//         fbxLoader.parse(
//           arrayBuffer,
//           '',
//           (fbx) => {
//             setGlbModel(fbx); // Set the loaded FBX model
//             saveToUndoStack(); // Add to undo stack
//           },
//           (error) => {
//             console.error('An error occurred while parsing the FBX file:', error);
//           }
//         );
//       };
  
//       reader.onerror = (error) => {
//         console.error('Error reading file:', error);
//       };
  
//       reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
//     }
//   };
  

//   const handleZIPUpload = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const zip = await JSZip.loadAsync(file);
//       zip.forEach(async (relativePath, zipEntry) => {
//         if (relativePath.endsWith('.glb') || relativePath.endsWith('.gltf')) {
//           const content = await zipEntry.async('blob');
//           const url = URL.createObjectURL(content);
//           new GLTFLoader().load(url, (gltf) => {
//             setGlbModel(gltf.scene);
//             saveToUndoStack();
//           });
//         }
//       });
//     }
//   };

//   const handleTextureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const loadedTexture = new TextureLoader().load(URL.createObjectURL(file));
//       setTexture(loadedTexture);
//       saveToUndoStack();
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
//       {/* <Canvas>
//          <ambientLight intensity={0.2} />
//          <directionalLight 
//           color={new THREE.Color(lightProps.color)} 
//           intensity={lightProps.intensity} 
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
//         />
//         <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
//         <EffectComposer>
//           {enableBloom && <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} intensity={1.5} />}
//         </EffectComposer>
//         <OrbitControls />
//       </Canvas> */}
    
//       <div className="controls-panel">
//         <h3>Material Settings</h3>
//         <label>Color:</label>
//         <input 
//           type="color" 
//           value={materialProps.color} 
//           onChange={e => setMaterialProps({ ...materialProps, color: e.target.value })} 
//         />
//         <label>Roughness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.roughness} 
//           onChange={e => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
//         />
//         <label>Metalness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.metalness} 
//           onChange={e => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
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

//         {/* <h3>Upload Model</h3>
//         <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} /> */}
//         <h3>Upload Model</h3>
//         <label>GLTF:</label>
//         <input type="file" accept=".gltf" onChange={handleGLTFUpload} />
        
//         <label>GLB:</label>
//         <input type="file" accept=".glb" onChange={handleGLBUpload} />
        
//         <label>FBX:</label>
//         <input type="file" accept=".fbx" onChange={handleFBXUpload} />

//         <label>ZIP (GLTF/GLB):</label>
//         <input type="file" accept=".zip" onChange={handleZIPUpload} />
//         <h3>Upload Texture</h3>
//         <input type="file" accept="image/*" onChange={handleTextureUpload} />

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



// import React from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF } from '@react-three/drei';

// function Model() {
//   const gltf = useGLTF('/scene.gltf'); // Update this to the correct path to your GLTF file
//   return <primitive object={gltf.scene} />;
// }

// export default function App() {
//   return (
//     <Canvas>
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} />
//       <Model />
//       <OrbitControls />
//     </Canvas>
//   );
// }


///////////////////////////////////////


// import { Canvas } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import JSZip from 'jszip';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { TextureLoader } from 'three';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import './App.css';

// const customShader = {
//   vertexShader: `
//     varying vec3 vNormal;
//     void main() {
//       vNormal = normalize(normalMatrix * normal);
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     varying vec3 vNormal;
//     void main() {
//       float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
//       gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
//     }
//   `,
// };

// function Model({ materialProps, customShader, glbModel, texture }) {
//   const { scene } = useGLTF(glbModel || '/old_wall_clock.glb');
  
//   useEffect(() => {
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: materialProps.color,
//           roughness: materialProps.roughness,
//           metalness: materialProps.metalness,
//         });
//         if (texture) child.material.map = texture;
//       }
//     });
//   }, [materialProps, scene, texture]);

//   return <primitive object={scene} />;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
//   const [lightProps, setLightProps] = useState({ color: '#ffffff', intensity: 1, position: { x: 10, y: 10, z: 10 } });
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [glbModel, setGlbModel] = useState(null);
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
  
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setGlbModel(url);
//       saveToUndoStack();
//     }
//   };

//   const handleTextureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const loadedTexture = new TextureLoader().load(URL.createObjectURL(file));
//       setTexture(loadedTexture);
//       saveToUndoStack();
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
//       <Canvas>
//         <ambientLight intensity={0.2} />
//         <directionalLight 
//           color={new THREE.Color(lightProps.color)} 
//           intensity={lightProps.intensity} 
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
//         />
//         <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
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
//           onChange={e => setMaterialProps({ ...materialProps, color: e.target.value })} 
//         />
//         <br/>
//         <label>Roughness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.roughness} 
//           onChange={e => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
//         />
//         <br/>
//         <label>Metalness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.metalness} 
//           onChange={e => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
//         />
        
//         <h3>Lighting Controls</h3>
//         <label>Light Color:</label>
//         <input 
//           type="color" 
//           value={lightProps.color} 
//           onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })} 
//         />
//         <br/>
//         <label>Intensity:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="5" 
//           step="0.1" 
//           value={lightProps.intensity} 
//           onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })} 
//         />
//         <br/>
//         <label>Position X:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.x} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, x: parseFloat(e.target.value) } })} 
//         />
//         <label>Position Y:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.y} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, y: parseFloat(e.target.value) } })} 
//         />
//         <label>Position Z:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.z} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, z: parseFloat(e.target.value) } })} 
//         />

//         <h3>Upload Model</h3>
//         <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} />

//         <h3>Upload Texture</h3>
//         <input type="file" accept="image/*" onChange={handleTextureUpload} />

//         <h3>Upload HDRI Environment</h3>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />

//         <div className="undo-redo-controls">
//             <button onClick={undo} disabled={!undoStack.length}>Undo</button>
//             <button onClick={redo} disabled={!redoStack.length}>Redo</button>
//         </div>
//       </div>
//     </div>
//   );
// }


///////////////////////////////////////////////////////

// import { Canvas } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import JSZip from 'jszip';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import { TextureLoader } from 'three';
// import './App.css';

// const customShader = {
//   vertexShader: `
//     varying vec3 vNormal;
//     void main() {
//       vNormal = normalize(normalMatrix * normal);
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     varying vec3 vNormal;
//     void main() {
//       float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
//       gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
//     }
//   `,
// };

// function Model({ materialProps, customShader, glbModel, texture }) {
//   const { scene } = useGLTF(glbModel || '/old_wall_clock.glb');
  
//   useEffect(() => {
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: materialProps.color,
//           roughness: materialProps.roughness,
//           metalness: materialProps.metalness,
//         });
//         if (texture) child.material.map = texture;
//       }
//     });
//   }, [materialProps, scene, texture]);

//   return <primitive object={scene} />;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
//   const [lightProps, setLightProps] = useState({ color: '#ffffff', intensity: 1, position: { x: 10, y: 10, z: 10 } });
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [glbModel, setGlbModel] = useState(null);
//   const [texture, setTexture] = useState(null);
//   const [undoStack, setUndoStack] = useState([]);
//   const [scene, setScene] = useState(null);
//   const [environment, setEnvironment] = useState(null);
//   const [redoStack, setRedoStack] = useState([]);
//   const saveToUndoStack = () => {
//     const newStack = [...undoStack, { glbModel, texture, materialProps }];
//     if (newStack.length > 10) newStack.shift(); // Maintain a maximum of 10 states
//     setUndoStack(newStack);
//     setRedoStack([]); // Clear redoStack when a new action occurs
//   };
//   const undo = () => {
//     if (undoStack.length) {
//       const previousState = undoStack.pop();
//       setRedoStack([...redoStack, { glbModel, texture, materialProps }]);
//       setGlbModel(previousState.glbModel); // Update model
//       setTexture(previousState.texture);   // Update texture
//       setMaterialProps(previousState.materialProps);
//     }
//   };
  
//   const redo = () => {
//     if (redoStack.length) {
//       const nextState = redoStack.pop();
//       setUndoStack([...undoStack, { glbModel, texture, materialProps }]);
//       setGlbModel(nextState.glbModel); // Update model
//       setTexture(nextState.texture);   // Update texture
//       setMaterialProps(nextState.materialProps);
//     }
//   };
  
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setGlbModel(url);
//       saveToUndoStack();
//     }
//   };

//   const handleTextureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const loadedTexture = new TextureLoader().load(URL.createObjectURL(file));
//       setTexture(loadedTexture);
//       saveToUndoStack();
//     }
//   };
//     // Importing HDRI
//     const handleHdriUpload = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         new RGBELoader().load(URL.createObjectURL(file), (texture) => {
//           texture.mapping = THREE.EquirectangularReflectionMapping;
//           setEnvironment(texture);
//           saveToUndoStack();
//         });
//       }
//     };

//   return (
//     <div className="app-container">
//       <Canvas>
//         <ambientLight intensity={0.2} />
//         <directionalLight 
//           color={new THREE.Color(lightProps.color)} 
//           intensity={lightProps.intensity} 
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
//         />
//         <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
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
//           onChange={e => setMaterialProps({ ...materialProps, color: e.target.value })} 
//         />
//         <br/>
//         <label>Roughness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.roughness} 
//           onChange={e => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
//         />
//         <br/>

//         <label>Metalness:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="1" 
//           step="0.01" 
//           value={materialProps.metalness} 
//           onChange={e => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
//         />

//         <h3>Lighting Controls</h3>
//         <label>Light Color:</label>
//         <input 
//           type="color" 
//           value={lightProps.color} 
//           onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })} 
//         />
//         <br/>
//         <label>Intensity:</label>
//         <input 
//           type="range" 
//           min="0" 
//           max="5" 
//           step="0.1" 
//           value={lightProps.intensity} 
//           onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })} 
//         />
//         <br/>
//         <label>Position X:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.x} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, x: parseFloat(e.target.value) } })} 
//         />
//         <label>Position Y:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.y} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, y: parseFloat(e.target.value) } })} 
//         />
//         <label>Position Z:</label>
//         <input 
//           type="range" 
//           min="-10" 
//           max="10" 
//           step="0.1" 
//           value={lightProps.position.z} 
//           onChange={(e) => setLightProps({ ...lightProps, position: { ...lightProps.position, z: parseFloat(e.target.value) } })} 
//         />

//         <h3>Upload Model</h3>
//         <input type="file" accept=".glb,.gltf,.fbx,.zip" onChange={handleFileUpload} />

//         <h3>Upload Texture</h3>
//         <input type="file" accept="image/*" onChange={handleTextureUpload} />

//         <h3>Upload HDRI Environment</h3>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />

//         <div className="undo-redo-controls">
//             <button onClick={undo} disabled={!undoStack.length}>Undo</button>
//             <button onClick={redo} disabled={!redoStack.length}>Redo</button>
//         </div>

//       </div>
//     </div>
//   );
// }
//these the base code

////////////////////////////////////////////////////

/*import { Canvas, useFrame, extend, useThree,useLoader } from '@react-three/fiber';
import { useState, useRef, useEffect } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GUI } from 'dat.gui';
import { EffectComposer, Bloom, DepthOfField, HueSaturation } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { TextureLoader } from 'three';
import JSZip from 'jszip';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FileLoader } from 'three';

// Custom shader setup
const customShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
    }
  `
};


function Model({ materialProps, customShader, glbModel, texture }) {
  const { scene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load the GLB or GLTF model
  const meshRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (texture) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        } else {
          child.material = materialProps.useCustomShader
            ? new THREE.ShaderMaterial({
                vertexShader: customShader.vertexShader,
                fragmentShader: customShader.fragmentShader,
                uniforms: {
                  color: { value: new THREE.Color(materialProps.color) },
                },
              })
            : new THREE.MeshStandardMaterial({
                color: materialProps.color,
                roughness: materialProps.roughness,
                metalness: materialProps.metalness,
              });
        }
      }
    });
  }, [materialProps, customShader, scene, texture]);

  return (
    <mesh ref={meshRef}>
      <primitive object={scene} />
    </mesh>
  );
}





function LightControls({ lightProps, setLightProps }) {
  return (
    <div className="light-controls">
      <label className="light-controls__label">Light Color:</label>
      <input 
        type="color" 
        value={lightProps.color} 
        onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })} 
        className="light-controls__input" 
      />
      <br/>
      <label className="light-controls__label">Intensity:</label>
      <input 
        type="range" 
        min="0" 
        max="5" 
        step="0.1" 
        value={lightProps.intensity} 
        onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })} 
        className="light-controls__input" 
      />
      <h4>Light Positions</h4>
      <label className="light-controls__label">X :</label>
      <input 
        type="range" 
        min="-10" 
        max="10" 
        step="0.1" 
        value={lightProps.position.x} 
        onChange={(e) => setLightProps({ 
          ...lightProps, 
          position: { ...lightProps.position, x: parseFloat(e.target.value) }
        })} 
        className="light-controls__input" 
      />
      <br/>
      <label className="light-controls__label">Y :</label>
      <input 
        type="range" 
        min="-10" 
        max="10" 
        step="0.1" 
        value={lightProps.position.y} 
        onChange={(e) => setLightProps({ 
          ...lightProps, 
          position: { ...lightProps.position, y: parseFloat(e.target.value) }
        })} 
        className="light-controls__input" 
      />
      <br/>
      <label className="light-controls__label">Z :</label>
      <input 
        type="range" 
        min="-10" 
        max="10" 
        step="0.1" 
        value={lightProps.position.z} 
        onChange={(e) => setLightProps({ 
          ...lightProps, 
          position: { ...lightProps.position, z: parseFloat(e.target.value) }
        })} 
        className="light-controls__input" 
      />
    </div>
  );
}


function PostProcessingEffects({ enableBloom, enableDepthOfField, enableHueSaturation }) {
  return (
    <EffectComposer>
      {enableBloom && (
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          intensity={1.5}
          kernelSize={KernelSize.LARGE}
        />
      )}
      {enableDepthOfField && (
        <DepthOfField
          focusDistance={0.1}
          focalLength={0.1}
          bokehScale={3}
        />
      )}
      {enableHueSaturation && (
        <HueSaturation saturation={0.9} />
      )}
    </EffectComposer>
  );
}

function MaterialEditor({ materialProps, setMaterialProps }) {
  return (
    <div className="material-editor">
      <label className="material-editor__label">Color:</label>
      <input 
        type="color" 
        value={materialProps.color} 
        onChange={e => setMaterialProps({ ...materialProps, color: e.target.value })} 
        className="material-editor__input" 
      />
      <label className="material-editor__label">Roughness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={materialProps.roughness} 
        onChange={e => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
        className="material-editor__input"
      />
      <label className="material-editor__label">Metalness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={materialProps.metalness} 
        onChange={e => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
        className="material-editor__input"
      />
    </div>
  );
}
export default function App() {
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.5,
    useCustomShader: false,
  });

  const [lightProps, setLightProps] = useState({
    color: '#ffffff',
    intensity: 1,
    position: { x: 10, y: 10, z: 10 }
  });

  const [enableBloom, setEnableBloom] = useState(true);
  const [enableDepthOfField, setEnableDepthOfField] = useState(false);
  const [enableHueSaturation, setEnableHueSaturation] = useState(true);

  const [glbModel, setGlbModel] = useState(null);
  const [texture, setTexture] = useState(null);
  const [gltfModel,setGltfModel]=useState(null);
  // Undo and Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Function to save current state to the undo stack and clear the redo stack
  const saveToUndoStack = () => {
    const currentState = {
      glbModel,
      texture,
      materialProps,
    };
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]); // Clear redo stack on a new change
  };

  // Undo action
  const undo = () => {
    if (undoStack.length === 0) return; // Nothing to undo
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, { glbModel, texture, materialProps }]);
    setGlbModel(previousState.glbModel);
    setTexture(previousState.texture);
    setMaterialProps(previousState.materialProps);
    setUndoStack(undoStack.slice(0, -1));
  };

  // Redo action
  const redo = () => {
    if (redoStack.length === 0) return; // Nothing to redo
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, { glbModel, texture, materialProps }]);
    setGlbModel(nextState.glbModel);
    setTexture(nextState.texture);
    setMaterialProps(nextState.materialProps);
    setRedoStack(redoStack.slice(0, -1));
  };

  // Handle .glb file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url); // Set the uploaded .glb file URL

      // Load the GLB model to extract textures
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(url, (gltf) => {
        // Traverse the loaded model to apply textures
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.material) {
            // Check if the material has a texture map
            if (child.material.map) {
              const texture = child.material.map; // Get the texture
              child.material.map = texture; // Assign the texture to the material
              child.material.needsUpdate = true; // Mark material for update
            }
          }
        });
      });
    }
    saveToUndoStack();
    //setRedoStack();
  };
  
  // Handle texture file upload
  const handleTextureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const textureLoader = new TextureLoader();
      const loadedTexture = textureLoader.load(URL.createObjectURL(file));
      saveToUndoStack();
      setRedoStack();
      setTexture(loadedTexture); // Set the uploaded texture
    }
  };

  return (
    <div className="app-container">
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight 
          color={new THREE.Color(lightProps.color)} 
          intensity={lightProps.intensity} 
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
          
        />
        
        <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
        

      <EffectComposer>
          {enableBloom && (
            <Bloom
              luminanceThreshold={0.9}
              luminanceSmoothing={0.4}
              intensity={1.5}
              kernelSize={KernelSize.LARGE}
            />
          )}
          {enableDepthOfField && (
            <DepthOfField
              focusDistance={0.1}
              focalLength={0.1}
              bokehScale={3}
            />
          )}
          {enableHueSaturation && (
            <HueSaturation saturation={0.9} />
          )}
        </EffectComposer>

        <OrbitControls />

        <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
        
      </Canvas>

      <div className="controls-panel">
        <h3>Material Settings</h3>
        <MaterialEditor materialProps={materialProps} setMaterialProps={setMaterialProps} />

        <h3>Lighting Controls</h3>
        <LightControls lightProps={lightProps} setLightProps={setLightProps} />

        <h3>Post-Processing Effects</h3>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={enableBloom} 
              onChange={() => setEnableBloom(!enableBloom)} 
            />
            Bloom
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={enableDepthOfField} 
              onChange={() => setEnableDepthOfField(!enableDepthOfField)} 
            />
            Depth of Field
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={enableHueSaturation} 
              onChange={() => setEnableHueSaturation(!enableHueSaturation)} 
            />
            Hue Saturation
          </label>
        </div>

        <h3>Upload GLB Model</h3>
        <input 
          type="file" 
          accept=".glb" 
          onChange={handleFileUpload} 
          style={{ marginTop: '10px' }} 
        />

        
        <h3>Upload Texture</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleTextureUpload} 
          style={{ marginTop: '10px' }} 
        />
        {/* Undo/Redo Buttons */
        /*<div className="undo-redo-controls">
          <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
          <button onClick={redo} disabled={redoStack.length === 0}>Redo</button>
        </div>
      </div>
    </div>  
  );
}



/*function App() {
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.5,
    useCustomShader: false,
  });

  const [lightProps, setLightProps] = useState({
    color: '#ffffff',
    intensity: 1,
    position: { x: 10, y: 10, z: 10 }
  });

  const [enableBloom, setEnableBloom] = useState(true);
  const [enableDepthOfField, setEnableDepthOfField] = useState(false);
  const [enableHueSaturation, setEnableHueSaturation] = useState(true);

  const [glbModel, setGlbModel] = useState(null);
  const [texture, setTexture] = useState(null);

  // Undo and Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Function to save current state to the undo stack and clear the redo stack
  const saveToUndoStack = () => {
    const currentState = {
      glbModel,
      texture,
      materialProps,
    };
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]); // Clear redo stack on a new change
  };

  // Undo action
  const undo = () => {
    if (undoStack.length === 0) return; // Nothing to undo
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, { glbModel, texture, materialProps }]);
    setGlbModel(previousState.glbModel);
    setTexture(previousState.texture);
    setMaterialProps(previousState.materialProps);
    setUndoStack(undoStack.slice(0, -1));
  };

  // Redo action
  const redo = () => {
    if (redoStack.length === 0) return; // Nothing to redo
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, { glbModel, texture, materialProps }]);
    setGlbModel(nextState.glbModel);
    setTexture(nextState.texture);
    setMaterialProps(nextState.materialProps);
    setRedoStack(redoStack.slice(0, -1));
  };

  // Handle .glb file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      saveToUndoStack(); // Save current state before making changes
      setGlbModel(url); // Set the uploaded .glb file URL
    }
  };

  // Handle texture file upload
  const handleTextureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const textureLoader = new TextureLoader();
      const loadedTexture = textureLoader.load(URL.createObjectURL(file));
      saveToUndoStack(); // Save current state before making changes
      setTexture(loadedTexture); // Set the uploaded texture
    }
  };

  return (
    <div className="app-container">
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight 
          color={new THREE.Color(lightProps.color)} 
          intensity={lightProps.intensity} 
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
        />
        
        <Model materialProps={materialProps} customShader={customShader} glbModel={glbModel} texture={texture} />
        
        <EffectComposer>
          {enableBloom && (
            <Bloom
              luminanceThreshold={0.9}
              luminanceSmoothing={0.4}
              intensity={1.5}
              kernelSize={KernelSize.LARGE}
            />
          )}
          {enableDepthOfField && (
            <DepthOfField
              focusDistance={0.1}
              focalLength={0.1}
              bokehScale={3}
            />
          )}
          {enableHueSaturation && (
            <HueSaturation saturation={0.9} />
          )}
        </EffectComposer>

        <OrbitControls />
      </Canvas>

      <div className="controls-panel">
        <h3>Material Settings</h3>
        {/* Material controls and lighting controls go here *///}
        
 /*       <h3>Upload GLB Model</h3>
        <input 
          type="file" 
          accept=".glb" 
          onChange={handleFileUpload} 
        />

        <h3>Upload Texture</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleTextureUpload} 
        />

        {/* Undo/Redo Buttons *///}
  /*      <div className="undo-redo-controls">
          <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
          <button onClick={redo} disabled={redoStack.length === 0}>Redo</button>
        </div>
      </div>
    </div>  
  );
}

export default App;*/





////////////////////////////////////////////

/*
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { useState, useRef, useEffect } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';
import { GUI } from 'dat.gui';
import { EffectComposer, Bloom, DepthOfField, HueSaturation } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { TextureLoader } from 'three';

// Custom shader setup
const customShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
    }
  `
};
//Basic code with texture
// function Model({ materialProps, customShader }) {
//   const { scene } = useGLTF('/old_wall_clock.glb');
//   const meshRef = useRef();

//   const material = materialProps.useCustomShader 
//     ? new THREE.ShaderMaterial({
//         vertexShader: customShader.vertexShader,
//         fragmentShader: customShader.fragmentShader,
//         uniforms: {
//           color: { value: new THREE.Color(materialProps.color) }
//         }
//       })
//     : new THREE.MeshStandardMaterial(materialProps);

//   return (
//     <mesh ref={meshRef} material={material}>
//       <primitive object={scene} />
//     </mesh>
//   );
// }

function Model({ materialProps, customShader }) {
  const { scene } = useGLTF('/old_wall_clock.glb'); // Load the GLB model
  const meshRef = useRef();

  useEffect(() => {
    // Traverse through all the child meshes of the GLB model
    scene.traverse((child) => {
      if (child.isMesh) {
        // Apply either the custom shader material or the MeshStandardMaterial
        child.material = materialProps.useCustomShader
          ? new THREE.ShaderMaterial({
              vertexShader: customShader.vertexShader,
              fragmentShader: customShader.fragmentShader,
              uniforms: {
                color: { value: new THREE.Color(materialProps.color) },
              },
            })
          : new THREE.MeshStandardMaterial({
              color: materialProps.color,
              roughness: materialProps.roughness,
              metalness: materialProps.metalness,
            });
      }
    });
  }, [materialProps, customShader, scene]);

  return (
    <mesh ref={meshRef}>
      <primitive object={scene} />
    </mesh>
  );
}

function LightControls({ lightProps, setLightProps }) {
  useEffect(() => {
    const gui = new GUI();
    
    gui.addColor(lightProps, 'color').name('Light Color').onChange((value) => {
      setLightProps((prevProps) => ({ ...prevProps, color: value }));
    });
    
    gui.add(lightProps, 'intensity', 0, 2).name('Light Intensity').onChange((value) => {
      setLightProps((prevProps) => ({ ...prevProps, intensity: value }));
    });

    gui.add(lightProps.position, 'x', -10, 10).name('Light X').onChange((value) => {
      setLightProps((prevProps) => ({ ...prevProps, position: { ...prevProps.position, x: value } }));
    });
    gui.add(lightProps.position, 'y', -10, 10).name('Light Y').onChange((value) => {
      setLightProps((prevProps) => ({ ...prevProps, position: { ...prevProps.position, y: value } }));
    });
    gui.add(lightProps.position, 'z', -10, 10).name('Light Z').onChange((value) => {
      setLightProps((prevProps) => ({ ...prevProps, position: { ...prevProps.position, z: value } }));
    });

    return () => gui.destroy();
  }, [lightProps, setLightProps]);

  return null;
}

function PostProcessingEffects({ enableBloom, enableDepthOfField, enableHueSaturation }) {
  return (
    <EffectComposer>
      {enableBloom && (
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          intensity={1.5}
          kernelSize={KernelSize.LARGE}
        />
      )}
      {enableDepthOfField && (
        <DepthOfField
          focusDistance={0.1}
          focalLength={0.1}
          bokehScale={3}
        />
      )}
      {enableHueSaturation && (
        <HueSaturation saturation={0.9} />
      )}
    </EffectComposer>
  );
}

function MaterialEditor({ materialProps, setMaterialProps }) {
  return (
    <div className="material-editor">
      <label className="material-editor__label">Color:</label>
      <input 
        type="color" 
        value={materialProps.color} 
        onChange={e => setMaterialProps({ ...materialProps, color: e.target.value })} 
        className="material-editor__input" 
      />
      <label className="material-editor__label">Roughness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={materialProps.roughness} 
        onChange={e => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
        className="material-editor__input"
      />
      <label className="material-editor__label">Metalness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={materialProps.metalness} 
        onChange={e => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
        className="material-editor__input"
      />
    </div>
  );
}

export default function App() {
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.5,
    useCustomShader: false,
  });

  const [lightProps, setLightProps] = useState({
    color: '#ffffff',
    intensity: 1,
    position: { x: 10, y: 10, z: 10 }
  });

  const [enableBloom, setEnableBloom] = useState(true);
  const [enableDepthOfField, setEnableDepthOfField] = useState(false);
  const [enableHueSaturation, setEnableHueSaturation] = useState(true);

  return (
    <div className="app-container">
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight 
          color={new THREE.Color(lightProps.color)} 
          intensity={lightProps.intensity} 
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]} 
        />
        
        <Model materialProps={materialProps} customShader={customShader} />
        
        <PostProcessingEffects 
          enableBloom={enableBloom} 
          enableDepthOfField={enableDepthOfField} 
          enableHueSaturation={enableHueSaturation} 
        />

        <OrbitControls />
      </Canvas>

      <div className="controls-panel">
        <h3>Material Settings</h3>
        <MaterialEditor materialProps={materialProps} setMaterialProps={setMaterialProps} />
        
        <h3>Lighting Controls</h3>
        <LightControls lightProps={lightProps} setLightProps={setLightProps} />
        
        <h3>Post-Processing Effects</h3>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={enableBloom} 
              onChange={() => setEnableBloom(!enableBloom)} 
            />
            Bloom
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={enableDepthOfField} 
              onChange={() => setEnableDepthOfField(!enableDepthOfField)} 
            />
            Depth of Field
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={enableHueSaturation} 
              onChange={() => setEnableHueSaturation(!enableHueSaturation)} 
            />
            Hue Saturation
          </label>
        </div>
      </div>
    </div>  
  );
}
  */


//////////////////////////////////////////
// import React, { useState, useRef, useEffect } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, TransformControls, useGLTF } from '@react-three/drei';
// import { ShaderMaterial, Clock, AnimationMixer } from 'three';
// import * as THREE from 'three';
// import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';  // Correct Import
// import './App.css';

// function ShaderEditor({ material }) {
//   // Sample shader logic
//   const [vertexShader, setVertexShader] = useState(`
//     varying vec2 vUv;

//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `);

//   const [fragmentShader, setFragmentShader] = useState(`
//     varying vec2 vUv;
//     uniform sampler2D texture;

//     void main() {
//       gl_FragColor = texture2D(texture, vUv);
//     }
//   `);
// }
// function AnimationPanel({ object }) {
//   // Animation logic
// }

// function UndoRedo({ history, setHistory, currentStep, setCurrentStep }) {
//   // Undo/Redo logic
// }

// function Model({ path }) {
//   const gltf = useGLTF(path);
//   return <primitive object={gltf.scene} />;
// }

// function BlenderInterface() {
//   const [materialProps, setMaterialProps] = useState({
//     color: '#ffffff',
//     roughness: 0.5,
//     metalness: 0.5,
//   });
//   const [transformMode, setTransformMode] = useState('translate');
//   const [modelPath, setModelPath] = useState(null);

//   // Handle material color change
//   const handleColorChange = (e) => {
//     setMaterialProps({
//       ...materialProps,
//       color: e.target.value,
//     });
//   };

//   // Handle roughness change
//   const handleRoughnessChange = (e) => {
//     setMaterialProps({
//       ...materialProps,
//       roughness: parseFloat(e.target.value),
//     });
//   };

//   // Handle metalness change
//   const handleMetalnessChange = (e) => {
//     setMaterialProps({
//       ...materialProps,
//       metalness: parseFloat(e.target.value),
//     });
//   };

//   const handleModelUpload = (e) => {
//     const file = e.target.files[0];
//     const url = URL.createObjectURL(file);
//     setModelPath(url);
//   };

//   const material = new ShaderMaterial({
//     vertexShader: `...`, // Define vertex shader code
//     fragmentShader: `...`, // Define fragment shader code
//     uniforms: {
//       color: { value: new THREE.Color(materialProps.color) },
//       roughness: { value: materialProps.roughness },
//       metalness: { value: materialProps.metalness },
//     },
//   });

//   return (
//     <div className="app-container">
//       <header className="top-toolbar">
//         <button onClick={() => setTransformMode('translate')}>Translate</button>
//         <button onClick={() => setTransformMode('rotate')}>Rotate</button>
//         <button onClick={() => setTransformMode('scale')}>Scale</button>
//         <input type="file" onChange={handleModelUpload} accept=".glb,.gltf" />
//       </header>

//       <div className="main-layout">
//         <div className="canvas-container">
//           <Canvas>
//             <ambientLight />
//             <OrbitControls />
//             {modelPath && <Model path={modelPath} />}
//             {/* Render imported model */}
//             <EffectComposer>
//               <Bloom />
//               <DepthOfField />
//             </EffectComposer>
//           </Canvas>
//         </div>

//         <aside className="right-panel">
//           <h3>Material Editor</h3>
//           <label>
//             Color:
//             <input type="color" value={materialProps.color} onChange={handleColorChange} />
//           </label>
//           <label>
//             Roughness:
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={materialProps.roughness}
//               onChange={handleRoughnessChange}
//             />
//           </label>
//           <label>
//             Metalness:
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={materialProps.metalness}
//               onChange={handleMetalnessChange}
//             />
//           </label>
//         </aside>
//       </div>
//     </div>
//   );
// }

// export default BlenderInterface;










//code with hdri images and properties and material properties





// import { Canvas, useThree } from '@react-three/fiber';
// import { useState, useEffect } from 'react';
// import { OrbitControls, useGLTF ,Environment} from '@react-three/drei';
// import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import * as THREE from 'three';
// import './App.css';


// function Model({ materialProps, glbModel, texture }) {
//   const { scene: defaultScene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load default GLB
//   const modelScene = defaultScene;

//   useEffect(() => {
//     modelScene.traverse((child) => {
//       if (child.isMesh) {
//         child.material = new THREE.MeshStandardMaterial({
//           color: materialProps.color,
//           roughness: materialProps.roughness,
//           metalness: materialProps.metalness,
//           specular: new THREE.Color(materialProps.specular),
//           emissive: new THREE.Color(materialProps.emissive),
//           opacity: materialProps.opacity,
//           transparent: materialProps.opacity < 1,
//           clearcoat: materialProps.clearcoat,
//           clearcoatRoughness: materialProps.clearcoatRoughness,
//         });
//         if (texture) child.material.map = texture;
//       }
//     });
//   }, [materialProps, modelScene, texture]);

//   return <primitive object={modelScene} />;
// }

// export default function App() {
//   const [materialProps, setMaterialProps] = useState({
//     color: '#ffffff',
//     roughness: 0.5,
//     metalness: 0.5,
//     specular: '#ffffff', // Specular property
//     emissive: '#000000', // Emissive property
//     opacity: 1.0, // Opacity property
//     clearcoat: 0.0, // Clearcoat property
//     clearcoatRoughness: 0.0, // Clearcoat Roughness property
//   });
//   const [lightProps, setLightProps] = useState({
//     color: '#ffffff',
//     intensity: 1,
//     position: { x: 10, y: 10, z: 10 },
//   });
//   const [enableBloom, setEnableBloom] = useState(true);
//   const [glbModel, setGlbModel] = useState(null);
//   const [texture, setTexture] = useState(null);
//   const [undoStack, setUndoStack] = useState([]);
//   const [environment, setEnvironment] = useState(null);
//   const [redoStack, setRedoStack] = useState([]);
//   const [hdrTexture, setHdrTexture] = useState(null); // State to hold HDRI texture
//   const [exposure, setExposure] = useState(1);
//   const [environmentIntensity, setEnvironmentIntensity] = useState(1);
//   const [environmentRotation, setEnvironmentRotation] = useState(0);
//   const [hdriBlur, setHdriBlur] = useState(0.0);

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
//   const handleTextureUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       const loader = new THREE.TextureLoader();
//       loader.load(url, (loadedTexture) => {
//         setTexture(loadedTexture);
//         saveToUndoStack();
//       });
//     }
//   };
//   const handleHdriUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       new RGBELoader().load(URL.createObjectURL(file), (texture) => {
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         setEnvironment(texture); // Set HDR texture for environment
//         saveToUndoStack();
//       });
//     }
//   };
//   return (
//     <div className="app-container">
//       <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}>
//         <ambientLight intensity={0.2} />
//         <directionalLight
//           color={new THREE.Color(lightProps.color)}
//           intensity={lightProps.intensity}
//           position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
//         />
//         <Model materialProps={materialProps} glbModel={glbModel} texture={texture} />
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
//         <label>Specular:</label>
//         <input
//           type="color"
//           value={materialProps.specular}
//           onChange={(e) => setMaterialProps({ ...materialProps, specular: e.target.value })}
//         />
//         <label>Emissive:</label>
//         <input
//           type="color"
//           value={materialProps.emissive}
//           onChange={(e) => setMaterialProps({ ...materialProps, emissive: e.target.value })}
//         />
//         <label>Opacity:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.opacity}
//           onChange={(e) => setMaterialProps({ ...materialProps, opacity: parseFloat(e.target.value) })}
//         />
//         <label>Clearcoat:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.clearcoat}
//           onChange={(e) => setMaterialProps({ ...materialProps, clearcoat: parseFloat(e.target.value) })}
//         />
//         <label>Clearcoat Roughness:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={materialProps.clearcoatRoughness}
//           onChange={(e) => setMaterialProps({ ...materialProps, clearcoatRoughness: parseFloat(e.target.value) })}
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
//         <label>Position X:</label>
//         <input
//           type="range"
//           min="-20"
//           max="20"
//           step="0.1"
//           value={lightProps.position.x}
//           onChange={(e) => setLightProps({
//             ...lightProps,
//             position: { ...lightProps.position, x: parseFloat(e.target.value) },
//           })}
//         />
//         <label>Position Y:</label>
//         <input
//           type="range"
//           min="-20"
//           max="20"
//           step="0.1"
//           value={lightProps.position.y}
//           onChange={(e) => setLightProps({
//             ...lightProps,
//             position: { ...lightProps.position, y: parseFloat(e.target.value) },
//           })}
//         />
//         <label>Position Z:</label>
//         <input
//           type="range"
//           min="-20"
//           max="20"
//           step="0.1"
//           value={lightProps.position.z}
//           onChange={(e) => setLightProps({
//             ...lightProps,
//             position: { ...lightProps.position, z: parseFloat(e.target.value) },
//           })}
//         />
//                 <label>HDRI Intensity:</label>
//         <input
//           type="range"
//           min="0"
//           max="5"
//           step="0.1"
//           value={environmentIntensity}
//           onChange={(e) => setEnvironmentIntensity(parseFloat(e.target.value))}
//         />
//         <label>HDRI Blur:</label>
//         <input
//           type="range"
//           min="0"
//           max="1"
//           step="0.01"
//           value={hdriBlur}
//           onChange={(e) => setHdriBlur(parseFloat(e.target.value))}
//         />
//         <label>Exposure:</label>
//         <input
//           type="range"
//           min="0.5"
//           max="2"
//           step="0.01"
//           value={exposure}
//           onChange={(e) => setExposure(parseFloat(e.target.value))}
//         />
//         <label>HDRI Rotation:</label>
//         <input
//           type="range"
//           min="0"
//           max={Math.PI * 2}
//           step="0.01"
//           value={environmentRotation}
//           onChange={(e) => setEnvironmentRotation(parseFloat(e.target.value))}
//         />
//         <h3>Upload Model</h3>
//         <label>GLB:</label>
//         <input type="file" accept=".glb" onChange={handleGLBUpload} />
        
//         <h3>Upload Texture</h3>
//         <label>Texture:</label>
//         <input type="file" accept="image/*" onChange={handleTextureUpload} />
//         <h3>Upload HDRI Environment</h3>
//         <label>HDRI:</label>
//         <input type="file" accept=".hdr" onChange={handleHdriUpload} />
//         <div className="undo-redo-controls">
//           <button onClick={undo} disabled={!undoStack.length}>Undo</button>
//           <button onClick={redo} disabled={!redoStack.length}>Redo</button>
//         </div>
//       </div>  
//     </div>
//   );
// }




// code with animationimporters

import { Canvas, useThree } from '@react-three/fiber';
import { useState, useEffect,useRef } from 'react';
import { OrbitControls, useGLTF ,Environment} from '@react-three/drei';
import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';  // <-- Import animation helpers
import './App.css';


function Model({ materialProps, glbModel, texture }) {
  const { scene: defaultScene } = useGLTF(glbModel || '/old_wall_clock.glb'); // Load default GLB
  const modelScene = defaultScene;
    // Animation Hook - useSpring or useRef
    const modelRef = useRef();

    // Animation properties (for example, rotating the model)
    const props = useSpring({
      to: { rotation: [Math.PI, Math.PI, Math.PI] },
      from: { rotation: [0, 0, 0] },
      reset: true,
      reverse: modelRef.current && modelRef.current.rotation.y > Math.PI / 2, // This will reverse animation when over 90 degrees
      config: { duration: 5000 },
    });
  useEffect(() => {
    modelScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: materialProps.color,
          roughness: materialProps.roughness,
          metalness: materialProps.metalness,
          specular: new THREE.Color(materialProps.specular),
          emissive: new THREE.Color(materialProps.emissive),
          opacity: materialProps.opacity,
          transparent: materialProps.opacity < 1,
          clearcoat: materialProps.clearcoat,
          clearcoatRoughness: materialProps.clearcoatRoughness,
        });
        if (texture) child.material.map = texture;
      }
    });
  }, [materialProps, modelScene, texture]);

   return (
    <animated.primitive
      object={modelScene}
      ref={modelRef}
      {...props}  // Apply the animated props here
    />
  );
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

  const saveToUndoStack = () => {
    const newStack = [...undoStack, { glbModel, texture, materialProps }];
    if (newStack.length > 10) newStack.shift();
    setUndoStack(newStack);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length) {
      const previousState = undoStack.pop();
      setRedoStack([...redoStack, { glbModel, texture, materialProps }]);
      setGlbModel(previousState.glbModel);
      setTexture(previousState.texture);
      setMaterialProps(previousState.materialProps);
    }
  };

  const redo = () => {
    if (redoStack.length) {
      const nextState = redoStack.pop();
      setUndoStack([...undoStack, { glbModel, texture, materialProps }]);
      setGlbModel(nextState.glbModel);
      setTexture(nextState.texture);
      setMaterialProps(nextState.materialProps);
    }
  };

  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url);
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

  const [startAnimation, setStartAnimation] = useState(false);

const triggerAnimation = () => {
  setStartAnimation(!startAnimation);
};
  return (
    <div className="app-container">
      <button onClick={triggerAnimation}>Toggle Animation</button>
      <Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}>
        <ambientLight intensity={0.2} />
        <directionalLight
          color={new THREE.Color(lightProps.color)}
          intensity={lightProps.intensity}
          position={[lightProps.position.x, lightProps.position.y, lightProps.position.z]}
        />
        <Model materialProps={materialProps} glbModel={glbModel} texture={texture} />
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
        <label>Color:</label>
        <input
          type="color"
          value={materialProps.color}
          onChange={(e) => setMaterialProps({ ...materialProps, color: e.target.value })}
        />
        <label>Roughness:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialProps.roughness}
          onChange={(e) => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })}
        />
        <label>Metalness:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialProps.metalness}
          onChange={(e) => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })}
        />
        <label>Specular:</label>
        <input
          type="color"
          value={materialProps.specular}
          onChange={(e) => setMaterialProps({ ...materialProps, specular: e.target.value })}
        />
        <label>Emissive:</label>
        <input
          type="color"
          value={materialProps.emissive}
          onChange={(e) => setMaterialProps({ ...materialProps, emissive: e.target.value })}
        />
        <label>Opacity:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialProps.opacity}
          onChange={(e) => setMaterialProps({ ...materialProps, opacity: parseFloat(e.target.value) })}
        />
        <label>Clearcoat:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialProps.clearcoat}
          onChange={(e) => setMaterialProps({ ...materialProps, clearcoat: parseFloat(e.target.value) })}
        />
        <label>Clearcoat Roughness:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialProps.clearcoatRoughness}
          onChange={(e) => setMaterialProps({ ...materialProps, clearcoatRoughness: parseFloat(e.target.value) })}
        />

        <h3>Lighting Controls</h3>
        <label>Light Color:</label>
        <input
          type="color"
          value={lightProps.color}
          onChange={(e) => setLightProps({ ...lightProps, color: e.target.value })}
        />
        <label>Intensity:</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={lightProps.intensity}
          onChange={(e) => setLightProps({ ...lightProps, intensity: parseFloat(e.target.value) })}
        />
        <label>Position X:</label>
        <input
          type="range"
          min="-20"
          max="20"
          step="0.1"
          value={lightProps.position.x}
          onChange={(e) => setLightProps({
            ...lightProps,
            position: { ...lightProps.position, x: parseFloat(e.target.value) },
          })}
        />
        <label>Position Y:</label>
        <input
          type="range"
          min="-20"
          max="20"
          step="0.1"
          value={lightProps.position.y}
          onChange={(e) => setLightProps({
            ...lightProps,
            position: { ...lightProps.position, y: parseFloat(e.target.value) },
          })}
        />
        <label>Position Z:</label>
        <input
          type="range"
          min="-20"
          max="20"
          step="0.1"
          value={lightProps.position.z}
          onChange={(e) => setLightProps({
            ...lightProps,
            position: { ...lightProps.position, z: parseFloat(e.target.value) },
          })}
        />
                <label>HDRI Intensity:</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={environmentIntensity}
          onChange={(e) => setEnvironmentIntensity(parseFloat(e.target.value))}
        />
        <label>HDRI Blur:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={hdriBlur}
          onChange={(e) => setHdriBlur(parseFloat(e.target.value))}
        />
        <label>Exposure:</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.01"
          value={exposure}
          onChange={(e) => setExposure(parseFloat(e.target.value))}
        />
        <label>HDRI Rotation:</label>
        <input
          type="range"
          min="0"
          max={Math.PI * 2}
          step="0.01"
          value={environmentRotation}
          onChange={(e) => setEnvironmentRotation(parseFloat(e.target.value))}
        />
        <h3>Upload Model</h3>
        <label>GLB:</label>
        <input type="file" accept=".glb" onChange={handleGLBUpload} />
        
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








































import { Canvas, useThree } from '@react-three/fiber';
import { useState, useEffect,useRef } from 'react';
import { OrbitControls, useGLTF ,Environment} from '@react-three/drei';
import { EffectComposer, Bloom,Vignette} from '@react-three/postprocessing';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';  // <-- Import animation helpers
import './App.css';


function Model({ materialProps, glbModel, texture, startAnimation }) {
  const { scene: defaultScene } = useGLTF(glbModel || '/scene.gltf'); // Load default GLB
  const modelScene = defaultScene;
  const modelRef = useRef();

  // Animation properties
  const props = useSpring({
    rotation: startAnimation ? [Math.PI, Math.PI, Math.PI] : [0, 0, 0],
    config: { duration: 5000 },
    reset: true,
  });

  useEffect(() => {
    modelScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: materialProps.color,
          roughness: materialProps.roughness,
          metalness: materialProps.metalness,
          specular: new THREE.Color(materialProps.specular),
          emissive: new THREE.Color(materialProps.emissive),
          opacity: materialProps.opacity,
          transparent: materialProps.opacity < 1,
          clearcoat: materialProps.clearcoat,
          clearcoatRoughness: materialProps.clearcoatRoughness,
        });
        if (texture) child.material.map = texture;
      }
    });
  }, [materialProps, modelScene, texture]);

  return (
    <animated.primitive object={modelScene} ref={modelRef} {...props} />
  );
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
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlbModel(url);
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
        <Model materialProps={materialProps} glbModel={glbModel} texture={texture} startAnimation={startAnimation} />
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






















function Model({ materialProps, glbModel, fbxModelUrl, texture, startAnimation }) {

  const { scene: defaultScene } = useGLTF(glbModel || '/old_wall_clock.glb');
  const [modelScene, setModelScene] = useState(defaultScene);
  const [mixer, setMixer] = useState(null);
  const modelRef = useRef();
  // Animation properties
  const props = useSpring({
    rotation: startAnimation ? [Math.PI, Math.PI, Math.PI] : [0, 0, 0],
    config: { duration: 5000 },
    reset: true,
  });
  // Load FBX model
  useEffect(() => {
    if (fbxModelUrl) {
      const loader = new FBXLoader();
      loader.load(
        fbxModelUrl,
        (model) => {
          model.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: materialProps.color,
                roughness: materialProps.roughness,
                metalness: materialProps.metalness,
                specular: new THREE.Color(materialProps.specular),
                emissive: new THREE.Color(materialProps.emissive),
                opacity: materialProps.opacity,
                transparent: materialProps.opacity < 1,
                clearcoat: materialProps.clearcoat,
                clearcoatRoughness: materialProps.clearcoatRoughness,
              });
              if (texture) child.material.map = texture;
            }
          });
          setModelScene(model);

          // Setup animation mixer if the model has animations
          if (model.animations.length > 0) {
            const animationMixer = new THREE.AnimationMixer(model);
            model.animations.forEach((clip) => {
              const action = animationMixer.clipAction(clip);
              action.play();
            });
            setMixer(animationMixer);
          }
        },
        undefined,
        (error) => console.error('Error loading FBX:', error)
      );
    }
  }, [fbxModelUrl, materialProps, texture]);

  // Update animations on each frame
  useThree(({ clock }) => {
    if (mixer) mixer.update(clock.getDelta());
  });

  // Apply material and texture updates
  useEffect(() => {
    modelScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: materialProps.color,
          roughness: materialProps.roughness,
          metalness: materialProps.metalness,
          specular: new THREE.Color(materialProps.specular),
          emissive: new THREE.Color(materialProps.emissive),
          opacity: materialProps.opacity,
          transparent: materialProps.opacity < 1,
          clearcoat: materialProps.clearcoat,
          clearcoatRoughness: materialProps.clearcoatRoughness,
        });
        if (texture) child.material.map = texture;
      }
    });
  }, [materialProps, modelScene, texture]);

  return modelScene ? <animated.primitive object={modelScene} ref={modelRef} {...props} /> : null;
}