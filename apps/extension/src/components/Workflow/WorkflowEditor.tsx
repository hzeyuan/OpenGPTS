"use client"
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, type DragEventHandler, useEffect } from 'react';
import ReactFlow, { useReactFlow, Background, BackgroundVariant, Controls, Handle, MiniMap, Position, ReactFlowProvider, addEdge, applyEdgeChanges, applyNodeChanges, useViewport } from 'reactflow';
import type { ReactFlowProps, OnNodesChange, Node, Edge, NodeTypes, EdgeTypes, OnConnect, OnEdgesChange, ReactFlowInstance, ReactFlowRefType, useStore } from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css';
import BlockBasic from '../Blocks/BlockBasic';
import BorderEdge from './Edge/BorderEdge';
import { categories, getBlocks } from '~src/utils/workflow';
import WorkflowEditBlock from './WorkflowEditBlock';
import { nanoid } from '~shared/utils';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';



export type WorkflowEditorHandles = {
    addNode: (node: Node) => void,
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
        addNode,
        getBoundingClientRect,
    }));


    const isMac = navigator.appVersion.indexOf('Mac') !== -1;
    const [nodes, setNodes] = useState<Node[]>([]);

    const [edges, setEdges] = useState<Edge[]>([]);
    const [curNode, setCurNode] = useState<Node<PRAWorkflow.Block> | undefined>(undefined);
    const reactFlowInstanceRef = useRef<ReactFlowInstance<PRAWorkflow.Block, any> | null>(null);
    const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
    const editBlockDrawerRef = useRef<any>(null);
    // const getPosition = (position) => (Array.isArray(position) ? position : [0, 0]);


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
        ))
    }

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

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds).map(edge => {
            // 检测边缘是否被选中，并更新其 data 属性
            console.log('edge', edge);
            if (edge.selected) {
                return { ...edge, data: { ...edge.data, isSelected: true } };
            }
            return edge;
        })),
        []
    );

    const addNode = (node: Node) => {
        node
        setNodes((prevNodes) => [...prevNodes, node]);
    };

    const getBoundingClientRect = () => {
        return reactFlowWrapperRef.current?.getBoundingClientRect();
    }
    const setReactFlowInstance = (instance: ReactFlowInstance) => {
        reactFlowInstanceRef.current = instance;
    };




    const toggleHighlightElement = ({ target, elClass, classes }: {
        target: EventTarget,
        elClass: string,
        classes: string
    }) => {
        const targetEl = (target as HTMLElement).closest(elClass);

        if (targetEl) {
            targetEl.classList.add(classes);
        } else {
            const elements = document.querySelectorAll(`.${classes}`);
            elements.forEach((element) => {
                element.classList.remove(classes);
            });
        }
    }

    function clearHighlightedElements() {
        console.log('clearHighlightedElements')
        const elements = document.querySelectorAll(
            '.dropable-area__node, .dropable-area__handle'
        );
        elements.forEach((element) => {
            element.classList.remove('dropable-area__node');
            element.classList.remove('dropable-area__handle');
        });
    }

    const handleDelete = (id: string) => {
        console.log('delete', id, editBlockDrawerRef)
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
        editBlockDrawerRef.current?.setOpen(false);
        // reactFlowInstanceRef.current?.removeElements({ id });
    }

    const handleEdit = useCallback((nodeId: string) => {
        const nodes = reactFlowInstanceRef.current?.getNodes();
        console.log('edit', nodes, nodeId, nodes)
        if (!nodes) {
            return;
        }
        const blockNode = nodes?.find((node) => node.id === nodeId);
        handleUpdateNodeData(blockNode);
        editBlockDrawerRef.current?.setOpen(true);
    }, [nodes])

    const onDropInEditor: DragEventHandler = useCallback((event) => {
        console.log('Dropped item in editor')
        const { dataTransfer, clientX, clientY, target } = event;

        // const { data, error } = attempt(() => {
        const data = JSON.parse(dataTransfer.getData('block'));
        // });

        const blockId = data.id
        const block = blocks[blockId]

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
        console.log('viewport', viewport, position, clientX, clientY,)
        // add node
        addNode({
            id: nanoid(),
            type: 'blockBasic',
            data: {
                id: blockId,
                onDelete: handleDelete,
                onEdit: handleEdit,
                ...block,
            },
            position: {
                x: position?.x,
                y: position?.y,
            },
        } as Node)

        clearHighlightedElements();

    }, [reactFlowInstanceRef, reactFlowWrapperRef])

    const onDragoverEditor: DragEventHandler = (event) => {
        const { target } = event;
        console.log('drag over editor')
        toggleHighlightElement({
            target,
            elClass: '.react-flow__handle.source',
            classes: 'dropable-area__handle',
        });

        if (!(target instanceof Element)) {
            return;
        }
        if (!target.closest('.react-flow__handle')) {
            toggleHighlightElement({
                target,
                elClass: '.react-flow__node:not(.react-flow__node-BlockGroup)',
                classes: 'dropable-area__node',
            });
        }
        event.preventDefault()
    }

    // useEffect(() => {
    //     const editor = reactFlowInstanceRef.current;
    //     editor?.setViewport({ zoom: 3,  x: 0, y: 0  });
    // },[reactFlowInstanceRef])


    return (
        <ReactFlowProvider>
            <div
                className='w-full h-full'
                onDrop={onDropInEditor}
                onDragOver={onDragoverEditor}
                onDragEnd={clearHighlightedElements}
                ref={reactFlowWrapperRef}
            >
                <Flow
                    setReactFlowInstance={setReactFlowInstance}
                    id="workflow-editor"
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    style={{ width: '100%', height: '100vh' }}
                    {...reactFlowProps}
                >
                    <Controls
                        fitViewOptions={{
                            padding: 16
                        }}
                        position="top-left"
                        showFitView={true}
                        showZoom={true}
                        showInteractive={true} />
                    <MiniMap
                        nodeClassName={(node) => minimapNodeClassName(node)}
                        className="hidden md:block"
                    />

                    <Background className='bg-[#fafafa]' size={2} color="var(--opengpts-primary-color)" variant={BackgroundVariant.Dots} />
                </Flow>

                <WorkflowEditBlock
                    // key={curNode?.id || 'workflow-edit-block'}
                    ref={editBlockDrawerRef}
                    node={curNode}
                    workflow={{}}
                    editor={reactFlowInstanceRef.current}
                    autocomplete={false}
                    onUpdate={handleUpdateNodeData}
                />

            </div>

        </ReactFlowProvider>
    );
})

export default WorkflowEditor;