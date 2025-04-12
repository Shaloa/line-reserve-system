const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// アップロード先の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads')); // アップロードファイルを公開

// POSTエンドポイント（フォームの受け取り）
app.post('/api/register', upload.single('idImage'), (req, res) => {
  const data = req.body;
  const file = req.file;

  console.log('受信したデータ:', data);
  console.log('アップロードされたファイル:', file);

  res.json({ success: true, message: '登録完了！' });
});

app.listen(port, () => {
  console.log(`🚀 サーバーが http://localhost:${port} で起動しました`);
});
