import { useState } from 'react';
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
  // Use the QRData type for the state
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false); // State to control scanning visibility

  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data); // Store the whole data object
      setScanning(false); // Stop scanning after successful scan
    }
  };

  const handleError = (err: Error | null) => {
    if (err) {
      setError(err.message);
    }
  };

  // Handler for starting the scan
  const handleStartScan = () => {
    setScanning(true);
    setQrData(null); // Clear previous scan data
    setError(null);  // Clear previous errors
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner</h1>

      {!scanning ? (
        <button onClick={handleStartScan} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Start Scan
        </button>
      ) : (
        <div>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '300px' }}
          />
          <p>Scanning...</p>
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
