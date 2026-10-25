import { describe, expect, it } from 'vitest';
import { toPlaceImageListState } from './place-image-list-state';

const image = {
  id: 'm16',
  url: 'https://example.invalid/m16.jpg',
  credits: 'NASA / ESA',
  sourceUrl: 'https://esahubble.org/images/m16/',
};

describe('toPlaceImageListState', () => {
  it('データがあれば success', () => {
    expect(toPlaceImageListState({ data: [image], error: null })).toEqual({
      status: 'success',
      images: [image],
    });
  });

  // 再取得に失敗しても、取得済みの一覧を消してエラーに差し替えない
  it('データがあればエラーがあっても success', () => {
    expect(
      toPlaceImageListState({ data: [image], error: new Error('refetch') }),
    ).toEqual({ status: 'success', images: [image] });
  });

  it('データが無くエラーがあれば error', () => {
    const error = new Error('Failed to reach the catalog');
    expect(toPlaceImageListState({ data: undefined, error })).toEqual({
      status: 'error',
      error,
    });
  });

  it('データもエラーも無ければ pending', () => {
    expect(toPlaceImageListState({ data: undefined, error: null })).toEqual({
      status: 'pending',
    });
  });
});
