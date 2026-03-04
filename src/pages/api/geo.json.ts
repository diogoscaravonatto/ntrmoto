import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
    return new Response(
        JSON.stringify({
            ip: request.headers.get("cf-connecting-ip") || "127.0.0.1",
            city: request.headers.get("cf-ipcity") || "Cascavel",
            country: request.headers.get("cf-ipcountry") || "BR",
            continent: request.headers.get("cf-ipcontinent") || "SA",
            region: request.headers.get("cf-region") || "PR",
            regionCode: request.headers.get("cf-region-code") || "PR",
            latitude: request.headers.get("cf-iplatitude") || "",
            longitude: request.headers.get("cf-iplongitude") || "",
            timezone: request.headers.get("cf-timezone") || "America/Sao_Paulo",
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};
