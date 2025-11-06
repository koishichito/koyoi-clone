import { useEffect, useState } from 'react';
import liff from '@line/liff';
import axios from 'axios';
import './App.css';

const LIFF_ID = import.meta.env.VITE_LIFF_ID;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gender: '',
    bio: '',
    location: '',
    interests: [],
    lookingFor: '',
    ageRangeMin: 20,
    ageRangeMax: 40,
  });

  const interestOptions = [
    '旅行', 'グルメ', '映画', '音楽', 'スポーツ',
    '読書', 'アート', 'ゲーム', 'アウトドア', 'カフェ巡り'
  ];

  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      console.log('🔄 Initializing LIFF...');
      await liff.init({ liffId: LIFF_ID });

      if (!liff.isLoggedIn()) {
        console.log('🔐 Not logged in, redirecting...');
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      console.log('✅ Profile:', profile);
      setProfile(profile);

      // 既存データ取得
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${profile.userId}`);
        const userData = response.data;
        console.log('📋 Existing user data:', userData);

        setFormData({
          displayName: userData.display_name || profile.displayName,
          age: userData.age || '',
          gender: userData.gender || '',
          bio: userData.bio || '',
          location: userData.location || '',
          interests: userData.interests || [],
          lookingFor: userData.looking_for || '',
          ageRangeMin: userData.age_range_min || 20,
          ageRangeMax: userData.age_range_max || 40,
        });
      } catch (error) {
        console.log('ℹ️ New user');
        setFormData({
          ...formData,
          displayName: profile.displayName,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ LIFF initialization failed', error);
      alert('初期化に失敗しました: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestToggle = (interest) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: updatedInterests });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile) return;

    try {
      console.log('💾 Saving profile...');
      await axios.post(`${API_BASE_URL}/users`, {
        lineUserId: profile.userId,
        displayName: formData.displayName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        location: formData.location,
        interests: formData.interests,
        lookingFor: formData.lookingFor,
        ageRangeMin: parseInt(formData.ageRangeMin),
        ageRangeMax: parseInt(formData.ageRangeMax),
        profileImageUrl: profile.pictureUrl,
      });

      console.log('✅ Profile saved');

      // 成功メッセージを表示
      alert('プロフィール登録が完了しました！\nLINEのトークルームで「メニュー」と送信してください。');

      // LIFFを閉じる
      liff.closeWindow();
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('登録に失敗しました: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>🌙 Koyoi</h1>
        <p>プロフィール登録</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>表示名</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>年齢</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="20"
            max="100"
            required
          />
        </div>

        <div className="form-group">
          <label>性別</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">選択してください</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div className="form-group">
          <label>自己紹介</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            placeholder="あなたについて教えてください..."
          />
        </div>

        <div className="form-group">
          <label>居住地</label>
          <select name="location" value={formData.location} onChange={handleChange} required>
            <option value="">選択してください</option>
            <option value="東京">東京</option>
            <option value="大阪">大阪</option>
            <option value="名古屋">名古屋</option>
            <option value="福岡">福岡</option>
            <option value="札幌">札幌</option>
          </select>
        </div>

        <div className="form-group">
          <label>興味・趣味</label>
          <div className="interests-grid">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`interest-tag ${
                  formData.interests.includes(interest) ? 'selected' : ''
                }`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>探している相手の性別</label>
          <select name="lookingFor" value={formData.lookingFor} onChange={handleChange} required>
            <option value="">選択してください</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div className="form-group">
          <label>希望年齢範囲</label>
          <div className="age-range">
            <input
              type="number"
              name="ageRangeMin"
              value={formData.ageRangeMin}
              onChange={handleChange}
              min="20"
              max="100"
            />
            <span>〜</span>
            <input
              type="number"
              name="ageRangeMax"
              value={formData.ageRangeMax}
              onChange={handleChange}
              min="20"
              max="100"
            />
            <span>歳</span>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          保存してLINEに戻る
        </button>
      </form>
    </div>
  );
}

export default App;
