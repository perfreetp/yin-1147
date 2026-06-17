export type HandoverStatus = 'pending' | 'received' | 'processing' | 'completed' | 'exception';
export type BatchStatus = 'pending' | 'cleaning' | 'disinfecting' | 'sterilizing' | 'packaging' | 'completed' | 'exception';
export type DeliveryStatus = 'pending' | 'shipping' | 'delivered' | 'received' | 'exception';

export interface InstrumentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  remark?: string;
}

export interface HandoverRecord {
  id: string;
  handoverNo: string;
  clinicId: string;
  clinicName: string;
  items: InstrumentItem[];
  totalQuantity: number;
  sealPhotos: string[];
  status: HandoverStatus;
  statusText: string;
  createdAt: string;
  handoverTime?: string;
  receiverName?: string;
  remark?: string;
}

export interface BatchStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed';
  operator: string;
  startTime?: string;
  endTime?: string;
  remark?: string;
}

export interface BatchRecord {
  id: string;
  batchNo: string;
  sourceHandoverIds: string[];
  items: InstrumentItem[];
  totalQuantity: number;
  mergedFrom?: string[];
  splitTo?: string[];
  steps: BatchStep[];
  status: BatchStatus;
  statusText: string;
  createdAt: string;
  completedAt?: string;
  operator: string;
  exceptionRemark?: string;
}

export interface DeliveryItem {
  id: string;
  batchId: string;
  batchNo: string;
  packageName: string;
  quantity: number;
  expireDate: string;
}

export interface DeliveryRecord {
  id: string;
  deliveryNo: string;
  clinicId: string;
  clinicName: string;
  items: DeliveryItem[];
  totalQuantity: number;
  status: DeliveryStatus;
  statusText: string;
  driverName: string;
  driverPhone: string;
  routeInfo?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  receivedAt?: string;
  receiverName?: string;
  signatureImage?: string;
}

export interface TraceRecord {
  id: string;
  packageNo: string;
  packageName: string;
  handoverNo: string;
  batchNo: string;
  deliveryNo: string;
  clinicName: string;
  sterilizeDate: string;
  expireDate: string;
  status: 'valid' | 'used' | 'expired';
  usedBy?: string;
  usedAt?: string;
  patientName?: string;
  traceChain: TraceStep[];
}

export interface TraceStep {
  id: string;
  action: string;
  operator: string;
  time: string;
  location: string;
}

export interface ReconciliationRecord {
  id: string;
  month: string;
  clinicId: string;
  clinicName: string;
  totalHandovers: number;
  totalPackages: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'paid';
  createdAt: string;
}
