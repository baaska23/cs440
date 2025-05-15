"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("mongolian");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copyButton, setCopyButton] = useState(false);

  const colors = darkMode
    ? {
        background: "bg-[#222831]",
        secondary: "bg-[#31363F]",
        accent: "bg-[#76ABAE]",
        text: "text-[#EEEEEE]",
        border: "border-[#76ABAE]",
        hover: "hover:bg-[#76ABAE] hover:text-[#222831]",
      }
    : {
        background: "bg-[#F2EFE7]",
        secondary: "bg-[#F2EFE7]",
        accent: "bg-[#9ACBD0]",
        text: "text-[#31363F]",
        border: "border-[#94B4C1]",
        hover: "hover:bg-[#B2C6D5] hover:text-[#F2EFE7]",
      };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedLanguage = localStorage.getItem("language") || "mongolian";
    const savedHistory = JSON.parse(localStorage.getItem("ocrHistory")) || [];

    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
    setHistory(savedHistory);

    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.match(/image\/(png|jpeg|svg\+xml|gif)/)) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowInput(false);
      processImage(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.match(/image\/(png|jpeg|svg\+xml|gif)/)) {
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
    formData.append("language", language);

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

      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        imageUrl: URL.createObjectURL(file),
        text: data.text,
        language: language,
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("ocrHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error processing image:", error);
      setOcrResult(`Error: ${error.message}`);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const changeLanguage = (e) => setLanguage(e.target.value);

  const handleCopyButton = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult);
      setCopyButton(true);
      setTimeout(() => setCopyButton(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} transition-colors duration-300`}>
      <nav className={`flex justify-between items-center p-4 ${colors.secondary} shadow-md`}>
        <h1 className="text-xl font-bold">Mongolian OCR Tool</h1>
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={changeLanguage}
            className={`rounded-md px-3 py-1 ${colors.accent} ${colors.text} ${colors.border}`}
          >
            <option value="mongolian">Mongolian</option>
            <option value="cyrillic">Cyrillic</option>
          </select>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-md px-3 py-1 ${colors.accent} ${colors.hover}`}
          >
            {showHistory ? "Hide History" : "History"}
          </button>
          <button
            onClick={toggleDarkMode}
            className={`rounded-md px-3 py-1 ${colors.accent} ${colors.hover}`}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {showHistory ? (
          <div>
            <div className={`mb-8 p-4 rounded-lg ${colors.secondary} shadow-md`}>
              <h2 className={`text-xl font-bold mb-4 ${colors.text}`}>History</h2>
              {history.length === 0 ? (
                <p className={colors.text}>No history yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div key={item.id} className={`p-3 rounded border ${colors.border} ${colors.secondary}`}>
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <Image src={item.imageUrl} alt="History image" width={64} height={64} className="rounded object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-400">{item.timestamp} ({item.language})</p>
                          <p className={`mt-1 text-sm ${colors.text} line-clamp-2`}>{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button className={`py-3 px-8 mb-6 rounded-full ${colors.accent} ${colors.hover} transition-colors shadow-lg`} onClick={() => setShowHistory(false)}>
                Back To Home
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className={`text-3xl font-extrabold mb-2 ${colors.text}`}>OCR Tool made by Team IV 🎉✨</h2>
            <p className={`text-lg text-center mb-6 ${colors.text}`}>
              Convert your {language === "mongolian" ? "Mongolian" : "Cyrillic"} script images to text with incredible accuracy
            </p>
            <button
              className={`py-3 px-8 mb-6 rounded-full ${showInput ? "bg-[#E1ACAC] hover:bg-[#E1ACAC]" : `${colors.accent} ${colors.hover}`} transition-colors shadow-lg`}
              onClick={() => setShowInput(!showInput)}
            >
              {showInput ? "Cancel Upload" : "Upload Image File"}
            </button>

            {showInput && (
              <div className="w-full max-w-2xl mb-8">
                <label
                  htmlFor="dropzone-file"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${colors.border} ${colors.secondary} ${colors.hover}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className={`w-10 h-10 mb-4 ${colors.text}`}
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
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6"
                      />
                    </svg>
                    <p className={`mb-2 text-sm ${colors.text}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}

            {previewUrl && (
              <div className="mb-6">
                <Image src={previewUrl} alt="Preview" width={300} height={300} className="rounded shadow-md" />
              </div>
            )}

            {ocrResult && (
              <div className={`w-full max-w-2xl p-4 rounded shadow-md ${colors.secondary}`}>
                <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>OCR Result:</h3>
                <p className="whitespace-pre-wrap mb-4 text-sm">{ocrResult}</p>
                <button className={`rounded px-4 py-2 ${colors.accent} ${colors.hover} text-white`} onClick={handleCopyButton}>
                  {copyButton ? "Copied!" : "Copy Text"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
