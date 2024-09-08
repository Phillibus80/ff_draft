export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export const stripStr = str => str && str
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll(/[\.\,\#\$\[\]]/g, '');

export const getLeagueFromSession = (session, status) => {
    // TODO make this dynamic
    const currentLeague = 'da_league';

    if (status === 'authenticated') {
        return !!session?.user?.leagues[currentLeague]
            ? currentLeague
            : '';
    }
}