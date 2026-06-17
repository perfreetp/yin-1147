import React, { useMemo } from 'react';
import { View, Text, Image, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import InfoCard from '@/components/InfoCard';
import StepIndicator from '@/components/StepIndicator';
import { mockHandoverList } from '@/data/handover';
import type { HandoverRecord } from '@/types';
import { formatDate, showToast, copyToClipboard } from '@/utils';

const HandoverDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const record = useMemo<HandoverRecord | undefined>(() => {
    return mockHandoverList.find(h => h.id === id) || mockHandoverList[0];
  }, [id]);

  if (!record) {
    return (
      <View className={styles.container}>
        <Text>未找到记录</Text>
      </View>
    );
  }

  const timelineSteps = useMemo(() => {
    const steps: Array<{ id: string; action: string; operator: string; time: string; location: string }> = [];
    steps.push({
      id: '1',
      action: '诊所封箱交接',
      operator: '护士',
      time: record.createdAt,
      location: record.clinicName
    });
    if (record.handoverTime) {
      steps.push({
        id: '2',
        action: '中心接收',
        operator: record.receiverName || '工作人员',
        time: record.handoverTime,
        location: '消毒供应中心'
      });
    }
    if (record.status === 'processing' || record.status === 'completed') {
      steps.push({
        id: '3',
        action: '消毒处理中',
        operator: '消毒员',
        time: record.handoverTime || record.createdAt,
        location: '消毒供应中心'
      });
    }
    if (record.status === 'completed') {
      steps.push({
        id: '4',
        action: '配送完成',
        operator: '配送员',
        time: record.createdAt,
        location: record.clinicName
      });
    }
    if (record.status === 'exception') {
      steps.push({
        id: '5',
        action: '异常退回',
        operator: '工作人员',
        time: record.createdAt,
        location: '消毒供应中心'
      });
    }
    return steps;
  }, [record]);

  const handleCopyNo = () => {
    copyToClipboard(record.handoverNo);
  };

  const handleContact = () => {
    console.log('[HandoverDetail] 联系诊所');
    showToast('联系诊所');
  };

  const handleViewBatch = () => {
    console.log('[HandoverDetail] 查看关联批次');
    Taro.navigateTo({ url: '/pages/batch-detail/index?id=b1' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard} onClick={handleCopyNo}>
        <View className={styles.headerRow}>
          <Text className={styles.handoverNo}>{record.handoverNo}</Text>
          <StatusBadge status={record.status} text={record.statusText} />
        </View>
        <Text className={styles.clinicName}>{record.clinicName}</Text>
        <Text className={styles.createdAt}>创建时间：{formatDate(record.createdAt)}</Text>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📦</Text>
        器械清单（共 {record.totalQuantity} 件）
      </Text>
      <View className={styles.itemList}>
        {record.items.map(item => (
          <View key={item.id} className={styles.itemRow}>
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.name}</Text>
              <Text className={styles.itemCategory}>{item.category}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text className={styles.itemQuantity}>×{item.quantity}</Text>
              {item.remark ? <Text className={styles.itemRemark}>{item.remark}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {record.sealPhotos && record.sealPhotos.length > 0 ? (
        <>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📷</Text>
            封箱照片
          </Text>
          <View className={styles.photoGrid}>
            {record.sealPhotos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image className={styles.photoImage} src={photo} mode="aspectFill" />
              </View>
            ))}
          </View>
        </>
      ) : null}

      {record.remark ? (
        <InfoCard
          title="备注信息"
          items={[{ label: '备注', value: record.remark }]}
          showDivider={false}
        />
      ) : null}

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📋</Text>
        流转记录
      </Text>
      <View className={styles.timelineCard}>
        <StepIndicator steps={timelineSteps} />
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleContact}>
          联系诊所
        </View>
        {record.status !== 'pending' ? (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleViewBatch}>
            查看批次
          </View>
        ) : (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => showToast('已提醒中心接收', 'success')}>
            催办接收
          </View>
        )}
      </View>
    </View>
  );
};

export default HandoverDetailPage;
