import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { FileUploader } from '../interfaces';
import { ContentManager } from '../content-manager';

@Component({
  selector: 'htl-message-uploader',
  templateUrl: './message-uploader.component.html',
  styleUrls: ['./message-uploader.component.less']
})
export class MessageUploaderComponent implements OnInit, FileUploader {

  @Input() params: any;
  @Input() content: ContentManager;
  @ViewChild('file', { static: true }) file: ElementRef;

  progressInternal = 0;
  activeInternal = false;
  successInternal = false;
  selectedInternal = false;

  selectedFile: File = null;

  constructor() { }

  ngOnInit() {
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.selectedFile = files[key];
        this.selectedInternal = true;
        this.content.reportValue(this);
        break;
      }
    }
  }

  set progress(progress) {
    if (this.selectedInternal && this.activeInternal) {
      this.progressInternal = progress;
    }
  }

  set active(active) {
    if (this.selectedInternal) {
      this.activeInternal = active;
    }
  }

  set success(success) {
    if (this.activeInternal) {
      this.successInternal = success;
      this.activeInternal = false;
      this.progressInternal = 100;
    }
  }
}
