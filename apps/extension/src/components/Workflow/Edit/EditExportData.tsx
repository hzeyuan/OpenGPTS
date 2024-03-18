import Radio, { type RadioChangeEvent } from "antd/es/radio";
import { useState } from "react";

const EditExportData = ({ initialData, onUpdate }) => {
    console.log('initialData', initialData);
    const [data, setData] = useState({
        ...initialData,
        fileType: 'txt',
    });
    const filesTypeOptions = [
        { label: "CSV", value: 'csv' },
        { label: "Excel", value: 'excel' },
        { label: 'JSON', value: 'json' },
        { label: 'TXT', value: 'txt' }
    ]
    const onChange = ({ target: { value } }: RadioChangeEvent) => {
        console.log('onChange')
        setData({
            ...data,
            fileType: value
        })
        onUpdate({
            ...data,
            fileType: value
        });
    }

    return (
        <div>
            <Radio.Group
                options={filesTypeOptions}
                onChange={onChange}
                value={data?.fileType}
                optionType="button"
                buttonStyle="solid"
            />


        </div>
    )
}

export default EditExportData;
