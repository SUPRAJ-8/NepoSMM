import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Authenticated users can upload files (for payment proof etc)
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
