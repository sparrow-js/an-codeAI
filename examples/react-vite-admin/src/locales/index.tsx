import React, { FC } from 'react';
import enUS from './en-us';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

type Id = keyof typeof enUS;

interface Props extends MessageDescriptor {
  id: Id;
}
export const LocaleFormatter: FC<Props> = ({ ...props }) => {
  const notChildProps = { ...props, children: undefined };
  return <FormattedMessage {...notChildProps} id={props.id} />;
};

type FormatMessageProps = (descriptor: Props) => string;

export const useLocale = () => {
  const { formatMessage: _formatMessage, ...rest } = useIntl();
  const formatMessage: FormatMessageProps = _formatMessage;
  return {
    ...rest,
    formatMessage
  };
};
