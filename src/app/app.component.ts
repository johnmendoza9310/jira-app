import { Component } from '@angular/core';
import { HomeComponent } from "./components/home/home.component";
import { HttpClientModule } from '@angular/common/http';
import { JiraApiService } from './services/jira-api/jira-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HomeComponent, HttpClientModule],
  providers: [ JiraApiService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'jira-api';
}
