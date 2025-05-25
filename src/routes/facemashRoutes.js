const { FacemashController, getLeaderboard } = require('../controllers/facemashController');
const multer = require('multer');

// Use memory storage for multer (for GCS upload)
const upload = multer({ storage: multer.memoryStorage() });

const controller = new FacemashController();

module.exports = (app) => {
    app.get('/api/users', controller.getAllUsers);
    app.post('/api/upload', upload.single('image'), controller.uploadUser);
    app.post('/api/vote', controller.handleVote);
    app.get('/api/leaderboard', getLeaderboard);
    app.post('/api/delete-user', controller.deleteUser.bind(controller)); // Add delete-user endpoint
};