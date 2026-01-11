
export const errorHandler = {
    getFriendlyMessage: (error: any): string => {
        const message = error?.message || String(error);

        if (message.includes('user rejected')) return 'Transaction was cancelled by user.';
        if (message.includes('insufficient funds')) return 'Insufficient ETH for gas fees.';
        if (message.includes('InstitutionAlreadyRegistered')) return 'This address is already registered.';
        if (message.includes('InstitutionNotAuthorized')) return 'Institution is not authorized to perform this action.';
        if (message.includes('SoulboundTokenNoTransfer')) return 'Certificates are non-transferable (soulbound).';

        return 'An unexpected error occurred. Please try again.';
    },

    logError: (error: any, context?: string) => {
        console.error(`[Certifi Error] ${context ? `(${context})` : ''}:`, error);
    }
};
