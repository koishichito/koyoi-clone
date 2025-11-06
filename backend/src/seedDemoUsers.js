const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, '../koyoi.db');
const db = new sqlite3.Database(dbPath);

const demoUsers = [
  {
    lineUserId: 'demo_user_001',
    displayName: '美咲',
    age: 25,
    gender: '女性',
    bio: 'カフェ巡りが好きです！今夜お茶しませんか？',
    location: '東京',
    interests: '旅行,グルメ,カフェ巡り',
    lookingFor: '男性',
    ageRangeMin: 23,
    ageRangeMax: 35,
    profileImageUrl: 'https://via.placeholder.com/150'
  },
  {
    lineUserId: 'demo_user_002',
    displayName: 'ゆい',
    age: 28,
    gender: '女性',
    bio: '映画とワインが好きです。素敵な出会いを探しています。',
    location: '東京',
    interests: '映画,音楽,グルメ',
    lookingFor: '男性',
    ageRangeMin: 26,
    ageRangeMax: 38,
    profileImageUrl: 'https://via.placeholder.com/150'
  },
  {
    lineUserId: 'demo_user_003',
    displayName: 'さくら',
    age: 23,
    gender: '女性',
    bio: 'アウトドア好き！一緒に楽しめる人募集中です♪',
    location: '東京',
    interests: 'スポーツ,アウトドア,旅行',
    lookingFor: '男性',
    ageRangeMin: 22,
    ageRangeMax: 32,
    profileImageUrl: 'https://via.placeholder.com/150'
  },
  {
    lineUserId: 'demo_user_004',
    displayName: '健太',
    age: 29,
    gender: '男性',
    bio: 'IT系で働いています。美味しいご飯を食べに行きましょう！',
    location: '東京',
    interests: 'グルメ,ゲーム,読書',
    lookingFor: '女性',
    ageRangeMin: 24,
    ageRangeMax: 35,
    profileImageUrl: 'https://via.placeholder.com/150'
  },
  {
    lineUserId: 'demo_user_005',
    displayName: '大輔',
    age: 32,
    gender: '男性',
    bio: 'スポーツ観戦が趣味です。一緒に盛り上がれる人と出会いたいです！',
    location: '東京',
    interests: 'スポーツ,旅行,音楽',
    lookingFor: '女性',
    ageRangeMin: 25,
    ageRangeMax: 35,
    profileImageUrl: 'https://via.placeholder.com/150'
  }
];

db.serialize(() => {
  console.log('🔄 Inserting demo users...');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, line_user_id, display_name, age, gender, bio, location,
      interests, looking_for, age_range_min, age_range_max, profile_image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  demoUsers.forEach((user) => {
    const userId = uuidv4();
    stmt.run(
      userId,
      user.lineUserId,
      user.displayName,
      user.age,
      user.gender,
      user.bio,
      user.location,
      user.interests,
      user.lookingFor,
      user.ageRangeMin,
      user.ageRangeMax,
      user.profileImageUrl
    );
    console.log(`✅ Added: ${user.displayName} (${user.gender}, ${user.age}歳)`);
  });

  stmt.finalize();

  console.log('\n✨ Demo users seeded successfully!');
  console.log('📊 Total demo users:', demoUsers.length);

  db.close();
});
