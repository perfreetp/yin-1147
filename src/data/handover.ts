import type { HandoverRecord } from '@/types';

export const mockHandoverList: HandoverRecord[] = [
  {
    id: '1',
    handoverNo: 'HO20260618001',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    items: [
      { id: 'i1', name: '牙科镊子', category: '基础器械', quantity: 20, remark: '常规使用' },
      { id: 'i2', name: '牙科探针', category: '基础器械', quantity: 15 },
      { id: 'i3', name: '拔牙钳', category: '手术器械', quantity: 8 }
    ],
    totalQuantity: 43,
    sealPhotos: ['https://picsum.photos/id/200/600/400', 'https://picsum.photos/id/201/600/400'],
    status: 'pending',
    statusText: '待中心接收',
    createdAt: '2026-06-18 09:30:00',
    remark: '注意轻拿轻放'
  },
  {
    id: '2',
    handoverNo: 'HO20260618002',
    clinicId: 'c002',
    clinicName: '微笑种植工作室',
    items: [
      { id: 'i4', name: '种植器械套装', category: '种植器械', quantity: 5 },
      { id: 'i5', name: '口镜', category: '基础器械', quantity: 30 }
    ],
    totalQuantity: 35,
    sealPhotos: ['https://picsum.photos/id/202/600/400'],
    status: 'received',
    statusText: '中心已接收',
    createdAt: '2026-06-18 08:15:00',
    handoverTime: '2026-06-18 10:00:00',
    receiverName: '张师傅'
  },
  {
    id: '3',
    handoverNo: 'HO20260617005',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    items: [
      { id: 'i6', name: '根管锉', category: '根管器械', quantity: 50 },
      { id: 'i7', name: '充填器', category: '充填器械', quantity: 12 }
    ],
    totalQuantity: 62,
    sealPhotos: ['https://picsum.photos/id/203/600/400'],
    status: 'processing',
    statusText: '消毒处理中',
    createdAt: '2026-06-17 16:45:00',
    handoverTime: '2026-06-17 17:30:00',
    receiverName: '李师傅'
  },
  {
    id: '4',
    handoverNo: 'HO20260617003',
    clinicId: 'c003',
    clinicName: '康宁社区口腔',
    items: [
      { id: 'i8', name: '洁牙机头', category: '洁牙器械', quantity: 25 },
      { id: 'i9', name: '三用枪头', category: '基础器械', quantity: 40 }
    ],
    totalQuantity: 65,
    sealPhotos: ['https://picsum.photos/id/204/600/400', 'https://picsum.photos/id/205/600/400'],
    status: 'completed',
    statusText: '已完成配送',
    createdAt: '2026-06-17 10:20:00',
    handoverTime: '2026-06-17 11:00:00',
    receiverName: '张师傅'
  },
  {
    id: '5',
    handoverNo: 'HO20260617001',
    clinicId: 'c002',
    clinicName: '微笑种植工作室',
    items: [
      { id: 'i10', name: '手术刀柄', category: '手术器械', quantity: 10 },
      { id: 'i11', name: '骨膜剥离器', category: '种植器械', quantity: 6 }
    ],
    totalQuantity: 16,
    sealPhotos: ['https://picsum.photos/id/206/600/400'],
    status: 'exception',
    statusText: '异常退回',
    createdAt: '2026-06-17 08:30:00',
    handoverTime: '2026-06-17 09:15:00',
    receiverName: '王师傅',
    remark: '发现2把镊子损坏，已退回'
  },
  {
    id: '6',
    handoverNo: 'HO20260616008',
    clinicId: 'c004',
    clinicName: '雅致牙科门诊',
    items: [
      { id: 'i12', name: '正畸钳子', category: '正畸器械', quantity: 15 },
      { id: 'i13', name: '托槽定位器', category: '正畸器械', quantity: 8 }
    ],
    totalQuantity: 23,
    sealPhotos: ['https://picsum.photos/id/207/600/400'],
    status: 'completed',
    statusText: '已完成配送',
    createdAt: '2026-06-16 14:00:00',
    handoverTime: '2026-06-16 15:00:00',
    receiverName: '李师傅'
  },
  {
    id: '7',
    handoverNo: 'HO20260616004',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    items: [
      { id: 'i14', name: '吸唾管', category: '一次性器械', quantity: 100 },
      { id: 'i15', name: '口杯', category: '一次性器械', quantity: 200 }
    ],
    totalQuantity: 300,
    sealPhotos: ['https://picsum.photos/id/208/600/400'],
    status: 'completed',
    statusText: '已完成配送',
    createdAt: '2026-06-16 09:00:00',
    handoverTime: '2026-06-16 10:30:00',
    receiverName: '张师傅'
  },
  {
    id: '8',
    handoverNo: 'HO20260615012',
    clinicId: 'c003',
    clinicName: '康宁社区口腔',
    items: [
      { id: 'i16', name: '牙科手机', category: '动力器械', quantity: 12, remark: '需特别注意保养' },
      { id: 'i17', name: '手机润滑油', category: '耗材', quantity: 3 }
    ],
    totalQuantity: 15,
    sealPhotos: ['https://picsum.photos/id/209/600/400'],
    status: 'completed',
    statusText: '已完成配送',
    createdAt: '2026-06-15 16:30:00',
    handoverTime: '2026-06-15 17:00:00',
    receiverName: '王师傅'
  }
];
