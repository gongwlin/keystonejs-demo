import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Tree } from 'antd'
import { FieldDescription } from '@keystone-ui/fields';
import { Button } from 'antd';

type TreeSelectProps = {
  field: any,
  value: number | null;
  onChange?: (value: number | null) => void;
  maxStars: number;
  autoFocus?: boolean;
  queryPath: string;
};

const loop = (data: any, ret: any) => {

  data.forEach((item: any) => {
    ret.push(item.key)
    if (item.children) {
      loop(item.children, ret)
    }
  })
};


export function TreeSelect(props: TreeSelectProps) {
  const [data, setData] = useState([]);
  const [checkKey, setCheckKey] = useState(typeof props.value === 'string' ? [props.value] : [])
  const [expanedKey, setExpandedKey] = useState(typeof props.value === 'string' ? [props.value] : []);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(!props || !props.queryPath) return;
    setLoading(true)
    axios.post('http://localhost:3000/api/graphql', {"variables":{"where":{},"take": 1,"skip":0},"query":`query Query {
      ${props.queryPath} {
       content
        name
      }
    }`}
    ).then(res => {
      if (res.status === 200 && res.data && res.data.data && res.data.data.mumuDirectories.length > 0) {
        const { content } = res.data.data.mumuDirectories[0];
        setData(content);
        const keys: any = [];
        loop(content, keys);
        setExpandedKey(keys)
      }
    setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [props.queryPath])

  useEffect(() => {
    setCheckKey(typeof props.value === 'string' ? [props.value] : []);
  }, [props.value])


  const onExpand = (expandedKeys: any) => {
    setExpandedKey(expandedKeys)
  }

  if (loading) {
    return null;
  }

  if (data.length === 0) {
    return <div>暂无目录, <Button type="link" onClick={() => {
      location.href = window.origin + `/${props.field.createPath}`
    }}>点击请前往创建</Button></div>
  }

  return (
    <>
    <FieldDescription id={`${props.field.path}-description`}>{props.field.description}</FieldDescription>
    <Tree
    showLine={true}
    treeData={data}
    virtual={false}
    defaultExpandAll
    selectedKeys={checkKey}
    autoExpandParent={true}
    expandedKeys={expanedKey}
    onExpand={onExpand}

    onSelect={(arg) => {
      setCheckKey(arg as any)
      props?.onChange?.(`${arg[0]}` as any)
    }}
  />
    </>
    

  );
}