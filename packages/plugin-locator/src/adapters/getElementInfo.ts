
import reactAdapter from './react/reactAdapter';

export type AdapterId = 'react' | 'jsx' | 'svelte' | 'vue';
export function getElementInfo(target: HTMLElement, adapterId?: AdapterId) {
    if (adapterId === 'react') {
        return reactAdapter.getElementInfo(target);
    }

    return (
        reactAdapter.getElementInfo(target)
    );
}