const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Admin Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.json({ success: false, error: 'Username already exists' });
          }
          return res.json({ success: false, error: 'Registration failed' });
        }
        res.json({ success: true, message: 'Admin registered successfully' });
      }
    );
  } catch (error) {
    res.json({ success: false, error: 'Server error' });
  }
});

// Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, results[0].password);
    if (isValidPassword) {
      res.json({ success: true, message: 'Login successful', adminId: results[0].admin_id });
    } else {
      res.json({ success: false, error: 'Invalid credentials' });
    }
  });
});

// Items CRUD
app.get('/api/items', (req, res) => {
  db.query('SELECT * FROM items ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/items', (req, res) => {
  const { item_name, type, weight, price, stock } = req.body;
  db.query(
    'INSERT INTO items (item_name, type, weight, price, stock) VALUES (?, ?, ?, ?, ?)',
    [item_name, type, weight || 0, price, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, item_id: result.insertId });
    }
  );
});

app.put('/api/items/:id', (req, res) => {
  const { item_name, type, weight, price, stock } = req.body;
  db.query(
    'UPDATE items SET item_name=?, type=?, weight=?, price=?, stock=? WHERE item_id=?',
    [item_name, type, weight || 0, price, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Item updated' });
    }
  );
});

app.delete('/api/items/:id', (req, res) => {
  db.query('DELETE FROM items WHERE item_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Item deleted' });
  });
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM customers ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, phone, address } = req.body;
  db.query(
    'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
    [name, phone || '', address || ''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, cust_id: result.insertId });
    }
  );
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, address } = req.body;
  db.query(
    'UPDATE customers SET name=?, phone=?, address=? WHERE cust_id=?',
    [name, phone || '', address || '', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Customer updated' });
    }
  );
});

app.delete('/api/customers/:id', (req, res) => {
  db.query('DELETE FROM customers WHERE cust_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Customer deleted' });
  });
});

// Sales CRUD
app.get('/api/sales', (req, res) => {
  db.query(`
    SELECT s.*, c.name as customer_name, i.item_name 
    FROM sales s 
    JOIN customers c ON s.cust_id = c.cust_id 
    JOIN items i ON s.item_id = i.item_id 
    ORDER BY s.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/sales', (req, res) => {
  const { cust_id, item_id, quantity, total_amount, sale_date } = req.body;
  db.query(
    'INSERT INTO sales (cust_id, item_id, quantity, total_amount, sale_date) VALUES (?, ?, ?, ?, ?)',
    [cust_id, item_id, quantity, total_amount, sale_date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, sale_id: result.insertId });
    }
  );
});

app.put('/api/sales/:id', (req, res) => {
  const { cust_id, item_id, quantity, total_amount, sale_date } = req.body;
  db.query(
    'UPDATE sales SET cust_id=?, item_id=?, quantity=?, total_amount=?, sale_date=? WHERE sale_id=?',
    [cust_id, item_id, quantity, total_amount, sale_date, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Sale updated' });
    }
  );
});

app.delete('/api/sales/:id', (req, res) => {
  db.query('DELETE FROM sales WHERE sale_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Sale deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
