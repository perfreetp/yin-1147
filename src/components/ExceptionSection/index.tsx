import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { ExceptionRecord } from '@/types';
import { formatDate, showToast } from '@/utils';

interface ExceptionSectionProps {
  sourceType: 'handover' | 'batch' | 'delivery';
  sourceId: string;
  sourceNo: string;
  onRegister: (reason: string, photos: string[]) => void;
}

const ExceptionSection: React.FC<ExceptionSectionProps> = ({
  sourceType,
  sourceId,
  sourceNo,
  onRegister
}) => {
  const exceptionList = useAppStore(state => state.exceptionList);
  const exceptions = exceptionList.filter(e => e.sourceId === sourceId);

  const handleRegister = () => {
    Taro.showActionSheet({
      itemList: ['器械损坏', '数量不符', '包装破损', '标签缺失', '其他问题'],
      success: (res) => {
        const reasons = ['器械损坏', '数量不符', '包装破损', '标签缺失', '其他问题'];
        const reason = reasons[res.tapIndex];
        Taro.showModal({
          title: '异常登记',
          editable: true,
          placeholderText: '补充说明（可选）',
          content: '',
          success: (modalRes) => {
            const fullReason = modalRes.content ? `${reason}：${modalRes.content}` : reason;
            onRegister(fullReason, ['📸']);
            showToast('异常已登记', 'success');
          }
        });
      }
    });
  };

  return (
    <View className={styles.exceptionSection}>
      {exceptions.length > 0 ? (
        <>
          <View className={styles.exceptionBadge}>
            <Text className={styles.exceptionBadgeIcon}>⚠️</Text>
            <Text className={styles.exceptionBadgeText}>异常记录（{exceptions.length}）</Text>
          </View>
          <View className={styles.exceptionList}>
            {exceptions.map((exc: ExceptionRecord) => (
              <View key={exc.id} className={styles.exceptionItem}>
                <Text className={styles.exceptionReason}>{exc.reason}</Text>
                <View className={styles.exceptionMeta}>
                  <Text>登记人：{exc.operator}</Text>
                  <Text>{formatDate(exc.createdAt, 'MM-DD HH:mm')}</Text>
                </View>
                {exc.photos.length > 0 ? (
                  <View className={styles.exceptionPhotos}>
                    {exc.photos.map((photo, idx) => (
                      <View key={idx} className={styles.exceptionPhoto}>
                        <Text>{photo}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </>
      ) : null}
      <View className={styles.exceptionBtn} onClick={handleRegister}>
        <Text className={styles.exceptionBtnText}>⚠️ 登记异常退回</Text>
      </View>
    </View>
  );
};

export default ExceptionSection;
