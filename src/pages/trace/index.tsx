import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockTraceList, mockReconciliationList } from '@/data/trace';
import type { TraceRecord, ReconciliationRecord } from '@/types';
import { formatDate, getDaysUntilExpire, showToast } from '@/utils';

const TracePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'reconciliation'>('packages');

  const packageList = useMemo(() => mockTraceList, []);
  const reconciliationList = useMemo(() => mockReconciliationList, []);

  const handleScanTrace = () => {
    console.log('[Trace] 扫码追溯');
    showToast('扫码追溯功能');
  };

  const handlePatientUse = () => {
    console.log('[Trace] 患者使用回填');
    showToast('患者使用回填功能');
  };

  const handlePackageClick = (item: TraceRecord) => {
    console.log('[Trace] 查看追溯详情:', item.packageNo);
    Taro.navigateTo({
      url: `/pages/trace-detail/index?id=${item.id}`
    });
  };

  const handleExport = (item: ReconciliationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Trace] 导出对账凭证:', item.month);
    showToast('凭证导出中...', 'loading');
    setTimeout(() => showToast('导出成功', 'success'), 1500);
  };

  const renderExpireInfo = (item: TraceRecord) => {
    if (item.status === 'used') {
      return (
        <View className={styles.metaRow}>
          <Text className={styles.metaLabel}>使用人：</Text>
          <Text className={styles.metaValue}>{item.usedBy}</Text>
          <Text className={styles.metaLabel}>使用时间：</Text>
          <Text className={styles.metaValue}>{item.usedAt ? formatDate(item.usedAt, 'MM-DD HH:mm') : '-'}</Text>
        </View>
      );
    }
    const daysLeft = getDaysUntilExpire(item.expireDate);
    let expireClass = styles.metaValue;
    let expireText = `${daysLeft}天后过期`;
    if (daysLeft <= 0) {
      expireClass = classnames(styles.metaValue, styles.expireWarning);
      expireText = '已过期';
    } else if (daysLeft <= 7) {
      expireClass = classnames(styles.metaValue, styles.expireSoon);
      expireText = `${daysLeft}天后过期`;
    }
    return (
      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>灭菌日期：</Text>
        <Text className={styles.metaValue}>{formatDate(item.sterilizeDate, 'YYYY-MM-DD')}</Text>
        <Text className={styles.metaLabel}>有效期至：</Text>
        <Text className={expireClass}>{expireText}</Text>
      </View>
    );
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>追溯凭证</Text>
        <Text className={styles.headerSubtitle}>无菌包全流程追溯与对账</Text>
        <View className={styles.quickActions}>
          <View className={styles.actionCard} onClick={handleScanTrace}>
            <Text className={styles.actionIcon}>🔍</Text>
            <Text className={styles.actionLabel}>扫码追溯</Text>
          </View>
          <View className={styles.actionCard} onClick={handlePatientUse}>
            <Text className={styles.actionIcon}>✅</Text>
            <Text className={styles.actionLabel}>使用回填</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, activeTab === 'packages' && styles.active)}
            onClick={() => setActiveTab('packages')}
          >
            无菌包管理
          </View>
          <View
            className={classnames(styles.tab, activeTab === 'reconciliation' && styles.active)}
            onClick={() => setActiveTab('reconciliation')}
          >
            对账凭证
          </View>
        </View>

        {activeTab === 'packages' ? (
          <>
            <View className={styles.searchBar}>
              <Text className={styles.searchIcon}>🔍</Text>
              <Text className={styles.searchPlaceholder}>搜索包裹编号/名称</Text>
            </View>

            <View className={styles.listContainer}>
              {packageList.length === 0 ? (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyText}>暂无无菌包记录</Text>
                </View>
              ) : (
                packageList.map(item => (
                  <View
                    key={item.id}
                    className={styles.listItem}
                    onClick={() => handlePackageClick(item)}
                  >
                    <View className={styles.itemHeader}>
                      <Text className={styles.packageNo}>{item.packageNo}</Text>
                      <StatusBadge status={item.status} text={
                        item.status === 'valid' ? '有效期内' :
                        item.status === 'used' ? '已使用' : '已过期'
                      } />
                    </View>

                    <View className={styles.itemBody}>
                      <View className={styles.itemInfo}>
                        <Text className={styles.packageName}>{item.packageName}</Text>
                        <Text className={styles.clinicName}>{item.clinicName}</Text>
                        {renderExpireInfo(item)}
                        {item.patientName ? (
                          <View className={styles.patientInfo}>
                            <Text className={styles.patientLabel}>患者：</Text>
                            <Text className={styles.patientDetail}>{item.patientName}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View className={styles.itemFooter}>
                      <Text className={styles.noInfo}>
                        {item.traceChain.length > 0 ? `${item.traceChain.length} 条追溯记录` : '暂无追溯记录'}
                      </Text>
                      <View className={styles.traceBtn}>查看追溯链</View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View className={styles.reconciliationSection}>
            <View className={styles.sectionTitle}>
              月度对账
              <Text className={styles.sectionExtra}>查看全部</Text>
            </View>
            {reconciliationList.map(item => (
              <View key={item.id} className={styles.reconciliationItem}>
                <View className={styles.reconHeader}>
                  <Text className={styles.reconMonth}>{item.month} 月账单</Text>
                  <StatusBadge status={item.status} text={
                    item.status === 'pending' ? '待确认' :
                    item.status === 'confirmed' ? '已确认' : '已付款'
                  } />
                </View>
                <Text className={styles.reconClinic}>{item.clinicName}</Text>
                <View className={styles.reconStats}>
                  <View className={styles.reconStat}>
                    <Text className={styles.reconStatValue}>{item.totalHandovers}</Text>
                    <Text className={styles.reconStatLabel}>交接次数</Text>
                  </View>
                  <View className={styles.reconStat}>
                    <Text className={styles.reconStatValue}>{item.totalPackages}</Text>
                    <Text className={styles.reconStatLabel}>包裹数量</Text>
                  </View>
                  <View className={styles.reconStat}>
                    <Text className={styles.reconAmount}>¥{item.totalAmount}</Text>
                    <Text className={styles.reconStatLabel}>结算金额</Text>
                  </View>
                </View>
                <View className={styles.reconFooter}>
                  <Text className={styles.noInfo}>生成于 {formatDate(item.createdAt, 'YYYY-MM-DD')}</Text>
                  <View
                    className={styles.exportBtn}
                    onClick={(e) => handleExport(item, e as any)}
                  >
                    导出凭证
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TracePage;
