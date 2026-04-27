import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { getSignedFileUrl } from '@/modules/estudos/queries/getSignedFileUrl';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;

  const signed = await getSignedFileUrl(id);
  if (!signed) return new NextResponse('Arquivo não encontrado.', { status: 404 });

  return NextResponse.redirect(signed.url, { status: 302 });
}
