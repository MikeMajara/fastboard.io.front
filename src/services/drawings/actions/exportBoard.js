import { Log, timeoutPromise } from '#utils';
import {
  canvasBgColor,
  exportedImageType,
  exportedImageQuality,
  exportedImageMargin,
  exportImageTimeout,
} from '#constants';

/**
 * Export the board project to JPG.
 *
 * @returns {Promise} Resolved with the blob representing the board in JPG format.
 */
export default function exportBoard() {
  Log.info('Service : Drawings : exportBoard');

  return timeoutPromise((res) => {
    const svgString = this.projects.drawings.exportSVG({
      asString : true,
      bounds   : 'content',
    });

    const url = URL.createObjectURL(new Blob(
      [svgString],
      { type : 'image/svg+xml;charset=utf-8' },
    ));

    const image = new Image();
    image.src = url;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width + 2 * exportedImageMargin;
      canvas.height = image.height + 2 * exportedImageMargin;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, exportedImageMargin, exportedImageMargin, image.width, image.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        res(blob);
      }, exportedImageType, exportedImageQuality);
    };
  }, exportImageTimeout);
}
