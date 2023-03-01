declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<
    SvgProps & {
      fill?: string;
      fillSecondary?: string;
    }
  >;
  export default content;
}

declare module "react-native-config" {
  interface Env {
    INFURA_API_KEY: string
    SENTRY_ENVIRONMENT: string
    BITRISE_TRIGGERED_WORKFLOW_TITLE: string
    DEPLOY_ENVIRONMENT: string
  }
  const BuildConfig: Env
  export default BuildConfig
}