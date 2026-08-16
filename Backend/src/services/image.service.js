const fs = require("fs/promises");

const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP_RIFF_SIGNATURE = Buffer.from("RIFF");
const WEBP_WEBP_SIGNATURE = Buffer.from("WEBP");

const createImageError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const readFileBuffer = async (filePath) => {
  if (!filePath || typeof filePath !== "string") {
    throw createImageError("Uploaded file path is missing");
  }

  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createImageError("Uploaded file not found", 404);
    }

    throw createImageError("Unable to read uploaded file");
  }
};

const getImageTypeFromBuffer = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) {
    return null;
  }

  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(JPEG_SIGNATURE)) {
    return "jpeg";
  }

  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).equals(WEBP_RIFF_SIGNATURE) &&
    buffer.subarray(8, 12).equals(WEBP_WEBP_SIGNATURE)
  ) {
    return "webp";
  }

  return null;
};

const getImageTypeFromFile = async (filePath) => {
  const buffer = await readFileBuffer(filePath);
  const imageType = getImageTypeFromBuffer(buffer);

  if (!imageType) {
    throw createImageError("Only JPEG, PNG, and WEBP image files are allowed");
  }

  return imageType;
};

const deleteUploadedFile = async (filePath) => {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete file at ${filePath}:`, error.message);
    }
    return false;
  }
};

const validateUploadedImage = async (file) => {
  if (!file || !file.path) {
    throw createImageError("Uploaded file is missing");
  }

  try {
    return await getImageTypeFromFile(file.path);
  } catch (error) {
    await deleteUploadedFile(file.path);
    throw error;
  }
};

module.exports = {
  getImageTypeFromBuffer,
  getImageTypeFromFile,
  validateUploadedImage,
  deleteUploadedFile,
};