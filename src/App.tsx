import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Define the shape of the QR Data
interface QRData {
  text: string;
  rawBytes?: Uint8Array;
}

function App() {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);

  const qrScannerRef = useRef<Html5Qrcode | null>(null); // Reference to the scanner instance

  // Function to initialize the QR scanner
  const initScanner = () => {
    const config = { fps: 10, qrbox: 250 };
    const qrScanner = new Html5Qrcode('qr-reader');
    qrScannerRef.current = qrScanner;

    qrScanner.start(
      { facingMode }, 
      config,
      qrCodeMessage => {
        setQrData({ text: qrCodeMessage });
        stopScanner(); // Stop scanning after successful scan
      },
      err => {
        console.error(`QR Code scan error: ${err}`);
        setError(`Scan error: ${err}`);
      }
    ).catch(err => {
      console.error(`Failed to start scanning: ${err}`);
      setError(`Failed to start scanning: ${err}`);
    });
  };

  // Function to stop the scanner
  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().then(() => {
        qrScannerRef.current?.clear();
        setScanning(false);
      }).catch(err => {
        console.error(`Failed to stop scanning: ${err}`);
      });
    }
  };

  // Start the scanning process
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null);
    setError(null);
    initScanner(); // Initialize the scanner
  };

  // Function to switch between front and back cameras
  const toggleCamera = () => {
    stopScanner(); // Stop the current camera
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment'); // Toggle between cameras

    // Reinitialize the scanner after a brief delay to switch camera
    setTimeout(() => initScanner(), 500);
  };

  // Check for camera support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false);
    }

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner h5</h1>

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
          <div id="qr-reader" style={{ width: '300px', margin: '0 auto' }} />
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>
          {cameraAvailable && (
            <button onClick={toggleCamera} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
              Switch to {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
            </button>
          )}
        </div>
      )}

      {/* Display scanned QR data */}
      {qrData && qrData.text ? (
        <p>QR Code Text: {qrData.text}</p>
      ) : (
        <p>No QR Code Scanned</p>
      )}

      {/* Display error message */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
