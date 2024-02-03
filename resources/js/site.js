import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'
import morph from '@alpinejs/morph'
import persist from '@alpinejs/persist'
import precognition from 'laravel-precognition-alpine';
import { ResponsiveGlobe } from './components/globe/Globe';
import { createRoot } from 'react-dom/client';
import { ResponsiveTechnologyChart } from './components/graph/TechnologyChart'
import { EnjoymentChart, ResponsiveEnjoymentChart } from './components/graph/EnjoymentChart'

const components = {
    'globe': ResponsiveGlobe,
    'technology-chart': ResponsiveTechnologyChart,
    'enjoyment-chart': ResponsiveEnjoymentChart,
}

window.customElements.define('react-component', class extends HTMLElement {
    connectedCallback() {
        const component = this.getAttribute('component');
        const Component = components[component];

        const props = Object.fromEntries(
            Array.from(this.attributes)
                .filter(({ name }) => !['component', 'props', 'class'].includes(name))
                .map(({ name, value }) => [name, JSON.parse(value)])
        );

        props.className = this.getAttribute('class');

        const root = createRoot(this);
        root.render(Component(props));

        // now remove all the attributes to clean up dom
        Object.keys(props).forEach((key) => {
            this.removeAttribute(key);
        });
    }
});

// Call Alpine.
window.Alpine = Alpine
Alpine.plugin([collapse, focus, morph, persist, precognition])
Alpine.start()
