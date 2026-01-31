
const fetch = require('node-fetch');

async function testTemplates() {
    try {
        const response = await fetch('http://localhost:5000/api/email-test/templates');
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Templates:', JSON.stringify(data, null, 2));
        } else {
            const error = await response.json();
            console.log('Error:', error);
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testTemplates();
