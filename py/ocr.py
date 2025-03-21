from fastapi import FastAPI, File, UploadFile
import cv2
import pytesseract
import numpy as np
from PIL import Image
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_grayscale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def remove_noise(img):
    return cv2.medianBlur(img, 5)

def thresholding(img):
    return cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

def ocr_core(img, lang="mon"):
    text = pytesseract.image_to_string(img, lang=lang)
    return text

@app.post("/")
async def process_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Invalid image file"}
        
        img = get_grayscale(img)
        img = thresholding(img)
        img = remove_noise(img)
        
        cv2.imwrite("processed_image.jpg", img)
        
        result = ocr_core(img, lang="mon")
        
        return {"text": result}
    except Exception as e:
        return {"error": str(e)}