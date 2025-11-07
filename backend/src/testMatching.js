const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, '../koyoi.db');
const db = new sqlite3.Database(dbPath);

async function testMatching() {
  console.log('🧪 Testing matching logic...\n');

  // Get two demo users (male and female looking for each other)
  const maleUser = await new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE gender = "男性" AND looking_for = "女性" LIMIT 1', (err, row) => {
      resolve(row);
    });
  });

  const femaleUser = await new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE gender = "女性" AND looking_for = "男性" LIMIT 1', (err, row) => {
      resolve(row);
    });
  });

  if (!maleUser || !femaleUser) {
    console.error('❌ Demo users not found');
    db.close();
    return;
  }

  console.log('👨 Male user:', maleUser.display_name, `(${maleUser.age}歳)`);
  console.log('👩 Female user:', femaleUser.display_name, `(${femaleUser.age}歳)`);
  console.log('');

  const today = new Date().toISOString().split('T')[0];
  const time = '19:00';
  const location = '東京';

  // Update users' location to match
  await new Promise((resolve) => {
    db.run('UPDATE users SET location = ? WHERE id = ?', [location, maleUser.id], resolve);
  });
  await new Promise((resolve) => {
    db.run('UPDATE users SET location = ? WHERE id = ?', [location, femaleUser.id], resolve);
  });

  // Create time slot for female user first
  const femaleSlotId = uuidv4();
  await new Promise((resolve) => {
    db.run(
      'INSERT INTO time_slots (id, user_id, date, time, location, status) VALUES (?, ?, ?, ?, ?, ?)',
      [femaleSlotId, femaleUser.id, today, time, location, 'waiting'],
      resolve
    );
  });
  console.log('✅ Created time slot for', femaleUser.display_name);

  // Try to find match for male user
  const match = await new Promise((resolve) => {
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
        today,
        time,
        location,
        maleUser.id,
        maleUser.looking_for,
        maleUser.gender,
        maleUser.age_range_min,
        maleUser.age_range_max,
        maleUser.age
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

  if (match) {
    console.log('✅ Match found:', match.display_name);
    console.log('');
    console.log('📊 Matching criteria passed:');
    console.log('  - Same date:', today);
    console.log('  - Same time:', time);
    console.log('  - Same location:', location);
    console.log('  - Gender compatibility:', maleUser.gender, '→', maleUser.looking_for);
    console.log('  - Age compatibility:', maleUser.age, 'within', match.age_range_min, '-', match.age_range_max);
    console.log('');
    console.log('🎉 Matching logic works correctly!');
  } else {
    console.log('❌ No match found');
    console.log('');
    console.log('Debug info:');
    console.log('  Male user age:', maleUser.age);
    console.log('  Male user age range:', maleUser.age_range_min, '-', maleUser.age_range_max);
    console.log('  Female user age:', femaleUser.age);
    console.log('  Female user age range:', femaleUser.age_range_min, '-', femaleUser.age_range_max);
  }

  // Cleanup
  await new Promise((resolve) => {
    db.run('DELETE FROM time_slots WHERE id = ?', [femaleSlotId], resolve);
  });

  db.close();
}

testMatching().catch(console.error);
