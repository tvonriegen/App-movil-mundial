import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSupabaseService } from './services/auth-supabase';

export const authGuard: CanActivateFn = async () => {
  const authSupabaseService = inject(AuthSupabaseService);
  const router = inject(Router);

  const sesion = await authSupabaseService.obtenerSesionActual();

  if (sesion) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};