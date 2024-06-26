import { Button, H1, Intent } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import SessionActions from 'src/commons/application/actions/SessionActions';
import {
  NotificationConfiguration,
  NotificationPreference,
  TimeOption
} from 'src/commons/application/types/SessionTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { useSession } from 'src/commons/utils/Hooks';

import BooleanCell from './subcomponents/BooleanCell';
import SelectCell from './subcomponents/SelectCell';

const defaultColumnDefs: ColDef = {
  flex: 1,
  minWidth: 70,
  filter: false,
  resizable: true,
  sortable: false
};

const NotiPreference: React.FC = () => {
  const gridApi = React.useRef<GridApi>();

  const dispatch = useDispatch();
  const session = useSession();

  const [hasChanges, setHasChanges] = useState(false);

  const configurableNotificationConfigs = React.useRef<NotificationConfiguration[] | undefined>(
    session.configurableNotificationConfigs
  );

  React.useEffect(() => {
    if (!session.courseRegId) return;

    dispatch(SessionActions.fetchConfigurableNotificationConfigs(session.courseRegId));
  }, [dispatch, session.courseRegId]);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    if (session.configurableNotificationConfigs !== undefined) {
      configurableNotificationConfigs.current = cloneDeep(session.configurableNotificationConfigs);
    }

    // Initialise notification preferences if absent
    configurableNotificationConfigs.current?.forEach(config => {
      if (config.notificationPreference === null) {
        config.notificationPreference = {
          id: -1,
          isEnabled: true,
          timeOptionId: null
        };
      }
    });
  }, [session]);

  const setIsEnabled = (index: number, value: boolean) => {
    const temp = [...(configurableNotificationConfigs.current ?? [])];

    temp[index]['notificationPreference'].isEnabled = value;

    configurableNotificationConfigs.current = temp;
    gridApi.current
      ?.getDisplayedRowAtIndex(index)
      ?.setDataValue('notificationPreference.isEnabled', value);
    setHasChanges(true);
  };

  const setTimeOption = (index: number, value: TimeOption) => {
    const temp = [...(configurableNotificationConfigs.current ?? [])];

    temp[index]['notificationPreference'].timeOptionId = value.id;

    configurableNotificationConfigs.current = temp;
    gridApi.current
      ?.getDisplayedRowAtIndex(index)
      ?.setDataValue('timeOptions', temp[index]['timeOptions']);
    setHasChanges(true);
  };

  const assessmentTypeFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.assessmentConfig?.type || '-';
  };

  const recipientFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.notificationType.forStaff ? 'Staff' : 'Student';
  };

  const columnDefs: ColDef<NotificationConfiguration>[] = [
    {
      headerName: 'Notification Type',
      field: 'notificationType.name',
      rowDrag: true
    },
    {
      headerName: 'Assessment Type',
      field: 'assessmentConfig.type',
      valueFormatter: assessmentTypeFormatter
    },
    {
      headerName: 'Recipients',
      field: 'notificationType.forStaff',
      valueFormatter: recipientFormatter
    },
    {
      headerName: 'Reminder',
      field: 'timeOptions',
      cellRenderer: SelectCell,
      cellRendererParams: {
        setStateHandler: setTimeOption,
        field: 'timeOptions'
      }
    },
    {
      headerName: 'Enabled',
      field: 'notificationPreference.isEnabled',
      cellRenderer: BooleanCell,
      cellRendererParams: {
        setStateHandler: setIsEnabled,
        field: 'notificationPreference.isEnabled'
      }
    }
  ];

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  };

  const submitHandler = () => {
    if (!hasChanges) return;

    const preferences: NotificationPreference[] =
      configurableNotificationConfigs.current?.map(config => {
        return {
          ...config.notificationPreference,
          notificationConfigId: config.id
        };
      }) ?? [];
    dispatch(SessionActions.updateNotificationPreferences(preferences, session.courseRegId!));

    setHasChanges(false);
  };

  const data = (
    <div>
      <H1>Notifications</H1>
      <div className="Grid ag-grid-parent ag-theme-balham">
        <AgGridReact
          domLayout="autoHeight"
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
          onGridReady={onGridReady}
          rowData={configurableNotificationConfigs.current}
          rowHeight={36}
          rowDragManaged={true}
          suppressCellFocus={true}
          suppressMovableColumns={true}
          suppressPaginationPanel={true}
        />
      </div>
      <Button
        text="Save"
        style={{ marginTop: '15px' }}
        disabled={!hasChanges}
        intent={hasChanges ? Intent.WARNING : Intent.NONE}
        onClick={submitHandler}
      />
    </div>
  );

  return <ContentDisplay display={data} fullWidth={false} />;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = NotiPreference;
Component.displayName = 'NotiPreference';

export default NotiPreference;
