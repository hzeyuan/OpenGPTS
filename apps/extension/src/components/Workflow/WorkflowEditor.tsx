"use client"
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, type DragEventHandler, useEffect, useContext } from 'react';
import ReactFlow, { useReactFlow, Background, BackgroundVariant, Controls, Handle, MiniMap, Position, ReactFlowProvider, addEdge, applyEdgeChanges, applyNodeChanges, useViewport, useNodesState, useEdgesState } from 'reactflow';
import type { ReactFlowProps, OnNodesChange, Node, Edge, NodeTypes, EdgeTypes, OnConnect, OnEdgesChange, ReactFlowInstance, ReactFlowRefType, useStore, EdgeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css';
import BlockBasic from '../Blocks/BlockBasic';
import BorderEdge from './Edge/BorderEdge';
import { categories, getBlocks } from '~src/utils/workflow';
import WorkflowEditBlock from './WorkflowEditBlock';
import { nanoid } from '~shared/utils';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { WorkflowEditorContext, useWorkflowEditorContext } from '~src/app/context/WorkflowEditorContext';
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import { useWorkflowStore } from '~src/store/useWorkflowStore';
import { Play, Save } from 'lucide-react';
import notification from 'antd/es/notification';



export type WorkflowEditorHandles = {
    getBoundingClientRect: () => DOMRect | undefined
}

type Props = {
    ref: React.MutableRefObject<HTMLDivElement>
    options?: Partial<ReactFlowProps>
}


const nodeTypes: NodeTypes = { blockBasic: BlockBasic };


const edgeTypes: EdgeTypes = {
    borderEdge: BorderEdge, // 注册自定义边缘
};



const blocks = getBlocks();



const Flow: React.FC<{
    setReactFlowInstance: (instance: ReactFlowInstance) => void
} & ReactFlowProps>
    = ({ setReactFlowInstance, ...props }) => {
        // you can access the internal state here
        const reactFlowInstance = useReactFlow();

        // Pass reactFlowInstance to the parent component
        React.useEffect(() => {
            if (setReactFlowInstance) {
                setReactFlowInstance(reactFlowInstance);
            }
        }, [reactFlowInstance, setReactFlowInstance]);

        return <ReactFlow {...props} />;
    }

const WorkflowEditor = forwardRef<WorkflowEditorHandles, Props>((props, ref) => {

    useImperativeHandle(ref, () => ({
        getBoundingClientRect,
    }));

    // const workflow = useWorkflowStore((state) => state);
    const updateWorkflowData = useWorkflowStore(state => state.updateWorkflowData)
    const workflowData = useWorkflowStore(state => state.workflowData)
    const [api, contextHolder] = notification.useNotification();
    const isMac = navigator.appVersion.indexOf('Mac') !== -1;
    const initialNodes = [];
    const initialEdges = [];
    const defaultViewport = { x: 0, y: 0, zoom: 1 };

    const [nodes, setNodes, _onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, _onEdgesChange] = useEdgesState(initialEdges);

    // const [edges, setEdges] = useState<Edge[]>([]);
    const [curNode, setCurNode] = useState<Node<PRAWorkflow.Block> | undefined>(undefined);
    const reactFlowInstanceRef = useRef<ReactFlowInstance<any, any> | null>(null);
    const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
    const editBlockDrawerRef = useRef<any>(null);
    // const getPosition = (position) => (Array.isArray(position) ? position : [0, 0]);

    // 执行工作流
    const executeFromBlock = async (blockId: string) => {
        try {
            console.log(`executeFromBlock: ${blockId}`)
            if (!blockId) return;
            const workflowOptions = { blockId };
            console.log('workflowData', workflowData)



            await sendToBackgroundViaRelay({
                name: 'workflow',
                body: {
                    type: 'workflow:execute',
                    data: {
                        // blockId,
                        workflowData: JSON.stringify(workflowData),
                        workflowOptions
                    }
                }
            });
        } catch (error) {
            console.error(`executeFromBlock error: ${error}`)
        }
    }

    // update blcok EditData
    const handleUpdateNodeData = (newNode?: Node<PRAWorkflow.Block>) => {
        console.log('handleUpdateNodeData', newNode)
        setCurNode(newNode)
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === newNode?.id) {
                return {
                    ...node,
                    ...newNode,
                }
            }
            return node;
        }
        ));

    }
    // 为了在minimap中显示不同的颜色
    const minimapNodeClassName = (node: Node) => {
        // console.log("node", node)
        const id = node?.data.id
        if (!id) {
            return ''
        }
        const { category } = blocks[id];
        const { color } = categories[category];

        return color;
    }

    const reactFlowProps = {
        edgeUpdaterRadius: 20,
        deleteKeyCode: 'Delete',
        elevateEdgesOnSelect: true,
        minZoom: 0.5,
        maxZoom: 3,
        multiSelectionKeyCode: isMac ? 'Meta' : 'Control',
        ...props.options,
    }
    // 更新节点
    const onNodesChange: OnNodesChange = (changes) => {
        _onNodesChange(changes);
    }
    // 连接节点
    const onConnect: OnConnect = useCallback(
        (connection) => {
            console.log('onConnect', connection)
            setEdges((eds) => addEdge(connection, eds))
        },
        []
    );

    // 获取reactflow的位置  
    const getBoundingClientRect = () => {
        return reactFlowWrapperRef.current?.getBoundingClientRect();
    }
    // 设置reactflow的实例
    const setReactFlowInstance = (instance: ReactFlowInstance) => {
        reactFlowInstanceRef.current = instance;
    };

    // 清除高亮元素
    function clearHighlightedElements() {
        const currentEdges = reactFlowInstanceRef.current?.getEdges();
        if (!currentEdges) return;
        const edgesWithClearedSelection = currentEdges?.map(edge => ({
            ...edge,
            selected: false,
            className: '' // 清除自定义的选中类名
        }));
        setEdges(edgesWithClearedSelection);
    }

    const handleDelete = (id: string) => {
        console.log('delete', id, editBlockDrawerRef)
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
        editBlockDrawerRef.current?.setOpen(false);
    }



    const handleEdit = useCallback((nodeId: string) => {
        // if disabled, do not allow to edit
        const nodes = reactFlowInstanceRef.current?.getNodes();
        console.log('edit', nodes, nodeId, nodes)
        if (!nodes) {
            return;
        }
        const blockNode = nodes?.find((node) => node.id === nodeId);
        const nodeData = blockNode?.data as PRAWorkflow.Block;
        if (nodeData?.disableEdit) {
            api.info({
                message: "Block Info",
                description: "This block is not need to edit",
                placement: "topRight"
            });
            return;
        }
        handleUpdateNodeData(blockNode);
        editBlockDrawerRef.current?.setOpen(true);
    }, [nodes])

    const onDropInEditor: DragEventHandler = useCallback((event) => {
        console.log('Dropped item in editor')
        const { dataTransfer, clientX, clientY, target } = event;
        const data = JSON.parse(dataTransfer.getData('block'));
        const blockKey = data.id
        const block = blocks[blockKey]

        console.log('data', data)
        const viewport = reactFlowInstanceRef?.current?.getViewport();

        const editorRect = reactFlowWrapperRef.current?.getBoundingClientRect();
        if (!editorRect) {
            throw new Error('editorRect is not defined')
        }
        console.log('editorRect', editorRect, reactFlowInstanceRef?.current, viewport)
        const position = reactFlowInstanceRef?.current?.project({
            y: clientY - editorRect.top,
            x: clientX - editorRect.left,
        });
        console.log('viewport', blockKey, block, viewport, position, clientX, clientY,)
        // add node

        const node = {
            id: nanoid(),
            type: 'blockBasic',
            data: {
                id: blockKey,
                onDelete: handleDelete,
                onEdit: handleEdit,
                // runworkflow
                ...block,
            },
            position: {
                x: position?.x,
                y: position?.y,
            },
            label: blockKey,
        } as Node
        setNodes((prevNodes) => [...prevNodes, node]);

        clearHighlightedElements();

    }, [reactFlowInstanceRef, reactFlowWrapperRef])

    const onDragoverEditor: DragEventHandler = (event) => {
        event.preventDefault()
    }


    // 更新边缘
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            clearHighlightedElements();
            _onEdgesChange(changes);
        },
        [_onEdgesChange]
    );
    // 双击边缘
    const onEdgeDoubleClick: EdgeMouseHandler = (event, edge) => {
        console.log('onEdgeDoubleClick')
        setEdges((edges) => edges.filter((e) => e.id !== edge.id));
    }
    const onEdgeMouseEnter: EdgeMouseHandler = (event, edge) => {
        // 当鼠标键入，使用tippy 可以使用antd的Tooltip
        console.log('onEdgeMouseEnter', edge)
        console.log('event.target',event.target)
        tippy(event.target, {
            content:'double Click to delete',
            placement: 'top',
            animation: 'fade',
            interactiveBorder:0,
        })
    }

    const handleSaveWorkflow = () => {
        if (!reactFlowInstanceRef?.current) {
            return;
        }
        // const drawFlow = reactFlowInstanceRef?.current?.toObject();
        updateWorkflowData({
            drawflow: {
                edges,
                nodes: nodes.map((node) => {
                    return {
                        id: node.id,
                        data: node.data.data,
                        position: node.position,
                        label: node.label,
                        event: node.event,
                        type: node.type,

                    }
                })
            },
        })
    }

    useEffect(() => {
        handleSaveWorkflow();
    }, [edges, nodes])

    // useEffect(() => {
    //     const editor = reactFlowInstanceRef.current;
    //     editor?.setViewport({ zoom: 3,  x: 0, y: 0  });
    // },[reactFlowInstanceRef])


    return (

        <WorkflowEditorContext.Provider
            value={{ executeFromBlock }}
        >
            <ReactFlowProvider>
                {contextHolder}
                <div
                    className='w-full h-full'
                    onDrop={onDropInEditor}
                    onDragOver={onDragoverEditor}
                    onDragEnd={clearHighlightedElements}
                    ref={reactFlowWrapperRef}
                >
                    {/* {JSON.stringify(workflowData)} */}
                    {/* <div>连接数: {edges.length}</div>
                    <div>节点数: {nodes.length}</div> */}
                    {/* {nodes.map(node => {
                        return <div>节点数:{JSON.stringify(node)}</div>
                    })} */}
                    {/* {edges.map(node => {
                        return <div>链接数:{JSON.stringify(node)}</div>
                    })} */}

                    <Flow
                        setReactFlowInstance={setReactFlowInstance}
                        id="workflow-editor"
                        nodes={nodes}
                        edges={edges}
                        onEdgeDoubleClick={onEdgeDoubleClick}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onEdgeMouseEnter={
                            onEdgeMouseEnter
                        }
                        onConnect={onConnect}
                        defaultViewport={defaultViewport}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        style={{ width: '100%', height: '100vh' }}
                        {...reactFlowProps}
                    >
                        <Controls
                            fitViewOptions={{
                                padding: 16
                            }}
                            position="bottom-left"
                            showFitView={true}
                            showZoom={true}
                            showInteractive={true} />
                        <MiniMap
                            nodeClassName={(node) => minimapNodeClassName(node)}
                            className="hidden md:block"
                        />

                        <Background className='bg-[#fafafa]' size={2} color="var(--opengpts-primary-color)" variant={BackgroundVariant.Dots} />

                        <div
                            className="absolute top-0 left-0 z-10 flex items-center w-full p-4 pointer-events-none"
                        >
                            <div className='flex justify-between w-full'>
                                <div></div>
                                <div className="flex items-center p-1 ml-4 bg-white rounded-lg pointer-events-auto ui-card dark:bg-gray-800 ">
                                    <button className="flex items-center justify-center p-2 rounded-lg cursor-pointer hoverable">
                                        <Play size="20" />
                                    </button>
                                    <button onClick={handleSaveWorkflow} className="flex items-center justify-center px-4 py-2 text-white bg-black rounded-lg cursor-pointer h-9 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-black">
                                        <Save size="24" className='pr-2' />
                                        <span className="text-white">Save</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* <button className="absolute" style={{ zIndex: 9999 }} onClick={handleSaveWorkflow}>转换为object对象</button> */}
                    </Flow>

                    <WorkflowEditBlock
                        ref={editBlockDrawerRef}
                        node={curNode}
                        workflow={workflowData}
                        editor={reactFlowInstanceRef.current}
                        autocomplete={false}
                        onUpdate={handleUpdateNodeData}
                    />

                </div>

            </ReactFlowProvider>
        </WorkflowEditorContext.Provider>

    );
})

export default WorkflowEditor;