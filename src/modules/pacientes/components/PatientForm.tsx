'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  patientSchema,
  CARE_TYPES,
  SESSION_PERIODS,
  type PatientInput,
} from '@/modules/pacientes/schemas/patient';
import {
  createPatientAction,
  type CreatePatientResult,
} from '@/modules/pacientes/actions/create-patient';
import {
  updatePatientAction,
  type UpdatePatientResult,
} from '@/modules/pacientes/actions/update-patient';
import type { Patient } from '@/types/domain';
import { formatPhone } from '@/lib/utils/phone';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; patient: Patient };

type Props = {
  mode: Mode;
  trigger: ReactNode;
  onSuccess?: (id: string) => void;
};

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function neuroToFormValue(v: boolean | null): '' | 'sim' | 'nao' {
  if (v === true) return 'sim';
  if (v === false) return 'nao';
  return '';
}

function defaultValuesFor(mode: Mode): PatientInput {
  if (mode.kind === 'edit') {
    const p = mode.patient;
    return {
      fullName: p.fullName,
      birthdate: p.birthdate ?? '',
      document: p.document ?? '',
      rg: p.rg ?? '',
      nationality: p.nationality ?? '',
      birthplace: p.birthplace ?? '',
      address: p.address ?? '',
      phone: p.phone ? formatPhone(p.phone) : '',
      email: p.email ?? '',
      livesWith: p.livesWith ?? '',
      mainComplaints: p.mainComplaints ?? '',
      hadNeuropsychEvaluation: neuroToFormValue(p.hadNeuropsychEvaluation),
      diagnosis: p.diagnosis ?? '',
      bestSessionPeriod: (p.bestSessionPeriod as PatientInput['bestSessionPeriod']) ?? '',
      careType: (p.careType as PatientInput['careType']) ?? '',
      notes: p.notes ?? '',
    };
  }
  return {
    fullName: '',
    birthdate: '',
    document: '',
    rg: '',
    nationality: '',
    birthplace: '',
    address: '',
    phone: '',
    email: '',
    livesWith: '',
    mainComplaints: '',
    hadNeuropsychEvaluation: '',
    diagnosis: '',
    bestSessionPeriod: '',
    careType: '',
    notes: '',
  };
}

export function PatientForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValuesFor(mode),
  });

  useEffect(() => {
    if (open) form.reset(defaultValuesFor(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  const action = isEdit
    ? (prev: UpdatePatientResult | null, fd: FormData) =>
        updatePatientAction(mode.patient.id, prev, fd)
    : createPatientAction;

  type CombinedResult = CreatePatientResult | UpdatePatientResult;
  const [state, formAction, pending] = useActionState<CombinedResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Paciente atualizado.' : 'Paciente criado.');
      setOpen(false);
      onSuccess?.(state.data.id);
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('fullName', data.fullName);
    if (data.birthdate) fd.set('birthdate', data.birthdate);
    if (data.document) fd.set('document', data.document);
    if (data.rg) fd.set('rg', data.rg);
    if (data.nationality) fd.set('nationality', data.nationality);
    if (data.birthplace) fd.set('birthplace', data.birthplace);
    if (data.address) fd.set('address', data.address);
    if (data.phone) fd.set('phone', data.phone);
    if (data.email) fd.set('email', data.email);
    if (data.livesWith) fd.set('livesWith', data.livesWith);
    if (data.mainComplaints) fd.set('mainComplaints', data.mainComplaints);
    if (data.hadNeuropsychEvaluation)
      fd.set('hadNeuropsychEvaluation', data.hadNeuropsychEvaluation);
    if (data.diagnosis) fd.set('diagnosis', data.diagnosis);
    if (data.bestSessionPeriod) fd.set('bestSessionPeriod', data.bestSessionPeriod);
    if (data.careType) fd.set('careType', data.careType);
    if (data.notes) fd.set('notes', data.notes);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="flex-row items-center justify-between gap-4 pr-6">
          <DialogTitle>{isEdit ? 'Editar paciente' : 'Novo paciente'}</DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info('Importação de formulário em breve.')}
          >
            <FileDown className="mr-2 h-4 w-4" aria-hidden />
            Importar do Formulário
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {/* ============================ Dados pessoais ============================ */}
            <section className="space-y-4">
              <SectionTitle>Dados pessoais</SectionTitle>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Ex.: Maria da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Brasileira" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthplace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naturalidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: São Paulo - SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço completo (com CEP)</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="street-address"
                        placeholder="Rua, número, bairro, cidade - UF, CEP"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="tel"
                          placeholder="(11) 99999-9999"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="livesWith"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Com quem reside?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Pais, cônjuge, sozinho(a)..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* =========================== Anamnese inicial =========================== */}
            <section className="space-y-4">
              <SectionTitle>Anamnese inicial</SectionTitle>

              <FormField
                control={form.control}
                name="mainComplaints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principais queixas</FormLabel>
                    <FormControl>
                      <textarea
                        rows={3}
                        className={textareaClass}
                        placeholder="Descreva as principais queixas relatadas."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hadNeuropsychEvaluation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Já realizou avaliação neuropsicológica?</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bestSessionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Melhor período para sessões</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_PERIODS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui algum diagnóstico? Descreva</FormLabel>
                    <FormControl>
                      <textarea
                        rows={2}
                        className={textareaClass}
                        placeholder="Descreva diagnósticos prévios, se houver."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="careType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de atendimento</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CARE_TYPES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações gerais</FormLabel>
                  <FormControl>
                    <textarea rows={3} className={textareaClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b pb-1 text-sm font-semibold text-foreground">{children}</h3>
  );
}
