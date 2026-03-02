import { atom } from 'nanostores';

/**
 * Theme Store - Global state management para dark/light mode
 * 
 * Usa nanostores para compartilhar estado entre Astro e Vue components
 * Persistência manual no localStorage (compatível com SSR)
 */

// Detectar tema inicial (apenas no cliente)
const getInitialTheme = (): boolean => {
    if (typeof window === 'undefined') return true; // SSR default: dark

    try {
        // Ler da classe HTML (aplicada pelo script inline)
        const hasClassDark = document.documentElement.classList.contains('dark');
        if (hasClassDark) return true;

        // Fallback para localStorage
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    } catch {
        return true; // Default: dark
    }
};

// Atom simples (sem persistência automática para evitar erros de SSR)
export const isDarkMode = atom<boolean>(getInitialTheme());

// Sincronizar com localStorage e HTML quando o store mudar (apenas no cliente)
if (typeof window !== 'undefined') {
    isDarkMode.subscribe((value) => {
        try {
            // Atualizar localStorage
            localStorage.setItem('theme', value ? 'dark' : 'light');

            // Atualizar classe do HTML
            document.documentElement.classList.toggle('dark', value);
        } catch (e) {
            console.warn('Failed to persist theme:', e);
        }
    });
}

/**
 * Helper function para toggle do tema
 */
export function toggleTheme() {
    isDarkMode.set(!isDarkMode.get());
}
