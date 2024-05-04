import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Declare interfaces outside of any component or other TypeScript block
interface FamilyData {
  [word: string]: string; // Assuming the value is a string like 'NN', 'VB', etc.
}

interface ApiResponse {
  '1k_families': FamilyData;
  '2k_families': FamilyData;
  '3k+_families': FamilyData;
}

@Component({
  selector: 'app-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['./text-form.component.scss']
})
export class TextFormComponent {
  // Initialize MatTableDataSource
  dataSource1k = new MatTableDataSource();
  dataSource2k = new MatTableDataSource();
  dataSource3k = new MatTableDataSource();

  @ViewChild(MatSort) sort!: MatSort;

  private sortData(dataSource: MatTableDataSource<any>) {
    if (!dataSource.sort) {
      console.warn('DataSource sort is not initialized.');
      return;
    }
  
    dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'word': return item.word.toLowerCase();  // Handle case-insensitive sorting
        case 'pos': return item.pos;
        default: return '';
      }
    };
    dataSource.sort.active = 'pos';
    dataSource.sort.direction = 'asc';
    dataSource.sortData(dataSource.data, dataSource.sort);
  }
  

  ngAfterViewInit() {
    this.dataSource1k.sort = this.sort;
    this.dataSource2k.sort = this.sort;
    this.dataSource3k.sort = this.sort;
  
    // Set initial sort state
    this.sortData(this.dataSource1k);
    this.sortData(this.dataSource2k);
    this.sortData(this.dataSource3k);
  }
  
  textInput: string = '';
  responseData1k: any[] = [];
  responseData2k: any[] = [];
  responseData3k: any[] = [];
  displayedColumns: string[] = ['word', 'pos']; // This should match the columns defined in your HTML

  constructor(private http: HttpClient) { }

  submitText(): void {
    const body = { text: this.textInput };
    this.http.post<ApiResponse>('http://127.0.0.1:5000/lemmatize_text', body).subscribe(response => {
      if (response) {
        this.dataSource1k.data = Object.entries(response['1k_families']).map(([word, pos]) => ({ word, pos }));
        this.dataSource2k.data = Object.entries(response['2k_families']).map(([word, pos]) => ({ word, pos }));
        this.dataSource3k.data = Object.entries(response['3k+_families']).map(([word, pos]) => ({ word, pos }));
      }
    });
  }
} 