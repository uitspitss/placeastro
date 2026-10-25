import Uppy from '@uppy/core';
import { Dashboard, useUppyState } from '@uppy/react';
import { useEffect, useState } from 'react';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { client } from '@/lib/client';
import { placeImageQueries } from '@/lib/place-image-queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlaceImageSchema } from '@placeastro/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = createPlaceImageSchema.merge(
  z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size > 0, 'The file is required.'),
  }),
);

type SchemaType = z.infer<typeof schema>;

export function PlaceImageUploadForm() {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      catalogue: 'M',
      catalogueNumber: '',
      credits: '',
      sourceUrl: '',
      file: undefined,
    },
  });
  const [uppy] = useState(() => new Uppy());
  const files = useUppyState(uppy, (state) => state.files);
  const mutation = useMutation({
    mutationFn: async (data: SchemaType) => {
      const key = `${data.catalogue}/${crypto.randomUUID()}`;

      const { uploadUrl, imgixUrl } = await client.placeImages.getUploadUrl({
        key,
      });

      const resUpload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': data.file.type,
        },
        body: data.file,
      });
      if (!resUpload.ok) {
        throw new Error('Failed to upload file');
      }

      const placeImage = await client.placeImages.create({
        catalogue: data.catalogue,
        catalogueNumber: data.catalogueNumber,
        credits: data.credits,
        sourceUrl: data.sourceUrl,
        url: imgixUrl,
      });

      return placeImage;
    },
  });

  const onSubmit = async (data: SchemaType) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        uppy.clear();
        queryClient.invalidateQueries({
          queryKey: placeImageQueries.all(),
        });
      },
      onError: (error) => {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      },
    });
  };

  useEffect(() => {
    if (!files) {
      alert('Please select a file to upload.');
      return;
    }

    const file = Object.values(files).map((value) => value.data)[0];
    if (!file || !(file instanceof File)) return;

    form.setValue('file', file);
  }, [files, form.setValue]);

  return (
    <div className="code-card rounded-xl p-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="catalogue"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Catalogue
          </label>
          <select
            id="catalogue"
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            {...form.register('catalogue')}
          >
            <option value="">Select catalogue</option>
            <option value="M">Messier (M)</option>
            <option value="NGC">NGC</option>
          </select>
          {form.formState.errors.catalogue?.message && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.catalogue?.message)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="catalogueNumber"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Number
          </label>
          <input
            type="text"
            id="catalogueNumber"
            placeholder="e.g. 42"
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            inputMode="numeric"
            {...form.register('catalogueNumber')}
          />
          {form.formState.errors.catalogueNumber?.message && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.catalogueNumber.message)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="credits"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Credits
          </label>
          <input
            type="text"
            id="credits"
            placeholder="Photographer name"
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            {...form.register('credits')}
          />
          {form.formState.errors.credits?.message && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.credits.message)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sourceUrl"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Source URL
          </label>
          <input
            type="text"
            id="sourceUrl"
            placeholder="https://..."
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            {...form.register('sourceUrl')}
          />
          {form.formState.errors.sourceUrl?.message && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.sourceUrl.message)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Image
          </span>
          <Dashboard uppy={uppy} height={200} />
        </div>

        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          disabled={mutation.isPending}
        >
          <Upload className="h-3.5 w-3.5" />
          {mutation.isPending ? 'Uploading...' : 'Upload image'}
        </button>
      </form>
    </div>
  );
}
