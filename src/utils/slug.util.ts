import slugify from 'slugify';

interface SlugUniqueChecker {
  findUnique: (args: { where: { slug: string } }) => Promise<unknown>;
}

export async function generateUniqueSlug(
  delegate: SlugUniqueChecker,
  name: string,
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });

  let slug = baseSlug;
  let count = 1;

  while (await delegate.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
