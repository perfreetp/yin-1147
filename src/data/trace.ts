import type { TraceRecord, ReconciliationRecord } from '@/types';

export const mockTraceList: TraceRecord[] = [
  {
    id: 't1',
    packageNo: 'PKG2026061700301',
    packageName: '根管器械包A',
    handoverNo: 'HO20260617005',
    batchNo: 'BA20260617003',
    deliveryNo: 'DE20260618001',
    clinicName: '阳光口腔诊所',
    sterilizeDate: '2026-06-17 20:10:00',
    expireDate: '2026-09-17',
    status: 'valid',
    traceChain: [
      { id: 'tc1', action: '诊所封箱交接', operator: '张护士', time: '2026-06-17 16:45:00', location: '阳光口腔诊所' },
      { id: 'tc2', action: '中心接收', operator: '李师傅', time: '2026-06-17 17:30:00', location: '消毒供应中心' },
      { id: 'tc3', action: '分类整理', operator: '张师傅', time: '2026-06-17 18:00:00', location: '消毒供应中心-分类区' },
      { id: 'tc4', action: '清洗完成', operator: '李师傅', time: '2026-06-17 19:10:00', location: '消毒供应中心-清洗区' },
      { id: 'tc5', action: '消毒完成', operator: '王师傅', time: '2026-06-17 20:00:00', location: '消毒供应中心-消毒区' },
      { id: 'tc6', action: '灭菌完成', operator: '王师傅', time: '2026-06-17 21:30:00', location: '消毒供应中心-灭菌区' },
      { id: 'tc7', action: '检查包装', operator: '张师傅', time: '2026-06-17 22:10:00', location: '消毒供应中心-包装区' },
      { id: 'tc8', action: '出库配送', operator: '刘师傅', time: '2026-06-18 08:30:00', location: '消毒供应中心' }
    ]
  },
  {
    id: 't2',
    packageNo: 'PKG2026061700302',
    packageName: '充填器械包B',
    handoverNo: 'HO20260617005',
    batchNo: 'BA20260617003',
    deliveryNo: 'DE20260618001',
    clinicName: '阳光口腔诊所',
    sterilizeDate: '2026-06-17 20:10:00',
    expireDate: '2026-09-17',
    status: 'valid',
    traceChain: [
      { id: 'tc9', action: '诊所封箱交接', operator: '张护士', time: '2026-06-17 16:45:00', location: '阳光口腔诊所' },
      { id: 'tc10', action: '中心接收', operator: '李师傅', time: '2026-06-17 17:30:00', location: '消毒供应中心' }
    ]
  },
  {
    id: 't3',
    packageNo: 'PKG2026061600501',
    packageName: '正畸器械包',
    handoverNo: 'HO20260616008',
    batchNo: 'BA20260616005',
    deliveryNo: 'DE20260617001',
    clinicName: '雅致牙科门诊',
    sterilizeDate: '2026-06-16 17:40:00',
    expireDate: '2026-09-15',
    status: 'used',
    usedBy: '陈医生',
    usedAt: '2026-06-18 10:30:00',
    patientName: '患者-李**',
    traceChain: [
      { id: 'tc11', action: '诊所封箱交接', operator: '李护士', time: '2026-06-16 14:00:00', location: '雅致牙科门诊' },
      { id: 'tc12', action: '患者使用', operator: '陈医生', time: '2026-06-18 10:30:00', location: '雅致牙科门诊-治疗室2' }
    ]
  },
  {
    id: 't4',
    packageNo: 'PKG2026061700201',
    packageName: '洁牙机头包',
    handoverNo: 'HO20260617003',
    batchNo: 'BA20260617002',
    deliveryNo: 'DE20260617005',
    clinicName: '康宁社区口腔',
    sterilizeDate: '2026-06-17 15:00:00',
    expireDate: '2026-09-16',
    status: 'valid',
    traceChain: []
  },
  {
    id: 't5',
    packageNo: 'PKG2026061501201',
    packageName: '牙科手机包',
    handoverNo: 'HO20260615012',
    batchNo: 'BA20260616005',
    deliveryNo: 'DE20260617003',
    clinicName: '阳光口腔诊所',
    sterilizeDate: '2026-06-16 19:00:00',
    expireDate: '2026-06-16',
    status: 'expired',
    traceChain: []
  },
  {
    id: 't6',
    packageNo: 'PKG2026061600401',
    packageName: '一次性器械包',
    handoverNo: 'HO20260616004',
    batchNo: 'BA20260616005',
    deliveryNo: 'DE20260617003',
    clinicName: '阳光口腔诊所',
    sterilizeDate: '2026-06-16 19:00:00',
    expireDate: '2026-09-14',
    status: 'used',
    usedBy: '王医生',
    usedAt: '2026-06-17 15:00:00',
    patientName: '患者-张**',
    traceChain: []
  }
];

export const mockReconciliationList: ReconciliationRecord[] = [
  {
    id: 'r1',
    month: '2026-05',
    clinicId: 'c001',
    clinicName: '阳光口腔诊所',
    totalHandovers: 45,
    totalPackages: 1280,
    totalAmount: 6400,
    status: 'paid',
    createdAt: '2026-06-01 10:00:00'
  },
  {
    id: 'r2',
    month: '2026-05',
    clinicId: 'c002',
    clinicName: '微笑种植工作室',
    totalHandovers: 28,
    totalPackages: 560,
    totalAmount: 4200,
    status: 'confirmed',
    createdAt: '2026-06-01 10:00:00'
  },
  {
    id: 'r3',
    month: '2026-05',
    clinicId: 'c003',
    clinicName: '康宁社区口腔',
    totalHandovers: 32,
    totalPackages: 890,
    totalAmount: 5340,
    status: 'pending',
    createdAt: '2026-06-01 10:00:00'
  },
  {
    id: 'r4',
    month: '2026-05',
    clinicId: 'c004',
    clinicName: '雅致牙科门诊',
    totalHandovers: 18,
    totalPackages: 420,
    totalAmount: 3360,
    status: 'paid',
    createdAt: '2026-06-01 10:00:00'
  }
];
