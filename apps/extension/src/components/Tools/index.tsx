import { Dropdown } from 'antd';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolItem from './ToolItem';
import { useChatPanelContext } from '../Panel/ChatPanel';
import { fetchExtensionTools } from '~src/app/services/tools';
import type { ToolRow } from '@opengpts/types';
import _ from 'lodash';
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
                <a className=' w-max flex items-center px-1 py-0.5  rounded text-[var(--opengpts-sidebar-model-btn-color)] cursor-pointer bg-[var(--opengpts-sidebar-tools-btn-bg-color)]' onClick={(e) => e.preventDefault()}>
                    <img className='w-4 h-4 mr-1' src={pintuIcon}></img>
                    {t('tools.title')}
                </a>
            </Dropdown>
        </>
    );
});

export default Tools;
