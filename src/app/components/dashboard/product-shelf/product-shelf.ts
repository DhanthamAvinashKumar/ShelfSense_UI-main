import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProductShelfService, ProductShelfEntry } from '../../services/product-shelf.service';

@Component({
  selector: 'app-product-shelf',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './product-shelf.html',
  styleUrls: ['./product-shelf.css']
})
export class ProductShelf {
  mappingForm!: FormGroup;
  productShelves: ProductShelfEntry[] = [];

  isEditMode = false;
  editId: number | null = null;
  isSubmitting = false;
  isLoading = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private productShelfService: ProductShelfService
  ) {
    this.mappingForm = this.fb.group({
      productId: [null, [Validators.required, Validators.min(1)]],
      shelfId: [null],
      categoryId: [null, [Validators.required, Validators.min(1)]],
      initialQuantity: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadMappings(): void {
    this.isLoading = true;
    this.productShelfService.getAll().subscribe({
      next: (res) => {
        this.productShelves = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load mappings.', 'Error');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.mappingForm.invalid) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.editId) {
      const updatePayload = {
        productId: Number(this.mappingForm.value.productId),
        shelfId: Number(this.mappingForm.value.shelfId),
        quantity: Number(this.mappingForm.value.initialQuantity)
      };

      this.productShelfService.update(this.editId, updatePayload).subscribe({
        next: () => {
          this.toastr.success('Mapping updated!', 'Success');
          this.loadMappings();
          this.resetForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Update failed.', 'Error');
          this.isSubmitting = false;
        }
      });
    } else {
      const assignPayload = {
        productId: Number(this.mappingForm.value.productId),
        categoryId: Number(this.mappingForm.value.categoryId),
        initialQuantity: Number(this.mappingForm.value.initialQuantity)
      };

      this.productShelfService.autoAssign(assignPayload).subscribe({
        next: () => {
          this.toastr.success('Product auto-assigned!', 'Success');
          this.loadMappings();
          this.resetForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Auto-assignment failed.', 'Error');
          this.isSubmitting = false;
        }
      });
    }
  }

  openEditModal(entry: ProductShelfEntry): void {
    this.isEditMode = true;
    this.editId = entry.productShelfId;
    this.mappingForm.patchValue({
      productId: entry.productId,
      shelfId: entry.shelfId,
      categoryId: null,
      initialQuantity: entry.quantity
    });

    this.mappingForm.get('categoryId')?.clearValidators();
    this.mappingForm.get('categoryId')?.updateValueAndValidity();

    this.mappingForm.get('shelfId')?.setValidators([Validators.required, Validators.min(1)]);
    this.mappingForm.get('shelfId')?.updateValueAndValidity();
  }

  resetForm(): void {
    this.mappingForm.reset();
    this.isEditMode = false;
    this.editId = null;
    this.isSubmitting = false;

    this.mappingForm.get('categoryId')?.setValidators([Validators.required, Validators.min(1)]);
    this.mappingForm.get('categoryId')?.updateValueAndValidity();

    this.mappingForm.get('shelfId')?.clearValidators();
    this.mappingForm.get('shelfId')?.updateValueAndValidity();
  }

  openDeleteModal(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.productShelfService.delete(this.pendingDeleteId).subscribe({
      next: () => {
        this.toastr.success('Mapping deleted.', 'Deleted');
        this.loadMappings();
      },
      error: () => this.toastr.error('Failed to delete mapping.', 'Error'),
      complete: () => this.cancelDelete()
    });
  }

  get f() {
    return this.mappingForm.controls;
  }
}
