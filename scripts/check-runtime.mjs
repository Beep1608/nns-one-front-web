const [major, minor] = process.versions.node.split('.').map(Number);

const isSupported =
  (major === 20 && minor >= 19) ||
  (major === 22 && minor >= 12) ||
  major === 24;

if (!isSupported) {
  console.error(
    `Unsupported Node.js ${process.versions.node}. Use Node.js 20.19+, 22.12+, or 24.x for Angular 21.`
  );
  process.exit(1);
}
