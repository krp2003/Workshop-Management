
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss']
})
export class ViewEventsComponent implements OnInit {

  events: any[] = [];

  statusResults: { [key: string]: string } = {};

  errorMessage = '';

  constructor(private httpService: HttpService, public authService: AuthService) {}

  ngOnInit(): void {
    if(localStorage.getItem('role') === 'professional') {
      this.httpService.getEventByProfessional(localStorage.getItem('userId')).subscribe({
        next: (res: any) => (this.events = res || []),
        error: () => (this.errorMessage = 'Failed to load events')
      });
    } else {
      this.httpService.GetAllevents().subscribe({
        next: (res: any) => (this.events = res || []),
        error: () => (this.errorMessage = 'Failed to load events')
      });
    }
  }

  checkStatus(eventId: any): void {
    this.httpService.viewEventStatus(eventId).subscribe({
      next: (res: any) => {
        const status = res && res.status ? res.status : res;
        this.statusResults[eventId] = status || 'Unknown';
      },
      error: () => {
        this.statusResults[eventId] = 'Error fetching status';
      }
    });
  }

  enroll(eventId: any): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.statusResults[eventId] = 'User not logged in';
      return;
    }
    this.httpService.EnrollParticipant(eventId, userId).subscribe({
      next: () => {
        this.statusResults[eventId] = 'Enrolled successfully';
      },
      error: () => {
        this.statusResults[eventId] = 'Enrollment failed';
      }
    });
  }
}