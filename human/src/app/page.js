"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/svg+xml" || file.type === "image/gif")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowInput(false);
      processImage(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/svg+xml" || file.type === "image/gif")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowInput(false);
      processImage(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      const data = await response.json();
      setOcrResult(data.text);
    } catch (error) {
      console.error("Error processing image:", error);
      setOcrResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[16px] row-start-2 items-center">
      <h2 className="text-4xl font-extrabold">OCR Tool made by Team III 🎉✨</h2>        
      <p className="text-lg text-center text-gray-600">Convert your Image to Text files with incredible accuracy</p>
        <button
          className="h-18 w-72 bg-[#00c281] rounded-3xl"
          onClick={() => setShowInput(!showInput)}
        >
          {showInput ? "Hide Upload" : "Upload IMG File"}
        </button>

        {showInput && (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100 "
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".svg,.png,.jpg,.jpeg,.gif"
              />
            </label>
          </div>
        )}

        {previewUrl && (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Preview:</h3>
            <Image
              src={previewUrl}
              alt="Selected image preview"
              width={400}
              height={300}
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
        )}

        {ocrResult && (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">OCR Result:</h3>
            <p className="text-gray-700">{ocrResult}</p>
          </div>
        )}
      </main>
    </div>
  );
}