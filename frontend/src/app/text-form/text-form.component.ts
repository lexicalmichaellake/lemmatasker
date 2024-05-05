import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Declare interfaces outside of any component or other TypeScript block
interface FamilyData {
  [word: string]: string; // Assuming the value is a string like 'NN', 'VB', etc.
}

interface ApiResponse {
  [key: string]: FamilyData;  // Adding index signature to allow dynamic access
}

@Component({
  selector: 'app-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['./text-form.component.scss']
})
export class TextFormComponent {
  textInput: string = '';
  displayedColumns: string[] = ['word', 'pos'];  // Used in all tables
  dataSources: Map<string, MatTableDataSource<any>> = new Map();
  // Initialize MatTableDataSource
  dataSource1kContent = new MatTableDataSource();
  dataSource1kFunction = new MatTableDataSource();
  dataSource2kContent = new MatTableDataSource();
  dataSource2kFunction = new MatTableDataSource();
  dataSource3kContent = new MatTableDataSource();
  dataSource3kFunction = new MatTableDataSource();

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
    this.dataSources.forEach(dataSource => {
      dataSource.sort = this.sort;
    });
  }
  
  responseData1k: any[] = [];
  responseData2k: any[] = [];
  responseData3k: any[] = [];
  responseDataContent: any[] = [];
  responseDataFunction: any[] = [];

  constructor(private http: HttpClient) {
    // Initialize all data sources
    ['1kContent', '1kFunction', '2kContent', '2kFunction', '3kContent', '3kFunction'].forEach(key => {
      this.dataSources.set(key, new MatTableDataSource());
    });
  }

  getDataSource(group: string, type: 'Content' | 'Function'): MatTableDataSource<any> {
    return this.dataSources.get(group + type) || new MatTableDataSource();
  }

  submitText(): void {
    const body = { text: this.textInput };
    this.http.post<ApiResponse>('http://127.0.0.1:5000/lemmatize_text', body).subscribe(response => {
      ['1k', '2k', '3k'].forEach(group => {
        const contentWords: any[] = [];
        const functionWords: any[] = [];

        Object.entries(response[group + '_families']).forEach(([word, pos]) => {
          // Assert that pos is a string
          const posStr = pos as string;
  
          const entry = { word, pos: posStr };
          if (['N', 'V', 'J'].some(prefix => posStr.startsWith(prefix))) {
            contentWords.push(entry);
          } else {
            functionWords.push(entry);
          }
        });

        this.dataSources.get(group + 'Content')!.data = contentWords;
        this.dataSources.get(group + 'Function')!.data = functionWords;
      });
    });
  }
}