import { CloseOutlined, InboxOutlined, SearchOutlined } from "@ant-design/icons"
import { Drawer, Input, message, type UploadProps, type UploadFile } from "antd"
import { useEffect, useState } from "react"
import Dragger from "antd/es/upload/Dragger"
import { useChatStore } from "~src/store/useChatStore"
import useFileDrawerStore from "~src/store/useFileDrawerStore"
import { useTranslation } from "react-i18next"
interface FileDrawerProps {
    chatId: string;
}




const FileDrawer: React.FC<FileDrawerProps> = ({ chatId }) => {
    const fileDrawers = useFileDrawerStore(state => state.fileDrawers);
    const { hideFileDrawer } = useFileDrawerStore();
    const curChatId = useChatStore(state => state.curChatId);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const addChatFile = useChatStore(state => state.addChatFile);
    const deleteChatFile = useChatStore(state => state.deleteChatFile);
    const getChatFileList = useChatStore(state => state.getChatFileList);
    const { t } = useTranslation();
    
    const isFileDrawerVisible = fileDrawers.some(drawer => drawer.chatId === chatId && drawer.isVisible);
    const uploadProps: UploadProps = {
        method: 'post',
        name: 'file',
        multiple: true,
        // defaultFileList: getChatFileList(),
        headers: {
            'X-Requested-With': ''
        },
        // listType:'picture-card',
        // itemRender: (originNode, file, currFileList) => {
        //     console.log('file', file)
        //     return <div></div>
        //     return originNode;
        // },
        onRemove: (file) => {
            console.log('onRemove', file)
            deleteChatFile(curChatId, file.uid)
            setFileList((prevFileList) => {
                return prevFileList.filter((item) => item.uid !== file.uid)
            })
            return true
        },
        action: 'http://127.0.0.1:1337/api/loaderFiles',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
                console.log('info.file', info.file)
                addChatFile(curChatId, {
                    uid: info.file.uid,
                    name: info.file.name,
                    status: info.file.status,
                    url: info.file.response.url,
                    type: info.file.type,
                    size: info.file.size,
                    percent: info.file.percent,

                })


            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
            setFileList(info.fileList)

        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    useEffect(() => {
        const fileList = getChatFileList()
        setFileList(fileList)
    }, [curChatId])



    return (
        <Drawer
            maskClosable={false}
            height={'80%'}

            styles={{ body: { padding: 0, overflow: 'hidden', minHeight: '250px' } }}
            title={
                < div className="flex items-center justify-between" >
                    <div>{t('FileHistory')}</div>
                    <CloseOutlined onClick={() => hideFileDrawer(chatId)} className="cursor-pointer " />
                </div >
            }
            placement="bottom"
            closable={false}
            getContainer={false}
            onClose={() => hideFileDrawer(chatId)}
            open={isFileDrawerVisible} >
            <div className="px-4 py-3 search-area">
                <Input className="mb-4" placeholder="Search" style={{ height: '40px' }} prefix={<SearchOutlined size={24} />}></Input>

                <Dragger {...uploadProps} fileList={fileList}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t('UploadInstructions')}</p>
                    <p className="ant-upload-hint">
                       {t('UploadGuidelines')}
                    </p>
                </Dragger>
            </div>
        </Drawer >
    )
}


export {
    FileDrawer,
    useFileDrawerStore
}