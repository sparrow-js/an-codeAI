import React, { FC } from 'react';
import { Card, Badge } from 'antd';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, Brush, Legend } from 'recharts';
import moment from 'moment';
import { LocaleFormatter } from '@/locales';

const data = new Array(20).fill(null).map((_, index) => ({
  name: moment()
    .add(index * 30, 'minute')
    .format('HH:mm'),
  traffic: Math.floor(Math.random() * 120 + 1),
  payments: Math.floor(Math.random() * 120 + 1)
}));

const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  if (active && payload?.length > 0) {
    const { value: value1, stroke: stroke1 } = payload[0];
    const { value: value2, stroke: stroke2 } = payload[1];
    return (
      <div className="customTooltip">
        <span className="customTooltip-title">{label}</span>
        <ul className="customTooltip-content">
          <li key="traffic">
            <Badge color={stroke1} />
            <LocaleFormatter id="app.dashboard.timeline.traffic" /> {value1}
          </li>
          <li key="payments">
            <Badge color={stroke2} />
            <LocaleFormatter id="app.dashboard.timeline.payments" /> {value2}
          </li>
        </ul>
      </div>
    );
  }
  return null;
};

const TimeLine: FC<{ loading: boolean }> = ({ loading }) => {
  return (
    <Card loading={loading} style={{ marginTop: 12}}>
      <ResponsiveContainer height={400}>
        <LineChart data={data} syncId="anyId">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="traffic" stroke="#3F90F7" />
          <Line type="monotone" dataKey="payments" stroke="#61BE82" />
          <Brush dataKey="name" fill="#13c2c2" />
          <Legend
            verticalAlign="top"
            height={40}
            formatter={value => <LocaleFormatter id={('app.dashboard.timeline.' + value) as any} />}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TimeLine;
