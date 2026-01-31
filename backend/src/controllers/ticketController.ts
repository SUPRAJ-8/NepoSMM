import { Request, Response } from 'express';
import { query } from '../config/db';
import logger from '../utils/logger';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createTicket = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { subject, category, message } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required' });
    }

    try {
        await query('BEGIN');

        // Create ticket
        const ticketResult = await query(
            'INSERT INTO tickets (user_id, subject, category, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, subject, category || 'general', 'open']
        );
        const ticket = ticketResult.rows[0];

        // Create first message
        await query(
            'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_admin) VALUES ($1, $2, $3, $4)',
            [ticket.id, userId, message, false]
        );

        await query('COMMIT');

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error creating ticket:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserTickets = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT * FROM tickets WHERE user_id = $1 ORDER BY updated_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching user tickets:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getTicketMessages = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { ticketId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify ownership or admin
        const ticketRes = await query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const ticket = ticketRes.rows[0];
        if (ticket.user_id !== userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const messagesRes = await query(
            `SELECT tm.*, u.username as sender_name 
             FROM ticket_messages tm 
             JOIN users u ON tm.sender_id = u.id 
             WHERE tm.ticket_id = $1 
             ORDER BY tm.created_at ASC`,
            [ticketId]
        );

        res.json({
            ticket,
            messages: messagesRes.rows
        });
    } catch (err) {
        logger.error('Error fetching ticket messages:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const addMessage = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Verify ownership or admin
        const ticketRes = await query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const ticket = ticketRes.rows[0];
        const isAdmin = authReq.user?.role === 'admin';

        if (ticket.user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await query('BEGIN');

        // Add message
        await query(
            'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_admin) VALUES ($1, $2, $3, $4)',
            [ticketId, userId, message, isAdmin]
        );

        // Update ticket status and updated_at
        const newStatus = isAdmin ? 'pending' : 'open'; // If admin replies, set to pending (waiting for user), though usually admin sets it to answered. Let's use 'open' if user replies, 'answered' if admin replies.

        await query(
            'UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [isAdmin ? 'answered' : 'open', ticketId]
        );

        await query('COMMIT');

        res.status(201).json({ message: 'Message added successfully' });
    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error adding ticket message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const closeTicket = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { ticketId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const ticketRes = await query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const ticket = ticketRes.rows[0];
        if (ticket.user_id !== userId && authReq.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await query('UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['closed', ticketId]);

        res.json({ message: 'Ticket closed successfully' });
    } catch (err) {
        logger.error('Error closing ticket:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const result = await query(
            `SELECT t.*, u.username, u.email 
             FROM tickets t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.updated_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching all tickets:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
