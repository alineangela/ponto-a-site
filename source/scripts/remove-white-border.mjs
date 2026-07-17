import sharp from "sharp";

const [input, output] = process.argv.slice(2);
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const seen = new Uint8Array(info.width * info.height);
const queue = [];
const pale = (i) => data[i] > 226 && data[i + 1] > 226 && data[i + 2] > 226 && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 18;
const add = (x, y) => { if (x < 0 || y < 0 || x >= info.width || y >= info.height) return; const p = y * info.width + x; if (seen[p] || !pale(p * 4)) return; seen[p] = 1; queue.push(p); };
for (let x = 0; x < info.width; x += 1) { add(x, 0); add(x, info.height - 1); }
for (let y = 0; y < info.height; y += 1) { add(0, y); add(info.width - 1, y); }
for (let q = 0; q < queue.length; q += 1) { const p = queue[q]; const x = p % info.width; const y = Math.floor(p / info.width); add(x - 1, y); add(x + 1, y); add(x, y - 1); add(x, y + 1); }
for (let p = 0; p < seen.length; p += 1) if (seen[p]) data[p * 4 + 3] = 0;
await sharp(data, { raw: info }).png().toFile(output);
