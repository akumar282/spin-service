import { Construct } from 'constructs';
import { ContainerEnvVars, FargateScheduleProps } from './types';
export declare class FargateTask {
    constructor(scope: Construct, id: string, props: FargateScheduleProps, passthroughProps?: ContainerEnvVars);
    addDlq(scope: Construct, id: string): string;
}
//# sourceMappingURL=fargateTask.d.ts.map