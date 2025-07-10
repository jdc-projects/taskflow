import React from 'react';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <Stack gap="md" p="xl">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Something went wrong"
            color="red"
            variant="light"
          >
            <Text size="sm" mb="md">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </Text>
            
            {this.state.error?.message && (
              <Text size="xs" c="dimmed" ff="monospace">
                {this.state.error.message}
              </Text>
            )}
            
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              color="red"
              size="sm"
              mt="md"
              onClick={this.resetError}
            >
              Try Again
            </Button>
          </Alert>
        </Stack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;