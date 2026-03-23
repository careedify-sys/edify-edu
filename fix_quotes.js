const fs = require('fs');

const file = 'lib/data.ts';
let content = fs.readFileSync(file, 'utf8');

// The bug caused strings like 'Supply Chain, Logistics' to become ''Supply Chain', 'Logistics''
// e.g. ''Supply Chain', 'Production & Operations Management''
// We can fix this by replacing '' with ' EXCEPT when it's an empty string '' (which is rare but possible)

content = content.replace(/''([A-Za-z])/g, "'$1");
content = content.replace(/([A-Za-z\)])''/g, "$1'");

// Also handle the spaces: ' Re', ' Accounting'
// Wait, the errors said: Cannot find name 'Banking' at 'Banking & Finance''
content = content.replace(/''([^']*)',\s*'([^']*)''/g, "'$1, $2'");
content = content.replace(/''([^']*)',\s*'([^']*)',\s*'([^']*)''/g, "'$1, $2, $3'");
content = content.replace(/''([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)''/g, "'$1, $2, $3, $4'");

// If there are still lingering '' before or after words:
content = content.replace(/''([A-Za-z0-9])/g, "'$1");
content = content.replace(/([A-Za-z0-9\)])''/g, "$1'");

fs.writeFileSync(file, content);
console.log('Fixed quotes in ' + file);
