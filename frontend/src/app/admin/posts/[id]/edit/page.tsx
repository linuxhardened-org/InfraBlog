'use client';

import { use } from 'react';
import { PostEditor } from '../new/page';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PostEditor postId={id} />;
}
