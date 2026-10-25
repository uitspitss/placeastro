import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { client } from './client';
import { placeImageQueries } from './place-image-queries';

vi.mock('./client', () => ({
  client: { placeImages: { list: vi.fn() } },
}));

describe('placeImageQueries.list', () => {
  const queryClient = new QueryClient();
  afterEach(() => queryClient.clear());

  it('queryFn は client.placeImages.list の結果を返す', async () => {
    const rows = [{ id: 'm16' }];
    vi.mocked(client.placeImages.list).mockResolvedValue(rows as never);

    await expect(
      queryClient.fetchQuery(placeImageQueries.list()),
    ).resolves.toEqual(rows);
  });

  // アップロード後の invalidate が一覧に届くことの担保。
  // key を呼び出し側で組み直すと、ここがずれて一覧が更新されなくなる
  it('all() で invalidate すると一覧が古くなる', async () => {
    vi.mocked(client.placeImages.list).mockResolvedValue([]);

    await queryClient.fetchQuery(placeImageQueries.list());
    await queryClient.invalidateQueries({ queryKey: placeImageQueries.all() });

    expect(
      queryClient.getQueryState(placeImageQueries.list().queryKey)
        ?.isInvalidated,
    ).toBe(true);
  });
});
