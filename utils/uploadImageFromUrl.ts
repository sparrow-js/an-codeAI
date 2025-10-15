import { put } from "@vercel/blob";
import sharp from "sharp";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_DIMENSION = 8000; // Maximum allowed dimension in pixels

async function compressImageIfNeeded(imageBuffer: Buffer, originalContentType: string): Promise<{ buffer: Buffer; contentType: string }> {
  // First check and resize if dimensions exceed limits
  const metadata = await sharp(imageBuffer).metadata();
  let processedBuffer = imageBuffer;

  if (metadata.width && metadata.height) {
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      processedBuffer = await sharp(imageBuffer)
        .resize({
          width: Math.min(metadata.width, MAX_DIMENSION),
          height: Math.min(metadata.height, MAX_DIMENSION),
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();
    }
  }

  // Then handle file size compression if needed
  if (processedBuffer.length <= MAX_SIZE) {
    return { buffer: processedBuffer, contentType: originalContentType };
  }

  let quality = 80;
  let compressedBuffer = processedBuffer;

  while (compressedBuffer.length > MAX_SIZE && quality > 10) {
    const sharpInstance = sharp(processedBuffer);
    
    // 根据原始格式选择压缩方法
    if (originalContentType.includes('png')) {
      compressedBuffer = await sharpInstance
        .png({ quality })
        .toBuffer();
    } else if (originalContentType.includes('gif')) {
      compressedBuffer = await sharpInstance
        .gif()
        .toBuffer();
    } else if (originalContentType.includes('webp')) {
      compressedBuffer = await sharpInstance
        .webp({ quality })
        .toBuffer();
    } else {
      // 默认使用 JPEG 压缩
      compressedBuffer = await sharpInstance
        .jpeg({ quality })
        .toBuffer();
    }
    
    quality -= 10;
  }

  return { buffer: compressedBuffer, contentType: originalContentType };
}

export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image data as ArrayBuffer and content type
    const imageData = await response.arrayBuffer();
    const imageBuffer = Buffer.from(imageData);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Compress image if needed while maintaining original format
    const { buffer: compressedImageBuffer, contentType: finalContentType } = await compressImageIfNeeded(imageBuffer, contentType);
    
    // Generate a unique filename with original extension
    const extension = contentType.split('/')[1] || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Vercel Blob storage
    const blob = await put(filename, compressedImageBuffer, {
      contentType: finalContentType,
      access: "public",
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw error;
  }
}
