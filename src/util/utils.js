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

export const dedupMessages = (messages = [], messageToAdd = '') => {
    if (!messageToAdd) return messages;

    const currentMessages = [...messages, {content: messageToAdd}];
    const messageContentArray = currentMessages.map(({content}) => content);

    const duplicatesRemoved = [...new Set(messageContentArray)];

    return duplicatesRemoved.map(txt => ({content: txt}));
}
