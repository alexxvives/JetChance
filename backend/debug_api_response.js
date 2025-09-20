const http = require('http');

function testFlightsAPI() {
    const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/flights',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('API Response:');
                console.log(JSON.stringify(response, null, 2));
                
                if (response.flights && response.flights.length > 0) {
                    console.log('\nFirst Flight Data:');
                    console.log(JSON.stringify(response.flights[0], null, 2));
                }
            } catch (error) {
                console.error('Parse Error:', error.message);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('API Error:', error.message);
    });

    req.end();
}

testFlightsAPI();