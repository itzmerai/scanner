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
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [switchingCamera, setSwitchingCamera] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Camera mode

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderId = 'qr-reader';

  // Function to initialize the QR scanner with the selected camera
  const initScanner = async (selectedFacingMode: 'user' | 'environment') => {
    setFacingMode(selectedFacingMode); // Set the camera mode
    const config = { fps: 10, qrbox: 250 };
    const qrScanner = new Html5Qrcode(qrReaderId); // Initialize the QR scanner with the element ID
    qrScannerRef.current = qrScanner;

    try {
      await qrScanner.start(
        { facingMode: selectedFacingMode },
        config,
        qrCodeMessage => {
          setQrData({ text: qrCodeMessage });
          stopScanner(); // Stop scanning after successful scan
        },
        err => {
          console.error(`QR Code scan error: ${err}`);
          setError(`Scan error: ${err}`);
        }
      );
      setScanning(true);
    } catch (err) {
      console.error(`Failed to start scanning: ${err}`);
      setError(`Failed to start scanning: ${err}`);
    }
  };

  // Function to stop the scanner
  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
        setScanning(false);
      } catch (err) {
        console.error(`Failed to stop scanning: ${err}`);
      }
    }
  };

  // Function to switch between front and back cameras during scanning
  const toggleCamera = async () => {
    if (switchingCamera) return;
    setSwitchingCamera(true);

    await stopScanner();

    // Toggle between cameras
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    await initScanner(newFacingMode);
    setSwitchingCamera(false);
  };

  // Check for camera support and handle browser capabilities
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
      <h1>QR Code Scanner</h1>

      {/* Render the QR reader container */}
      <div id={qrReaderId} style={{ width: '300px', height: '300px', margin: '0 auto' }} />

      {!scanning ? (
        <>
          {/* Back Camera Button */}
          <button
            onClick={() => initScanner('environment')}
            style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
          >
            Start with Back Camera
          </button>

          {/* Front Camera Button */}
          <button
            onClick={() => initScanner('user')}
            style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
          >
            Start with Front Camera
          </button>
        </>
      ) : (
        <div>
          <p>Scanning with {facingMode === 'environment' ? 'Back' : 'Front'} Camera...</p>

          {/* Camera Switching Button */}
          {cameraAvailable && (
            <button
              onClick={toggleCamera}
              style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
              disabled={switchingCamera}
            >
              {switchingCamera ? 'Switching Camera...' : `Switch to ${facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}`}
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
