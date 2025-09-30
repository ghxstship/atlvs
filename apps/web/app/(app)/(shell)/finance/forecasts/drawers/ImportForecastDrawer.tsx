'use client';

import React from 'react';
import { Drawer, Button, Card, CardContent } from '@ghxstship/ui';

interface ImportForecastDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  forecast?: unknown;
  isLoading?: boolean;
  onSubmit?: (data: unknown) => Promise<void>;
}

export default function ImportForecastDrawer({
  isOpen,
  onClose,
  forecast,
  isLoading = false,
  onSubmit
}: ImportForecastDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Forecast ImportForecastDrawer">
      <Card className="p-lg">
        <CardContent>
          <div className="text-center py-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-sm">ImportForecastDrawer Component</h3>
            <p className="text-gray-600">ImportForecastDrawer implementation - Enterprise Forecasting</p>
            {forecast && (
              <div className="mt-md text-sm text-gray-500">
                Forecast: {forecast.title || 'N/A'}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-md mt-lg">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onSubmit && (
              <Button onClick={() => onSubmit?.({})} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
