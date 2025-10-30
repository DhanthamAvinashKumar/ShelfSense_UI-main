import { Component, HostListener } from '@angular/core'; // Import HostListener
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  showInventory = false;
  showStockRequest = false;
  isMobileMenuOpen = false;
  showRestockTaskMenu = false;
  role: string | null = null;
  private mobileBreakpoint = 768; // Define the breakpoint

  constructor(private auth: AuthService, private router: Router) {
    this.role = this.auth.getUserRole();

    // Close mobile menu on route change if on mobile
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && window.innerWidth < this.mobileBreakpoint) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  // A HostListener to close the mobile menu if the window is resized to desktop
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > this.mobileBreakpoint) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleInventory() {
    this.showInventory = !this.showInventory;
  }

  toggleStockRequest() {
    this.showStockRequest = !this.showStockRequest;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }


  toggleRestockTaskMenu() {
    this.showRestockTaskMenu = !this.showRestockTaskMenu;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  isManager() {
    return this.role === 'manager';
  }

  isStaff() {
    return this.role === 'staff';
  }

  isWarehouse() {
    return this.role === 'warehouse';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
