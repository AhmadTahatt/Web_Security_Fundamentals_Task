const pool = require("../config/database");

const ORDER_COLUMNS =
  "id, user_id, status, total_amount, shipping_address, notes, created_at, updated_at";

async function getOrders(req, res, next) {
  try {
    const isAdmin = req.user.role === "admin";

    const result = isAdmin
      ? await pool.query(`SELECT ${ORDER_COLUMNS} FROM orders ORDER BY id DESC`)
      : await pool.query(
          `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = $1 ORDER BY id DESC`,
          [req.user.id]
        );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const isAdmin = req.user.role === "admin";

    // Ownership is part of the query, so another user's order looks
    // exactly like an order that does not exist.
    const orderResult = isAdmin
      ? await pool.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1`, [orderId])
      : await pool.query(
          `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1 AND user_id = $2`,
          [orderId, req.user.id]
        );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const itemsResult = await pool.query(
      `SELECT oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price, oi.subtotal
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      data: { ...orderResult.rows[0], items: itemsResult.rows }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getOrders, getOrderById };