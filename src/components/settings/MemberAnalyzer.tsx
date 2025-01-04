import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  memberDetails?: any;
  authStatus?: any;
  userRoles?: any;
  collectorStatus?: any;
  errors: string[];
}

const MemberAnalyzer = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMember = async () => {
    setLoading(true);
    setResult(null);
    const errors: string[] = [];

    try {
      // 1. Check member details
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('member_number', memberNumber.trim())
        .maybeSingle();

      if (memberError) {
        errors.push(`Member query error: ${memberError.message}`);
      }

      let authData = null;
      let rolesData = null;
      let collectorData = null;

      if (memberData?.auth_user_id) {
        // 2. Check auth status
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(
          memberData.auth_user_id
        );

        if (authError) {
          errors.push(`Auth query error: ${authError.message}`);
        } else {
          authData = user;
        }

        // 3. Check user roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', memberData.auth_user_id);

        if (rolesError) {
          errors.push(`Roles query error: ${rolesError.message}`);
        } else {
          rolesData = roles;
        }
      }

      // 4. Check collector status if applicable
      if (memberData?.collector_id) {
        const { data: collector, error: collectorError } = await supabase
          .from('members_collectors')
          .select('*')
          .eq('id', memberData.collector_id)
          .maybeSingle();

        if (collectorError) {
          errors.push(`Collector query error: ${collectorError.message}`);
        } else {
          collectorData = collector;
        }
      }

      setResult({
        memberDetails: memberData || null,
        authStatus: authData,
        userRoles: rolesData,
        collectorStatus: collectorData,
        errors
      });

      toast({
        title: "Analysis Complete",
        description: errors.length > 0 ? "Analysis completed with some errors" : "Analysis completed successfully",
        variant: errors.length > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setResult({
        errors: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!result) return null;

    return (
      <ScrollArea className="h-[500px] w-full rounded-md border p-4">
        {result.errors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-red-500 font-semibold mb-2">Errors:</h3>
            <ul className="list-disc pl-4">
              {result.errors.map((error, index) => (
                <li key={index} className="text-red-400">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {result.memberDetails && (
          <div className="mb-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Member Details:</h3>
            <pre className="bg-black/20 p-4 rounded">
              {JSON.stringify(result.memberDetails, null, 2)}
            </pre>
          </div>
        )}

        {result.authStatus && (
          <div className="mb-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Auth Status:</h3>
            <pre className="bg-black/20 p-4 rounded">
              {JSON.stringify(result.authStatus, null, 2)}
            </pre>
          </div>
        )}

        {result.userRoles && (
          <div className="mb-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">User Roles:</h3>
            <pre className="bg-black/20 p-4 rounded">
              {JSON.stringify(result.userRoles, null, 2)}
            </pre>
          </div>
        )}

        {result.collectorStatus && (
          <div className="mb-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Collector Status:</h3>
            <pre className="bg-black/20 p-4 rounded">
              {JSON.stringify(result.collectorStatus, null, 2)}
            </pre>
          </div>
        )}
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Analyzer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Enter member number"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={analyzeMember} 
            disabled={loading || !memberNumber.trim()}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default MemberAnalyzer;