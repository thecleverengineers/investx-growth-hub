-- Create storage bucket for deposit wallet QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-qr-codes', 'deposit-qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload QR codes
CREATE POLICY "Admins can upload QR codes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deposit-qr-codes' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow authenticated admins to update QR codes
CREATE POLICY "Admins can update QR codes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deposit-qr-codes' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow authenticated admins to delete QR codes
CREATE POLICY "Admins can delete QR codes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'deposit-qr-codes' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow public read access to QR codes
CREATE POLICY "Public can view QR codes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'deposit-qr-codes');