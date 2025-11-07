const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// 入力バリデーション関数
function validateUserInput(data) {
  const errors = [];

  if (!data.lineUserId || typeof data.lineUserId !== 'string') {
    errors.push('LINE User IDが無効です');
  }

  if (!data.displayName || data.displayName.trim().length < 1) {
    errors.push('表示名を入力してください');
  }

  if (!data.age || data.age < 18 || data.age > 100) {
    errors.push('年齢は18歳以上100歳以下で入力してください');
  }

  if (!['男性', '女性', 'その他'].includes(data.gender)) {
    errors.push('性別を選択してください');
  }

  if (!data.location || data.location.trim().length < 1) {
    errors.push('居住地を選択してください');
  }

  if (!['男性', '女性', 'その他'].includes(data.lookingFor)) {
    errors.push('探している相手の性別を選択してください');
  }

  if (!data.ageRangeMin || data.ageRangeMin < 18 || data.ageRangeMin > 100) {
    errors.push('希望年齢範囲（最小）が無効です');
  }

  if (!data.ageRangeMax || data.ageRangeMax < 18 || data.ageRangeMax > 100) {
    errors.push('希望年齢範囲（最大）が無効です');
  }

  if (data.ageRangeMin > data.ageRangeMax) {
    errors.push('希望年齢範囲が正しくありません');
  }

  return errors;
}

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

  // バリデーション
  const validationErrors = validateUserInput(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'バリデーションエラー',
      details: validationErrors
    });
  }

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

// マッチング履歴取得
router.get('/:lineUserId/matches', (req, res) => {
  const { lineUserId } = req.params;

  // まずユーザーIDを取得
  db.get('SELECT id FROM users WHERE line_user_id = ?', [lineUserId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // マッチング履歴を取得
    db.all(
      `SELECT
        m.*,
        u1.display_name as user1_name,
        u1.age as user1_age,
        u1.gender as user1_gender,
        u2.display_name as user2_name,
        u2.age as user2_age,
        u2.gender as user2_gender
       FROM matches m
       INNER JOIN users u1 ON m.user1_id = u1.id
       INNER JOIN users u2 ON m.user2_id = u2.id
       WHERE m.user1_id = ? OR m.user2_id = ?
       ORDER BY m.created_at DESC`,
      [user.id, user.id],
      (err, matches) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ matches });
      }
    );
  });
});

// 予約中の時間枠取得
router.get('/:lineUserId/time-slots', (req, res) => {
  const { lineUserId } = req.params;

  // まずユーザーIDを取得
  db.get('SELECT id FROM users WHERE line_user_id = ?', [lineUserId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 時間枠を取得
    db.all(
      `SELECT * FROM time_slots
       WHERE user_id = ? AND status = 'waiting'
       ORDER BY date DESC, time DESC`,
      [user.id],
      (err, timeSlots) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ timeSlots });
      }
    );
  });
});

// 時間枠キャンセル
router.delete('/:lineUserId/time-slots/:timeSlotId', (req, res) => {
  const { lineUserId, timeSlotId } = req.params;

  // ユーザーIDを取得
  db.get('SELECT id FROM users WHERE line_user_id = ?', [lineUserId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 時間枠の所有者を確認してから削除
    db.get(
      'SELECT * FROM time_slots WHERE id = ? AND user_id = ?',
      [timeSlotId, user.id],
      (err, timeSlot) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!timeSlot) {
          return res.status(404).json({ error: 'Time slot not found or unauthorized' });
        }

        if (timeSlot.status !== 'waiting') {
          return res.status(400).json({ error: 'この時間枠はキャンセルできません' });
        }

        // 削除
        db.run('DELETE FROM time_slots WHERE id = ?', [timeSlotId], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          console.log('✅ Time slot cancelled:', timeSlotId);
          res.json({ success: true, message: '予約をキャンセルしました' });
        });
      }
    );
  });
});

// ユーザー情報取得（最後に配置して他のルートと競合しないように）
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
