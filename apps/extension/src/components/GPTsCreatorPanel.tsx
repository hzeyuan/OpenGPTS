import { CopyOutlined, DeleteOutlined, DownOutlined, EditOutlined, MessageOutlined, PushpinOutlined, SendOutlined, ShareAltOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { sendToBackground } from '@plasmohq/messaging';
import { Button, Dropdown, Modal, Popconfirm, Typography, Space, Spin, Tag, Tooltip, notification } from 'antd';
import Browser from "webextension-polyfill";
import { Storage } from "@plasmohq/storage";
import type { Key } from 'react';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { message } from 'antd';
import Search from 'antd/es/input/Search';
import logo from "data-base64:~assets/icon.png"
import LanguageSelectPopover from './LanguageSelectPopover';
import OnePromptClonePopover from './OnePromptClonePopover';
import GPTForm from './GPTForm';
import openaiSvg from "data-base64:~assets/openai.svg"

const storage = new Storage({
  area: "local",
  allCopied: true,
});


export default () => {
  const [open, setOpen] = useState(false);
  const [curGizmo, setCurGizmo] = useState<Gizmo | undefined>(undefined)
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
  const [modal, modalContextHolder] = Modal.useModal();

  const GPTSCount = useMemo(() => {
    return dataSource.length
  }, [dataSource])
  const PinnedCount = useMemo(() => {
    // lodash 设置默认
    return _.filter(dataSource, (gizmo) => _.defaultTo(gizmo.tags, []).includes('pinned')).length
  }, [dataSource])

  const PublicCount = useMemo(() => {
    return _.filter(dataSource, (gizmo) => _.defaultTo(gizmo.tags, []).includes('public')).length
  }, [dataSource])
  const PrivateCount = useMemo(() => {
    return _.filter(dataSource, (gizmo) => _.defaultTo(gizmo.tags, []).includes('private')).length
  }, [dataSource])




  const handleGetGptsList = async (searchValue: string = '') => {
    setSpinning(true)
    const sortGizmos = (gizmos: Gizmo[], sortType: string, sortOrder: string) => {
      const sortKeyMap = {
        'time': 'updated_at',
        'chat': 'vanity_metrics.num_conversations',
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
    const filteredGizmos = _.filter(gizmos, (gizmo) =>
      gizmo.display.name.includes(searchValue)
    );

    // 排序
    const sortedGizmos = sortGizmos(filteredGizmos, sortType, sortOrder);


    const dataSource = _.map(sortedGizmos, (gizmo: Gizmo) => {
      return {
        id: gizmo.id,
        title: gizmo.display.name,
        categories: gizmo.display.categories,
        tags: gizmo.tags,
        gizmo: gizmo,
        vanity_metrics: gizmo.vanity_metrics,
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

  const handleAsyncGptsList = async () => {
    const result = await sendToBackground({
      name: 'openai',
      body: {
        action: 'checkGPTWebAuth',
      },
    })
    const openOpenAI = () => {
      window.open('https://chat.openai.com/', '_blank')
      notificationApi.destroy()
    }
    const onClose = () => {
      notificationApi.destroy()
    }

    if (!result.ok) {
      const key = `asyncGptsList`;
      const btn = (
        <Space>
          <Button type="primary" size="small" onClick={openOpenAI}>
            open OpenAI
          </Button>
          <Button type="link" size="small" onClick={onClose}>
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

  const handleRemoveGPT = async (gizmoId: string) => {
    const result = await sendToBackground({
      name: "openai",
      body: {
        action: 'delete',
        gizmoId,
      },
      extensionId: Browser.runtime.id,
    })
    if (result?.error) {
      messageApi.error(result.error)
    }
  }

  const handleShareGPT = async (gizmo: Gizmo) => {
    const result = await sendToBackground({
      name: "openai",
      body: {
        action: 'share',
        gizmo,
      },
      extensionId: Browser.runtime.id,
    })
    console.log('result', result)
    if (!result.ok) {
      messageApi.error(result?.error)
      return
    }
    messageApi.success(`Share ${gizmo.display.name} success`);
  }

  const handleUpdatedGPT = (gizmo, values) => {
    hideModal()
    messageApi.success(`update ${gizmo.name} success`);
  }

  const handleGoGPTs = (gizmo: Gizmo) => {
    console.log('gizmo.tags', gizmo.tags)
    if (gizmo.tags?.includes('private')) {
      window.open(`https://chat.openai.com/gpts/editor/${gizmo.short_url}`)
      messageApi.warning('Private GPT can not chat,So we open the editor for you')
      return
    } else {
      window.open(`https://chat.openai.com/g/${gizmo.short_url}`)
    }
  }

  const handleCopyGPTInfo = (gizmo: Gizmo) => {
    messageApi.success(`copy ${gizmo.display.name} at clipboard success`);
    navigator.clipboard.writeText(JSON.stringify(gizmo))
  }

  const hideModal = () => { setOpen(false); };

  const handleReset = () => {
    setSortType('time')
    setSortOrder('desc')
    handleGetGptsList('')
  }

  const handleEditGPT = (gizmo: Gizmo) => {
    console.log('handleEditGPT')
    setOpen(true)
    setCurGizmo(gizmo)
  }

  const handlePublish = async (gizmo: Gizmo) => {
    const gizmoId = gizmo.id
    const isPublic = gizmo?.tags?.includes('public')
    if (isPublic) {
      messageApi.error('Public GPT can not publish Again')
      return
    }
    try {
      await sendToBackground({
        name: "openai",
        body: {
          action: 'publish',
          gizmoId,
        },
        extensionId: Browser.runtime.id,
      })
      messageApi.success('Publish Success');
    } catch (error) {
      messageApi.error(error)
    }
  }

  useEffect(() => {
    handleGetGptsList()
  }, [sortOrder, sortType])

  storage.watch({
    "gizmos": (c) => {
      handleGetGptsList()
    },

  })

  return (
    <div className='py-2 bg-[var(--opengpts-option-card-bg-color)]'>

      <div className='mx-4'>
        <div className='mb-2 text-2xl font-semibold '><Typography.Title level={2}>Open GPTS</Typography.Title></div>
        <div className='flex gap-x-2'>
          <Tooltip>
            <Button
              key="async"
              loading={syncing}
              type="primary"
              onClick={() => {
                handleAsyncGptsList()
              }}
            >
              同步GPTS数据
            </Button>
          </Tooltip>
          <OnePromptClonePopover
            notificationApi={notificationApi}
          >
            <Button
            >
              一键生成GPTs
            </Button>
          </OnePromptClonePopover>

          {/* <Button
            size="small"
            key="testChat"
            loading={syncing}
            type="primary"
            onClick={() => {
              sendToBackground({
                name: "openai",
                body: {
                  action: 'chatWithWeb',
                  question: '你好',
                  session: {
                    gizmoId: 'g-9D86OXon4',
                  },
                },
                extensionId: Browser.runtime.id,
              })
            }}
          >
            测试对话
          </Button> */}
          {/* <Button
            key="getModels"
            size="small"
            loading={syncing}
            type="primary"
            onClick={() => {
              sendToBackground({
                name: "openai",
                body: {
                  action: 'getModels',
                },
                extensionId: Browser.runtime.id,
              })
            }}
          >
            获取模型列表
          </Button> */}

        </div>
      </div>
      <Spin spinning={spinning}>
        <ProList<{
          id: string;
          categories: string[];
          tags: string[];
          title: string;
          gizmo: Gizmo;
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
                      onClick={() => handleGoGPTs(record.gizmo)}
                      className="  cursor-pointer   hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px]"
                      role="button">
                      <img src={openaiSvg}></img>
                    </div>
                    {/* edit */}
                    <div
                      onClick={() => handleEditGPT(record.gizmo)}
                      className=" text-[var(--opengpts-sidebar-model-btn-color)] hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px]"
                      role="button">
                      <EditOutlined size={16} />
                    </div>
                    {/* copy to Paste */}
                    <div
                      onClick={() => handleCopyGPTInfo(record.gizmo)}
                      className=" text-[var(--opengpts-sidebar-model-btn-color)] hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer   h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px]"
                      role="button">
                      <CopyOutlined size={16} />
                    </div>
                    {/* Delete GPT */}
                    <Popconfirm
                      title="Delete the GPT"
                      description="Are you sure to delete this GPT?"
                      onConfirm={() => handleRemoveGPT(record.id)}
                      icon={<DeleteOutlined style={{ color: 'red' }} />}
                    >
                      <div
                        className=" text-red-500 hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <DeleteOutlined size={16} />
                      </div>
                    </Popconfirm>
                    {/* share to Store */}
                    <Popconfirm
                      title="Share My GPT Store"
                      description="Are you sure to Share this GPT to Our GPT Store?"
                      onConfirm={() => handleShareGPT(record.gizmo)}
                      icon={<ShareAltOutlined style={{ color: '' }} />}
                    >
                      <div
                        className="  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <ShareAltOutlined size={16} />
                      </div>
                    </Popconfirm>
                    {/* change language */}
                    <LanguageSelectPopover gizmo={record.gizmo} notificationApi={notificationApi} ></LanguageSelectPopover>
                    <OnePromptClonePopover notificationApi={notificationApi} gizmo={record.gizmo}>
                      <div
                        className="  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <SwapOutlined />
                      </div>
                    </OnePromptClonePopover>
                    <Popconfirm
                      title="Publish the GPT"
                      description="Are you sure to Publish this GPT?"
                      onConfirm={() => handlePublish(record.gizmo)}
                      icon={<SendOutlined style={{ color: 'blueviolet' }} />}
                    >
                      <div
                        className="hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <SendOutlined size={16} />
                      </div>
                    </Popconfirm>

                  </div>
                </div>

              )
            },
          }}
          toolbar={{
            title: <div className='flex items-center gap-x-2'>
              <span className=' whitespace-nowrap'>My GPTS</span>
              <Tag color='#2196F3'>Count: {GPTSCount}</Tag>
              <Tag color='#4CAF50'>Pinned: {PinnedCount}</Tag>
              <Tag color='#5BD8A6'>Public: {PublicCount}</Tag>
              <Tag color='#FFA500'>Private: {PrivateCount}</Tag>
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
                      <div className='flex items-center w-full '>
                        <h3 className="px-2 text-sm font-semibold truncate max-w-fit ">
                          <span className="pr-2">{record.title}</span>
                        </h3>
                        <div className='py-1'>
                          {
                            record?.tags?.map((tag: string) => {
                              if (tag === 'pinned') {
                                return <Tag key={tag} color='#4CAF50'>{tag}</Tag>
                              } else {
                                return (
                                  tag === 'public' ? <Tag color="#5BD8A6" key={tag}>{tag}</Tag>
                                    : // 草稿的颜色
                                    <Tag color="#FFA500" key={tag}>{tag}</Tag>
                                )
                              }
                            })
                          }
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className="flex items-center justify-center gap-1">
                          <PushpinOutlined />
                          <span> {_.get(record, 'vanity_metrics.num_pins', 0)}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <UserOutlined />
                          <span> {_.get(record, 'vanity_metrics.num_users_interacted_with', 0)}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <MessageOutlined />
                          <span> {_.get(record, 'vanity_metrics.num_conversations_str', 0)}</span>
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
      {modalContextHolder}
      {contextHolder}
      {notificationContextHolder}
      <Modal
        title="Edit GPT"
        open={open}
        onOk={hideModal}
        onCancel={hideModal}
        footer={null}
      >
        <GPTForm gizmo={curGizmo} onFinish={handleUpdatedGPT}></GPTForm>
      </Modal>
    </div>
  );
};