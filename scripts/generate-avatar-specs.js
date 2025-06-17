#!/usr/bin/env node

/**
 * Avatar Generation Specifications
 * 
 * This script generates the specifications for all avatar variants needed.
 * You can use these specs with AI image generation tools like:
 * - OpenAI DALL-E API
 * - Midjourney
 * - Stable Diffusion
 * - Or any other image generation service
 */

const bodyFatPercentages = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const ffmiValues = [15, 17.5, 20, 22.5, 25];
const genders = ['male', 'female'];

// Base prompt template
const basePrompt = `Generate a futuristic-looking white wireframe of a human torso. 
Style: Clean, minimalist, white lines on pure black background.
View: Front-facing torso only (chest to waist).
Details: Show muscle definition and body composition appropriate for:
- Gender: {gender}
- Body Fat: {bodyFat}%
- FFMI: {ffmi}
No face, no limbs, just torso. Pure white wireframe on black background.
High contrast, clean lines, anatomically accurate proportions.`;

// Generate all specifications
const specs = [];

genders.forEach(gender => {
  ffmiValues.forEach(ffmi => {
    bodyFatPercentages.forEach(bodyFat => {
      const filename = `${gender}_ffmi${ffmi.toString().replace('.', '_')}_bf${bodyFat}.png`;
      const prompt = basePrompt
        .replace('{gender}', gender)
        .replace('{bodyFat}', bodyFat)
        .replace('{ffmi}', ffmi);
      
      specs.push({
        filename,
        gender,
        bodyFat,
        ffmi,
        prompt,
        path: `public/avatars-new/${gender}/ffmi${ffmi.toString().replace('.', '_')}/${filename}`
      });
    });
  });
});

// Output the specifications
console.log('Avatar Generation Specifications');
console.log('================================');
console.log(`Total images needed: ${specs.length}`);
console.log('');

// Group by gender and FFMI for easier batch generation
genders.forEach(gender => {
  console.log(`\n${gender.toUpperCase()} AVATARS`);
  console.log('-------------------');
  
  ffmiValues.forEach(ffmi => {
    console.log(`\nFFMI ${ffmi}:`);
    bodyFatPercentages.forEach(bodyFat => {
      const spec = specs.find(s => 
        s.gender === gender && s.ffmi === ffmi && s.bodyFat === bodyFat
      );
      console.log(`- ${spec.filename}`);
    });
  });
});

// Save specifications to JSON for programmatic use
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'public', 'avatars-new', 'generation-specs.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`\nSpecifications saved to: ${outputPath}`);
console.log('\nExample prompt for male, 15% body fat, FFMI 20:');
console.log('------------------------------------------------');
const exampleSpec = specs.find(s => 
  s.gender === 'male' && s.ffmi === 20 && s.bodyFat === 15
);
console.log(exampleSpec.prompt);

// Create a CSV for batch processing
const csvContent = [
  'filename,gender,bodyFat,ffmi,prompt',
  ...specs.map(spec => 
    `"${spec.filename}","${spec.gender}",${spec.bodyFat},${spec.ffmi},"${spec.prompt.replace(/\n/g, ' ')}"`
  )
].join('\n');

const csvPath = path.join(__dirname, '..', 'public', 'avatars-new', 'generation-specs.csv');
fs.writeFileSync(csvPath, csvContent);
console.log(`\nCSV for batch processing saved to: ${csvPath}`);