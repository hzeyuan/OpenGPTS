import { CommentOutlined, CustomerServiceOutlined, QuestionCircleFilled, QuestionCircleOutlined } from "@ant-design/icons"
import { Popconfirm, Slider, Tooltip } from "antd"
import React, { useContext, useEffect, useState } from "react"
import Split from "react-split-grid"



const DynamicSplitPanel: React.FC<any> = ({ panels, splitPanelNum, style }) => {

  // 初始化行和列的 grid-template
  const initGridTemplate = (count) => Array(count).fill("1fr").join(" 10px ")

  const [gridTemplateColumns, setGridTemplateColumns] = useState(initGridTemplate(1))
  const [gridTemplateRows, setGridTemplateRows] = useState(initGridTemplate(1))
  // const { addPanel } = useAgent()

  // console.log("gridTemplateColumns", gridTemplateColumns)
  // console.log("gridTemplateRows", gridTemplateRows)
  // 处理拖动事件
  const handleDrag = (direction, track, style) => {
    if (direction === "row") {
      setGridTemplateRows(style)
    } else if (direction === "column") {
      setGridTemplateColumns(style)
    }
  }

  // 生成面板和分割线
  const renderPanelsAndGutters = ({ getGridProps, getGutterProps }) => {
    if (splitPanelNum == 1) {
      // 设置面板宽度
      return (
        <div className="grid h-full" {...getGridProps()}>
          {panels[0]}
        </div>
      )
    } else if (splitPanelNum === 2) {
      return (
        <div className="grid h-full" {...getGridProps()}>
          {panels[0]}
          <div
            style={{ gridColumn: 2 }}
            className="gutter-col gutter-col-1 resize-gutter "
            {...getGutterProps("column", 1)}
          />
          {panels[1]}
        </div>
      )
    } else if (splitPanelNum === 3) {
      return (
        <div className="grid h-full" {...getGridProps()}>
          {panels[0]}
          <div
            style={{ gridColumn: 2 }}
            className="gutter-col gutter-col-1 resize-gutter "
            {...getGutterProps("column", 1)}
          />
          {panels[1]}
          <div
            style={{ gridColumn: 4 }}
            className="gutter-col gutter-col-3 resize-gutter "
            {...getGutterProps("column", 3)}
          />
          {panels[2]}
        </div>
      )
    } else if (splitPanelNum === 4) {
      return (
        <div className="grid h-full" {...getGridProps()}>
          {panels[0]}
          <div
            style={{ gridColumn: 2 }}
            className="gutter-col gutter-col-1 resize-gutter "
            {...getGutterProps("column", 1)}
          />
          {panels[1]}
          {panels[2]}
          <div
            style={{ gridRow: 2 }}
            className="gutter-row gutter-row-1 resize-gutter "
            {...getGutterProps("row", 1)}
          />
          {panels[3]}
        </div>
      )
    } else if (splitPanelNum === 6) {
      return (
        <div className="grid h-full" {...getGridProps()}>
          {panels[0]}
          <div
            style={{ gridColumn: 2 }}
            className="gutter-col gutter-col-1 resize-gutter "
            {...getGutterProps("column", 1)}
          />
          {panels[1]}
          <div
            style={{ gridColumn: 4 }}
            className="gutter-col gutter-col-3 resize-gutter "
            {...getGutterProps("column", 3)}
          />
          {panels[2]}
          {panels[3]}
          <div
            style={{ gridRow: 2 }}
            className="gutter-row gutter-row-1 resize-gutter "
            {...getGutterProps("row", 1)}
          />
          {panels[4]}
          {panels[5]}
        </div>
      )
    }
  }

  useEffect(() => {
    // 复制panel
    if (splitPanelNum === 1) {
      setGridTemplateColumns(initGridTemplate(1))
      setGridTemplateRows(initGridTemplate(1))
    } else if (splitPanelNum === 2) {
      setGridTemplateColumns(initGridTemplate(2))
      setGridTemplateRows(initGridTemplate(1))
    } else if (splitPanelNum === 3) {
      setGridTemplateColumns(initGridTemplate(3))
      setGridTemplateRows(initGridTemplate(1))
    } else if (splitPanelNum === 4) {
      setGridTemplateColumns(initGridTemplate(2))
      setGridTemplateRows(initGridTemplate(2))
    }
    else if (splitPanelNum === 6) {
      setGridTemplateColumns(initGridTemplate(3))
      setGridTemplateRows(initGridTemplate(2))
    }
  }, [splitPanelNum])



  return (
    <div className="h-full overflow-x-scroll overflow-y-hidden" id="orion-split-panel" style={style} >
      <Split
        gridTemplateRows={gridTemplateRows}
        gridTemplateColumns={gridTemplateColumns}
        rowMinSize={200}
        columnMinSize={200}
        rowMaxSize={200}
        columnMaxSize={200}
        cursor="col-resize"
        dragInterval={2}
        onDrag={handleDrag}
        // @ts-ignore
        render={({ getGridProps, getGutterProps }) =>
          renderPanelsAndGutters({ getGridProps, getGutterProps })
        }
      />
    </div>
  )
}

export default DynamicSplitPanel
