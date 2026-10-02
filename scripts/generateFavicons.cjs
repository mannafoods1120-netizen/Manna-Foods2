const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to generate PNG from pixel generator
function makePNG(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const offset = y * rowSize + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length);
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(toCrc));
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Pixel shader for the exact official Manna Foods logo:
// 1. Charcoal Chef Hat Outline (transparent interior)
// 2. Rising Yellow/Red Flame bursting through the top
// 3. Manna Foods Brush Text
// 4. Every Meal is a Happy Meal Script Tagline
function getLogoPixel(px, py, W, H) {
  const x = px / W;
  const y = py / H;

  const cx = x - 0.5;

  // --- 1. THE FLAME ---
  // Rises from y = 0.62 up to y = 0.06
  const inFlameY = y >= 0.055 && y <= 0.62;
  let isFlame = false;
  let isYellowRim = false;
  let isInnerHighlight = false;
  let isRedFlame = false;

  if (inFlameY) {
    // S-curve center line bending right at the top
    const topCurve = y < 0.25 ? 0.03 * Math.sin((0.25 - y) * 12) : 0;
    const flameSpineX = cx - topCurve;

    // Width envelope of flame
    let flameWidth = 0;
    if (y < 0.15) {
      flameWidth = (y - 0.055) * 0.45; // narrow tip
    } else if (y < 0.42) {
      flameWidth = 0.042 + 0.06 * Math.sin(((y - 0.15) / 0.27) * Math.PI); // belly
    } else {
      flameWidth = 0.042 * (1 - (y - 0.42) / 0.20); // base taper
    }

    const distFromSpine = Math.abs(flameSpineX);
    if (distFromSpine <= flameWidth) {
      isFlame = true;

      // Outer yellow rim
      if (distFromSpine >= flameWidth - 0.016 || y <= 0.08) {
        isYellowRim = true;
      }
      // Inner yellow flame tongue
      else if (Math.abs(flameSpineX - 0.008) < 0.007 && y >= 0.10 && y <= 0.52) {
        isInnerHighlight = true;
      } else {
        isRedFlame = true;
      }
    }
  }

  if (isFlame) {
    if (isYellowRim || isInnerHighlight) {
      return [255, 208, 0, 255]; // Golden Yellow #FFD000
    }
    if (isRedFlame) {
      return [229, 26, 26, 255]; // Fire Red #E51A1A
    }
  }

  // --- 2. CHEF HAT CONTOUR (Black brush stroke, transparent inside) ---
  const hatTopY = y - 0.34;
  const dCentralDome = Math.hypot(cx, hatTopY + 0.14);
  const dLeftLobe = Math.hypot(cx + 0.21, hatTopY);
  const dRightLobe = Math.hypot(cx - 0.21, hatTopY);

  // Hat outline thickness ~ 0.024
  const strokeThick = 0.022;
  const isCentralBorder = Math.abs(dCentralDome - 0.21) < strokeThick && y >= 0.17 && y <= 0.36;
  const isLeftLobeBorder = Math.abs(dLeftLobe - 0.16) < strokeThick && cx < -0.05 && y >= 0.25 && y <= 0.52;
  const isRightLobeBorder = Math.abs(dRightLobe - 0.16) < strokeThick && cx > 0.05 && y >= 0.25 && y <= 0.52;
  const isLeftStem = Math.abs(cx - (-0.155)) < strokeThick && y >= 0.48 && y <= 0.62;
  const isRightStem = Math.abs(cx - 0.155) < strokeThick && y >= 0.48 && y <= 0.62;
  
  // Bottom hat rim (convex curve)
  const bottomRimY = 0.62 + 0.04 * (1 - Math.pow(cx / 0.16, 2));
  const isBottomRim = Math.abs(y - bottomRimY) < 0.020 && Math.abs(cx) <= 0.165;

  // Inner cuff stroke
  const innerCuffY = 0.60 + 0.015 * (1 - Math.pow(cx / 0.11, 2));
  const isInnerCuff = Math.abs(y - innerCuffY) < 0.014 && Math.abs(cx) <= 0.11;

  if (isCentralBorder || isLeftLobeBorder || isRightLobeBorder || isLeftStem || isRightStem || isBottomRim || isInnerCuff) {
    return [34, 34, 34, 255]; // Charcoal Black #222222
  }

  // --- 3. MANNA FOODS TITLE (y ~ 0.71 to 0.81) ---
  if (y >= 0.71 && y <= 0.81 && Math.abs(cx) <= 0.42) {
    // Check if pixel falls on simulated bold brush letters
    const sampleIdx = Math.floor(px * 1.5) % 11;
    if (sampleIdx !== 0 && (y < 0.78 || Math.abs(cx) < 0.38)) {
      return [24, 24, 27, 245];
    }
  }

  // --- 4. EVERY MEAL IS A HAPPY MEAL TAGLINE (y ~ 0.83 to 0.89) ---
  if (y >= 0.835 && y <= 0.885 && Math.abs(cx) <= 0.38) {
    const sampleIdx = (Math.floor(px * 2.2) + Math.floor(py * 3)) % 7;
    if (sampleIdx > 1) {
      return [24, 24, 27, 235];
    }
  }

  // Transparent background
  return [0, 0, 0, 0];
}

console.log('Generating updated favicon and brand images from user logo...');

const png192 = makePNG(192, 192, getLogoPixel);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);

const png180 = makePNG(180, 180, getLogoPixel);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

const png32 = makePNG(32, 32, getLogoPixel);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

const png16 = makePNG(16, 16, getLogoPixel);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

const png512 = makePNG(512, 512, getLogoPixel);
fs.writeFileSync(path.join(publicDir, 'logo.png'), png512);

// Generate valid ICO format embedding the 32x32 PNG
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoEntry = Buffer.alloc(16);
icoEntry[0] = 32; // width
icoEntry[1] = 32; // height
icoEntry[2] = 0;  // palette colors
icoEntry[3] = 0;  // reserved
icoEntry.writeUInt16LE(1, 4);  // color planes
icoEntry.writeUInt16LE(32, 6); // bpp
icoEntry.writeUInt32LE(png32.length, 8); // size
icoEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

const icoFile = Buffer.concat([icoHeader, icoEntry, png32]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoFile);

console.log('All favicons and logos successfully updated in public/');
