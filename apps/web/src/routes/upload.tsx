import { PlaceImageList } from '@/components/place-image-list';
import { toPlaceImageListState } from '@/components/place-image-list-state';
import { PlaceImageUploadForm } from '@/components/place-image-upload-form';
import { getSession } from '@/lib/auth-client';
import { placeImageQueries } from '@/lib/place-image-queries';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/upload')({
  beforeLoad: async () => {
    const { data: session } = await getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: UploadPage,
});

function UploadPage() {
  const placeImages = useQuery(placeImageQueries.list());

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold italic tracking-tight">
          Upload
        </h1>
        <p className="text-sm text-muted-foreground">
          Add new astrophotography images to the catalog
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[360px_1fr]">
        <div>
          <PlaceImageUploadForm />
        </div>
        <div>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Catalog
          </h2>
          <PlaceImageList state={toPlaceImageListState(placeImages)} />
        </div>
      </div>
    </div>
  );
}
