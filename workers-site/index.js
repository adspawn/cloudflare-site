import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
            return await getAssetFromKV({ request, env });
        } catch (e) {
            return new Response('404 Not Found', { status: 404 });
        }
    },
};
