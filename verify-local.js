const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');
const source = `${html}\n${css}`;
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const inventory = walk('assets').filter((file) => imageExtensions.has(path.extname(file).toLowerCase())).sort();
const imageRefs = [...source.matchAll(/assets\/images\/[^"'\s)]+/g)].map((match) => match[0]).filter((value, index, all) => all.indexOf(value) === index).sort();
const missing = imageRefs.filter((reference) => !fs.existsSync(reference));
const remoteImages = source.match(/https?:\/\/[^"'\s)]+\.(?:jpg|jpeg|png|webp|gif|svg)/gi) || [];
const htmlRefs = [...html.matchAll(/(?:src|href)=["'](assets\/images\/[^"']+)["']/g)].map((match) => match[1]);
const checks = {
  twelveLocalImages: inventory.length === 12,
  allReferencedImagesExist: missing.length === 0,
  heroUsesExistingLocalImage: /<img class="hero-media" src="assets\/images\//.test(html) && fs.existsSync((html.match(/<img class="hero-media" src="([^"]+)"/) || [])[1] || ''),
  noRemoteImageUrls: remoteImages.length === 0,
  noStoneNamePlaceholder: !/Stone name/i.test(`${html}\n${css}\n${js}`),
  noFrontendSecrets: !/(api[_-]?key|secret|password|token)\s*[:=]/i.test(`${html}\n${css}\n${js}`),
  materialsHaveExistingImages: [...html.matchAll(/<article class="stone-card"[\s\S]*?<\/article>/g)].every((card) => {
    const match = card[0].match(/<img src="([^"]+)"/);
    return match && fs.existsSync(match[1]);
  }),
  requiredInteractionHooksPresent: ['.filter', '.view-material', '.request-stone', 'attachments', 'DataTransfer', 'selectedFiles.splice', 'materialDialog.showModal'].every((hook) => js.includes(hook)),
  responsiveRulesPresent: /@media\s*\(/.test(css),
};

console.log(JSON.stringify({ inventory, imageCount: inventory.length, referencedImages: imageRefs, htmlImageReferenceCount: htmlRefs.length, missing, remoteImages, checks }, null, 2));
if (!Object.values(checks).every(Boolean)) process.exit(1);
