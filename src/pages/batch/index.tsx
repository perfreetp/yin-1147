import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, useDidShow } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store';
import type { BatchRecord, BatchStatus } from '@/types';
import { formatDate } from '@/utils';

interface FilterTab {
  key: 'all' | BatchStatus;
  label: string;
}

const filterTabs: FilterTab[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'cleaning', label: '清洗中' },
  { key: 'disinfecting', label: '消毒中' },
  { key: 'sterilizing', label: '灭菌中' },
  { key: 'completed', label: '已完成' },
  { key: 'exception', label: '异常' }
];

const BatchPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab['key']>('all');
  const [clinicFilter, setClinicFilter] = useState<string | null>(null);
  const batchList = useAppStore(state => state.batchList);
  const handoverList = useAppStore(state => state.handoverList);

  useDidShow(() => {
    const filter = Taro.getStorageSync('dashboard_filter');
    if (filter && typeof filter === 'object') {
      if (filter.type === 'processing') {
        setActiveFilter('cleaning');
      }
      if (filter.clinicId) {
        setClinicFilter(filter.clinicId);
      }
      Taro.removeStorageSync('dashboard_filter');
    }
  });

  const batchClinicIdMap = useMemo(() => {
    const map = new Map<string, string>();
    batchList.forEach(batch => {
      const handover = handoverList.find(h => h.id === batch.sourceHandoverIds[0]);
      if (handover) {
        map.set(batch.id, handover.clinicId);
      }
    });
    return map;
  }, [batchList, handoverList]);

  const filteredList = useMemo(() => {
    let list = batchList;
    if (activeFilter !== 'all') {
      list = list.filter(item => item.status === activeFilter);
    }
    if (clinicFilter) {
      list = list.filter(item => batchClinicIdMap.get(item.id) === clinicFilter);
    }
    return list;
  }, [batchList, activeFilter, clinicFilter, batchClinicIdMap]);

  const stats = useMemo(() => {
    const baseList = clinicFilter
      ? batchList.filter(b => batchClinicIdMap.get(b.id) === clinicFilter)
      : batchList;
    return {
      processing: baseList.filter(b => ['cleaning', 'disinfecting', 'sterilizing', 'packaging'].includes(b.status)).length,
      pending: baseList.filter(b => b.status === 'pending').length,
      completed: baseList.filter(b => b.status === 'completed').length
    };
  }, [batchList, clinicFilter, batchClinicIdMap]);

  const activeClinicName = useMemo(() => {
    if (!clinicFilter) return null;
    const item = handoverList.find(h => h.clinicId === clinicFilter);
    return item?.clinicName || null;
  }, [handoverList, clinicFilter]);

  const clearClinicFilter = () => {
    setClinicFilter(null);
  };

  const getProgress = (item: BatchRecord) => {
    const total = item.steps.length;
    const completed = item.steps.filter(s => s.status === 'completed').length;
    const processing = item.steps.filter(s => s.status === 'processing').length;
    const percent = total > 0 ? Math.round(((completed + processing * 0.5) / total) * 100) : 0;
    return { completed, total, percent };
  };

  const handleItemClick = (item: BatchRecord) => {
    console.log('[Batch] 点击批次:', item.batchNo);
    Taro.navigateTo({
      url: `/pages/batch-detail/index?id=${item.id}`
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>批次处理</Text>
        <Text className={styles.headerSubtitle}>全流程追踪器械清洗消毒灭菌</Text>
        <View className={styles.progressOverview}>
          <View className={styles.progressCard}>
            <Text className={styles.progressNumber}>{stats.processing}</Text>
            <Text className={styles.progressLabel}>处理中</Text>
          </View>
          <View className={styles.progressCard}>
            <Text className={styles.progressNumber}>{stats.pending}</Text>
            <Text className={styles.progressLabel}>待处理</Text>
          </View>
          <View className={styles.progressCard}>
            <Text className={styles.progressNumber}>{stats.completed}</Text>
            <Text className={styles.progressLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        {activeClinicName ? (
          <View className={styles.clinicFilterBar} onClick={clearClinicFilter}>
            <Text className={styles.clinicFilterText}>🏥 {activeClinicName}（点击清除筛选）</Text>
          </View>
        ) : null}
        <ScrollView className={styles.filterTabs} scrollX enhanced showScrollbar={false}>
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.filterTab, activeFilter === tab.key && styles.active)}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </ScrollView>

        <View className={styles.listContainer}>
          {filteredList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无批次记录</Text>
            </View>
          ) : (
            filteredList.map(item => {
              const progress = getProgress(item);
              return (
                <View
                  key={item.id}
                  className={styles.listItem}
                  onClick={() => handleItemClick(item)}
                >
                  <View className={styles.itemHeader}>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className={styles.itemNo}>{item.batchNo}</Text>
                      {item.mergedFrom && item.mergedFrom.length > 0 ? (
                        <Text className={styles.mergeTag}>合包</Text>
                      ) : null}
                      {item.splitTo && item.splitTo.length > 0 ? (
                        <Text className={styles.splitTag}>拆分</Text>
                      ) : null}
                    </View>
                    <StatusBadge status={item.status} text={item.statusText} />
                  </View>

                  <View className={styles.itemMeta}>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaLabel}>来源：</Text>
                      <Text className={styles.metaValue}>{item.sourceHandoverIds.length} 个交接单</Text>
                    </View>
                    {item.operator ? (
                      <View className={styles.metaItem}>
                        <Text className={styles.metaLabel}>操作：</Text>
                        <Text className={styles.metaValue}>{item.operator}</Text>
                      </View>
                    ) : null}
                  </View>

                  {item.status !== 'exception' ? (
                    <>
                      <View className={styles.progressBar}>
                        <View className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                      </View>
                      <View className={styles.progressText}>
                        <Text>处理进度 {progress.percent}%</Text>
                        <Text>{progress.completed}/{progress.total} 步骤</Text>
                      </View>
                    </>
                  ) : null}

                  <View className={styles.itemFooter}>
                    <Text className={styles.itemQuantity}>
                      <Text className={styles.itemQuantityNum}>{item.totalQuantity}</Text>
                      件器械
                    </Text>
                    <Text className={styles.itemTime}>{formatDate(item.createdAt, 'MM-DD HH:mm')}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BatchPage;
