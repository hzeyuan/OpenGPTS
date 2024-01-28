// import React, { useRef, useState, useEffect, type RefObject } from 'react';

// // 定义每个面板的类型
// interface Panel {
//   id: string;
//   ref: RefObject<HTMLDivElement>;
// }

// const useAgent = () => {
//   const [panels, setPanels] = useState<Panel[]>([]);
  
//   // 添加新的 chatPanel
//   const addPanel = () => {
//     const newPanelId = `panel-${panels.length + 1}`;
//     setPanels(prev => [...prev, { id: newPanelId, ref: React.createRef() }]);
//   };

//   // 移除指定的 chatPanel
//   const removePanel = (panelId: string) => {
//     setPanels(prev => prev.filter(panel => panel.id !== panelId));
//   };

//   // 更新指定 chatPanel 的内容
//   const updatePanel = (panelId: string, content: string) => {
//     const panel = panels.find(p => p.id === panelId);
//     if (panel && panel.ref.current) {
//       // 使用 panel.ref.current 来直接操作 DOM 或进行其他操作
//     }
//   };

//   return { panels, addPanel, removePanel, updatePanel };
// };

// export default useAgent;
