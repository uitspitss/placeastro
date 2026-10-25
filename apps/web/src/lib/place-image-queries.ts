import { queryOptions } from '@tanstack/react-query';
import { client } from './client';

const all = () => ['placeImage'] as const;

/**
 * placeImage の取得はここで key と queryFn を対にして持つ。
 * 呼び出し側で key を組み直すと invalidate の対象がずれる。
 */
export const placeImageQueries = {
  all,
  list: () =>
    queryOptions({
      queryKey: [...all(), 'list'] as const,
      queryFn: () => client.placeImages.list(),
    }),
};
