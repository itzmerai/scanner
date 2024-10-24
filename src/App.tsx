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

  const qrScannerRef = useRef<any>(null);

  // Function to stop the video stream manually
  const stopCameraStream = () => {
    if (qrScannerRef.current) {
      const videoElem = qrScannerRef.current.videoElement;
      const stream = videoElem?.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks
        videoElem.srcObject = null;
      }
    }
  };

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

  // Start scanning when user clicks Start
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); 
    setError(null);  
  };

  // Toggle camera function to switch between front and back
  const toggleCamera = () => {
    stopCameraStream(); // Stop the current stream

    // Toggle between 'user' (front) and 'environment' (back) cameras
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');

    // Restart the scanning process with the new camera after a small delay
    setTimeout(() => setScanning(true), 500); // Small delay to allow the camera switch
  };

  // Check if the browser supports camera access
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false);
    }

    // Stop the camera stream on component unmount or when scanning stops
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
            facingMode={facingMode} // Set camera facing mode
          />
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </div>
      )}

      {/* Render scanned QR code or message */}
      {qrData && qrData.text ? (
        <p>QR Code Text: {qrData.text}</p>
      ) : (
        <p>No QR Code Scanned</p>
      )}

      {/* Render error message */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
