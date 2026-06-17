import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { InstrumentItem } from '@/types';
import { showToast, generateId } from '@/utils';

interface FormItem extends InstrumentItem {
  tempQuantity: number;
}

const presetItems: Array<{ name: string; category: string }> = [
  { name: '牙科镊子', category: '基础器械' },
  { name: '牙科探针', category: '基础器械' },
  { name: '口镜', category: '基础器械' },
  { name: '拔牙钳', category: '手术器械' },
  { name: '根管锉', category: '根管器械' },
  { name: '种植器械套装', category: '种植器械' },
  { name: '洁牙机头', category: '洁牙器械' }
];

const HandoverCreatePage: React.FC = () => {
  const [items, setItems] = useState<FormItem[]>([
    { id: generateId(), name: '牙科镊子', category: '基础器械', quantity: 10, tempQuantity: 10 },
    { id: generateId(), name: '牙科探针', category: '基础器械', quantity: 10, tempQuantity: 10 }
  ]);
  const [photos, setPhotos] = useState<string[]>(['https://picsum.photos/id/210/600/600']);
  const [remark, setRemark] = useState('');

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const handleAddItem = () => {
    console.log('[HandoverCreate] 新增器械项');
    const presets = presetItems.filter(p => !items.some(i => i.name === p.name));
    if (presets.length === 0) {
      showToast('已添加所有预设器械');
      return;
    }
    const preset = presets[0];
    setItems([...items, {
      id: generateId(),
      name: preset.name,
      category: preset.category,
      quantity: 1,
      tempQuantity: 1
    }]);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, tempQuantity: newQty };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    console.log('[HandoverCreate] 删除器械项:', id);
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddPhoto = () => {
    console.log('[HandoverCreate] 添加照片');
    Taro.chooseImage({
      count: 9 - photos.length,
      success: (res) => {
        setPhotos([...photos, ...res.tempFilePaths]);
      },
      fail: (err) => {
        console.error('[HandoverCreate] 选择图片失败:', err);
        const mockPhoto = `https://picsum.photos/id/${210 + photos.length + 1}/600/600`;
        if (photos.length < 9) {
          setPhotos([...photos, mockPhoto]);
        } else {
          showToast('最多上传9张照片');
        }
      }
    });
  };

  const handleDeletePhoto = (index: number) => {
    console.log('[HandoverCreate] 删除照片:', index);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleRemarkChange = () => {
    Taro.showModal({
      title: '填写备注',
      editable: true,
      placeholderText: '请输入备注信息',
      content: remark,
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          setRemark(res.content);
        }
      }
    });
  };

  const handleSubmit = () => {
    console.log('[HandoverCreate] 提交交接单');
    if (items.length === 0) {
      showToast('请添加器械');
      return;
    }
    if (photos.length === 0) {
      showToast('请上传封箱照片');
      return;
    }
    showToast('提交成功', 'success');
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  return (
    <View className={styles.container}>
      <View className={styles.formCard}>
        <Text className={styles.formTitle}>基本信息</Text>
        <View className={styles.formRow}>
          <Text className={styles.formLabel}>交接诊所</Text>
          <Text className={styles.formValue}>阳光口腔诊所</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.formLabel}>交接人</Text>
          <Text className={styles.formValue}>张护士</Text>
        </View>
        <View className={styles.formRow} onClick={handleRemarkChange}>
          <Text className={styles.formLabel}>备注</Text>
          {remark ? (
            <Text className={styles.formValue}>{remark}</Text>
          ) : (
            <Text className={styles.formPlaceholder}>请输入备注（选填）</Text>
          )}
          <Text className={styles.arrow}>›</Text>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.itemHeader}>
          <Text className={styles.itemTitle}>器械清单</Text>
          <View className={styles.addBtn} onClick={handleAddItem}>
            + 添加器械
          </View>
        </View>
        {items.length === 0 ? (
          <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: '32rpx 0' }}>
            暂无器械，点击上方添加
          </Text>
        ) : (
          items.map(item => (
            <View key={item.id} className={styles.itemRow}>
              <View className={styles.itemContent}>
                <Text className={styles.itemName}>{item.name}</Text>
                <Text className={styles.itemCategory}>{item.category}</Text>
              </View>
              <View className={styles.quantityControl}>
                <View
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(item.id, -1)}
                >
                  -
                </View>
                <Text className={styles.quantityValue}>{item.quantity}</Text>
                <View
                  className={`${styles.quantityBtn} ${styles.quantityBtnPrimary}`}
                  onClick={() => handleQuantityChange(item.id, 1)}
                >
                  +
                </View>
              </View>
              <View className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>
                ✕
              </View>
            </View>
          ))
        )}
      </View>

      <View className={styles.formCard}>
        <View className={styles.formTitle}>
          <Text>封箱照片</Text>
          <Text style={{ fontSize: '24rpx', color: '#9CA3AF', fontWeight: 'normal' }}>
            {photos.length}/9
          </Text>
        </View>
        <View className={styles.photoSection}>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image className={styles.photoImage} src={photo} mode="aspectFill" />
                <View className={styles.photoDelete} onClick={() => handleDeletePhoto(index)}>
                  ✕
                </View>
              </View>
            ))}
            {photos.length < 9 ? (
              <View className={styles.photoAdd} onClick={handleAddPhoto}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className={styles.summaryBar}>
        <View className={styles.summaryInfo}>
          <Text className={styles.summaryLabel}>共计</Text>
          <Text className={styles.summaryValue}>{totalQuantity} 件</Text>
        </View>
        <View
          className={`${styles.submitBtn} ${items.length === 0 || photos.length === 0 ? styles.disabled : ''}`}
          onClick={handleSubmit}
        >
          提交交接
        </View>
      </View>
    </View>
  );
};

export default HandoverCreatePage;
