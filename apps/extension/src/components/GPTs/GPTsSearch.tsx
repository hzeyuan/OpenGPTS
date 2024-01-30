import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';
import useGPTStore from '~src/store/useGPTsStore';
import type { Gizmo } from '@opengpts/types';

export interface GPTsSearchProps
    extends Omit<SelectProps<Gizmo | Gizmo[]>, 'options' | 'children'> { }

function GPTsSearch({ ...props }: GPTsSearchProps) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<Gizmo[]>([]);
    const gptsList = useGPTStore(state => state.gptsList)

    const fetchGPTs = (search: string) => {
        setOptions([]);
        setFetching(true);
        const filteredGPTs = gptsList.filter(gpt =>
            gpt.display.name.toLowerCase().includes(search.toLowerCase())
        );
        setOptions(filteredGPTs);
        setFetching(false);
    };

    const debounceFetcher = useMemo(() => {
        return debounce(fetchGPTs, 300);
    }, [gptsList]);

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options.map(gpt => ({ label: gpt.display.name, value: gpt.id, ...gpt }))}
        />
    );
}

export default GPTsSearch;
