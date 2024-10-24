import { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';

// Define the shape of the QR Data
interface QRData {
  text: string;
  rawBytes?: Uint8Array;
  numBits?: number;
  resultPoints?: any[];
  format?: string;
  timestamp?: number;
  resultMetadata?: object;
  canvas?: HTMLCanvasElement;
}

function App() {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false); // Controls whether scanning is active
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Front ('user') or Back ('environment') camera
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true); // Tracks whether the camera is accessible

  // Handler for successfully scanned QR codes
  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data); // Store the scanned data
      setScanning(false); // Stop scanning once QR code is successfully scanned
    }
  };

  // Handler for QR code scanner errors
  const handleError = (err: Error | null) => {
    if (err) {
      setError(err.message);
      setScanning(false);
    }
  };

  // Handler to start the scanning process
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); // Reset the previous QR data
    setError(null);  // Reset previous errors
  };

  // Toggles between front ('user') and back ('environment') cameras
  const toggleCamera = () => {
    setScanning(false); // Stop scanning before switching
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment'); // Toggle camera mode

    // Delay before restarting the scanner to allow for the camera switch
    setTimeout(() => setScanning(true), 100);
  };

  // Check browser support for camera access
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false); // Disable camera options if unsupported
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner</h1>

      {!scanning ? (
        <>
          <button onClick={handleStartScan} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
            Start Scan
          </button>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </>
      ) : (
        <div>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '300px' }}
            facingMode={facingMode} // Controls the camera facing direction
          />
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </div>
      )}

      {/* Display the scanned QR code data */}
      {qrData && qrData.text ? (
        <p>QR Code Text: {qrData.text}</p>
      ) : (
        <p>No QR Code Scanned</p>
      )}

      {/* Display any scanning errors */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
