const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// ユーザー登録・更新
router.post('/', async (req, res) => {
  const {
    lineUserId,
    displayName,
    age,
    gender,
    bio,
    location,
    interests,
    lookingFor,
    ageRangeMin,
    ageRangeMax,
    profileImageUrl,
  } = req.body;

  console.log('📝 User registration:', lineUserId);

  // 既存ユーザーチェック
  db.get('SELECT * FROM users WHERE line_user_id = ?', [lineUserId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const interestsStr = Array.isArray(interests) ? interests.join(',') : interests;

    if (row) {
      // 更新
      db.run(
        `UPDATE users SET
          display_name = ?, age = ?, gender = ?, bio = ?, location = ?,
          interests = ?, looking_for = ?, age_range_min = ?, age_range_max = ?,
          profile_image_url = ?
         WHERE line_user_id = ?`,
        [
          displayName, age, gender, bio, location, interestsStr,
          lookingFor, ageRangeMin, ageRangeMax, profileImageUrl, lineUserId
        ],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          console.log('✅ User updated:', row.id);
          res.json({ success: true, userId: row.id });
        }
      );
    } else {
      // 新規作成
      const userId = uuidv4();
      db.run(
        `INSERT INTO users (
          id, line_user_id, display_name, age, gender, bio, location,
          interests, looking_for, age_range_min, age_range_max, profile_image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, lineUserId, displayName, age, gender, bio, location,
          interestsStr, lookingFor, ageRangeMin, ageRangeMax, profileImageUrl
        ],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          console.log('✅ User created:', userId);
          res.status(201).json({ success: true, userId });
        }
      );
    }
  });
});

// ユーザー情報取得
router.get('/:lineUserId', (req, res) => {
  const { lineUserId } = req.params;

  db.get('SELECT * FROM users WHERE line_user_id = ?', [lineUserId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (row.interests) {
      row.interests = row.interests.split(',');
    }

    res.json(row);
  });
});

module.exports = router;
