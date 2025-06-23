const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const secret = 'your_jwt_secret';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'mydatabaseysf',
    password: 'Isdihayuha.2001',        
    database: 'blog_db',
    multipleStatements: true
});
const sphinxConnection = mysql.createConnection({
    host: '127.0.0.1',
    port: 9306, // SphinxQL Port
    user: '', // Sphinx kullanıcı adı yok
    password: '', // Sphinx şifre gerektirmiyor
});

db.connect(err => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + db.threadId);
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.send('User registered!');
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.get('/api/profile', authenticateToken, (req, res) => {
    const sql = 'SELECT username FROM users WHERE id = ?';
    db.query(sql, [req.user.id], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

app.post('/api/titles', authenticateToken, (req, res) => {
    const { title } = req.body;
    const username = req.user.username;
    const sql = 'INSERT INTO titles (title, username) VALUES (?, ?)';
    db.query(sql, [title, username], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, title, username, created_at: new Date() });
    });
});

app.get('/api/titles', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page -1) * limit;

    const sql = 'SELECT * FROM titles ORDER BY id DESC LIMIT ? OFFSET ?';
    db.query(sql, [limit, offset], (err, results) => {
        if (err){
            console.error(err);
            res.status(500).send('Server Error');
            return;           
        } 
        res.json(results);
    });
});

app.get('/api/titles/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM titles WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const { post, title_id } = req.body;
    const username = req.user.username;
    if (username === null) {
        return res.status(401).send('You must login to write a post.');
    }
    const sql = 'INSERT INTO posts (content, title_id, username, created_at) VALUES (?, ?, ?, ?)';
    db.query(sql, [post, title_id, username, new Date()], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, post, username, created_at: new Date() });
    });
});

app.get('/api/user-titles/:username', authenticateToken, (req, res) => {
    const { username } = req.params;
    const sql = 'SELECT * FROM titles WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/api/posts/:title_id', (req, res) => {
    const { title_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = 'SELECT * FROM posts WHERE title_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?';
    db.query(sql, [title_id, limit, offset], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});



app.get('/api/user-title-count/:username', authenticateToken, (req, res) => {
    const { username } = req.params;
    const sql = 'SELECT COUNT(*) AS titleCount FROM titles WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Yeni eklenen arama endpointi
/*
SELECT 'title' AS type, t.id, t.title AS content, t.created_at, NULL AS title_id, u.username AS username, NULL AS title_name
        FROM titles t
        LEFT JOIN users u ON t.username = u.username
        WHERE MATCH(t.title)  
        AGAINST(? IN BOOLEAN MODE)
        UNION ALL
        SELECT 'post' AS type, p.id, p.content, p.created_at, p.title_id, u.username AS username, t.title AS title_name
        FROM posts p
        LEFT JOIN titles t ON p.title_id = t.id
        LEFT JOIN users u ON p.username = u.username
        WHERE MATCH(p.content)
        AGAINST(? IN BOOLEAN MODE)
        ORDER BY id DESC
*/
app.get('/api/search', (req, res) => {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const booleanQuery = `${query}`
    const sql = `
        SELECT 'title' AS type, t.id, t.title AS content, t.created_at, NULL AS title_id, NULL AS title_name, u.username
        FROM blog_db.titles t
        LEFT JOIN users u ON t.username = u.username
        WHERE MATCH(t.title)  
        AGAINST(? IN BOOLEAN MODE)
        UNION ALL
        SELECT 'post' AS type, p.id, p.content, p.created_at, p.title_id, t.title AS title_name, u.username
        FROM blog_db.posts p
        LEFT JOIN titles t ON p.title_id = t.id
        LEFT JOIN users u ON p.username = u.username
        WHERE MATCH(p.content)
        AGAINST(? IN BOOLEAN MODE)
        ORDER BY id DESC
        LIMIT 10 OFFSET 0;
    `;
    db.query(sql, [booleanQuery, booleanQuery], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
// const sphinxDb = mysql.createConnection({
//     host: 'localhost',
//     port: 9306
// })
// app.get('/api/search', (req, res) => {
//     const { query } = req.query;

//     const titlesQuery = `SELECT id, content AS title, username, created_at FROM blog_titles_index WHERE MATCH('*${query}*') LIMIT 10`;
//     const postsQuery = `SELECT id, content, username, created_at FROM blog_posts_index WHERE MATCH('*${query}*') LIMIT 10`;

//     sphinxConnection.query(titlesQuery, (err, titleResults) => {
//         if (err) throw err;

//         sphinxConnection.query(postsQuery, (err, postResults) => {
//             if (err) throw err;

//             // Sonuçları birleştirme
//             const combinedResults = [
//                 ...titleResults.map(result => ({ ...result, type: 'title' })),
//                 ...postResults.map(result => ({ ...result, type: 'post' }))
//             ];

//             // Sonuçları tarihe göre sıralama
//             combinedResults.sort((a, b) => b.created_at - a.created_at);

//             res.json(combinedResults);
//         });
//     });
// });

app.listen(5050, () => {
    console.log('Server started on port 5050');
});
