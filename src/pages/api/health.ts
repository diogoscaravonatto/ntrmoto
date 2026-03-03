export const prerender = false;

export async function GET() {
    return new Response(JSON.stringify({ status: 'healthy', worker: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
