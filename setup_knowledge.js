const fs = require('fs');
const path = require('path');

const dirs = [
    'knowledge/legal',
    'knowledge/local_guidance',
    'knowledge/school_plan',
    'knowledge/textbooks',
    'knowledge/templates',
    'knowledge/question_bank',
    'app',
    'components',
    'features',
    'lib',
    'services',
    'types',
    'database',
    'prompts',
    'validators',
    'export',
    'tests'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(__dirname, d), { recursive: true });
});

console.log('All modular directories created successfully.');
