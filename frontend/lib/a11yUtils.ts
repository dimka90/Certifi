
export const a11yUtils = {
    trapFocus: (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    },

    announceToSR: (message: string) => {
        const announcer = document.getElementById('sr-announcer') || document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        if (!document.getElementById('sr-announcer')) {
            document.body.appendChild(announcer);
        }
    }
};
