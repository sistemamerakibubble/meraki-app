-- purpose: rastreia quando a cobrança foi enviada ao paciente (ex: link pix, boleto).
-- Separado do status de pagamento — "enviou a cobrança" é diferente de "recebeu o pagamento".

alter table public.billings
  add column if not exists charge_sent_at timestamptz;
