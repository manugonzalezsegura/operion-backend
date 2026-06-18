# Coding Guidelines

Usar buenas prácticas backend.

Reglas:

1. Validar siempre input
2. Manejar errores con excepciones
3. Usar logging para operaciones importantes
4. Usar nombres claros para variables
5. Evitar lógica compleja en controllers

Ejemplo correcto:

@Get(':id')
getUserById(@Param('id') id: string) {
  return this.usersService.getUserById(Number(id));
}