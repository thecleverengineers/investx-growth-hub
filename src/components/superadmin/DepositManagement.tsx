import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface DepositRecord {
  id: string;
  user_id: string;
  wallet_id: string | null;
  amount: number;
  currency: string;
  network: string;
  from_address: string | null;
  to_address: string | null;
  transaction_hash: string | null;
  confirmations: number;
  required_confirmations: number;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

const DepositManagement = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('deposit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user details for each deposit
      const depositsWithUsers = await Promise.all(
        (data || []).map(async (deposit) => {
          const { data: userData } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', deposit.user_id)
            .single();

          return {
            ...deposit,
            user_email: userData?.email,
            user_name: userData?.name,
          };
        })
      );

      setDeposits(depositsWithUsers);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeposits = deposits.filter(
    (deposit) =>
      deposit.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: deposits.length,
    pending: deposits.filter((d) => d.status === 'pending').length,
    completed: deposits.filter((d) => d.status === 'completed').length,
    rejected: deposits.filter((d) => d.status === 'rejected').length,
    totalAmount: deposits
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + Number(d.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Deposit Management</h2>
        <p className="text-muted-foreground">
          View and manage all deposit transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Transactions</CardTitle>
          <CardDescription>All deposit records from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by email, hash, or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchDeposits} variant="outline">
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Confirmations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No deposits found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{deposit.user_name || 'N/A'}</span>
                          <span className="text-sm text-muted-foreground">
                            {deposit.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(deposit.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{deposit.currency}</TableCell>
                      <TableCell>{deposit.network}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">
                          {deposit.transaction_hash
                            ? `${deposit.transaction_hash.substring(0, 8)}...`
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {deposit.confirmations}/{deposit.required_confirmations}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(deposit.status)}>
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositManagement;
