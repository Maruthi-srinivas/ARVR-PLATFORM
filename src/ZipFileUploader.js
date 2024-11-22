// ZipFileUploader.js
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { TextureLoader } from 'three';

export default function ZipFileUploader({ setGlbModel, setTexture }) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleZipUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const zip = new JSZip();

    zip.loadAsync(file)
      .then(async (zip) => {
        // Extract the contents of the ZIP file
        const glbFiles = Object.keys(zip.files).filter((file) => file.endsWith('.glb'));
        const textureFiles = Object.keys(zip.files).filter((file) => /\.(jpg|png|jpeg|bmp|gif)$/i.test(file));

        if (glbFiles.length > 0) {
          const glbBlob = await zip.file(glbFiles[0]).async('blob');
          const glbUrl = URL.createObjectURL(glbBlob);
          setGlbModel(glbUrl); // Set the GLB model
        }

        if (textureFiles.length > 0) {
          const textureBlob = await zip.file(textureFiles[0]).async('blob');
          const textureUrl = URL.createObjectURL(textureBlob);
          const textureLoader = new TextureLoader();
          textureLoader.load(textureUrl, (loadedTexture) => {
            setTexture(loadedTexture); // Set the texture
          });
        }

        if (glbFiles.length === 0 && textureFiles.length === 0) {
          setErrorMessage('No .glb or texture files found in the ZIP.');
        } else {
          setErrorMessage('');
        }
      })
      .catch((err) => {
        console.error('Error processing ZIP file:', err);
        setErrorMessage('Failed to process the ZIP file.');
      });
  };

  return (
    <div className="zip-uploader">
      <h3>Upload ZIP File</h3>
      <input type="file" accept=".zip" onChange={handleZipUpload} />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}
