import { html } from '../jsx.js';
import { HeroSection } from '../components/HeroSection.js';
import { FeaturedProducts } from '../components/FeaturedProducts.js';
import { CategoriesSection } from '../components/CategoriesSection.js';

export function HomePage() {
  return html`
    <div>
      <${HeroSection} />
      <${FeaturedProducts} />
      <${CategoriesSection} />
    </div>
  `;
}