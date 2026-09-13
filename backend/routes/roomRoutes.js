import express from 'express';
import * as roomController from '../controllers/roomController.js';

const router = express.Router();

// Create a new room
router.post('/', roomController.createRoom);

// Get room details by 6-digit code
router.get('/:code', roomController.getRoom);

// Join an existing room
router.post('/:code/join', roomController.joinRoom);

// Update ready status
router.post('/:code/ready', roomController.updateReady);

// Request rematch
router.post('/:code/rematch', roomController.requestRematch);

// Leave/delete room
router.delete('/:code', roomController.leaveRoom);

export default router;
