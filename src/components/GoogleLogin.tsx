import React, { useEffect, useState } from 'react';

const CLIENT_ID = '956221647882-5p38t1oraasem7jiqr6fg5mn87e266vd.apps.googleusercontent.com';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginProps {
  onLogin: (idToken: string) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            setUser(response.credential);
            onLogin(response.credential);
          }
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }, [onLogin]);

  return (
    <div>
      <div id="google-signin-btn"></div>
    {user && <div>已登入</div>}
    </div>
  );
};

export default GoogleLogin;
