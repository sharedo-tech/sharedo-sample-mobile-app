const imageExtensions = ["gif", "png", "bmp", "jpg", "jpeg", "psd", "heic", "webp"];
const videoExtensions = ["mpg", "mp4", "avi", "mov", "3gp"];

const makeUnique = (filename, existingFiles = []) => {
  if (existingFiles.some(file => file.toLowerCase() === filename.toLowerCase())) {
    const split = filename.split(".");
    const stem = split[0];
    const ext = split.slice(1).join(".");

    let lastOrdinal = 0;
    const regex = new RegExp(`${stem}\\((?<ordinal>\\d+)\\)\\.${ext}`, "i");

    existingFiles.forEach(file => {
      const match = file.match(regex);

      if (match && match.length > 0) {
        const ordinal = parseInt(match.groups.ordinal);
        if (ordinal > lastOrdinal) {
          lastOrdinal = ordinal;
        }
      }
    });

    return `${stem}(${lastOrdinal + 1}).${ext}`;
  }

  return filename;
}

const isImage = extension => imageExtensions.includes(extension);

const isVideo = extension => videoExtensions.includes(extension);

const getExtension = filename => (filename || "").split(".").pop().toLowerCase();

export {
  makeUnique,
  getExtension,
  isImage,
  isVideo
}