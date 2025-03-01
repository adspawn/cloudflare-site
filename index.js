import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
            // オリジナルリクエストを試す
            return await getAssetFromKV({ request, env });
        } catch (e) {
            try {
                // 404エラーの場合、直接index.htmlをKVから取得
                const indexRequest = new Request(
                    `${new URL(request.url).origin}/index.html`,
                    request
                );
                return await getAssetFromKV({
                    request: indexRequest,
                    env
                });
            } catch (error) {
                // 最終的なフォールバック
                return new Response('ページが見つかりませんでした', {
                    status: 404,
                    headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
                });
            }
        }
    },
};
