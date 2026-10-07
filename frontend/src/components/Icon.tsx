import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ShoppingBagIcon } from '@phosphor-icons/react/dist/csr/ShoppingBag';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { CookingPotIcon } from '@phosphor-icons/react/dist/csr/CookingPot';
import { ForkKnifeIcon } from '@phosphor-icons/react/dist/csr/ForkKnife';

const icons = {
  arrow: ArrowRightIcon,
  bag: ShoppingBagIcon,
  close: XIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  cooking: CookingPotIcon,
  utensils: ForkKnifeIcon,
};

export function Icon({ name }: { name: keyof typeof icons }) {
  const Component = icons[name];
  return (
    <Component
      size={24}
      weight={name === 'cooking' || name === 'utensils' ? 'duotone' : 'bold'}
      color="currentColor"
      aria-hidden="true"
      focusable="false"
    />
  );
}
