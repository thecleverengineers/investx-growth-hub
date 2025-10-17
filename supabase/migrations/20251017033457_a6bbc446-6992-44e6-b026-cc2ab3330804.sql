-- Fix RLS policy for deposit_wallets to allow both admin and super_admin
DROP POLICY IF EXISTS "Admins can manage deposit wallets" ON public.deposit_wallets;

CREATE POLICY "Admins and Super Admins can manage deposit wallets"
ON public.deposit_wallets
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);