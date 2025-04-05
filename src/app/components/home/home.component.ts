import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JiraApiService } from '../../services/jira-api/jira-api.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface IIssue {
  key: string;
  id: string;
  fields: {
    assignee: {
      displayName: string;
    };
    summary: string;
    issuetype: {
      name: string;
    };

    statusCategory: {
      name: string;
    };
  };
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  searchForm!: FormGroup;

  private fb = inject(FormBuilder);
  private jiraAPiService = inject(JiraApiService);
  jiraData: any[] = [];
  jiraDataBackup: any[] = [];

  userList: any[] = [];

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      initDate: [null],
      endDate: [null],
      sprintNumber: ['97'],
      proyectKey: ['BFDM'],
      selectedUser: [null],
    });
  }

  print() {
    console.log('formulario', this.searchForm);
  }

  getIssuesBySprint(): void {
    this.jiraAPiService
      .getIssuesBySprint(this.searchForm.get('sprintNumber')?.value)
      .subscribe((data: any) => {
        console.log('DATA', data);

        const dataFilter: any[] = data.filter(
          (issue: any) => issue.fields.statusCategory.name === 'Done'
        );

        console.log('JAMS filtrada', dataFilter);

        this.jiraData = dataFilter;
        this.jiraDataBackup = dataFilter;

        console.log('listado de usuarios', this.users(data));
        this.userList = this.users(data);
      });
  }

  downloadCsv(): void {
    // 🔹 Array de objetos con datos
    const data = [
      { name: 'Juan', age: 30, city: 'Bogotá' },
      { name: 'María', age: 25, city: 'Medellín' },
    ];

    // 🔹 Personalizar títulos (headers)
    const headers = [
      'Incidencia',
      'Estado',
      'Título incidencia',
      'Tipo de incidencia',
      'Persona asignada',
    ];
    const formattedData = this.jiraData.map((issue) => [
      issue.key,
      issue.fields.statusCategory.name,
      issue.fields.summary,
      issue.fields.issuetype.name,
      issue.fields?.assignee?.displayName,
    ]);

    // 🔹 Crear una hoja de Excel
    const ws = XLSX.utils.aoa_to_sheet([headers, ...formattedData]);

    // 🔹 Crear libro de Excel y agregar hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // 🔹 Guardar el archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const selectedUser = this.searchForm.get('selectedUser')?.value



    saveAs(blob, selectedUser ?  `${selectedUser}.xlsx` : "data.xlsx`");
  }

  getIssuesByDateRange(): void {
    this.jiraAPiService
      .getIssuesMovedToDone(
        this.searchForm.get('initDate')?.value,
        this.searchForm.get('endDate')?.value
      )
      .subscribe((data: any) => {
        console.log('DATA', data);
        const dataFilter: any[] = data.filter(
          (issue: any) => issue.fields.statusCategory.name === 'Done'
        );

        console.log('JAMS filtrada', dataFilter);
        this.jiraData = dataFilter;
        this.jiraDataBackup = dataFilter;

        console.log('listado de usuarios', this.users(data));
        this.userList = this.users(data);
      });
  }
  users(obj: any, users = new Map()): any[] {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.users(obj[key], users); // Llamada recursiva con el mismo Map
      } else if (key === 'displayName' && obj['accountId']) {
        users.set(obj['accountId'], obj['displayName']);
      }
    }

    // Convertimos el Map a un array de objetos con clave y valor
    return Array.from(users, ([accountId, displayName]) => ({
      accountId,
      displayName,
    }));
  }

  mapList(): void {
    console.log('entra a map');
    this.jiraData = this.jiraDataBackup;

    const selectedUser = this.searchForm.get('selectedUser')?.value;

    if (!selectedUser) return;

    this.jiraData = this.jiraData.filter(
      (issue) => issue.fields?.assignee?.displayName === selectedUser
    );
    console.log('valor jiradata', this.jiraData);
  }
}
