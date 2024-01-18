import { CopyOutlined, DeleteOutlined, DownOutlined, EditOutlined, EllipsisOutlined, LikeOutlined, MessageOutlined, MoreOutlined, PushpinOutlined, SearchOutlined, ShareAltOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { sendToBackground } from '@plasmohq/messaging';
import { Badge, Button, Divider, Dropdown, Input, Popconfirm, Progress, Segmented, Select, Space, Spin, Tag, Tooltip, notification } from 'antd';
import Browser from "webextension-polyfill";
import { Storage } from "@plasmohq/storage";
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import Search from 'antd/es/input/Search';
import logo from "data-base64:~assets/icon.png"


const storage = new Storage({
  area: "local",
  allCopied: true,
});




export default () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [sortType, setSortType] = useState<string>('time');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [spinning, setSpinning] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => setSelectedRowKeys(keys),
  };
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const handleGetGptsList = async (searchValue: string = '') => {
    setSpinning(true)
    const sortGizmos = (gizmos: Gizmo[], sortType: string, sortOrder: string) => {
      const sortKeyMap = {
        'time': 'updated_at',
        'chat': 'vanity_metrics.num_conversations_str',
        'user': 'vanity_metrics.num_users_interacted_with',
        'pin': 'vanity_metrics.num_pins'
      };

      return _.orderBy(
        gizmos,
        [sortKeyMap[sortType]],
        [sortOrder === 'asc' ? 'asc' : 'desc']
      );
    };
    const gizmos = await storage.getItem<Gizmo[]>('gizmos')
    // lodash 过滤匹配searchValue
    const filteredGizmos = _.filter(gizmos, (gizmo) =>
      gizmo.display.name.includes(searchValue)
    );

    // 排序
    const sortedGizmos = sortGizmos(filteredGizmos, sortType, sortOrder);

    // console.log('sortedGizmos', sortedGizmos)


    const dataSource = _.map(sortedGizmos, (gizmo: Gizmo) => {
      return {
        id: gizmo.id,
        title: gizmo.display.name,
        categories: gizmo.display.categories,
        tags: gizmo.tags,
        subTitle: {
          categories: gizmo.display.categories,
          vanity_metrics: gizmo.vanity_metrics,
          tags: gizmo.tags,
        },
        description: gizmo.display.description,
        actions: [],
        type: 'top',
        avatar: gizmo.display.profile_picture_url,
        content: (
          <div
          >
            <div className="mx-2 my-1 text-xs truncate whitespace-pre-wrap line-clamp-2">{gizmo.instructions || "暂无prompt"}</div>
          </div>
        ),
      }
    })
    setDataSource(dataSource)
    setSpinning(false)
  }

  const handleRemoveGPT = async (gizmoId: string) => {

    const result = await sendToBackground({
      name: "openai",
      body: {
        action: 'delete',
        gizmoId,
      },
      extensionId: Browser.runtime.id,
    })
    handleGetGptsList()
    if (result?.error) {
      messageApi.error(result.error)
    }
  }


  const handleAsyncGptsList = async () => {

    const authorization = await storage.getItem('Authorization')
    const openOpenAI = () => {
      window.open('https://chat.openai.com/', '_blank')
    }

    // return
    if (!authorization) {
      const key = `open${Date.now()}`;
      const btn = (
        <Space>
          <Button type="primary" size="small" onClick={openOpenAI}>
            open OpenAI
          </Button>
          <Button type="link" size="small" onClick={() => notificationApi.destroy()}>
            Close
          </Button>
        </Space>
      );
      notificationApi.open({
        message: '请先登录OpenAI',
        description:
          '请先登录OpenAI',
        btn,
        key,
        onClose: close,
      });
      return
    }

    let cursor = ''
    messageApi.info('开始同步ChatGPT中的GPTs');
    setSyncing(true)
    const refreshInterval = setInterval(handleGetGptsList, 1000);
    while (true) {
      const result = await sendToBackground({
        name: "openai",
        body: {
          action: 'discovery',
          discovery: {
            cursor
          }
        },
        extensionId: Browser.runtime.id,
      })
      // 等待一秒
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('')
        }, 300)
      })
      console.log('handleAsyncGptsList', result.data)
      cursor = result.data.cursor

      if (result.error) {
        messageApi.error(result.error)
        break;
      }
      if (!cursor || result.data.gizmos.length === 0) {
        break
      }
    }
    messageApi.success('同步完成');
    setSyncing(false)
    clearInterval(refreshInterval)
  }


  const handleReset = () => {
    handleGetGptsList('')
  }

  useEffect(() => {
    handleGetGptsList()
  }, [sortOrder, sortType])

  return (
    <div className='py-2'>

      <div className='mx-4'>
        <div className='mb-2 text-2xl font-semibold '>Open GPTS</div>
        <Tooltip>
          <Button
            key="3"
            loading={syncing}
            type="primary"
            onClick={() => {
              handleAsyncGptsList()
            }}
          >
            同步GPTS数据
          </Button>
        </Tooltip>
      </div>
      <Spin spinning={spinning}>
        <ProList<{
          id: string;
          categories: string[];
          tags: string[];
          title: string;
          subTitle: JSX.Element;
          actions: JSX.Element[];
          description: JSX.Element;
          type?: 'top' | 'inline' | 'new';
          avatar: string;
          children: JSX.Element;
        }>
          metas={{
            title: {
              dataIndex: 'title',
              search: false,
            },
            subTitle: {
              search: false,
            },
            type: {
              search: false,
              render: (text, record) => {
                return (
                  <div className="flex items-center gap-2">
                    <Tag color="#5BD8A6">{record.subTitle['categories'][0]}</Tag>
                    <Tag color="#5BD8A6">{record.subTitle['tags'][0]}</Tag>
                  </div>
                )
              }
            },
            description: {
              search: false,
              // render: (text, record) => (<></>)
            },
            avatar: {
              dataIndex: 'avatar',
              search: false,
            },
            content: {
              search: false,
            },
            actions: {
              // cardActionProps:'extra',
              render: (text, record) => (
                <div>
                  <div className="flex items-center justify-center gap-1 mx-2">

                    <div
                      className=" text-[var(--gptreat-sidebar-model-btn-color)] hover:bg-[var(--gptreat-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px]"
                      role="button">
                      <EditOutlined size={16} />
                    </div>
                    <div
                      className=" text-[var(--gptreat-sidebar-model-btn-color)] hover:bg-[var(--gptreat-sidebar-model-btn-hover-bg-color)] cursor-pointer   h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px]"
                      role="button">
                      <CopyOutlined size={16} />
                    </div>
                    <Popconfirm
                      title="Delete the GPT"
                      description="Are you sure to delete this GPT?"
                      onConfirm={() => handleRemoveGPT(record.id)}
                      icon={<DeleteOutlined className='text-red-500 ' />}
                    >
                      <div
                        className=" text-red-500 hover:bg-[var(--gptreat-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <DeleteOutlined size={16} />
                      </div>
                    </Popconfirm>
                    <Tooltip
                      title="Share My GPT Store"
                    >
                      <div
                        className="  hover:bg-[var(--gptreat-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <ShareAltOutlined size={16} />
                      </div>
                    </Tooltip>
                  </div>
                </div>

              )
            },
          }}
          toolbar={{
            title: <div className='flex items-center gap-x-2'>
              <span>My GPTS</span> <Tag>count: {dataSource.length}</Tag>
            </div>,
            // menu: {
            //   activeKey,
            //   items: [
            //     {
            //       key: 'tab1',
            //       label: (
            //         <span>全部实验室{renderBadge(99, activeKey === 'tab1')}</span>
            //       ),
            //     },
            //     {
            //       key: 'tab2',
            //       label: (
            //         <span>
            //           我创建的实验室{renderBadge(32, activeKey === 'tab2')}
            //         </span>
            //       ),
            //     },
            //   ],
            //   onChange(key) {
            //     setActiveKey(key);
            //   },
            // },
            search: false,
            actions: [
              <Dropdown
                menu={{
                  items: [{
                    key: 'desc',
                    label: '从高到低',
                  }, {
                    key: 'asc',
                    label: '从低到高',
                  }],
                  selectable: true,
                  defaultSelectedKeys: ['desc'],
                  onSelect: ({ key }) => {
                    setSortOrder(key as 'desc' | 'asc');
                  },
                }}
              >
                <div className='flex items-center justify-center w-full'>
                  <span className=' min-w-[56px]'>{sortOrder === 'desc' ? '从高到低' : '从低到高'}</span>
                  <DownOutlined />
                </div>

              </Dropdown>,
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'time',
                      label: '按时间排序',
                    }, {
                      key: 'chat',
                      label: '按聊天数排序',
                    }, {
                      key: 'user',
                      label: '按用户数排序',
                    }, {
                      key: 'pin',
                      label: '按收藏数排序',
                    }],
                  selectable: true,
                  defaultSelectedKeys: ['time'],
                  onSelect: ({ key }) => {
                    setSortType(key);
                  },
                }}
              >
                <div className='flex items-center justify-center w-full'>
                  <span className=' min-w-[85px]'>
                    {
                      sortType === 'time' ? '按时间排序' :
                        sortType === 'chat' ? '按聊天数排序' :
                          sortType === 'user' ? '按用户数排序' :
                            sortType === 'pin' ? '按收藏数排序' : ''
                    }
                  </span>
                  <DownOutlined />
                </div>
              </Dropdown>,
              <Search onSearch={(value) => { handleGetGptsList(value) }} placeholder="input search text" allowClear />,
              <Button onClick={handleReset} type="primary" key="primary">
                重置
              </Button>,
            ],

          }}

          itemHeaderRender={(record) => {
            return (
              <div className="flex items-start flex-1">
                <img
                  src={record.avatar || logo}
                  alt=""
                  className="inline-block object-cover w-10 h-10 mr-2 rounded-full"
                />

                <div className='flex-1'>
                  <div className="flex flex-col gap-2">
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className="px-2 text-sm font-semibold truncate ">
                          <span className="pr-2">{record.title}</span>
                        </h3>
                        <div className='py-1'>
                          {
                            record.tags.map((tag: string) => {
                              return <Tag color="#5BD8A6" key={tag}>{tag}</Tag>
                            })
                          }
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className="flex items-center justify-center gap-1">
                          <PushpinOutlined />
                          <span> {record.subTitle['vanity_metrics']['num_pins']}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <UserOutlined />
                          <span> {record.subTitle['vanity_metrics']['num_users_interacted_with']}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <MessageOutlined />
                          <span> {record.subTitle['vanity_metrics']['num_conversations_str']}</span>
                        </div>
                      </div>
                    </div>
                    <p className="my-1 text-xs truncate whitespace-pre-wrap line-clamp-1">{record.description || "暂无描述"}</p>
                  </div>
                </div>
              </div>
            )
          }}
          rowKey={(record) => record.id}
          itemLayout="vertical"
          headerTitle="Open GPTS"
          rowSelection={rowSelection}
          dataSource={dataSource}

          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            size: 'small'
          }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
          }}

        />
      </Spin>

      {contextHolder}
      {notificationContextHolder}
    </div>
  );
};