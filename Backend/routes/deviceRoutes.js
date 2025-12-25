import express from 'express';
import { 
  saveDeviceToken, 
  removeDeviceToken, 
  getUserDevices 
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Save/update device token (App install/login pe call hoga)
router.post('/save-token', protect, saveDeviceToken);

// Remove token (App uninstall/logout pe)
router.delete('/:token', protect, removeDeviceToken);

// Get user's devices
router.get('/my-devices', protect, getUserDevices);

export default router;