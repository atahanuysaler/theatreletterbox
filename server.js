const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;

// Add this near the top of your Express configuration
app.enable('trust proxy');

// Database setup
const db = new sqlite3.Database('theatre.db');

// Database initialization
db.serialize(() => {
  // Drop and recreate users table with Google auth fields
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    profile_picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Session configuration
app.use(session({
  secret: 'theatre-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set('view engine', 'ejs');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  function(accessToken, refreshToken, profile, cb) {
    db.get('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, user) => {
      if (err) return cb(err);
      
      if (!user) {
        // Create new user if doesn't exist
        db.run('INSERT INTO users (google_id, display_name, email, profile_picture) VALUES (?, ?, ?, ?)',
          [profile.id, profile.displayName, profile.emails[0].value, profile.photos[0].value],
          function(err) {
            if (err) return cb(err);
            
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              return cb(err, newUser);
            });
          });
      } else {
        return cb(null, user);
      }
    });
  }
));

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// Profile route
app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const isOwnProfile = req.user && req.user.id === parseInt(userId);
  
  // Get user info
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, profileUser) => {
    if (err || !profileUser) {
      return res.redirect('/');
    }

    // Get user's reviews with play titles
    const query = `
      SELECT reviews.*, plays.title as play_title
      FROM reviews 
      JOIN plays ON reviews.play_id = plays.id
      WHERE reviews.user_id = ?
      ORDER BY reviews.date_posted DESC
    `;
    
    db.all(query, [userId], (err, reviews) => {
      if (err) {
        return res.redirect('/');
      }
      
      res.render('profile', {
        user: req.user,
        profileUser,
        reviews,
        isOwnProfile
      });
    });
    });
});

// Search route
app.get('/search', (req, res) => {
  const searchQuery = req.query.query; // Get search term from query parameter
  if (!searchQuery) {
    // Redirect to plays page if no query is provided
    return res.redirect('/plays');
  }

  const query = `
    SELECT 
      plays.*,
      COUNT(reviews.id) as review_count,
      AVG(reviews.rating) as average_rating
    FROM plays
    LEFT JOIN reviews ON plays.id = reviews.play_id
    WHERE plays.title LIKE ? OR plays.author LIKE ? OR plays.description LIKE ? OR plays.genre LIKE ? OR plays.theatre LIKE ? OR plays.city LIKE ?
    GROUP BY plays.id
    ORDER BY start_date DESC
  `;
  
  const searchTerm = `%${searchQuery}%`; // Add wildcards for partial matching

  db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, plays) => {
    if (err) {
      console.error("Search error:", err);
      // Handle error appropriately, maybe render an error page or redirect
      return res.redirect('/'); 
    }
    
    res.render('plays', { // Reuse the plays view for search results
      plays,
      user: req.user,
      searchQuery // Pass the search query to the view to display it
    });
  });
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
      user: req.user 
    });
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
      user: req.user,
      searchQuery: null // Indicate no search is active
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
      db.all('SELECT reviews.*, users.display_name, users.profile_picture FROM reviews JOIN users ON reviews.user_id = users.id WHERE play_id = ? ORDER BY date_posted DESC',
        [playId],
        (err, reviews) => {
          res.render('play', { play, reviews, user: req.user });
        });
    } else {
      res.redirect('/plays');
    }
  });
});

app.post('/review/:playId', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/google');
  }

  const { rating, review_text } = req.body;
  const playId = req.params.playId;
  const userId = req.user.id;
  const date = new Date().toISOString();

  db.run('INSERT INTO reviews (user_id, play_id, rating, review_text, date_posted) VALUES (?, ?, ?, ?, ?)',
    [userId, playId, rating, review_text, date],
    (err) => {
      res.redirect('/play/' + playId);
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
