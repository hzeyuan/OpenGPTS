import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';
import useGPTStore from '~src/store/useGPTsStore';
import type { Gizmo, Gpts } from '@opengpts/types';
import { WEBSITE_URL } from '@opengpts/core/constant'

export interface GPTsSearchProps
    extends Omit<SelectProps<Gizmo | Gizmo[]>, 'options' | 'children'> { }

function GPTsSearch({ ...props }: GPTsSearchProps) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<Partial<Gizmo>[]>([]);
    const gptsList = useGPTStore(state => state.gptsList)

    const fetchGPTs = async (searchValue: string) => {
        if (!searchValue.trim()) return
        setOptions([]);
        setFetching(true);
        const res = await fetch(`${WEBSITE_URL}/api/gpts/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: searchValue,
            })
        })
        if (res.ok) {
            const resp = await res.json();
            console.log('resp', resp)
            const gpts: Gpts[] = resp.data;
            const filteredGPTs: Partial<Gizmo>[] = gpts.map(gpt => {
                return {
                    id: gpt.uuid,
                    display: {
                        name: gpt.name,
                        profile_picture_url: gpt.avatar_url,
                        description: gpt.description,
                    }
                }
            })
            setOptions(filteredGPTs);
        }
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
            options={options.map(gpt => ({ label: gpt?.display?.name, value: gpt.id, ...gpt }))}
        />
    );
}

export default GPTsSearch;
