import { useState, type FormEvent } from 'react';
import { CATEGORY_COLOR_PALETTE } from '../data/defaultCategories';
import type { Category } from '../types';

type CategoryManagerProps = {
  categories: Category[];
  habitCountByCategory: (categoryId: string) => number;
  onAdd: (name: string, color: string) => void;
  onRename: (categoryId: string, name: string) => void;
  onUpdateColor: (categoryId: string, color: string) => void;
  onRemove: (categoryId: string) => void;
  getNextPaletteColor: () => string;
};

export function CategoryManager({
  categories,
  habitCountByCategory,
  onAdd,
  onRename,
  onUpdateColor,
  onRemove,
  getNextPaletteColor,
}: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(getNextPaletteColor);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd(name, selectedColor);
    setName('');
    setSelectedColor(getNextPaletteColor());
  };

  const handleRemove = (category: Category) => {
    if (categories.length <= 1) return;

    const habitCount = habitCountByCategory(category.id);
    const message =
      habitCount > 0
        ? `¿Eliminar la categoría "${category.name}"? ${habitCount} hábito(s) se reasignarán a otra categoría.`
        : `¿Eliminar la categoría "${category.name}"?`;

    if (window.confirm(message)) {
      onRemove(category.id);
    }
  };

  return (
    <section className="category-manager">
      <h2 className="category-manager__title">Categorías</h2>
      <form className="category-manager__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nueva categoría..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="category-manager__input"
        />
        <div className="category-manager__swatches" role="group" aria-label="Color de categoría">
          {CATEGORY_COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              className={`category-swatch ${selectedColor === color ? 'category-swatch--selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Color ${color}`}
              aria-pressed={selectedColor === color}
            />
          ))}
        </div>
        <button type="submit" className="category-manager__add">
          + Agregar categoría
        </button>
      </form>
      <ul className="category-manager__list">
        {categories.map((category) => (
          <li key={category.id} className="category-manager__item">
            <span
              className="category-manager__dot"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            <input
              type="text"
              className="category-manager__name-input"
              value={category.name}
              onChange={(event) => onRename(category.id, event.target.value)}
              aria-label={`Nombre de categoría ${category.name}`}
            />
            <div className="category-manager__swatches category-manager__swatches--inline">
              {CATEGORY_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`category-swatch category-swatch--small ${category.color === color ? 'category-swatch--selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdateColor(category.id, color)}
                  aria-label={`Cambiar color de ${category.name} a ${color}`}
                  aria-pressed={category.color === color}
                />
              ))}
            </div>
            <button
              type="button"
              className="category-manager__remove"
              onClick={() => handleRemove(category)}
              disabled={categories.length <= 1}
              title="Eliminar categoría"
              aria-label={`Eliminar categoría ${category.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
