import slugify from 'slugify';
import { SLUG_OPTIONS } from '../constants/slug-options.constant';

export function toSlug(text: string): string {
  return slugify(text, SLUG_OPTIONS);
}

interface SlugUniqueChecker {
  findUnique: (args: { where: { slug: string } }) => Promise<unknown>;
}

export async function generateUniqueSlug(
  delegate: SlugUniqueChecker,
  name: string,
): Promise<string> {
  const baseSlug = toSlug(name);

  let slug = baseSlug;
  let count = 1;

  while (await delegate.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
