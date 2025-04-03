import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, expand, map, Observable, reduce } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JiraApiService {
  private jiraUrl = '/api/rest/api/3/search';;

  constructor(private http: HttpClient) {}

  getIssuesBySprint(sprintNumber: string): Observable<any[]> {
    const jqlQuery = `project=BFDM AND sprint="Sprint ${sprintNumber}"`;
    const maxResults = 100; // Jira suele permitir hasta 100
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(environment.userEmail + ':' + environment.apiToken)}`,
      Accept: 'application/json',
    });

    return this.fetchPaginatedResults(jqlQuery, headers, 0, maxResults);
  }

  private fetchPaginatedResults(
    jqlQuery: string,
    headers: HttpHeaders,
    startAt: number,
    maxResults: number
  ): Observable<any[]> {
    return this.http
      .get<any>(`${this.jiraUrl}?jql=${encodeURIComponent(jqlQuery)}&startAt=${startAt}&maxResults=${maxResults}`, { headers })
      .pipe(
        expand(response =>
          response.startAt + response.maxResults < response.total
            ? this.http.get<any>(
                `${this.jiraUrl}?jql=${encodeURIComponent(jqlQuery)}&startAt=${response.startAt + response.maxResults}&maxResults=${maxResults}`,
                { headers }
              )
            : EMPTY
        ),
        map(response =>
          response.issues.map((issue: any) => {
            const { fields, ...rest } = issue;
            const filteredFields = Object.fromEntries(
              Object.entries(fields).filter(([key]) => !key.startsWith("customfield"))
            );
            return { ...rest, fields: filteredFields };
          })
        ),
        reduce<any[], any>((acc, issues) => [...acc, ...issues], [])
      );
  }



}
