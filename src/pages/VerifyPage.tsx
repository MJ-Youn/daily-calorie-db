import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui';

export const VerifyPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');

    // 환경 변수에서 Site Key를 가져옵니다. (Vite 환경 변수)
    // .env 파일에 VITE_TURNSTILE_SITE_KEY 정의 필요
    const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Test Site Key

    const handleSuccess = async (token: string) => {
        setStatus('verifying');
        setError(null);

        try {
            const res = await fetch('/api/verify-turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                setStatus('success');
                // 원래 가려던 페이지로 이동하거나 대시보드로 이동
                const next = searchParams.get('next') || '/dashboard';
                navigate(next, { replace: true });
            } else {
                const data = await res.json();
                setError(data.error || '인증에 실패했습니다. 다시 시도해주세요.');
                setStatus('idle');
            }
        } catch {
            setError('네트워크 오류가 발생했습니다.');
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
            <Card className="max-w-md w-full p-8 flex flex-col items-center text-center space-y-6 bg-white dark:bg-slate-900 shadow-xl border-gray-200 dark:border-slate-800">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <ShieldCheck className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">신원 확인중...</h1>
                    <p className="text-gray-500 dark:text-slate-400">안전한 서비스 이용을 위해 잠시 확인 절차를 진행합니다.</p>
                </div>

                <div className="min-h-[65px] flex justify-center w-full">
                    <Turnstile
                        siteKey={SITE_KEY}
                        onSuccess={handleSuccess}
                        onError={() => setError('Turnstile 로드에 실패했습니다.')}
                        options={{
                            theme: 'auto',
                            size: 'normal',
                        }}
                    />
                </div>

                {status === 'verifying' && <div className="text-sm text-blue-500 animate-pulse">확인 중입니다...</div>}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg w-full justify-center">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </Card>
        </div>
    );
};
