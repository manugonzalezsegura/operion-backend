export interface AuthenticatedUser {
  userId: number; // ID del usuario
  email: string; // Correo electrónico del usuario
  tenantId: string; // Información del tenant (puede ser un ID o un nombre)
}
