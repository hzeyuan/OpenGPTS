"use client"
import { Search as SearchIcon } from 'lucide-react'
import ExpandPanel from '../../ExpandPanel';
import WorkflowBlockList from '../WorkflowBlockList'
import { useMemo, useRef, useState, type ChangeEventHandler } from 'react';
import { categories, getBlocks } from '~src/utils/workflow';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { map } from 'lodash-es'
import { Input } from 'antd';
import { useWorkflowStore } from '~src/store/useWorkflowStore';
import { FilePenLine, Save } from 'lucide-react'
const WorkflowDetailsCard = () => {


    const copyBlocks = getBlocks();
    delete copyBlocks['block-package'];
    const query = useRef('');
    const updateWorkflowData = useWorkflowStore((state) => state.updateWorkflowData);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [name, setName] = useState('')
    const workflowData = useWorkflowStore((state) => state.workflowData);
    const pinnedBlocks = useRef([]);


    const blocksArr: PRAWorkflow.Block[] = Object.entries(copyBlocks).map(([key, block]) => {
        const localeKey = `workflow.blocks.${key}.name`;

        return {
            ...block,
            id: key,
            name: block.name,
        };
    });

    const blocks = useMemo(() => {
        return blocksArr.reduce((arr: Record<string, PRAWorkflow.Block[]>, block) => {
            if (
                block.name.toLocaleLowerCase().includes(query.current?.toLocaleLowerCase())
            ) {
                (arr[block.category] = arr[block.category] || []).push(block);
            }

            return arr;
        }, {})
    }, [])

    const handleUpdateWorkflowName = () => {
        setEditNameVisible(false)
        const workflowData: Partial<PRAWorkflow.WorkflowData> = { name }
        updateWorkflowData(workflowData)
    }
    const handleUpdateWorkflowDesc: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        const workflowData: Partial<PRAWorkflow.WorkflowData> = { description: e.target.value! }
        updateWorkflowData(workflowData)
    }

    return (

        <div
            className='flex-col hidden h-full max-h-screen pb-6 bg-white border-l border-gray-100 md:flex w-80 dark:border-gray-700 dark:border-opacity-50 dark:bg-gray-800'
        >
            <div className="flex items-start px-4 mt-1 mb-2">
                {/* icon */}
                <div className="flex-1 overflow-hidden">
                    {editNameVisible ?
                        <div className="flex items-end border-b border-black border-solid ">
                            <input
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Input Workflow Name..." className="pb-0 mt-1 text-lg font-semibold leading-tight outline text-overflow" value={workflowData?.name} />
                            <button onClick={handleUpdateWorkflowName} className="inline-flex"><Save className="pl-2" size="24" /></button>

                        </div>
                        :
                        <div className="flex items-center mt-1 ">
                            <p className="text-xl font-semibold leading-tight text-overflow">{workflowData?.name}</p>
                            <button onClick={() => setEditNameVisible(true)} className="inline-flex"><FilePenLine className="pl-2" size="24" /></button>
                        </div>
                    }
                    {/* <p className="leading-tight cursor-pointer line-clamp">
                    </p> */}

                    <textarea onChange={handleUpdateWorkflowDesc} placeholder="Input Your desc"
                        style={{
                            width: 'calc(100% - 16px)'
                        }}
                        className="px-4 py-2 mt-4 ml-2 transition bg-transparent rounded-lg bg-input" />

                </div>
            </div>

            {/* search */}
            <div className="inline-block w-full px-4 mb-2 input-ui ">
                <div className="relative flex items-center w-full">
                    <SearchIcon className='absolute left-0 w-6 h-6 mt-2 ml-2 text-gray-600 dark:text-gray-200 '></SearchIcon>
                    <input placeholder="Search... (⌘+f)" type="text" className="w-full px-4 py-2 pl-10 mt-4 mb-2 transition bg-transparent rounded-lg bg-input" />
                </div>
            </div>
            <div className='relative flex-1 px-4 overflow-auto bg-scroll scroll '>
                {
                    map(blocks, (items, key) => {
                        return (
                            <ExpandPanel
                                panelClass="custom-panel-class"
                                activeClass="custom-active-class"
                                header={
                                    <>
                                        <span className={`w-3 h-3 rounded-full ${categories[key]?.color}}`} />
                                        <p className="flex-1 ml-2 text-lg capitalize">
                                            {categories[key]?.name}
                                        </p>
                                    </>
                                }
                            >
                                <WorkflowBlockList key={key} blocks={items}></WorkflowBlockList>
                            </ExpandPanel>
                        )
                    })
                }


            </div>
        </div>


    );
}

export default WorkflowDetailsCard;