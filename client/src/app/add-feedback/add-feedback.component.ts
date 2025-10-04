import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html',
  styleUrls: ['./add-feedback.component.scss'],
  providers: [DatePipe]
})
export class AddFeedbackComponent implements OnInit {

  itemForm!: FormGroup;
  events: any[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  
  ngOnInit(): void {
    this.itemForm = this.fb.group({
      eventId: [null, Validators.required],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', Validators.required],
      date: [this.datePipe.transform(new Date(), 'yyyy-MM-dd')]
    });

    // Load the list of events. For simplicity, we fetch all events for
    // institution ID 1, but this could be replaced with a more specific
    // endpoint if available.
    this.httpService.GetAllevents().subscribe({
      next: (res: any) => (this.events = res || []),
      error: () => (this.errorMessage = 'Failed to load events')
    });
  }


  submit(): void {
    if (this.itemForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.successMessage = '';
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'User not logged in.';
      this.successMessage = '';
      return;
    }

    const { eventId, rating, comments, date } = this.itemForm.value;
    const payload = { rating, comments, date };

    this.httpService.addFeedbackByParticipants(eventId, userId, payload).subscribe({
      next: () => {
        this.successMessage = 'Feedback submitted successfully.';
        this.errorMessage = '';
        this.itemForm.reset();
        this.itemForm.patchValue({ date: this.datePipe.transform(new Date(), 'yyyy-MM-dd') });
      },
      error: () => {
        this.errorMessage = 'Failed to submit feedback.';
        this.successMessage = '';
      }
    });
  }
}