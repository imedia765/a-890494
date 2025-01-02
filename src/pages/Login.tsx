import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        'authenticate_member',
        { p_member_number: memberNumber }
      );

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Member not found');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: memberNumber + '@temp.com',
        password: memberNumber,
      });

      if (signInError) throw signInError;

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Pakistan Welfare Association</h1>
            <p className="text-dashboard-text text-lg">Welcome to our community platform. Please login with your member number.</p>
          </div>

          {/* Login Form */}
          <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
            <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
              <div>
                <label htmlFor="memberNumber" className="block text-sm font-medium text-dashboard-text mb-2">
                  Member Number
                </label>
                <Input
                  id="memberNumber"
                  type="text"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder="Enter your member number"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dashboard-text mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/90"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>

          {/* Updates Section */}
          <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">What we've been doing</h2>
            <p className="text-dashboard-text mb-6">
              Brother Sajid has resigned and a new Committee was formally created. We would like to thank brother Sajid for his previous efforts, and he will continue helping the Committee where possible in an informal capacity.
            </p>

            <h3 className="text-xl font-bold text-white mb-4">New Committee as of December 2023</h3>
            <ul className="list-disc list-inside text-dashboard-text space-y-2 mb-6">
              <li>Chairperson: Anjum Riaz & Habib Mushtaq</li>
              <li>Secretary: Tariq Majid</li>
              <li>Treasurer: Faizan Qadiri</li>
            </ul>
          </div>

          {/* Expectations Section */}
          <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">What we expect</h2>
            <ul className="list-disc list-inside text-dashboard-text space-y-3">
              <li>All members have been given membership numbers. Please contact your collector to find this out.</li>
              <li>Please login individually and fill in required data.</li>
              <li>We expect timely payments that are up to date.</li>
              <li>Collectors who are timely and up to date, thank you, and please continue with your efforts.</li>
              <li>Those not up to date, please find out your membership number from your collector, then please login online and make payment as soon as possible.</li>
              <li>If payments are not up to date then you will not be covered.</li>
            </ul>
          </div>

          {/* Important Information */}
          <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Important Information</h2>
            <div className="text-dashboard-text space-y-4">
              <p>Trialled so far online payment using Stripe - not enough uptake, sidelined for possible future use.</p>
              <p className="font-bold">Check with your collector if payments up to date, if not up to date YOU ARE NOT COVERED! The responsibility to pay is on the member, not the Collector.</p>
              <p>Unfortunately we are not taking on new members. So if Collectors are in arrears, they will be given deadlines to clear arrears.</p>
            </div>
          </div>

          {/* Medical Examiner Process */}
          <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Medical Examiner Process</h2>
            <p className="text-dashboard-text mb-4">
              To understand our comprehensive Medical Examiner Death Certification process, please review our detailed Medical Examiner Flow Chart.
            </p>
            <Button variant="outline" className="text-dashboard-accent1 border-dashboard-accent1 hover:bg-dashboard-accent1 hover:text-white">
              View Flow Chart
            </Button>
          </div>

          {/* Footer */}
          <footer className="text-center text-dashboard-muted text-sm py-8">
            <p>© 2024 SmartFIX Tech, Burton Upon Trent. All rights reserved.</p>
            <p className="mt-2">Website created and coded by Zaheer Asghar</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;