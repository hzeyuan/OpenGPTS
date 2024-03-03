declare namespace PRAWorkflow {
    export interface Category {
        name: string;
        border: string;
        color: string;
    }

    interface Block {
        id?:string;
        name: string;
        description?: string;
        icon: string;
        comment?: string;
        component: string;
        editComponent?: string;
        category: string;
        inputs: number;
        outputs: number;
        allowedInputs: boolean;
        maxConnection: number;
        refDataKeys?: string[];
        autocomplete?: string[];
        data: any;
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


    type getBlocks = () => Record<string, Block>;

}



export default PRAWorkflow;