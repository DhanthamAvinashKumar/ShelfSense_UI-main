import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllRestockTasksService, RestockTask } from '../../services/all-restock-tasks.service';
 
@Component({
  selector: 'app-all-restock-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-restock-tasks.html',
  styleUrls: ['./all-restock-tasks.css']
})
export class AllRestockTasksComponent implements OnInit {
  restockTasks: RestockTask[] = [];
  loading = false;
  error = '';
 
 
 
 
 
 
 
// ✅ NEW: Status filter property
  statusFilter: string = ''; // possible values: pending, completed, delayed
 
 
 
  taskIdFilter: number | null = null;
 
 
 
 
 
  constructor(private allRestockTasksService: AllRestockTasksService) {}
 
  ngOnInit() {
    this.loading = true;
    this.allRestockTasksService.getAllRestockTasks().subscribe({
      next: (tasks: RestockTask[]) => {
        this.restockTasks = tasks;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load restock tasks.';
        this.loading = false;
      }
    });
  }
 
 
getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'delayed':
        return 'status-delayed';
      default:
        return '';
    }
  }
 
 
get filteredTasksByStatus(): RestockTask[] {
  if (this.statusFilter) {
    return this.restockTasks.filter(task => task.status.toLowerCase() === this.statusFilter.toLowerCase());
  }
  return this.restockTasks;
}
 
get filteredTasksById(): RestockTask[] {
  if (this.taskIdFilter) {
    return this.restockTasks.filter(task => task.taskId === this.taskIdFilter);
  }
  return this.restockTasks;
}
 
 
 
 
 
 
 

}