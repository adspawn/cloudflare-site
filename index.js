export default {
    async fetch(request, env, ctx) {
        // リクエストURLを取得
        const url = new URL(request.url);

        // どのパスにアクセスしても同じindex.htmlを返す
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