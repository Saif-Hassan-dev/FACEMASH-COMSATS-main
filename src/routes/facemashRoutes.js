const { FacemashController, getLeaderboard } = require('../controllers/facemashController');
const multer = require('multer');

// Use memory storagee for multer (for GCS upload)
const upload = multer({ storage: multer.memoryStorage() });

const controllers = new FacemashController();
//module thingy

module.exports = (app) => {
    app.get('/api/users', controllers.getAllUsers);
    app.post('/api/upload', upload.single('image'), controllers.uploadUser);
    app.post('/api/vote', controllers.handleVote);
    app.get('/api/leaderboard', getLeaderboard);
    app.post('/api/delete-user', controllers.deleteUser.bind(controllers)); // Add delete-user endpoint
};
