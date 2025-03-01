import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        // カスタム設定オプション
        const options = {
            // シングルページアプリケーションモードを有効に
            mapRequestToAsset: serveSinglePageApp,
            // Cloudflareが自動生成したKVネームスペースを使用
            ASSET_NAMESPACE: env.__STATIC_CONTENT
        };

        try {
            // オリジナルリクエストを試す（SPAモード有効）
            return await getAssetFromKV({
                request,
                env,
                waitUntil: ctx.waitUntil.bind(ctx),
                ...options
            });
        } catch (e) {
            console.error(`Error: ${e.message}`);
            // エラーの種類によって処理を分ける
            if (e.status === 404) {
                try {
                    // 明示的にindex.htmlを取得
                    const url = new URL(request.url);
                    const indexRequest = new Request(
                        `${url.origin}/index.html`,
                        request
                    );
                    return await getAssetFromKV({
                        request: indexRequest,
                        env,
                        waitUntil: ctx.waitUntil.bind(ctx),
                        ASSET_NAMESPACE: env.__STATIC_CONTENT
                    });
                } catch (indexError) {
                    console.error(`Index Error: ${indexError.message}`);
                    // index.htmlの取得にも失敗した場合
                    return new Response(`ページが見つかりませんでした。エラー詳細: ${indexError.message}`, {
                        status: 404,
                        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
                    });
                }
            }

            // その他のエラー
            return new Response(`エラーが発生しました: ${e.message}`, {
                status: e.status || 500,
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
            });
        }
    },
};
