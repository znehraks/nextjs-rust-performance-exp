'use client';

import { useEffect, useRef, useState } from 'react';
import init, { to_grayscale } from '../../rust-image/pkg';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processingTime, setProcessingTime] = useState<{js: number, wasm: number}>({ js: 0, wasm: 0 });

  useEffect(() => {
    init(); // WASM 초기화
  }, []);

  const processImageJS = (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    return imageData;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // JavaScript 처리 시간 측정
      const jsStart = performance.now();
      const clonedImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        canvas.width,
        canvas.height
      );
      processImageJS(clonedImageData);
      const jsEnd = performance.now();
      
      // WASM 처리 시간 측정
      const wasmStart = performance.now();
      const wasmResult = to_grayscale(new Uint8Array(imageData.data.buffer));
      const wasmEnd = performance.now();
      
      setProcessingTime({
        js: jsEnd - jsStart,
        wasm: wasmEnd - wasmStart
      });

      // WASM 결과 표시
      const wasmImageData = new ImageData(
        new Uint8ClampedArray(wasmResult),
        canvas.width,
        canvas.height
      );
      ctx.putImageData(wasmImageData, 0, 0);
    };
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">이미지 그레이스케일 변환 성능 비교</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      <canvas ref={canvasRef} className="border border-gray-300" />
      {processingTime.js > 0 && (
        <div className="mt-4">
          <p>JavaScript 처리 시간: {processingTime.js.toFixed(2)}ms</p>
          <p>WASM 처리 시간: {processingTime.wasm.toFixed(2)}ms</p>
          <p>성능 향상: {((processingTime.js / processingTime.wasm) - 1 * 100).toFixed(2)}%</p>
        </div>
      )}
    </main>
  );
}