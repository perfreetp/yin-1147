import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockHandoverList } from '@/data/handover';
import type { HandoverRecord, HandoverStatus } from '@/types';
import { formatDate } from '@/utils';

interface FilterTab {
  key: 'all' | HandoverStatus;
  label: string;
}

const filterTabs: FilterTab[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接收' },
  { key: 'received', label: '已接收' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '已完成' },
  { key: 'exception', label: '异常' }
];

const HandoverPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab['key']>('all');

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return mockHandoverList;
    return mockHandoverList.filter(item => item.status === activeFilter);
  }, [activeFilter]);

  const stats = useMemo(() => {
    return {
      today: mockHandoverList.filter(h => h.createdAt.startsWith('2026-06-18')).length,
      pending: mockHandoverList.filter(h => h.status === 'pending').length,
      processing: mockHandoverList.filter(h => ['received', 'processing'].includes(h.status)).length
    };
  }, []);

  const handleItemClick = (item: HandoverRecord) => {
    console.log('[Handover] 点击交接记录:', item.handoverNo);
    Taro.navigateTo({
      url: `/pages/handover-detail/index?id=${item.id}`
    });
  };

  const handleCreate = () => {
    console.log('[Handover] 发起新交接');
    Taro.navigateTo({
      url: '/pages/handover-create/index'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>门诊交接</Text>
        <Text className={styles.headerSubtitle}>实时追踪消毒器械流转状态</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.today}</Text>
            <Text className={styles.statLabel}>今日交接</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待接收</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.processing}</Text>
            <Text className={styles.statLabel}>处理中</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.filterTabs}>
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.filterTab, activeFilter === tab.key && styles.active)}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <View className={styles.listContainer}>
          {filteredList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无交接记录</Text>
            </View>
          ) : (
            filteredList.map(item => (
              <View
                key={item.id}
                className={styles.listItem}
                onClick={() => handleItemClick(item)}
              >
                <View className={styles.itemHeader}>
                  <Text className={styles.itemNo}>{item.handoverNo}</Text>
                  <StatusBadge status={item.status} text={item.statusText} />
                </View>
                <Text className={styles.itemClinic}>{item.clinicName}</Text>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemQuantity}>共 {item.totalQuantity} 件器械</Text>
                  <Text className={styles.itemTime}>{formatDate(item.createdAt, 'MM-DD HH:mm')}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View className={styles.fabButton} onClick={handleCreate}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default HandoverPage;
