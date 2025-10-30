import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../dashboard/sidebar/sidebar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {
  constructor(private authService: AuthService) {}

  isWarehouse(): boolean {
    return this.authService.getUserRole()?.toLowerCase() === 'warehouse';
  }
}

