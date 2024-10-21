import  { useState } from 'react';
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

  const handleScan = (data: QRData | null) => {
    if (data) {
      setQrData(data);  // Store the whole data object
    }
  };

  const handleError = (err: Error | null) => {
    if (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner</h1>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '300px' }}
      />
      
      {/* Render only the 'text' property of the qrData object */}
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
