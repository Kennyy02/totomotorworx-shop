const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const port = process.env.PORT || 4000;
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

require('dotenv').config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // your React app URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  decimalNumbers: true,
});

db.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// Multer storage config
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });

app.use('/images', express.static('upload/images'));

// Upload image
app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Add product
app.post("/addproduct", (req, res) => {
  const { name, image, category, new_price, old_price } = req.body;
  const date = new Date();
  const available = true;

  const getLastIdQuery = "SELECT id FROM product ORDER BY id DESC LIMIT 1";
  db.query(getLastIdQuery, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch latest product ID" });

    let newId = results.length > 0 ? results[0].id + 1 : 1;

    const insertQuery = `
      INSERT INTO product (id, name, image, category, new_price, old_price, date, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [
      newId, name, image, category, new_price, old_price, date, available
    ], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to insert product" });
      res.json({ success: true, message: "Product added", insertId: result.insertId });
    });
  });
});

// Get all products (legacy route, not used for pagination)
app.get("/products", (req, res) => {
  db.query("SELECT * FROM product", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch products" });
    res.json(results);
  });
});

// Paginated products endpoint
app.get("/products_paginated", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM product";
    const dataQuery = "SELECT * FROM product ORDER BY id DESC LIMIT ? OFFSET ?";

    db.query(countQuery, (err, countResults) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch product count" });
        }
        const totalProducts = countResults[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        db.query(dataQuery, [limit, offset], (err, productResults) => {
            if (err) {
                return res.status(500).json({ error: "Failed to fetch products for page" });
            }
            res.json({
                products: productResults,
                page,
                totalPages,
                totalProducts
            });
        });
    });
});

// Remove product
app.post('/removeproduct', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Product id required" });

  db.query("DELETE FROM product WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to remove product" });
    res.json({ success: true });
  });
});

// Signup (with bcrypt password hashing)
// --- Replace your existing /signup route with this block ---
app.post('/signup', async (req, res) => {
    const { username, email, password, consent } = req.body;

    // Basic input validation
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, errors: "Missing required fields" });
    }

    // Consent is required
    if (consent !== true) {
        return res.status(400).json({ success: false, errors: "You must agree to the Terms and Privacy Statement to register." });
    }

    // Password policy enforcement (same as client)
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!pwdRe.test(password)) {
        return res.status(400).json({ success: false, errors: "Password does not meet complexity requirements." });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Error during user lookup:", err);
            return res.status(500).json({ success: false, errors: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, errors: "User with this email already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            // initialize empty cart; avoid big prepopulated object for performance
            const cartData = JSON.stringify({});

            db.query(
                "INSERT INTO users (name, email, password, cartData, date, isAdmin) VALUES (?, ?, ?, ?, NOW(), ?)",
                [username, email, hashedPassword, cartData, 0],
                (err, result) => {
                    if (err) {
                        console.error("Error inserting user:", err);
                        return res.status(500).json({ success: false, errors: "Error inserting user" });
                    }

                    const token = jwt.sign({ user: { id: result.insertId, isAdmin: false } }, 'secret_ecom', { expiresIn: '7d' });
                    res.json({ success: true, 'auth-token': token });
                }
            );
        } catch (hashError) {
            console.error("Hashing error:", hashError);
            res.status(500).json({ success: false, errors: "Internal server error during password hashing" });
        }
    });
});

// Login Route (with bcrypt password comparison)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, errors: "Email and password are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ success: false, errors: "Database error" });

        if (results.length === 0) {
            return res.status(400).json({ success: false, errors: "Wrong Email ID" });
        }

        const user = results[0];
        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ success: false, errors: "Wrong Password" });
            }

            const isAdmin = user.isAdmin === 1 || user.isAdmin === true;
            const token = jwt.sign(
                { user: { id: user.id, isAdmin } },
                'secret_ecom',
                { expiresIn: '7d' }
            );
            res.json({ success: true, 'auth-token': token });
        } catch (compareErr) {
            console.error("Password comparison error:", compareErr);
            res.status(500).json({ success: false, errors: "Internal server error during password comparison" });
        }
    });
});

// --- Public User Management Routes (No Admin Login Required) ---
// This endpoint is now public for fetching users
app.get('/users', (req, res) => { // Removed fetchUser middleware
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

// Paginated users endpoint
app.get('/users_paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;   // default page 1
  const limit = parseInt(req.query.limit) || 10; // default 10 users per page
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM users";
  const dataQuery = "SELECT * FROM users ORDER BY id ASC LIMIT ? OFFSET ?";

  db.query(countQuery, (err, countResults) => {
    if (err) {
      console.error("Error counting users:", err);
      return res.status(500).json({ error: "Failed to fetch user count" });
    }

    const totalUsers = countResults[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    db.query(dataQuery, [limit, offset], (err, userResults) => {
      if (err) {
        console.error("Error fetching users for page:", err);
        return res.status(500).json({ error: "Failed to fetch users for page" });
      }

      res.json({
        users: userResults,
        page,
        totalPages,
        totalUsers
      });
    });
  });
});


app.put('/users/:id', (req, res) => { // Removed fetchUser middleware
  const { name, email, password } = req.body;

  db.query("SELECT password FROM users WHERE id = ?", [req.params.id], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "User not found or database error" });
    }

    let hashedPassword = results[0].password;
    if (password) {
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (hashErr) {
        console.error("Error hashing new password:", hashErr);
        return res.status(500).json({ error: "Failed to hash new password" });
      }
    }

    db.query("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", 
      [name, email, hashedPassword, req.params.id], 
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating user:", updateErr);
          return res.status(500).json({ error: "Failed to update user" });
        }
        res.json({ success: true });
      }
    );
  });
});

app.delete('/users/:id', (req, res) => { // Removed fetchUser middleware
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete user" });
    res.json({ success: true });
  });
});

app.get("/inventory", (req, res) => {
    db.query("SELECT * FROM product", (err, results) => {
        if (err) {
            console.error("Error fetching products for inventory:", err);
            return res.status(500).json({ error: "Database query failed for products" });
        }
        res.json(results);
    });
});

app.put("/inventory/:id", (req, res) => {
    const { stock } = req.body;
    const productId = req.params.id;

    if (stock === undefined || stock === null || stock < 0 || isNaN(Number(stock))) {
        return res.status(400).json({ success: false, message: "Invalid stock value" });
    }

    db.query("UPDATE product SET stock = ? WHERE id = ?", [stock, productId], (err, result) => {
        if (err) {
            console.error("Error updating stock:", err);
            return res.status(500).json({ success: false, message: "Failed to update stock" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Stock updated successfully" });
    });
});


// Cart endpoints
const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ errors: "Please authenticate using a valid token" });

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        res.status(401).json({ errors: "Invalid or expired token" });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied: Admins only" });
    }
    next();
};

app.post('/addtocart', fetchUser, (req, res) => {
  const { itemId } = req.body;
  if (itemId == null) return res.status(400).json({ error: "Item ID required" });

  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    let cartData = JSON.parse(results[0].cartData);
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    db.query("UPDATE users SET cartData = ? WHERE id = ?", [JSON.stringify(cartData), req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update cart" });
      res.json({ success: true, message: "Item added to cart" });
    });
  });
});

// --- Cart Analytics Endpoint ---
app.get("/cart-analytics", (req, res) => {
  const query = `
    SELECT p.id, p.name, p.image, COUNT(c.product_id) AS addedCount
    FROM cart c
    JOIN products p ON c.product_id = p.id
    GROUP BY c.product_id
    ORDER BY addedCount DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching analytics:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ ROUTE: Add product to cart (triggers realtime update)
app.post("/add-to-cart", (req, res) => {
  const { product_id, user_id } = req.body;

  if (!product_id || !user_id) {
    return res.status(400).json({ error: "Missing product_id or user_id" });
  }

  const query = "INSERT INTO cart (product_id, user_id) VALUES (?, ?)";
  db.query(query, [product_id, user_id], (err) => {
    if (err) {
      console.error("❌ Error adding to cart:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log(`🛒 Product ${product_id} added by user ${user_id}`);

    // 🔥 Emit realtime update event to all clients
    io.emit("cart-updated");

    res.json({ message: "Product added to cart successfully" });
  });
});

// ✅ SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});


app.post('/removefromcart', fetchUser, (req, res) => {
  const { itemId } = req.body;
  if (itemId == null) return res.status(400).json({ error: "Item ID required" });

  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    let cartData = JSON.parse(results[0].cartData);
    if (cartData[itemId] && cartData[itemId] > 0) cartData[itemId] -= 1;

    db.query("UPDATE users SET cartData = ? WHERE id = ?", [JSON.stringify(cartData), req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update cart" });
      res.json({ success: true, message: "Item removed from cart" });
    });
  });
});

app.post('/getcart', fetchUser, (req, res) => {
  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    const cartData = JSON.parse(results[0].cartData);
    res.json(cartData);
  });
});

// New collections
app.get('/newcollections', (req, res) => {
  const query = "SELECT * FROM product ORDER BY id DESC LIMIT 8";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch new collections" });
    res.json(results.reverse());
  });
});

// Popular in part
app.get('/popularinpart', (req, res) => {
  const query = "SELECT * FROM product WHERE category = 'part' LIMIT 4";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch popular products" });
    res.json(results);
  });
});

// Root
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});