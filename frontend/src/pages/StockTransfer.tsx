import { useState } from 'react';
import { transferStock } from '../api/stock';

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export default function StockTransfer() {
  const [form, setForm] = useState({
    product_id: '',
    from_location_id: '',
    to_location_id: '',
    qty: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await transferStock(
        {
          product_id: Number(form.product_id),
          from_location_id: Number(form.from_location_id),
          to_location_id: Number(form.to_location_id),
          qty: Number(form.qty)
        },
        generateIdempotencyKey()
      );

      setSuccess('Stock transferred successfully');
      setForm({
        product_id: '',
        from_location_id: '',
        to_location_id: '',
        qty: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Stock Transfer</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-3">
          {success}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="number"
          name="product_id"
          placeholder="Product ID"
          value={form.product_id}
          onChange={update}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          name="from_location_id"
          placeholder="From Location ID"
          value={form.from_location_id}
          onChange={update}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          name="to_location_id"
          placeholder="To Location ID"
          value={form.to_location_id}
          onChange={update}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          min={1}
          name="qty"
          placeholder="Quantity"
          value={form.qty}
          onChange={update}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Transfer Stock'}
        </button>
      </form>
    </div>
  );
}
