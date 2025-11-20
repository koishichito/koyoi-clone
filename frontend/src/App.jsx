import { useEffect, useState } from 'react';
import liff from '@line/liff';
import axios from 'axios';

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2008407270-AWoJGo5k';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://koyoi-backend-production.up.railway.app/api';

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back

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
      console.log('🔄 Initializing LIFF with ID:', LIFF_ID);
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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: updatedInterests });
  };

  const nextStep = () => {
    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
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
      alert('プロフィール登録が完了しました！\nLINEのトークルームで「メニュー」と送信してください。');
      liff.closeWindow();
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('登録に失敗しました: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>読み込み中...</p>
      </div>
    );
  }

  // Step Components
  const renderStep = () => {
    const stepContent = () => {
      switch (currentStep) {
        case 0: // Welcome
          return (
            <div style={{ textAlign: 'center' }}>
              <h1>🌙 Koyoi</h1>
              <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--text-muted)' }}>
                今宵、素敵な出会いを。<br />あなただけの物語を始めましょう。
              </p>
              <button className="btn-next" onClick={nextStep} style={{ width: '100%', justifyContent: 'center' }}>
                プロフィールを作成する
              </button>
            </div>
          );

        case 1: // Display Name
          return (
            <>
              <h2>お名前を教えてください</h2>
              <input
                type="text"
                className="input-hero"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="ニックネーム"
                autoFocus
              />
            </>
          );

        case 2: // Age
          return (
            <>
              <h2>年齢はおいくつですか？</h2>
              <input
                type="number"
                className="input-hero"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="25"
                min="20"
                max="100"
                autoFocus
              />
            </>
          );

        case 3: // Gender
          return (
            <>
              <h2>性別を教えてください</h2>
              <div className="select-grid">
                {['男性', '女性', 'その他'].map(option => (
                  <div
                    key={option}
                    className={`select-card ${formData.gender === option ? 'selected' : ''}`}
                    onClick={() => handleChange('gender', option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </>
          );

        case 4: // Location
          return (
            <>
              <h2>お住まいはどちらですか？</h2>
              <div className="select-grid">
                {['東京', '大阪', '名古屋', '福岡', '札幌', 'その他'].map(option => (
                  <div
                    key={option}
                    className={`select-card ${formData.location === option ? 'selected' : ''}`}
                    onClick={() => handleChange('location', option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </>
          );

        case 5: // Interests
          return (
            <>
              <h2>興味・趣味はありますか？</h2>
              <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>複数選択可能です</p>
              <div className="chip-cloud">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`chip-lg ${formData.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </>
          );

        case 6: // Bio
          return (
            <>
              <h2>自己紹介をお願いします</h2>
              <textarea
                className="input-hero"
                style={{ fontSize: '1.2rem', textAlign: 'left', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}
                rows="5"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="趣味や休日の過ごし方など..."
              />
            </>
          );

        case 7: // Looking For
          return (
            <>
              <h2>どのようなお相手をお探しですか？</h2>
              <div className="select-grid">
                {['男性', '女性', 'その他'].map(option => (
                  <div
                    key={option}
                    className={`select-card ${formData.lookingFor === option ? 'selected' : ''}`}
                    onClick={() => handleChange('lookingFor', option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </>
          );

        case 8: // Age Range
          return (
            <>
              <h2>希望する年齢層は？</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <input
                  type="number"
                  className="input-hero"
                  style={{ width: '80px' }}
                  value={formData.ageRangeMin}
                  onChange={(e) => handleChange('ageRangeMin', e.target.value)}
                />
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>〜</span>
                <input
                  type="number"
                  className="input-hero"
                  style={{ width: '80px' }}
                  value={formData.ageRangeMax}
                  onChange={(e) => handleChange('ageRangeMax', e.target.value)}
                />
              </div>
              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>歳</p>
            </>
          );

        case 9: // Review
          return (
            <>
              <h2>確認</h2>
              <div className="select-grid" style={{ textAlign: 'left' }}>
                <div className="select-card" style={{ cursor: 'default', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>お名前</p>
                  <p>{formData.displayName}</p>
                </div>
                <div className="select-card" style={{ cursor: 'default', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>年齢 / 性別</p>
                  <p>{formData.age}歳 / {formData.gender}</p>
                </div>
                <div className="select-card" style={{ cursor: 'default', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>居住地</p>
                  <p>{formData.location}</p>
                </div>
              </div>
              <button className="btn-next" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}>
                登録する
              </button>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <div className="wizard-step animate-slide-in" key={currentStep}>
        {stepContent()}

        {currentStep > 0 && currentStep < 9 && (
          <div className="nav-buttons">
            <button className="btn-back" onClick={prevStep}>
              戻る
            </button>
            <button className="btn-next" onClick={nextStep}>
              次へ <span>→</span>
            </button>
          </div>
        )}
        {currentStep === 9 && (
          <div className="nav-buttons" style={{ justifyContent: 'center' }}>
            <button className="btn-back" onClick={prevStep}>
              修正する
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="noise-overlay"></div>
      {/* Progress Bar */}
      {currentStep > 0 && (
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          ></div>
        </div>
      )}

      {renderStep()}
    </div>
  );
}

export default App;
