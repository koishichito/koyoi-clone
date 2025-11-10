const express = require('express');
const line = require('@line/bot-sdk');
const cors = require('cors');
require('dotenv').config();
require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// ミドルウェア
app.use(cors());

// Webhook エンドポイント（express.json()の前に配置）
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// JSON パーサー（Webhook以外のルート用）
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API ルート
app.use('/api/users', require('./routes/userRoutes'));

// イベントハンドラー
async function handleEvent(event) {
  console.log('📨 Event received:', event.type);

  if (event.type === 'follow') {
    return handleFollow(event);
  } else if (event.type === 'message' && event.message.type === 'text') {
    return handleTextMessage(event);
  } else if (event.type === 'postback') {
    return handlePostback(event);
  }
  return null;
}

// フォローイベント（友達追加）
async function handleFollow(event) {
  const userId = event.source.userId;
  console.log('👋 New friend:', userId);

  const welcomeMessage = {
    type: 'text',
    text: 'Koyoiへようこそ！🌙\n\nまずはプロフィールを登録して、今夜会える素敵な人を見つけましょう！',
  };

  const profileButton = {
    type: 'template',
    altText: 'プロフィール登録',
    template: {
      type: 'buttons',
      text: 'プロフィール登録を始める',
      actions: [
        {
          type: 'uri',
          label: 'プロフィール登録',
          uri: `https://liff.line.me/${process.env.LINE_LIFF_ID}`,
        },
      ],
    },
  };

  return client.replyMessage(event.replyToken, [welcomeMessage, profileButton]);
}

// テキストメッセージ処理
async function handleTextMessage(event) {
  const userMessage = event.message.text;
  const userId = event.source.userId;

  console.log(`💬 Message from ${userId}: ${userMessage}`);

  // ユーザー情報取得
  const db = require('./database');
  const user = await new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE line_user_id = ?', [userId], (err, row) => {
      resolve(row);
    });
  });

  if (!user) {
    // 未登録ユーザー
    return client.replyMessage(event.replyToken, {
      type: 'template',
      altText: 'プロフィール登録が必要です',
      template: {
        type: 'buttons',
        text: 'まずはプロフィール登録をお願いします',
        actions: [
          {
            type: 'uri',
            label: 'プロフィール登録',
            uri: `https://liff.line.me/${process.env.LINE_LIFF_ID}`,
          },
        ],
      },
    });
  }

  // 「メニュー」または「会いたい」を検知
  if (userMessage.includes('メニュー') || userMessage.includes('会いたい')) {
    return showMainMenu(event.replyToken);
  }

  // デフォルト応答
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '「メニュー」と入力すると、機能を選択できます！',
  });
}

// メインメニュー表示
async function showMainMenu(replyToken) {
  const flexMessage = {
    type: 'flex',
    altText: 'メインメニュー',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '今夜会いたい時間を選択',
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          {
            type: 'text',
            text: '希望の時間帯を選んでください',
            size: 'sm',
            color: '#999999',
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'postback',
              label: '19:00',
              data: 'action=select_time&time=19:00',
            },
          },
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'postback',
              label: '20:00',
              data: 'action=select_time&time=20:00',
            },
          },
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'postback',
              label: '21:00',
              data: 'action=select_time&time=21:00',
            },
          },
        ],
      },
    },
  };

  return client.replyMessage(replyToken, flexMessage);
}

// Postbackイベント処理
async function handlePostback(event) {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');
  const userId = event.source.userId;

  console.log(`🔘 Postback: ${action} from ${userId}`);

  if (action === 'select_time') {
    const time = data.get('time');
    return handleTimeSelection(event, userId, time);
  }
}

// 時間選択処理
async function handleTimeSelection(event, lineUserId, time) {
  const { v4: uuidv4 } = require('uuid');
  const db = require('./database');

  // ユーザー情報取得
  const user = await new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE line_user_id = ?', [lineUserId], (err, row) => {
      resolve(row);
    });
  });

  if (!user) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'ユーザー情報が見つかりません。プロフィール登録をお願いします。',
    });
  }

  // 今日の日付
  const today = new Date().toISOString().split('T')[0];

  // 既存の時間枠をチェック
  const existingSlot = await new Promise((resolve) => {
    db.get(
      'SELECT * FROM time_slots WHERE user_id = ? AND date = ? AND time = ? AND status = "waiting"',
      [user.id, today, time],
      (err, row) => resolve(row)
    );
  });

  let timeSlotId;
  if (existingSlot) {
    timeSlotId = existingSlot.id;
    console.log(`⏰ Using existing time slot: ${timeSlotId}`);
  } else {
    // 時間枠を作成
    timeSlotId = uuidv4();
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO time_slots (id, user_id, date, time, location) VALUES (?, ?, ?, ?, ?)',
        [timeSlotId, user.id, today, time, user.location],
        resolve
      );
    });
    console.log(`⏰ Time slot created: ${timeSlotId}`);
  }

  // マッチング処理
  const match = await findMatch(user, today, time);

  if (match) {
    // マッチング成功
    const matchId = uuidv4();
    await new Promise((resolve) => {
      const insertMatchSql =
        'INSERT INTO matches (id, user1_id, user2_id, time_slot_id, date, time, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.run(
        insertMatchSql,
        [matchId, user.id, match.id, timeSlotId, today, time, user.location, 'matched'],
        resolve
      );
    });

    // time_slotsのステータスを更新
    await new Promise((resolve) => {
      db.run('UPDATE time_slots SET status = ? WHERE id = ? OR user_id = ?',
        ['matched', timeSlotId, match.id], resolve);
    });

    console.log(`💕 Match created: ${user.display_name} ⇔ ${match.display_name}`);

    // 相手にも通知を送信（デモユーザーでない場合のみ）
    if (!match.line_user_id.startsWith('demo_user_')) {
      try {
        await client.pushMessage(match.line_user_id, {
          type: 'text',
          text: `🎉 マッチングしました！\n\n【相手のプロフィール】\n名前: ${user.display_name}\n年齢: ${user.age}歳\n性別: ${user.gender}\n自己紹介: ${user.bio}\n\n待ち合わせ時間: ${time}\n場所: ${user.location}`,
        });
      } catch (error) {
        console.error('⚠️ Failed to send push message to match:', error.message);
      }
    } else {
      console.log(`📝 Skipped push message to demo user: ${match.display_name}`);
    }

    // 本人に通知
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `🎉 マッチングしました！\n\n【相手のプロフィール】\n名前: ${match.display_name}\n年齢: ${match.age}歳\n性別: ${match.gender}\n自己紹介: ${match.bio}\n\n待ち合わせ時間: ${time}\n場所: ${user.location}`,
    });
  } else {
    // マッチング待機中
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `${time}の予約を受け付けました！⏰\n\nマッチング相手を探しています...\n見つかり次第お知らせします。`,
    });
  }
}

// マッチング相手を探す関数
async function findMatch(user, date, time) {
  const db = require('./database');

  return new Promise((resolve) => {
    db.get(
      `SELECT u.* FROM users u
       INNER JOIN time_slots ts ON ts.user_id = u.id
       WHERE ts.date = ?
         AND ts.time = ?
         AND ts.location = ?
         AND ts.status = 'waiting'
         AND u.id != ?
         AND u.gender = ?
         AND u.looking_for = ?
         AND u.age BETWEEN ? AND ?
         AND ? BETWEEN u.age_range_min AND u.age_range_max
       ORDER BY ts.created_at ASC
       LIMIT 1`,
      [
        date,
        time,
        user.location,
        user.id,
        user.looking_for,
        user.gender,
        user.age_range_min,
        user.age_range_max,
        user.age
      ],
      (err, row) => {
        if (err) {
          console.error('❌ Match search error:', err);
          resolve(null);
        } else {
          resolve(row);
        }
      }
    );
  });
}

// サーバー起動
app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook`);
});
