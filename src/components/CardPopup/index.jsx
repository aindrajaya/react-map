import React, { Fragment, useState } from 'react';

import { Button, Card, InputNumber, Space } from 'antd';

const DEFAULT_VALUE = 3000;

const CardPopup = ({feature, setRadiusFilter}) => {
  const [radius, setRadius] = useState(DEFAULT_VALUE);
  const {name, adm0name, pop_max } = feature.properties;
  return (
    <Fragment>
      <Card type='inner' title={`City of ${name}`}>
        <h2>{`${name}, from ${adm0name}`}</h2>
        <p>Population: {pop_max}</p>
        <Space>
          <InputNumber
            defaultValue={DEFAULT_VALUE}
            min={0}
            onChange={(e) => setRadius(e)}
          ></InputNumber>
          <Button 
            type='primary' 
            shape='round' 
            style={{background: '#57b83b', borderColor: '#57b83b'}}
            onClick={() => setRadiusFilter((prevState) => {
              const newFilter = radius !== 0
                ? {feature, radius}
                : prevState && (radius === 0 || (prevState.feature === feature && prevState.radius === radius))
                ? prevState
                : undefined;
              return newFilter;
            })}
            >
            Filter by Km
          </Button>
        </Space>
      </Card>
    </Fragment>
  )
}

export default CardPopup;