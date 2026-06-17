import type { BatchRecord } from '@/types';

export const mockBatchList: BatchRecord[] = [
  {
    id: 'b1',
    batchNo: 'BA20260618001',
    sourceHandoverIds: ['2'],
    items: [
      { id: 'bi1', name: '种植器械套装', category: '种植器械', quantity: 5 },
      { id: 'bi2', name: '口镜', category: '基础器械', quantity: 30 }
    ],
    totalQuantity: 35,
    steps: [
      { id: 's1', name: '接收核对', status: 'completed', operator: '张师傅', startTime: '2026-06-18 10:00:00', endTime: '2026-06-18 10:15:00' },
      { id: 's2', name: '分类整理', status: 'completed', operator: '李师傅', startTime: '2026-06-18 10:20:00', endTime: '2026-06-18 10:45:00' },
      { id: 's3', name: '清洗', status: 'completed', operator: '李师傅', startTime: '2026-06-18 10:50:00', endTime: '2026-06-18 11:20:00' },
      { id: 's4', name: '消毒', status: 'processing', operator: '王师傅', startTime: '2026-06-18 11:30:00' },
      { id: 's5', name: '灭菌', status: 'pending', operator: '' },
      { id: 's6', name: '检查包装', status: 'pending', operator: '' }
    ],
    status: 'disinfecting',
    statusText: '消毒中',
    createdAt: '2026-06-18 10:00:00',
    operator: '张师傅'
  },
  {
    id: 'b2',
    batchNo: 'BA20260618002',
    sourceHandoverIds: ['1'],
    items: [
      { id: 'bi3', name: '牙科镊子', category: '基础器械', quantity: 20 },
      { id: 'bi4', name: '牙科探针', category: '基础器械', quantity: 15 },
      { id: 'bi5', name: '拔牙钳', category: '手术器械', quantity: 8 }
    ],
    totalQuantity: 43,
    steps: [
      { id: 's7', name: '接收核对', status: 'pending', operator: '' },
      { id: 's8', name: '分类整理', status: 'pending', operator: '' },
      { id: 's9', name: '清洗', status: 'pending', operator: '' },
      { id: 's10', name: '消毒', status: 'pending', operator: '' },
      { id: 's11', name: '灭菌', status: 'pending', operator: '' },
      { id: 's12', name: '检查包装', status: 'pending', operator: '' }
    ],
    status: 'pending',
    statusText: '待处理',
    createdAt: '2026-06-18 09:30:00',
    operator: ''
  },
  {
    id: 'b3',
    batchNo: 'BA20260617003',
    sourceHandoverIds: ['3'],
    items: [
      { id: 'bi6', name: '根管锉', category: '根管器械', quantity: 50 },
      { id: 'bi7', name: '充填器', category: '充填器械', quantity: 12 }
    ],
    totalQuantity: 62,
    mergedFrom: ['BA20260617003A', 'BA20260617003B'],
    steps: [
      { id: 's13', name: '接收核对', status: 'completed', operator: '李师傅', startTime: '2026-06-17 17:30:00', endTime: '2026-06-17 17:50:00' },
      { id: 's14', name: '分类整理', status: 'completed', operator: '张师傅', startTime: '2026-06-17 18:00:00', endTime: '2026-06-17 18:30:00' },
      { id: 's15', name: '清洗', status: 'completed', operator: '李师傅', startTime: '2026-06-17 18:35:00', endTime: '2026-06-17 19:10:00' },
      { id: 's16', name: '消毒', status: 'completed', operator: '王师傅', startTime: '2026-06-17 19:15:00', endTime: '2026-06-17 20:00:00' },
      { id: 's17', name: '灭菌', status: 'completed', operator: '王师傅', startTime: '2026-06-17 20:10:00', endTime: '2026-06-17 21:30:00' },
      { id: 's18', name: '检查包装', status: 'completed', operator: '张师傅', startTime: '2026-06-17 21:40:00', endTime: '2026-06-17 22:10:00' }
    ],
    status: 'completed',
    statusText: '已完成',
    createdAt: '2026-06-17 17:30:00',
    completedAt: '2026-06-17 22:10:00',
    operator: '李师傅'
  },
  {
    id: 'b4',
    batchNo: 'BA20260617001',
    sourceHandoverIds: ['5'],
    items: [
      { id: 'bi8', name: '手术刀柄', category: '手术器械', quantity: 10 },
      { id: 'bi9', name: '骨膜剥离器', category: '种植器械', quantity: 6 }
    ],
    totalQuantity: 16,
    splitTo: ['BA20260617001A', 'BA20260617001B'],
    steps: [
      { id: 's19', name: '接收核对', status: 'completed', operator: '王师傅', startTime: '2026-06-17 09:15:00', endTime: '2026-06-17 09:30:00' },
      { id: 's20', name: '分类整理', status: 'completed', operator: '张师傅', startTime: '2026-06-17 09:35:00', endTime: '2026-06-17 10:00:00' },
      { id: 's21', name: '清洗', status: 'completed', operator: '李师傅', startTime: '2026-06-17 10:10:00', endTime: '2026-06-17 10:40:00' }
    ],
    status: 'exception',
    statusText: '异常退回',
    createdAt: '2026-06-17 09:15:00',
    operator: '王师傅',
    exceptionRemark: '发现2把镊子损坏，已退回诊所'
  },
  {
    id: 'b5',
    batchNo: 'BA20260617002',
    sourceHandoverIds: ['4'],
    items: [
      { id: 'bi10', name: '洁牙机头', category: '洁牙器械', quantity: 25 },
      { id: 'bi11', name: '三用枪头', category: '基础器械', quantity: 40 }
    ],
    totalQuantity: 65,
    steps: [
      { id: 's22', name: '接收核对', status: 'completed', operator: '张师傅', startTime: '2026-06-17 11:00:00', endTime: '2026-06-17 11:20:00' },
      { id: 's23', name: '分类整理', status: 'completed', operator: '李师傅', startTime: '2026-06-17 11:30:00', endTime: '2026-06-17 12:00:00' },
      { id: 's24', name: '清洗', status: 'completed', operator: '李师傅', startTime: '2026-06-17 13:30:00', endTime: '2026-06-17 14:00:00' },
      { id: 's25', name: '消毒', status: 'completed', operator: '王师傅', startTime: '2026-06-17 14:10:00', endTime: '2026-06-17 14:50:00' },
      { id: 's26', name: '灭菌', status: 'completed', operator: '王师傅', startTime: '2026-06-17 15:00:00', endTime: '2026-06-17 16:20:00' },
      { id: 's27', name: '检查包装', status: 'completed', operator: '张师傅', startTime: '2026-06-17 16:30:00', endTime: '2026-06-17 17:00:00' }
    ],
    status: 'completed',
    statusText: '已完成',
    createdAt: '2026-06-17 11:00:00',
    completedAt: '2026-06-17 17:00:00',
    operator: '张师傅'
  },
  {
    id: 'b6',
    batchNo: 'BA20260616005',
    sourceHandoverIds: ['6'],
    items: [
      { id: 'bi12', name: '正畸钳子', category: '正畸器械', quantity: 15 },
      { id: 'bi13', name: '托槽定位器', category: '正畸器械', quantity: 8 }
    ],
    totalQuantity: 23,
    steps: [
      { id: 's28', name: '接收核对', status: 'completed', operator: '李师傅', startTime: '2026-06-16 15:00:00', endTime: '2026-06-16 15:20:00' },
      { id: 's29', name: '分类整理', status: 'completed', operator: '张师傅', startTime: '2026-06-16 15:30:00', endTime: '2026-06-16 16:00:00' },
      { id: 's30', name: '清洗', status: 'completed', operator: '李师傅', startTime: '2026-06-16 16:10:00', endTime: '2026-06-16 16:40:00' },
      { id: 's31', name: '消毒', status: 'completed', operator: '王师傅', startTime: '2026-06-16 16:50:00', endTime: '2026-06-16 17:30:00' },
      { id: 's32', name: '灭菌', status: 'completed', operator: '王师傅', startTime: '2026-06-16 17:40:00', endTime: '2026-06-16 19:00:00' },
      { id: 's33', name: '检查包装', status: 'completed', operator: '张师傅', startTime: '2026-06-16 19:10:00', endTime: '2026-06-16 19:40:00' }
    ],
    status: 'completed',
    statusText: '已完成',
    createdAt: '2026-06-16 15:00:00',
    completedAt: '2026-06-16 19:40:00',
    operator: '李师傅'
  }
];
