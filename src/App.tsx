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
  const [scanning, setScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); 
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

  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); 
    setError(null);  
  };

  const getCameraStream = async (desiredFacingMode: 'user' | 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: desiredFacingMode }, 
      });
      return stream;
    } catch (err) {
      console.error('Error accessing camera: ', err);
      setError('Camera not available.');
      setCameraAvailable(false);
      return null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setScanning(false); 

    setTimeout(() => setScanning(true), 100);
  };

  useEffect(() => {
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
            facingMode={facingMode} 
          />
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </div>
      )}

      {qrData && qrData.text ? (
        <p>QR Code Text: {qrData.text}</p>
      ) : (
        <p>No QR Code Scanned</p>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
