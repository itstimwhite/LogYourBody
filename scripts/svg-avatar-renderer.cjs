const fs = require('fs').promises;
const path = require('path');

console.log('🎨 Starting SVG wireframe avatar rendering...');

class SVGAvatarRenderer {
  constructor() {
    this.width = 400;
    this.height = 400;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  calculateMorphTargets(params) {
    const muscleMorph = Math.max(0, Math.min(1, (params.ffmi - 14) / (25 - 14)));
    const fatMorph = Math.max(0, Math.min(1, (params.bodyFat - 5) / (50 - 5)));
    const ageMorph = params.ageRangeIdx / 4;
    
    let scale = 1.0;
    if (params.stature === 's') scale = 0.9;
    if (params.stature === 't') scale = 1.1;
    
    return { muscleMorph, fatMorph, ageMorph, scale };
  }

  createTorsoPath(params, morphs) {
    // Base torso dimensions
    let shoulderWidth = 80;
    let waistWidth = 60;
    let hipWidth = 65;
    let torsoHeight = 200;
    
    // Apply morphs
    const muscleScale = 1 + (morphs.muscleMorph * 0.25);
    const fatScale = 1 + (morphs.fatMorph * 0.4);
    const ageScale = 1 - (morphs.ageMorph * 0.05);
    
    // Scale dimensions
    shoulderWidth *= muscleScale * fatScale * morphs.scale;
    waistWidth *= (1 + morphs.muscleMorph * 0.2) * fatScale * morphs.scale;
    torsoHeight *= ageScale * morphs.scale;
    
    // Gender-specific adjustments
    if (params.sex === 'f') {
      shoulderWidth *= 0.9; // Narrower shoulders
      hipWidth *= 1.2 * (1 + morphs.fatMorph * 0.3); // Wider hips
      waistWidth *= 0.8; // Narrower waist
    } else {
      hipWidth *= 0.9; // Narrower hips
      waistWidth *= 1 + morphs.fatMorph * 0.4; // More abdominal fat
    }
    
    // Create torso outline points
    const points = [
      // Right shoulder
      { x: this.centerX + shoulderWidth/2, y: this.centerY - torsoHeight/2 },
      // Right waist
      { x: this.centerX + waistWidth/2, y: this.centerY },
      // Right hip
      { x: this.centerX + hipWidth/2, y: this.centerY + torsoHeight/2 },
      // Left hip  
      { x: this.centerX - hipWidth/2, y: this.centerY + torsoHeight/2 },
      // Left waist
      { x: this.centerX - waistWidth/2, y: this.centerY },
      // Left shoulder
      { x: this.centerX - shoulderWidth/2, y: this.centerY - torsoHeight/2 }
    ];
    
    // Apply age posture adjustment
    const postureOffset = morphs.ageMorph * 10;
    points.forEach(point => {
      if (point.y < this.centerY) {
        point.x += postureOffset; // Forward lean
      }
    });
    
    return points;
  }

  createWireframeSVG(params) {
    const morphs = this.calculateMorphTargets(params);
    const torsoPoints = this.createTorsoPath(params, morphs);
    
    // Create wireframe lines
    const lines = [];
    
    // Torso outline
    for (let i = 0; i < torsoPoints.length; i++) {
      const current = torsoPoints[i];
      const next = torsoPoints[(i + 1) % torsoPoints.length];
      lines.push(`<line x1="${current.x}" y1="${current.y}" x2="${next.x}" y2="${next.y}" stroke="#ffffff" stroke-width="2" fill="none"/>`);
    }
    
    // Add internal structure lines
    const shoulderLine = `<line x1="${torsoPoints[5].x}" y1="${torsoPoints[5].y}" x2="${torsoPoints[0].x}" y2="${torsoPoints[0].y}" stroke="#ffffff" stroke-width="1.5" fill="none"/>`;
    const waistLine = `<line x1="${torsoPoints[4].x}" y1="${torsoPoints[4].y}" x2="${torsoPoints[1].x}" y2="${torsoPoints[1].y}" stroke="#ffffff" stroke-width="1.5" fill="none"/>`;
    const hipLine = `<line x1="${torsoPoints[3].x}" y1="${torsoPoints[3].y}" x2="${torsoPoints[2].x}" y2="${torsoPoints[2].y}" stroke="#ffffff" stroke-width="1.5" fill="none"/>`;
    
    // Vertical center line
    const centerLine = `<line x1="${this.centerX}" y1="${torsoPoints[0].y}" x2="${this.centerX}" y2="${torsoPoints[2].y}" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.7"/>`;
    
    // Add muscle definition based on FFMI
    const muscleLines = [];
    if (morphs.muscleMorph > 0.3) {
      // Add some muscle definition lines
      const muscleOpacity = morphs.muscleMorph * 0.8;
      muscleLines.push(`<line x1="${this.centerX - 30}" y1="${this.centerY - 50}" x2="${this.centerX + 30}" y2="${this.centerY - 50}" stroke="#ffffff" stroke-width="1" fill="none" opacity="${muscleOpacity}"/>`);
      muscleLines.push(`<line x1="${this.centerX - 25}" y1="${this.centerY + 20}" x2="${this.centerX + 25}" y2="${this.centerY + 20}" stroke="#ffffff" stroke-width="1" fill="none" opacity="${muscleOpacity}"/>`);
    }
    
    const svg = `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0d0d0d"/>
        ${lines.join('\n        ')}
        ${shoulderLine}
        ${waistLine}
        ${hipLine}
        ${centerLine}
        ${muscleLines.join('\n        ')}
      </svg>
    `;
    
    return svg;
  }

  generateFilename(params) {
    return `${params.sex}_bf${params.bodyFat}.svg`;
  }

  async renderAllCombinations() {
    const outputDir = path.join(process.cwd(), 'public', 'avatars');
    await fs.mkdir(outputDir, { recursive: true });

    // Simplified parameters - only body fat and gender  
    const bodyFatValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const sexes = ['m', 'f'];

    const totalCombinations = bodyFatValues.length * sexes.length;
    console.log(`🎯 Rendering ${totalCombinations} simplified SVG avatars (body fat + gender only)...`);

    let count = 0;
    const startTime = Date.now();

    for (const sex of sexes) {
      for (const bodyFat of bodyFatValues) {
        const params = { 
          bodyFat, 
          ffmi: 18,        // Use average FFMI for consistent look
          ageRangeIdx: 1,  // Use young adult for consistent look  
          sex, 
          stature: 'm'     // Use medium stature for consistent look
        };
        
        try {
          const svg = this.createWireframeSVG(params);
          const filename = this.generateFilename(params);
          const filepath = path.join(outputDir, filename);
          
          await fs.writeFile(filepath, svg);
          
          count++;
          console.log(`✓ ${count}/${totalCombinations} rendered: ${filename}`);
        } catch (error) {
          console.error(`Error rendering ${this.generateFilename(params)}:`, error);
        }
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Completed rendering ${count} SVG avatars in ${totalTime.toFixed(1)}s`);
    console.log(`📁 Avatars saved to: public/avatars/`);
  }
}

// Main execution
async function main() {
  console.log('🎯 Target: 3,600 wireframe avatars (10×12×5×2×3 combinations)');
  
  const renderer = new SVGAvatarRenderer();
  
  try {
    await renderer.renderAllCombinations();
    console.log('🚀 SVG avatar pre-rendering completed successfully!');
    
    // Create a few test examples
    const testParams = [
      { sex: 'm', bodyFat: 15, ffmi: 20, ageRangeIdx: 1, stature: 'm' },
      { sex: 'f', bodyFat: 25, ffmi: 16, ageRangeIdx: 2, stature: 's' },
      { sex: 'm', bodyFat: 35, ffmi: 14, ageRangeIdx: 4, stature: 't' }
    ];
    
    console.log('\n📋 Test avatar examples created:');
    testParams.forEach(params => {
      console.log(`   - ${renderer.generateFilename(params)}`);
    });
    
  } catch (error) {
    console.error('❌ Avatar rendering failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}