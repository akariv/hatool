export interface FileUploader {
    progress: number;
    active: boolean;
    success: boolean;
    selectedFile: File;
}
