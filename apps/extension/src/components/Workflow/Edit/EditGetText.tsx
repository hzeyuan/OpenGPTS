import EditInteractionBase from "./EditInteractionBase"

const EditGetText = ({ initialData, onUpdate }) => {

    // const [data, setData] = useState(initialData);

    // const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
    //     const updatedData = { ...data, ...newValues };
    //     setData(updatedData);
    //     onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
    // };


    return (
        <EditInteractionBase
            onUpdate={onUpdate}
            initialData={initialData}
        >
            <div>
                
            </div>
        </EditInteractionBase>
    )
}

export default EditGetText;