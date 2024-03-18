"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs } from 'antd';
import WorkflowLayout from '~src/components/Workflow/Layout/WorkflowLayout';
import useRPAFlowStore from '~src/store/useRPAflowStore';
import { useParams } from 'next/navigation';
import { getWorkFlowByIdRequest } from '~src/app/services/workflow';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;


const Page: React.FC = () => {
  // const initialItems = [
  //   { label: 'Tab 1', children: <WorkflowLayout></WorkflowLayout>, key: '1' },
  // ];
  // const [activeKey, setActiveKey] = useState(initialItems[0].key);
  // const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);
  const params = useParams();

  const setWorkflow = useRPAFlowStore((state) => state.setWorkflow);
  


  useEffect(() => {
    const id = params.id as string
    getWorkFlowByIdRequest(id).then(data => {
      setWorkflow(data)
    })
  })


  // const onChange = (newActiveKey: string) => {
  //   setActiveKey(newActiveKey);
  // };


  // const add = () => {
  //   const newActiveKey = `newTab${newTabIndex.current++}`;
  //   const newPanes = [...items];
  //   newPanes.push({ label: 'New Tab', children: 'Content of new Tab', key: newActiveKey });
  //   setItems(newPanes);
  //   setActiveKey(newActiveKey);
  // };

  // const remove = (targetKey: TargetKey) => {
  //   let newActiveKey = activeKey;
  //   let lastIndex = -1;
  //   items.forEach((item, i) => {
  //     if (item.key === targetKey) {
  //       lastIndex = i - 1;
  //     }
  //   });
  //   const newPanes = items.filter((item) => item.key !== targetKey);
  //   if (newPanes.length && newActiveKey === targetKey) {
  //     if (lastIndex >= 0) {
  //       newActiveKey = newPanes[lastIndex].key;
  //     } else {
  //       newActiveKey = newPanes[0].key;
  //     }
  //   }
  //   setItems(newPanes);
  //   setActiveKey(newActiveKey);
  // };

  // const onEdit = (
  //   targetKey: React.MouseEvent | React.KeyboardEvent | string,
  //   action: 'add' | 'remove',
  // ) => {
  //   if (action === 'add') {
  //     add();
  //   } else {
  //     remove(targetKey);
  //   }
  // };

  return (
    <WorkflowLayout  ></WorkflowLayout>
  );
};

export default Page;