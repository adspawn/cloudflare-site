// index.htmlのコンテンツを直接読み込む
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

export default {
    async fetch(request, env, ctx) {
        // リクエストURLを取得
        const url = new URL(request.url);

        // リクエストがルートパスまたはindex.htmlを直接指定している場合は、index.htmlの内容を返す
        // それ以外の場合も同様に処理（シングルページアプリケーション方式）
        const response = await fetch(new URL('/index.html', url.origin));

        // レスポンスを返す
        return new Response(await response.text(), {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'max-age=3600'
            }
        });
    }
};
