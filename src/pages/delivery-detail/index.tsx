import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import InfoCard from '@/components/InfoCard';
import StepIndicator from '@/components/StepIndicator';
import { mockDeliveryList } from '@/data/delivery';
import type { DeliveryRecord } from '@/types';
import { formatDate, showToast, getDaysUntilExpire } from '@/utils';

const DeliveryDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const record = useMemo<DeliveryRecord | undefined>(() => {
    return mockDeliveryList.find(d => d.id === id) || mockDeliveryList[0];
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
      action: '出库配送',
      operator: record.driverName,
      time: record.createdAt,
      location: '消毒供应中心'
    });
    if (record.shippedAt) {
      steps.push({
        id: '2',
        action: '开始配送',
        operator: record.driverName,
        time: record.shippedAt,
        location: '运输途中'
      });
    }
    if (record.deliveredAt) {
      steps.push({
        id: '3',
        action: '已送达诊所',
        operator: record.driverName,
        time: record.deliveredAt,
        location: record.clinicName
      });
    }
    if (record.receivedAt) {
      steps.push({
        id: '4',
        action: '诊所签收',
        operator: record.receiverName || '工作人员',
        time: record.receivedAt,
        location: record.clinicName
      });
    }
    return steps;
  }, [record]);

  const handleCallDriver = () => {
    console.log('[DeliveryDetail] 拨打司机电话:', record.driverPhone);
    Taro.makePhoneCall({ phoneNumber: record.driverPhone.replace(/\*/g, '0') }).catch(err => {
      console.error('[DeliveryDetail] 拨打电话失败:', err);
      showToast('拨打电话失败');
    });
  };

  const handleRecheck = () => {
    console.log('[DeliveryDetail] 收货复点');
    showToast('进入复点流程');
  };

  const handleSign = () => {
    console.log('[DeliveryDetail] 确认签收');
    Taro.showModal({
      title: '确认签收',
      content: '请确认包裹数量无误后签收',
      success: (res) => {
        if (res.confirm) {
          showToast('签收成功', 'success');
        }
      }
    });
  };

  const getExpireText = (expireDate: string) => {
    const days = getDaysUntilExpire(expireDate);
    if (days <= 0) return '已过期';
    if (days <= 7) return `${days}天后过期`;
    return `有效期至 ${expireDate}`;
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <Text className={styles.deliveryNo}>{record.deliveryNo}</Text>
          <StatusBadge status={record.status} text={record.statusText} />
        </View>
        <View className={styles.clinicRow}>
          <Text className={styles.locationIcon}>📍</Text>
          {record.clinicName}
        </View>
        <Text className={styles.timeRow}>创建时间：{formatDate(record.createdAt)}</Text>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>🚚</Text>
        配送司机
      </Text>
      <View className={styles.driverCard}>
        <View className={styles.driverAvatar}>
          {record.driverName.charAt(0)}
        </View>
        <View className={styles.driverInfo}>
          <Text className={styles.driverName}>{record.driverName}</Text>
          <Text className={styles.driverPhone}>{record.driverPhone}</Text>
        </View>
        <View className={styles.callBtn} onClick={handleCallDriver}>
          📞
        </View>
      </View>

      {record.routeInfo ? (
        <>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🗺️</Text>
            配送状态
          </Text>
          <View className={styles.routeCard}>
            <View className={styles.routeBox}>
              <Text className={styles.routeIcon}>🚚</Text>
              <Text className={styles.routeText}>{record.routeInfo}</Text>
            </View>
          </View>
        </>
      ) : null}

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📦</Text>
        配送包裹（共 {record.totalQuantity} 件）
      </Text>
      <View className={styles.packageCard}>
        {record.items.map(item => (
          <View key={item.id} className={styles.packageItem}>
            <View className={styles.packageInfo}>
              <Text className={styles.packageName}>{item.packageName}</Text>
              <Text className={styles.packageBatch}>批次：{item.batchNo}</Text>
              <Text className={styles.expireDate}>{getExpireText(item.expireDate)}</Text>
            </View>
            <View className={styles.packageRight}>
              <Text className={styles.packageQuantity}>×{item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.sectionIcon}>📋</Text>
        配送轨迹
      </Text>
      <View className={styles.timelineCard}>
        <StepIndicator steps={timelineSteps} />
      </View>

      <InfoCard
        title="配送信息"
        items={[
          { label: '配送单号', value: record.deliveryNo },
          { label: '诊所', value: record.clinicName },
          ...(record.shippedAt ? [{ label: '发车时间', value: formatDate(record.shippedAt) }] : []),
          ...(record.deliveredAt ? [{ label: '送达时间', value: formatDate(record.deliveredAt) }] : []),
          ...(record.receivedAt ? [{ label: '签收时间', value: formatDate(record.receivedAt) }] : []),
          ...(record.receiverName ? [{ label: '签收人', value: record.receiverName }] : [])
        ]}
      />

      <View className={styles.bottomBar}>
        {record.status === 'delivered' ? (
          <>
            <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleRecheck}>
              收货复点
            </View>
            <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSign}>
              确认签收
            </View>
          </>
        ) : record.status === 'received' ? (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleRecheck}>
            查看复点记录
          </View>
        ) : (
          <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCallDriver}>
            联系司机
          </View>
        )}
      </View>
    </View>
  );
};

export default DeliveryDetailPage;
