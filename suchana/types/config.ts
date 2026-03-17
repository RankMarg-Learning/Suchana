export interface HomeBanner {
    id: string;
    imageUrl: string;
    actionUrl?: string | null;
    title?: string | null;
    description?: string | null;
    priority: number;
}

export interface AppConfig {
    maintenanceMode?: boolean;
    forceUpdate?: boolean;
    latestVersion?: string;
    [key: string]: any;
}
