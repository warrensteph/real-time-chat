const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const upload = multer();

// Serve static files
app.use(express.static('public'));

// Rute untuk halaman chat
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

// Menangani unggahan file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Kirim file ke semua client yang terhubung
  io.emit('file', req.file);

  res.send('File uploaded successfully!');
});

// Menangani koneksi Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  // Menangani pesan chat
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  // Menangani pesan file
  socket.on('file', (file) => {
    io.emit('file', file);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});