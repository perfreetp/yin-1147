import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store';
import type { HandoverRecord } from '@/types';
import { formatDate, showToast } from '@/utils';

const CenterPage: React.FC = () => {
  const handoverList = useAppStore(state => state.handoverList);
  const receiveHandover = useAppStore(state => state.receiveHandover);

  const pendingList = useMemo(() => {
    return handoverList.filter(h => h.status === 'pending');
  }, [handoverList]);

  const receivedList = useMemo(() => {
    return handoverList.filter(h => h.status !== 'pending').slice(0, 4);
  }, [handoverList]);

  const stats = useMemo(() => {
    const todayStr = formatDate(new Date(), 'YYYY-MM-DD');
    const today = handoverList.filter(h => h.createdAt.startsWith(todayStr));
    return {
      today: today.length,
      pending: pendingList.length,
      received: today.filter(h => h.status !== 'pending').length
    };
  }, [handoverList, pendingList]);

  const handleScanReceive = () => {
    console.log('[Center] 扫码入库');
    Taro.navigateTo({ url: '/pages/scan-receive/index' });
  };

  const handleManualReceive = () => {
    console.log('[Center] 人工核对');
    showToast('人工核对功能');
  };

  const handleQuickReceive = (item: HandoverRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Center] 快速接收:', item.handoverNo);
    receiveHandover(item.id, '张师傅');
    showToast('已确认接收', 'success');
  };

  const handleItemClick = (item: HandoverRecord) => {
    console.log('[Center] 查看交接详情:', item.handoverNo);
    Taro.navigateTo({ url: `/pages/handover-detail/index?id=${item.id}` });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>中心接收</Text>
        <Text className={styles.headerSubtitle}>高效处理诊所送来的消毒器械</Text>
        <View className={styles.actionRow}>
          <View className={styles.actionCard} onClick={handleScanReceive}>
            <Text className={styles.actionIcon}>📷</Text>
            <Text className={styles.actionLabel}>扫码入库</Text>
          </View>
          <View className={styles.actionCard} onClick={handleManualReceive}>
            <Text className={styles.actionIcon}>📋</Text>
            <Text className={styles.actionLabel}>人工核对</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.today}</Text>
            <Text className={styles.statLabel}>今日交接</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待接收</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.received}</Text>
            <Text className={styles.statLabel}>已接收</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.sectionTitle}>
          待接收 ({pendingList.length})
        </View>
        <View className={styles.listContainer}>
          {pendingList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无待接收记录</Text>
            </View>
          ) : (
            pendingList.map(item => (
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
                <View className={styles.itemTags}>
                  {item.items.slice(0, 3).map(it => (
                    <View key={it.id} className={styles.itemTag}>
                      {it.name} ×{it.quantity}
                    </View>
                  ))}
                </View>
                <View className={styles.itemFooter}>
                  <Text className={styles.itemQuantity}>
                    <Text className={styles.itemQuantityNum}>{item.totalQuantity}</Text>
                    件器械
                  </Text>
                  <View
                    className={styles.receiveBtn}
                    onClick={(e) => handleQuickReceive(item, e as any)}
                  >
                    确认接收
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View className={styles.sectionTitle}>
          最近接收记录
          <Text className={styles.sectionExtra}>查看全部</Text>
        </View>
        <View className={styles.listContainer}>
          {receivedList.map(item => (
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
              <View className={styles.itemFooter}>
                <Text className={styles.itemQuantity}>
                  <Text className={styles.itemQuantityNum}>{item.totalQuantity}</Text>
                  件器械
                </Text>
                <Text className={styles.itemTime}>{formatDate(item.handoverTime || item.createdAt, 'MM-DD HH:mm')}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CenterPage;
