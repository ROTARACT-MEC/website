const fs = require('fs');
const path = require('path');
const imagePath = path.join(__dirname, '..', 'public', 'coordinators', 'minu-k-k.jpeg');

try {
  if (!fs.existsSync(imagePath)) {
    console.error("Image file does not exist.");
    process.exit(1);
  }
  const buffer = fs.readFileSync(imagePath);
  let i = 2;
  let found = false;

  // A JPEG file starts with 0xFFD8. Verify file signature.
  if (buffer.length < 4 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    console.error("Not a valid JPEG file.");
    process.exit(1);
  }

  while (i + 1 < buffer.length) {
    if (buffer[i] === 0xFF) {
      const marker = buffer[i+1];
      // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2), SOF3 (0xC3) markers contain frame headers
      if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2 || marker === 0xC3) {
        if (i + 8 < buffer.length) {
          const height = buffer.readUInt16BE(i + 5);
          const width = buffer.readUInt16BE(i + 7);
          console.log(`Image Dimensions: ${width}x${height}`);
          found = true;
          break;
        } else {
          console.error("Malformed JPEG: SOF block too short.");
          break;
        }
      }

      // Skip the marker segment
      if (i + 3 < buffer.length) {
        const segmentLength = buffer.readUInt16BE(i + 2);
        i += 2 + segmentLength;
      } else {
        break;
      }
    } else {
      i++;
    }
  }
  if (!found) {
    console.log("Could not find SOF marker in JPEG.");
  }
} catch (err) {
  console.error("Error reading image:", err);
}
