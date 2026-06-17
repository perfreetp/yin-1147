import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import StepIndicator from '@/components/StepIndicator';
import InfoCard from '@/components/InfoCard';
import { mockBatchList } from '@/data/batch';
import type { BatchRecord } from '@/types';
import { formatDate, showToast } from '@/utils';

const BatchDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const record = useMemo<BatchRecord | undefined>(() => {
    return mockBatchList.find(b => b.id === id) || mockBatchList[0];
  }, [id]);

  if (!record) {
    return (
      <View className={styles.container}>
        <Text>未找到记录</Text>
      </View>
    );
  }

  const handleMerge = () => {
    console.log('[BatchDetail] 合包操作');
    showToast('合包功能');
  };

  const handleSplit = () => {
    console.log('[BatchDetail] 拆分操作');
    showToast('拆分功能');
  };

  const handleException = () => {
    console.log('[BatchDetail] 异常退回');
    Taro.showModal({
      title: '异常退回',
      content: '确认将此批次退回诊所？',
      success: (res) => {
        if (res.confirm) {
          showToast('已提交退回申请', 'success');
        }
      }
    });
  };

  const handleUpdateStep = () => {
    console.log('[BatchDetail] 更新处理进度');
    showToast('更新处理进度');
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <Text className={styles.batchNo}>{record.batchNo}</Text>
          <StatusBadge status={record.status} text={record.statusText} />
        </View>
        <View className={styles.headerInfo}>
          <Text>来源：{record.sourceHandoverIds.length} 个交接单</Text>
          {record.operator ? <Text>操作：{record.operator}</Text> : null}
        </View>
      </View>

      {record.mergedFrom && record.mergedFrom.length > 0 ? (
        <View className={styles.mergeInfo}>
          <Text className={styles.mergeIcon}>🔀</Text>
          <Text className={styles.mergeText}>
            由 {record.mergedFrom.join('、')} 合包而成
          </Text>
        </View>
      ) : null}

      {record.splitTo && record.splitTo.length > 0 ? (
        <View className={styles.mergeInfo}>
          <Text className={styles.mergeIcon}>✂️</Text>
          <Text className={styles.mergeText}>
            已拆分为 {record.splitTo.join('、')}
          </Text>
        </View>
      ) : null}

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📋</Text>
        处理进度
      </Text>
      <View className={styles.stepsCard}>
        <StepIndicator steps={record.steps} />
      </View>

      {record.status === 'exception' && record.exceptionRemark ? (
        <>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚠️</Text>
            异常信息
          </Text>
          <View className={styles.infoCard}>
            <View className={styles.exceptionBox}>
              <Text className={styles.exceptionIcon}>!</Text>
              <Text className={styles.exceptionText}>{record.exceptionRemark}</Text>
            </View>
          </View>
        </>
      ) : null}

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📦</Text>
        器械清单（共 {record.totalQuantity} 件）
      </Text>
      <View className={styles.infoCard}>
        <View className={styles.itemList}>
          {record.items.map(item => (
            <View key={item.id} className={styles.itemRow}>
              <View className={styles.itemInfo}>
                <Text className={styles.itemName}>{item.name}</Text>
                <Text className={styles.itemCategory}>{item.category}</Text>
              </View>
              <Text className={styles.itemQuantity}>×{item.quantity}</Text>
            </View>
          ))}
        </View>
      </View>

      <InfoCard
        title="批次信息"
        items={[
          { label: '创建时间', value: formatDate(record.createdAt) },
          { label: '来源交接单', value: record.sourceHandoverIds.join(', ') },
          ...(record.completedAt ? [{ label: '完成时间', value: formatDate(record.completedAt) }] : []),
          ...(record.operator ? [{ label: '负责人', value: record.operator }] : [])
        ]}
      />

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSplit}>
          拆分包
        </View>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleMerge}>
          合并包
        </View>
        {record.status === 'exception' ? (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleUpdateStep}>
            重新处理
          </View>
        ) : record.status === 'completed' ? (
          <View className={`${styles.btn} ${styles.btnDanger}`} onClick={handleException}>
            异常退回
          </View>
        ) : (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleUpdateStep}>
            更新进度
          </View>
        )}
      </View>
    </View>
  );
};

export default BatchDetailPage;
