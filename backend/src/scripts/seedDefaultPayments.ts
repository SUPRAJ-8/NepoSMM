import pool from '../config/db';

const seedPaymentMethods = async () => {
    try {
        // Clear existing methods first (optional, but requested to remove "test" ones maybe? No, "test payment is showing" user said)
        // Let's just Add if not exists.

        console.log('Seeding default payment methods...');

        const payments = [
            {
                name: 'Crypto Payments',
                description: 'USDT | BTC | ETH | LTC... (Cryptomus)',
                type: 'crypto',
                bonus_percentage: 5.00,
                charge_fee_percentage: 0.00,
                instructions: JSON.stringify([
                    "We Accept Cryptocurrencies including BTC, ETH, LTC, USDT + more than 30+ cryptocurrencies via Cryptomus.",
                    "You DONT need a Cryptomus account to deposit your funds.",
                    "Currently We are accepting Deposit min 1$ and Maximum Unlimited",
                    "We are offering 5% Bonus with all payment up to $1000",
                    "Its Automatic deposit system."
                ]),
                input_fields: JSON.stringify([
                    { name: "amount", label: "Amount", type: "number", placeholder: "Enter amount (USD)", required: true }
                ]),
                is_active: true
            },
            {
                name: 'Credit/Debit Card',
                description: 'Visa, Mastercard, Amex',
                type: 'card',
                bonus_percentage: 2.00,
                charge_fee_percentage: 0.00,
                instructions: JSON.stringify([
                    "Pay securely with your credit or debit card.",
                    "We accept Visa, Mastercard, and American Express.",
                    "Minimum deposit is $5, Maximum is $5000.",
                    "2% bonus on all card payments.",
                    "Instant processing."
                ]),
                input_fields: JSON.stringify([
                    { name: "amount", label: "Amount", type: "number", placeholder: "Enter amount (USD)", required: true }
                ]),
                is_active: true
            },
            {
                name: 'Fonepay',
                description: 'Scan & Pay',
                type: 'manual',
                bonus_percentage: 0.00,
                charge_fee_percentage: 0.00,
                instructions: JSON.stringify([
                    "⚠️ Please write your username in the remarks while making the payment.",
                    "Payments without a username will not be approved.",
                    "",
                    "Step 1: Make the payment",
                    "Step 2: Take a clear screenshot of the payment",
                    "Step 3: Upload the payment screenshot",
                    "Step 4: Submit the request",
                    "Step 5: Wait for admin verification — your funds will be approved as soon as possible"
                ]),
                input_fields: JSON.stringify([
                    { name: "amount", label: "Amount", type: "number", placeholder: "Enter amount (USD)", required: true },
                    { name: "transaction_id", label: "Transaction ID", type: "text", placeholder: "Enter Transaction ID / Reference", required: true },
                    { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Any additional info", required: false }
                ]),
                is_active: true
            }
        ];

        for (const p of payments) {
            // Check if exists by type
            const exist = await pool.query('SELECT id FROM payment_methods WHERE type = $1', [p.type]);
            if (exist.rows.length === 0) {
                await pool.query(
                    `INSERT INTO payment_methods (name, description, type, bonus_percentage, charge_fee_percentage, instructions, input_fields, is_active) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [p.name, p.description, p.type, p.bonus_percentage, p.charge_fee_percentage, p.instructions, p.input_fields, p.is_active]
                );
                console.log(`Added ${p.name}`);
            } else {
                console.log(`${p.name} already exists.`);
            }
        }
        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error seeding payment methods:', error);
    } finally {
        await pool.end();
    }
};

seedPaymentMethods();
