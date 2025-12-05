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
const fs = require("fs");

require('dotenv').config();

// --- Create upload directory if it doesn't exist ---
const uploadDir = path.join(__dirname, 'upload', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created at:', uploadDir);
} else {
  console.log('✅ Upload directory exists at:', uploadDir);
}

// --- Configuration for Deployment ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://frontend-production-5042.up.railway.app',
  'https://admin-production-7904.up.railway.app'
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// MySQL Connection
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Failed to connect to MySQL:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database.");
  connection.release();
});

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

app.use('/images', express.static(uploadDir));

// JWT Middleware for User Authentication
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

// --- ROUTES ---

// Upload image
app.post("/upload", (req, res) => {
  upload.single('product')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ 
        success: 0, 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ 
        success: 0, 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: 0, 
        message: "No file uploaded" 
      });
    }
    
    console.log("✅ File uploaded:", req.file.filename);
    
    res.json({
      success: 1,
      image_url: `${process.env.BACKEND_URL}/images/${req.file.filename}`
    });
  });
});

// --- CATEGORY MANAGEMENT ROUTES ---

app.get("/categories", (req, res) => {
  const query = "SELECT * FROM categories ORDER BY name ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
    res.json(results);
  });
});

app.post("/categories", (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: "Category name is required" 
    });
  }

  const trimmedName = name.trim();
  
  db.query(
    "SELECT * FROM categories WHERE LOWER(name) = LOWER(?)",
    [trimmedName],
    (err, results) => {
      if (err) {
        console.error("Error checking category:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Database error" 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Category already exists" 
        });
      }

      db.query(
        "INSERT INTO categories (name) VALUES (?)",
        [trimmedName],
        (err, result) => {
          if (err) {
            console.error("Error adding category:", err);
            return res.status(500).json({ 
              success: false, 
              error: "Failed to add category" 
            });
          }

          res.json({ 
            success: true, 
            message: "Category added successfully",
            id: result.insertId
          });
        }
      );
    }
  );
});

app.put("/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: "Category name is required" 
    });
  }

  const trimmedName = name.trim();

  db.query(
    "SELECT * FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?",
    [trimmedName, id],
    (err, results) => {
      if (err) {
        console.error("Error checking category:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Database error" 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Category name already exists" 
        });
      }

      db.query(
        "UPDATE categories SET name = ? WHERE id = ?",
        [trimmedName, id],
        (err, result) => {
          if (err) {
            console.error("Error updating category:", err);
            return res.status(500).json({ 
              success: false, 
              error: "Failed to update category" 
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ 
              success: false, 
              error: "Category not found" 
            });
          }

          res.json({ 
            success: true, 
            message: "Category updated successfully" 
          });
        }
      );
    }
  );
});

app.delete("/categories/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT COUNT(*) as count FROM product WHERE category = (SELECT name FROM categories WHERE id = ?)",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error checking products:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Database error" 
        });
      }

      if (results[0].count > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot delete category. ${results[0].count} product(s) are using this category.` 
        });
      }

      db.query(
        "DELETE FROM categories WHERE id = ?",
        [id],
        (err, result) => {
          if (err) {
            console.error("Error deleting category:", err);
            return res.status(500).json({ 
              success: false, 
              error: "Failed to delete category" 
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ 
              success: false, 
              error: "Category not found" 
            });
          }

          res.json({ 
            success: true, 
            message: "Category deleted successfully" 
          });
        }
      );
    }
  );
});

// Add product endpoint
app.post("/addproduct", (req, res) => {
  console.log("📦 Received addproduct request:", req.body);
  
  const { name, image, category, new_price, old_price, stock } = req.body;

  if (!name || !image || !category || !new_price || !old_price) {
    console.error("❌ Validation failed: Missing required fields");
    return res.status(400).json({ 
      success: false, 
      error: "All fields are required (name, image, category, new_price, old_price)" 
    });
  }

  const newPrice = parseFloat(new_price);
  const oldPrice = parseFloat(old_price);
  
  if (isNaN(newPrice) || isNaN(oldPrice)) {
    console.error("❌ Validation failed: Invalid price values");
    return res.status(400).json({ 
      success: false, 
      error: "Prices must be valid numbers" 
    });
  }

  const stockValue = stock !== undefined ? parseInt(stock) : 0;
  if (isNaN(stockValue) || stockValue < 0) {
    console.error("❌ Validation failed: Invalid stock value");
    return res.status(400).json({ 
      success: false, 
      error: "Stock must be a positive number" 
    });
  }

  const date = new Date();
  const available = 1;

  const getLastIdQuery = "SELECT id FROM product ORDER BY id DESC LIMIT 1";
  
  db.query(getLastIdQuery, (err, results) => {
    if (err) {
      console.error("❌ Error fetching last product ID:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Database error while fetching last ID: " + err.message 
      });
    }

    let newId = results.length > 0 ? results[0].id + 1 : 1;
    console.log("🆔 New product ID will be:", newId);

    const insertQuery = `
      INSERT INTO product (id, name, image, category, new_price, old_price, date, available, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [newId, name, image, category, newPrice, oldPrice, date, available, stockValue];
    console.log("💾 Inserting product with values:", values);

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("❌ Error inserting product:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to insert product into database: " + err.message 
        });
      }
      
      console.log("✅ Product added successfully! ID:", newId);
      
      res.json({ 
        success: true, 
        message: "Product added successfully", 
        id: newId,
        product: { 
          id: newId, 
          name, 
          image, 
          category, 
          new_price: newPrice, 
          old_price: oldPrice, 
          date, 
          available,
          stock: stockValue
        }
      });
    });
  });
});

app.get("/products", (req, res) => {
  db.query("SELECT * FROM product", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

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

app.post('/removeproduct', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Product id required" });

  db.query("DELETE FROM product WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to remove product" });
    res.json({ success: true });
  });
});

// Signup
app.post('/signup', async (req, res) => {
  const { username, email, password, consent } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, errors: "Missing required fields" });
  }

  if (consent !== true) {
    return res.status(400).json({ success: false, errors: "You must agree to the Terms and Privacy Statement to register." });
  }

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

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, errors: "Email and password required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, errors: "Database error" });
    if (results.length === 0)
      return res.status(400).json({ success: false, errors: "Wrong email" });

    const user = results[0];

    if (user.disabled === 1) {
      return res.status(403).json({ success: false, errors: "Your account has been disabled." });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(400).json({ success: false, errors: "Wrong password" });

      const isAdmin = user.isAdmin === 1 || user.isAdmin === true;
      const token = jwt.sign({ user: { id: user.id, isAdmin } }, "secret_ecom", {
        expiresIn: "7d",
      });
      res.json({ success: true, "auth-token": token });
    } catch {
      res.status(500).json({ success: false, errors: "Server error" });
    }
  });
});

// User Management Routes
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(result);
  });
});

app.get('/users_paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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

app.put("/users/disable/:id", (req, res) => {
  const userId = req.params.id;
  console.log("Disabling user ID:", userId);

  const sql = "UPDATE users SET disabled = TRUE WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error disabling user:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User disabled successfully" });
  });
});

app.put("/users/enable/:id", (req, res) => {
  const userId = req.params.id;
  console.log("Enabling user ID:", userId);

  const sql = "UPDATE users SET disabled = FALSE WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error enabling user:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User enabled successfully" });
  });
});

app.put('/users/:id', (req, res) => {
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

app.delete('/users/:id', (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete user" });
    res.json({ success: true });
  });
});

// Inventory
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

// Cart Endpoints
app.post("/addtocart", fetchUser, (req, res) => {
  const { itemId } = req.body;
  if (itemId == null) return res.status(400).json({ error: "Item ID required" });

  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    let cartData = JSON.parse(results[0].cartData || "{}");
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    db.query("UPDATE users SET cartData = ? WHERE id = ?", [JSON.stringify(cartData), req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update cart" });

      io.emit("cart-updated");
      res.json({ success: true, message: "Item added to cart" });
    });
  });
});

app.post("/removefromcart", fetchUser, (req, res) => {
  const { itemId } = req.body;
  if (itemId == null) return res.status(400).json({ error: "Item ID required" });

  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    let cartData = JSON.parse(results[0].cartData || "{}");

    if (cartData[itemId] && cartData[itemId] > 0) cartData[itemId] -= 1;
    if (cartData[itemId] <= 0) delete cartData[itemId];

    db.query("UPDATE users SET cartData = ? WHERE id = ?", [JSON.stringify(cartData), req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update cart" });

      io.emit("cart-updated");
      res.json({ success: true, message: "Item removed from cart" });
    });
  });
});

app.post("/getcart", fetchUser, (req, res) => {
  db.query("SELECT cartData FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

    try {
      const cartData = JSON.parse(results[0].cartData || "{}");
      res.json(cartData);
    } catch {
      res.json({});
    }
  });
});

// Cart Analytics
app.get("/cart-analytics", (req, res) => {
  db.query("SELECT cartData FROM users", (err, results) => {
    if (err) {
      console.error("❌ Error fetching analytics:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const productCounts = {};

    results.forEach(user => {
      const cart = JSON.parse(user.cartData || "{}");
      for (const productId in cart) {
        if (cart.hasOwnProperty(productId)) {
          productCounts[productId] = (productCounts[productId] || 0) + cart[productId];
        }
      }
    });

    const countsArray = Object.keys(productCounts).map(productId => ({
      product_id: parseInt(productId),
      addedCount: productCounts[productId]
    }));

    countsArray.sort((a, b) => b.addedCount - a.addedCount);

    if (countsArray.length === 0) return res.json([]);

    const productIds = countsArray.map(p => p.product_id);
    const placeholders = productIds.map(() => '?').join(',');

    const query = `SELECT id, name, image FROM product WHERE id IN (${placeholders})`;

    db.query(query, productIds, (err, productResults) => {
      if (err) {
        console.error("❌ Error fetching product details:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const finalResults = countsArray.map(item => {
        const product = productResults.find(p => p.id === item.product_id);
        return product
          ? { ...product, addedCount: item.addedCount }
          : { product_id: item.product_id, name: "Unknown", image: null, addedCount: item.addedCount };
      });

      res.json(finalResults);
    });
  });
});

// New collections
app.get('/newcollections', (req, res) => {
  const query = "SELECT * FROM product ORDER BY id DESC LIMIT 8";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch new collections" });
    res.json(results);
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

// Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});