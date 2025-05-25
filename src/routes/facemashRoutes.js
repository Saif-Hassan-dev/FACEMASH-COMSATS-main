const { FacemashController, getLeaderboard } = require('../controllers/facemashController');
const multer = require('multer');
const path = require('path');

const controller = new FacemashController();

// Multer setup (as before)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

module.exports = (app) => {
    app.get('/api/users', controller.getAllUsers);
    app.post('/api/upload', upload.single('image'), controller.uploadUser);
    app.post('/api/vote', controller.handleVote);
    app.get('/api/leaderboard', getLeaderboard);
    app.post('/api/delete-user', controller.deleteUser.bind(controller)); // Add delete-user endpoint
};