import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockDeliveryList } from '@/data/delivery';
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

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return mockDeliveryList;
    return mockDeliveryList.filter(item => item.status === activeFilter);
  }, [activeFilter]);

  const stats = useMemo(() => {
    return {
      shipping: mockDeliveryList.filter(d => d.status === 'shipping').length,
      pending: mockDeliveryList.filter(d => d.status === 'pending').length,
      delivered: mockDeliveryList.filter(d => d.status === 'delivered').length
    };
  }, []);

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
    showToast('签收成功', 'success');
  };

  const handleRecheck = (item: DeliveryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Delivery] 复点货物:', item.deliveryNo);
    showToast('进入复点流程');
    Taro.navigateTo({
      url: `/pages/delivery-detail/index?id=${item.id}`
    });
  };

  const renderActionBtn = (item: DeliveryRecord) => {
    if (item.status === 'delivered') {
      return <View className={styles.signBtn} onClick={(e) => handleSign(item, e as any)}>确认签收</View>;
    }
    if (item.status === 'received') {
      return <View className={styles.recheckBtn} onClick={(e) => handleRecheck(item, e as any)}>收货复点</View>;
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
