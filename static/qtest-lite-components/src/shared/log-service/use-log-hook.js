import React, { useContext } from 'react';
import { CustomUiLogService } from './custom-ui-log-service';
import { LogContext } from './log-context';

export function useLogHook() {
	return new CustomUiLogService(useContext(LogContext));
}
