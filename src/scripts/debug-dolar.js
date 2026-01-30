const https = require('https');

https.get('https://dolarhoy.com/', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        // Print a relevant chunk where "Dólar Blue" appears
        const index = data.indexOf('Dólar Blue');
        if (index !== -1) {
            console.log('--- BLUE FOUND ---');
            console.log(data.substring(index, index + 1000));
        } else {
            console.log('--- BLUE NOT FOUND ---');
            console.log(data.substring(0, 2000)); // Log head if not found
        }

        const indexOfficial = data.indexOf('Dólar Oficial');
        if (indexOfficial !== -1) {
            console.log('--- OFFICIAL FOUND ---');
            console.log(data.substring(indexOfficial, indexOfficial + 1000));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
