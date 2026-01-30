interface Env {
    TURNSTILE_SECRET_KEY: string;
}

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes': string[];
    challenge_ts?: string;
    hostname?: string;
}

/**
 * Cloudflare Turnstile 토큰을 검증하고, 유효한 경우 인증 쿠키를 설정합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-30
 */
export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;
    
    try {
        const body = await request.json() as { token: string };
        const token = body.token;
        const ip = request.headers.get('CF-Connecting-IP');

        // Verify the token with Cloudflare
        const formData = new FormData();
        formData.append('secret', env.TURNSTILE_SECRET_KEY);
        formData.append('response', token);
        if (ip) {
            formData.append('remoteip', ip);
        }

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json() as TurnstileVerifyResponse;

        if (!outcome.success) {
            console.error('Turnstile verification failed:', outcome);
            return new Response(JSON.stringify({ 
                error: 'Invalid token', 
                details: outcome['error-codes'] 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verification successful
        // Set a cookie valid for 1 hour (or as desired)
        // Note: For better security, sign this cookie or combine with session
        // Here we use a simple flag. In production, use Hmac or ensure domain restriction.
        const headers = new Headers();
        headers.append('Set-Cookie', `human_verified=true; Path=/; Max-Age=3600; Secure; SameSite=Lax; HttpOnly`);
        headers.append('Content-Type', 'application/json');

        return new Response(JSON.stringify({ success: true }), {
            headers,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
