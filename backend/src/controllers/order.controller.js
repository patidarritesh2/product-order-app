const { pool } = require('../db/mysql');
const Product = require('../models/product.model');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const toOrder = (r) => ({
  orderId: r.order_id,
  userId: r.user_id,
  productIds: typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids,
  totalAmount: Number(r.total_amount),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function parseOrderId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid order id');
  return id;
}

async function priceOrder(productIds) {
  const unique = [...new Set(productIds)];
  const products = await Product.find({ _id: { $in: unique } });
  const priceById = new Map(products.map((p) => [String(p._id), p.price]));

  const missing = unique.filter((id) => !priceById.has(id));
  if (missing.length) throw new HttpError(400, `Unknown product id(s): ${missing.join(', ')}`);

  const cents = productIds.reduce((sum, id) => sum + Math.round(priceById.get(id) * 100), 0);
  return cents / 100;
}

async function fetchOwnOrder(orderId, userId) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ? AND user_id = ?', [
    orderId,
    userId,
  ]);
  if (!rows.length) throw new HttpError(404, 'Order not found');
  return toOrder(rows[0]);
}

exports.list = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC', [
    req.user.id,
  ]);
  res.json(rows.map(toOrder));
});

exports.get = asyncHandler(async (req, res) => {
  res.json(await fetchOwnOrder(parseOrderId(req.params.id), req.user.id));
});

exports.create = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  const totalAmount = await priceOrder(productIds);
  const [result] = await pool.query(
    'INSERT INTO orders (user_id, product_ids, total_amount) VALUES (?, ?, ?)',
    [req.user.id, JSON.stringify(productIds), totalAmount]
  );
  res.status(201).json(await fetchOwnOrder(result.insertId, req.user.id));
});

exports.update = asyncHandler(async (req, res) => {
  const orderId = parseOrderId(req.params.id);
  await fetchOwnOrder(orderId, req.user.id); // 404 if missing / not yours

  const { productIds } = req.body;
  const totalAmount = await priceOrder(productIds);
  await pool.query(
    'UPDATE orders SET product_ids = ?, total_amount = ? WHERE order_id = ? AND user_id = ?',
    [JSON.stringify(productIds), totalAmount, orderId, req.user.id]
  );
  res.json(await fetchOwnOrder(orderId, req.user.id));
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM orders WHERE order_id = ? AND user_id = ?', [
    parseOrderId(req.params.id),
    req.user.id,
  ]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Order not found');
  res.status(204).end();
});
