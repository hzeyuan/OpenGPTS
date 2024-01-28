import { Upload, type UploadFile, type UploadProps } from 'antd';
import { useState } from 'react';

interface UploadButtonProps {
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ fileList, setFileList }) => {

  const handleUploadImg: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    const file = newFileList[newFileList.length - 1]
    console.log('file', file)
    if (file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        // 获取图片的 Base64 编码的URL
        const imageUrl = e.target?.result as string;

        // TODO:多个文件时
        // const updatedFileList = newFileList.map(f => {
        //   if (f.uid === file.uid) {
        //     return { ...f, url: imageUrl };
        //   }
        //   return f;
        // });
        // 单个文件时
        const updatedFileList = [{ ...file, url: imageUrl }];
        console.log('updatedFileList', updatedFileList)
        setFileList(updatedFileList);
      };

      // 读取文件内容为 DataURL
      reader.readAsDataURL(file.originFileObj);
    }
  };

  return (
    <Upload
      onChange={handleUploadImg}
      fileList={fileList}
      showUploadList={false}
      beforeUpload={() => false} // 阻止自动上传
      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg, image/gif, image/jfif"
    >
      <span>
        <div
          className=" text-[var(--opengpts-sidebar-model-btn-color)] hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  topbar-btn h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-xs leading-4 rounded-[30px] model-btn model-btn-no-bg"
          role="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.66634 5.33333C5.48225 5.33333 5.33301 5.48257 5.33301 5.66667C5.33301 5.85076 5.48225 6 5.66634 6C5.85044 6 5.99967 5.85076 5.99967 5.66667C5.99967 5.48257 5.85044 5.33333 5.66634 5.33333ZM3.99967 5.66667C3.99967 4.74619 4.74587 4 5.66634 4C6.58682 4 7.33301 4.74619 7.33301 5.66667C7.33301 6.58714 6.58682 7.33333 5.66634 7.33333C4.74587 7.33333 3.99967 6.58714 3.99967 5.66667Z"
              fill="currentColor"></path>
            <path
              d="M9.66634 3.33333C9.29815 3.33333 8.99967 3.63181 8.99967 4C8.99967 4.36819 9.29815 4.66667 9.66634 4.66667H11.333V6.33333C11.333 6.70152 11.6315 7 11.9997 7C12.3679 7 12.6663 6.70152 12.6663 6.33333V4.66667H14.333C14.7012 4.66667 14.9997 4.36819 14.9997 4C14.9997 3.63181 14.7012 3.33333 14.333 3.33333H12.6663V1.66667C12.6663 1.29848 12.3679 1 11.9997 1C11.6315 1 11.333 1.29848 11.333 1.66667V3.33333H9.66634Z"
              fill="currentColor"></path>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2.66634 3.33333C2.66634 2.96514 2.96482 2.66667 3.33301 2.66667H7.99967C8.36786 2.66667 8.66634 2.36819 8.66634 2C8.66634 1.63181 8.36786 1.33333 7.99967 1.33333H3.33301C2.22844 1.33333 1.33301 2.22876 1.33301 3.33333V12.6667C1.33301 13.7712 2.22844 14.6667 3.33301 14.6667H12.6663C13.7709 14.6667 14.6663 13.7712 14.6663 12.6667V8C14.6663 7.63181 14.3679 7.33333 13.9997 7.33333C13.6315 7.33333 13.333 7.63181 13.333 8V10.5702L10.4711 7.70828C10.3461 7.58326 10.1765 7.51302 9.99967 7.51302C9.82286 7.51302 9.65329 7.58326 9.52827 7.70828L3.90322 13.3333H3.33301C2.96482 13.3333 2.66634 13.0349 2.66634 12.6667V3.33333ZM12.6663 13.3333C13.0345 13.3333 13.333 13.0349 13.333 12.6667V12.4558L9.99967 9.1225L5.78884 13.3333H12.6663Z"
              fill="currentColor"></path>
          </svg>
        </div>
        <input
          type="file"
          accept=".png,.jpeg,.jpg,.webp,.svg,.gif,.jfif"
          className="hidden"
        />
      </span>
    </Upload>
  );
};

