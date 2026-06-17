import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const DashboardPage: React.FC = () => {
  const getDashboardStats = useAppStore(state => state.getDashboardStats);

  const statsList = useMemo(() => getDashboardStats(), [getDashboardStats]);

  const totals = useMemo(() => {
    return statsList.reduce((acc, s) => ({
      pending: acc.pending + s.pending,
      processing: acc.processing + s.processing,
      pendingSign: acc.pendingSign + s.pendingSign,
      expiringSoon: acc.expiringSoon + s.expiringSoon,
      used: acc.used + s.used
    }), { pending: 0, processing: 0, pendingSign: 0, expiringSoon: 0, used: 0 });
  }, [statsList]);

  const handleStatClick = (clinicId: string, type: 'pending' | 'processing' | 'pendingSign' | 'expiringSoon' | 'used') => {
    Taro.setStorageSync('dashboard_filter', {
      clinicId,
      type
    });

    switch (type) {
      case 'pending':
        Taro.switchTab({ url: '/pages/handover/index' });
        break;
      case 'processing':
        Taro.switchTab({ url: '/pages/batch/index' });
        break;
      case 'pendingSign':
        Taro.switchTab({ url: '/pages/delivery/index' });
        break;
      case 'expiringSoon':
      case 'used':
        Taro.switchTab({ url: '/pages/trace/index' });
        break;
    }
  };

  const renderStatCell = (
    value: number,
    label: string,
    type: 'pending' | 'processing' | 'pendingSign' | 'expiringSoon' | 'used',
    clinicId: string,
    highlight = false
  ) => {
    const valueClass = {
      pending: styles.statValuePending,
      processing: styles.statValueProcessing,
      pendingSign: styles.statValueSign,
      expiringSoon: styles.statValueExpire,
      used: styles.statValueUsed
    }[type];

    return (
      <View
        className={`${styles.statCell} ${highlight && value > 0 ? styles.statCellHighlight : ''}`}
        onClick={() => handleStatClick(clinicId, type)}
      >
        <Text className={`${styles.statValue} ${valueClass}`}>{value}</Text>
        <Text className={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>流转看板</Text>
        <Text className={styles.headerSubtitle}>按诊所展示消毒供应全流程状态</Text>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.overviewCard}>
          <Text className={styles.overviewTitle}>
            全局概览
            <Text className={styles.overviewTotal}>{statsList.length} 家诊所</Text>
          </Text>
          <View className={styles.overviewStats}>
            <View className={styles.overviewStat}>
              <Text className={styles.overviewStatValue}>{totals.pending}</Text>
              <Text className={styles.overviewStatLabel}>待接收</Text>
            </View>
            <View className={styles.overviewStat}>
              <Text className={styles.overviewStatValue}>{totals.processing}</Text>
              <Text className={styles.overviewStatLabel}>处理中</Text>
            </View>
            <View className={styles.overviewStat}>
              <Text className={styles.overviewStatValue}>{totals.pendingSign}</Text>
              <Text className={styles.overviewStatLabel}>待签收</Text>
            </View>
            <View className={styles.overviewStat}>
              <Text className={styles.overviewStatValue}>{totals.expiringSoon}</Text>
              <Text className={styles.overviewStatLabel}>快过期</Text>
            </View>
          </View>
        </View>

        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotPending}`} />
            <Text>待接收</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotProcessing}`} />
            <Text>处理中</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotSign}`} />
            <Text>待签收</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotExpire}`} />
            <Text>快过期</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotUsed}`} />
            <Text>已使用</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>各诊所明细</Text>
        <ScrollView scrollY enhanced showScrollbar={false}>
          {statsList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无数据</Text>
            </View>
          ) : (
            statsList.map(stat => (
              <View key={stat.clinicId} className={styles.clinicCard}>
                <View className={styles.clinicHeader}>
                  <Text className={styles.clinicName}>
                    <Text className={styles.clinicIcon}>🏥</Text>
                    {stat.clinicName}
                  </Text>
                  <Text className={styles.clinicId}>{stat.clinicId}</Text>
                </View>
                <View className={styles.statsGrid}>
                  {renderStatCell(stat.pending, '待接收', 'pending', stat.clinicId)}
                  {renderStatCell(stat.processing, '处理中', 'processing', stat.clinicId)}
                  {renderStatCell(stat.pendingSign, '待签收', 'pendingSign', stat.clinicId)}
                  {renderStatCell(stat.expiringSoon, '快过期', 'expiringSoon', stat.clinicId, true)}
                  {renderStatCell(stat.used, '已使用', 'used', stat.clinicId)}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default DashboardPage;
