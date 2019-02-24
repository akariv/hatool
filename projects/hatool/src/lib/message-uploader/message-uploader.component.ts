import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ContentService } from '../content.service';
import { FileUploader } from '../interfaces';

@Component({
  selector: 'htl-message-uploader',
  templateUrl: './message-uploader.component.html',
  styleUrls: ['./message-uploader.component.less']
})
export class MessageUploaderComponent implements OnInit, FileUploader {

  @Input() params: any;
  @ViewChild('file') file: ElementRef;

  _progress = 0;
  _active = false;
  _success = false;
  _selected = false;

  selectedFile: File = null;

  constructor(public content: ContentService) { }

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
        this._selected = true;
        this.content.reportValue(this);
        break;
      }
    }
  }

  set progress(progress) {
    if (this._selected && this._active) {
      this._progress = progress;
    }
  }

  set active(active) {
    if (this._selected) {
      this._active = active;
    }
  }

  set success(success) {
    if (this._active) {
      this._success = success;
      this._active = false;
      this._progress = 100;
    }
  }
}
