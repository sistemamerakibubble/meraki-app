'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { uploadFileAction } from '@/modules/estudos/actions/upload-file';

export function UploadButton({ folderId }: { folderId?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const router = useRouter();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    startTransition(async () => {
      let okCount = 0;
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        if (!file) continue;
        setProgress(`Enviando ${i + 1} de ${filesArray.length}: ${file.name}`);
        const fd = new FormData();
        fd.set('file', file);
        if (folderId) fd.set('folderId', folderId);
        const r = await uploadFileAction(fd);
        if (r.ok) okCount += 1;
        else toast.error(`${file.name}: ${r.error}`);
      }
      setProgress(null);
      if (okCount > 0) toast.success(`${okCount} arquivo(s) enviado(s).`);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden />
        {pending ? (progress ?? 'Enviando...') : 'Enviar arquivo'}
      </Button>
    </>
  );
}
