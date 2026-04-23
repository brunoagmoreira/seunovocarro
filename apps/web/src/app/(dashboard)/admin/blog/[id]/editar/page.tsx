"use client";

import { useParams } from 'next/navigation';
import { BlogPostEditor } from '../../BlogPostEditor';

export default function EditarBlogPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  if (!id) return null;
  return <BlogPostEditor postId={id} />;
}
