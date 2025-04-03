import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JiraApiService } from '../../services/jira-api/jira-api.service';
import { CommonModule } from '@angular/common';

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
  userList: any[] = [];

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      initDate: [null],
      endDate: [null],
      sprintNumber: ['97'],
      proyectKey: [null],
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
        this.jiraData = data;

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

    console.log("entra a map");

    const selectedUser = this.searchForm.get('selectedUser')?.value;

    if (!selectedUser) return;

    this.jiraData = this.jiraData.filter(
      (issue) => issue.fields?.assignee?.displayName === selectedUser
    );
    console.log("valor jiradata", this.jiraData);
  }



}
