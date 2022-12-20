import React, { Fragment } from 'react';

import { Button, Card, InputNumber, Space } from 'antd';

const CardPopup = ({properties}) => {
  const {name, adm0name, pop_max } = properties;
  return (
    <Fragment>
      <Card type='inner' title={`City of ${name}`}>
        <h2>{`${name}, from ${adm0name}`}</h2>
        <p>Population: {pop_max}</p>
        <Space>
          <InputNumber
            defaultValue={3000}
            min={0}
            onChange={(e) => console.log(e)}
          ></InputNumber>
          <Button type='primary' shape='round'>
            Filter by Km
          </Button>
        </Space>
      </Card>
    </Fragment>
  )
}

export default CardPopup;