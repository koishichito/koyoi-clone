const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, '../koyoi.db');
const db = new sqlite3.Database(dbPath);

// 今日の日付
const today = new Date().toISOString().split('T')[0];

db.serialize(() => {
  console.log('🔄 Creating time slots for demo users...');

  // まず、デモユーザーのIDを取得
  db.all('SELECT id, display_name, line_user_id, location FROM users WHERE line_user_id LIKE "demo_user_%"', (err, users) => {
    if (err) {
      console.error('❌ Error:', err);
      return;
    }

    if (users.length === 0) {
      console.log('⚠️ No demo users found. Run seedDemoUsers.js first.');
      db.close();
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO time_slots (id, user_id, date, time, location, status)
      VALUES (?, ?, ?, ?, ?, 'waiting')
    `);

    // 美咲に19:00の時間枠を作成
    const misaki = users.find(u => u.display_name === '美咲');
    if (misaki) {
      stmt.run(uuidv4(), misaki.id, today, '19:00', misaki.location);
      console.log(`✅ 美咲: 19:00 (${misaki.location})`);
    }

    // ゆいに20:00の時間枠を作成
    const yui = users.find(u => u.display_name === 'ゆい');
    if (yui) {
      stmt.run(uuidv4(), yui.id, today, '20:00', yui.location);
      console.log(`✅ ゆい: 20:00 (${yui.location})`);
    }

    // さくらに21:00の時間枠を作成
    const sakura = users.find(u => u.display_name === 'さくら');
    if (sakura) {
      stmt.run(uuidv4(), sakura.id, today, '21:00', sakura.location);
      console.log(`✅ さくら: 21:00 (${sakura.location})`);
    }

    stmt.finalize();
    console.log('\n✨ Time slots created successfully!');
    console.log('📅 Date:', today);
    console.log('\n🎯 Now you can test matching by selecting the same time!');

    db.close();
  });
});
