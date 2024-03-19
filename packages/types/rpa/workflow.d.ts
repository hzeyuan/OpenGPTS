import type { Node, Edge } from 'reactflow'
declare namespace PRAWorkflow {
    export interface Category {
        name: string;
        border: string;
        color: string;
    }


    interface WorkflowData {
        id: string,
        // uid: string,
        is_public: number,
        drawflow?: Drawflow;
        name?: string,
        description?: string,
        icon?: string,
        globalData?: any,
        settings?: any,
        created_at?: number,
        update_at?: number,
    }

    type Drawflow = {
        nodes: Node[],
        edges: Edge[],
    };

    interface Block {
        id?: string;
        name: string;
        description?: string;
        icon: string;
        comment?: string;
        component: string;
        editComponent?: string;
        category: string;
        pinned: boolean;
        inputs: number;
        outputs: number;
        allowedInputs: boolean;
        maxConnection: number;
        refDataKeys?: string[];
        autocomplete?: string[];
        data: BlockData;
        disableDelete?: boolean;
        disableEdit?: boolean;
        // [key: string]: any;
        // editComponent: 'EditTrigger',
        // category: 'general',
        // inputs: 0,
        // outputs: 1,
        // allowedInputs: true,
        // maxConnection: 1,
    }


    type BlockData = any;

    interface BlockContext {
        running: boolean;
        input: any;
        output: any;
    }

    type getBlocks = () => Record<string, Block>;

}



export default PRAWorkflow;