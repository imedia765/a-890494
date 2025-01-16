import LoginForm from '@/components/auth/LoginForm';
import CommitteeUpdate from '@/components/auth/CommitteeUpdate';
import MembershipExpectations from '@/components/auth/MembershipExpectations';
import ImportantInformation from '@/components/auth/ImportantInformation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Add detailed logging to track session and loading states
    console.log('Login page - Current state:', {
      hasSession: !!session,
      isLoading: loading,
      sessionDetails: session ? {
        user: session.user?.id,
        expiresAt: session.expires_at
      } : null
    });

    if (session && !loading) {
      console.log('Login page - Active session detected, redirecting to dashboard');
      navigate('/', { replace: true });
    } else if (!session && !loading) {
      console.log('Login page - No active session, showing login form');
    }
  }, [session, loading, navigate]);

  // Show loading state
  if (loading) {
    console.log('Login page - Loading state active');
    return (
      <div className="flex items-center justify-center min-h-screen bg-dashboard-dark">
        <Loader2 className="w-8 h-8 animate-spin text-dashboard-accent1" />
      </div>
    );
  }

  // Only render login page if there's no session and we're not loading
  if (!loading && !session) {
    console.log('Login page - Rendering login form');
    return (
      <div className="min-h-screen bg-dashboard-dark">
        {/* Header Banner */}
        <div className="w-full bg-dashboard-card/50 py-6 text-center border-b border-white/10">
          <p className="text-2xl text-white font-arabic mb-2 relative inline-block animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-dashboard-accent1/30 via-dashboard-accent1 to-dashboard-accent1/30 bg-[length:200%_100%] bg-clip-text text-transparent">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-sm text-dashboard-text">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-white mb-6">
                Pakistan Welfare Association
              </h1>
              <p className="text-dashboard-text text-lg max-w-2xl mx-auto leading-relaxed">
                Welcome to our community platform. Please login with your member number.
              </p>
            </div>

            {/* Form and Information Sections */}
            <div className="space-y-8">
              <LoginForm />
              <CommitteeUpdate />
              <MembershipExpectations />
              <ImportantInformation />
            </div>

            {/* Footer */}
            <footer className="text-center text-dashboard-muted text-sm py-12 space-y-2">
              <p>© 2024 SmartFIX Tech, Burton Upon Trent. All rights reserved.</p>
              <p>Website created and coded by Zaheer Asghar</p>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // This should never happen, but just in case
  console.log('Login page - Unexpected state:', { session, loading });
  return null;
};

export default Login;