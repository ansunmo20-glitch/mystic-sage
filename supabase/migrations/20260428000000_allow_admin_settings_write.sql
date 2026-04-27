-- Allow admin panel (anon key, password-protected client-side) to write admin settings
CREATE POLICY "Admin can insert settings"
  ON admin_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update settings"
  ON admin_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
