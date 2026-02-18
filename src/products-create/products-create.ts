import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzUploadFile, NzUploadModule } from "ng-zorro-antd/upload";


@Component({
  selector: 'products-create',
  standalone: true,
  templateUrl: './products-create.html',
  styleUrl: './products-create.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzInputNumberModule,
    NzUploadModule, // Añadido
    NzIconModule, // Añadido
  ],
})
export class ProductsCreate implements OnInit {
  validateForm!: FormGroup;
  fileList: NzUploadFile[] = []; // Lista para almacenar los archivos

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: [null],
      image: [null], // Campo opcional para la imagen
    });
  }

  // Prevenir que NG-ZORRO suba el archivo automáticamente
  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file]; // Solo permitimos una imagen
    this.validateForm.patchValue({ image: file });
    return false; // Retorna false para no subir automáticamente
  };

  submitForm(): void {
    if (this.validateForm.valid) {
      // Usamos FormData si planeas enviar el archivo a una API
      const formData = new FormData();
      formData.append('name', this.validateForm.value.name);
      formData.append('price', this.validateForm.value.price);
      formData.append('stock', this.validateForm.value.stock);
      formData.append('description', this.validateForm.value.description);

      if (this.fileList.length > 0) {
        formData.append('image', this.fileList[0] as any);
      }

      console.log('Enviando datos (FormData):', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
