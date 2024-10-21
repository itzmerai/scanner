import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';

function App() {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setQrData(data);  // Store the whole data object
    }
  };

  const handleError = (err) => {
    setError(err?.message);
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
