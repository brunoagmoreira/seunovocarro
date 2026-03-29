import logoSrc from '@/assets/logo-watermark.png';

export interface WatermarkOptions {
  opacity?: number;        // 0-1, default 0.3
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'tiled';
  scale?: number;          // Logo scale relative to image width, default 0.2 (20%)
  margin?: number;         // Margin in pixels, default 20
}

/**
 * Apply Kairos watermark to an image file using Canvas API.
 * Returns a new Blob with the watermark applied.
 */
export async function applyWatermark(
  file: File | Blob,
  options: WatermarkOptions = {}
): Promise<Blob> {
  const {
    opacity = 0.3,
    position = 'bottom-right',
    scale = 0.2,
    margin = 20,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Load watermark logo
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = typeof logoSrc === 'string' ? logoSrc : (logoSrc as any).src;

        logo.onload = () => {
          const logoWidth = img.width * scale;
          const logoHeight = (logo.height / logo.width) * logoWidth;

          ctx.globalAlpha = opacity;

          if (position === 'tiled') {
            // Tiled watermark across the entire image
            const spacingX = logoWidth * 2;
            const spacingY = logoHeight * 3;

            ctx.save();
            ctx.globalAlpha = opacity * 0.5; // lighter for tiled

            for (let y = -logoHeight; y < img.height + logoHeight; y += spacingY) {
              for (let x = -logoWidth; x < img.width + logoWidth; x += spacingX) {
                ctx.save();
                ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
                ctx.rotate(-Math.PI / 6); // -30 degrees
                ctx.drawImage(logo, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
                ctx.restore();
              }
            }
            ctx.restore();
          } else {
            // Single position watermark
            let x: number, y: number;

            switch (position) {
              case 'top-left':
                x = margin;
                y = margin;
                break;
              case 'top-right':
                x = img.width - logoWidth - margin;
                y = margin;
                break;
              case 'bottom-left':
                x = margin;
                y = img.height - logoHeight - margin;
                break;
              case 'center':
                x = (img.width - logoWidth) / 2;
                y = (img.height - logoHeight) / 2;
                break;
              case 'bottom-right':
              default:
                x = img.width - logoWidth - margin;
                y = img.height - logoHeight - margin;
                break;
            }

            ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          }

          ctx.globalAlpha = 1;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create watermarked image'));
                return;
              }
              resolve(blob);
            },
            'image/jpeg',
            0.92
          );
        };

        logo.onerror = () => reject(new Error('Failed to load watermark logo'));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
