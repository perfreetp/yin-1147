import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface InfoItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface InfoCardProps {
  title?: string;
  extra?: React.ReactNode;
  items: InfoItem[];
  showDivider?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, extra, items, showDivider = true }) => {
  return (
    <View className={styles.card}>
      {(title || extra) ? (
        <View className={styles.cardHeader}>
          {title ? <Text className={styles.cardTitle}>{title}</Text> : null}
          {extra}
        </View>
      ) : null}
      <View className={styles.cardBody}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>{item.label}</Text>
              <Text className={classnames(styles.infoValue, item.highlight && styles.infoValueHighlight)}>
                {item.value}
              </Text>
            </View>
            {showDivider && index < items.length - 1 ? (
              <View className={styles.divider} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default InfoCard;
