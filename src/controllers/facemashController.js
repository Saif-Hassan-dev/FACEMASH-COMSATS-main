const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../../data.json');

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
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        if (!name || !imageUrl) {
            return res.status(400).json({ error: 'Name and image are required.' });
        }
        const users = readData();
        const user = {
            id: Date.now().toString(),
            name,
            imageUrl,
            votes: 0
        };
        users.push(user);
        writeData(users);
        res.json(user);
    }

    async handleVote(req, res) {
        const { winnerId } = req.body;
        const users = readData();
        const user = users.find(u => u.id === winnerId);
        if (user) {
            user.votes += 1;
            writeData(users);
            res.json({ message: 'Vote recorded', user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }

    async deleteUser(req, res) {
        const { id } = req.body;
        if (!id) {
            console.error('DeleteUser: No id in body', req.body);
            return res.status(400).json({ error: 'No user id provided.' });
        }
        let users = readData();
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            console.error('DeleteUser: User not found', id);
            return res.status(404).json({ error: 'User not found' });
        }
        // Optionally delete the image file
        const imagePath = users[userIndex].imageUrl ? path.join(__dirname, '../../public', users[userIndex].imageUrl) : null;
        if (imagePath && fs.existsSync(imagePath)) {
            try { fs.unlinkSync(imagePath); } catch (e) { console.error('DeleteUser: Failed to delete image', e); }
        }
        users.splice(userIndex, 1);
        writeData(users);
        res.json({ message: 'User deleted' });
    }
}

function getLeaderboard(req, res) {
    const users = readData();
    users.sort((a, b) => b.votes - a.votes);
    res.json(users);
}

module.exports = {
    FacemashController,
    getLeaderboard
};
