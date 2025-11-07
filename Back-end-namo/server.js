const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { sendNewUserNotification, sendMessageNotification } = require('./emailService');

const app = express();
const PORT = 3000;

app.use(cors({
  origin:[
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://site-namo-khaki.vercel.app'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      user = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      sendNewUserNotification(user.rows[0]);
    }
    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const allMessages = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(allMessages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { content, userEmail } = req.body;
    if (!content || !userEmail) {
      return res.status(400).json({ error: 'Conteúdo e e-mail do usuário são obrigatórios.' });
    }
    const newMessage = await pool.query(
      'INSERT INTO messages (content) VALUES ($1) RETURNING *',
      [content]
    );
    if (userEmail.toLowerCase() === 'ciprianoshunter@gmail.com') {
      sendMessageNotification(userEmail, 'marialuizafedesa02@gmail.com', content);
    } else if (userEmail.toLowerCase() === 'marialuizafedesa02@gmail.com') {
      sendMessageNotification(userEmail, 'ciprianoshunter@gmail.com', content);
    }
    res.status(201).json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteMessage = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    if (deleteMessage.rowCount === 0) {
        return res.status(404).json("Mensagem não encontrada.");
    }
    res.json({ message: 'Mensagem deletada com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
