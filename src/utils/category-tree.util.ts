import { CategoryNode } from '../common/types/category-tree.type';

export function buildCategoryTree<T extends CategoryNode>(
  categories: T[],
  parentId: number | null = null,
): (T & { children: T[] })[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id),
    }));
}
