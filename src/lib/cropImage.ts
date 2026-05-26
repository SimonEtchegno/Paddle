export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const MAX_SIZE = 400;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * MAX_SIZE) / targetWidth);
      targetWidth = MAX_SIZE;
    } else {
      targetWidth = Math.round((targetWidth * MAX_SIZE) / targetHeight);
      targetHeight = MAX_SIZE;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // We return a compressed data URL to avoid exceeding localStorage quota or Supabase payload limits
  return canvas.toDataURL('image/jpeg', 0.8);
}
