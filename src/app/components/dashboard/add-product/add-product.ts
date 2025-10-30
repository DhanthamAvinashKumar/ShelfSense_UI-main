import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../services/product.service';

export interface Product {
  productId: number;
  stockKeepingUnit: string;
  productName: string;
  categoryId: number;
  packageSize?: string;
  unit?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class ProductComponent implements OnInit {
  productForm!: FormGroup;
  products: Product[] = [];

  isEditMode = false;
  editProductId: number | null = null;
  isSubmitting = false;
  isLoadingProducts = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  pendingDeleteName = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      stockKeepingUnit: ['', [Validators.required, Validators.maxLength(50)]],
      productName: ['', [Validators.required, Validators.maxLength(100)]],
      categoryId: [null, Validators.required],
      packageSize: ['', Validators.maxLength(50)],
      unit: ['', Validators.maxLength(20)]
    });

    // ❌ Removed auto-load of products
    // ✅ Products will load only when user clicks "Reload Products"
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.products = [];

    this.productService.getAllProducts().subscribe({
      next: (res: Product[]) => {
        this.products = res ?? [];
        this.toastr.success(`Loaded ${this.products.length} products.`, 'Success');
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.toastr.error('Failed to load products.', 'Error');
        this.isLoadingProducts = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.productForm.value };

    const request = this.isEditMode && this.editProductId
      ? this.productService.updateProduct(this.editProductId, payload)
      : this.productService.createProduct(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode ? 'Product updated!' : 'Product created!', 'Success');
        this.loadProducts();
      },
      error: () => this.toastr.error('Operation failed.', 'Error'),
      complete: () => this.resetForm()
    });
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.editProductId = product.productId;
    this.productForm.patchValue(product);
  }

  resetForm(): void {
    this.productForm.reset();
    this.isEditMode = false;
    this.editProductId = null;
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

    this.productService.deleteProduct(this.pendingDeleteId).subscribe({
      next: () => {
        this.toastr.success('Product deleted.', 'Deleted');
        this.loadProducts();
      },
      error: () => this.toastr.error('Failed to delete product.', 'Error'),
      complete: () => this.cancelDelete()
    });
  }

  get f() {
    return this.productForm.controls;
  }
}
