import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pushMock = vi.hoisted(() => vi.fn());
const useSearchParamsMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}));

import { PatientsSearch } from './PatientsSearch';

function makeSearchParams(init: Record<string, string> = {}) {
  return new URLSearchParams(init);
}

describe('PatientsSearch', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useSearchParamsMock.mockReturnValue(makeSearchParams());
  });

  it('renderiza input de busca e três botões de status', () => {
    render(<PatientsSearch />);
    expect(screen.getByLabelText(/buscar pacientes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ativos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^inativos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^todos$/i })).toBeInTheDocument();
  });

  it('digitar texto dispara router.push com q=... após debounce', async () => {
    const user = userEvent.setup();
    render(<PatientsSearch />);

    await user.type(screen.getByLabelText(/buscar pacientes/i), 'maria');

    await waitFor(
      () => {
        const lastCall = pushMock.mock.calls.at(-1)?.[0] as string | undefined;
        expect(lastCall).toBeDefined();
        expect(lastCall).toContain('q=maria');
      },
      { timeout: 1500 },
    );
  });

  it('clicar em "Inativos" atualiza URL com status=inativo', async () => {
    const user = userEvent.setup();
    render(<PatientsSearch />);

    await user.click(screen.getByRole('button', { name: /^inativos$/i }));

    await waitFor(
      () => {
        const lastCall = pushMock.mock.calls.at(-1)?.[0] as string | undefined;
        expect(lastCall).toBeDefined();
        expect(lastCall).toContain('status=inativo');
      },
      { timeout: 1500 },
    );
  });
});
