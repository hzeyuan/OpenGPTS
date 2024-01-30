import { ArrowRightOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Carousel, Image } from 'antd';
import useScreenCapture from '~src/store/useScreenCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import ActionButton from '../Button/ActionButton';

const InputImgs = ({ fileList }) => {
    const [show, setShow] = useState(false);


    const handleClose = () => { setShow(false) }
    
    useEffect(() => {
        setShow(fileList.length > 0);
    }, [fileList]);

    return (
        <AnimatePresence>
            {show && (<motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}

                className="mt-[4px]">
                <div className="mx-[10px]">
                    <div className="pt-[6px] pb-[10px] flex gap-3">

                        <div className="inline-flex">

                            <div className=" rounded-[6px] border-[var(--opengpts-quote-bg-color)] border-solid border-[1px] relative">
                                <Image
                                    height={72}
                                    width={72}
                                    src={fileList[0]?.url}
                                />
                                <div onClick={handleClose} className="absolute -top-[6px] -right-[6px] cursor-pointer flex justify-center items-center h-4 w-4 rounded-full bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.8)] text-white z-10">
                                    <CloseCircleOutlined />
                                </div>
                            </div>


                        </div>
                        <div className="flex flex-col items-start justify-center gap-[8px] w-[calc(100%_-_88px)]">
                            <ActionButton onClick={() => { }} label='从图像中提取文本' icon={<ArrowRightOutlined />}></ActionButton>

                            <ActionButton onClick={() => { }} label='描述一下这张图片' icon={<ArrowRightOutlined />}></ActionButton>

                        </div>

                    </div>

                </div>
                <div className="bg-[var(--opengpts-sidebar-border-color)] h-[1px] mb-[5px] mx-[10px]"></div>
            </motion.div>)}
        </AnimatePresence>

    )
}


export default InputImgs;