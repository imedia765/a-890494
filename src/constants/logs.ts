export enum LOGS_TABS {
  AUDIT = 'audit',
  MONITORING = 'monitoring'
}

export type LogsTabsType = keyof typeof LOGS_TABS;