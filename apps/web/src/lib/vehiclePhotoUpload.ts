import { fetchApi } from '@/lib/api';
import { compressImage } from '@/lib/imageCompression';
import { applyWatermark } from '@/lib/watermark';

/** Parallel uploads; keeps R2/browser from saturating. */
const UPLOAD_CONCURRENCY = 4;
const COMPRESS_MAX_MB = 1.5;
const COMPRESS_MAX_EDGE = 1920;

const WATERMARK_OPTS = {
  opacity: 0.3,
  position: 'center' as const,
  scale: 0.3,
};

export type UploadedVehicleImage = { url: string; type: 'image'; order: number };

/**
 * Compress, watermark, and upload vehicle photos in parallel batches.
 * Order in the returned array matches `files` indices.
 */
export async function uploadVehiclePhotoFiles(
  files: File[],
  filenameForIndex: (index: number) => string
): Promise<UploadedVehicleImage[]> {
  const out: UploadedVehicleImage[] = new Array(files.length);

  for (let start = 0; start < files.length; start += UPLOAD_CONCURRENCY) {
    const end = Math.min(start + UPLOAD_CONCURRENCY, files.length);
    await Promise.all(
      Array.from({ length: end - start }, (_, j) => {
        const i = start + j;
        const file = files[i];
        return (async () => {
          const compressed = await compressImage(
            file,
            COMPRESS_MAX_MB,
            COMPRESS_MAX_EDGE
          );
          const forWatermark = new File([compressed], file.name, {
            type: 'image/jpeg',
          });
          const watermarkedBlob = await applyWatermark(
            forWatermark,
            WATERMARK_OPTS
          );
          const formData = new FormData();
          formData.append(
            'file',
            new File([watermarkedBlob], filenameForIndex(i), {
              type: 'image/jpeg',
            })
          );
          const { url } = await fetchApi<{ url: string }>(
            '/media/upload/vehicle',
            {
              method: 'POST',
              body: formData,
              requireAuth: true,
            }
          );
          out[i] = { url, type: 'image', order: i };
        })();
      })
    );
  }

  return out;
}
