export const convertToFirebaseJsonFormat = jsonArr => {
    const arr = [ ...jsonArr].reduce((accum, current) => {
        const modifiedName = current.NAME
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll(/[\.\,\#\$\[\]]/g, '');
        accum[`${modifiedName}`] = current;
        return accum;
    }, {});

    return JSON.stringify(arr);
};