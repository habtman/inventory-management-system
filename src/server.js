const express = require('express');
const db = require('./db');

//const { waitForDb } = require('./db');
const runMigrations = require('./migrate');
const authorize = require('./middleware/authorize');
const { auditLog } = require('./utils/audit');





const app = express();
app.use(express.json());

const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

app.use('/api/v1/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Inventory API is running');
});

app.get('/health', (_, res) => res.json({ ok: true }));


// 🔐 AUTH + ROLE-PROTECTED TRANSFER ENDPOINT
app.post(
  '/api/v1/stock/transfer',
  auth,
  authorize('admin', 'manager'),
  async (req, res) => {
    const { product_id, from_location_id, to_location_id, qty } = req.body;

    const idempotencyKey = req.headers['idempotency-key'];
      if (!idempotencyKey) {
        return res.status(400).json({ error: 'Idempotency-Key required' });
      }


    const schema = z.object({
        product_id: z.number().int().positive(),
        from_location_id: z.number().int().positive(),
        to_location_id: z.number().int().positive(),
        qty: z.number().int().positive()
      }).refine(
        d => d.from_location_id !== d.to_location_id,
        {
          message: 'Source and destination must differ',
          path: ['to_location_id']
        }
      );

schema.parse(req.body);


    app.use((err, req, res, next) => {
      console.error(err);

      if (err.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }

      res.status(500).json({ error: 'Internal server error' });
    });

    // Basic presence & type validation
    if (
      !Number.isInteger(product_id) ||
      !Number.isInteger(from_location_id) ||
      !Number.isInteger(to_location_id) ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Business rule validation
    if (from_location_id === to_location_id) {
      return res.status(400).json({
        error: 'Source and destination locations must differ'
      });
    }

    const client = await db.getClient();

      try {
        await client.query('BEGIN');

        // 1️⃣ Lock and verify stock
        const { rows } = await client.query(
          `SELECT quantity FROM stock
          WHERE product_id=$1 AND location_id=$2
          FOR UPDATE`,
          [product_id, from_location_id]
        );

        if (rows.length === 0 || rows[0].quantity < qty) {
          throw new Error('Insufficient stock');
        }

        // 2️⃣ Deduct from source location
        await client.query(
          `UPDATE stock
          SET quantity = quantity - $1
          WHERE product_id=$2 AND location_id=$3`,
          [qty, product_id, from_location_id]
        );

        // 3️⃣ Add to destination location
        await client.query(
          `INSERT INTO stock (product_id, location_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (product_id, location_id)
          DO UPDATE SET quantity = stock.quantity + EXCLUDED.quantity`,
          [product_id, to_location_id, qty]
        );

        // 4️⃣ ✅ RECORD THE TRANSFER (THIS IS THE ANSWER)
        await client.query(
          `INSERT INTO stock_transfers
          (product_id, from_location_id, to_location_id, quantity, idempotency_key)
          VALUES ($1, $2, $3, $4, $5)`,
          [
            product_id,
            from_location_id,
            to_location_id,
            qty,
            idempotencyKey
          ]
        );

        // 5️⃣ Commit everything together
        await client.query('COMMIT');

        // 6️⃣ Audit log (OUTSIDE the transaction)
        await auditLog({
          userId: req.user.id,
          action: 'STOCK_TRANSFER',
          entity: 'stock',
          entityId: product_id,
          metadata: {
            from_location_id,
            to_location_id,
            quantity: qty
          },
          req
        });

        res.status(201).json({ message: 'Transfer completed' });

      } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({
          error: 'Transfer failed',
          details: err.message
        });
      } finally {
        client.release();
      }

  }
);


const PORT = process.env.PORT || 4000;

(async () => {
  try {
    /*console.log('⏳ Waiting for database...');
    await waitForDb();*/

    console.log('⏳ Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations complete');

    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 API running on ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
})();


