import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import InfoCard from '@/components/InfoCard';
import StepIndicator from '@/components/StepIndicator';
import ExceptionSection from '@/components/ExceptionSection';
import { useAppStore } from '@/store';
import type { DeliveryRecord } from '@/types';
import { formatDate, showToast, getDaysUntilExpire } from '@/utils;

const DeliveryDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const deliveryList = useAppStore(state => state.deliveryList);
  const receiveDelivery = useAppStore(state => state.receiveDelivery);
  const markDeliveryDelivered = useAppStore(state => state.markDeliveryDelivered);
  const saveRecheck = useAppStore(state => state.saveRecheck);
  const getRecheckByDelivery = useAppStore(state => state.getRecheckByDelivery);
  const markDeliveryException = useAppStore(state => state.markDeliveryException);

  const record = useMemo<DeliveryRecord | undefined>(() => {
    return deliveryList.find(d => d.id === id) || deliveryList[0];
  }, [deliveryList, id]);

  const existingRecheck = useMemo(() => {
    if (!record) return undefined;
    return getRecheckByDelivery(record.id);
  }, [record, getRecheckByDelivery]);

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
    if (existingRecheck) {
      const diffText = existingRecheck.difference === 0
        ? '数量一致'
        : existingRecheck.difference > 0
          ? `多出 ${existingRecheck.difference} 件`
          : `缺少 ${Math.abs(existingRecheck.difference)} 件`;
      Taro.showModal({
        title: '已有复点记录',
        content: `复点数量：${existingRecheck.checkedQuantity} 件\n应收数量：${existingRecheck.expectedQuantity} 件\n${diffText}\n复点人：${existingRecheck.operator}\n复点时间：${formatDate(existingRecheck.createdAt)}${existingRecheck.remark ? `\n备注：${existingRecheck.remark}` : ''}`,
        confirmText: '重新复点',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            doRecheck();
          }
        }
      });
    } else {
      doRecheck();
    }
  };

  const doRecheck = () => {
    Taro.showModal({
      title: '收货复点',
      editable: true,
      placeholderText: '请输入复点数量',
      content: String(record.totalQuantity),
      success: (res) => {
        if (res.confirm && res.content) {
          const checkedQty = parseInt(res.content, 10) || record.totalQuantity;
          const diff = checkedQty - record.totalQuantity;
          const diffText = diff === 0 ? '数量一致' : diff > 0 ? `数量多出 ${diff} 件` : `数量缺少 ${Math.abs(diff)} 件`;
          Taro.showModal({
            title: '确认复点结果',
            content: `复点数量：${checkedQty} 件\n${diffText}`,
            confirmText: '确认保存',
            success: (modalRes) => {
              if (modalRes.confirm) {
                saveRecheck(record.id, checkedQty, record.receiverName || '王护士', diffText);
                showToast('复点记录已保存', 'success');
              }
            }
          });
        }
      }
    });
  };

  const handleSign = () => {
    console.log('[DeliveryDetail] 确认签收');
    Taro.showModal({
      title: '确认签收',
      editable: true,
      placeholderText: '请输入签收人姓名',
      content: '王护士',
      success: (res) => {
        if (res.confirm) {
          const receiver = res.content || '王护士';
          receiveDelivery(record.id, receiver, record.totalQuantity);
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

      {existingRecheck ? (
        <>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🔍</Text>
            复点记录
          </Text>
          <InfoCard
            title=""
            items={[
              { label: '复点数量', value: `${existingRecheck.checkedQuantity} 件` },
              { label: '应收数量', value: `${existingRecheck.expectedQuantity} 件` },
              { label: '差异', value: existingRecheck.difference === 0 ? '一致' : existingRecheck.difference > 0 ? `多${existingRecheck.difference}件` : `少${Math.abs(existingRecheck.difference)}件` },
              { label: '复点人', value: existingRecheck.operator },
              { label: '复点时间', value: formatDate(existingRecheck.createdAt) },
              ...(existingRecheck.remark ? [{ label: '备注', value: existingRecheck.remark }] : [])
            ]}
          />
        </>
      ) : null}

      <InfoCard
        title="配送信息"
        items={[
          { label: '配送单号', value: record.deliveryNo },
          { label: '诊所', value: record.clinicName },
          ...(record.shippedAt ? [{ label: '发车时间', value: formatDate(record.shippedAt) }] : []),
          ...(record.deliveredAt ? [{ label: '送达时间', value: formatDate(record.deliveredAt) }] : []),
          ...(record.receivedAt ? [{ label: '签收时间', value: formatDate(record.receivedAt) }] : []),
          ...(record.receiverName ? [{ label: '签收人', value: record.receiverName }] : []),
          ...(record.checkedQuantity ? [{ label: '复点数量', value: `${record.checkedQuantity} 件` }] : [])
        ]}
      />

      <ExceptionSection
        sourceType="delivery"
        sourceId={record.id}
        sourceNo={record.deliveryNo}
        onRegister={(reason, photos) => markDeliveryException(record.id, reason, photos)}
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
