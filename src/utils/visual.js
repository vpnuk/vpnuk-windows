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

const selectOptionColors = {
    option: (provided, state) => ({
        ...provided,
        backgroundColor:
            state.isFocused
                ? '#0BBFBA'
                : state.isSelected
                    ? '#5B6A6A'
                    : null
    }),
    control: (provided, state) => ({
        ...provided,
        boxShadow: state.isFocused ? '0 0 0 1px #0BBFBA' : null,
        width: 200,
    }),
};
exports.selectOptionColors = selectOptionColors;