// import React, { useContext, useEffect, useState } from 'react';

// export const useReactFlow = (options = {}) => {
//   const flowStorage = useContext(FlowContext);
//   const [id] = useState(flowStorage.getId());

//   useEffect(() => {
//     // 在组件挂载时创建 flow 实例
//     const flowInstance = flowStorage.create(id, options);

//     // 组件卸载时清理
//     return () => {
//       flowStorage.remove(id);
//     };
//   }, [flowStorage, id, options]);

//   const flow = flowStorage.get(id);
//   return flow;
// };
