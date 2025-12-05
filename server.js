const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.webp': 'image/webp'
};

http.createServer(function (request, response) {
    console.log('request ', request.url);

    // API: GET /api/products
    if (request.url === '/api/products' && request.method === 'GET') {
        fs.readFile('./products.json', 'utf8', (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Could not read products' }));
            } else {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(data);
            }
        });
        return;
    }

    // API: POST /api/products
    if (request.url === '/api/products' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                const newProduct = JSON.parse(body);
                fs.readFile('./products.json', 'utf8', (err, data) => {
                    let products = [];
                    if (!err && data) {
                        products = JSON.parse(data);
                    }
                    // Simple ID generation
                    newProduct.id = Date.now();
                    products.push(newProduct);

                    fs.writeFile('./products.json', JSON.stringify(products, null, 2), (err) => {
                        if (err) {
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ error: 'Could not save product' }));
                        } else {
                            response.writeHead(201, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify(newProduct));
                        }
                    });
                });
            } catch (e) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    let filePath = '.' + decodeURI(request.url);
    if (filePath == './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('404 Not Found', 'utf-8');
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(port);
console.log(`Server running at http://127.0.0.1:${port}/`);
