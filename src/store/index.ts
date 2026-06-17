import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type {
  HandoverRecord,
  BatchRecord,
  DeliveryRecord,
  TraceRecord,
  ReconciliationRecord,
  InstrumentItem,
  BatchStep,
  ExceptionRecord,
  RecheckRecord,
  DashboardStats
} from '@/types';
import { mockHandoverList } from '@/data/handover';
import { mockBatchList } from '@/data/batch';
import { mockDeliveryList } from '@/data/delivery';
import { mockTraceList, mockReconciliationList } from '@/data/trace';
import { generateId, formatDate, getDaysUntilExpire } from '@/utils';

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Taro.getStorageSync(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
    } catch {
      // ignore
    }
  }
};

interface AppState {
  handoverList: HandoverRecord[];
  batchList: BatchRecord[];
  deliveryList: DeliveryRecord[];
  traceList: TraceRecord[];
  reconciliationList: ReconciliationRecord[];
  exceptionList: ExceptionRecord[];
  recheckList: RecheckRecord[];

  addHandover: (data: {
    clinicName: string;
    items: InstrumentItem[];
    sealPhotos: string[];
    remark?: string;
  }) => HandoverRecord;

  receiveHandover: (id: string, receiverName?: string) => void;

  updateBatchStep: (batchId: string, stepId: string, operator: string) => void;

  splitBatch: (batchId: string, splitCount: number, operator: string) => void;

  mergeBatches: (batchIds: string[], operator: string) => void;

  markDeliveryDelivered: (deliveryId: string) => void;

  receiveDelivery: (deliveryId: string, receiverName: string, checkedQuantity?: number) => void;

  saveRecheck: (deliveryId: string, checkedQuantity: number, operator: string, remark?: string) => RecheckRecord;

  getRecheckByDelivery: (deliveryId: string) => RecheckRecord | undefined;

  usePackage: (packageId: string, patientName: string, doctorName: string, useTime?: string) => void;

  exportReconciliation: (reconciliationId: string) => string;

  addException: (data: {
    sourceType: 'handover' | 'batch' | 'delivery';
    sourceId: string;
    sourceNo: string;
    reason: string;
    photos: string[];
    operator?: string;
  }) => ExceptionRecord;

  getExceptionsBySource: (sourceId: string) => ExceptionRecord[];

  markHandoverException: (id: string, reason: string, photos: string[], operator?: string) => void;

  markBatchException: (id: string, reason: string, photos: string[], operator?: string) => void;

  markDeliveryException: (id: string, reason: string, photos: string[], operator?: string) => void;

  getDashboardStats: () => DashboardStats[];

  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      handoverList: mockHandoverList,
      batchList: mockBatchList,
      deliveryList: mockDeliveryList,
      traceList: mockTraceList,
      reconciliationList: mockReconciliationList,
      exceptionList: [],
      recheckList: [],

      addHandover: (data) => {
        const now = new Date();
        const dateStr = formatDate(now, 'YYYYMMDD');
        const count = get().handoverList.filter(h => h.handoverNo.includes(dateStr)).length + 1;
        const handoverNo = `HO${dateStr}${String(count).padStart(3, '0')}`;

        const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);

        const newRecord: HandoverRecord = {
          id: generateId(),
          handoverNo,
          clinicId: 'c001',
          clinicName: data.clinicName || '我的诊所',
          items: data.items.map(item => ({ ...item, id: generateId() })),
          totalQuantity,
          sealPhotos: data.sealPhotos,
          status: 'pending',
          statusText: '待中心接收',
          createdAt: formatDate(now),
          remark: data.remark
        };

        set((state) => ({
          handoverList: [newRecord, ...state.handoverList]
        }));

        return newRecord;
      },

      receiveHandover: (id, receiverName = '张师傅') => {
        const now = formatDate(new Date());

        set((state) => {
          const updatedHandoverList = state.handoverList.map(h => {
            if (h.id === id) {
              return {
                ...h,
                status: 'received' as const,
                statusText: '中心已接收',
                handoverTime: now,
                receiverName
              };
            }
            return h;
          });

          const handover = state.handoverList.find(h => h.id === id);
          if (!handover) return { handoverList: updatedHandoverList };

          const existingBatch = state.batchList.find(b =>
            b.sourceHandoverIds.includes(id)
          );
          if (existingBatch) return { handoverList: updatedHandoverList };

          const batchDate = formatDate(new Date(), 'YYYYMMDD');
          const batchCount = state.batchList.filter(b => b.batchNo.includes(batchDate)).length + 1;
          const batchNo = `BA${batchDate}${String(batchCount).padStart(3, '0')}`;

          const steps: BatchStep[] = [
            { id: generateId(), name: '接收核对', status: 'completed', operator: receiverName, startTime: now, endTime: now },
            { id: generateId(), name: '分类整理', status: 'pending', operator: '' },
            { id: generateId(), name: '清洗', status: 'pending', operator: '' },
            { id: generateId(), name: '消毒', status: 'pending', operator: '' },
            { id: generateId(), name: '灭菌', status: 'pending', operator: '' },
            { id: generateId(), name: '检查包装', status: 'pending', operator: '' }
          ];

          const newBatch: BatchRecord = {
            id: generateId(),
            batchNo,
            sourceHandoverIds: [id],
            items: handover.items.map(item => ({ ...item, id: generateId() })),
            totalQuantity: handover.totalQuantity,
            steps,
            status: 'pending',
            statusText: '待处理',
            createdAt: now,
            operator: receiverName
          };

          return {
            handoverList: updatedHandoverList,
            batchList: [newBatch, ...state.batchList]
          };
        });
      },

      updateBatchStep: (batchId, stepId, operator) => {
        const now = formatDate(new Date());

        set((state) => {
          const updatedBatchList = state.batchList.map(batch => {
            if (batch.id !== batchId) return batch;

            const stepIndex = batch.steps.findIndex(s => s.id === stepId);
            if (stepIndex === -1) return batch;

            const updatedSteps = batch.steps.map((step, idx) => {
              if (idx < stepIndex) {
                return { ...step, status: 'completed' as const };
              }
              if (idx === stepIndex) {
                return {
                  ...step,
                  status: 'completed' as const,
                  operator,
                  startTime: step.startTime || now,
                  endTime: now
                };
              }
              if (idx === stepIndex + 1) {
                return { ...step, status: 'processing' as const, operator, startTime: now };
              }
              return step;
            });

            const allCompleted = updatedSteps.every(s => s.status === 'completed');
            const hasProcessing = updatedSteps.some(s => s.status === 'processing');
            const firstStep = updatedSteps[0];
            let status: BatchRecord['status'] = 'pending';
            let statusText = '待处理';

            if (allCompleted) {
              status = 'completed';
              statusText = '已完成';
            } else if (hasProcessing) {
              const step = updatedSteps.find(s => s.status === 'processing');
              const stepName = step?.name || '';
              if (stepName === '分类整理') { status = 'cleaning'; statusText = '分类整理中'; }
              else if (stepName === '清洗') { status = 'cleaning'; statusText = '清洗中'; }
              else if (stepName === '消毒') { status = 'disinfecting'; statusText = '消毒中'; }
              else if (stepName === '灭菌') { status = 'sterilizing'; statusText = '灭菌中'; }
              else if (stepName === '检查包装') { status = 'packaging'; statusText = '包装中'; }
              else { status = 'processing'; statusText = '处理中'; }
            } else if (firstStep?.status === 'completed') {
              status = 'cleaning';
              statusText = '待清洗';
            }

            return {
              ...batch,
              steps: updatedSteps,
              status,
              statusText,
              completedAt: allCompleted ? now : batch.completedAt,
              operator: operator || batch.operator
            };
          });

          return { batchList: updatedBatchList };
        });
      },

      splitBatch: (batchId, splitCount, operator) => {
        const now = formatDate(new Date());

        set((state) => {
          const batch = state.batchList.find(b => b.id === batchId);
          if (!batch) return state;

          const splitBatches: BatchRecord[] = [];
          for (let i = 0; i < splitCount; i++) {
            const splitNo = `${batch.batchNo}${String.fromCharCode(65 + i)}`;
            const splitItems = batch.items.map(item => {
              const baseQty = Math.floor(item.quantity / splitCount);
              const extraQty = i === 0 ? item.quantity % splitCount : 0;
              return {
                ...item,
                id: generateId(),
                quantity: baseQty + extraQty
              };
            }).filter(item => item.quantity > 0);

            const totalQty = splitItems.reduce((sum, item) => sum + item.quantity, 0);

            splitBatches.push({
              id: generateId(),
              batchNo: splitNo,
              sourceHandoverIds: batch.sourceHandoverIds,
              items: splitItems,
              totalQuantity: totalQty,
              steps: batch.steps.map(s => ({ ...s, id: generateId() })),
              status: batch.status,
              statusText: batch.statusText,
              createdAt: now,
              operator
            });
          }

          const updatedBatchList = state.batchList.map(b => {
            if (b.id === batchId) {
              return {
                ...b,
                splitTo: splitBatches.map(sb => sb.batchNo),
                status: 'completed' as const,
                statusText: '已拆分'
              };
            }
            return b;
          });

          return {
            batchList: [...updatedBatchList, ...splitBatches]
          };
        });
      },

      mergeBatches: (batchIds, operator) => {
        const now = formatDate(new Date());

        set((state) => {
          const batches = state.batchList.filter(b => batchIds.includes(b.id));
          if (batches.length < 2) return state;

          const dateStr = formatDate(new Date(), 'YYYYMMDD');
          const count = state.batchList.filter(b => b.batchNo.includes(dateStr)).length + 1;
          const mergedNo = `BA${dateStr}${String(count).padStart(3, '0')}`;

          const allItems = batches.flatMap(b => b.items);
          const itemMap = new Map<string, InstrumentItem>();
          allItems.forEach(item => {
            const existing = itemMap.get(item.name);
            if (existing) {
              itemMap.set(item.name, { ...existing, quantity: existing.quantity + item.quantity });
            } else {
              itemMap.set(item.name, { ...item, id: generateId() });
            }
          });

          const mergedItems = Array.from(itemMap.values());
          const totalQuantity = mergedItems.reduce((sum, item) => sum + item.quantity, 0);

          const steps: BatchStep[] = [
            { id: generateId(), name: '接收核对', status: 'completed', operator, startTime: now, endTime: now },
            { id: generateId(), name: '分类整理', status: 'completed', operator, startTime: now, endTime: now },
            { id: generateId(), name: '清洗', status: 'pending', operator: '' },
            { id: generateId(), name: '消毒', status: 'pending', operator: '' },
            { id: generateId(), name: '灭菌', status: 'pending', operator: '' },
            { id: generateId(), name: '检查包装', status: 'pending', operator: '' }
          ];

          const mergedBatch: BatchRecord = {
            id: generateId(),
            batchNo: mergedNo,
            sourceHandoverIds: batches.flatMap(b => b.sourceHandoverIds),
            items: mergedItems,
            totalQuantity,
            mergedFrom: batches.map(b => b.batchNo),
            steps,
            status: 'cleaning',
            statusText: '待清洗',
            createdAt: now,
            operator
          };

          const updatedBatchList = state.batchList.map(b => {
            if (batchIds.includes(b.id)) {
              return { ...b, status: 'completed' as const, statusText: '已合并' };
            }
            return b;
          });

          return {
            batchList: [mergedBatch, ...updatedBatchList]
          };
        });
      },

      markDeliveryDelivered: (deliveryId) => {
        const now = formatDate(new Date());

        set((state) => ({
          deliveryList: state.deliveryList.map(d => {
            if (d.id === deliveryId) {
              return {
                ...d,
                status: 'delivered' as const,
                statusText: '已送达待签收',
                deliveredAt: now,
                routeInfo: '已送达诊所门口'
              };
            }
            return d;
          })
        }));
      },

      receiveDelivery: (deliveryId, receiverName, checkedQuantity) => {
        const now = formatDate(new Date());

        set((state) => {
          const delivery = state.deliveryList.find(d => d.id === deliveryId);
          if (!delivery) return state;

          const updatedDeliveryList = state.deliveryList.map(d => {
            if (d.id === deliveryId) {
              return {
                ...d,
                status: 'received' as const,
                statusText: '已签收',
                receivedAt: now,
                receiverName,
                checkedQuantity: checkedQuantity || d.totalQuantity
              };
            }
            return d;
          });

          const updatedTraceList = state.traceList.map(t => {
            if (t.deliveryNo === delivery.deliveryNo) {
              return {
                ...t,
                status: 'valid' as const,
                traceChain: [
                  ...t.traceChain,
                  {
                    id: generateId(),
                    action: '诊所签收',
                    operator: receiverName,
                    time: now,
                    location: delivery.clinicName
                  }
                ]
              };
            }
            return t;
          });

          return {
            deliveryList: updatedDeliveryList,
            traceList: updatedTraceList
          };
        });
      },

      usePackage: (packageId, patientName, doctorName, useTime) => {
        const now = useTime || formatDate(new Date());

        set((state) => ({
          traceList: state.traceList.map(t => {
            if (t.id === packageId) {
              return {
                ...t,
                status: 'used' as const,
                usedBy: doctorName,
                usedAt: now,
                patientName,
                traceChain: [
                  ...t.traceChain,
                  {
                    id: generateId(),
                    action: '患者使用',
                    operator: doctorName,
                    time: now,
                    location: t.clinicName
                  }
                ]
              };
            }
            return t;
          })
        }));
      },

      exportReconciliation: (reconciliationId) => {
        const state = get();
        const recon = state.reconciliationList.find(r => r.id === reconciliationId);
        if (!recon) return '';

        const content = `
口腔消毒供应中心 - 月度对账凭证
====================================
账单月份：${recon.month}
诊所名称：${recon.clinicName}
生成时间：${recon.createdAt}
====================================
交接次数：${recon.totalHandovers} 次
包裹数量：${recon.totalPackages} 个
结算金额：¥${recon.totalAmount.toFixed(2)}
账单状态：${recon.status === 'pending' ? '待确认' : recon.status === 'confirmed' ? '已确认' : '已付款'}
====================================
此凭证由系统自动生成，具有同等法律效力。
        `.trim();

        return content;
      },

      saveRecheck: (deliveryId, checkedQuantity, operator, remark) => {
        const now = formatDate(new Date());
        const state = get();
        const delivery = state.deliveryList.find(d => d.id === deliveryId);

        const recheck: RecheckRecord = {
          id: generateId(),
          deliveryId,
          deliveryNo: delivery?.deliveryNo || '',
          checkedQuantity,
          expectedQuantity: delivery?.totalQuantity || 0,
          difference: checkedQuantity - (delivery?.totalQuantity || 0),
          operator,
          createdAt: now,
          remark
        };

        const diff = recheck.difference;
        const diffText = diff === 0
          ? '数量一致'
          : diff > 0
            ? `多出 ${diff} 件`
            : `缺少 ${Math.abs(diff)} 件`;

        set((st) => ({
          recheckList: [recheck, ...st.recheckList.filter(r => r.deliveryId !== deliveryId)],
          deliveryList: st.deliveryList.map(d => {
            if (d.id === deliveryId) {
              return {
                ...d,
                checkedQuantity,
                recheckId: recheck.id
              };
            }
            return d;
          }),
          traceList: st.traceList.map(t => {
            if (t.deliveryNo === delivery?.deliveryNo) {
              return {
                ...t,
                traceChain: [
                  ...t.traceChain,
                  {
                    id: generateId(),
                    action: `收货复点（${diffText}）：${checkedQuantity}/${delivery?.totalQuantity || 0}件`,
                    operator,
                    time: now,
                    location: delivery?.clinicName || t.clinicName
                  }
                ]
              };
            }
            return t;
          })
        }));

        return recheck;
      },

      getRecheckByDelivery: (deliveryId) => {
        return get().recheckList.find(r => r.deliveryId === deliveryId);
      },

      addException: (data) => {
        const now = formatDate(new Date());
        const record: ExceptionRecord = {
          id: generateId(),
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          sourceNo: data.sourceNo,
          reason: data.reason,
          photos: data.photos,
          operator: data.operator || '张师傅',
          createdAt: now
        };

        set((state) => ({
          exceptionList: [record, ...state.exceptionList]
        }));

        return record;
      },

      getExceptionsBySource: (sourceId) => {
        return get().exceptionList.filter(e => e.sourceId === sourceId);
      },

      markHandoverException: (id, reason, photos, operator = '张师傅') => {
        const handover = get().handoverList.find(h => h.id === id);
        if (!handover) return;

        get().addException({
          sourceType: 'handover',
          sourceId: id,
          sourceNo: handover.handoverNo,
          reason,
          photos,
          operator
        });

        set((state) => ({
          handoverList: state.handoverList.map(h => {
            if (h.id === id) {
              return {
                ...h,
                status: 'exception' as const,
                statusText: '异常退回',
                remark: reason
              };
            }
            return h;
          })
        }));
      },

      markBatchException: (id, reason, photos, operator = '张师傅') => {
        const batch = get().batchList.find(b => b.id === id);
        if (!batch) return;

        get().addException({
          sourceType: 'batch',
          sourceId: id,
          sourceNo: batch.batchNo,
          reason,
          photos,
          operator
        });

        set((state) => ({
          batchList: state.batchList.map(b => {
            if (b.id === id) {
              return {
                ...b,
                status: 'exception' as const,
                statusText: '异常退回',
                exceptionRemark: reason
              };
            }
            return b;
          })
        }));
      },

      markDeliveryException: (id, reason, photos, operator = '张师傅') => {
        const delivery = get().deliveryList.find(d => d.id === id);
        if (!delivery) return;

        get().addException({
          sourceType: 'delivery',
          sourceId: id,
          sourceNo: delivery.deliveryNo,
          reason,
          photos,
          operator
        });

        set((state) => ({
          deliveryList: state.deliveryList.map(d => {
            if (d.id === id) {
              return {
                ...d,
                status: 'exception' as const,
                statusText: '配送异常',
                routeInfo: reason
              };
            }
            return d;
          })
        }));
      },

      getDashboardStats: () => {
        const state = get();
        const clinicMap = new Map<string, string>();

        state.handoverList.forEach(h => clinicMap.set(h.clinicId, h.clinicName));
        state.deliveryList.forEach(d => clinicMap.set(d.clinicId, d.clinicName));
        state.traceList.forEach(t => {
          const handover = state.handoverList.find(h => h.handoverNo === t.handoverNo);
          if (handover) clinicMap.set(handover.clinicId, handover.clinicName);
        });

        const stats: DashboardStats[] = [];

        clinicMap.forEach((clinicName, clinicId) => {
          const handovers = state.handoverList.filter(h => h.clinicId === clinicId);
          const deliveries = state.deliveryList.filter(d => d.clinicId === clinicId);
          const handoverNos = handovers.map(h => h.handoverNo);
          const traces = state.traceList.filter(t => handoverNos.includes(t.handoverNo));

          stats.push({
            clinicId,
            clinicName,
            pending: handovers.filter(h => h.status === 'pending').length,
            processing: handovers.filter(h => ['received', 'processing'].includes(h.status)).length,
            pendingSign: deliveries.filter(d => d.status === 'delivered').length,
            expiringSoon: traces.filter(t => {
              if (t.status !== 'valid') return false;
              const days = getDaysUntilExpire(t.expireDate);
              return days > 0 && days <= 7;
            }).length,
            used: traces.filter(t => t.status === 'used').length
          });
        });

        return stats;
      },

      resetAllData: () => {
        set({
          handoverList: mockHandoverList,
          batchList: mockBatchList,
          deliveryList: mockDeliveryList,
          traceList: mockTraceList,
          reconciliationList: mockReconciliationList,
          exceptionList: [],
          recheckList: []
        });
      }
    }),
    {
      name: 'dental-supply-store',
      storage: createJSONStorage(() => taroStorage)
    }
  )
);
