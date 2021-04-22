const selectOptionColors = {
    option: (provided, state) => ({
        ...provided,
        backgroundColor:
            state.isFocused
                ? '#444444'
                : state.isSelected
                    ? '#5B6A6A'
                    : null
    }),
    control: (provided, state) => ({
        ...provided,
        boxShadow: state.isFocused ? '0 0 0 1px #444444' : null,
        width: 200,
    }),
};
exports.selectOptionColors = selectOptionColors;