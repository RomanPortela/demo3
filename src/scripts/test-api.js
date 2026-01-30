const https = require('https');

const fetchDolar = (type) => {
    https.get(`https://dolarapi.com/v1/dolares/${type}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`--- ${type.toUpperCase()} ---`);
            console.log(data);
        });
    }).on('error', err => console.error(err));
};

fetchDolar('blue');
fetchDolar('oficial');
