import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import StepIndicator from '@/components/StepIndicator';
import InfoCard from '@/components/InfoCard';
import { useAppStore } from '@/store';
import type { BatchRecord } from '@/types';
import { formatDate, showToast } from '@/utils';

const BatchDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const batchList = useAppStore(state => state.batchList);
  const updateBatchStep = useAppStore(state => state.updateBatchStep);
  const splitBatch = useAppStore(state => state.splitBatch);
  const mergeBatches = useAppStore(state => state.mergeBatches);

  const record = useMemo<BatchRecord | undefined>(() => {
    return batchList.find(b => b.id === id) || batchList[0];
  }, [batchList, id]);

  if (!record) {
    return (
      <View className={styles.container}>
        <Text>未找到记录</Text>
      </View>
    );
  }

  const currentStepIndex = useMemo(() => {
    return record.steps.findIndex(s => s.status === 'processing');
  }, [record]);

  const nextStep = useMemo(() => {
    if (currentStepIndex >= 0) {
      return record.steps[currentStepIndex];
    }
    const firstPending = record.steps.find(s => s.status === 'pending');
    return firstPending || null;
  }, [record, currentStepIndex]);

  const handleMerge = () => {
    console.log('[BatchDetail] 合包操作');
    const availableBatches = batchList.filter(
      b => b.id !== record.id && b.status !== 'completed' && b.status !== 'exception'
    );
    if (availableBatches.length === 0) {
      showToast('暂无其他批次可合并');
      return;
    }
    Taro.showActionSheet({
      itemList: availableBatches.map(b => `${b.batchNo} (${b.totalQuantity}件)`),
      success: (res) => {
        const targetBatch = availableBatches[res.tapIndex];
        Taro.showModal({
          title: '确认合包',
          content: `确定将 ${record.batchNo} 与 ${targetBatch.batchNo} 合并为一个批次？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              mergeBatches([record.id, targetBatch.id], '张师傅');
              showToast('合包成功', 'success');
            }
          }
        });
      }
    });
  };

  const handleSplit = () => {
    console.log('[BatchDetail] 拆分操作');
    Taro.showActionSheet({
      itemList: ['拆分为 2 个批次', '拆分为 3 个批次', '拆分为 4 个批次'],
      success: (res) => {
        const splitCount = res.tapIndex + 2;
        Taro.showModal({
          title: '确认拆分',
          content: `确定将 ${record.batchNo} 拆分为 ${splitCount} 个批次？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              splitBatch(record.id, splitCount, '张师傅');
              showToast('拆分成功', 'success');
            }
          }
        });
      }
    });
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
    if (!nextStep) {
      showToast('所有步骤已完成');
      return;
    }
    const stepToUpdate = currentStepIndex >= 0 ? nextStep : record.steps[0];
    if (stepToUpdate) {
      updateBatchStep(record.id, stepToUpdate.id, '张师傅');
      showToast(`已完成：${stepToUpdate.name}`, 'success');
    }
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
