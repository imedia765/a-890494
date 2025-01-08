import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogsTabsType } from '../../constants/logs';

interface LogsTabsProps {
  activeTab: LogsTabsType;
  onTabChange: (tab: LogsTabsType) => void;
}

const LogsTabs: React.FC<LogsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoring Logs</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LogsTabs;