-- Create function to check if user has completed deposits
CREATE OR REPLACE FUNCTION public.user_has_completed_deposit(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.transactions
    WHERE user_id = p_user_id
      AND (type = 'deposit' OR category = 'deposit')
      AND status = 'completed'
    LIMIT 1
  )
$$;

-- Create function to validate withdrawal eligibility
CREATE OR REPLACE FUNCTION public.validate_withdrawal_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only check for withdrawals
  IF NEW.type = 'withdrawal' OR NEW.category = 'withdrawal' THEN
    -- Check if user has completed deposits
    IF NOT public.user_has_completed_deposit(NEW.user_id) THEN
      RAISE EXCEPTION 'You must complete at least one deposit before making a withdrawal';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate withdrawal eligibility on transactions table
DROP TRIGGER IF EXISTS check_withdrawal_eligibility ON public.transactions;
CREATE TRIGGER check_withdrawal_eligibility
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal_eligibility();

-- Create trigger for transactions_records table as well
DROP TRIGGER IF EXISTS check_withdrawal_eligibility_records ON public.transactions_records;
CREATE TRIGGER check_withdrawal_eligibility_records
  BEFORE INSERT ON public.transactions_records
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal_eligibility();