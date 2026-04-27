import { useEffect, useState } from 'react';

function detectInAppBrowser(): 'kakao' | 'instagram' | 'facebook' | 'line' | 'other' | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return 'kakao';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV/i.test(ua)) return 'facebook';
  if (/Line\//i.test(ua)) return 'line';
  if (/NAVER|Twitter|Snapchat|TikTok/i.test(ua)) return 'other';
  return null;
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export default function InAppBrowserGuard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const browser = detectInAppBrowser();
    if (!browser) return;

    if (isAndroid()) {
      const url = window.location.href;
      window.location.href =
        `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }

    // iOS는 강제 리다이렉트 불가 → 안내 모달
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: '#faf6ef',
        borderRadius: '16px',
        padding: '36px 24px',
        textAlign: 'center',
        maxWidth: '300px',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌿</div>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#3d3530', fontFamily: 'Georgia, serif' }}>
          Safari에서 열어주세요
        </h2>
        <p style={{ fontSize: '14px', color: '#7a6e66', lineHeight: 1.7, marginBottom: '20px' }}>
          카카오톡 내 브라우저에서는 로그인이 정상 작동하지 않아요.
        </p>
        <div style={{
          backgroundColor: '#f0ebe3',
          borderRadius: '10px',
          padding: '14px 16px',
          fontSize: '13px',
          color: '#5a4f47',
          lineHeight: 1.8,
          textAlign: 'left',
        }}>
          1. 오른쪽 하단 <strong>···</strong> 버튼 탭<br />
          2. <strong>"Safari로 열기"</strong> 선택
        </div>
      </div>
    </div>
  );
}
