import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Permission } from '../../core/models/permission.model';
import { PermissionService } from '../../core/services/permission';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  @Input() set appHasPermission(permission: Permission) {
    this.viewContainer.clear();

    if (this.permissionService.tienePermiso(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}