import slugify from 'slugify';
import { SLUG_OPTIONS } from '../constants/slug-options.constant';

export function toSlug(text: string): string {
  return slugify(text, SLUG_OPTIONS);
}

interface SlugUniqueChecker {
  findFirst: (args: {
    where: { slug: string; id?: { not: number } };
  }) => Promise<unknown>;
}

export async function generateUniqueSlug(
  delegate: SlugUniqueChecker,
  name: string,
  excludeId?: number,
): Promise<string> {
  const baseSlug = toSlug(name);

  let slug = baseSlug;
  let count = 1;

  while (
    await delegate.findFirst({
      where: {
        slug: slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
