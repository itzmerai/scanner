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
  const [scanning, setScanning] = useState<boolean>(false); // State to control scanning
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // 'user' = front camera, 'environment' = back camera
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true); // Tracks camera availability
  
  const qrScannerRef = useRef<any>(null); // Reference to the QrScanner component

  // Function to stop the video stream
  const stopCameraStream = () => {
    if (qrScannerRef.current) {
      const videoElem = qrScannerRef.current.videoElement;
      const stream = videoElem?.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks to free up the camera
        videoElem.srcObject = null;
      }
    }
  };

  // Function to handle QR code scanning
  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data); // Store the scanned QR data
      setScanning(false); // Stop scanning after a successful scan
    }
  };

  // Function to handle QR scanner errors
  const handleError = (err: Error | null) => {
    if (err) {
      setError(err.message);
      setScanning(false); // Stop scanning if an error occurs
    }
  };

  // Start the scanning process
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); // Reset previous QR data
    setError(null);  // Reset any previous errors
  };

  // Function to switch between front and back cameras
  const toggleCamera = async () => {
    try {
      stopCameraStream(); // Stop the current camera stream
      const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode); // Toggle between front ('user') and back ('environment') cameras
  
      // Restart scanning with the new camera after a small delay
      setTimeout(() => {
        setScanning(true);
        setQrData(null); // Reset previous QR data
        setError(null);  // Reset any previous errors
      }, 500); // Give the camera time to switch
    } catch (error) {
      console.error("Error toggling camera:", error);
      setError("Failed to switch camera.");
    }
  };

  // Check for camera support and handle permission issues
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported in this browser.');
      setCameraAvailable(false); // Disable camera-related functionality if not supported
    }

    // Stop the camera stream when the component unmounts or scanning is stopped
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
            ref={qrScannerRef} // Reference to handle the scanner instance
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '300px' }}
            facingMode={facingMode} // Pass the facingMode directly to the QrScanner
            legacyMode={false} // Set this to false for mobile support
          />
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
