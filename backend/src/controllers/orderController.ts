import { Request, Response } from 'express';
import { query } from '../config/db';
import logger from '../utils/logger';
import { AuthRequest } from '../middlewares/authMiddleware';

const fetchFromProvider = async (api_url: string, api_key: string, body: any) => {
    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                key: api_key.trim(),
                ...body
            }),
        });

        if (!response.ok) {
            throw new Error(`Provider API returned status ${response.status}.`);
        }

        const data = await response.json();
        if (data && data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (err: any) {
        throw new Error(err.message || 'Failed to connect to provider API');
    }
};

export const createOrder = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { serviceId, link, quantity, comments } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Incoming order request:', { userId, serviceId, link, quantity, comments });

        // 1. Parallel fetch for Service Details and User Balance (Speed Optimization)
        const [serviceRes, userRes] = await Promise.all([
            query(
                'SELECT s.*, p.api_url, p.api_key FROM services s JOIN providers p ON s.provider_id = p.id WHERE s.id = $1 AND s.status = \'active\'',
                [serviceId]
            ),
            query('SELECT balance FROM users WHERE id = $1', [userId])
        ]);

        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found or inactive' });
        }

        const service = serviceRes.rows[0];
        const userBalance = Number(userRes.rows[0]?.balance || 0);

        // 2. Validate quantity
        if (quantity < service.min || quantity > service.max) {
            return res.status(400).json({ error: `Quantity must be between ${service.min} and ${service.max}` });
        }

        // 3. Calculate charge
        const charge = (Number(service.rate) * quantity) / 1000;

        // 4. Check user balance
        if (userBalance < charge) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        await query('BEGIN');

        // 5. Subtract balance + Create order + Create transaction (Atomic DB Operations)
        await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [charge, userId]);

        const orderResult = await query(
            'INSERT INTO orders (user_id, service_id, link, quantity, charge, status, start_count, remains) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, serviceId, link, quantity, charge, 'pending', 0, 0]
        );
        const order = orderResult.rows[0];

        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4)',
            [userId, charge, 'spend', `Order #${order.id} for ${service.name}`]
        );

        await query('COMMIT');

        // 6. Respond immediately to the user (Super Fast Response)
        res.status(201).json({
            message: 'Order received and is being processed',
            order: { ...order, status: 'pending' }
        });

        // 7. Fire-and-forget background call to provider
        (async () => {
            try {
                console.log(`Background processing for order #${order.id}...`);
                const providerPayload: any = {
                    action: 'add',
                    service: service.external_service_id,
                    link: link,
                    quantity: quantity
                };

                if (comments) {
                    providerPayload.comments = comments;
                }

                const providerResponse = await fetchFromProvider(service.api_url, service.api_key, providerPayload);

                if (providerResponse && providerResponse.order) {
                    await query('UPDATE orders SET external_order_id = $1, status = $2 WHERE id = $3',
                        [providerResponse.order, 'processing', order.id]
                    );
                    console.log(`Order #${order.id} successfully sent to provider: ${providerResponse.order}`);
                }
            } catch (providerError: any) {
                logger.error(`Background provider call failed for order #${order.id}:`, providerError.message);
                // Note: The order remains in 'pending' status for manual admin intervention or internal retry queue
            }
        })();

    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const syncOrder = async (orderId: number) => {
    try {
        const orderRes = await query(
            `SELECT o.*, p.api_url, p.api_key 
             FROM orders o 
             JOIN services s ON o.service_id = s.id 
             JOIN providers p ON s.provider_id = p.id 
             WHERE o.id = $1 AND o.external_order_id IS NOT NULL`,
            [orderId]
        );

        if (orderRes.rows.length === 0) return null;

        const order = orderRes.rows[0];

        // Skip sync ONLY if in a final definitive state that cannot change (Completed or Partial)
        // We allow 'canceled' to sync in case it was marked canceled locally but completed at provider
        if (['completed', 'partial'].includes(order.status.toLowerCase())) {
            return order;
        }

        const providerStatus = await fetchFromProvider(order.api_url, order.api_key, {
            action: 'status',
            order: order.external_order_id
        });

        if (providerStatus) {
            const newStatus = providerStatus.status?.toLowerCase() || order.status;

            // Robust capture of start_count and remains, handling '0' as a valid value
            const startCount = (providerStatus.start_count !== undefined && providerStatus.start_count !== null)
                ? Number(providerStatus.start_count)
                : (order.start_count || 0);
            const remains = (providerStatus.remains !== undefined && providerStatus.remains !== null)
                ? Number(providerStatus.remains)
                : (order.remains || 0);

            await query(
                'UPDATE orders SET status = $1, start_count = $2, remains = $3 WHERE id = $4',
                [newStatus, startCount, remains, orderId]
            );

            return { ...order, status: newStatus, start_count: startCount, remains: remains };
        }
    } catch (err) {
        logger.error(`Error syncing order #${orderId}:`, err);
    }
    return null;
};

export const refreshOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await syncOrder(Number(id));
    if (updated) {
        res.json(updated);
    } else {
        res.status(404).json({ error: 'Order not found or sync failed' });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(
            `SELECT o.*, s.name as service_name, s.category as service_category 
             FROM orders o 
             LEFT JOIN services s ON o.service_id = s.id 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );

        // Auto-sync active orders
        const orders = result.rows;
        const activeOrders = orders.filter(o =>
            o.external_order_id &&
            !['completed', 'canceled', 'partial'].includes(o.status?.toLowerCase())
        );

        if (activeOrders.length > 0) {
            // Run sync in parallel for first 5 active orders to avoid too much overhead
            await Promise.all(activeOrders.slice(0, 5).map(o => syncOrder(o.id)));

            // Re-fetch to get updated values
            const updatedResult = await query(
                `SELECT o.*, s.name as service_name, s.category as service_category 
                 FROM orders o 
                 LEFT JOIN services s ON o.service_id = s.id 
                 WHERE o.user_id = $1 
                 ORDER BY o.created_at DESC`,
                [userId]
            );
            return res.json(updatedResult.rows);
        }

        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching user orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const result = await query(
            `SELECT o.*, s.name as service_name, u.username, u.email 
             FROM orders o 
             JOIN services s ON o.service_id = s.id 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching all orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const orderRes = await query(
            `SELECT o.*, p.api_url, p.api_key 
             FROM orders o 
             JOIN services s ON o.service_id = s.id 
             JOIN providers p ON s.provider_id = p.id 
             WHERE o.id = $1`,
            [id]
        );

        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderRes.rows[0];

        if (order.status === 'canceled' || order.status === 'completed') {
            return res.status(400).json({ error: `Cannot cancel order with status ${order.status}` });
        }

        if (order.external_order_id) {
            try {
                await fetchFromProvider(order.api_url, order.api_key, {
                    action: 'cancel',
                    order: order.external_order_id
                });
            } catch (providerError: any) {
                console.warn(`Provider cancellation failed for order #${id}:`, providerError.message);
                // We still proceed to mark it as canceled internally if the user requested it, 
                // or we could return error. Most SMM panels don't support auto-cancel via API.
            }
        }

        await query('UPDATE orders SET status = $1 WHERE id = $2', ['canceled', id]);
        res.json({ message: 'Order canceled successfully' });
    } catch (err: any) {
        logger.error(`Error canceling order #${id}:`, err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const refillOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const orderRes = await query(
            `SELECT o.*, p.api_url, p.api_key 
             FROM orders o 
             JOIN services s ON o.service_id = s.id 
             JOIN providers p ON s.provider_id = p.id 
             WHERE o.id = $1`,
            [id]
        );

        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderRes.rows[0];

        if (!order.external_order_id) {
            return res.status(400).json({ error: 'Order has no external ID' });
        }

        const providerResponse = await fetchFromProvider(order.api_url, order.api_key, {
            action: 'refill',
            order: order.external_order_id
        });

        res.json({ message: 'Refill session started', data: providerResponse });
    } catch (err: any) {
        logger.error(`Error refilling order #${id}:`, err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
