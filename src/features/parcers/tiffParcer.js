import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';

const targetProjection = 'EPSG:4326';

export const parseTiffFile = async (file) => {
  try {

    const arrayBuffer = await file.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    const metadata = await image.getFileDirectory();

    const sourceProjection = metadata.GTCitationGeoKey || 'EPSG:32653';
    const boundingBox = image.getBoundingBox();
    const [minX, minY, maxX, maxY] = boundingBox;

    const bottomLeft = proj4(sourceProjection, targetProjection, [minX - 380, minY - 590]);
    const topRight = proj4(sourceProjection, targetProjection, [maxX - 700, maxY + 3000]);

    const bounds = [
      [bottomLeft[1], bottomLeft[0]],
      [topRight[1], topRight[0]]
    ];

    const imageData = await image.readRasters();
    const width = image.getWidth();
    const height = image.getHeight();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const numPixels = width * height;
    const rgbaArray = new Uint8ClampedArray(numPixels * 4);

    const normalizeToByte = (value) => {
      if (value > 255) {
        value = Math.min(value, 65535);
        return Math.round(value / 256);
      }
      return Math.round(value * 255);
    };

    if (imageData.length === 3) {
      for (let i = 0; i < numPixels; i++) {
        const r = normalizeToByte(imageData[0][i]);
        const g = normalizeToByte(imageData[1][i]);
        const b = normalizeToByte(imageData[2][i]);
        rgbaArray[i * 4] = r;
        rgbaArray[i * 4 + 1] = g;
        rgbaArray[i * 4 + 2] = b;
        rgbaArray[i * 4 + 3] = 255;
      }
    } else if (imageData.length === 1) {
      for (let i = 0; i < numPixels; i++) {
        const intensity = normalizeToByte(imageData[0][i]);
        rgbaArray[i * 4] = intensity;
        rgbaArray[i * 4 + 1] = intensity;
        rgbaArray[i * 4 + 2] = intensity;
        rgbaArray[i * 4 + 3] = intensity === 0 ? 0 : 255;
      }
    }

    const imgData = new ImageData(rgbaArray, width, height);
    ctx.putImageData(imgData, 0, 0);
    const imageUrl = canvas.toDataURL('image/png');

    return {
      imageUrl,
      bounds
    };
  } catch (error) {
    console.error('Ошибка при обработке TIFF файла:', error);
    throw new Error('Ошибка при обработке TIFF файла');
  }
};
