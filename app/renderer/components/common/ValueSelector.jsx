import React from 'react';
import { observer } from 'mobx-react-lite';
import Select from 'react-select';
import { selectOptionColors } from '@styles';

const ValueSelector = ({ options, onChange, defaultValue = undefined, value = undefined }) =>
    <Select
        className="form-select"
        styles={selectOptionColors}
        options={options}
        value={value}
        defaultValue={defaultValue}
        getOptionLabel={option => option.label}
        onChange={value => onChange(value)} />;

export default observer(ValueSelector);