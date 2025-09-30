export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          average_loss: number | null
          average_profit: number | null
          best_trade: number | null
          created_at: string
          date: string
          id: string
          max_drawdown: number | null
          profit_loss: number | null
          sharpe_ratio: number | null
          successful_trades: number | null
          total_trades: number | null
          total_volume: number | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
          worst_trade: number | null
        }
        Insert: {
          average_loss?: number | null
          average_profit?: number | null
          best_trade?: number | null
          created_at?: string
          date: string
          id?: string
          max_drawdown?: number | null
          profit_loss?: number | null
          sharpe_ratio?: number | null
          successful_trades?: number | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
          worst_trade?: number | null
        }
        Update: {
          average_loss?: number | null
          average_profit?: number | null
          best_trade?: number | null
          created_at?: string
          date?: string
          id?: string
          max_drawdown?: number | null
          profit_loss?: number | null
          sharpe_ratio?: number | null
          successful_trades?: number | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
          worst_trade?: number | null
        }
        Relationships: []
      }
      bot_strategies: {
        Row: {
          config: Json
          created_at: string
          current_trades_today: number | null
          id: string
          last_trade_at: string | null
          max_trades_per_day: number | null
          name: string
          status: string
          stop_loss: number | null
          take_profit: number | null
          total_profit: number | null
          total_trades: number | null
          type: string
          updated_at: string
          user_id: string
          win_rate: number | null
        }
        Insert: {
          config: Json
          created_at?: string
          current_trades_today?: number | null
          id?: string
          last_trade_at?: string | null
          max_trades_per_day?: number | null
          name: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          total_profit?: number | null
          total_trades?: number | null
          type: string
          updated_at?: string
          user_id: string
          win_rate?: number | null
        }
        Update: {
          config?: Json
          created_at?: string
          current_trades_today?: number | null
          id?: string
          last_trade_at?: string | null
          max_trades_per_day?: number | null
          name?: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          total_profit?: number | null
          total_trades?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      forex_orders: {
        Row: {
          created_at: string | null
          executed_at: string | null
          executed_price: number | null
          filled_volume: number | null
          id: string
          order_type: string
          pair_id: string | null
          position_id: string | null
          price: number
          side: string
          status: string | null
          user_id: string
          volume: number
        }
        Insert: {
          created_at?: string | null
          executed_at?: string | null
          executed_price?: number | null
          filled_volume?: number | null
          id?: string
          order_type: string
          pair_id?: string | null
          position_id?: string | null
          price: number
          side: string
          status?: string | null
          user_id: string
          volume: number
        }
        Update: {
          created_at?: string | null
          executed_at?: string | null
          executed_price?: number | null
          filled_volume?: number | null
          id?: string
          order_type?: string
          pair_id?: string | null
          position_id?: string | null
          price?: number
          side?: string
          status?: string | null
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "forex_orders_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "forex_pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forex_orders_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "forex_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      forex_pairs: {
        Row: {
          ask: number | null
          base_currency: string
          bid: number | null
          change_amount: number | null
          change_percent: number | null
          created_at: string | null
          current_price: number
          daily_high: number | null
          daily_low: number | null
          daily_volume: number | null
          id: string
          last_updated: string | null
          previous_close: number | null
          quote_currency: string
          spread: number | null
          symbol: string
        }
        Insert: {
          ask?: number | null
          base_currency: string
          bid?: number | null
          change_amount?: number | null
          change_percent?: number | null
          created_at?: string | null
          current_price: number
          daily_high?: number | null
          daily_low?: number | null
          daily_volume?: number | null
          id?: string
          last_updated?: string | null
          previous_close?: number | null
          quote_currency: string
          spread?: number | null
          symbol: string
        }
        Update: {
          ask?: number | null
          base_currency?: string
          bid?: number | null
          change_amount?: number | null
          change_percent?: number | null
          created_at?: string | null
          current_price?: number
          daily_high?: number | null
          daily_low?: number | null
          daily_volume?: number | null
          id?: string
          last_updated?: string | null
          previous_close?: number | null
          quote_currency?: string
          spread?: number | null
          symbol?: string
        }
        Relationships: []
      }
      forex_positions: {
        Row: {
          closed_at: string | null
          closed_price: number | null
          commission: number | null
          created_at: string | null
          current_price: number | null
          entry_price: number
          id: string
          leverage: number | null
          margin_used: number
          pair_id: string | null
          position_type: string
          profit_loss: number | null
          profit_loss_percent: number | null
          signal_id: string | null
          status: string | null
          stop_loss: number | null
          swap_fee: number | null
          take_profit: number | null
          updated_at: string | null
          user_id: string
          volume: number
        }
        Insert: {
          closed_at?: string | null
          closed_price?: number | null
          commission?: number | null
          created_at?: string | null
          current_price?: number | null
          entry_price: number
          id?: string
          leverage?: number | null
          margin_used: number
          pair_id?: string | null
          position_type: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          signal_id?: string | null
          status?: string | null
          stop_loss?: number | null
          swap_fee?: number | null
          take_profit?: number | null
          updated_at?: string | null
          user_id: string
          volume: number
        }
        Update: {
          closed_at?: string | null
          closed_price?: number | null
          commission?: number | null
          created_at?: string | null
          current_price?: number | null
          entry_price?: number
          id?: string
          leverage?: number | null
          margin_used?: number
          pair_id?: string | null
          position_type?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          signal_id?: string | null
          status?: string | null
          stop_loss?: number | null
          swap_fee?: number | null
          take_profit?: number | null
          updated_at?: string | null
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "forex_positions_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "forex_pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forex_positions_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "forex_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      forex_signals: {
        Row: {
          accuracy_rate: number | null
          analysis: string | null
          created_at: string | null
          entry_price: number
          expired_at: string | null
          id: string
          is_active: boolean | null
          pair_id: string | null
          risk_level: string | null
          signal_type: string
          stop_loss: number | null
          strength: string
          take_profit_1: number | null
          take_profit_2: number | null
          take_profit_3: number | null
          timeframe: string | null
        }
        Insert: {
          accuracy_rate?: number | null
          analysis?: string | null
          created_at?: string | null
          entry_price: number
          expired_at?: string | null
          id?: string
          is_active?: boolean | null
          pair_id?: string | null
          risk_level?: string | null
          signal_type: string
          stop_loss?: number | null
          strength: string
          take_profit_1?: number | null
          take_profit_2?: number | null
          take_profit_3?: number | null
          timeframe?: string | null
        }
        Update: {
          accuracy_rate?: number | null
          analysis?: string | null
          created_at?: string | null
          entry_price?: number
          expired_at?: string | null
          id?: string
          is_active?: boolean | null
          pair_id?: string | null
          risk_level?: string | null
          signal_type?: string
          stop_loss?: number | null
          strength?: string
          take_profit_1?: number | null
          take_profit_2?: number | null
          take_profit_3?: number | null
          timeframe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forex_signals_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "forex_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_milestones: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          id: string
          milestone_type: string
          milestone_value: number
          reward_type: string | null
          reward_value: number | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          milestone_type: string
          milestone_value: number
          reward_type?: string | null
          reward_value?: number | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          milestone_type?: string
          milestone_value?: number
          reward_type?: string | null
          reward_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string | null
          daily_roi: number
          description: string | null
          duration_days: number
          id: string
          max_amount: number
          min_amount: number
          name: string
          status: string | null
          total_return_percent: number
        }
        Insert: {
          created_at?: string | null
          daily_roi: number
          description?: string | null
          duration_days: number
          id?: string
          max_amount: number
          min_amount: number
          name: string
          status?: string | null
          total_return_percent: number
        }
        Update: {
          created_at?: string | null
          daily_roi?: number
          description?: string | null
          duration_days?: number
          id?: string
          max_amount?: number
          min_amount?: number
          name?: string
          status?: string | null
          total_return_percent?: number
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string
          id: string
          last_payout_date: string | null
          plan_id: string
          start_date: string
          status: string | null
          total_roi_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date: string
          id?: string
          last_payout_date?: string | null
          plan_id: string
          start_date?: string
          status?: string | null
          total_roi_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string
          id?: string
          last_payout_date?: string | null
          plan_id?: string
          start_date?: string
          status?: string | null
          total_roi_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          change_percent: number | null
          close: number | null
          created_at: string | null
          high: number | null
          id: string
          low: number | null
          open: number | null
          price: number
          symbol: string
          timestamp: string | null
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          close?: number | null
          created_at?: string | null
          high?: number | null
          id?: string
          low?: number | null
          open?: number | null
          price: number
          symbol: string
          timestamp?: string | null
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          close?: number | null
          created_at?: string | null
          high?: number | null
          id?: string
          low?: number | null
          open?: number | null
          price?: number
          symbol?: string
          timestamp?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_events: {
        Row: {
          bonus_multiplier: number | null
          created_at: string | null
          current_participants: number | null
          end_date: string
          event_name: string
          event_type: string
          id: string
          max_participants: number | null
          plan_id: string | null
          start_date: string
        }
        Insert: {
          bonus_multiplier?: number | null
          created_at?: string | null
          current_participants?: number | null
          end_date: string
          event_name: string
          event_type: string
          id?: string
          max_participants?: number | null
          plan_id?: string | null
          start_date: string
        }
        Update: {
          bonus_multiplier?: number | null
          created_at?: string | null
          current_participants?: number | null
          end_date?: string
          event_name?: string
          event_type?: string
          id?: string
          max_participants?: number | null
          plan_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "roi_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          kyc_status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          kyc_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      referral_bonus: {
        Row: {
          amount: number
          base_amount: number | null
          bonus_type: string
          created_at: string | null
          id: string
          level: number
          percentage: number | null
          referral_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          base_amount?: number | null
          bonus_type?: string
          created_at?: string | null
          id?: string
          level?: number
          percentage?: number | null
          referral_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number | null
          bonus_type?: string
          created_at?: string | null
          id?: string
          level?: number
          percentage?: number | null
          referral_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_bonus_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_earned: number | null
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          level: number
          referred_id: string
          referrer_id: string
          status: string | null
          total_deposits: number | null
        }
        Insert: {
          commission_earned?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          level?: number
          referred_id: string
          referrer_id: string
          status?: string | null
          total_deposits?: number | null
        }
        Update: {
          commission_earned?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          level?: number
          referred_id?: string
          referrer_id?: string
          status?: string | null
          total_deposits?: number | null
        }
        Relationships: []
      }
      roi_earnings: {
        Row: {
          amount: number
          calculation_date: string | null
          created_at: string | null
          earning_type: string
          id: string
          investment_id: string
          user_id: string
        }
        Insert: {
          amount: number
          calculation_date?: string | null
          created_at?: string | null
          earning_type: string
          id?: string
          investment_id: string
          user_id: string
        }
        Update: {
          amount?: number
          calculation_date?: string | null
          created_at?: string | null
          earning_type?: string
          id?: string
          investment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_earnings_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_roi_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_investments: {
        Row: {
          amount: number
          created_at: string | null
          daily_return: number
          duration_days: number
          expires_at: string
          id: string
          last_payout_at: string | null
          plan_name: string
          started_at: string | null
          status: string | null
          total_paid_out: number | null
          total_return: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          daily_return: number
          duration_days: number
          expires_at: string
          id?: string
          last_payout_at?: string | null
          plan_name: string
          started_at?: string | null
          status?: string | null
          total_paid_out?: number | null
          total_return: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          daily_return?: number
          duration_days?: number
          expires_at?: string
          id?: string
          last_payout_at?: string | null
          plan_name?: string
          started_at?: string | null
          status?: string | null
          total_paid_out?: number | null
          total_return?: number
          user_id?: string
        }
        Relationships: []
      }
      roi_ledger: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          investment_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_ledger_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_plans: {
        Row: {
          activation_rules: Json | null
          allow_early_withdrawal: boolean | null
          bonus_structure: Json | null
          created_at: string | null
          current_users: number | null
          description: string | null
          duration_type: string
          duration_value: number
          features: Json | null
          id: string
          interest_rate: number
          is_active: boolean | null
          is_compounding: boolean | null
          max_investment: number | null
          max_users: number | null
          min_investment: number
          name: string
          plan_category: string | null
          plan_type: string | null
          priority_order: number | null
          special_conditions: Json | null
          updated_at: string | null
          withdrawal_penalty: number | null
        }
        Insert: {
          activation_rules?: Json | null
          allow_early_withdrawal?: boolean | null
          bonus_structure?: Json | null
          created_at?: string | null
          current_users?: number | null
          description?: string | null
          duration_type: string
          duration_value: number
          features?: Json | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          is_compounding?: boolean | null
          max_investment?: number | null
          max_users?: number | null
          min_investment?: number
          name: string
          plan_category?: string | null
          plan_type?: string | null
          priority_order?: number | null
          special_conditions?: Json | null
          updated_at?: string | null
          withdrawal_penalty?: number | null
        }
        Update: {
          activation_rules?: Json | null
          allow_early_withdrawal?: boolean | null
          bonus_structure?: Json | null
          created_at?: string | null
          current_users?: number | null
          description?: string | null
          duration_type?: string
          duration_value?: number
          features?: Json | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          is_compounding?: boolean | null
          max_investment?: number | null
          max_users?: number | null
          min_investment?: number
          name?: string
          plan_category?: string | null
          plan_type?: string | null
          priority_order?: number | null
          special_conditions?: Json | null
          updated_at?: string | null
          withdrawal_penalty?: number | null
        }
        Relationships: []
      }
      roi_withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          investment_id: string
          penalty_amount: number | null
          processed_at: string | null
          status: string | null
          user_id: string
          withdrawal_type: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          investment_id: string
          penalty_amount?: number | null
          processed_at?: string | null
          status?: string | null
          user_id: string
          withdrawal_type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          investment_id?: string
          penalty_amount?: number | null
          processed_at?: string | null
          status?: string | null
          user_id?: string
          withdrawal_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roi_withdrawals_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_roi_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_earnings: {
        Row: {
          amount: number
          created_at: string | null
          earned_date: string
          id: string
          position_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          earned_date: string
          id?: string
          position_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          earned_date?: string
          id?: string
          position_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_earnings_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "staking_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_plans: {
        Row: {
          apy: number
          bonus_text: string | null
          created_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          max_amount: number
          min_amount: number
          name: string
          type: string
        }
        Insert: {
          apy: number
          bonus_text?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          name: string
          type: string
        }
        Update: {
          apy?: number
          bonus_text?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      staking_positions: {
        Row: {
          amount: number
          apy: number
          auto_renew: boolean | null
          created_at: string | null
          duration_days: number
          end_date: string | null
          id: string
          last_payout_date: string | null
          plan_id: string
          start_date: string | null
          status: string | null
          total_earned: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          apy: number
          auto_renew?: boolean | null
          created_at?: string | null
          duration_days?: number
          end_date?: string | null
          id?: string
          last_payout_date?: string | null
          plan_id: string
          start_date?: string | null
          status?: string | null
          total_earned?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          apy?: number
          auto_renew?: boolean | null
          created_at?: string | null
          duration_days?: number
          end_date?: string | null
          id?: string
          last_payout_date?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string | null
          total_earned?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_positions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "staking_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          closed_at: string | null
          commission: number | null
          created_at: string
          entry_price: number | null
          exit_price: number | null
          id: string
          leverage: number | null
          notes: string | null
          pair: string
          price: number
          profit_loss: number | null
          status: string
          stop_loss: number | null
          swap: number | null
          take_profit: number | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          closed_at?: string | null
          commission?: number | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          leverage?: number | null
          notes?: string | null
          pair: string
          price: number
          profit_loss?: number | null
          status?: string
          stop_loss?: number | null
          swap?: number | null
          take_profit?: number | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          closed_at?: string | null
          commission?: number | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          leverage?: number | null
          notes?: string | null
          pair?: string
          price?: number
          profit_loss?: number | null
          status?: string
          stop_loss?: number | null
          swap?: number | null
          take_profit?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          fee: number | null
          from_address: string | null
          id: string
          network: string | null
          notes: string | null
          processed_at: string | null
          reference_id: string | null
          status: string | null
          to_address: string | null
          tx_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency: string
          fee?: number | null
          from_address?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          to_address?: string | null
          tx_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          fee?: number | null
          from_address?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          to_address?: string | null
          tx_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roi_investments: {
        Row: {
          amount: number
          auto_reinvest: boolean | null
          created_at: string | null
          current_value: number
          custom_interest_rate: number | null
          id: string
          last_calculation_date: string | null
          maturity_date: string
          plan_id: string
          start_date: string | null
          status: string | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_reinvest?: boolean | null
          created_at?: string | null
          current_value: number
          custom_interest_rate?: number | null
          id?: string
          last_calculation_date?: string | null
          maturity_date: string
          plan_id: string
          start_date?: string | null
          status?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_reinvest?: boolean | null
          created_at?: string | null
          current_value?: number
          custom_interest_rate?: number | null
          id?: string
          last_calculation_date?: string | null
          maturity_date?: string
          plan_id?: string
          start_date?: string | null
          status?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roi_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "roi_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          kyc_status: string | null
          name: string
          parent_id: string | null
          phone: string | null
          referral_code: string | null
          total_investment: number | null
          total_referral_earned: number | null
          total_roi_earned: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          kyc_status?: string | null
          name: string
          parent_id?: string | null
          phone?: string | null
          referral_code?: string | null
          total_investment?: number | null
          total_referral_earned?: number | null
          total_roi_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          kyc_status?: string | null
          name?: string
          parent_id?: string | null
          phone?: string | null
          referral_code?: string | null
          total_investment?: number | null
          total_referral_earned?: number | null
          total_roi_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          bonus_income: number | null
          created_at: string
          currency: string
          id: string
          last_transaction_at: string | null
          level_income: number | null
          locked_balance: number
          network: string | null
          referral_income: number | null
          roi_income: number | null
          total_deposited: number | null
          total_withdrawn: number | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          bonus_income?: number | null
          created_at?: string
          currency: string
          id?: string
          last_transaction_at?: string | null
          level_income?: number | null
          locked_balance?: number
          network?: string | null
          referral_income?: number | null
          roi_income?: number | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          bonus_income?: number | null
          created_at?: string
          currency?: string
          id?: string
          last_transaction_at?: string | null
          level_income?: number | null
          locked_balance?: number
          network?: string | null
          referral_income?: number | null
          roi_income?: number | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          kyc_status: string
          name: string
          parent_id: string
          phone: string
          referral_code: string
          role: string
          total_investment: number
          total_referral_earned: number
          total_roi_earned: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      process_roi_payouts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
