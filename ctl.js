// 人数選択してフォーム画面へ
function navigate() {
  const memberNum = document.querySelector('select[name="member_num"]').value;
  if (memberNum >= 1 && memberNum <= 5) {
    localStorage.setItem('playerCount', memberNum); // 選択された人数を保存
    window.location.href = `form.html`; // フォームページに遷移
  } else {
    alert("無効な選択です");
  }
}

// スコア計算＆累積データ保存
function calculateAndStore() {
  const playerCount = localStorage.getItem('playerCount'); // 選択された人数
  let players = JSON.parse(localStorage.getItem('players')) || []; // 既存データ取得

  for (let i = 1; i <= playerCount; i++) {
    const playerName = document.getElementById(`name${i}`).value || `${i}人目`;
    const perfect = Number(document.getElementById(`perfect${i}`).value) || 0;
    const great = Number(document.getElementById(`great${i}`).value) || 0;
    const good = Number(document.getElementById(`good${i}`).value) || 0;
    const bad = Number(document.getElementById(`bad${i}`).value) || 0;
    const miss = Number(document.getElementById(`miss${i}`).value) || 0;

    // スコア計算
    //const sum = perfect * 3 + great * 2 + good * 1;
    const sum = perfect;

    // 既存データに加算（累積）
    let existingPlayer = players.find(p => p.name === playerName);
    if (existingPlayer) {
      existingPlayer.score += sum; // スコアを加算
    } else {
      players.push({ name: playerName, score: sum }); // 新規プレイヤー追加
    }
  }

  // ローカルストレージに保存
  localStorage.setItem('players', JSON.stringify(players));

  console.log("プレイヤーデータ:", players); // デバッグ用
  window.location.href = 'result.html'; // 結果ページへ遷移
}

function continueInput() {
  let players = JSON.parse(localStorage.getItem('players')) || [];

  // プレイヤー名を保持し、スコアをリセット
  let updatedPlayers = players.map(player => ({
      name: player.name,  // 名前は保持
      perfect: 0,  // perfect をリセット
      great: 0,  // great もリセット
      good: 0,  // good もリセット
      bad: 0,
      miss: 0,
      points: player.points  // 得点は維持
  }));

  localStorage.setItem('players', JSON.stringify(updatedPlayers)); // 更新
  window.location.href = 'form.html'; // 入力画面へ遷移
}
// スコア入力フォームの動的生成
window.onload = function () {
  const playerCount = localStorage.getItem('playerCount');
  const players = JSON.parse(localStorage.getItem('players')) || [];
  const container = document.getElementById('players-container');

  if (container) {
      for (let i = 1; i <= playerCount; i++) {
          // プレイヤー名を取得
          let playerName = players[i - 1] ? players[i - 1].name : `プレイヤー${i}`;

          // フォーム生成
          const form = `
            <div class="form-group">
              <h2>${playerName}</h2>
              <label>名前: <input type="text" id="name${i}" value="${playerName}"></label><br>
              <label>Perfect: <input type="number" id="perfect${i}" value="0"></label><br>
              <label>Great: <input type="number" id="great${i}" value="0"></label><br>
              <label>Good: <input type="number" id="good${i}" value="0"></label><br>
              <label>Bad: <input type="number" id="bad${i}" value="0"></label><br>
              <label>Miss: <input type="number" id="miss${i}" value="0"></label><br>
            </div>`;
          container.insertAdjacentHTML('beforeend', form);
      }
  }
};

  // 結果ページならスコア表示
  if (document.getElementById('results-container')) {
    displayResults();
  }

  else if (document.getElementById('results-container')) {
    localStorage.removeItem('players'); // 🔄 スコアをリセット
    displayResults();
  }

// スコア結果を表示（修正済み）
function displayResults() {
  let players = JSON.parse(localStorage.getItem('players')) || [];
  const container = document.getElementById('results-container');
  container.innerHTML = ""; // 一旦クリア

  if (players.length === 0) {
      container.innerHTML = '<p>スコアデータがありません。</p>';
      return;
  }

  console.log("取得したプレイヤーデータ:", players);

  // 既存データを取得（スコアはそのまま保持）
  let existingPlayers = JSON.parse(localStorage.getItem('players')) || [];
  players.forEach(player => {
      let existingPlayer = existingPlayers.find(p => p.name === player.name);
      if (existingPlayer) {
          existingPlayer.score += player.perfect || 0; // 新しいスコア（perfect数）を加算
      } else {
          player.score = player.perfect || 0;
          player.points = 0; // 初期値を設定
          existingPlayers.push(player);
      }
  });

  console.log("スコア更新後のプレイヤーデータ:", existingPlayers);

  // Perfect（スコア）の降順ソート
  existingPlayers.sort((a, b) => b.score - a.score);
  
  let rankPoints = {}; // 順位ごとのポイントマッピング
  let currentRank = 1;
  let lastScore = null;
  let point = existingPlayers.length; // 最下位が1点
  let lastPoint = point; // 同順位の場合のポイントを統一
  
  existingPlayers.forEach((player, index) => {
      if (lastScore !== null && player.score !== lastScore) {
          currentRank = index + 1; // 順位更新
          lastPoint = point; // 新しい順位のポイント更新
      }
      rankPoints[player.name] = lastPoint; // プレイヤーごとにポイントを記録
      lastScore = player.score;
      point--; // 次の順位へ
  });
  
  console.log("計算された順位ポイント:", rankPoints);
  
  // 得点を累積加算（スコアは維持したまま）
  existingPlayers.forEach(player => {
      player.points = (player.points || 0) + rankPoints[player.name];
  });

  console.log("得点計算後のプレイヤーデータ:", existingPlayers);
  
  localStorage.setItem('players', JSON.stringify(existingPlayers));
  
  // 順位付き表示
  container.innerHTML = "";
  let lastPoints = null;
  let displayRank = 1;
  existingPlayers.forEach((player, index) => {
      if (lastPoints !== null && player.points !== lastPoints) {
          displayRank = index + 1; // 同じ得点なら同順位
      }
      const result = `<p>${displayRank}位: ${player.name} - 得点: ${player.points}</p>`;
      container.insertAdjacentHTML('beforeend', result);
      lastPoints = player.points;
  });
}

// 続けて入力時にスコアのみリセット
function continueInput() {
  let players = JSON.parse(localStorage.getItem('players')) || [];
  players.forEach(player => {
      player.score = 0; // スコアのみリセット
  });
  localStorage.setItem('players', JSON.stringify(players));
  window.location.href = 'form.html'; // スコア入力ページへ
}

// ディスコード送信
function sendToDiscord() {
  const webhookURL = "https://discord.com/api/webhooks/1339979827788382290/-h8YOx5UDfZmv39LJFndsZUDxMkxinEBoJ1bhthrAWO1s-tU0nuGk6dasHqyUb8SPo3m";
  let players = JSON.parse(localStorage.getItem('players')) || [];
  
  if (players.length === 0) {
      alert("スコアデータがありません！");
      return;
  }
  
  // 得点降順ソート
  players.sort((a, b) => b.points - a.points);
  
  // 送信メッセージ作成
  let message = "**🏆 試合結果 🏆**\n";
  let lastPoints = null;
  let displayRank = 1;
  players.forEach((player, index) => {
      if (lastPoints !== null && player.points !== lastPoints) {
          displayRank = index + 1; // 同じ得点なら同順位
      }
      message += `**${displayRank}位:** ${player.name} - 得点: ${player.points}\n`;
      lastPoints = player.points;
  });
  
  console.log("Discord送信メッセージ:", message);
  
  // Discordに送信
  const payload = JSON.stringify({ content: message });
  fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload
  })
  .then(response => {
      if (response.ok) {
          alert("✅ Discordに送信完了！");
      } else {
          alert("❌ 送信エラー！");
      }
  })
  .catch(error => {
      console.error("エラー:", error);
      alert("❌ 送信失敗！");
  });
}
