'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { routes } from '@/lib/constants/routes';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'pago', label: 'Pago' },
  { value: 'cancelado', label: 'Cancelado' },
] as const;

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos tipos' },
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' },
] as const;

const NF_OPTIONS = [
  { value: 'all', label: 'NF: todas' },
  { value: 'pendente', label: 'NF pendente' },
  { value: 'emitida', label: 'NF emitida' },
] as const;

export function BillingFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [from, setFrom] = useState(sp.get('from') ?? '');
  const [to, setTo] = useState(sp.get('to') ?? '');
  const [status, setStatus] = useState(sp.get('status') ?? 'all');
  const [type, setType] = useState(sp.get('type') ?? 'all');
  const [nfStatus, setNfStatus] = useState(sp.get('nfStatus') ?? 'all');

  useEffect(() => {
    setFrom(sp.get('from') ?? '');
    setTo(sp.get('to') ?? '');
    setStatus(sp.get('status') ?? 'all');
    setType(sp.get('type') ?? 'all');
    setNfStatus(sp.get('nfStatus') ?? 'all');
  }, [sp]);

  const apply = () => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (status && status !== 'all') params.set('status', status);
    if (type && type !== 'all') params.set('type', type);
    if (nfStatus && nfStatus !== 'all') params.set('nfStatus', nfStatus);
    router.push(`${routes.financeiro}${params.toString() ? `?${params}` : ''}`);
  };

  const reset = () => {
    setFrom('');
    setTo('');
    setStatus('all');
    setType('all');
    setNfStatus('all');
    router.push(routes.financeiro);
  };

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
      <div>
        <Label className="mb-1 block text-xs">Data início</Label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <Label className="mb-1 block text-xs">Data término</Label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>
        <Label className="mb-1 block text-xs">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1 block text-xs">Tipo</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1 block text-xs">Nota fiscal</Label>
        <Select value={nfStatus} onValueChange={setNfStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NF_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2">
        <Button type="button" onClick={apply} className="flex-1">
          Aplicar
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
