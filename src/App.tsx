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
  // State to store scanned QR code data and error
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false); // State to control scanning visibility
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Camera facing mode
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);

  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data); // Store the whole data object
      setScanning(false); // Stop scanning after successful scan
    }
  };

  const handleError = (err: Error | null) => {
    if (err) {
      setError(err.message);
      setScanning(false);
    }
  };

  // Handler for starting the scan
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); // Clear previous scan data
    setError(null);  // Clear previous errors
  };

  // Function to request camera access based on the facingMode
  const getCameraStream = async (desiredFacingMode: 'user' | 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: desiredFacingMode }, // Request camera based on facing mode
      });
      return stream;
    } catch (err) {
      console.error('Error accessing camera: ', err);
      setError('Camera not available.');
      setCameraAvailable(false);
      return null;
    }
  };

  // Toggle between front and back camera
  const toggleCamera = () => {
    // Switch between 'environment' (back camera) and 'user' (front camera)
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setScanning(false); // Stop scanning temporarily to re-render QR scanner with new facingMode

    // Delay before restarting the scanner after toggling
    setTimeout(() => setScanning(true), 100);
  };

  useEffect(() => {
    // Check if the browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false);
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
            facingMode={facingMode} // Camera facing mode
          />
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </div>
      )}

      {/* Render the scanned QR code text or a message if nothing is scanned */}
      {qrData && qrData.text ? (
        <p>QR Code Text: {qrData.text}</p>
      ) : (
        <p>No QR Code Scanned</p>
      )}

      {/* Show any scanning errors */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
