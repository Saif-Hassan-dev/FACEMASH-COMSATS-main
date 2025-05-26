const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data.json');
const uploadsDir = path.join(__dirname, '../../public/uploads');

function readData() {
    if (!fs.existsSync(dataPath)) return [];
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

class FacemashController {
    async getAllUsers(req, res) {
        const users = readData();
        res.json(users);
    }

    async uploadUser(req, res) {
        const { name } = req.body;
        if (!req.file || !name) {
            return res.status(400).json({ error: 'Image and name are required.' });
        }

        // Save file locally
        const ext = path.extname(req.file.originalname);
        const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, req.file.buffer);

        // Add user to data.json
        const users = readData();
        const newUser = {
            id: Date.now().toString(),
            name,
            imageUrl: `uploads/${filename}`,
            votes: 0
        };
        users.push(newUser);
        writeData(users);

        res.json(newUser);
    }

    async handleVote(req, res) {
        const { id } = req.body;
        const users = readData();
        const user = users.find(u => u.id === id);
        if (user) {
            user.votes = (user.votes || 0) + 1;
            writeData(users);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }

    deleteUser(req, res) {
        const { id } = req.body;
        let users = readData();
        users = users.filter(u => u.id !== id);
        writeData(users);
        res.json({ success: true });
    }
}

function getLeaderboard(req, res) {
    const users = readData();
    const sorted = users.slice().sort((a, b) => b.votes - a.votes);
    res.json(sorted);
}

module.exports = {
    FacemashController,
    getLeaderboard
};