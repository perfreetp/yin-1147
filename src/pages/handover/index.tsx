import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, useDidShow } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store';
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
  const [clinicFilter, setClinicFilter] = useState<string | null>(null);
  const handoverList = useAppStore(state => state.handoverList);

  useDidShow(() => {
    const filter = Taro.getStorageSync('dashboard_filter');
    if (filter && typeof filter === 'object') {
      if (filter.type === 'pending') {
        setActiveFilter('pending');
      }
      if (filter.clinicId) {
        setClinicFilter(filter.clinicId);
      }
      Taro.removeStorageSync('dashboard_filter');
    }
  });

  const filteredList = useMemo(() => {
    let list = handoverList;
    if (activeFilter !== 'all') {
      list = list.filter(item => item.status === activeFilter);
    }
    if (clinicFilter) {
      list = list.filter(item => item.clinicId === clinicFilter);
    }
    return list;
  }, [handoverList, activeFilter, clinicFilter]);

  const stats = useMemo(() => {
    const todayStr = formatDate(new Date(), 'YYYY-MM-DD');
    const baseList = clinicFilter ? handoverList.filter(h => h.clinicId === clinicFilter) : handoverList;
    return {
      today: baseList.filter(h => h.createdAt.startsWith(todayStr)).length,
      pending: baseList.filter(h => h.status === 'pending').length,
      processing: baseList.filter(h => ['received', 'processing'].includes(h.status)).length
    };
  }, [handoverList, clinicFilter]);

  const activeClinicName = useMemo(() => {
    if (!clinicFilter) return null;
    const item = handoverList.find(h => h.clinicId === clinicFilter);
    return item?.clinicName || null;
  }, [handoverList, clinicFilter]);

  const clearClinicFilter = () => {
    setClinicFilter(null);
  };

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

  const handleViewDashboard = () => {
    console.log('[Handover] 查看流转看板');
    Taro.navigateTo({
      url: '/pages/dashboard/index'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTopRow}>
          <View>
            <Text className={styles.headerTitle}>门诊交接</Text>
            <Text className={styles.headerSubtitle}>实时追踪消毒器械流转状态</Text>
          </View>
          <View className={styles.dashboardEntry} onClick={handleViewDashboard}>
            <Text className={styles.dashboardIcon}>📊</Text>
            <Text className={styles.dashboardText}>看板</Text>
          </View>
        </View>
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
        {activeClinicName ? (
          <View className={styles.clinicFilterBar} onClick={clearClinicFilter}>
            <Text className={styles.clinicFilterText}>🏥 {activeClinicName}（点击清除筛选）</Text>
          </View>
        ) : null}
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
                {item.receiverName && item.handoverTime ? (
                  <View className={styles.receiverRow}>
                    <Text className={styles.receiverIcon}>✅</Text>
                    <Text className={styles.receiverText}>
                      {item.receiverName} · {formatDate(item.handoverTime, 'MM-DD HH:mm')}
                    </Text>
                  </View>
                ) : null}
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
