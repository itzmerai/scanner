import { useState, useEffect, useRef } from 'react';
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
  const [scanning, setScanning] = useState<boolean>(false); 
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true); 

  const qrScannerRef = useRef<any>(null); // Ref to handle the QrScanner component

  // Handler for successfully scanned QR codes
  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data); 
      setScanning(false); 
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
    setQrData(null);
    setError(null);
  };

  // Toggles between front ('user') and back ('environment') cameras
  const toggleCamera = () => {
    setScanning(false); // Stop scanning before switching

    // Toggle camera mode and restart scanning
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');

    // Delay before restarting the scanner to allow for the camera switch
    setTimeout(() => setScanning(true), 100);
  };

  // Stop the camera stream when not scanning
  const stopCameraStream = () => {
    if (qrScannerRef.current) {
      const videoElem = qrScannerRef.current.videoElement;
      const stream = videoElem?.srcObject;
      if (stream) {
        const tracks = (stream as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoElem.srcObject = null;
      }
    }
  };

  useEffect(() => {
    // Check if camera access is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false);
    }

    // Cleanup: Stop camera stream when component unmounts or stops scanning
    return () => {
      stopCameraStream();
    };
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
            ref={qrScannerRef} // Attach ref to handle the scanner
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
