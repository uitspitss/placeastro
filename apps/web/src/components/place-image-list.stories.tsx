import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PlaceImageList } from './place-image-list';

/** ネットワークに依存させないため、画像はインライン SVG の data URI にする */
const stub = (label: string, hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" fill="hsl(${hue} 40% 20%)"/><text x="100" y="85" font-family="sans-serif" font-size="24" fill="hsl(36 72% 54%)" text-anchor="middle">${label}</text></svg>`,
  )}`;

const row = (id: string, label: string, hue: number) => ({
  id,
  url: stub(label, hue),
  credits: `NASA / ESA — ${label}`,
  sourceUrl: `https://esahubble.org/images/${id}/`,
});

const meta = {
  component: PlaceImageList,
  tags: ['ai-generated'],
} satisfies Meta<typeof PlaceImageList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { state: { status: 'pending' } },
};

export const Empty: Story = {
  args: { state: { status: 'success', images: [] } },
};

export const Failed: Story = {
  args: {
    state: { status: 'error', error: new Error('Failed to reach the catalog') },
  },
};

export const WithImages: Story = {
  args: {
    state: {
      status: 'success',
      images: [
        row('m16', 'M16', 220),
        row('m42', 'M42', 280),
        row('m74', 'M74', 160),
      ],
    },
  },
  play: async ({ canvas }) => {
    // 出典リンクは別タブで開く。noopener が無いと opener 経由で操作されうる
    const links = await canvas.findAllByRole('link');
    await expect(links).toHaveLength(3);
    await expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
