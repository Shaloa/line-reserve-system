const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('@line/bot-sdk');

// Expressアプリケーションの作成
const app = express();
const port = 5000;

app.use(cors());

const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' }); // 一時保存ディレクトリ


// LINE APIの設定（あなたのLINE Developers Consoleの情報に置き換えてください）
const config = {
  channelAccessToken: "dPRqAuTyyRQZOjRRXM5EV+EAixmfJTDvdCqAfLLTfGY9XLoT6zTW5lR5zuBOwGnfls8/qAthhrUsh6kaYTME7INJsuSzmHWznfryc8mVGlyXGzXzxOgW5fuYifPL+A9moY3vIGXcmIs+q7v27V0ZnAdB04t89/1O/w1cDnyilFU=",  // チャネルアクセストークン
  channelSecret: "8491385c13e3488c4cb7c221aa7555d8",            // チャネルシークレット
};

const client = new Client(config);

// リクエストボディをJSON形式で受け取るために設定
app.use(bodyParser.json());

// Webhookエンドポイントの作成
app.post('/callback', (req, res) => {
  const events = req.body.events;

  // イベントが届いた場合、メッセージを返信
  Promise.all(events.map(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `あなたが送ったメッセージは: ${event.message.text}`, // 受け取ったメッセージを返信
      });
    }
  }))
    .then(() => res.status(200).send('OK'))  // 返信が成功した場合はOKを返す
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error');  // エラーがあれば500を返す
    });
});



const { google } = require('googleapis');
const fs = require('fs');

// Google API認証セットアップ
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // ← JSONファイル名
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// スプレッドシートのID（URLの中にあるやつ）
const SPREADSHEET_ID = '1L1qmP86xk_P8qIHr6biF3_SYUw9sfbmbPzW7djZ22hs';

app.post('/api/register', upload.single('idImage'), async (req, res) => {
  const data = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // シートに追加する行データ
    const values = [[
      data.name,
      data.birth,
      data.gender,
      data.address,
      data.agreed,
      new Date().toLocaleString()
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'シート1!A1', // 例：シート名!範囲
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('スプレッドシートに追加しました');
    res.json({ success: true, message: '登録完了！' });
  } catch (err) {
    console.error('スプレッドシート書き込みエラー:', err);
    res.status(500).json({ success: false, message: '登録に失敗しました。' });
  }
});



// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しました`);
});