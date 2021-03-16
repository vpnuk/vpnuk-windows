import React from 'react';

const annotateItemLabel = (items, annotation) => items.map(item => {
    var newItem = JSON.parse(JSON.stringify(item, undefined, 2));
    newItem.label = (<>
        <span style={{ color: newItem.isDisabled && 'gray' }}>{item.label}</span>
        {newItem.isDisabled && (
            <span style={{ float: 'right', fontSize: 'smaller' }}>{annotation}</span>
        )}
    </>);
    return newItem;
});
exports.annotateItemLabel = annotateItemLabel;