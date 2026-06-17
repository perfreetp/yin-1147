import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store';
import type { DeliveryRecord, DeliveryStatus } from '@/types';
import { formatDate, showToast } from '@/utils';

interface FilterTab {
  key: 'all' | DeliveryStatus;
  label: string;
}

const filterTabs: FilterTab[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待配送' },
  { key: 'shipping', label: '配送中' },
  { key: 'delivered', label: '待签收' },
  { key: 'received', label: '已签收' },
  { key: 'exception', label: '异常' }
];

const DeliveryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab['key']>('all');
  const deliveryList = useAppStore(state => state.deliveryList);
  const receiveDelivery = useAppStore(state => state.receiveDelivery);
  const saveRecheck = useAppStore(state => state.saveRecheck);
  const getRecheckByDelivery = useAppStore(state => state.getRecheckByDelivery);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return deliveryList;
    return deliveryList.filter(item => item.status === activeFilter);
  }, [deliveryList, activeFilter]);

  const stats = useMemo(() => {
    return {
      shipping: deliveryList.filter(d => d.status === 'shipping').length,
      pending: deliveryList.filter(d => d.status === 'pending').length,
      delivered: deliveryList.filter(d => d.status === 'delivered').length
    };
  }, [deliveryList]);

  const handleItemClick = (item: DeliveryRecord) => {
    console.log('[Delivery] 点击配送单:', item.deliveryNo);
    Taro.navigateTo({
      url: `/pages/delivery-detail/index?id=${item.id}`
    });
  };

  const handleCallDriver = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Delivery] 拨打司机电话:', phone);
    Taro.makePhoneCall({ phoneNumber: phone.replace(/\*/g, '0') }).catch(err => {
      console.error('[Delivery] 拨打电话失败:', err);
      showToast('拨打电话失败');
    });
  };

  const handleSign = (item: DeliveryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Delivery] 签收配送:', item.deliveryNo);
    Taro.showModal({
      title: '确认签收',
      editable: true,
      placeholderText: '请输入签收人姓名',
      content: '王护士',
      success: (res) => {
        if (res.confirm) {
          const receiver = res.content || '王护士';
          receiveDelivery(item.id, receiver, item.totalQuantity);
          showToast('签收成功', 'success');
        }
      }
    });
  };

  const handleRecheck = (item: DeliveryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Delivery] 复点货物:', item.deliveryNo);
    const existingRecheck = getRecheckByDelivery(item.id);
    if (existingRecheck) {
      const diffText = existingRecheck.difference === 0
        ? '数量一致'
        : existingRecheck.difference > 0
          ? `多出 ${existingRecheck.difference} 件`
          : `缺少 ${Math.abs(existingRecheck.difference)} 件`;
      Taro.showModal({
        title: '已有复点记录',
        content: `复点数量：${existingRecheck.checkedQuantity} 件\n应收数量：${existingRecheck.expectedQuantity} 件\n${diffText}\n复点人：${existingRecheck.operator}\n复点时间：${formatDate(existingRecheck.createdAt, 'MM-DD HH:mm')}`,
        confirmText: '查看详情',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: `/pages/delivery-detail/index?id=${item.id}`
            });
          }
        }
      });
    } else {
      Taro.showModal({
        title: '收货复点',
        editable: true,
        placeholderText: '请输入复点数量',
        content: String(item.totalQuantity),
        success: (res) => {
          if (res.confirm && res.content) {
            const checkedQty = parseInt(res.content, 10) || item.totalQuantity;
            const diff = checkedQty - item.totalQuantity;
            const diffText = diff === 0 ? '数量一致' : diff > 0 ? `数量多出 ${diff} 件` : `数量缺少 ${Math.abs(diff)} 件`;
            Taro.showModal({
              title: '确认复点结果',
              content: `复点数量：${checkedQty} 件\n${diffText}`,
              confirmText: '确认保存',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  saveRecheck(item.id, checkedQty, item.receiverName || '王护士', diffText);
                  showToast('复点记录已保存', 'success');
                }
              }
            });
          }
        }
      });
    }
  };

  const renderActionBtn = (item: DeliveryRecord) => {
    if (item.status === 'delivered') {
      return <View className={styles.signBtn} onClick={(e) => handleSign(item, e as any)}>确认签收</View>;
    }
    if (item.status === 'received') {
      const recheck = getRecheckByDelivery(item.id);
      const btnText = recheck ? '复点记录' : '收货复点';
      const btnClass = recheck ? styles.recheckedBtn : styles.recheckBtn;
      return <View className={btnClass} onClick={(e) => handleRecheck(item, e as any)}>{btnText}</View>;
    }
    return <Text className={styles.itemTime}>{formatDate(item.createdAt, 'MM-DD HH:mm')}</Text>;
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>配送签收</Text>
        <Text className={styles.headerSubtitle}>追踪无菌包配送与诊所签收</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待配送</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.shipping}</Text>
            <Text className={styles.statLabel}>配送中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.delivered}</Text>
            <Text className={styles.statLabel}>待签收</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <ScrollView className={styles.filterTabs} scrollX enhanced showScrollbar={false}>
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.filterTab, activeFilter === tab.key && styles.active)}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </ScrollView>

        <View className={styles.listContainer}>
          {filteredList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无配送记录</Text>
            </View>
          ) : (
            filteredList.map(item => (
              <View
                key={item.id}
                className={styles.listItem}
                onClick={() => handleItemClick(item)}
              >
                <View className={styles.itemHeader}>
                  <Text className={styles.itemNo}>{item.deliveryNo}</Text>
                  <StatusBadge status={item.status} text={item.statusText} />
                </View>

                <View className={styles.itemClinic}>
                  <Text className={styles.locationIcon}>📍</Text>
                  {item.clinicName}
                </View>

                <View className={styles.driverInfo}>
                  <View className={styles.driverDetail}>
                    <View className={styles.driverAvatar}>
                      {item.driverName.charAt(0)}
                    </View>
                    <View className={styles.driverText}>
                      <Text className={styles.driverName}>{item.driverName}</Text>
                      <Text className={styles.driverPhone}>{item.driverPhone}</Text>
                    </View>
                  </View>
                  <View className={styles.phoneBtn} onClick={(e) => handleCallDriver(item.driverPhone, e as any)}>
                    📞
                  </View>
                </View>

                <View className={styles.itemTags}>
                  {item.items.slice(0, 3).map(it => (
                    <View key={it.id} className={styles.itemTag}>
                      {it.packageName} ×{it.quantity}
                    </View>
                  ))}
                  {item.items.length > 3 ? (
                    <View className={styles.itemTag}>+{item.items.length - 3} 项</View>
                  ) : null}
                </View>

                {item.routeInfo ? (
                  <View className={styles.routeInfo}>
                    <Text className={styles.routeIcon}>🚚</Text>
                    <Text className={styles.routeText}>{item.routeInfo}</Text>
                  </View>
                ) : null}

                <View className={styles.itemFooter}>
                  <Text className={styles.itemQuantity}>
                    <Text className={styles.itemQuantityNum}>{item.totalQuantity}</Text>
                    件包裹
                  </Text>
                  {renderActionBtn(item)}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveryPage;
