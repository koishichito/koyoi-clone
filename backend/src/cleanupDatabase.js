const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../koyoi.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🔄 Cleaning up database...');

  // time_slotsとmatchesをクリア
  db.run('DELETE FROM time_slots', (err) => {
    if (err) {
      console.error('❌ Error deleting time_slots:', err);
    } else {
      console.log('✅ Cleared time_slots table');
    }
  });

  db.run('DELETE FROM matches', (err) => {
    if (err) {
      console.error('❌ Error deleting matches:', err);
    } else {
      console.log('✅ Cleared matches table');
    }
  });

  // デモユーザー以外のユーザーは残す（オプション）
  console.log('\n💡 User data is preserved. Only time_slots and matches are cleared.');
  console.log('📝 To re-seed demo users: node src/seedDemoUsers.js');
  console.log('⏰ To re-seed time slots: node src/seedTimeSlots.js');

  db.close();
});
