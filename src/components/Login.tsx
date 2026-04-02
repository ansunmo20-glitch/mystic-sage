import { Sparkles } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf6ef' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#c4a96e20' }}>
            <Sparkles className="w-8 h-8" style={{ color: '#c4a96e' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#2C2C2C' }}>Mystic Sage</h1>
          <p className="text-lg" style={{ color: '#5C5C5C' }}>
            A quiet space to think out loud
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl",
                cardBox: "shadow-xl",
              },
              variables: {
                colorBackground: '#ffffff',
                colorPrimary: '#c4a96e',
                colorText: '#2C2C2C',
                colorTextSecondary: '#5C5C5C',
                colorInputBackground: '#ffffff',
                colorInputText: '#2C2C2C',
                borderRadius: '0.75rem',
                colorDanger: '#c4a96e',
              }
            }}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#5C5C5C' }}>
            Free users: 1 session per week
          </p>
        </div>

        <p className="text-sm text-center mt-6" style={{ color: '#7C7C7C' }}>
          By signing in, you agree to our terms and privacy policy
        </p>
      </div>
    </div>
  );
}
