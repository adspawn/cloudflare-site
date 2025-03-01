export default {
    async fetch(request, env, ctx) {
        // バーコードバトラーIIのHTML（簡略化版）
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>バーコードバトラーII 完全再現シミュレーター</title>
    <style>
        body { font-family: sans-serif; background: #eef; padding: 20px; }
        h1 { text-align: center; }
        form { max-width: 800px; margin: 0 auto 20px; background: #fff; padding: 20px; 
              border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); }
        label, input, button { display: block; width: 100%; margin-bottom: 15px; }
        input { font-size: 18px; padding: 10px; }
        button { font-size: 18px; padding: 10px; border: none; border-radius: 4px; 
                cursor: pointer; background: #007acc; color: #fff; }
        button:hover { background: #005fa3; }
        .reset-btn { background: #d9534f; }
        .reset-btn:hover { background: #c9302c; }
        .result { max-width: 800px; margin: 0 auto; background: #fff; padding: 15px; 
                 border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); 
                 white-space: pre-wrap; font-family: monospace; }
    </style>
</head>
<body>
    <h1>バーコードバトラーII 完全再現シミュレーター</h1>
    <form id="barcodeForm">
        <label for="barcodeInput">バーコードを入力（8桁または13桁）:</label>
        <input type="text" id="barcodeInput" placeholder="例: 4901234567890" required>
        <button type="submit">召喚</button>
        <button type="button" id="resetButton" class="reset-btn">リセット</button>
    </form>
    <div class="result" id="result"></div>
    <script>
        // フォームの送信イベントを処理
        document.getElementById('barcodeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('barcodeInput').value.trim();
            
            // バーコードの検証
            if (!/^\\d{8}$|^\\d{13}$/.test(code)) {
                document.getElementById('result').textContent = 'バーコードは8桁または13桁の数字を入力してください。';
                return;
            }
            
            // 結果を表示（実際のロジックはもっと複雑ですが、簡略化しています）
            let result = 'バーコード: ' + code + '\\n';
            if (code.length === 8) {
                result += '種別: 後読み8桁バーコード\\n';
            } else {
                result += '種別: 13桁バーコード\\n';
            }
            result += '解析結果: ダミーデータ（デモ用）';
            
            document.getElementById('result').textContent = result;
        });
        
        // リセットボタン
        document.getElementById('resetButton').addEventListener('click', function() {
            document.getElementById('barcodeInput').value = '';
            document.getElementById('result').textContent = '';
        });
    </script>
</body>
</html>`;

        // HTML応答を返す
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'max-age=3600'
            }
        });
    }
}; 