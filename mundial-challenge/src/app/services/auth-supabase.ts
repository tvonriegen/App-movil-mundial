import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async registrar(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async iniciarSesion(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async cerrarSesion() {
    const { error } = await this.supabaseService.client.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async obtenerUsuarioActual() {
    const { data, error } = await this.supabaseService.client.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  }

  async obtenerSesionActual() {
    const { data, error } = await this.supabaseService.client.auth.getSession();

    if (error) {
      return null;
    }

    return data.session;
  }
}