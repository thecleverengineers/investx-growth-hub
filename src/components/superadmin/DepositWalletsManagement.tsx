import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DepositWallet {
  id: string;
  currency: string;
  network: string;
  wallet_address: string;
  wallet_label: string | null;
  min_deposit_amount: number;
  network_fee_notice: string | null;
  qr_code_url: string | null;
  show_qr_code: boolean;
  is_active: boolean;
  require_confirmation: boolean;
  auto_detect_transactions: boolean;
  created_at: string;
  updated_at: string;
}

const DepositWalletsManagement = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<DepositWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<DepositWallet | null>(null);
  const [formData, setFormData] = useState({
    currency: '',
    network: '',
    wallet_address: '',
    wallet_label: '',
    min_deposit_amount: '0',
    network_fee_notice: '',
    qr_code_url: '',
    show_qr_code: false,
    is_active: true,
    require_confirmation: false,
    auto_detect_transactions: false,
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposit_wallets')
        .select('*')
        .order('currency', { ascending: true });

      if (error) throw error;
      setWallets(data || []);
    } catch (error: any) {
      console.error('Error fetching wallets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deposit wallets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currency || !formData.network || !formData.wallet_address) {
      toast({
        title: 'Validation Error',
        description: 'Currency, Network, and Wallet Address are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const currency = formData.currency.toUpperCase();
      const network = formData.network;

      // Check for duplicate currency/network combination
      if (!editingWallet || 
          editingWallet.currency !== currency || 
          editingWallet.network !== network) {
        const { data: existing } = await supabase
          .from('deposit_wallets')
          .select('id')
          .eq('currency', currency)
          .eq('network', network)
          .maybeSingle();

        if (existing) {
          toast({
            title: 'Duplicate Entry',
            description: `A deposit wallet for ${currency} on ${network} network already exists. Please edit the existing one or use a different currency/network combination.`,
            variant: 'destructive',
          });
          return;
        }
      }

      const walletData = {
        currency: currency,
        network: network,
        wallet_address: formData.wallet_address,
        wallet_label: formData.wallet_label || null,
        min_deposit_amount: parseFloat(formData.min_deposit_amount),
        network_fee_notice: formData.network_fee_notice || null,
        qr_code_url: formData.qr_code_url || null,
        show_qr_code: formData.show_qr_code,
        is_active: formData.is_active,
        require_confirmation: formData.require_confirmation,
        auto_detect_transactions: formData.auto_detect_transactions,
      };

      if (editingWallet) {
        const { error } = await supabase
          .from('deposit_wallets')
          .update(walletData)
          .eq('id', editingWallet.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Deposit wallet updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('deposit_wallets')
          .insert(walletData);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Deposit wallet created successfully',
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchWallets();
    } catch (error: any) {
      console.error('Error saving wallet:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save deposit wallet',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (wallet: DepositWallet) => {
    setEditingWallet(wallet);
    setFormData({
      currency: wallet.currency,
      network: wallet.network,
      wallet_address: wallet.wallet_address,
      wallet_label: wallet.wallet_label || '',
      min_deposit_amount: wallet.min_deposit_amount.toString(),
      network_fee_notice: wallet.network_fee_notice || '',
      qr_code_url: wallet.qr_code_url || '',
      show_qr_code: wallet.show_qr_code,
      is_active: wallet.is_active,
      require_confirmation: wallet.require_confirmation,
      auto_detect_transactions: wallet.auto_detect_transactions,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deposit wallet?')) return;

    try {
      const { error } = await supabase
        .from('deposit_wallets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deposit wallet deleted successfully',
      });
      fetchWallets();
    } catch (error: any) {
      console.error('Error deleting wallet:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete deposit wallet',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingWallet(null);
    setFormData({
      currency: '',
      network: '',
      wallet_address: '',
      wallet_label: '',
      min_deposit_amount: '0',
      network_fee_notice: '',
      qr_code_url: '',
      show_qr_code: false,
      is_active: true,
      require_confirmation: false,
      auto_detect_transactions: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Deposit Wallets Management</h2>
          <p className="text-muted-foreground">Manage currency networks and deposit addresses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWallet ? 'Edit' : 'Add'} Deposit Wallet</DialogTitle>
              <DialogDescription>
                Configure currency, network, and deposit address details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Input
                    id="currency"
                    placeholder="e.g., USDT, BTC, ETH"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="network">Network *</Label>
                  <Input
                    id="network"
                    placeholder="e.g., TRC20, ERC20, BEP20"
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="wallet_address">Wallet Address *</Label>
                <Input
                  id="wallet_address"
                  placeholder="Enter wallet address"
                  value={formData.wallet_address}
                  onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="wallet_label">Wallet Label (Optional)</Label>
                <Input
                  id="wallet_label"
                  placeholder="e.g., Main Wallet, Hot Wallet"
                  value={formData.wallet_label}
                  onChange={(e) => setFormData({ ...formData, wallet_label: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="min_deposit">Minimum Deposit Amount</Label>
                <Input
                  id="min_deposit"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.min_deposit_amount}
                  onChange={(e) => setFormData({ ...formData, min_deposit_amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="network_fee">Network Fee Notice</Label>
                <Textarea
                  id="network_fee"
                  placeholder="e.g., Network fee: 1 USDT. Minimum deposit: 10 USDT"
                  value={formData.network_fee_notice}
                  onChange={(e) => setFormData({ ...formData, network_fee_notice: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="qr_code_url">QR Code URL (Optional)</Label>
                <Input
                  id="qr_code_url"
                  placeholder="https://example.com/qr-code.png"
                  value={formData.qr_code_url}
                  onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_qr">Show QR Code</Label>
                  <Switch
                    id="show_qr"
                    checked={formData.show_qr_code}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_qr_code: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require_confirm">Require Confirmation</Label>
                  <Switch
                    id="require_confirm"
                    checked={formData.require_confirmation}
                    onCheckedChange={(checked) => setFormData({ ...formData, require_confirmation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_detect">Auto Detect Transactions</Label>
                  <Switch
                    id="auto_detect"
                    checked={formData.auto_detect_transactions}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_detect_transactions: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingWallet ? 'Update' : 'Create'} Wallet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Wallets</CardTitle>
          <CardDescription>
            Total: {wallets.length} wallets ({wallets.filter(w => w.is_active).length} active)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Min Deposit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No deposit wallets configured. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.currency}</TableCell>
                      <TableCell>{wallet.network}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {wallet.wallet_address.slice(0, 10)}...{wallet.wallet_address.slice(-8)}
                        </code>
                      </TableCell>
                      <TableCell>
                        {wallet.wallet_label || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{wallet.min_deposit_amount}</TableCell>
                      <TableCell>
                        <Badge variant={wallet.is_active ? 'default' : 'secondary'}>
                          {wallet.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wallet.show_qr_code && wallet.qr_code_url ? (
                          <QrCode className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(wallet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(wallet.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

export default DepositWalletsManagement;
