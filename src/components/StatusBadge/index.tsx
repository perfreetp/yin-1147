import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { getStatusColor, getStatusBgColor } from '@/utils';

interface StatusBadgeProps {
  status: string;
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const color = getStatusColor(status);
  const bgColor = getStatusBgColor(status);

  return (
    <View
      className={styles.badge}
      style={{ backgroundColor: bgColor, color }}
    >
      {text}
    </View>
  );
};

export default StatusBadge;
