const fetch = require('node-fetch');

async function getRentalData() {
    const url = 'https://targon.com/rentals/wrk-ufgxkm54avvi';
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const text = await response.text();
    console.log(text);
}

getRentalData();
