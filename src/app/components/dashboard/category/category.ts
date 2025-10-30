import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './category.html',
  styleUrls: ['./category.css']
})
export class Category implements OnInit {
  categoryForm!: FormGroup;
  categories: any[] = [];
  isLoadingCategories = false;
  isSubmitting = false;

  isEditMode = false;
  editCategoryId: number | null = null;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  pendingDeleteName = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(255)]
    });

    // 🔧 Removed auto-load to make Reload button functional
    // this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categories = [];
    this.resetForm();

    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.isLoadingCategories = false;
        const data = Array.isArray(res) ? res : res?.data || res?.result;
        this.categories = Array.isArray(data) ? data : [];
        this.toastr.info(`Loaded ${this.categories.length} categories.`, 'Info');
      },
      error: () => {
        this.isLoadingCategories = false;
        this.toastr.error('Failed to load categories.', 'Error');
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.categoryForm.value };

    const request = this.isEditMode && this.editCategoryId
      ? this.categoryService.updateCategory(this.editCategoryId, payload)
      : this.categoryService.createCategory(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode ? 'Category updated!' : 'Category created!', 'Success');
        this.loadCategories();
      },
      error: err => {
        this.toastr.error(err.status === 409 ? 'Category already exists.' : 'Operation failed.', 'Error');
      },
      complete: () => this.resetForm()
    });
  }

  openEditModal(category: any): void {
    this.isEditMode = true;
    this.editCategoryId = category.id || category.categoryId;
    this.categoryForm.patchValue({
      categoryName: category.categoryName,
      description: category.description
    });
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.isEditMode = false;
    this.editCategoryId = null;
    this.isSubmitting = false;
  }

  openDeleteModal(id: number, name: string): void {
    this.pendingDeleteId = id;
    this.pendingDeleteName = name;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.pendingDeleteName = '';
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.categoryService.deleteCategory(this.pendingDeleteId).subscribe({
      next: () => {
        this.toastr.success('Category deleted.', 'Deleted');
        this.loadCategories();
      },
      error: err => {
        this.toastr.error(`Failed to delete category: ${err.error?.message || 'Server error'}`, 'Error');
      },
      complete: () => this.cancelDelete()
    });
  }

  get f() {
    return this.categoryForm.controls;
  }
}
