import { CloudUploadOutlined, CopyOutlined, DeleteOutlined, DownOutlined, EditOutlined, MessageOutlined, PushpinOutlined, SendOutlined, ShareAltOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { sendToBackground } from '@plasmohq/messaging';
import { Button, Dropdown, Modal, Popconfirm, Typography, Space, Spin, Tag, Tooltip, notification, message, type TourProps } from 'antd';
import Browser from "webextension-polyfill";
import { Storage } from "@plasmohq/storage";
import type { Key } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import Search from 'antd/es/input/Search';
import logo from "data-base64:~assets/icon.png"
import LanguageSelectPopover from './LanguageSelectPopover';
import OnePromptClonePopover from './OnePromptClonePopover';
import GPTForm from './GPTForm';
import openaiSvg from "data-base64:~assets/openai.svg"
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();

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
            <Tooltip title={gizmo.instructions}>
              <div className="mx-2 my-1 text-xs truncate whitespace-pre-wrap line-clamp-5">{gizmo.instructions || "暂无prompt"}</div>
            </Tooltip>
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
          <h3 className="py-1 text-sm font-normal text-gray-500 ">If there is an error, please <a className="text-blue-500 " href='https://chat.openai.com/g/g-LJcAplYdM-opengpts'>OpenGPTs</a> on any chat to automatically generate the logo</h3>
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
        onClose: onClose,
      });
      return
    }

    let cursor = ''
    messageApi.info(t('syncStart'));
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
    messageApi.success(t('syncComplete'));
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
    messageApi.success(t('deleteSuccess'));
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
    messageApi.success(t('shareSuccess', { name: gizmo.display.name }));
  }

  const handleUpdatedGPT = (gizmo, values) => {
    hideModal()
    messageApi.success(t('updateSuccess', { name: gizmo.name }));
  }

  const handleGoGPTs = (gizmo: Gizmo) => {
    console.log('gizmo.tags', gizmo.tags)
    if (gizmo.tags?.includes('private')) {
      window.open(`https://chat.openai.com/gpts/editor/${gizmo.short_url}`)
      messageApi.warning(t('privateGPTWarning'));
      return
    } else {
      window.open(`https://chat.openai.com/g/${gizmo.short_url}`)
    }
  }

  const handleCopyGPTInfo = (gizmo: Gizmo) => {
    messageApi.success(t('copySuccess', { name: gizmo.display.name }));
    navigator.clipboard.writeText(`给大家分享一个我精心创建的GPTs: ${gizmo.display.name}
功能: ${gizmo.display.description}
链接: https://chat.openai.com/g/${gizmo.id} 欢迎大家使用。`)
  }

  const hideModal = () => { setOpen(false); };

  const handleReset = () => {
    setSortType('time')
    setSortOrder('desc')
    handleGetGptsList('')
  }

  const handleEditGPT = (gizmo: Gizmo) => {
    console.log('handleEditGPT')
    setCurGizmo(gizmo)
    setOpen(true)
  }

  const handlePublish = async (gizmo: Gizmo) => {
    const gizmoId = gizmo.id
    const isPublic = gizmo?.tags?.includes('public')
    if (isPublic) {
      messageApi.error(t('publishError'));
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
      messageApi.success(t('publishSuccess'));
    } catch (error) {
      messageApi.error(error)
    }
  }

  const handleBatchDelete = async (gizmoIds, onCleanSelected) => {
    console.log('selectedRowKeys', gizmoIds)
    try {
      setSpinning(true)
      onCleanSelected()
      for (let gizmoId of gizmoIds) {
        await handleRemoveGPT(gizmoId)
      }
      messageApi.success(t('deleteSuccess'));
    } catch (error) {
      messageApi.error(error)
    } finally {
      setSpinning(false)
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
    <div className='py-2 bg-[var(--opengpts-option-card-bg-color)] h-full'>

      <div className='mx-4'>
        <div className='flex items-center justify-between h-12 pb-2'>
          <Typography.Title style={{ margin: 0 }} level={3}>Open GPTS</Typography.Title>
          <button
            onClick={() => { window.open('https://open-gpts.vercel.app') }}
            className="relative w-32 h-10 p-2 overflow-hidden font-extrabold text-gray-50  duration-300  bg-neutral-800 border rounded-md cursor-pointer group hover:bg-[#60D7E2]">
            <div className="absolute z-10 w-6 h-10 duration-700 bg-yellow-500 rounded-full group-hover:-top-1 group-hover:-right-2 group-hover:scale-150 right-12 top-12"></div>
            <div className="absolute z-10 w-4 h-5 duration-700 bg-orange-500 rounded-full group-hover:-top-1 group-hover:-right-2 group-hover:scale-150 right-20 -top-6"></div>
            <div className="absolute z-10 w-3 h-3 duration-700 bg-pink-500 rounded-full group-hover:-top-1 group-hover:-right-2 group-hover:scale-150 right-32 top-6"></div>
            <div className="absolute z-10 w-2 h-2 duration-700 bg-red-600 rounded-full group-hover:-top-1 group-hover:-right-2 group-hover:scale-150 right-2 top-12"></div>
            <div className="flex items-center justify-center">OpenGPTs Store</div>
          </button>
        </div>
        <div className='flex gap-x-2'>
          <Tooltip title={t('AsyncGPTsFromChatGPT.tooltip')
          }
          >
            <Button
              key="async"
              loading={syncing}
              type="primary"
              onClick={() => {
                handleAsyncGptsList()
              }}
            >
              {t('AsyncGPTsFromChatGPT')}
            </Button>
          </Tooltip>
          <OnePromptClonePopover
            notificationApi={notificationApi}
          >
            <Button
            >
              {t('CloneGPT')}
            </Button>
          </OnePromptClonePopover>

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
                      <ShareAltOutlined size={16} />
                    </div>
                    {/* Delete GPT */}
                    <Popconfirm
                      title={t('confirmDeleteTitle')}
                      description={t('confirmDeleteDescription')}
                      onConfirm={() => handleRemoveGPT(record.id)}
                      okText={t('Confirm')}
                      cancelText={t('Cancel')}
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
                      title={t('shareGPTTitle')}
                      description={t('shareGPTDescription')}
                      okText={t('Confirm')}
                      cancelText={t('Cancel')}
                      onConfirm={() => handleShareGPT(record.gizmo)}
                      icon={<SendOutlined style={{ color: '' }} />}
                    >
                      <div
                        className="  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <SendOutlined size={16} />
                      </div>
                    </Popconfirm>
                    {/* change language */}
                    <LanguageSelectPopover gizmo={record.gizmo} notificationApi={notificationApi} ></LanguageSelectPopover>
                    {/* <OnePromptClonePopover notificationApi={notificationApi} gizmo={record.gizmo}>
                      <div
                        className="  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <SwapOutlined />
                      </div>
                    </OnePromptClonePopover> */}
                    <Popconfirm
                      title={t('publishGPTTitle')}
                      description={t('publishGPTDescription')}
                      okText={t('Confirm')}
                      cancelText={t('Cancel')}
                      onConfirm={() => handlePublish(record.gizmo)}
                      icon={<CloudUploadOutlined style={{ color: 'blueviolet' }} />}
                    >
                      <div
                        className="hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                        role="button">
                        <CloudUploadOutlined size={16} />
                      </div>
                    </Popconfirm>

                  </div>
                </div>

              )
            },
          }}
          toolbar={{
            title: <div className='flex items-center gap-x-2'>
              <span className=' whitespace-nowrap'>{t('MyGPTs')}</span>
              <Tag color='#2196F3'>{t('Count')}: {GPTSCount}</Tag>
              <Tag color='#4CAF50'>{t('Pinned')}: {PinnedCount}</Tag>
              <Tag color='#5BD8A6'>{t('Public')}: {PublicCount}</Tag>
              <Tag color='#FFA500'>{t('Private')}: {PrivateCount}</Tag>
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
                    label: t('HighToLow'),
                  }, {
                    key: 'asc',
                    label: t('LowToHigh'),
                  }],
                  selectable: true,
                  defaultSelectedKeys: ['desc'],
                  onSelect: ({ key }) => {
                    setSortOrder(key as 'desc' | 'asc');
                  },
                }}
              >
                <div className='flex items-center justify-center w-full'>
                  <span className=' min-w-[64px]'>{sortOrder === 'desc' ? t('HighToLow') : t('LowToHigh')}</span>
                  <DownOutlined />
                </div>

              </Dropdown>,
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'time',
                      label: t('sort.byTime'),
                    }, {
                      key: 'chat',
                      label: t('sort.byChats'),
                    }, {
                      key: 'user',
                      label: t('sort.byUsers'),
                    }, {
                      key: 'pin',
                      label: t('sort.byPins'),
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
                      sortType === 'time' ? t('sort.byTime') :
                        sortType === 'chat' ? t('sort.byChats') :
                          sortType === 'user' ? t('sort.byUsers') :
                            sortType === 'pin' ? t('sort.byPins') : ''
                    }
                  </span>
                  <DownOutlined />
                </div>
              </Dropdown>,
              <Search onSearch={(value) => { handleGetGptsList(value) }} placeholder="input search text" allowClear />,
              <Button onClick={handleReset} type="primary" key="primary">
                {t('Reset')}
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
          headerTitle={t('modal.openGPTS')}
          rowSelection={rowSelection}
          tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
            return (
              <Space size={16}>
                <Button danger onClick={() => handleBatchDelete(selectedRowKeys, onCleanSelected)}>删除</Button>
              </Space>
            )
          }}
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
        title={t('modal.editGPTS')}
        open={open}
        onOk={hideModal}
        onCancel={hideModal}
        footer={null}
      >
        <GPTForm gizmo={curGizmo} onFinish={handleUpdatedGPT}></GPTForm>
      </Modal>
    </div >
  );
};