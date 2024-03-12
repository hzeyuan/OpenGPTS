import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { Checkbox, Input, Select, InputNumber, Segmented } from 'antd';
import React, { useState } from 'react';

const EditForms = ({ initialData, onUpdate }) => {
  const [data, setData] = useState(initialData);
  const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
    const updatedData = { ...data, ...newValues };
    setData(updatedData);
    onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
  };

  const selectOptions = [
    { label: "Multiple", value: 'multiple' },
    { label: "Mark element", value: 'markEl' },
  ]

  return (
    <div className="flex flex-col gap-y-2">
      <div>Description</div>
      <Input.TextArea
        value={data?.description}
        placeholder="Common description"
        className="w-full"
        onChange={(e) => updateData({ description: e.target.value })}
      />
      <div>Find Element By{data.selector}</div>
      <Select
        value={data.findBy}
        options={[
          { label: 'Css Selector', value: 'cssSelector' },
        ]}
      ></Select>
      <div>Element Selector value</div>
      <input
        name='selector'
        value={data?.selector}
        placeholder="Selector"
        type="text"
        className="w-full px-4 py-2 pl-2 mt-4 mb-2 transition bg-transparent rounded-lg bg-input"
        onChange={(e) => updateData({ selector: e.target.value })}
      />
   
      {selectOptions?.map((option) => {
        return (
          <Checkbox
            checked={data[option.value]}
            className="mt-2 leading-tight"
            title={option.label}
            onChange={(e) => updateData({
              [option.value]: e.target.checked,
            })}
          >
            {option.label}
          </Checkbox>
        )
      }
      )}

      {/* element type */}
      <div>Element Type</div>
      <div>
        <Segmented
          defaultValue={data.type}
          options={['text', 'select', 'checkbox', 'radio']}
          onChange={(value) => {
            updateData({
              type: value,
              selected: initialData?.selected,
              selectOptionBy: initialData?.selectOptionBy,
              value: initialData?.value
            });
          }}
        />
      </div>

      {
        data.type === 'text' && (
          <>
            <Input
              value={data?.value}
              placeholder="Text"
              className="w-full"
              onChange={(e) => updateData({ value: e.target.value })}
            />
          </>
        )
      }

      {
        data.type === 'select' && (
          <>
            <Select
              value={data?.selectOptionBy}
              options={[
                { label: 'First Option', value: 'first' },
                { label: 'Last Option', value: 'last' },
                { label: 'Custom Option', value: 'random' },
              ]}
              onChange={(value) => updateData({ selectOptionBy: value })}
            ></Select>
            {
              data?.selectOptionBy === 'random' && (
                <>
                  <div>Custom Option value</div>
                  <InputNumber
                    defaultValue={0}
                    min={0}
                    value={data?.customOption}
                    placeholder="Custom Option"
                    className="w-full"
                    onChange={(e) => updateData({ customOption: e })}
                  />
                </>
              )
            }
          </>
        )
      }

      {
        data.type === 'checkbox' && (
          <>
            {/* input number */}
            <Checkbox
              checked={data?.selected}
              className="mt-2 leading-tight"
              onChange={(e) => updateData({ selected: e.target.checked })}
            >Selected</Checkbox>
          </>

        )
      }
      {
        data.type === 'radio' && (
          <>
            {/* <div></div> */}
            {/* input number */}
            <Checkbox
              checked={data?.selected}
              className="mt-2 leading-tight"

              onChange={(e) => updateData({ selected: e.target.checked })}
            >Selected</Checkbox>
          </>

        )
      }
    </div>
  );
}

export default EditForms;
