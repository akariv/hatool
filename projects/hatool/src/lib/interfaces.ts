export interface FileUploader {
    progress: number;
    active: boolean;
    success: boolean;
    selectedFile: File;
}

export interface Waitable {
    wait(): Promise<void>;
}
