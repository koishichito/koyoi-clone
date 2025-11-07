/**
 * 包括的なテストスクリプト
 * すべての機能をテストして結果を出力
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let testsPassed = 0;
let testsFailed = 0;

async function runTests() {
  console.log('🧪 Koyoi マッチングアプリ - 包括的テスト開始\n');
  console.log('='.repeat(60));

  // テスト1: ユーザー登録（正常）
  await test('ユーザー登録（正常データ）', async () => {
    const response = await axios.post(`${API_BASE}/users`, {
      lineUserId: 'test_user_full_' + Date.now(),
      displayName: 'テスト太郎',
      age: 28,
      gender: '男性',
      bio: 'よろしくお願いします',
      location: '東京',
      interests: ['旅行', 'グルメ'],
      lookingFor: '女性',
      ageRangeMin: 23,
      ageRangeMax: 35,
      profileImageUrl: 'https://example.com/test.jpg'
    });

    if (response.data.success && response.data.userId) {
      return true;
    }
    throw new Error('ユーザーIDが返されませんでした');
  });

  // テスト2: ユーザー登録（バリデーションエラー）
  await test('ユーザー登録（バリデーションエラー）', async () => {
    try {
      await axios.post(`${API_BASE}/users`, {
        lineUserId: 'invalid',
        displayName: '',
        age: 15,
        gender: '不明',
        location: '',
        lookingFor: '不明',
        ageRangeMin: 30,
        ageRangeMax: 20
      });
      throw new Error('バリデーションエラーが発生しませんでした');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return true;
      }
      throw error;
    }
  });

  // テスト3: ユーザー情報取得
  await test('ユーザー情報取得', async () => {
    // デモユーザーを使用
    const response = await axios.get(`${API_BASE}/users/demo_user_001`);

    if (response.data.display_name === '美咲' && response.data.age === 25) {
      return true;
    }
    throw new Error('ユーザー情報が正しくありません');
  });

  // テスト4: マッチング履歴取得
  await test('マッチング履歴取得', async () => {
    const response = await axios.get(`${API_BASE}/users/demo_user_001/matches`);

    if (response.data.matches !== undefined && Array.isArray(response.data.matches)) {
      return true;
    }
    throw new Error('マッチング履歴の形式が正しくありません');
  });

  // テスト5: 時間枠取得
  await test('時間枠取得', async () => {
    const response = await axios.get(`${API_BASE}/users/demo_user_001/time-slots`);

    if (response.data.timeSlots !== undefined && Array.isArray(response.data.timeSlots)) {
      return true;
    }
    throw new Error('時間枠の形式が正しくありません');
  });

  // テスト6: 存在しないユーザー
  await test('存在しないユーザー取得（404エラー）', async () => {
    try {
      await axios.get(`${API_BASE}/users/nonexistent_user_12345`);
      throw new Error('404エラーが発生しませんでした');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return true;
      }
      throw error;
    }
  });

  // テスト7: ヘルスチェック
  await test('ヘルスチェック', async () => {
    const response = await axios.get('http://localhost:3000/health');

    if (response.data.status === 'OK' && response.data.timestamp) {
      return true;
    }
    throw new Error('ヘルスチェックの形式が正しくありません');
  });

  // テスト結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 テスト結果サマリー\n');
  console.log(`✅ 成功: ${testsPassed}個`);
  console.log(`❌ 失敗: ${testsFailed}個`);
  console.log(`合計: ${testsPassed + testsFailed}個\n`);

  if (testsFailed === 0) {
    console.log('🎉 すべてのテストに合格しました！');
  } else {
    console.log('⚠️ いくつかのテストが失敗しました。');
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   エラー: ${error.message}`);
    testsFailed++;
  }
}

// メイン実行
runTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});
