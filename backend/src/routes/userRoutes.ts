import { Router } from 'express';
import { getUsers, registerUser, loginUser, googleLogin, addFunds, getUserTransactions, getAllTransactions, createDepositRequest, approveTransaction, rejectTransaction, deleteTransaction, getProfile, forgotPassword, resetPassword, refundTransaction, updateProfile, changePassword, toggle2FA, verify2FA } from '../controllers/userController';
import { validate } from '../middlewares/validateMiddleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/userValidation';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/google-login', googleLogin);
router.post('/verify-2fa', verify2FA);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Authenticated routes
router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/toggle-2fa', toggle2FA);
router.get('/transactions', getUserTransactions);
router.post('/deposit-request', createDepositRequest);

// Admin only routes
router.use(authorize(['admin']));

router.get('/', getUsers);
router.get('/all-transactions', getAllTransactions);
router.post('/transactions/:id/approve', authorize(['admin']), approveTransaction);
router.post('/transactions/:id/reject', authorize(['admin']), rejectTransaction);
router.post('/transactions/:id/refund', authorize(['admin']), refundTransaction);
router.delete('/transactions/:id', authorize(['admin']), deleteTransaction);
router.post('/:id/funds', addFunds);

export default router;
