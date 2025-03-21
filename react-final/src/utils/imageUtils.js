export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export const optimizeImage = (
  base64,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(optimizedBase64);
    };
  });
};

export const getImageDimensions = (base64) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });
};

export const createThumbnail = (base64, size = 150) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      const minDimension = Math.min(img.width, img.height);
      let sx = 0;
      let sy = 0;

      if (img.width > img.height) {
        sx = (img.width - minDimension) / 2;
      } else {
        sy = (img.height - minDimension) / 2;
      }

      ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);

      const thumbnailBase64 = canvas.toDataURL("image/jpeg", 0.8);
      resolve(thumbnailBase64);
    };
  });
};
