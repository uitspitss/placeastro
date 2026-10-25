import { type ReactNode, useLayoutEffect } from 'react';

/**
 * 本番の index.html は <html class="dark"> でダークテーマ固定。
 * トークン（--background など）は .dark の下でダーク値に切り替わるので、
 * これで包まないとライトテーマの配色で描かれる。
 * 本番では body に背景・文字色・本文フォントが当たるが、それに頼れない
 * 描画先（プレビューカードなど）でも同じ面になるよう、ここでも塗る。
 */
export function DarkTheme({ children }: { children?: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  return (
    <div
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </div>
  );
}
