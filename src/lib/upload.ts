/**
 * Utility for uploading images to imgBB.
 * Automatically compresses large images client-side to ensure fast uploads
 * and avoid HTTP 413 (Request Entity Too Large) on Nginx servers.
 */

async function compressImageIfNeeded(file: File): Promise<File | Blob> {
  // Only compress in browser environment for image files
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return file;
  }

  // If already tiny (less than 400KB), no compression needed
  if (file.size <= 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress as WebP for superior compression, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const baseName = file.name.replace(/\.[^/.]+$/, "") || "upload";
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadToImgBB(file: File | string): Promise<string> {
  let fileToUpload: File | string | Blob = file;

  if (typeof window !== 'undefined' && file instanceof File) {
    try {
      fileToUpload = await compressImageIfNeeded(file);
    } catch (err) {
      console.warn('Image compression skipped, using original file:', err);
      fileToUpload = file;
    }
  }

  const formData = new FormData();
  
  if (typeof fileToUpload === 'string') {
    // If it's a base64 string, remove the data:image/xxx;base64, prefix if present
    const base64Data = fileToUpload.split(',')[1] || fileToUpload;
    formData.append('image', base64Data);
  } else {
    // If it's a File or Blob object
    formData.append('image', fileToUpload as any);
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Image upload failed: Unexpected response from server. Status: ${response.status} (Details: ${text || 'empty response'})`);
    }

    if (response.ok && data.url) {
      return data.url;
    } else {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error during image upload:', error);
    throw error;
  }
}
