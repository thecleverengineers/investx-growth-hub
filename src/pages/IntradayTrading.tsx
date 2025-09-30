import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  Target,
  Activity,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percent: number;
  volume: number;
  day_high: number;
  day_low: number;
  sector?: string;
  market_cap?: number;
  last_updated: string;
}

interface Position {
  id: string;
  stock_id: string;
  symbol?: string;
  stock_name?: string;
  position_type: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percent: number;
  status: 'open' | 'closed' | 'pending';
  stop_loss?: number;
  target_price?: number;
  created_at: string;
}

interface Order {
  id: string;
  stock_id: string;
  symbol?: string;
  order_type: 'market' | 'limit' | 'stop_loss' | 'bracket';
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  executed_price?: number;
  status: 'pending' | 'executed' | 'cancelled' | 'rejected' | 'partial';
  executed_quantity: number;
  created_at: string;
}

const IntradayTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false); // Changed from true to false to not block UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  // Fetch stocks and set up realtime subscriptions
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
        toast({
          title: "Loading Timeout",
          description: "Market data took too long to load. Please refresh the page.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout

    const initializeMarket = async () => {
      await fetchData();
      
      // Update market prices immediately after fetching
      try {
        const response = await supabase.functions.invoke('market-data-manager', {
          body: { action: 'update-prices' }
        });
        console.log('Market data updated:', response.data);
        if (response.data?.success) {
          await fetchStocks();
        }
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    };

    initializeMarket();
    const channel = setupRealtimeSubscriptions();

    return () => {
      clearTimeout(loadingTimeout);
      channel?.unsubscribe();
    };
  }, [user, navigate]);

  // Start price updates using our market data manager
  useEffect(() => {
    if (stocks.length === 0) return;

    const priceUpdateInterval = setInterval(async () => {
      try {
        console.log('Updating market prices...');
        const response = await supabase.functions.invoke('market-data-manager', {
          body: { action: 'update-prices' }
        });
        
        if (response.data?.success) {
          console.log('Market data updated successfully');
          // Fetch updated stocks without showing loading state
          const { data } = await supabase
            .from('stocks')
            .select('*')
            .order('symbol', { ascending: true });
          
          if (data) {
            setStocks(data);
          }
        }
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, 5000); // Update every 5 seconds for more dynamic market

    return () => clearInterval(priceUpdateInterval);
  }, [stocks.length]);

  const fetchData = async () => {
    console.log('Starting to fetch data...');
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStocks(),
        fetchPositions(),
        fetchOrders(),
        fetchWalletBalance()
      ]);
      console.log('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load market data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
    console.log('Data fetch complete');
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol', { ascending: true });

      if (error) {
        console.error('Error fetching stocks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch market data: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} stocks successfully`);
        setStocks(data);
        setLoading(false);
      } else {
        // If no stocks exist, the initial migration might have failed
        console.log('No stocks found in database');
        toast({
          title: "No Market Data",
          description: "Market data is being initialized. Please refresh the page.",
          variant: "default",
        });
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error fetching stocks:', err);
      setLoading(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching market data",
        variant: "destructive",
      });
    }
  };

  const fetchPositions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('intraday_positions')
      .select(`
        *,
        stocks (symbol, name, price)
      `)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching positions:', error);
    } else {
      const positionsWithStock = data?.map(pos => ({
        ...pos,
        position_type: pos.position_type as 'buy' | 'sell',
        status: pos.status as 'open' | 'closed' | 'pending',
        symbol: pos.stocks?.symbol,
        stock_name: pos.stocks?.name,
        current_price: pos.stocks?.price || pos.current_price
      })) || [];
      setPositions(positionsWithStock);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('intraday_orders')
      .select(`
        *,
        stocks (symbol, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      const ordersWithStock = data?.map(order => ({
        ...order,
        order_type: order.order_type as 'market' | 'limit' | 'stop_loss' | 'bracket',
        side: order.side as 'buy' | 'sell',
        status: order.status as 'pending' | 'executed' | 'cancelled' | 'rejected' | 'partial',
        symbol: order.stocks?.symbol
      })) || [];
      setOrders(ordersWithStock);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .eq('currency', 'USDT')
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
    } else {
      setWalletBalance(data?.balance || 0);
    }
  };

  const setupRealtimeSubscriptions = (): RealtimeChannel | null => {
    if (!user) return null;

    const channel = supabase.channel('intraday-trading')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stocks'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setStocks(prev => prev.map(stock => 
              stock.id === payload.new.id ? payload.new as Stock : stock
            ));
            
            // Update positions with new stock prices
            if (payload.new) {
              updatePositionPrices(payload.new as Stock);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intraday_positions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchPositions();
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev => prev.map(pos => 
              pos.id === payload.new.id ? { ...pos, ...payload.new } : pos
            ));
          }
        }
      )
      .subscribe();

    return channel;
  };

  // Removed updateStockPrices - now handled by market-data-manager edge function

  const updatePositionPrices = async (stock: Stock) => {
    const positionsToUpdate = positions.filter(pos => pos.stock_id === stock.id);
    
    for (const position of positionsToUpdate) {
      await supabase
        .from('intraday_positions')
        .update({ current_price: stock.price })
        .eq('id', position.id);
    }
  };

  const handleTrade = async () => {
    if (!selectedStock || !tradeAmount || !user) {
      toast({
        title: "Invalid Trade",
        description: "Please select a stock and enter trade amount",
        variant: "destructive",
      });
      return;
    }

    const quantity = Math.floor(parseFloat(tradeAmount) / selectedStock.price);
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Trade amount is too small",
        variant: "destructive",
      });
      return;
    }

    // Check wallet balance for buy orders
    if (tradeType === 'buy' && parseFloat(tradeAmount) > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this trade",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('intraday_orders')
        .insert({
          user_id: user.id,
          stock_id: selectedStock.id,
          order_type: orderType,
          side: tradeType,
          quantity,
          price: orderType === 'limit' ? parseFloat(limitPrice) : selectedStock.price,
          status: orderType === 'market' ? 'executed' : 'pending',
          executed_price: orderType === 'market' ? selectedStock.price : null,
          executed_quantity: orderType === 'market' ? quantity : 0,
          executed_at: orderType === 'market' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // If market order, create position immediately
      if (orderType === 'market') {
        const { error: positionError } = await supabase
          .from('intraday_positions')
          .insert({
            user_id: user.id,
            stock_id: selectedStock.id,
            position_type: tradeType,
            quantity,
            entry_price: selectedStock.price,
            current_price: selectedStock.price,
            stop_loss: stopLoss ? parseFloat(stopLoss) : null,
            target_price: targetPrice ? parseFloat(targetPrice) : null,
            status: 'open'
          });

        if (positionError) throw positionError;

        // Update wallet balance
        if (tradeType === 'buy') {
          await supabase
            .from('wallets')
            .update({ 
              balance: walletBalance - parseFloat(tradeAmount),
              last_transaction_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('currency', 'USDT');
        }
      }

      // Refresh data
      await Promise.all([
        fetchPositions(),
        fetchOrders(),
        fetchWalletBalance()
      ]);

      // Reset form
      setTradeAmount('');
      setLimitPrice('');
      setStopLoss('');
      setTargetPrice('');
      setSelectedStock(null);

      toast({
        title: "Order Placed",
        description: `${tradeType.toUpperCase()} order for ${selectedStock.symbol} has been ${orderType === 'market' ? 'executed' : 'placed'} successfully`,
      });
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClosePosition = async (position: Position) => {
    if (!user) return;

    try {
      // Update position status
      const { error: positionError } = await supabase
        .from('intraday_positions')
        .update({
          status: 'closed',
          closed_price: position.current_price,
          closed_at: new Date().toISOString()
        })
        .eq('id', position.id);

      if (positionError) throw positionError;

      // Update wallet balance with profit/loss
      if (position.position_type === 'sell' || position.profit_loss > 0) {
        const amount = position.position_type === 'sell' 
          ? position.entry_price * position.quantity
          : position.current_price * position.quantity;

        await supabase
          .from('wallets')
          .update({ 
            balance: walletBalance + amount,
            last_transaction_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('currency', 'USDT');
      }

      // Refresh data
      await Promise.all([
        fetchPositions(),
        fetchWalletBalance()
      ]);

      toast({
        title: "Position Closed",
        description: `Position for ${position.symbol} closed successfully`,
      });
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive",
      });
    }
  };

  const getTotalPNL = () => {
    return positions.reduce((total, position) => total + (position.profit_loss || 0), 0);
  };

  const getStockChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
    return volume.toString();
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1000000000000) return `${(marketCap / 1000000000000).toFixed(2)}T`;
    if (marketCap >= 1000000000) return `${(marketCap / 1000000000).toFixed(0)}B`;
    if (marketCap >= 1000000) return `${(marketCap / 1000000).toFixed(0)}M`;
    return marketCap.toString();
  };

  // Remove the loading screen completely, show UI immediately

  return (
    <div className="min-h-screen bg-slate-900">
      <AppHeader onMenuClick={() => setSidebarOpen(true)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="p-4 pt-20 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Intraday Trading</h1>
                <p className="text-purple-300">Real-time stock trading platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500 text-white">
                Market Open
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/10"
                onClick={async () => {
                  try {
                    await supabase.functions.invoke('market-data-manager', {
                      body: { action: 'update-prices' }
                    });
                    await fetchStocks();
                    toast({
                      title: "Prices Updated",
                      description: "Market prices have been refreshed",
                    });
                  } catch (error) {
                    console.error('Error updating prices:', error);
                  }
                }}
              >
                Update Prices
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}
                onClick={fetchData}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total P&L</p>
                    <p className="text-2xl font-bold">
                      {positions.length > 0 ? `$${getTotalPNL().toFixed(2)} USDT` : '--'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Active Positions</p>
                    <p className="text-white text-2xl font-bold">{positions.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Available Balance</p>
                    <p className="text-white text-2xl font-bold">
                      {walletBalance > 0 ? `$${walletBalance.toFixed(2)} USDT` : '--'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Total Stocks</p>
                    <p className="text-white text-2xl font-bold">
                      {selectedSector === 'all' 
                        ? stocks.length 
                        : stocks.filter(s => s.sector === selectedSector).length} 
                      {selectedSector !== 'all' && <span className="text-sm"> / {stocks.length}</span>}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="market" className="space-y-4">
            <TabsList className="bg-white/5 border-white/10">
              <TabsTrigger value="market">Market Watch</TabsTrigger>
              <TabsTrigger value="positions">My Positions</TabsTrigger>
              <TabsTrigger value="orders">Order Book</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Stock List */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Live Market Data
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`border-white/10 ${selectedSector === 'all' ? 'bg-purple-600/20' : ''}`}
                            onClick={() => setSelectedSector('all')}
                          >
                            All
                          </Button>
                          {['Technology', 'Finance', 'Energy', 'Healthcare', 'Retail', 'Automotive'].map(sector => (
                            <Button
                              key={sector}
                              variant="outline"
                              size="sm"
                              className={`border-white/10 ${selectedSector === sector ? 'bg-purple-600/20' : ''}`}
                              onClick={() => setSelectedSector(sector)}
                            >
                              {sector}
                            </Button>
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {stocks.length === 0 ? (
                          // Show skeleton loaders while loading
                          <>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="h-5 w-24 bg-white/10 rounded mb-2"></div>
                                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="h-5 w-20 bg-white/10 rounded mb-2"></div>
                                    <div className="h-4 w-24 bg-white/10 rounded"></div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-3">
                                  <div className="h-8 bg-white/10 rounded"></div>
                                  <div className="h-8 bg-white/10 rounded"></div>
                                  <div className="h-8 bg-white/10 rounded"></div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          stocks
                            .filter(stock => selectedSector === 'all' || stock.sector === selectedSector)
                            .map((stock) => (
                            <div
                              key={stock.id}
                              onClick={() => setSelectedStock(stock)}
                              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedStock?.id === stock.id 
                                  ? 'bg-purple-600/20 border border-purple-500/30' 
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-white font-semibold">{stock.symbol}</h3>
                                  <p className="text-purple-300 text-sm">{stock.name}</p>
                                  {stock.sector && (
                                    <Badge className="mt-1 bg-purple-600/20 text-purple-300 border-purple-500/30">
                                      {stock.sector}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-semibold">${stock.price.toFixed(2)}</p>
                                  <p className={`text-sm ${getStockChangeColor(stock.change_amount)}`}>
                                    {stock.change_amount >= 0 ? '+' : ''}{stock.change_amount.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-purple-300">High</p>
                                  <p className="text-white">${stock.day_high?.toFixed(2) || '--'}</p>
                                </div>
                                <div>
                                  <p className="text-purple-300">Low</p>
                                  <p className="text-white">${stock.day_low?.toFixed(2) || '--'}</p>
                                </div>
                                <div>
                                  <p className="text-purple-300">Volume</p>
                                  <p className="text-white">{formatVolume(stock.volume)}</p>
                                </div>
                              </div>
                              {stock.market_cap && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <p className="text-purple-300 text-xs">Market Cap: ${formatMarketCap(stock.market_cap)}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trading Panel */}
                <div>
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Place Order</CardTitle>
                      <CardDescription className="text-purple-300">
                        {selectedStock ? `Trading ${selectedStock.symbol}` : 'Select a stock to trade'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedStock ? (
                        <>
                          <div className="p-3 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-300">Current Price</span>
                              <span className="text-white font-semibold">${selectedStock.price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setTradeType('buy')}
                              className={`flex-1 ${
                                tradeType === 'buy' 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              Buy
                            </Button>
                            <Button
                              onClick={() => setTradeType('sell')}
                              className={`flex-1 ${
                                tradeType === 'sell' 
                                  ? 'bg-red-600 hover:bg-red-700' 
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              Sell
                            </Button>
                          </div>

                          <div>
                            <label className="text-white text-sm">Amount (USDT)</label>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            {tradeAmount && (
                              <p className="text-purple-300 text-sm mt-1">
                                Quantity: {Math.floor(parseFloat(tradeAmount) / selectedStock.price)} shares
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-white text-sm">Stop Loss (Optional)</label>
                            <Input
                              type="number"
                              placeholder="Enter stop loss price"
                              value={stopLoss}
                              onChange={(e) => setStopLoss(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>

                          <div>
                            <label className="text-white text-sm">Target Price (Optional)</label>
                            <Input
                              type="number"
                              placeholder="Enter target price"
                              value={targetPrice}
                              onChange={(e) => setTargetPrice(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>

                          <Button 
                            onClick={handleTrade}
                            disabled={!tradeAmount}
                            className={`w-full ${
                              tradeType === 'buy' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                            }`}
                          >
                            {`${tradeType.toUpperCase()} ${selectedStock.symbol}`}
                          </Button>

                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                              <div>
                                <p className="text-yellow-400 text-sm font-medium">Risk Warning</p>
                                <p className="text-yellow-300 text-xs">
                                  Intraday trading involves high risk. Trade responsibly.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                          <p className="text-purple-300">Select a stock from the market watch to start trading</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Open Positions</CardTitle>
                  <CardDescription className="text-purple-300">
                    Track your active intraday positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {positions.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-300">No open positions</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-white/10">
                            <th className="pb-3 text-purple-300 font-medium">Symbol</th>
                            <th className="pb-3 text-purple-300 font-medium">Type</th>
                            <th className="pb-3 text-purple-300 font-medium">Qty</th>
                            <th className="pb-3 text-purple-300 font-medium">Entry</th>
                            <th className="pb-3 text-purple-300 font-medium">Current</th>
                            <th className="pb-3 text-purple-300 font-medium">P&L</th>
                            <th className="pb-3 text-purple-300 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((position) => (
                            <tr key={position.id} className="border-b border-white/5">
                              <td className="py-3 text-white font-medium">{position.symbol}</td>
                              <td className="py-3">
                                <Badge className={position.position_type === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                                  {position.position_type}
                                </Badge>
                              </td>
                              <td className="py-3 text-white">{position.quantity}</td>
                              <td className="py-3 text-white">${position.entry_price.toFixed(2)}</td>
                              <td className="py-3 text-white">${position.current_price.toFixed(2)}</td>
                              <td className={`py-3 font-medium ${position.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${position.profit_loss.toFixed(2)}
                                <span className="text-sm ml-1">
                                  ({position.profit_loss_percent.toFixed(2)}%)
                                </span>
                              </td>
                              <td className="py-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/10 text-white hover:bg-white/10"
                                  onClick={() => handleClosePosition(position)}
                                >
                                  Close
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Order History</CardTitle>
                  <CardDescription className="text-purple-300">
                    View your recent orders and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-300">No orders placed yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-white/10">
                            <th className="pb-3 text-purple-300 font-medium">Time</th>
                            <th className="pb-3 text-purple-300 font-medium">Symbol</th>
                            <th className="pb-3 text-purple-300 font-medium">Type</th>
                            <th className="pb-3 text-purple-300 font-medium">Side</th>
                            <th className="pb-3 text-purple-300 font-medium">Qty</th>
                            <th className="pb-3 text-purple-300 font-medium">Price</th>
                            <th className="pb-3 text-purple-300 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-white/5">
                              <td className="py-3 text-white text-sm">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </td>
                              <td className="py-3 text-white font-medium">{order.symbol}</td>
                              <td className="py-3 text-white">{order.order_type}</td>
                              <td className="py-3">
                                <Badge className={order.side === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                                  {order.side}
                                </Badge>
                              </td>
                              <td className="py-3 text-white">{order.quantity}</td>
                              <td className="py-3 text-white">${order.price.toFixed(2)}</td>
                              <td className="py-3">
                                <Badge className={
                                  order.status === 'executed' ? 'bg-green-600' :
                                  order.status === 'cancelled' ? 'bg-red-600' :
                                  order.status === 'rejected' ? 'bg-red-600' :
                                  'bg-yellow-600'
                                }>
                                  {order.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default IntradayTrading;