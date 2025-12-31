import api from './client';

export interface TransferStockPayload {
  product_id: number;
  from_location_id: number;
  to_location_id: number;
  qty: number;
}

export interface StockRow {
  product_id: number;
  product_name: string;
  location_id: number;
  location_name: string;
  quantity: number;
}

export async function fetchStock(): Promise<StockRow[]> {
  const res = await api.get('/stock');
  return res.data;
}


export async function transferStock(
  payload: TransferStockPayload,
  idempotencyKey: string
) {
  const res = await api.post(
    '/stock/transfer',
    payload,
    {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    }
  );

  return res.data;
}
