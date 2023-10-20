import React, { FC } from "react";
import { Row, Col, Card, Tooltip, Progress, Badge } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ColProps } from "antd/lib/col";
import { ReactComponent as CaretUpIcon } from "./assets/caret-up.svg";
import { ReactComponent as CaretDownIcon } from "./assets/caret-down.svg";

import moment from "moment";
import { useLocale } from "@/locales";
import { Line } from "@ant-design/charts";

const data = new Array(14).fill(null).map((_, index) => ({
  name: moment().add(index, "day").format("YYYY-MM-DD"),
  number: Math.floor(Math.random() * 8 + 1),
}));

const wrapperCol: ColProps = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 6,
};

interface ColCardProps {
  metaName: string;
  metaCount: string;
  body: React.ReactNode;
  footer: React.ReactNode;
  loading: boolean;
}

const ColCard: FC<ColCardProps> = ({
  metaName,
  metaCount,
  body,
  footer,
  loading,
}) => {
  return (
    <Col {...wrapperCol}>
      <Card loading={loading} className="overview" bordered={false}>
        <div className="overview-header">
          <div className="overview-header-meta">{metaName}</div>
          <div className="overview-header-count">{metaCount}</div>
          <Tooltip title="Introduce">
            <InfoCircleOutlined className="overview-header-action" />
          </Tooltip>
        </div>
        <div className="overview-body">{body}</div>
        <div className="overview-footer">{footer}</div>
      </Card>
    </Col>
  );
};

interface TrendProps {
  wow: string;
  dod: string;
  style?: React.CSSProperties;
}

const Trend: FC<TrendProps> = ({ wow, dod, style = {} }) => {
  const { formatMessage } = useLocale();
  return (
    <div className="trend" style={style}>
      <div className="trend-item">
        <span className="trend-item-label">
          {formatMessage({ id: "app.dashboard.overview.wowChange" })}
        </span>
        <span className="trend-item-text">{wow}</span>
        <CaretUpIcon />
      </div>
      <div className="trend-item">
        <span className="trend-item-label">
          {formatMessage({ id: "app.dashboard.overview.dodChange" })}
        </span>
        <span className="trend-item-text">{dod}</span>
        <CaretDownIcon />
      </div>
    </div>
  );
};

const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  return payload?.length > 0
    ? active && (
        <div className="customTooltip">
          <span className="customTooltip-title">
            <Badge color={payload[0].fill} /> {label} : {payload[0].value}
          </span>
        </div>
      )
    : null;
};

interface FieldProps {
  name: string;
  number: string;
}

const Field: FC<FieldProps> = ({ name, number }) => (
  <div className="field">
    <span className="field-label">{name}</span>
    <span className="field-number">{number} </span>
  </div>
);

const Overview: FC<{ loading: boolean }> = ({ loading }) => {
  const { formatMessage } = useLocale();
const data = [
  { year: '1991', value: 3 },
  { year: '1992', value: 4 },
  { year: '1993', value: 3.5 },
  { year: '1994', value: 5 },
  { year: '1995', value: 4.9 },
  { year: '1996', value: 6 },
  { year: '1997', value: 7 },
  { year: '1998', value: 9 },
  { year: '1999', value: 13 },
];
const config = {
  data,
  height: 400,
  xField: 'year',
  yField: 'value',
  point: {
    size: 5,
    shape: 'diamond',
  },
};

  return (
    <Row gutter={[12, 12]}>
      <ColCard
        componentId="111"
        loading={loading}
        metaName={formatMessage({ id: "app.dashboard.overview.totalSales" })}
        metaCount="¥ 126,560"
        body={<Trend wow="12%" dod="12%" />}
        footer={
          <Field
            name={formatMessage({ id: "app.dashboard.overview.dailySales" })}
            number="￥12,423"
          />
        }
      />
      <ColCard
        loading={loading}
        metaName={formatMessage({ id: "app.dashboard.overview.visits" })}
        metaCount="8846"
        body={
          <Line {...config} />
        }
        footer={
          <Field
            name={formatMessage({ id: "app.dashboard.overview.dailySales" })}
            number="1234"
          />
        }
      />
      {/* <ColCard
        loading={loading}
        metaName={formatMessage({ id: "app.dashboard.overview.payments" })}
        metaCount="6560"
        body={
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="name" hide />
              <RTooltip content={<CustomTooltip />} />
              <Bar
                strokeOpacity={0}
                barSize={10}
                dataKey="number"
                stroke="#3B80D9"
                fill="#3B80D9"
              />
            </BarChart>
          </ResponsiveContainer>
        }
        footer={
          <Field
            name={formatMessage({
              id: "app.dashboard.overview.conversionRate",
            })}
            number="60%"
          />
        }
      />
      <ColCard
        loading={loading}
        metaName={formatMessage({
          id: "app.dashboard.overview.operationalEffect",
        })}
        metaCount="8846"
        body={<Progress strokeColor="#58BFC1" percent={85} />}
        footer={<Trend style={{ position: "inherit" }} wow="12%" dod="12%" />}
      /> */}
    </Row>
  );
};

export default Overview;
