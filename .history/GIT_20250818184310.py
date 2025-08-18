#!/usr/bin/env python3
# git_helper.py
# Requiere: Git instalado y que este script se ejecute dentro del repo

import argparse
import subprocess
import sys
from typing import List, Tuple

def run_git(args: List[str], check: bool = True, capture: bool = True) -> Tuple[int, str, str]:
    proc = subprocess.run(["git"] + args, capture_output=capture, text=True)
    if check and proc.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)}\n{proc.stderr.strip()}")
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()

def current_branch() -> str:
    _, out, _ = run_git(["rev-parse", "--abbrev-ref", "HEAD"])
    return out

def ensure_remote(branch: str) -> None:
    # Asegura fetch del remoto para tener historial actualizado
    run_git(["fetch", "origin", branch], check=False)

def commit_and_push(message: str, branch: str | None) -> None:
    if not branch:
        branch = current_branch()
    run_git(["add", "-A"])
    # Si no hay cambios, commit fallará; lo manejamos suavemente
    code, _, err = run_git(["commit", "-m", message], check=False)
    if code != 0 and "nothing to commit" in err.lower():
        print("No hay cambios para commitear.")
    else:
        print("Commit creado.")
    run_git(["push", "-u", "origin", branch])
    print(f"Push hecho a origin/{branch}")

def list_remote_commits(branch: str | None, limit: int = 30) -> List[Tuple[str, str]]:
    if not branch:
        branch = current_branch()
    ensure_remote(branch)
    _, out, _ = run_git(["log", f"origin/{branch}", "--oneline", f"-n{limit}"])
    commits = []
    for line in out.splitlines():
        if not line.strip():
            continue
        parts = line.split(" ", 1)
        if len(parts) == 2:
            commits.append((parts[0], parts[1]))
        else:
            commits.append((parts[0], ""))
    return commits

def revert_to_commit_safe(target_hash: str, branch: str | None) -> None:
    """
    Crea commits de 'revert' para todos los commits después de target_hash, dejando el árbol igual a target_hash.
    No reescribe historial (apto para GitHub).
    """
    if not branch:
        branch = current_branch()
    ensure_remote(branch)

    # Obtiene commits a revertir (los posteriores a target_hash en HEAD)
    _, out, _ = run_git(["rev-list", "--ancestry-path", f"{target_hash}..HEAD"])
    to_revert = [c for c in out.splitlines() if c]
    if not to_revert:
        print("No hay commits posteriores al objetivo. Nada que revertir.")
        return

    # Revertir en orden inverso (del más reciente al más antiguo)
    for h in to_revert:
        print(f"Revirtiendo {h}...")
        # --no-edit para mensaje automático; quita --no-edit si prefieres editar
        run_git(["revert", "--no-edit", h])

    run_git(["push", "origin", branch])
    print(f"Reversión aplicada y pusheada a origin/{branch}")

def reset_to_commit_force(target_hash: str, branch: str | None) -> None:
    """
    Resetea el repo a un commit anterior y fuerza el push (reescribe historial).
    Úsalo solo si sabes lo que haces.
    """
    if not branch:
        branch = current_branch()
    print(f"Reseteando a {target_hash} y forzando push...")
    run_git(["reset", "--hard", target_hash])
    run_git(["push", "--force", "origin", branch])
    print(f"origin/{branch} ahora apunta a {target_hash} (historial reescrito)")

def interactive() -> None:
    """Modo interactivo: pregunta qué acción ejecutar y recolecta datos necesarios."""
    try:
        br = None
        # Intentamos detectar la rama actual para usarla como sugerencia
        try:
            br = current_branch()
        except Exception:
            br = None

        while True:
            print("\n¿Qué querés hacer?")
            print("  1) Commit y push")
            print("  2) Listar últimos commits remotos")
            print("  3) Volver a un commit (reverts, NO reescribe historial)")
            print("  4) Reset forzado a un commit (reescribe historial)")
            print("  0) Salir")
            choice = input("Elegí opción: ").strip()

            if choice == "0":
                return

            # Rama
            default_branch = br or "main"
            branch = input(f"Rama (enter para '{default_branch}'): ").strip() or default_branch

            if choice == "1":
                message = input("Mensaje del commit: ").strip()
                if not message:
                    print("Mensaje vacío, cancelado.")
                    continue
                commit_and_push(message, branch)

            elif choice == "2":
                try:
                    limit_str = input("¿Cuántos commits listar? (enter=30): ").strip()
                    limit = int(limit_str) if limit_str else 30
                except ValueError:
                    limit = 30
                commits = list_remote_commits(branch, limit)
                if not commits:
                    print("No hay commits remotos o no se pudo obtener la lista.")
                else:
                    print("\nCommits remotos:")
                    for h, msg in commits:
                        print(f"{h}  {msg}")

            elif choice == "3":
                print("Sugerencia: primero podés listar commits (opción 2) para copiar el hash.")
                target = input("Hash del commit objetivo: ").strip()
                if not target:
                    print("Hash vacío, cancelado.")
                    continue
                revert_to_commit_safe(target, branch)

            elif choice == "4":
                print("ADVERTENCIA: esta acción reescribe el historial remoto.")
                target = input("Hash del commit objetivo: ").strip()
                if not target:
                    print("Hash vacío, cancelado.")
                    continue
                confirm = input(f"Confirmás reset --hard a {target} y push --force a '{branch}'? (si/no): ").strip().lower()
                if confirm in ("si", "sí", "yes", "y"):
                    reset_to_commit_force(target, branch)
                else:
                    print("Cancelado.")

            else:
                print("Opción inválida.")
    except RuntimeError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

def main():
    # Si no se pasan argumentos, entrar en modo interactivo
    if len(sys.argv) == 1:
        interactive()
        return

    parser = argparse.ArgumentParser(description="Helper para commitear/pushear y volver a un commit.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    # commit
    pc = sub.add_parser("commit", help="Crear commit y hacer push")
    pc.add_argument("-m", "--message", required=True, help="Mensaje del commit")
    pc.add_argument("-b", "--branch", default=None, help="Rama (por defecto la actual)")

    # listar
    pl = sub.add_parser("list", help="Listar últimos commits remotos")
    pl.add_argument("-b", "--branch", default=None, help="Rama (por defecto la actual)")
    pl.add_argument("-n", "--limit", type=int, default=30, help="Cantidad de commits a listar")

    # revert safe
    pr = sub.add_parser("revert", help="Volver a un commit creando reverts (no reescribe historial)")
    pr.add_argument("hash", help="Hash del commit objetivo (presente en GitHub)")
    pr.add_argument("-b", "--branch", default=None, help="Rama (por defecto la actual)")

    # reset force
    pf = sub.add_parser("reset-force", help="Resetear a un commit y forzar push (reescribe historial)")
    pf.add_argument("hash", help="Hash del commit objetivo (presente en GitHub)")
    pf.add_argument("-b", "--branch", default=None, help="Rama (por defecto la actual)")

    args = parser.parse_args()

    try:
        if args.cmd == "commit":
            commit_and_push(args.message, args.branch)
        elif args.cmd == "list":
            commits = list_remote_commits(args.branch, args.limit)
            for h, msg in commits:
                print(f"{h}  {msg}")
        elif args.cmd == "revert":
            revert_to_commit_safe(args.hash, args.branch)
        elif args.cmd == "reset-force":
            reset_to_commit_force(args.hash, args.branch)
        else:
            parser.print_help()
            sys.exit(1)
    except RuntimeError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()  1