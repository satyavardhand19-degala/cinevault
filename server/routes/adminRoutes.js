const express = require('express');
const router = express.Router();
const {
  getAdminMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  permanentDeleteMovie,
  restoreMovie,
  getStats,
  uploadMedia
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(admin);

router.get('/movies', getAdminMovies);
router.post('/movies', addMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.delete('/movies/:id/permanent', permanentDeleteMovie);
router.patch('/movies/:id/restore', restoreMovie);
router.get('/stats', getStats);
router.post('/upload', upload.single('file'), uploadMedia);

module.exports = router;
