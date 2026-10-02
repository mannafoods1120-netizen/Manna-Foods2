import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types/index.ts';
import { MealGraphic } from './MealGraphic.tsx';

interface MealCardProps {
  meal: MenuItem;
  quantityInCart: number;
  onAddToCart: (meal: MenuItem) => void;
  onRemoveFromCart: (mealId: string) => void;
  onSelectMealDetails?: (meal: MenuItem) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onSelectMealDetails
}) => {
  const isVeg = meal.mealType === 'veg';

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        {/* Top Culinary Image / Graphic */}
        <div 
          onClick={() => onSelectMealDetails && onSelectMealDetails(meal)}
          className="cursor-pointer overflow-hidden bg-stone-100"
        >
          {meal.image ? (
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If the image fails to load, gracefully hide and show MealGraphic
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <MealGraphic
              name={meal.name}
              category={meal.category}
              mealType={meal.mealType}
              className="w-full h-44 sm:h-48"
            />
          )}
        </div>

        {/* Content details */}
        <div className="p-4 sm:p-5">
          {/* Unboxed Metadata row: Dietary Dot & Category */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            {/* Standard Indian Veg/Non-Veg icon */}
            <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${isVeg ? 'border-emerald-600' : 'border-red-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-700'}`} />
            </div>
            <span className="font-medium text-stone-700">{meal.category}</span>
            {meal.calories && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-[11px]">{meal.calories} kcal</span>
              </>
            )}
          </div>

          <h3 
            onClick={() => onSelectMealDetails && onSelectMealDetails(meal)}
            className="font-display font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-1"
          >
            {meal.name}
          </h3>

          <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {meal.description}
          </p>

          {/* Key ingredients preview */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
              <span className="font-medium text-stone-600">Includes:</span>
              <span>{meal.ingredients.slice(0, 3).join(', ')}{meal.ingredients.length > 3 ? '...' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price and Add Action */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">Price</div>
          <div className="text-lg font-bold text-stone-900 tabular-nums">
            ₹{meal.price}
          </div>
        </div>

        <div>
          {quantityInCart > 0 ? (
            <div className="flex items-center bg-amber-600 text-white rounded-lg shadow-xs overflow-hidden">
              <button
                onClick={() => onRemoveFromCart(meal.id)}
                className="w-8 h-8 flex items-center justify-center hover:bg-amber-700 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-xs tabular-nums">
                {quantityInCart}
              </span>
              <button
                onClick={() => onAddToCart(meal)}
                className="w-8 h-8 flex items-center justify-center hover:bg-amber-700 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(meal)}
              className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
