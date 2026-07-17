import sharp from "sharp";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node scripts/remove-green.mjs input output");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const greenDominance = g - Math.max(r, b);
  const alpha = Math.max(0, Math.min(255, 255 - (greenDominance - 18) * 4.8));
  data[i + 3] = Math.min(data[i + 3], alpha);
  if (alpha > 0 && alpha < 255) data[i + 1] = Math.min(g, Math.max(r, b));
}

await sharp(data, { raw: info }).png().toFile(output);
