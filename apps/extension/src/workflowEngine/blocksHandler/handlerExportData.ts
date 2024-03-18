import { saveAs } from 'file-saver';


type Block = {
    data: any;
    id: string;
    label: string;
    position: { x: number; y: number };
    type: string;
}

function handlerExportData(block) {
    console.log('export data', block)
    const { data, id } = block;
    return new Promise(async (resolve) => {
        try {
            const fileName = data.fileName || `${id}.${data.fileType}`;
            let blob;
            console.log('blob', data?.fileType)
            // var blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
            if (data?.fileType === 'txt') {
                blob = new Blob([data.url], { type: "text/plain;charset=utf-8" });
            }
            else if (data?.fileType === 'json') {
                blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
            }
            console.log('blob', blob)

            saveAs(blob, `${fileName}.${data.fileType}`)
        } catch (error) {
            console.log('error', error)
        }


        return {
            data: data.url,
            nextBlockId: this.getBlockConnections(id),
        };
    });
}

export default handlerExportData;