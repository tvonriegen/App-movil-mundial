import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from './services/usuario';

export const authGuard: CanActivateFn = () => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  if (usuarioService.sesionActiva()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};