import { Dropdown } from 'antd';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolItem from './ToolItem';
import { useChatPanelContext } from '../Panels/ChatPanel';
import { fetchExtensionTools } from '~src/app/services/tools';
import { ChevronDown } from "lucide-react"
import type { ToolRow } from '@opengpts/types';
import _ from 'lodash-es';
import pintuIcon from '~assets/pintu.svg';

const Tools = memo(() => {
    const { t } = useTranslation();
    const { useTools, setUseTools } = useChatPanelContext()
    const [extensionTools, setExtensionTools] = useState<ToolRow[]>([]);
    const [builtinTools, setBuiltinsTools] = useState<ToolRow[]>([]);


    const handleCheckSelect = (id: number) => _.findIndex(useTools, { tool_id: id }) > -1;
    const handleToggleTool = (row: ToolRow) => {
        const index = _.findIndex(useTools, { tool_id: row.tool_id });
        if (index > -1) {
            const newTools = [...useTools];
            newTools.splice(index, 1);
            setUseTools(newTools);
        } else {
            setUseTools([...useTools, row]);
        }
    }

    useEffect(() => {
        const initTools = async () => {
            // const builtins = await fetchBuiltinsTools();
            // setBuiltinsTools(builtins);
            try {
                const tools = await fetchExtensionTools();
                setExtensionTools(tools.filter(tool => !tool.is_builtin));
                setBuiltinsTools(tools.filter(tool => tool.is_builtin));
            } catch (error) {

            }
        };
        initTools();
    }, []);


    return (
        <>
            <Dropdown
                arrow={false}
                placement={'top'}
                trigger={['click']}
                menu={{
                    className: '',
                    items: [
                        {
                            label: t('tools.builtins.groupName'),
                            type: 'group',
                            key: 'builtins',
                            children: builtinTools.map((item) => ({
                                key: item.tool_id,
                                label: (
                                    <ToolItem
                                        tool={item}
                                        checked={handleCheckSelect(item.tool_id)}
                                        toggleTool={handleToggleTool}
                                    />
                                ),
                            })),
                        },
                        {
                            label: t('tools.plugins.groupName'),
                            type: 'group',
                            key: 'plugins',
                            children: extensionTools?.map((item) => ({
                                key: item.tool_id,
                                label: (
                                    <ToolItem
                                        tool={item}
                                        toggleTool={handleToggleTool}
                                        checked={handleCheckSelect(item.tool_id)}
                                    />
                                ),
                            }))
                        }
                    ]
                }}
            >
                <a className=' w-max flex items-center px-2 py-1  rounded text-[var(--opengpts-sidebar-model-btn-color)] cursor-pointer bg-[var(--opengpts-sidebar-tools-btn-bg-color)]' onClick={(e) => e.preventDefault()}>
                    <img className='w-4 h-4 mr-1' src={pintuIcon.src||pintuIcon}></img>
                    <span className=' mr-1 inline-block text-[13px] text-ellipsis whitespace-nowrap overflow-hidden max-w-full'> {t('tools.title')}</span>
                    <ChevronDown className="w-4 h-4" />
                </a>
            </Dropdown>
        </>
    );
});

export default Tools;
