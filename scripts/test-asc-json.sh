#!/bin/bash

echo "Testing ASC API Key JSON format..."

# Create a test JSON file
cat > test_asc.json << 'EOF'
{"key_id":"A76CPV6UUL","issuer_id":"c195f569-ff16-40fa-aaff-4fe94e8139ad","key":"-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgX+9p5JYj1dqGLqLr\n8CB3UlnMs0BBi+qw8pDl0gLlNcigCgYIKoZIzj0DAQehRANCAATn8smgverE5wVl\nqLjMUKyabZRClj0dBSmWYRhZLlNRKDOT0K7joMOyBahlJts1oA6rZLATULdmr3BM\ndPqjz5sV\n-----END PRIVATE KEY-----","in_house":false}
EOF

# Check if JSON is valid
echo "Validating JSON..."
if jq . test_asc.json > /dev/null 2>&1; then
    echo "✅ JSON is valid"
    echo ""
    echo "Parsed values:"
    echo "key_id: $(jq -r .key_id test_asc.json)"
    echo "issuer_id: $(jq -r .issuer_id test_asc.json)"
    echo "in_house: $(jq -r .in_house test_asc.json)"
    echo ""
    echo "Key (first 50 chars): $(jq -r .key test_asc.json | head -c 50)..."
else
    echo "❌ JSON is invalid"
fi

# Test with ruby (what Fastlane uses)
echo ""
echo "Testing with Ruby (Fastlane's language)..."
ruby -e "
require 'json'
begin
  data = JSON.parse(File.read('test_asc.json'))
  puts '✅ Ruby can parse the JSON'
  puts \"key_id: #{data['key_id']}\"
  puts \"issuer_id: #{data['issuer_id']}\"
rescue => e
  puts '❌ Ruby error: ' + e.message
end
"

rm -f test_asc.json