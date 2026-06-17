import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store';
import type { HandoverRecord } from '@/types';
import { formatDate, showToast, copyToClipboard } from '@/utils';

const ScanReceivePage: React.FC = () => {
  const handoverList = useAppStore(state => state.handoverList);
  const receiveHandover = useAppStore(state => state.receiveHandover);
  const [scanned, setScanned] = useState(false);
  const [record, setRecord] = useState<HandoverRecord | null>(null);
  const [scannedIds, setScannedIds] = useState<string[]>([]);

  const pendingList = useMemo(() => {
    return handoverList.filter(h => h.status === 'pending' && !scannedIds.includes(h.id));
  }, [handoverList, scannedIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pendingList.length > 0) {
        setRecord(pendingList[0]);
        setScanned(true);
      } else {
        const allPending = handoverList.filter(h => h.status === 'pending');
        if (allPending.length > 0) {
          setRecord(allPending[0]);
          setScanned(true);
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [pendingList, handoverList]);

  const handleScanAgain = () => {
    setScanned(false);
    setRecord(null);
    showToast('请将二维码对准扫描框', 'loading');
    setTimeout(() => {
      const remaining = pendingList.filter(r => r.id !== record?.id);
      const target = remaining.length > 0 ? remaining[0] : handoverList.find(h => h.status === 'pending');
      if (target) {
        setRecord(target);
        setScanned(true);
      }
    }, 1500);
  };

  const handleManualInput = () => {
    showToast('手动输入交接单号');
  };

  const handleCopyNo = () => {
    if (record) {
      copyToClipboard(record.handoverNo);
    }
  };

  const handleConfirmReceive = () => {
    if (!record) return;
    console.log('[ScanReceive] 确认接收:', record.handoverNo);
    receiveHandover(record.id, '张师傅');
    setScannedIds([...scannedIds, record.id]);
    showToast('入库成功', 'success');
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleException = () => {
    if (!record) return;
    console.log('[ScanReceive] 异常上报:', record.handoverNo);
    showToast('异常已上报');
  };

  return (
    <View className={styles.container}>
      <View className={styles.scanSection}>
        <View className={styles.scanHeader}>
          <Text className={styles.scanTitle}>扫码入库</Text>
          <Text className={styles.scanSubtitle}>扫描交接单二维码快速接收</Text>
        </View>

        <View className={styles.scanArea}>
          <View className={styles.scanFrame}>
            <View className={`${styles.scanCorner} ${styles.tl}`} />
            <View className={`${styles.scanCorner} ${styles.tr}`} />
            <View className={`${styles.scanCorner} ${styles.bl}`} />
            <View className={`${styles.scanCorner} ${styles.br}`} />
          </View>
          <View className={styles.scanLine} />
          <Text className={styles.scanIcon}>📷</Text>
        </View>

        <Text className={styles.scanTips}>将交接单二维码放入框内自动识别</Text>

        <View className={styles.manualInput}>
          <Text>扫描识别困难？</Text>
          <Text className={styles.manualInputBtn} onClick={handleManualInput}>
            手动输入单号
          </Text>
        </View>
      </View>

      <View className={styles.resultSection}>
        {!scanned || !record ? (
          <View className={styles.resultCard}>
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyText}>正在扫描中...</Text>
            </View>
          </View>
        ) : (
          <>
            <View className={styles.resultCard} onClick={handleCopyNo}>
              <View className={styles.resultHeader}>
                <Text className={styles.resultNo}>{record.handoverNo}</Text>
                <StatusBadge status={record.status} text={record.statusText} />
              </View>
              <Text className={styles.resultClinic}>{record.clinicName}</Text>
              <View className={styles.resultStats}>
                <View className={styles.resultStat}>
                  <Text className={styles.resultStatValue}>{record.items.length}</Text>
                  <Text className={styles.resultStatLabel}>器械种类</Text>
                </View>
                <View className={styles.resultStat}>
                  <Text className={styles.resultStatValue}>{record.totalQuantity}</Text>
                  <Text className={styles.resultStatLabel}>器械总数</Text>
                </View>
                <View className={styles.resultStat}>
                  <Text className={styles.resultStatValue}>{formatDate(record.createdAt, 'HH:mm')}</Text>
                  <Text className={styles.resultStatLabel}>交接时间</Text>
                </View>
              </View>
            </View>

            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📦</Text>
              器械清单
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

            {record.sealPhotos && record.sealPhotos.length > 0 && (
              <View className={styles.photoSection}>
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
              </View>
            )}

            {record.remark && (
              <>
                <Text className={styles.sectionTitle}>
                  <Text className={styles.sectionIcon}>📝</Text>
                  备注信息
                </Text>
                <View className={styles.resultCard}>
                  <Text style={{ color: '#6B7280', fontSize: '28rpx' }}>{record.remark}</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleScanAgain}>
          重新扫描
        </View>
        {scanned && record && (
          <>
            <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleException}>
              数量异常
            </View>
            <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirmReceive}>
              确认接收
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default ScanReceivePage;
