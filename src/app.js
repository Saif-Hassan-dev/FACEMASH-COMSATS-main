require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const facemashRoutes = require('./routes/facemashRoutes');
const path = require('path');
const fs = require('fs');

const app = express(); // ✅ Define app FIRST!
const PORT = process.env.PORT || 3002;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

facemashRoutes(app); // ✅ Register routes AFTER app is defined

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123';
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Wrong password' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});