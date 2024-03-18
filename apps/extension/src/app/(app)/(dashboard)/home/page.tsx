import { Button, Drawer } from "antd";
import Skeleton from "antd/lib/skeleton";
import { Suspense } from "react";
import { getWorkflowsRequest } from "~src/app/services/workflow";
import CreateWorkflowButton from "~src/components/Button/CreateWorkflowButton";
import Panel from "~src/components/Panels/Panel";
import WorkflowCardList from "~src/components/Workflow/WorkflowCardList";


// async function getServerSideProps() {
//   const data = await getWorkflowsRequest()
//   return data;
// }

export default async function HomePage() {

  // const workflowList = await getServerSideProps();

  // console.log('workflowList',workflowList )



  return (
    <Panel title="仪表盘">
      <div className="p-4 m-2">
        <div className="flex gap-2">
          {/* <Button>new Bot</Button> */}
          <CreateWorkflowButton />
        </div>
        <a className="flex items-center justify-between my-4">
          <h3 className="flex items-center text-lg lg:text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-4 h-4 mr-1 lucide lucide-component lg:w-5 lg:h-5"
            >
              <path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"></path>
              <path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"></path>
              <path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"></path>
              <path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"></path>
            </svg>
            <span>Workflow</span>
          </h3>
          <div className="flex items-center text-color-info">
            <span>more</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-4 h-4 ml-1 lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
        </a>
        <Suspense fallback={<Skeleton active />}>
          <WorkflowCardList initialWorkflowList={[]} />
        </Suspense>

      </div>
    </Panel>
  );
}
