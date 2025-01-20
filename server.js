const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 3000;

// Database setup
const db = new sqlite3.Database('theatre.db');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'theatre-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Set view engine
app.set('view engine', 'ejs');

// Database initialization
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )`);

  // Plays table
  db.run(`CREATE TABLE IF NOT EXISTS plays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    year_written INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    theatre TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    poster_url TEXT
  )`);

  // Reviews table
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    play_id INTEGER,
    rating INTEGER,
    review_text TEXT,
    date_posted TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(play_id) REFERENCES plays(id)
  )`);
});

// Routes
app.get('/', (req, res) => {
  const query = `
    SELECT 
      plays.*,
      COUNT(reviews.id) as review_count,
      AVG(reviews.rating) as average_rating
    FROM plays
    LEFT JOIN reviews ON plays.id = reviews.play_id
    GROUP BY plays.id
    ORDER BY start_date DESC
    LIMIT 10
  `;
  
  db.all(query, [], (err, plays) => {
    res.render('index', { 
      plays,
      user: req.session.user 
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, username: user.username };
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err) => {
      if (err) {
        res.render('register', { error: 'Username or email already exists' });
      } else {
        res.redirect('/login');
      }
    });
});

app.get('/plays', (req, res) => {
  const query = `
    SELECT 
      plays.*,
      COUNT(reviews.id) as review_count,
      AVG(reviews.rating) as average_rating
    FROM plays
    LEFT JOIN reviews ON plays.id = reviews.play_id
    GROUP BY plays.id
    ORDER BY start_date DESC
  `;
  
  db.all(query, [], (err, plays) => {
    res.render('plays', { 
      plays,
      user: req.session.user 
    });
  });
});

app.get('/play/:id', (req, res) => {
  const playId = req.params.id;
  const playQuery = `
    SELECT 
      plays.*,
      COUNT(reviews.id) as review_count,
      AVG(reviews.rating) as average_rating
    FROM plays
    LEFT JOIN reviews ON plays.id = reviews.play_id
    WHERE plays.id = ?
    GROUP BY plays.id
  `;
  
  db.get(playQuery, [playId], (err, play) => {
    if (play) {
      db.all('SELECT reviews.*, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE play_id = ? ORDER BY date_posted DESC',
        [playId],
        (err, reviews) => {
          res.render('play', { play, reviews, user: req.session.user });
        });
    } else {
      res.redirect('/plays');
    }
  });
});

app.post('/review/:playId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { rating, review_text } = req.body;
  const playId = req.params.playId;
  const userId = req.session.user.id;
  const date = new Date().toISOString();

  db.run('INSERT INTO reviews (user_id, play_id, rating, review_text, date_posted) VALUES (?, ?, ?, ?, ?)',
    [userId, playId, rating, review_text, date],
    (err) => {
      res.redirect('/play/' + playId);
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});