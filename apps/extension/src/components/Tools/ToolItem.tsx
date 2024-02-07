import type { ToolRow } from '@opengpts/types';
import { Checkbox } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

// 假设的 PluginTag 组件和 store 逻辑现在应该在外部处理
// 并通过 props 传递给 ToolItem

const ToolItem = memo<{
    tool: ToolRow,
    checked: boolean;
    toggleTool: (tool: ToolRow) => void; // 现在通过 props 接收
}>(({ tool, checked, toggleTool }) => {

    return (
        <Flexbox
            gap={16}
            className='p-1'
            horizontal
            justify={'space-between'}
            onClick={(e) => {
                e.stopPropagation();
                toggleTool(tool);
            }}
        >
            <Flexbox align={'center'} gap={8} horizontal>
                <img className='w-4 h-4 ' src={tool?.img || ''} alt="" />
                <span className='text-sm '>{tool?.name}</span>
                {/* {isCustom && <span>Custom Plugin</span>} */}
            </Flexbox>
            <Checkbox
                checked={checked}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleTool(tool);
                }}
            />
        </Flexbox>
    );
});

export default ToolItem;
