const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Database Files
const USERS_FILE = 'users.json';
const UPLOADS_FILE = 'uploads.json';
const PRODUCTS_FILE = 'products.json';

// Helper to read/write JSON
const readJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// --- ROUTES ---

// Serve HTML Pages
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    console.log('Request for /');
    console.log('Serving file:', filePath);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        console.log('File not found:', filePath);
        res.status(404).send('File not found on server');
    }
});
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/product.html', (req, res) => res.sendFile(path.join(__dirname, 'product.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/Bracelets.html', (req, res) => res.sendFile(path.join(__dirname, 'Bracelets.html')));
app.get('/Earrings.html', (req, res) => res.sendFile(path.join(__dirname, 'Earrings.html')));
app.get('/Necklaces.html', (req, res) => res.sendFile(path.join(__dirname, 'Necklaces.html')));

// API: Register
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

    const newUser = { id: Date.now(), name, email, password }; // In real app, hash password!
    users.push(newUser);
    writeJSON(USERS_FILE, users);

    res.json({ success: true, user: newUser });
});

// API: Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, user });
});

// API: Upload Image
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { prompt, userId } = req.body;

    const uploads = readJSON(UPLOADS_FILE);
    const newUpload = {
        id: Date.now(),
        userId: userId, // Should come from session/token in real app
        filename: req.file.filename,
        prompt: prompt || '',
        date: new Date().toISOString()
    };
    uploads.push(newUpload);
    writeJSON(UPLOADS_FILE, uploads);

    res.json({ success: true, upload: newUpload });
});

// API: Get User Images
app.get('/user/images', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const uploads = readJSON(UPLOADS_FILE);
    const userImages = uploads.filter(u => u.userId == userId);
    res.json(userImages);
});

// API: Get Products (Existing)
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    const category = req.query.category;
    console.log(`API Request: /api/products, Category: ${category}, Total Products: ${products.length}`);
    if (category) {
        const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        console.log(`Filtered Count: ${filtered.length}`);
        res.json(filtered);
    } else {
        res.json(products);
    }
});

// API: Add Product (Existing)
app.post('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    const newProduct = req.body;
    newProduct.id = Date.now();
    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);
    res.json(newProduct);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
