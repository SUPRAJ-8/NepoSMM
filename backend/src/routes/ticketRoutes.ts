import { Router } from 'express';
import {
    createTicket,
    getUserTickets,
    getTicketMessages,
    addMessage,
    closeTicket,
    getAllTickets
} from '../controllers/ticketController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// User routes
router.post('/', createTicket);
router.get('/', getUserTickets);
router.get('/:ticketId', getTicketMessages);
router.post('/:ticketId/messages', addMessage);
router.put('/:ticketId/close', closeTicket);

// Admin routes
router.get('/admin/all', authorize(['admin']), getAllTickets);

export default router;
