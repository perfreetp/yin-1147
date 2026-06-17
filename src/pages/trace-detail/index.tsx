import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import StepIndicator from '@/components/StepIndicator';
import InfoCard from '@/components/InfoCard';
import { useAppStore } from '@/store';
import type { TraceRecord } from '@/types';
import { formatDate, getDaysUntilExpire, showToast, copyToClipboard } from '@/utils';

const TraceDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const traceList = useAppStore(state => state.traceList);
  const usePackage = useAppStore(state => state.usePackage);

  const record = useMemo<TraceRecord | undefined>(() => {
    return traceList.find(t => t.id === id) || traceList[0];
  }, [traceList, id]);

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
    Taro.showModal({
      title: '患者使用回填',
      editable: true,
      placeholderText: '请输入患者姓名',
      content: '',
      success: (res) => {
        if (res.confirm && res.content) {
          const patientName = res.content;
          Taro.showModal({
            title: '填写使用医生',
            editable: true,
            placeholderText: '请输入医生姓名',
            content: '',
            success: (doctorRes) => {
              if (doctorRes.confirm) {
                const doctorName = doctorRes.content || '张医生';
                Taro.showModal({
                  title: '选择使用时间',
                  content: '是否使用当前时间？',
                  confirmText: '当前时间',
                  cancelText: '手动选择',
                  success: (timeRes) => {
                    if (timeRes.confirm) {
                      usePackage(record.id, patientName, doctorName, formatDate(new Date()));
                      showToast('使用记录已保存', 'success');
                    } else {
                      Taro.showModal({
                        title: '输入使用时间',
                        editable: true,
                        placeholderText: '格式：2026-06-18 10:30',
                        content: formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
                        success: (manualTimeRes) => {
                          if (manualTimeRes.confirm && manualTimeRes.content) {
                            usePackage(record.id, patientName, doctorName, manualTimeRes.content);
                            showToast('使用记录已保存', 'success');
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  };

  const handleExportTrace = () => {
    console.log('[TraceDetail] 导出追溯凭证:', record.packageNo);
    const content = `
无菌包追溯凭证
====================================
包裹编号：${record.packageNo}
包裹名称：${record.packageName}
所属诊所：${record.clinicName}
灭菌日期：${formatDate(record.sterilizeDate)}
有效期至：${formatDate(record.expireDate)}
当前状态：${record.status === 'valid' ? '有效期内' : record.status === 'used' ? '已使用' : '已过期'}
${record.status === 'used' ? `使用医生：${record.usedBy || '-'}
使用时间：${record.usedAt ? formatDate(record.usedAt) : '-'}
患者姓名：${record.patientName || '-'}` : ''}
====================================
追溯记录（共 ${record.traceChain.length} 条）：
${record.traceChain.map((step, idx) => `${idx + 1}. ${step.action} - ${step.operator} - ${formatDate(step.time)} - ${step.location}`).join('\n')}
====================================
此凭证由系统自动生成，具有可追溯性。
    `.trim();
    copyToClipboard(content);
    Taro.showModal({
      title: '凭证已生成',
      content: '追溯凭证已复制到剪贴板，可粘贴保存。',
      showCancel: false
    });
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
