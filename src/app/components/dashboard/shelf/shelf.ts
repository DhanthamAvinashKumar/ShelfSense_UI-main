import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ShelfService } from '../../services/shelf.service';
import { CategoryService } from '../../services/category.service';

export interface Shelf {
  shelfId: number;
  shelfCode: string;
  storeId: number;
  categoryId: number;
  locationDescription?: string;
  capacity: number;
}

export interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-shelf',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './shelf.html',
  styleUrls: ['./shelf.css']
})
export class ShelfComponent implements OnInit {
  shelfForm!: FormGroup;
  shelves: Shelf[] = [];
  categories: Category[] = [];

  isEditMode = false;
  editShelfId: number | null = null;
  isSubmitting = false;
  isLoadingShelves = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  pendingDeleteCode = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private shelfService: ShelfService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.shelfForm = this.fb.group({
      shelfCode: ['', [Validators.required, Validators.maxLength(50)]],
      storeId: [null, [Validators.required, Validators.min(1)]],
      categoryId: [null, [Validators.required, Validators.min(1)]],
      locationDescription: ['', Validators.maxLength(100)],
      capacity: [null, [Validators.required, Validators.min(1)]]
    });

    this.loadCategories(); // ✅ Only load categories on init
    this.resetForm();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        const categoryData = Array.isArray(res) ? res : res?.data || res?.result;
        this.categories = Array.isArray(categoryData) ? categoryData : [];
      },
      error: (err) => {
        this.toastr.error('Failed to load categories.', 'Error');
        console.error('Category load error:', err);
      }
    });
  }

  loadShelves(): void {
    this.isLoadingShelves = true;
    this.shelves = [];

    this.shelfService.getAllShelves().subscribe({
      next: (res: any) => {
        const shelfData = Array.isArray(res) ? res : res?.data;
        this.shelves = Array.isArray(shelfData) ? shelfData : [];
        this.toastr.info(`Loaded ${this.shelves.length} shelves.`, 'Info');
        this.isLoadingShelves = false;
      },
      error: () => {
        this.toastr.error('Failed to load shelves.', 'Error');
        this.isLoadingShelves = false;
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }

  onSubmit(): void {
    if (this.shelfForm.invalid) {
      this.shelfForm.markAllAsTouched();
      this.toastr.warning('Please fix the errors in the form.', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      ...this.shelfForm.value,
      storeId: Number(this.shelfForm.value.storeId),
      categoryId: Number(this.shelfForm.value.categoryId),
      capacity: Number(this.shelfForm.value.capacity),
    };

    const request = this.isEditMode && this.editShelfId
      ? this.shelfService.updateShelf(this.editShelfId, payload)
      : this.shelfService.createShelf(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode ? 'Shelf updated!' : 'Shelf created!', 'Success');
        this.loadShelves();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Operation failed.', 'Error');
      },
      complete: () => this.resetForm()
    });
  }

  openEditModal(shelf: Shelf): void {
    this.isEditMode = true;
    this.editShelfId = shelf.shelfId;
    this.shelfForm.patchValue({
      ...shelf,
      categoryId: shelf.categoryId.toString(),
      storeId: shelf.storeId.toString(),
      capacity: shelf.capacity.toString(),
    });
  }

  resetForm(): void {
    this.shelfForm.reset({
      storeId: null,
      categoryId: null,
      capacity: null,
    });
    this.isEditMode = false;
    this.editShelfId = null;
    this.isSubmitting = false;
  }

  openDeleteModal(id: number, code: string): void {
    this.pendingDeleteId = id;
    this.pendingDeleteCode = code;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.pendingDeleteCode = '';
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.shelfService.deleteShelf(this.pendingDeleteId).subscribe({
      next: () => {
        this.toastr.success('Shelf deleted.', 'Deleted');
        this.loadShelves();
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to delete shelf.', 'Error'),
      complete: () => this.cancelDelete()
    });
  }

  get f() {
    return this.shelfForm.controls;
  }
}
