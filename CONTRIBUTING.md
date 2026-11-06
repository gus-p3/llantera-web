# Cómo trabajar en este repositorio

## Ramas

- `main` está protegida y no acepta push directo.
- `develop` integra el trabajo del sprint.
- Cada tarjeta tiene su rama: `feat/S2-clientes-pantalla`, `fix/S3-modal-foco`.

## Commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/es/): `tipo(modulo): descripción`.

Los tipos son `feat`, `fix`, `docs`, `test`, `refactor` y `chore`.

```text
feat(clientes): agrega la ventana de nuevo cliente
```

## Pull requests

- Cada PR necesita la revisión de otra persona del equipo.
- Solo el dueño modifica su módulo. Si necesitas algo de otro módulo, abre el PR y pide su aprobación.
- El router, el layout y el menú son de Lizeth.
- Los componentes reutilizables se importan; no se copian ni se editan.

## Definición de terminado

- Código revisado por un compañero.
- Pruebas pasando.
- `docs/[Nombre_Modulo].md` actualizado.
- Tarjeta en «En revision» → «Aprobado».
