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

 
  const colors = {
    darkest: "bg-[#051F20]",     // #051F20 - Darkest forest green
    darker: "bg-[#0B2B26]",      // #0B2B26 - Very dark forest green
    dark: "bg-[#163832]",        // #163832 - Dark forest green
    medium: "bg-[#235347]",      // #235347 - Medium forest green
    light: "bg-[#8EB69B]",       // #8EB69B - Light forest green
    lightest: "bg-[#DAF1DE]",    // #DAF1DE - Very light mint green
  

    darkestText: "text-[#051F20]",
    darkerText: "text-[#0B2B26]",
    darkText: "text-[#163832]",
    mediumText: "text-[#235347]",
    lightText: "text-[#8EB69B]",
    lightestText: "text-[#DAF1DE]",
    

    darkestBorder: "border-[#051F20]",
    darkerBorder: "border-[#0B2B26]",
    darkBorder: "border-[#163832]",
    mediumBorder: "border-[#235347]",
    lightBorder: "border-[#8EB69B]",
    lightestBorder: "border-[#DAF1DE]",
  };

 
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedLanguage = localStorage.getItem("language") || "mongolian";
    const savedHistory = JSON.parse(localStorage.getItem("ocrHistory")) || [];
    
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
    setHistory(savedHistory);
    
    // darkmode
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Load history from local storage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Hel songoj hadgalah
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

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
      
      // History 
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        imageUrl: URL.createObjectURL(file),
        text: data.text,
        language: language
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10); // Keep only last 10 items
      setHistory(updatedHistory);
      localStorage.setItem("ocrHistory", JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error("Error processing image:", error);
      setOcrResult(`Error: ${error.message}`);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeLanguage = (e) => {
    setLanguage(e.target.value);
  };

  const handleCopyButton = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult);
      setCopyButton(true);
      setTimeout(() => setCopyButton(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? colors.darkest : 'bg-gray-50'} ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
   
      <nav className={`flex justify-between items-center p-4 ${darkMode ? colors.darker : colors.dark} shadow-md text-white`}>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Mongolian OCR Tool</h1>
        </div>
        <div className="flex items-center space-x-4">
         
          <select 
            value={language}
            onChange={changeLanguage}
            className={`rounded-md px-3 py-1 text-white border ${darkMode ? 'bg-[#051F20] border-[#0B2B26]' : 'bg-[#0B2B26] border-[#051F20]'}`}
          >
            <option value="mongolian">Mongolian</option>
            <option value="cyrillic">Cyrillic</option>
          </select>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-md px-3 py-1 text-white ${darkMode ? 'bg-[#051F20] hover:bg-[#0B2B26]' : 'bg-[#0B2B26] hover:bg-[#163832]'}`}
          >
            {showHistory ? 'Hide History' : 'History'}
          </button>
          
          <button 
            onClick={toggleDarkMode}
            className={`rounded-md px-3 py-1 text-white ${darkMode ? 'bg-[#8EB69B] hover:bg-[#DAF1DE] text-[#051F20]' : 'bg-[#235347] hover:bg-[#8EB69B]'}`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {showHistory ? (
          <div>
            <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-[#0B2B26]' : 'bg-white'} shadow-md`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>History</h2>
            {history.length === 0 ? (
              <p className={`${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'}`}>No history yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded border ${darkMode ? 'border-[#163832] bg-[#163832]' : 'border-[#DAF1DE] bg-[#DAF1DE] bg-opacity-30'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt="History image"
                          width={64}
                          height={64}
                          className="rounded object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'}`}>{item.timestamp} ({item.language})</p>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'} line-clamp-2`}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
          <div className="flex justify-center">
              <button
              className={`py-3 px-8 mb-6 rounded-full text-white bg-[#163832] hover:bg-green-900 transition-colors shadow-lg `}
              onClick={() => setShowHistory(false)}
            >
              Back To Home
            </button>
          </div>
          </div>
          
        ) : (
          <div className="flex flex-col items-center">
            <h2 className={`text-3xl font-extrabold mb-2 ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>
              OCR Tool made by Team III 🎉✨
            </h2>
            <p className={`text-lg text-center mb-6 ${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'}`}>
              Convert your {language === "mongolian" ? "Mongolian" : "Cyrillic"} script images to text with incredible accuracy
            </p>
            
            <button
              className={`py-3 px-8 mb-6 rounded-full text-white ${showInput ? 'bg-red-300 hover:bg-red-400' : 'bg-[#235347] hover:bg-[#163832]'} transition-colors shadow-lg`}
              onClick={() => setShowInput(!showInput)}
            >
              {showInput ? "Cancel Upload" : "Upload Image File"}
            </button>

            {showInput && (
              <div className="w-full max-w-2xl mb-8">
                <label
                  htmlFor="dropzone-file"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                  ${darkMode 
                    ? 'border-[#8EB69B] bg-[#0B2B26] hover:bg-[#163832]' 
                    : 'border-[#8EB69B] bg-[#DAF1DE] bg-opacity-30 hover:bg-opacity-50'}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className={`w-10 h-10 mb-4 ${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'}`}
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
                    <p className={`mb-2 text-sm ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'}`}>
                      SVG, PNG, JPG or GIF
                    </p>
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

            {/* Results */}
            <div className="w-full max-w-4xl">
              {previewUrl && (
                <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-[#0B2B26]' : 'bg-white'} shadow-md`}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>
                    Image Preview:
                  </h3>
                  <div className="flex justify-center">
                    <Image
                      src={previewUrl}
                      alt="Selected image preview"
                      width={400}
                      height={300}
                      style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}

              {ocrResult && (
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-[#0B2B26]' : 'bg-white'} shadow-md`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>
                      OCR Result ({language === "mongolian" ? "Mongolian" : "Cyrillic"}):
                    </h3>
                    <button 
                      onClick={handleCopyButton}
                      className={`px-3 py-1 rounded ${darkMode ? 'bg-[#8EB69B] text-[#051F20]' : 'bg-[#235347] text-white'} hover:opacity-90`}
                    >
                      {copyButton ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className={`whitespace-pre-wrap p-4 rounded ${darkMode ? 'bg-[#163832] text-[#DAF1DE]' : 'bg-[#DAF1DE] bg-opacity-30 text-[#051F20]'}`}>
                    {ocrResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className={`py-4 text-center text-sm ${darkMode ? 'text-[#8EB69B]' : 'text-[#235347]'} mt-12`}>
        Mongolian OCR Tool - Team III © {new Date().getFullYear()}
      </footer>
    </div>
  );
}