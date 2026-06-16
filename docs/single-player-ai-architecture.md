# 單人模式 AI 對手技術架構

## 1. 目標

在既有 Kalah MVP 上新增單人模式，讓玩家可選擇與 AI 對戰，並區分三種難度：

- Easy：不會太笨，能做基本連步與明顯攻擊
- Medium：略強於一般玩家，使用淺層 minimax 與候選步過濾
- Hard：使用搜尋演算法做多步推演

本文件聚焦在現有前端單檔架構下，如何以低風險方式擴充，不破壞目前動畫與規則流程。

## 2. 現況摘要

目前核心邏輯集中在 [script.js](C:\Users\User\OneDrive\文件\Kalah_童年回憶計畫\script.js)：

- `state` 管理棋盤、回合、動畫、擲幣與結算狀態
- `makeMove(startIndex)` 負責實際落子、動畫、吃子、再走一手與換手
- `canSelect(index)` 控制玩家是否可點擊某洞
- `maybeEndGame()` 負責收尾與勝負判定
- `render()` 負責 UI 更新

現況特性：

- 規則邏輯與動畫邏輯耦合在同一個 `makeMove`
- 棋盤資料結構為 `number[][]`，每顆石子保留原始玩家顏色
- 目前只有雙人同機，沒有模式切換與 AI 決策層

## 3. 架構原則

- 保留現有 UI 與動畫效果，不重寫整個遊戲
- 將「規則模擬」與「畫面動畫」拆開
- AI 只操作純資料，不直接碰 DOM
- 難度差異建立在同一套 move generator 上，避免規則分叉
- 先支援同步主執行緒版本；Hard 若效能不足，再升級為 Web Worker

## 4. 建議模組拆分

建議把 [script.js](C:\Users\User\OneDrive\文件\Kalah_童年回憶計畫\script.js) 逐步拆成以下模組：

- `game/constants.js`
  - 棋盤常數、玩家編號、洞位索引
- `game/rules.js`
  - 純規則層
  - `createInitialBoard()`
  - `getLegalMoves(board, player)`
  - `simulateMove(board, player, pitIndex)`
  - `isTerminal(board)`
  - `finalizeBoard(board)`
  - `getScores(board)`
- `game/evaluator.js`
  - AI 評分函式
  - `evaluateBoard(board, player, profile)`
- `game/ai.js`
  - `chooseAiMove(gameState, difficulty)`
  - Easy / Medium / Hard 策略入口
- `game/controller.js`
  - 管理模式、人類與 AI 回合切換
  - 串接現有 `render()` 與動畫版 `makeMove`
- `ui/menu.js`
  - 模式、先手、難度選單

若本輪不做大拆分，也建議先抽出兩個最關鍵函式：

- `simulateMoveSnapshot(board, player, pitIndex)`
- `getLegalMovesSnapshot(board, player)`

這兩個函式先從現有 `makeMove()` 中抽規則，不含動畫。

## 5. 新增狀態模型

在現有 `state` 上新增：

```js
const state = {
  mode: "pvp", // "pvp" | "pve"
  aiDifficulty: "easy", // "easy" | "medium" | "hard"
  humanPlayer: 1,
  aiPlayer: 2,
  aiThinking: false,
  aiThinkDelayMs: 520,
};
```

用途：

- `mode`：區分雙人與單人
- `aiDifficulty`：控制 AI 決策策略
- `humanPlayer` / `aiPlayer`：支援未來加入選擇先後手
- `aiThinking`：AI 思考中時禁止人類連點
- `aiThinkDelayMs`：保留節奏感，避免 AI 秒下破壞體驗

## 6. 回合控制流程

### 6.1 單人模式主流程

1. 玩家開始新局
2. 選擇 `PVP` 或 `PVE`
3. 若為 `PVE`，設定難度與先手
4. 擲幣或直接由設定決定先手
5. 每次 `makeMove()` 結束後，由 controller 判斷是否輪到 AI
6. 若輪到 AI：
   - 設定 `state.aiThinking = true`
   - 延遲 `aiThinkDelayMs`
   - 呼叫 `chooseAiMove(...)`
   - 將結果送入既有動畫版 `makeMove(bestPitIndex)`
7. 若 AI 因再走一手而續行，重複步驟 6
8. 若終局，沿用既有結果面板

### 6.2 建議新增入口

```js
async function maybeRunAiTurn() {
  if (state.mode !== "pve") return;
  if (state.gameOver || state.awaitingCoinToss || state.animating) return;
  if (state.activePlayer !== state.aiPlayer) return;

  state.aiThinking = true;
  render();
  await sleep(state.aiThinkDelayMs);

  const move = chooseAiMove(getGameSnapshot(), state.aiDifficulty);
  state.aiThinking = false;

  if (move != null) {
    await makeMove(move);
  }
}
```

然後在以下節點呼叫：

- `tossCoin()` 結束後
- `makeMove()` 結束並完成 `render()` 後
- `resetGame()` 完成初始設定後，若 AI 先手則觸發

## 7. 規則模擬層設計

AI 不能直接依賴 `makeMove()`，因為該函式包含動畫、sleep 與 DOM 操作。需要一個純資料版模擬器。

### 7.1 輸入輸出

```js
function simulateMove(board, player, startIndex) {
  return {
    board: nextBoard,
    nextPlayer,
    extraTurn,
    captureCount,
    lastIndex,
    gameOver,
    scores: { 1: 24, 2: 19 },
  };
}
```

### 7.2 資料表示建議

目前 `board` 為 `number[][]`，適合動畫渲染，但對 AI 運算偏重。建議新增一層壓縮表示：

```js
// 只存每格數量，供 AI 搜尋使用
type CountBoard = number[]; // length = 14
```

轉換方式：

- 畫面層維持原本 `number[][]`
- AI 層將其投影成 `number[]`
- 模擬時只處理數量，不保留石子顏色

理由：

- Kalah 的合法性、吃子、終局判定只需要數量，不需要每顆石子的顏色
- 可大幅降低 Hard 模式搜尋成本

### 7.3 必備純函式

- `toCountBoard(boardWithStones)`
- `cloneCountBoard(countBoard)`
- `getLegalMoves(countBoard, player)`
- `simulateMove(countBoard, player, pitIndex)`
- `collectRemainingStones(countBoard)`
- `getWinner(countBoard)`

## 8. 難度設計

三種難度共用 `getLegalMoves()` 與 `simulateMove()`，只在「如何選 move」不同。

### 8.1 Easy

目標：像會下 Kalah 的新手，不做深搜，但不會蠢到放掉明顯好步。

策略：

- 先列出所有合法步
- 套用一層簡單 tactical scan，優先辨識：
  - 可以落在自己棋庫再走一手
  - 可以直接吃子
  - 對手剛暴露的明顯弱點，例如可被立即吃子或可被壓制的空洞
- 若存在上述高價值步，從其中挑選
- 若沒有明顯好步，再從一般合法步中做帶權選擇，而不是純隨機

特性：

- 仍然會失誤，但不會錯過太明顯的連步或攻擊
- 對初學者仍有壓力，但不應像完整搜尋 AI

建議公式：

```js
score = extraTurnBonus + captureBonus + antiBlunderBonus + smallRandomNoise
```

### 8.2 Medium

目標：略強於 Easy，能做淺層推演，且盡量避免明顯送分。

策略：

- 使用淺層 minimax，建議深度 2 到 4 plies
- 在正式搜尋前先做 candidate filter，先排除或降權以下步：
  - 走完後讓對手下回合可直接大吃
  - 無收益且明顯惡化棋庫差
  - 把本方節奏讓給對手的低價值步
- 對保留下來的候選步做 heuristic + shallow minimax 評估
- 最終選步採機率混合，而非每次都拿絕對最佳

決策分布：

- 70%：從 filter 後的高分候選中選「聰明步」
- 29%：選「貪婪或淺白攻擊步」，例如立即吃子、立即拿分、短線壓制
- 1%：允許犯蠢，從低分但合法步中抽樣，保留人味

特性：

- 會比 Easy 更穩定，較少放槍
- 不會像 Hard 一樣每手都走最強解
- 因為保留少量非最佳決策，對局不會過度機械

評分重點：

- 棋庫分差
- 再走一手價值
- 吃子價值
- 避免送對手大吃
- 優先保留後續可再走位置

建議權重：

```txt
storeDiff * 9
+ extraTurn * 7
+ captureCount * 5
- opponentBestCapture * 7
- emptySideRisk * 4
```

候選步 filter 建議：

```js
function filterMediumCandidates(moves) {
  return moves.filter((move) => {
    return !move.givesOpponentBigCapture && !move.isSevereBlunder;
  });
}
```

### 8.3 Hard

目標：具競爭力，能做多步推演。

策略：

- 使用 minimax + alpha-beta pruning
- 搜尋深度建議 6 plies 起跳
- 若遇到再走一手，視為同一方續搜，不立即切換 maximizing/minimizing
- 對局後期依剩餘石子數或合法步數動態加深

建議深度：

- 開局：6 plies
- 中盤：8 plies
- 殘局：10 plies

若主執行緒卡頓，可調整為：

- 預設 6 plies
- 限制思考時間 120ms ~ 250ms
- 未來升級 iterative deepening + Web Worker

## 9. Hard 模式搜尋設計

### 9.1 節點函式

```js
function search(board, player, depth, alpha, beta, rootPlayer) {
  if (depth === 0 || isTerminal(board)) {
    return evaluateBoard(board, rootPlayer);
  }

  const moves = orderMoves(getLegalMoves(board, player), board, player);

  if (player === rootPlayer) {
    let best = -Infinity;
    for (const move of moves) {
      const result = simulateMove(board, player, move);
      const nextDepth = result.extraTurn ? depth : depth - 1;
      const value = search(
        result.board,
        result.nextPlayer,
        nextDepth,
        alpha,
        beta,
        rootPlayer
      );
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    const result = simulateMove(board, player, move);
    const nextDepth = result.extraTurn ? depth : depth - 1;
    const value = search(
      result.board,
      result.nextPlayer,
      nextDepth,
      alpha,
      beta,
      rootPlayer
    );
    best = Math.min(best, value);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}
```

### 9.2 Move ordering

Hard 模式先排序可大幅提升剪枝效率。排序優先級：

1. 可再走一手
2. 可直接吃子
3. 能提升棋庫差距
4. 較不容易讓對手下回合獲得高收益

## 10. 評分函式設計

Medium / Hard 共用同一份 heuristic evaluator，但使用深度與候選策略不同。

### 10.1 評估指標

- `storeDiff`
  - 自己棋庫 - 對手棋庫
- `sideStoneDiff`
  - 自己側石子總數 - 對手側石子總數
- `extraTurnCount`
  - 當前可立即獲得再走一手的步數
- `capturePotential`
  - 當前可立即吃子的潛力
- `opponentCaptureThreat`
  - 對手下一手吃子威脅
- `endgameControl`
  - 是否接近主動清空一側並領先收尾

### 10.2 建議權重

```txt
score =
  storeDiff * 12
+ sideStoneDiff * 2
+ extraTurnCount * 7
+ capturePotential * 5
- opponentCaptureThreat * 6
+ endgameControl * 8
```

備註：

- 權重需靠實測微調
- 不建議一開始就做過度複雜的 pattern evaluator

## 11. UI / UX 調整

建議在 [index.html](C:\Users\User\OneDrive\文件\Kalah_童年回憶計畫\index.html) 新增一塊模式控制區：

- 模式：`雙人對戰` / `單人對戰`
- 難度：`Easy` / `Medium` / `Hard`
- 先手：`玩家先` / `AI 先` / `擲幣`

互動規則：

- AI 思考中顯示 `AI 思考中...`
- AI 回合期間禁用棋盤點擊
- Result overlay 額外顯示模式與難度

## 12. 相容既有動畫的整合方式

保留目前 `makeMove()` 作為「有動畫的真實落子」。

新增：

- `simulateMove()`：純規則，給 AI 搜尋
- `makeMove()`：玩家或 AI 確定選好洞後，真正執行動畫與畫面更新

這樣可以避免：

- AI 搜尋時觸發 DOM 操作
- 搜尋時產生大量 `sleep()`
- 規則與視覺互相污染

## 13. 實作順序

### Phase 1：規則抽離

- 從 `makeMove()` 抽出純資料版 `simulateMove()`
- 建立 `getLegalMoves()`
- 寫單元測試覆蓋：
  - 合法落子
  - 跳過對手棋庫
  - 再走一手
  - 吃子
  - 終局收子

### Phase 2：單人模式骨架

- 在 state 加入 `mode / aiDifficulty / aiPlayer / aiThinking`
- 加入模式與難度 UI
- 在回合結束後自動觸發 `maybeRunAiTurn()`

### Phase 3：Easy / Medium

- Easy：基本 tactical scan，至少會抓連步與明顯攻擊
- Medium：candidate filter + 淺層 minimax + 機率混合決策
- 驗證不會出現非法步與卡死

### Phase 4：Hard

- 實作 minimax + alpha-beta
- 做 move ordering
- 加入深度與時間上限
- 針對效能做 profiling

### Phase 5：效能優化

- 若有卡頓，再把 Hard 搜尋搬進 Web Worker
- 可加入 transposition table（非首版必需）

## 14. 測試策略

### 14.1 單元測試

針對 `rules.js`：

- `simulateMove()` 基本播子
- 再走一手判定
- 吃子判定
- 終局收尾
- 無合法步時終局

針對 `ai.js`：

- Easy 只會回傳合法步
- Easy 遇到可再走一手或明顯可吃子時，不應長期漏選
- Medium 應先過濾明顯 blunder，再從高分候選中依機率分布選步
- Hard 遇到可立即勝利步時應選勝利步

### 14.2 整合測試

- 玩家下完後 AI 自動接手
- AI 再走一手時可連續行動
- 終局 overlay 正確
- reset 後不殘留 `aiThinking`

### 14.3 手動驗證

- PVP 不應被單人模式影響
- 擲幣後若 AI 先手，能正常開始
- 快速連點不會造成 AI 與玩家回合同步錯亂

## 15. 風險與對策

### 15.1 規則抽離時複製錯誤

風險：

- 動畫版 `makeMove()` 與 AI 模擬版 `simulateMove()` 行為不一致

對策：

- 先以現有 `makeMove()` 的規則為基準寫測試
- 所有規則邏輯集中在 `rules.js`

### 15.2 Hard 模式卡 UI

風險：

- 深度搜尋在低效裝置上造成卡頓

對策：

- 首版限制深度與思考時間
- 必要時升級 Web Worker

### 15.3 AI 顯得不自然

風險：

- Medium / Hard 每局都走固定套路
  - Medium 過度固定會失去「像人在下」的感覺

對策：

- 在同分步中加入小幅隨機 tie-break
- Easy / Medium 保留少量 noise
- Medium 使用 `70 / 29 / 1` 的決策混合，避免每手都完全最佳化

## 16. 建議 MVP 範圍

第一版建議只做：

- 單人模式切換
- 難度選擇 Easy / Medium / Hard
- 玩家固定紅方，AI 固定紫方
- 擲幣保留
- Hard 使用 6-ply alpha-beta

先不要做：

- AI 對 AI
- 線上對戰
- 學習型 AI
- 複雜開局資料庫

## 17. 結論

最關鍵的技術決策不是先寫 AI，而是先把「規則模擬」從目前的動畫流程中抽離。  
完成 `simulateMove()` + `getLegalMoves()` 後，Easy / Medium / Hard 只是不同的決策層：

- Easy：基本 tactical scan，會抓連步與明顯失誤
- Medium：帶 filter 的淺層 minimax，並用 `70 / 29 / 1` 做混合決策
- Hard：minimax + alpha-beta 搜尋

這個架構能在最小幅度動到現有 UI 的前提下，穩定擴充單人模式，並為後續 Web Worker、更多難度、AI 先手設定保留空間。
