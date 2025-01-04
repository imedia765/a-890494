import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <ScrollArea className="h-[500px] w-full rounded-md border">
        {result.errors.length > 0 && (
          <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <h3 className="text-red-500 font-semibold mb-2">Issues Found:</h3>
            <ul className="list-disc pl-4">
              {result.errors.map((error, index) => (
                <li key={index} className="text-red-400">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {result.memberDetails && (
          <div className="p-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Member Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Full Name</TableCell>
                  <TableCell>{result.memberDetails.full_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Member Number</TableCell>
                  <TableCell>{result.memberDetails.member_number}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>{result.memberDetails.email || 'Not provided'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Phone</TableCell>
                  <TableCell>{result.memberDetails.phone || 'Not provided'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{result.memberDetails.status || 'Not set'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Membership Type</TableCell>
                  <TableCell>{result.memberDetails.membership_type || 'Not set'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {result.authStatus && (
          <div className="p-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Authentication Status</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Email Confirmed</TableCell>
                  <TableCell>{result.authStatus.email_confirmed_at ? 'Yes' : 'No'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Last Sign In</TableCell>
                  <TableCell>{result.authStatus.last_sign_in_at || 'Never'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Account Created</TableCell>
                  <TableCell>{result.authStatus.created_at || 'Unknown'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {result.userRoles && result.userRoles.length > 0 && (
          <div className="p-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">User Roles</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.userRoles.map((role: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{role.role}</TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {result.collectorStatus && (
          <div className="p-4">
            <h3 className="text-dashboard-accent1 font-semibold mb-2">Collector Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Collector Name</TableCell>
                  <TableCell>{result.collectorStatus.name || 'Not set'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Collector Number</TableCell>
                  <TableCell>{result.collectorStatus.number || 'Not set'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{result.collectorStatus.active ? 'Active' : 'Inactive'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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