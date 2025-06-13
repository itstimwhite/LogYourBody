const THREE = require("three");
const { createCanvas } = require("canvas");
const gl = require("gl");
const fs = require("fs").promises;
const path = require("path");

console.log("🎨 Testing basic avatar rendering setup...");

async function testRender() {
  try {
    // Create a simple scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d0d);

    // Create camera
    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Create a simple cylinder (torso)
    const geometry = new THREE.CylinderGeometry(0.4, 0.35, 1.8, 16, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);

    // Create wireframe
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wireframe = new THREE.LineSegments(
      wireframeGeometry,
      wireframeMaterial,
    );

    scene.add(wireframe);

    // Create headless renderer
    const canvas = createCanvas(512, 512);
    const context = gl(512, 512, { preserveDrawingBuffer: true });

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: context,
      preserveDrawingBuffer: true,
    });

    renderer.setSize(512, 512);
    renderer.setClearColor(0x0d0d0d, 1.0);
    renderer.render(scene, camera);

    // Save test image
    const outputDir = path.join(process.cwd(), "public", "avatars");
    await fs.mkdir(outputDir, { recursive: true });

    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(path.join(outputDir, "test_avatar.png"), buffer);

    console.log("✅ Test render completed successfully!");
    console.log("📁 Test image saved to: public/avatars/test_avatar.png");
  } catch (error) {
    console.error("❌ Test render failed:", error);
    process.exit(1);
  }
}

testRender();
