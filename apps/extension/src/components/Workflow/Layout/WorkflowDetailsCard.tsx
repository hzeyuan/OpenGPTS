"use client"
import { Search as SearchIcon } from 'lucide-react'
import ExpandPanel from '../../ExpandPanel';
import WorkflowBlockList from '../WorkflowBlockList'
import { useMemo, useState, type ChangeEventHandler, useEffect } from 'react';
import { categories, getBlocks } from '~src/utils/workflow';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { map } from 'lodash-es'
import { FilePenLine, Save } from 'lucide-react'
import usePinnedBlocksStore from '~src/store/usePinnedBlocksStore';
import useRPAFlowStore from '~src/store/useRPAflowStore';
import { message } from 'antd';
import { updateWorkflowRequest } from '~src/app/services/workflow';
import { useDebouncedCallback } from 'use-debounce';
const WorkflowDetailsCard = () => {


    const copyBlocks = getBlocks();
    delete copyBlocks['block-package'];

    const workflowData = useRPAFlowStore((state) => state.workflow);
    const [searchName, setSearchName] = useState<string>('');
    const [name, setName] = useState<string>(workflowData?.name || '')
    const updateWorkflowData = useRPAFlowStore((state) => state.update);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const pinnedBlocks = usePinnedBlocksStore(state => state.blocks);

    const blocks = useMemo(() => {
        const blocksArr: PRAWorkflow.Block[] = Object.entries(copyBlocks).map(([key, block]) => {
            const localeKey = `workflow.blocks.${key}.name`;

            return {
                ...block,
                id: key,
                name: block.name,
            };
        });

        const categoryToBlocks = [...pinnedBlocks, ...blocksArr].reduce((arr: Record<string, PRAWorkflow.Block[]>, block) => {
            if (
                block.name.toLocaleLowerCase().includes(searchName?.toLocaleLowerCase())
            ) {
                (arr[block.category] = arr[block.category] || []).push(block);
            }
            return arr;
        }, {})
        return categoryToBlocks
    }, [searchName, pinnedBlocks])

    const handleUpdateWorkflowName = () => {
        setEditNameVisible(false)
        // const workflowData: Partial<PRAWorkflow.WorkflowData> = { name }
        if (!workflowData) return
        updateWorkflowRequest(workflowData.id, {
            name
        }).then(() => {
            updateWorkflowData({
                ...workflowData,
                name
            })
            message.success('update success!')
        }).catch(err => {
            message.error('Failed to update workflow name')
        })
    }
    const handleUpdateWorkflowDesc: ChangeEventHandler<HTMLTextAreaElement> = useDebouncedCallback((e) => {
        if (!workflowData) return
        updateWorkflowRequest(workflowData.id, {
            description: e.target.value!
        }).then(() => {
            updateWorkflowData({
                ...workflowData,
                description: e.target.value!
            })
            message.success('update success!')
        }).catch(err => {
            message.error('Failed to update workflow description')
        })
    }, 1000)

    useEffect(() => {
        setName(workflowData?.name || '')
    }, [workflowData?.name, workflowData?.description])

    return (

        <div
            className='flex-col hidden h-full max-h-screen pb-6 mt-4 bg-white border-l border-gray-100 md:flex w-80 dark:border-gray-700 dark:border-opacity-50 dark:bg-gray-800'
        >
            <div className="flex items-start px-4 mt-1 mb-2">

                <div className="flex-1 overflow-hidden">
                    {editNameVisible ?
                        <div className="flex items-center mt-2 ml-1">
                            <input
                                placeholder="Input Workflow Name..."
                                type="text"
                                value={name}
                                className="w-full px-4 py-2 pl-10 transition bg-transparent rounded-lg bg-input"
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button onClick={handleUpdateWorkflowName} className="injustify-content: center;align-items: center;line-flex cursor-pointer"><Save className="pl-2" size="30" /></button>

                        </div>
                        :
                        <div className="flex mt-2 ml-1 ">
                            <p className="text-xl font-semibold leading-tight text-overflow">{name}</p>
                            <button onClick={() => setEditNameVisible(true)} className="inline-flex"><FilePenLine className="pl-2" size="24" /></button>
                        </div>
                    }
                    {/* <p className="leading-tight cursor-pointer line-clamp">
                    </p> */}

                    <textarea onChange={handleUpdateWorkflowDesc} placeholder="Input Your desc"
                        style={{
                            width: 'calc(100% - 16px)'
                        }}
                        defaultValue={workflowData?.description}
                        className="px-4 py-2 mt-4 ml-2 transition bg-transparent rounded-lg bg-input" />

                </div>
            </div>

            {/* search */}
            <div className="inline-block w-full px-4 mb-2 input-ui ">
                <div className="relative flex items-center w-full">
                    <SearchIcon className='absolute left-0 w-6 h-6 mt-2 ml-2 text-gray-600 dark:text-gray-200 '></SearchIcon>

                    <input
                        placeholder="Search... (⌘+f)"
                        type="text"
                        className="w-full px-4 py-2 pl-10 mt-4 mb-2 transition bg-transparent rounded-lg bg-input"
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
            </div>
            <div className='relative flex-1 px-4 overflow-auto bg-scroll scroll '>


                {
                    map(blocks, (items, key) => {
                        return (
                            <ExpandPanel
                                modelValue={true}
                                // panelClass="custom-panel-class"
                                // activeClass="custom-active-class"
                                header={
                                    <>
                                        <span className={`w-3 h-3 rounded-full ${key === 'pinned' ? 'bg-black' : categories[key]?.color}`} />
                                        <p className="flex-1 ml-2 text-lg capitalize">
                                            {key === 'pinned' ? 'Pinned' : categories[key]?.name}
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