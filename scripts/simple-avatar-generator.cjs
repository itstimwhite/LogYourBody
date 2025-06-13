const fs = require('fs').promises;
const path = require('path');

console.log('🎨 Generating avatar filenames for 3,600 combinations...');

async function generateAvatarPlaceholders() {
  const outputDir = path.join(process.cwd(), 'public', 'avatars');
  await fs.mkdir(outputDir, { recursive: true });

  const bodyFatValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const ffmiValues = Array.from({ length: 12 }, (_, i) => 14 + i); // 14 to 25
  const ageRangeIndices = [0, 1, 2, 3, 4];
  const sexes = ['m', 'f'];
  const statures = ['s', 'm', 't'];

  const totalCombinations = bodyFatValues.length * ffmiValues.length * ageRangeIndices.length * sexes.length * statures.length;
  console.log(`Creating ${totalCombinations} avatar placeholders...`);

  let count = 0;
  const filenames = [];

  for (const sex of sexes) {
    for (const bodyFat of bodyFatValues) {
      for (const ffmi of ffmiValues) {
        for (const ageRangeIdx of ageRangeIndices) {
          for (const stature of statures) {
            const filename = `${sex}_bf${bodyFat}_ffmi${ffmi}_age${ageRangeIdx}_${stature}.png`;
            filenames.push(filename);
            count++;
          }
        }
      }
    }
  }

  // Write the list of filenames to a JSON file for reference
  await fs.writeFile(
    path.join(outputDir, 'avatar-manifest.json'),
    JSON.stringify({ 
      total: count,
      expectedTotal: totalCombinations,
      filenames: filenames.slice(0, 10), // Show first 10 as examples
      parameters: {
        bodyFat: bodyFatValues,
        ffmi: ffmiValues,
        ageRangeIndices: ageRangeIndices,
        sexes: sexes,
        statures: statures
      }
    }, null, 2)
  );

  console.log(`✅ Generated manifest for ${count} avatars`);
  console.log(`📁 Manifest saved to: public/avatars/avatar-manifest.json`);
  console.log(`📋 Examples:`);
  filenames.slice(0, 5).forEach(name => console.log(`   - ${name}`));
  
  return filenames;
}

// Main execution
generateAvatarPlaceholders()
  .then(() => {
    console.log('🚀 Avatar manifest generation completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });