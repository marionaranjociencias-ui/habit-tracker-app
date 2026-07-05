import type { CSSProperties } from 'react';
import type { Category } from '../types';

type CategoryHeaderRowProps = {
  category: Category;
  colSpan: number;
};

export function CategoryHeaderRow({ category, colSpan }: CategoryHeaderRowProps) {
  return (
    <tr
      className="category-header-row"
      style={{ '--category-color': category.color } as CSSProperties}
    >
      <td colSpan={colSpan}>{category.name.toUpperCase()}</td>
    </tr>
  );
}
