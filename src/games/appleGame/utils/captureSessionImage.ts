import html2canvas from 'html2canvas';

export async function captureElementToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    useCORS: true,
    logging: false,
    scale: Math.min(2, window.devicePixelRatio || 1),
    backgroundColor: null,
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg',
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/** 한 번 렌더링 후 PNG / JPEG 동시 생성 */
export async function captureElementToImageBlobs(el: HTMLElement): Promise<{
  png: Blob | null;
  jpeg: Blob | null;
}> {
  const canvas = await captureElementToCanvas(el);
  const [png, jpeg] = await Promise.all([
    canvasToBlob(canvas, 'image/png'),
    canvasToBlob(canvas, 'image/jpeg', 0.92),
  ]);
  return { png, jpeg };
}

export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  try {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
