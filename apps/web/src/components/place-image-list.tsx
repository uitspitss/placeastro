import { ExternalLink, Loader2 } from 'lucide-react';

type PlaceImageListItem = {
  id: string;
  url: string;
  credits: string;
  sourceUrl: string;
};

export type PlaceImageListState =
  | { status: 'pending' }
  | { status: 'error'; error: Error }
  | { status: 'success'; images: PlaceImageListItem[] };

/**
 * 取得結果を表示状態にする。データがあればエラーより優先する。
 * 再取得の失敗で、取得済みの一覧をエラー表示に差し替えないため。
 */
export const toPlaceImageListState = ({
  data,
  error,
}: {
  data: PlaceImageListItem[] | undefined;
  error: Error | null;
}): PlaceImageListState => {
  if (data) return { status: 'success', images: data };
  if (error) return { status: 'error', error };
  return { status: 'pending' };
};

type Props = {
  state: PlaceImageListState;
};

export const PlaceImageList = ({ state }: Props) => {
  if (state.status === 'pending') {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading catalog...
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive">Error: {state.error.message}</p>
      </div>
    );
  }

  if (state.images.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-secondary/50 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No images in catalog yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {state.images.map((image) => (
        <div
          key={image.id}
          className="code-card group overflow-hidden rounded-xl"
        >
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={image.url}
              alt={image.credits}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="truncate text-sm font-medium">{image.credits}</p>
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
