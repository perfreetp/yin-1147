import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import StepIndicator from '@/components/StepIndicator';
import InfoCard from '@/components/InfoCard';
import { mockTraceList } from '@/data/trace';
import type { TraceRecord } from '@/types';
import { formatDate, getDaysUntilExpire, showToast, copyToClipboard } from '@/utils';

const TraceDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const record = useMemo<TraceRecord | undefined>(() => {
    return mockTraceList.find(t => t.id === id) || mockTraceList[0];
  }, [id]);

  if (!record) {
    return (
      <View className={styles.container}>
        <Text>未找到记录</Text>
      </View>
    );
  }

  const daysLeft = getDaysUntilExpire(record.expireDate);
  const isExpired = daysLeft <= 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  const expireStatusText = record.status === 'used' ? '已使用' : isExpired ? '已过期' : `${daysLeft}天后过期`;
  const expireDisplayClass = classnames(styles.validValue, {
    [styles.validValueWarning]: isExpiringSoon && record.status === 'valid',
    [styles.validValueError]: isExpired
  });

  const handleCopyPackageNo = () => {
    copyToClipboard(record.packageNo);
  };

  const handleViewHandover = () => {
    console.log('[TraceDetail] 查看交接单:', record.handoverNo);
    Taro.navigateTo({ url: `/pages/handover-detail/index?id=1` });
  };

  const handleViewBatch = () => {
    console.log('[TraceDetail] 查看批次:', record.batchNo);
    Taro.navigateTo({ url: `/pages/batch-detail/index?id=b1` });
  };

  const handleViewDelivery = () => {
    console.log('[TraceDetail] 查看配送:', record.deliveryNo);
    Taro.navigateTo({ url: `/pages/delivery-detail/index?id=d1` });
  };

  const handlePatientUse = () => {
    console.log('[TraceDetail] 患者使用回填:', record.packageNo);
    showToast('患者使用回填功能');
  };

  const handleExportTrace = () => {
    console.log('[TraceDetail] 导出追溯凭证:', record.packageNo);
    showToast('凭证导出中...', 'loading');
    setTimeout(() => showToast('导出成功', 'success'), 1500);
  };

  const getStatusBadge = () => {
    if (record.status === 'used') {
      return <StatusBadge status="completed" text="已使用" />;
    }
    if (record.status === 'expired') {
      return <StatusBadge status="exception" text="已过期" />;
    }
    if (isExpiringSoon) {
      return <StatusBadge status="processing" text={`${daysLeft}天后过期`} />;
    }
    return <StatusBadge status="received" text="有效期内" />;
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard} onClick={handleCopyPackageNo}>
        <View className={styles.headerRow}>
          <Text className={styles.packageNo}>{record.packageNo}</Text>
          {getStatusBadge()}
        </View>
        <Text className={styles.packageName}>{record.packageName}</Text>
        <Text className={styles.clinicName}>{record.clinicName}</Text>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.statusCard}>
          <View className={styles.statusRow}>
            <Text className={styles.statusLabel}>有效期状态</Text>
            <Text style={{ fontSize: '28rpx', fontWeight: '500', color: isExpired ? '#FF5630' : isExpiringSoon ? '#FFAB00' : '#36B37E' }}>
              {expireStatusText}
            </Text>
          </View>
          <View className={styles.validInfo}>
            <View className={styles.validItem}>
              <Text className={styles.validValue}>{formatDate(record.sterilizeDate, 'YYYY-MM-DD')}</Text>
              <Text className={styles.validLabel}>灭菌日期</Text>
            </View>
            <View className={styles.validItem}>
              <Text className={expireDisplayClass}>{formatDate(record.expireDate, 'YYYY-MM-DD')}</Text>
              <Text className={styles.validLabel}>有效期至</Text>
            </View>
          </View>
        </View>

        {record.status === 'used' && (
          <View className={styles.patientCard}>
            <View className={styles.patientHeader}>
              <Text className={styles.patientTitle}>患者使用信息</Text>
              <Text className={styles.patientTag}>已使用</Text>
            </View>
            <View className={styles.patientInfo}>
              <View className={styles.patientRow}>
                <Text className={styles.patientLabel}>患者姓名</Text>
                <Text className={styles.patientValue}>{record.patientName || '-'}</Text>
              </View>
              <View className={styles.patientRow}>
                <Text className={styles.patientLabel}>使用医生</Text>
                <Text className={styles.patientValue}>{record.usedBy || '-'}</Text>
              </View>
              <View className={styles.patientRow}>
                <Text className={styles.patientLabel}>使用时间</Text>
                <Text className={styles.patientValue}>{record.usedAt ? formatDate(record.usedAt, 'YYYY-MM-DD HH:mm') : '-'}</Text>
              </View>
            </View>
          </View>
        )}

        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          关联单据
        </Text>
        <InfoCard
          title=""
          items={[
            { label: '交接单号', value: record.handoverNo, onClick: handleViewHandover },
            { label: '批次号', value: record.batchNo, onClick: handleViewBatch },
            { label: '配送单号', value: record.deliveryNo, onClick: handleViewDelivery }
          ]}
          showDivider={true}
        />

        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔗</Text>
          追溯链
        </Text>
        <View className={styles.timelineCard}>
          {record.traceChain.length > 0 ? (
            <StepIndicator steps={record.traceChain} />
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无追溯记录</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleExportTrace}>
          导出凭证
        </View>
        {record.status === 'valid' && (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePatientUse}>
            患者使用回填
          </View>
        )}
        {record.status !== 'valid' && (
          <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => showToast('已查看追溯详情')}>
            查看完毕
          </View>
        )}
      </View>
    </View>
  );
};

export default TraceDetailPage;
