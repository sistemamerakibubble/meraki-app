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
import { BILLING_PLANS, type Patient } from '@/types/domain';
import { formatPhone } from '@/lib/utils/phone';
import { brlToCents, formatBRL } from '@/lib/utils/money';

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
    return ({
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
      billingPlan: (p.billingPlan as PatientInput['billingPlan']) ?? '',
      packageAmountCents: p.packageAmountCents,
      religiaoFamilia: p.religiaoFamilia ?? '',
      irmaos: p.irmaos ?? '',
      quemEncaminhou: p.quemEncaminhou ?? '',
      inicioPsicoterapia: p.inicioPsicoterapia ?? '',
      maeName: p.responsavelMae?.nome ?? '',
      maeNascimento: p.responsavelMae?.nascimento ?? '',
      maeEscolaridade: p.responsavelMae?.escolaridade ?? '',
      maeProfissao: p.responsavelMae?.profissao ?? '',
      maeCpf: p.responsavelMae?.cpf ?? '',
      maeRg: p.responsavelMae?.rg ?? '',
      maeTelefone: p.responsavelMae?.telefone ?? '',
      maeEmail: p.responsavelMae?.email ?? '',
      paiName: p.responsavelPai?.nome ?? '',
      paiNascimento: p.responsavelPai?.nascimento ?? '',
      paiEscolaridade: p.responsavelPai?.escolaridade ?? '',
      paiProfissao: p.responsavelPai?.profissao ?? '',
      paiCpf: p.responsavelPai?.cpf ?? '',
      paiRg: p.responsavelPai?.rg ?? '',
      paiTelefone: p.responsavelPai?.telefone ?? '',
      paiEmail: p.responsavelPai?.email ?? '',
    }) as PatientInput;
  }
  return ({
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
    billingPlan: '',
    packageAmountCents: null,
    religiaoFamilia: '',
    irmaos: '',
    quemEncaminhou: '',
    inicioPsicoterapia: '',
    maeName: '', maeNascimento: '', maeEscolaridade: '', maeProfissao: '', maeCpf: '', maeRg: '', maeTelefone: '', maeEmail: '',
    paiName: '', paiNascimento: '', paiEscolaridade: '', paiProfissao: '', paiCpf: '', paiRg: '', paiTelefone: '', paiEmail: '',
  }) as PatientInput;
}

function packageAmountDisplayFor(mode: Mode): string {
  if (mode.kind === 'edit' && mode.patient.packageAmountCents) {
    return formatBRL(mode.patient.packageAmountCents);
  }
  return '';
}

export function PatientForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValuesFor(mode),
  });
  const [packageAmountDisplay, setPackageAmountDisplay] = useState(packageAmountDisplayFor(mode));

  useEffect(() => {
    if (open) {
      form.reset(defaultValuesFor(mode));
      setPackageAmountDisplay(packageAmountDisplayFor(mode));
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
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
    if (data.billingPlan) fd.set('billingPlan', data.billingPlan);
    if (packageAmountDisplay) {
      fd.set('packageAmountCents', String(safeBrlToCents(packageAmountDisplay)));
    }
    if (d.religiaoFamilia) fd.set('religiaoFamilia', d.religiaoFamilia);
    if (d.irmaos) fd.set('irmaos', d.irmaos);
    if (d.quemEncaminhou) fd.set('quemEncaminhou', d.quemEncaminhou);
    if (d.inicioPsicoterapia) fd.set('inicioPsicoterapia', d.inicioPsicoterapia);
    if (d.maeName) fd.set('maeName', d.maeName);
    if (d.maeNascimento) fd.set('maeNascimento', d.maeNascimento);
    if (d.maeEscolaridade) fd.set('maeEscolaridade', d.maeEscolaridade);
    if (d.maeProfissao) fd.set('maeProfissao', d.maeProfissao);
    if (d.maeCpf) fd.set('maeCpf', d.maeCpf);
    if (d.maeRg) fd.set('maeRg', d.maeRg);
    if (d.maeTelefone) fd.set('maeTelefone', d.maeTelefone);
    if (d.maeEmail) fd.set('maeEmail', d.maeEmail);
    if (d.paiName) fd.set('paiName', d.paiName);
    if (d.paiNascimento) fd.set('paiNascimento', d.paiNascimento);
    if (d.paiEscolaridade) fd.set('paiEscolaridade', d.paiEscolaridade);
    if (d.maeProfissao) fd.set('paiProfissao', d.paiProfissao);
    if (d.paiCpf) fd.set('paiCpf', d.paiCpf);
    if (d.paiRg) fd.set('paiRg', d.paiRg);
    if (d.paiTelefone) fd.set('paiTelefone', d.paiTelefone);
    if (d.paiEmail) fd.set('paiEmail', d.paiEmail);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="flex-row items-center justify-between gap-4 pr-6">
          <DialogTitle>{isEdit ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
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

            {/* ========================= Identificação complementar ========================= */}
            <section className="space-y-4">
              <SectionTitle>Identificação complementar</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="quemEncaminhou" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem encaminhou?</FormLabel>
                    <FormControl><Input placeholder="Ex.: Pediatra, escola..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="inicioPsicoterapia" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início da psicoterapia</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="religiaoFamilia" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religião da família</FormLabel>
                    <FormControl><Input placeholder="Ex.: Católica" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="sm:col-span-2">
                  <FormField control={form.control} name="irmaos" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Irmãos (nome e data de nascimento)</FormLabel>
                      <FormControl>
                        <textarea rows={2} className={textareaClass} placeholder="Ex.: Ana — 10/03/2018, Pedro — 05/07/2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </section>

            {/* ========================= Responsável Mãe ========================= */}
            <section className="space-y-4">
              <SectionTitle>Dados da Mãe / Responsável</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField control={form.control} name="maeName" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="maeNascimento" render={({ field }) => (
                  <FormItem><FormLabel>Data de nascimento</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeEscolaridade" render={({ field }) => (
                  <FormItem><FormLabel>Escolaridade</FormLabel><FormControl><Input placeholder="Ex.: Ensino Superior completo" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeProfissao" render={({ field }) => (
                  <FormItem><FormLabel>Profissão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeCpf" render={({ field }) => (
                  <FormItem><FormLabel>CPF</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeRg" render={({ field }) => (
                  <FormItem><FormLabel>RG</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeTelefone" render={({ field }) => (
                  <FormItem><FormLabel>Celular</FormLabel><FormControl><Input inputMode="tel" placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maeEmail" render={({ field }) => (
                  <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* ========================= Responsável Pai ========================= */}
            <section className="space-y-4">
              <SectionTitle>Dados do Pai / Responsável</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField control={form.control} name="paiName" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="paiNascimento" render={({ field }) => (
                  <FormItem><FormLabel>Data de nascimento</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiEscolaridade" render={({ field }) => (
                  <FormItem><FormLabel>Escolaridade</FormLabel><FormControl><Input placeholder="Ex.: Ensino Médio completo" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiProfissao" render={({ field }) => (
                  <FormItem><FormLabel>Profissão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiCpf" render={({ field }) => (
                  <FormItem><FormLabel>CPF</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiRg" render={({ field }) => (
                  <FormItem><FormLabel>RG</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiTelefone" render={({ field }) => (
                  <FormItem><FormLabel>Celular</FormLabel><FormControl><Input inputMode="tel" placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paiEmail" render={({ field }) => (
                  <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* ================================ Cobrança ================================ */}
            <section className="space-y-4">
              <SectionTitle>Cobrança</SectionTitle>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de cobrança</FormLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BILLING_PLANS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p === 'mensal' ? 'Mensal' : 'Quinzenal'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Valor do pacote</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={packageAmountDisplay}
                      onChange={(e) => setPackageAmountDisplay(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              </div>
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
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar cliente'}
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

function safeBrlToCents(input: string): number {
  if (!input) return 0;
  try {
    return brlToCents(input);
  } catch {
    return 0;
  }
}
