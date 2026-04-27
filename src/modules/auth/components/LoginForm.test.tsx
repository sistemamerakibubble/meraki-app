import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from './LoginForm';

const actionMock = vi.hoisted(() => vi.fn());

vi.mock('@/modules/auth/actions/sign-in', () => ({
  signInAction: actionMock,
}));

function setResolvedAction(value: unknown) {
  actionMock.mockImplementation(async () => value);
}

describe('LoginForm', () => {
  beforeEach(() => {
    actionMock.mockReset();
  });

  it('renderiza campos principais', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar no sistema/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /esqueci minha senha/i })).toBeInTheDocument();
  });

  it('exibe erros do react-hook-form em submit vazio', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /entrar no sistema/i }));
    expect(await screen.findByText(/e-mail é obrigatório/i)).toBeInTheDocument();
  });

  it('envia FormData para a action em submit válido', async () => {
    setResolvedAction(null);
    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@meraki.dev');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar no sistema/i }));

    expect(actionMock).toHaveBeenCalled();
    const lastCall = actionMock.mock.calls.at(-1);
    const fd = lastCall?.[1] as FormData;
    expect(fd.get('email')).toBe('admin@meraki.dev');
    expect(fd.get('password')).toBe('password123');
  });

  it('exibe formError retornado pela action', async () => {
    setResolvedAction({ ok: false, error: { formError: 'E-mail ou senha inválidos' } });
    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@meraki.dev');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar no sistema/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail ou senha inválidos/i);
  });
});
