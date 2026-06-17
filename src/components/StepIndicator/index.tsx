import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { BatchStep, TraceStep } from '@/types';
import { formatDate } from '@/utils';

type StepType = BatchStep | TraceStep;

interface StepIndicatorProps {
  steps: StepType[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  const getDotClass = (status?: string) => {
    if (status === 'completed') return styles.dotCompleted;
    if (status === 'processing') return styles.dotProcessing;
    return styles.dotPending;
  };

  const getConnectorClass = (index: number) => {
    const nextStep = steps[index + 1];
    if (nextStep && (nextStep as BatchStep).status === 'completed') {
      return styles.connectorCompleted;
    }
    return '';
  };

  const renderStepContent = (step: StepType, index: number) => {
    const batchStep = step as BatchStep;
    const traceStep = step as TraceStep;

    if ('operator' in batchStep && 'status' in batchStep) {
      return (
        <>
          <View className={styles.stepName}>
            {batchStep.name}
          </View>
          <View className={styles.stepInfo}>
            {batchStep.operator ? (
              <Text className={styles.stepText}>操作人：{batchStep.operator}</Text>
            ) : null}
            {batchStep.startTime ? (
              <Text className={styles.stepText}>
                {batchStep.endTime
                  ? `${formatDate(batchStep.startTime, 'MM-DD HH:mm')} ~ ${formatDate(batchStep.endTime, 'HH:mm')}`
                  : `开始于 ${formatDate(batchStep.startTime, 'MM-DD HH:mm')}`}
              </Text>
            ) : null}
          </View>
        </>
      );
    }

    return (
      <>
        <View className={styles.stepName}>
          {traceStep.action}
        </View>
        <View className={styles.stepInfo}>
          <Text className={styles.stepText}>{traceStep.operator} · {formatDate(traceStep.time, 'MM-DD HH:mm')}</Text>
          <Text className={styles.stepText}>{traceStep.location}</Text>
        </View>
      </>
    );
  };

  return (
    <View className={styles.container}>
      {steps.map((step, index) => {
        const status = (step as BatchStep).status || 'completed';
        return (
          <View key={step.id} className={styles.stepItem}>
            <View className={classnames(styles.dot, getDotClass(status))} />
            <View className={classnames(styles.connector, getConnectorClass(index))} />
            <View className={styles.stepContent}>
              {renderStepContent(step, index)}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default StepIndicator;
