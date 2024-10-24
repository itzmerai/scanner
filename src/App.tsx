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
  const [switchingCamera, setSwitchingCamera] = useState<boolean>(false); // Flag for camera switching
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Camera mode

  const qrScannerRef = useRef<Html5Qrcode | null>(null); // Reference to the scanner instance
  const qrReaderId = 'qr-reader'; // Define a constant ID for the QR scanner element

  // Function to initialize the QR scanner with the selected camera
  const initScanner = async (selectedFacingMode: 'user' | 'environment') => {
    setFacingMode(selectedFacingMode); // Set the camera (front or back) based on the selected button
    const config = { fps: 10, qrbox: 250 };
    const qrScanner = new Html5Qrcode(qrReaderId);
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
    if (switchingCamera) return; // Prevent multiple camera switch requests
    setSwitchingCamera(true);

    await stopScanner(); // Ensure the current scanner is stopped

    // Toggle between cameras
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    await initScanner(newFacingMode);
    setSwitchingCamera(false);
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
      <h1>QR Code Scanner</h1>

      {/* Render the QR reader container always */}
      <div id={qrReaderId} style={{ width: '300px', margin: '0 auto', display: scanning ? 'block' : 'none' }} />

      {!scanning ? (
        <>
          {/* Back Camera Button */}
          <button
            onClick={() => initScanner('environment')} // Start scanning with the back camera
            style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
          >
            Start with Back Camera
          </button>

          {/* Front Camera Button */}
          <button
            onClick={() => initScanner('user')} // Start scanning with the front camera
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
              disabled={switchingCamera} // Disable button while switching
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
