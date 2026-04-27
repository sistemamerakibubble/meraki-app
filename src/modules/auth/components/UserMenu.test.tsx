import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UserMenu } from './UserMenu';
import type { SessionUser } from '@/types/domain';

vi.mock('@/modules/auth/actions/sign-out', () => ({
  signOutAction: vi.fn(),
}));

const user: SessionUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@meraki.dev',
  profile: {
    id: '00000000-0000-0000-0000-000000000001',
    orgId: '00000000-0000-0000-0000-000000000010',
    fullName: 'Senhor Batata',
    role: 'admin',
    active: true,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe('UserMenu', () => {
  it('exibe nome do usuário no trigger', () => {
    render(<UserMenu user={user} />);
    expect(screen.getByRole('button', { name: /senhor batata/i })).toBeInTheDocument();
  });

  it('abre o menu com papel e ação de sair', async () => {
    render(<UserMenu user={user} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: /senhor batata/i }));
    expect(await screen.findByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });
});
