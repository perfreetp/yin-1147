import type { DeliveryRecord } from '@/types';

export const mockDeliveryList: DeliveryRecord[] = [
  {
    id: 'd1',
    deliveryNo: 'DE20260618001',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    items: [
      { id: 'di1', batchId: 'b3', batchNo: 'BA20260617003', packageName: '根管器械包A', quantity: 30, expireDate: '2026-09-17' },
      { id: 'di2', batchId: 'b3', batchNo: 'BA20260617003', packageName: '充填器械包B', quantity: 12, expireDate: '2026-09-17' }
    ],
    totalQuantity: 42,
    status: 'shipping',
    statusText: '配送中',
    driverName: '刘师傅',
    driverPhone: '138****8888',
    routeInfo: '已到达海淀区中关村大街',
    createdAt: '2026-06-18 08:00:00',
    shippedAt: '2026-06-18 08:30:00'
  },
  {
    id: 'd2',
    deliveryNo: 'DE20260618002',
    clinicId: 'c002',
    clinicName: '微笑种植工作室',
    items: [
      { id: 'di3', batchId: 'b5', batchNo: 'BA20260617002', packageName: '洁牙器械包', quantity: 25, expireDate: '2026-09-17' },
      { id: 'di4', batchId: 'b5', batchNo: 'BA20260617002', packageName: '基础器械包', quantity: 40, expireDate: '2026-09-17' }
    ],
    totalQuantity: 65,
    status: 'pending',
    statusText: '待配送',
    driverName: '赵师傅',
    driverPhone: '139****6666',
    createdAt: '2026-06-18 07:30:00'
  },
  {
    id: 'd3',
    deliveryNo: 'DE20260617005',
    clinicId: 'c003',
    clinicName: '康宁社区口腔',
    items: [
      { id: 'di5', batchId: 'b5', batchNo: 'BA20260617002', packageName: '洁牙机头包', quantity: 25, expireDate: '2026-09-16' }
    ],
    totalQuantity: 25,
    status: 'delivered',
    statusText: '已送达待签收',
    driverName: '刘师傅',
    driverPhone: '138****8888',
    routeInfo: '已送达诊所门口',
    createdAt: '2026-06-17 14:00:00',
    shippedAt: '2026-06-17 14:30:00',
    deliveredAt: '2026-06-17 15:20:00'
  },
  {
    id: 'd4',
    deliveryNo: 'DE20260617003',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    items: [
      { id: 'di6', batchId: 'b5', batchNo: 'BA20260617002', packageName: '基础器械包', quantity: 20, expireDate: '2026-09-16' }
    ],
    totalQuantity: 20,
    status: 'received',
    statusText: '已签收',
    driverName: '赵师傅',
    driverPhone: '139****6666',
    createdAt: '2026-06-17 10:00:00',
    shippedAt: '2026-06-17 10:30:00',
    deliveredAt: '2026-06-17 11:15:00',
    receivedAt: '2026-06-17 11:30:00',
    receiverName: '王护士'
  },
  {
    id: 'd5',
    deliveryNo: 'DE20260617001',
    clinicId: 'c004',
    clinicName: '雅致牙科门诊',
    items: [
      { id: 'di7', batchId: 'b6', batchNo: 'BA20260616005', packageName: '正畸器械包', quantity: 23, expireDate: '2026-09-15' }
    ],
    totalQuantity: 23,
    status: 'received',
    statusText: '已签收',
    driverName: '刘师傅',
    driverPhone: '138****8888',
    createdAt: '2026-06-17 08:00:00',
    shippedAt: '2026-06-17 08:30:00',
    deliveredAt: '2026-06-17 09:20:00',
    receivedAt: '2026-06-17 09:35:00',
    receiverName: '李护士'
  },
  {
    id: 'd6',
    deliveryNo: 'DE20260616004',
    clinicId: 'c002',
    clinicName: '微笑种植工作室',
    items: [
      { id: 'di8', batchId: 'b6', batchNo: 'BA20260616005', packageName: '种植器械套装', quantity: 5, expireDate: '2026-09-14' }
    ],
    totalQuantity: 5,
    status: 'exception',
    statusText: '配送异常',
    driverName: '赵师傅',
    driverPhone: '139****6666',
    createdAt: '2026-06-16 14:00:00',
    shippedAt: '2026-06-16 14:30:00',
    routeInfo: '诊所临时无人，已带回中心'
  }
];
