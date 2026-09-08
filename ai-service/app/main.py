import io
import os
import re
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

app = FastAPI(title='PackCheck AI OCR Service', version='1.0.0')


def quality_score(image: Image.Image):
    grayscale = ImageOps.grayscale(image)
    variance = sum((pixel - 128) ** 2 for pixel in grayscale.resize((64, 64)).getdata()) / (64 * 64 * 255 ** 2)
    return {"blur": round(max(0, min(1, 1 - variance * 2)), 3), "brightness": round(sum(grayscale.resize((64, 64)).getdata()) / (64 * 64 * 255), 3), "resolution": f"{image.width}x{image.height}"}


def local_ocr_note():
    return "PaddleOCR is optional in this development image. OCR text blocks are empty until PaddleOCR is installed and enabled."


@app.get('/health')
def health():
    return {"ok": True, "service": "PackCheck AI OCR"}


@app.post('/analyze')
async def analyze(files: List[UploadFile] = File(...)):
    if not files or len(files) > 8:
        raise HTTPException(status_code=400, detail='Upload between 1 and 8 images')
    results = []
    combined = []
    for index, upload in enumerate(files):
        if upload.content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
            raise HTTPException(status_code=415, detail=f'Unsupported image type: {upload.content_type}')
        try:
            image = Image.open(io.BytesIO(await upload.read())).convert('RGB')
            image = ImageEnhance.Contrast(image.filter(ImageFilter.MedianFilter(3))).enhance(1.2)
            quality = quality_score(image)
            results.append({"imageId": f"image_{index + 1}", "text": "", "textBlocks": [], "quality": quality, "warning": local_ocr_note()})
        except Exception as error:
            raise HTTPException(status_code=400, detail=f'Invalid image: {error}')
    return {"success": True, "images": results, "combinedText": " ".join(combined), "ocrProvider": "PaddleOCR-ready"}
