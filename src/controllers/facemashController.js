const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const GCS_BUCKET = process.env.GCS_BUCKET;
const GCS_KEYFILE = process.env.GCS_KEYFILE || undefined;
const storage = new Storage(GCS_KEYFILE ? { keyFilename: GCS_KEYFILE } : {});
const bucket = storage.bucket(GCS_BUCKET);

const dataPath = path.join(__dirname, '../../data.json');

function readData() {
    if (!fs.existsSync(dataPath)) return [];
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${GCS_BUCKET}/${filename}`;
}

class FacemashController {
    async getAllUsers(req, res) {
        const users = readData();
        res.json(users);
    }

    async uploadUser(req, res) {
        const { name } = req.body;
        if (!name || !req.file) {
            return res.status(400).json({ error: 'Name and image are required.' });
        }
        // Upload file to GCS
        const gcsFilename = Date.now() + '-' + req.file.originalname;
        const blob = bucket.file(gcsFilename);
        const stream = blob.createWriteStream({ resumable: false, contentType: req.file.mimetype });
        stream.on('error', err => {
            console.error('GCS upload error:', err);
            return res.status(500).json({ error: 'Failed to upload image.' });
        });
        stream.on('finish', async () => {
            await blob.makePublic();
            const imageUrl = getPublicUrl(gcsFilename);
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
        });
        stream.end(req.file.buffer);
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
        // Delete image from GCS
        const imageUrl = users[userIndex].imageUrl;
        if (imageUrl && imageUrl.includes(`https://storage.googleapis.com/${GCS_BUCKET}/`)) {
            const gcsFilename = imageUrl.split(`/`).pop();
            try { await bucket.file(gcsFilename).delete(); } catch (e) { console.error('DeleteUser: Failed to delete GCS image', e); }
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
