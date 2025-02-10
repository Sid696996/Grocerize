import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Plus, AlertCircle } from 'lucide-react';
import { Item } from '../types';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  onScan: (item: Item) => void;
  items: Item[];
}

export default function BarcodeScanner({ onScan, items }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanning && videoRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment"
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader"
          ]
        }
      }, (err) => {
        if (err) {
          setError("Failed to initialize camera. Please check permissions.");
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        if (code) {
          setBarcode(code);
          handleScan({ preventDefault: () => {} } as any);
          Quagga.stop();
          setScanning(false);
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [scanning]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(item => item.barcode === barcode);
    if (item) {
      onScan(item);
      setBarcode('');
      setError(null);
    } else {
      setError('Product not found! Please add it manually.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScanning(!scanning)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Scan size={20} />
          <span>{scanning ? 'Stop Scanning' : 'Start Camera'}</span>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {scanning ? (
        <div
          ref={videoRef}
          className="w-full aspect-video bg-black rounded-lg overflow-hidden"
        />
      ) : (
        <form onSubmit={handleScan} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode manually..."
              className="w-full pl-4 pr-10 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600"
            >
              <Scan size={20} />
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}