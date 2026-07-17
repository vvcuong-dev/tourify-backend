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

export function getAllSubcategoryIds<T extends CategoryNode>(
  categories: T[],
  categoryId: number,
): number[] {
  const result: number[] = [categoryId];

  const children = categories.filter((cat) => cat.parentId === categoryId);
  for (const child of children) {
    result.push(...getAllSubcategoryIds(categories, child.id));
  }

  return result;
}
