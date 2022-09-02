import React, { useRef } from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'
import { useState, useEffect } from 'react'
import { useToasts } from '@keystone-ui/toast'
import { Tree, Input, Button, Modal, Form, message } from 'antd'

const { Search } = Input

const loop = (data: any, key: string | number, callback: any) => {
  data.forEach((item: any, index: number, arr: any) => {
    if (item.key === key) {
      callback(item, index, arr)
      return
    }
    if (item.children) {
      loop(item.children, key, callback)
    }
  })
}

const getKeys = (data: any, ret: any) => {
  data.forEach((item: any) => {
    ret.push(item.key)
    if (item.children) {
      getKeys(item.children, ret)
    }
  })
}

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [dirData, setDirData] = useState(typeof value === 'string' ? JSON.parse(value) : value || [])
  const [expandedKey, setExpandedKey] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [visible, setVisible] = useState(false)
  const [pageForm] = Form.useForm()

  const dataRef = useRef({ isAdd: false, isAddFirst: false, data: {} })
  const toasts = useToasts()

  useEffect(() => {
    const keys: any = []
    getKeys(dirData, keys)
    setExpandedKey(keys)
  }, [dirData])

  const onExpand = (expandedKeys: any) => {
    setExpandedKey(expandedKeys)
    setAutoExpandParent(false)
  }

  const onDragEnter = ({ expandedKeys }: any) => {
    setExpandedKey(expandedKeys)
  }

  const onDrop = (info: any) => {
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const data = [...dirData]

    // Find dragObject
    let dragObj: any
    loop(data, dragKey, (item: any, index: any, arr: any) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: any) => {
        item.children = item.children || []
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj)
      })
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: any) => {
        item.children = item.children || []
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(dragObj)
      })
    } else {
      // Drop on the gap
      let ar: any
      let i: any
      loop(data, dropKey, (item: any, index: any, arr: any) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    setDirData(data)
    onChange?.(JSON.stringify(data))
  }

  const updateData = (type: 'add' | 'remove' | 'edit', param: any) => {
    const temp = [...dirData]

    if (type === 'add') {
      loop(temp, param.parentId, (item: any, index: any, arr: any) => {
        item.children = item.children || []
        item.children.push({ key: param.key, title: param.title, children: [] })
      })
    }

    if (type === 'edit') {
      loop(temp, param.key, (item: any, index: any, arr: any) => {
        item.title = param.title
      })
    }

    if (type === 'remove') {
      loop(temp, param.key, (item: any, index: any, arr: any) => {
        arr.splice(index, 1)
      })
    }

    setDirData(temp)
    onChange?.(JSON.stringify(temp))
  }

  const handleChange = (e: any) => {
    const { value } = e.target

    console.log('value', value)
    // const newExpandedKeys = dataList
    //   .map(item => {
    //     if (item.title.indexOf(value) > -1) {
    //       return getParentKey(item.key, defaultData);
    //     }
    //     return null;
    //   })
    //   .filter((item, i, self) => item && self.indexOf(item) === i);
    // setExpandedKeys(newExpandedKeys as React.Key[]);
    // setSearchValue(value);
    // setAutoExpandParent(true);
  }

  const handleClick = (e: any, nodeData: any, add: boolean) => {
    e.stopPropagation()
    e.preventDefault()

    dataRef.current.data = nodeData
    dataRef.current.isAdd = add
    dataRef.current.isAddFirst = false
    pageForm.resetFields()
    setVisible(true)
    if (!add) {
      pageForm.setFieldValue('tempName', nodeData.title)
    }
  }

  const handleOk = async () => {
    const ret = await pageForm.validateFields()
    const { data, isAdd, isAddFirst } = dataRef.current;
    if (isAddFirst) {
      const temp = dirData.concat([{ key: `${Date.now()}`, title: ret.tempName, children: [] }])
      setDirData(temp)
      onChange?.(JSON.stringify(temp))
      setVisible(false)
      toasts.addToast({
        title: `提示`,
        tone: 'positive',
        message: '一级目录新建成功',
      })
      return
    }
    if (isAdd) {
      updateData('add', { key: `${Date.now()}`, title: ret.tempName, children: [], parentId: data?.key })
    } else {
      // 新增
      if (data?.title !== ret.tempName) {
        updateData('edit', { ...data, title: ret.tempName })
      }
    }
    setVisible(false)
  }

  return (
    <FieldContainer>
      <FieldLabel>目录树</FieldLabel>
      <Button
        onClick={() => {
          dataRef.current.isAddFirst = true
          dataRef.current.data = { title: ''};
          pageForm.resetFields();
          setVisible(true)
        }}
        style={{ marginTop: 10, marginBottom: 20 }}
        type="primary"
      >
        新增一级目录
      </Button>

      {/* <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={handleChange} /> */}
      <Tree
        draggable
        treeData={dirData}
        autoExpandParent={autoExpandParent}
        virtual={false}
        expandedKeys={expandedKey}
        defaultExpandAll={true}
        onExpand={onExpand}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        showLine
        titleRender={(nodeData: any) => (
          <div>
            <span className="tree-title">{nodeData.title}</span>{' '}
            <span className="title-btn" title="" onClick={(e) => handleClick(e, nodeData, true)}>
              新增
            </span>
            <span className="title-btn" title="" onClick={(e) => handleClick(e, nodeData, false)}>
              编辑
            </span>
            <span
              className="title-btn"
              title=""
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                updateData('remove', nodeData)
              }}
            >
              删除
            </span>
          </div>
        )}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .title-btn {
        display: none;
        background: white;
        padding-left: 8px;
      }
      .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background-color: white !important;
      }

      .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected .tree-title{
        background: #bae7ff;
      }
      .tree-title {
        padding-left: 8px;
        padding-right: 8px;
      }

      .ant-tree-treenode-selected .title-btn {
        display: inline-block;
      }

      `,
        }}
      ></style>

      <Modal
        title={dataRef.current.isAddFirst ? '新增一级目录' : dataRef.current.isAdd ? '新增子目录' : '编辑目录名'}
        okText="确定"
        cancelText="取消"
        visible={visible}
        maskClosable={false}
        onOk={handleOk}
        onCancel={() => {
          setVisible(false)
        }}
      >
        <Form initialValues={{ tempName: '' }} form={pageForm}>
          <Form.Item label="目录名" required rules={[{ required: true, message: '目录不能为空' }]} name="tempName" normalize={(str) => str?.trim?.()}>
            <Input placeholder="请输入" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </FieldContainer>
  )
}
