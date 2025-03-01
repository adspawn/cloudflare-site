import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
            return await getAssetFromKV({ request, env });
        } catch (e) {
            // 404エラーの場合、index.htmlを返す
            const url = new URL(request.url);
            const newUrl = new URL('/index.html', url.origin);
            return fetch(newUrl.toString());
        }
    },
};
