import { useEffect, useMemo, useState } from 'react';
import { fetchStock, type StockRow } from '../api/stock';
import * as XLSX from 'xlsx';



/* ---------------- Types ---------------- */
type SortKey = 'product' | 'location' | 'quantity';
type SortDir = 'asc' | 'desc';

// Export to CSV
function exportToCSV(rows: StockRow[]) {
        if (!rows.length) return;

        const headers = [
            'Product',
            'Location',
            'Quantity'
        ];

        const csvRows = [
            headers.join(','),

            ...rows.map(row =>
            [
                `"${row.product_name}"`,
                `"${row.location_name}"`,
                row.quantity
            ].join(',')
            )
        ];

        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `stock_export_${Date.now()}.csv`;
        link.click();

        URL.revokeObjectURL(url);
        }
 // Export to Excel       
function exportToExcel(rows: StockRow[]) {
        if (!rows.length) return;

        const worksheetData = rows.map(row => ({
            Product: row.product_name,
            Location: row.location_name,
            Quantity: row.quantity
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock');

        XLSX.writeFile(
            workbook,
            `stock_export_${Date.now()}.xlsx`
        );
    }


/* ---------------- Component ---------------- */
export default function StockTable() {
  const [data, setData] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>('product');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);



  /* ---------------- Data Fetch ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const stock = await fetchStock();
        setData(stock);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------------- Sorting ---------------- */
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  /* ---------------- Locations for Filter ---------------- */
  const locations = useMemo(() => {
    return Array.from(new Set(data.map(row => row.location_name)));
  }, [data]);

  /* ---------------- Filter + Sort ---------------- */
  const filtered = useMemo(() => {
    const result = data.filter(row => {
      const matchesSearch =
        row.product_name.toLowerCase().includes(search.toLowerCase()) ||
        row.location_name.toLowerCase().includes(search.toLowerCase());

      const matchesLocation = !location || row.location_name === location;
      const matchesLowStock = !lowStockOnly || row.quantity < 10;

      return matchesSearch && matchesLocation && matchesLowStock;
    });

    result.sort((a, b) => {
      let A: string | number;
      let B: string | number;

      if (sortKey === 'product') {
        A = a.product_name.toLowerCase();
        B = b.product_name.toLowerCase();
      } else if (sortKey === 'location') {
        A = a.location_name.toLowerCase();
        B = b.location_name.toLowerCase();
      } else {
        A = a.quantity;
        B = b.quantity;
      }

      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, location, lowStockOnly, sortKey, sortDir]);
   
    // Reset to first page on filter change    
    useEffect(() => {
        setPage(1);
        }, [search, location, lowStockOnly]);
    
    // Pagination calculations
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);




  /* ---------------- States ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading stock…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Stock Overview</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search product or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />

        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/4"
        >
          <option value="">All locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
          />
          Low stock (&lt; 10)
        </label>
      </div>

        {/* Export Button */}
   <div className="flex flex-wrap items-center justify-between gap-2">
  <h1 className="text-2xl font-bold">Stock Overview</h1>

  <div className="flex gap-2">
    <button
      disabled={filtered.length === 0}
      onClick={() => exportToCSV(filtered)}
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
    >
      Export CSV
    </button>

    <button
      disabled={filtered.length === 0}
      onClick={() => exportToExcel(filtered)}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm disabled:opacity-50"
    >
      Export Excel
    </button>

    {/* disable if no data */}
    
        <button
        disabled={filtered.length === 0}
        onClick={() => exportToCSV(filtered)}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm disabled:opacity-50"
        >
        Export CSV
        </button>
    </div>
</div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <SortableHeader
                label="Product"
                active={sortKey === 'product'}
                dir={sortDir}
                onClick={() => toggleSort('product')}
              />
              <SortableHeader
                label="Location"
                active={sortKey === 'location'}
                dir={sortDir}
                onClick={() => toggleSort('location')}
              />
              <SortableHeader
                label="Quantity"
                active={sortKey === 'quantity'}
                dir={sortDir}
                align="right"
                onClick={() => toggleSort('quantity')}
              />
            </tr>
          </thead>

          <tbody>
            {paginated.map(row => (
              <tr
                key={`${row.product_id}-${row.location_id}`}
                className="hover:bg-gray-50"
              >
                <td className="p-3 border">{row.product_name}</td>
                <td className="p-3 border">{row.location_name}</td>
                <td className="p-3 border text-right">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      row.quantity === 0
                        ? 'bg-red-100 text-red-700'
                        : row.quantity < 10
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {row.quantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No matching stock found
          </div>
        )}

        <button
          onClick={() => {
            setSearch('');
            setLocation('');
            setLowStockOnly(false);
          }}
          className="p-3 text-sm text-indigo-600 hover:underline"
        >
          Clear filters
        </button>
      </div>
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t text-sm">
        <span className="text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1}
            –
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>

        <div className="flex items-center gap-2">
            <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            >
            Prev
            </button>

            <span className="font-medium">
            Page {page} of {totalPages || 1}
            </span>

            <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            >
            Next
            </button>
        </div>
        </div>

    </div>
  );
}

/* ---------------- Sortable Header ---------------- */
interface SortableHeaderProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: 'left' | 'right';
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  align = 'left'
}: SortableHeaderProps) {
  return (
    <th
      onClick={onClick}
      className={`p-3 border cursor-pointer select-none ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          <span className="text-xs">
            {dir === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </span>
    </th>
  );
}
