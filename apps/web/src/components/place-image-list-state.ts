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
